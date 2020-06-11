var playing = false;
var firstLoopIteration = true;
var loopTimeMillis = new Date().getTime();

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

function theLoopFn() {
  // clearInterval(theLoopInterval);
  // console.log("loop");
  let currentTimeMillis = new Date().getTime();
  let loopTimeDiffMillis = currentTimeMillis - loopTimeMillis;
  if (firstLoopIteration) {
    firstLoopIteration = false;
    loopTimeMillis = new Date().getTime();
  }


  // if( -loopTimeHasExceededLongestPatternTime- ){
  //    resetLoop
  // }
}

var theLoopInterval;

function polyStart() {
  if(!playing){
    console.log("play");
    playing = true;
    ipc.of.nodeSeqLoop.emit('return');
    // theLoopInterval = setInterval(theLoopFn);
  }
}

function polyStop() {
  // clearInterval(theLoopInterval);
  playing = false;
  console.log("stop");
}

const ipc = require('node-ipc');

ipc.config.id = 'polyrythmGen';
ipc.config.retry = 1500;
ipc.config.silent = true;

ipc.connectTo(
  'nodeSeqLoop',
  function() {
    ipc.of.nodeSeqLoop.on(
      'connect',
      function() {
        // ipc.log('## connected to nodeMidi ##'.rainbow, ipc.config.delay);
        console.log("connect");
        ipc.of.nodeSeqLoop.emit('polyRythm');
      }
    );
    ipc.of.nodeSeqLoop.on(
      'disconnect',
      function() {
        // ipc.log('disconnected from nodeMidi'.notice);
        console.log("Disconnected from main processs.");
      }
    );
    ipc.of.nodeSeqLoop.on('polyStart', polyStart);
    ipc.of.nodeSeqLoop.on('polyStop', polyStop);
  }
);
