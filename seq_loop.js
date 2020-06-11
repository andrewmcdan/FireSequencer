/*
TODO:
- set up child process for gerneator poly rythms
  - need to be able to send the ipc socket info for the generator back to the main processs
    so that changes to the generator can be sent straight to it.
  - Must be able to receive step events from the generator.
  - Upon receiving a step event, step through the events of the selected track and send it
    back to the main process for outputing to device.

*/

var seq = {};
seq.bpm = 1;
seq.state = {};
seq.state.mute = 0; // bit coded, B0001 - track one, B0010 - track 2, B0100 - track 3, B1000 track 4
seq.state.solo = 0;
seq.state.recArmed = 0;
seq.state.playing = false;
seq.state.selectedPatternIndex = 0;
seq.state.firstLoopIteration = true;
seq.state.loopTimeMillis = new Date().getTime();
seq.state.currentBPM = 120;
seq.state.newTrackDataWaiting = false;
seq.state.stepNumberCounted = 0;
seq.track = [];
var newTrackData = [];

var theLoopInterval;

function seqPlay() {
  if (!seq.state.playing) {
    console.log("play");
    seq.state.playing = true;
    seq.state.loopTimeMillis = new Date().getTime();
    seq.state.stepNumberCounted = 0;
    theLoopInterval = setInterval(theLoopFn);
  }
}

function seqStop() {
  clearInterval(theLoopInterval);
  seq.state.playing = false;
  seq.state.firstLoopIteration = true;
  console.log("stop");
}

function updateMaxPatternLength() {

}

const ipc = require('node-ipc');

ipc.config.id = 'nodeSeqLoop';
ipc.config.retry = 1500;
ipc.config.silent = true;

ipc.connectTo(
  'nodeMidi',
  function() {
    ipc.of.nodeMidi.on(
      'connect',
      function() {
        // ipc.log('## connected to nodeMidi ##'.rainbow, ipc.config.delay);
        ipc.of.nodeMidi.emit('get-seq.track-Var');
      }
    );
    ipc.of.nodeMidi.on(
      'disconnect',
      function() {
        // ipc.log('disconnected from nodeMidi'.notice);
        // console.log("Disconnected from main processs.");
        seqStop();
      }
    );
    ipc.of.nodeMidi.on(
      'seq.trackVar', //any event or message type your server listens for
      function(data) {
        // ipc.log('got a message from nodeMidi : '.debug, data);
        // console.log(data);
        seq.state.newTrackDataWaiting = true;
        newTrackData = data;
      }
    );
    ipc.of.nodeMidi.on('seqPlay', seqPlay);
    ipc.of.nodeMidi.on('seqStop', seqStop);
    ipc.of.nodeMidi.on('tempoChange', function(data) {
      seq.state.currentBPM = data
    });
  }
);



/***************************************************************************************

Loop function

Create a looping function that plays all the notes and stuff.
This function is called every 1ms and checks to see if anything
is due to be played. This is done by looking at the current step in
every active tracks current pattern and comparing its startTimeOffset
with how long it's been since the the loop started.

If there exists a difference in the length of the currnet patterns,
The loop length will be based off of the longest and all others will
loop back through to fill the length of the longest pattern.

Things to track during the loop:
  when the loop started
***************************************************************************************/


// need to rework the loop so that it is step based not loop time based. Either that, or use this loop as
// a time based loop and create a new one that is step based.

function theLoopFn(stepsPerBeat = 4) {

  if (seq.state.newTrackDataWaiting &&(seq.state.stepNumberCounted%16==0)) {
    seq.track = newTrackData;
    seq.state.newTrackDataWaiting = false;
  }

  let currentTimeMillis = new Date().getTime();
  let loopTimeDiffMillis = currentTimeMillis - seq.state.loopTimeMillis;
  let sequencerBPM = seq.state.currentBPM;
  let seqSecsPerBeat = 60 / sequencerBPM;
  let stepTime = seqSecsPerBeat / stepsPerBeat;

  let stepNumberCalculated = Math.trunc(loopTimeDiffMillis / (stepTime * 1000));
  if (stepNumberCalculated == seq.state.stepNumberCounted + 1) {
    // Next step started
    // console.log(seq.state.stepNumberCounted);
    //go through each track
    seq.track.forEach(function(track, index) {
      if (!track.mute && seq.track[index].patterns["id_" + track.currentPattern].patIsStepBased) { // if track is not muted and is step based

        let origPatLength = seq.track[index].patterns["id_" + track.currentPattern].patLength; // 16
        let origPatBeatsInPat = seq.track[index].patterns["id_" + track.currentPattern].beatsInPattern; // 4
        let thisPatStepsPerBeat = origPatLength / origPatBeatsInPat; // 24 / 4 = 6
        let thisPatStepSkips = (stepsPerBeat / thisPatStepsPerBeat) - 1; // 4 / 6 = 2, 2 - 1 = 1

        // play currentStep Event
        let data = {};
        data.event = seq.track[index].patterns["id_" + track.currentPattern].events["id_" + (seq.state.stepNumberCounted % origPatLength)];
        data.track = index;
        data.lengthTime = stepTime * (data.event.length / 100);
        // console.log(data.event.enabled);
        if (data.event.enabled) {
          ipc.of.nodeMidi.emit('play-note', data);
          // console.log("note played");
        }
        // advance current step
        seq.track[index].patterns["id_" + track.currentPattern].currentStep++;
      }
    });
    ipc.of.nodeMidi.emit('step', seq.state.stepNumberCounted);
    seq.state.stepNumberCounted++;
  }
}



// seq.track.forEach(function(track, index) {
//   // let pattern = track.patterns["id_" + track.currentPattern];
//   if (!track.mute && seq.track[index].patterns["id_" + track.currentPattern].patIsStepBased) {
//
//     // 120 bpm, 16 steps,
//     // 60/120 = 0.5 sec/beat
//     // 16/4 = 4 steps/beats
//     // 4 * 0.5 = total pattern time
//     // (60/bpm)*(patternLength/stepPerBeat)
//
//     if((loopTimeDiffMillis>(stepTime*seq.track[index].patterns["id_" + track.currentPattern].currentStep*1000))&&(stepTime*seq.track[index].patterns["id_" + track.currentPattern].currentStep<=seqPatternTime)){
//       // play currentStep Event
//       let data = {};
//       data.event = seq.track[index].patterns["id_" + track.currentPattern].events["id_" + seq.track[index].patterns["id_" + track.currentPattern].currentStep];
//       data.track = index;
//       data.lengthTime = stepTime * (data.event.length/100);
//       // console.log(data.event.enabled);
//       if(data.event.enabled){
//         ipc.of.nodeMidi.emit('play-note',data);
//         // console.log("note played");
//       }
//       // advance current step
//       seq.track[index].patterns["id_" + track.currentPattern].currentStep++;
//     }
//   }
//   if(seq.track[index].patterns["id_" + track.currentPattern].currentStep==seq.track[index].patterns["id_" + track.currentPattern].originalLengthSteps){
//     if(index==seq.track.length-1){
//       seq.state.firstLoopIteration = true;
//     }
//     seq.track[index].patterns["id_" + track.currentPattern].currentStep=0;
//   }
// });
// }




// function theLoopFn() {
//   let currentTimeMillis = new Date().getTime();
//   if (seq.state.firstLoopIteration) {
//     seq.state.firstLoopIteration = false;
//     seq.state.loopTimeMillis = new Date().getTime();
//     // console.log("loop start");
//     if(newTrackDataWaiting){
//        seq.track = newTrackData;
//        newTrackDataWaiting=false;
//      }
//   }
//   let loopTimeDiffMillis = currentTimeMillis - seq.state.loopTimeMillis;
//
//   seq.track.forEach(function(track, index) {
//     // let pattern = track.patterns["id_" + track.currentPattern];
//     if (!track.mute && seq.track[index].patterns["id_" + track.currentPattern].patIsStepBased) {
//       let patternBPM = seq.track[index].patterns["id_" + track.currentPattern].originalBPM;
//       let sequencerBPM = seq.state.currentBPM;
//       let steps = seq.track[index].patterns["id_" + track.currentPattern].originalLengthSteps;
//       let beats = seq.track[index].patterns["id_" + track.currentPattern].beatsInPattern;
//
//       let secsPerBeat = 60 / patternBPM;
//       let seqSecsPerBeat = 60 / sequencerBPM;
//       let stepsPerBeat = steps / beats;
//       let patternTime = secsPerBeat * stepsPerBeat;
//       let seqPatternTime = seqSecsPerBeat * stepsPerBeat;
//       let stepTime = seqPatternTime / steps;
//       // 120 bpm, 16 steps,
//       // 60/120 = 0.5 sec/beat
//       // 16/4 = 4 steps/beats
//       // 4 * 0.5 = total pattern time
//       // (60/bpm)*(patternLength/stepPerBeat)
//
//       if((loopTimeDiffMillis>(stepTime*seq.track[index].patterns["id_" + track.currentPattern].currentStep*1000))&&(stepTime*seq.track[index].patterns["id_" + track.currentPattern].currentStep<=seqPatternTime)){
//         // play currentStep Event
//         let data = {};
//         data.event = seq.track[index].patterns["id_" + track.currentPattern].events["id_" + seq.track[index].patterns["id_" + track.currentPattern].currentStep];
//         data.track = index;
//         data.lengthTime = stepTime * (data.event.length/100);
//         // console.log(data.event.enabled);
//         if(data.event.enabled){
//           ipc.of.nodeMidi.emit('play-note',data);
//           // console.log("note played");
//         }
//         // advance current step
//         seq.track[index].patterns["id_" + track.currentPattern].currentStep++;
//       }
//     }
//     if(seq.track[index].patterns["id_" + track.currentPattern].currentStep==seq.track[index].patterns["id_" + track.currentPattern].originalLengthSteps){
//       if(index==seq.track.length-1){
//         seq.state.firstLoopIteration = true;
//       }
//       seq.track[index].patterns["id_" + track.currentPattern].currentStep=0;
//     }
//   });
// }
// seqPlay();
