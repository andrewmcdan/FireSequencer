// process.env.UV_THREADPOOL_SIZE = 30;

const os = require('os');
const ipc = require('node-ipc');
// This code spawns the seq_loop node process. In testing, we manually spawn
// sequence looper so that we can bedug it.

// const spawn = require('child_process').spawn;
// const path = require('path');
// const command = 'node';
// const parameters = [path.resolve('seq_loop.js')];
// const child = spawn(command, parameters, {
//   stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ]
// });
const bitmaps = require('./bitmaps.js');
var fs = require('fs');
const midi = require('midi');
var settings = {};
var fireOLED_pixelMemMap = new Array(128);
for (let i = 0; i < 128; i++) {
  fireOLED_pixelMemMap[i] = new Array(64);
  for (let p = 0; p < 64; p++) {
    fireOLED_pixelMemMap[i][p] = 0;
  }
}

settings.osType = os.type();

console.log(settings.osType);

settings.flushedInput = false;
debug("Flushing MIDI input buffers...");
setTimeout(function() {
  settings.flushedInput = true;
  debug("MIDI input buffer flush complete.");
}, 500);

if (settings.osType != "Windows_NT") {
  console.log("Creating virtual MIDI interface...");
  // setup virtual interface to software midi
  var virInput = new midi.Input();
  virInput.openVirtualPort("Akai Fire Sequencer Input");
  virInput.ignoreTypes(false, false, false);

  var virOutput = new midi.Output();
  virOutput.openVirtualPort("Akai Fire Sequencer Output");

  // callback for incoming messages from virtual input port
  virInput.on('message', (deltaTime, message) => {
    if (!settings.flushedInput) {
      debug("virinpout");
      debug(`m: ${message} d: ${deltaTime}`);
    }
  });
}

// Set up a new input.
const fireMidiIn = new midi.Input();
const fireMidiOut = new midi.Output();
var midiInputDevices = [];
var midiInputDevicesNames = [];
var midiOutputDevices = [];
var midiOutputDevicesNames = [];

// find out open Akai Fire MIDI input port
// Also create array of all ports and open them.
for (let step = 0; step < fireMidiIn.getPortCount(); step++) {
  if (settings.osType != "Windows_NT") {
    midiInputDevices[step] = new midi.Input();
    midiInputDevices[step].openPort(step);
    midiInputDevicesNames[step] = midiInputDevices[step].getPortName(step);
    console.log(midiInputDevicesNames[step]);
  }
  if (fireMidiIn.getPortName(step).search("FL STUDIO FIRE") != -1) {
    fireMidiIn.openPort(step);
    console.log(fireMidiIn.getPortName(step));
  }
}

fireMidiIn.ignoreTypes(false, false, false);

// find out open Akai Fire MIDI output port and open it under "fireMidiOut"
// Also create array of all ports and open them.
for (let step = 0; step < fireMidiOut.getPortCount(); step++) {
  if (settings.osType != "Windows_NT") {
    midiOutputDevices[step] = new midi.Output();
    midiOutputDevices[step].openPort(step);
    midiOutputDevicesNames[step] = midiOutputDevices[step].getPortName(step);
  }
  if (fireMidiOut.getPortName(step).search("FL STUDIO FIRE") != -1) {
    fireMidiOut.openPort(step);
  }
}

// for(i=0;i<midiOutputDevices.length;i++){
//   midiOutputDevices[i].sendMessage([0x90,60,100]);
// }

var btnLEDSysEx = [0xf0, 0x47, 0x7f, 0x43, 0x65, 0x00, 0x04, 0, 0, 0, 0, 0xF7];
var gridBtnLEDcolor = JSON.parse('{"btn":[{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0},{"red":0,"grn":0,"blu":0}]}');

const PATTERN_BROWSER_GRID_DIMRED = 0x01;
const PATTERN_BROWSER_GRID_RED = 0x02;
const SOLO_DIMGREEN = 0x01;
const SOLO_GREEN = 0x02;
const ALT_STOP_DIMYELLOW = 0x01;
const ALT_STOP_YELLOW = 0x02;
const STEP_NOTE_DRUM_PERF_SHIFT_REC_DIMYELLOW = 0x02;
const STEP_NOTE_DRUM_PERF_SHIFT_REC_YELLOW = 0x04;
const STEP_NOTE_DRUM_PERF_SHIFT_REC_DIMRED = 0x01;
const STEP_NOTE_DRUM_PERF_SHIFT_REC_RED = 0x03;
const PATSONG_PLAY_DIMYELLOW = 0x01;
const PATSONG_PLAY_YELLOW = 0x03;
const PATSONG_PLAY_DIMGREEN = 0x02;
const PATSONG_PLAY_GREEN = 0x04;

var notGridBtnLEDS = [
  PATTERN_BROWSER_GRID_DIMRED, // pattern up btn LED      0
  PATTERN_BROWSER_GRID_DIMRED, // pattern dwn btn LED     1
  PATTERN_BROWSER_GRID_DIMRED, // browser btn LED         2
  PATTERN_BROWSER_GRID_DIMRED, // grid left btn LED       3
  PATTERN_BROWSER_GRID_DIMRED, // grid right btn LED      4

  SOLO_GREEN, // track 1 btn LED         5
  SOLO_GREEN, // track 2 btn LED         6
  SOLO_GREEN, // track 3 btn LED         7
  SOLO_GREEN, // track 4 btn LED         8
  4, // track 1 selected LED    9

  0, // track 2 selected LED    10
  0, // track 3 selected LED    11
  0, // track 4 selected LED    12
  STEP_NOTE_DRUM_PERF_SHIFT_REC_DIMYELLOW, // step btn LED            13
  STEP_NOTE_DRUM_PERF_SHIFT_REC_DIMYELLOW, // note btn LED            14

  STEP_NOTE_DRUM_PERF_SHIFT_REC_DIMYELLOW, // drum btn LED            15
  STEP_NOTE_DRUM_PERF_SHIFT_REC_DIMYELLOW, // perform btn LED         16
  STEP_NOTE_DRUM_PERF_SHIFT_REC_DIMYELLOW, // shift btn LED           17
  ALT_STOP_DIMYELLOW, // alt btn LED             18
  PATSONG_PLAY_DIMGREEN, // pat/song btn LED        19

  PATSONG_PLAY_DIMGREEN, // play btn LED            20
  ALT_STOP_DIMYELLOW, // stop btn LED            21
  STEP_NOTE_DRUM_PERF_SHIFT_REC_DIMYELLOW, // rec btn LED             22
  17 // channel/mixer/user1/user2 LEDs    23
];


const DIM_VAL = 10;
const LED_COLOR_WHITE = (127 << 17) | (127 << 9) | (127 << 1);
const LED_COLOR_WHITE_DIM = (DIM_VAL << 17) | (DIM_VAL << 9) | (DIM_VAL << 1);
const LED_COLOR_RED = (127 << 17) | (0 << 9) | (0 << 1);
const LED_COLOR_RED_DIM = (DIM_VAL << 17) | (0 << 9) | (0 << 1);
const LED_COLOR_GREEN = (0 << 17) | (127 << 9) | (0 << 1);
const LED_COLOR_GREEN_DIM = (0 << 17) | (DIM_VAL << 9) | (0 << 1);
const LED_COLOR_BLUE = (0 << 17) | (0 << 9) | (127 << 1);
const LED_COLOR_BLUE_DIM = (0 << 17) | (0 << 9) | (DIM_VAL << 1);
const LED_COLOR_AQUA = (0 << 17) | (127 << 9) | (127 << 1);
const LED_COLOR_AQUA_DIM = (0 << 17) | (DIM_VAL << 9) | (DIM_VAL << 1);
const LED_COLOR_YELLOW = (127 << 17) | (127 << 9) | (0 << 1);
const LED_COLOR_YELLOW_DIM = (DIM_VAL << 17) | (DIM_VAL << 9) | (0 << 1);
const LED_COLOR_MAGENTA = (127 << 17) | (0 << 9) | (127 << 1);
const LED_COLOR_MAGENTA_DIM = (DIM_VAL << 17) | (0 << 9) | (DIM_VAL << 1);
const LED_COLOR_ORANGE = (127 << 17) | (65 << 9) | (0 << 1);
const LED_COLOR_OFF = (0 << 17) | (0 << 9) | (0 << 1);
const CHARCODE_UPARROW = 0x83;
const CHARCODE_RIGHTARROW = 0x84;
const CHARCODE_DOWNARROW = 0x85;
const CHARCODE_LEFTARROW = 0x86;

var noteColors = {};
noteColors.C = LED_COLOR_WHITE;
noteColors.Csharp = LED_COLOR_ORANGE;
noteColors.Dflat = noteColors.Csharp;
noteColors.D = LED_COLOR_WHITE;
noteColors.Dsharp = LED_COLOR_ORANGE;
noteColors.Eflat = noteColors.Dsharp;
noteColors.E = LED_COLOR_WHITE;
noteColors.F = LED_COLOR_WHITE;
noteColors.Fsharp = LED_COLOR_ORANGE;
noteColors.Gflat = noteColors.Fsharp;
noteColors.G = LED_COLOR_WHITE;
noteColors.Gsharp = LED_COLOR_ORANGE;
noteColors.Aflat = noteColors.Gsharp;
noteColors.A = LED_COLOR_WHITE;
noteColors.Asharp = LED_COLOR_ORANGE;
noteColors.Bflat = noteColors.Asharp;
noteColors.B = LED_COLOR_WHITE;

// Piano, chromatic, major, harmonic minor, melodic minor, Whole tone, diminished,
// major pentatonic, minor pentatonic, Japanese In Sen, Major bebop,
// dominant bebop, blues, arabic, Enigmatic, Neopolitan, Neopolitan minor,
// Hungarian minor, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, and Locrian
var scales = {};
scales.indexNames = ["chromatic", "major", "harmMajor", "harmMinor", "melMinor", "wholeTone", "majorPent", "minorPent", "japInSen", "majBebop", "domBebop", "blues", "arabic", "enigmatic", "neoplitan", "neoplitanMinor", "hungarianMinor", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian"];
scales.text = ["Chromatic", "Major", "Harmonic Major", "Harmonic Minor", "Melodic Minor", "Whole Tone", "Major Pentatonic", "Minor Pentatonic", "Japanese InSen", "Major Bebop", "Dominant Bebop", "Blues", "Arabic", "Enigmatic", "Neoplitan", "Neoplitan Minor", "Hungarian Minor", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"];
scales.noteColorIndexes = ["C", "Csharp", "D", "Dsharp", "E", "F", "Fsharp", "G", "Gsharp", "A", "Asharp", "B"];
scales.noteNamesSharps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
scales.noteNamesFlats = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
scales.chromatic = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
scales.major = [2, 2, 1, 2, 2, 2];
scales.harmMinor = [2, 1, 2, 2, 1, 3];
scales.harmMajor = [2, 2, 1, 2, 1, 3];
scales.melMinor = [2, 1, 2, 2, 2, 2];
scales.wholeTone = [2, 2, 2, 2, 2];
scales.majorPent = [2, 2, 3, 2];
scales.minorPent = [3, 2, 2, 3];
scales.japInSen = [1, 4, 2, 4, 2];
scales.majBebop = [2, 2, 1, 2, 1, 2];
scales.domBebop = [2, 2, 1, 2, 2, 1, 1];
scales.blues = [3, 2, 1, 1, 3];
scales.arabic = [1, 3, 1, 2, 1, 3];
scales.enigmatic = [1, 3, 2, 2, 2, 1];
scales.neoplitanMinor = [1, 2, 2, 2, 1, 3];
scales.neoplitan = [1, 2, 2, 2, 2, 2];
scales.hungarianMinor = [2, 1, 3, 1, 1, 3];
scales.dorian = [2, 1, 2, 2, 2, 1];
scales.phrygian = [1, 2, 2, 2, 1, 2];
scales.lydian = [2, 2, 2, 1, 2, 2];
scales.mixolydian = [2, 2, 1, 2, 2, 1];
scales.aeolian = [2, 1, 2, 2, 1, 2];
scales.locrian = [1, 2, 2, 1, 2, 2];
// console.log(scales);


/// Build the "track" object
var trackNumIndex = 0;

function patternEvent(data, eventIdIndex, time = false) {
  if (!time) {
    this.startTimePatternOffset = time;
  }
  this.startTimeStepOffset = 0;
  this.data = data;
  this.length = 50; // 0-100, percent of the time between this notes start time and the next note start time
  this.velocity = 100; // 0-127
  this.id = eventIdIndex;
  this.idText = "id_" + eventIdIndex;
  this.enabled = false;
}

function trackPattern(patLength = 16, bpm = 120, beats = 4) {
  this.eventIdIndex = 0;
  this.patIsStepBased = true; // is pattern based on steps or can events happen at any time
  this.events = {};
  this.patLength = patLength;
  this.originalLengthSteps = patLength;
  this.originalBPM = bpm;
  this.currentStep = 0;
  this.beatsInPattern = beats;
  this.viewArea = 0;
  this.color = {};
  this.color.red = 127;
  this.color.grn = 0;
  this.color.blu = 127;
  this.addEventByTime = function(data, timeOffset) {
    this.events["id_" + this.eventIdIndex] = new patternEvent(data, this.eventIdIndex, timeOffset);
    this.eventIdIndex++;
  }
  this.addEventByStep = function(data, stepNum) {
    this.events["id_" + stepNum] = new patternEvent(data, stepNum);
  }
  this.removeEvent = function(id) {
    if (typeof id === 'number') {
      delete this.events["id_" + id];
    } else if (typeof id === 'string' && id.substring(0, 3) == "id_") {
      delete this.events[id];
    }
  }
}

function defaultTrack(stepMode = true) { // if called with first argument as false, will create time based pattern with no events. Otherwise, default pattern is stepbased.
  this.patternIdIndex = 0;
  this.patterns = {};
  this.num = trackNumIndex++;
  this.currentPattern = 0;
  this.mute = false;
  this.solo = false;
  this.defaultColor = 127;
  this.outputType = "midi"; /////////////////////////////////////////////////////////////////////////////////////  false for debugging. change to "midi" for normal
  this.outputName = "CAT MIDI";
  this.outputIndex = "0";
  this.trackName = "Track" + (this.num < 10 ? "0" + (this.num + 1) : (this.num + 1));
  this.channel = 0;
  this.CVportNum = 0;
  this.addPattern = function(patLength, bpm, beats) {
    this.patterns["id_" + this.patternIdIndex] = new trackPattern(patLength, bpm, beats);
    if (stepMode) {
      for (var i = 0; i < patLength; i++) {
        this.patterns["id_" + this.patternIdIndex].addEventByStep(60, i);
      }
    }
    return "id_" + this.patternIdIndex++;
  }
  this.updateOutputIndex = function() {
    let midiDevice = false;
    let found = false;
    for (let i = 0; i < midiOutputDevices.length; i++) {
      if (midiOutputDevicesNames[i].includes(this.outputName)) {
        this.outputIndex = i;
        found = true;
      }
    }
    return found;
  }
}

var seq = {}; // object to hold state of things

seq.track = [new defaultTrack(), new defaultTrack(), new defaultTrack(), new defaultTrack()];
seq.track.forEach(function(track, index) {
  track.addPattern(16, 110, 4);
  track.addPattern(32, 110, 8);
  track.patterns["id_1"].viewArea = 1;
  track.updateOutputIndex();
})

seq.track[0].currentPattern = 1;
seq.track[2].currentPattern = 1;


seq.mode = {};
seq.mode.current = 0;
seq.mode.names = ["Step", "Note", "Drum", "Perform", "Alt-Step"];

// Step Mode
// In this mode, device is a basic step sequencer. Each row of grid buttons
// represents a track and each button in that row is a step.
// Each track sends its step data to which ever midi deivice is selected for
// that that track in the settings menu.
seq.mode.Step = function() {
  console.log("Step Mode");
  // load btn colors into gridBtnLEDcolor using track pattern info.
  // set step button to red, others to orange
  notGridBtnLEDS[13] = STEP_NOTE_DRUM_PERF_SHIFT_REC_DIMYELLOW;
  notGridBtnLEDS[14] = LED_COLOR_OFF;
  notGridBtnLEDS[15] = LED_COLOR_OFF;
  notGridBtnLEDS[16] = LED_COLOR_OFF;
  updateAllNotGridBtnLEDS();
  clearOLEDmemMap();
  PlotStringToPixelMemMap("Step", 0, 0, 32);
  PlotStringToPixelMemMap("MODE", 0, 36, 16);
  FireOLED_SendMemMap(0);
  seq.state.OLEDmemMapContents = "stepMode";
};

// Alt Step MODE
// In alternate step mode, the selectd track not longer acts like a normal step
// sequencer. Instead, the sequence progress through the steps based on the counts
// set in the Alt-Step mode. It's a polyrythmic step generator using counts set
// in the grid. The settings menu can be used to send data to gate outputs.
seq.mode.altStep = function() {
  console.log("Alt-Step Mode");
  notGridBtnLEDS[13] = STEP_NOTE_DRUM_PERF_SHIFT_REC_RED;
  notGridBtnLEDS[14] = LED_COLOR_OFF;
  notGridBtnLEDS[15] = LED_COLOR_OFF;
  notGridBtnLEDS[16] = LED_COLOR_OFF;
  updateAllNotGridBtnLEDS();
  clearOLEDmemMap();
  PlotStringToPixelMemMap("Step", 0, 0, 32);
  PlotStringToPixelMemMap("ALT-MODE", 0, 36, 16);
  FireOLED_SendMemMap(0);
  seq.state.OLEDmemMapContents = "altStepMode";
};

// Note Mode
// In note mode the grid buttons act as a midi keyboard with the buttons lit
// to indicate white or black notes and root notes. Layout of notes can be
// changed to various scales using the "select" encoder. Layouts shall include
// Piano, chromatic, major, harmonic minor, melodic minor, Whole tone, diminished,
// major pentatonic, minor pentatonic. Japanese In Sen, Major bebop,
// dominant bebop, blues. arabic, Enigmatic, Neopolitan, Neopolitan minor,
// Hungarian minor, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, and Locrian
//
// Notes played will be sent the midi device and channel associated with the
// currently selected track.
seq.mode.Note = function() {
  console.log("Note Mode");
  notGridBtnLEDS[13] = LED_COLOR_OFF;
  notGridBtnLEDS[14] = STEP_NOTE_DRUM_PERF_SHIFT_REC_DIMYELLOW;
  notGridBtnLEDS[15] = LED_COLOR_OFF;
  notGridBtnLEDS[16] = LED_COLOR_OFF;
  updateAllNotGridBtnLEDS();
  clearOLEDmemMap();
  PlotStringToPixelMemMap("Note", 0, 0, 32);
  PlotStringToPixelMemMap("MODE", 0, 36, 16);
  FireOLED_SendMemMap(0);
  seq.state.OLEDmemMapContents = "noteMode";
  // load piano roll btn colors
};

// Drum mode
// In drum mode, each grid button can be mapped to a particular note or CC and
// sent to any midi device / channel. This allows the entire grid to be used as
// drums pads for any device connected.
seq.mode.Drum = function() {
  console.log("Drum Mode");
  notGridBtnLEDS[13] = LED_COLOR_OFF;
  notGridBtnLEDS[14] = LED_COLOR_OFF;
  notGridBtnLEDS[15] = STEP_NOTE_DRUM_PERF_SHIFT_REC_DIMYELLOW;
  notGridBtnLEDS[16] = LED_COLOR_OFF;
  updateAllNotGridBtnLEDS();
  clearOLEDmemMap();
  PlotStringToPixelMemMap("Drum", 0, 0, 32);
  PlotStringToPixelMemMap("MODE", 0, 36, 16);
  FireOLED_SendMemMap(0);
  seq.state.OLEDmemMapContents = "drumMode";
};

// Perform Mode
// When placed into perform mode, the grid buttons can be assisgned to any pattern
// in the track on which they appear. Each pattern can then be set to loop or to
// play the next pattern that is enabled. Grid buttons enable/disable the associated
// patterns. This allows the creation on songs on the fly. By default, every pattern
// shall be set to loop unless changed.
seq.mode.Perform = function() {
  console.log("Perform Mode");
  notGridBtnLEDS[13] = LED_COLOR_OFF;
  notGridBtnLEDS[14] = LED_COLOR_OFF;
  notGridBtnLEDS[15] = LED_COLOR_OFF;
  notGridBtnLEDS[16] = STEP_NOTE_DRUM_PERF_SHIFT_REC_DIMYELLOW;
  updateAllNotGridBtnLEDS();
  clearOLEDmemMap();
  PlotStringToPixelMemMap("Perform", 0, 0, 32);
  PlotStringToPixelMemMap("MODE", 0, 36, 16);
  FireOLED_SendMemMap(0);
  seq.state.OLEDmemMapContents = "performMode";
};

// console.log(track[3].patterns.id_0);

seq.state = {};
seq.state.playEnabled = false;
seq.state.playing = false;
seq.state.recEnabled = false;
seq.state.recording = false;
seq.state.mute = 0; // bit coded, B0001 - track one, B0010 - track 2, B0100 - track 3, B1000 track 4
seq.state.solo = 0;
seq.state.recArmed = 0;
seq.state.selectedTrack = 0; // selected track is 0-3 for the 4 tracks on the FIRE
seq.state.selectedTrackRange = 0; // index of first track of a group of four. i.e. "0" - is tracks 1,2,3,4
seq.state.selectedPatternIndex = 0;
seq.state.encoderBank = 0;
seq.state.shiftPressed = false;
seq.state.altPressed = false;
seq.state.encBeingTouched = 0;
seq.state.lastOLEDupdateTime = Date.now();
seq.state.OLEDmemMapContents = "";
seq.state.OLEDclearTimeout = setTimeout(function() {
  clearOLEDmemMap();
  FireOLED_SendMemMap();
}, 3000);
seq.state.firstLoopIteration = true;
seq.state.loopTimeMillis = Date.now();
seq.state.currentBPM = 120;
seq.state.gridBtnsPressedUpper = 0;
seq.state.gridBtnsPressedLower = 0;
seq.state.gridBtnsPressedLast = 0;

seq.settings = {};
seq.settings.general = {};
seq.settings.general.OLEDtimeout = 10; // number of seconds to wait before clearing the OLED
seq.settings.encoders = {};
seq.settings.encoders.banks = "4BankMode";
seq.settings.encoders.global = true;
seq.settings.encoders.control = new Array(16);
let count = 1;
for (let q = 0; q < 16; q++) {
  seq.settings.encoders.control[q] = new Array(4);
  for (let r = 0; r < 4; r++) {
    seq.settings.encoders.control[q][r] = {};
    seq.settings.encoders.control[q][r].name = "CC# " + count;
    seq.settings.encoders.control[q][r].midiCC = count++;
    seq.settings.encoders.control[q][r].value = 0;
    seq.settings.encoders.control[q][r].midiCCtype = "abs"; // abs, rel1, rel2
  }
}

seq.project = {};
seq.project.encoders = {};
seq.project.encoders.banks = "4BankMode";
seq.project.encoders.control = new Array(16);
count = 1;
for (let q = 0; q < 16; q++) {
  seq.project.encoders.control[q] = new Array(4);
  for (let r = 0; r < 4; r++) {
    seq.project.encoders.control[q][r] = {};
    seq.project.encoders.control[q][r].name = "CC# " + count;
    seq.project.encoders.control[q][r].midiCC = count++;
    seq.project.encoders.control[q][r].value = 0;
    seq.project.encoders.control[q][r].midiCCtype = "abs"; // abs, rel1, rel2
  }
}

var yOffset = 0,
  xOffset = 0;;

if ((process.argv[2] && process.argv[2] === '--debugLevel') && (process.argv[3])) {
  settings.debugLevel = parseInt(process.argv[3]);
} else if ((process.argv[2] && process.argv[2] === '-d') && (process.argv[3])) {
  settings.debugLevel = parseInt(process.argv[3]);
} else {
  settings.debugLevel = 0;
}


updateAllGridBtnLEDs();
updateAllNotGridBtnLEDS();

// By default, the device goes into Step Mode.
seq.mode.Step();
fs.writeFileSync('dataObjFile', JSON.stringify(seq.track));


// settings();

/**************************************************************************************
          Inter-Process Communications
**************************************************************************************/
ipc.config.id = 'nodeMidi';
ipc.config.retry = 1500;
ipc.config.silent = true;
var seqLoop_ipcSocket; // ipc socket for the seq_loop.js process.

ipc.serve(
  function() {
    ipc.server.on(
      'get-seq.track-Var',
      function(data, socket) {
        // ipc.log('got a message : '.debug, data);
        // console.log(socket);
        seqLoop_ipcSocket = socket;
        ipc.server.emit(seqLoop_ipcSocket, 'seq.trackVar', seq.track);
        ipc.server.emit(seqLoop_ipcSocket, 'tempoChange', seq.state.currentBPM);
      }
    );
    ipc.server.on('play-note', playNote);
    ipc.server.on('step', stepHighlight);
    ipc.server.on(
      'socket.disconnected',
      function(socket, destroyedSocketID) {
        console.log("client disconnect");
        // ipc.log('client ' + destroyedSocketID + ' has disconnected!');
      }
    );
  }
);

ipc.server.start();

/**************************************************************************************
playNote
**************************************************************************************/
function playNote(eventData, socket = NULL) {
  if (settings.osType != "Windows_NT") {
    // console.log("playnote");
    let midiDevice = false;
    if (seq.track[eventData.track].outputType == "midi") {
      midiDevice = midiOutputDevices[seq.track[eventData.track].outputIndex];
    } else {
      // do thing for CV GATE output
    }
    // parse eventData and generate midi data
    let newMidiMessage = [0, 0, 0];
    newMidiMessage[0] = 0x90 + seq.track[eventData.track].channel;
    newMidiMessage[1] = eventData.event.data;
    newMidiMessage[2] = eventData.event.velocity;
    // send midi data to device associated with track
    if (midiDevice != false) {
      midiDevice.sendMessage(newMidiMessage);
    }
    newMidiMessage[0] = 0x80 + seq.track[eventData.track].channel;
    setTimeout(function() {
      if (midiDevice != false) {
        midiDevice.sendMessage(newMidiMessage);
      }
    }, eventData.lengthTime * 1000);
  }
}

let oldBtn = new Array(4);
for (let k = 0; k < 4; k++) {
  oldBtn[k] = 0;
}
// highlight the current step in the grid
function stepHighlight(stepNumber) {
  console.log({
    stepNumber
  });
  // updateAllGridBtnLEDs(); // reset all btn leds to their saved colors
  // console.log("reset button colors");
  // console.log({stepNumber});
  // need  to set grid button led colors to white for the step seq is on.
  // this should only be done for tracks whose patterns are in view of the current step.
  // i.e., if a track is 32 steps long and currentl showing steps 17-32, then that track
  // should get the step highligh when those steps would be playing. if a pattern is 8 steps,
  // it will be shown twice.

  for (let i = seq.state.selectedTrackRange; i < seq.state.selectedTrackRange + 4; i++) { // for each track in the slected range of tracks...
    let patternLengthForITrack = seq.track[i].patterns["id_" + seq.track[i].currentPattern].patLength; // alias for pat length
    let viewAreaForITrack = seq.track[i].patterns["id_" + seq.track[i].currentPattern].viewArea; // alias for viewArea
    let patternStep = stepNumber % patternLengthForITrack; // surrent with the current track's current pattern

    // patternIsViewable_16 is true if the current pattern step is greater than the lower limit and less than te upper limit od the viewale range.
    let patternIsViewable_16 = (patternStep < (16 * (viewAreaForITrack + 1))) && (patternStep >= (16 * viewAreaForITrack));



    // btn: between 0 and 63 inclusive for the button associated with the track / step we are on


    if (oldBtn[i] >= 0 && oldBtn[i] <= 63) { // if the current step is vieeabwle within the current pattern...
      // build a sysex message and send it to turn this btn white
      let sysEx = btnLEDSysEx;
      sysEx[7] = oldBtn[i];
      sysEx[8] = gridBtnLEDcolor.btn[oldBtn[i]].red;
      sysEx[9] = gridBtnLEDcolor.btn[oldBtn[i]].grn;
      sysEx[10] = gridBtnLEDcolor.btn[oldBtn[i]].blu;
      fireMidiOut.sendMessage(sysEx);
      // console.log("sent sysex for btn " + btn);
    }

    let btn = ((i - seq.state.selectedTrackRange) * 16) + (patternStep % 16);
    oldBtn[i] = btn;
    if (patternIsViewable_16) { // if the current step is vieeabwle within the current pattern...
      // build a sysex message and send it to turn this btn white
      let sysEx = btnLEDSysEx;
      sysEx[7] = btn;
      sysEx[8] = 127;
      sysEx[9] = 127;
      sysEx[10] = 127;
      fireMidiOut.sendMessage(sysEx);
      // console.log("sent sysex for btn " + btn);
    }
  }
}

/***************************************************************************************

"on 'message' function"
"deltaTime" is the time since the last 'message'
"message" is an array of three byte that the message contained.
  message[0] - Midi event type (note-on, note-off, CC, etc.)
  message[1] - Midi data1 (note or CC number)
  message[2] - Midi data2 (velocity or CC data)

***************************************************************************************/

fireMidiIn.on('message', async function(deltaTime, message) {
  if (settings.flushedInput) { // make sure we ignore incoming messages until the input butffers have been flushed.
    // console.log(`m: ${message} d: ${deltaTime}`);
    // console.log({
    //   message
    // });
    // console.log({
    //   deltaTime
    // });
    // console.log(Date.now());
    // var hrTime = process.hrtime();
    // debug(hrTime[0] * 1000000 + hrTime[1] / 1000);
    switch (message[0]) {
      case 144: // note-on event
        if (message[1] >= 54 && message[1] <= 117) { // grid button
          let btnIndex = message[1] - 54; // 0 indexed id of button that was pressed
          // keep track of which button(s) gets pressed for use later
          if (btnIndex < 32) {
            seq.state.gridBtnsPressedLower |= 1 << btnIndex;
          } else {
            seq.state.gridBtnsPressedUpper |= 1 << (btnIndex - 32);
          }
          seq.state.gridBtnsPressedLast = btnIndex;
          if (seq.mode != 0) {
            // Dim the LED's of gridbutton when it is pressed.
            // create new dimmed values
            let dimColor = {};
            dimColor.red = gridBtnLEDcolor.btn[btnIndex].red / 15;
            dimColor.grn = gridBtnLEDcolor.btn[btnIndex].grn / 15;
            dimColor.blu = gridBtnLEDcolor.btn[btnIndex].blu / 15;
            dimColor.red &= 0x7f;
            dimColor.grn &= 0x7f;
            dimColor.blu &= 0x7f;
            // build sysex message
            btnLEDSysEx[7] = btnIndex;
            btnLEDSysEx[8] = dimColor.red;
            btnLEDSysEx[9] = dimColor.grn;
            btnLEDSysEx[10] = dimColor.blu;
            // send it to the Fire
            fireMidiOut.sendMessage(btnLEDSysEx);
            // This get undone when the note-off event is called.
          }
          // need to process note-on's from grid based upon the current sequencer mode.
          // seq.mode.current = 0;
          // seq.mode.names = ["Step", "Note", "Drum", "Perform", "Alt-Step"];
          switch (seq.mode.current) {
            case 0: // step mode
              let track = seq.track[seq.state.selectedTrackRange + ((btnIndex / 16) & 0xff)]; // determine which track is associated with row the button is on.
              if (track.patterns["id_" + track.currentPattern].patIsStepBased) {
                step = (btnIndex % 16) + (track.patterns["id_" + track.currentPattern].viewArea * 16); // step in the row
                track.patterns["id_" + track.currentPattern].events["id_" + step].enabled = !track.patterns["id_" + track.currentPattern].events["id_" + step].enabled;
                ipc.server.emit(seqLoop_ipcSocket, 'seq.trackVar', seq.track);
              }
              updateAllGridBtnLEDs();
              break;
            case 1: // note mode
              break;
            case 2: // drum mode
              break;
            case 3: // perform mode
              break;
            case 4: // alt-step mode
              break;
          }
        }
        let newMessage = [0xB0, 0, 0];
        switch (message[1]) {
          case 53: // rec button
            PlotStringToPixelMemMap("REC", 0, 0, 32, 2, 0);
            FireOLED_SendMemMap(0);
            ipc.server.emit(seqLoop_ipcSocket, 'seqRec');
            break;
          case 52: // stop button
            PlotStringToPixelMemMap("STOP", 0, 0, 32, 2, 0);
            FireOLED_SendMemMap(0);
            ipc.server.emit(seqLoop_ipcSocket, 'seqStop');
            updateAllGridBtnLEDs();
            break;
          case 51: // play button
            PlotStringToPixelMemMap("PLAY", 0, 0, 32, 2, 0);
            FireOLED_SendMemMap(0);
            ipc.server.emit(seqLoop_ipcSocket, 'seqPlay');
            break;
          case 50: // pat/song button
            PlotStringToPixelMemMap(String.fromCharCode(CHARCODE_LEFTARROW, CHARCODE_RIGHTARROW), PlotStringToPixelMemMap(String.fromCharCode(CHARCODE_UPARROW, CHARCODE_DOWNARROW), 0, 0, 16, 2, 0), 0, 16, 2, 0);
            FireOLED_SendMemMap(0);
            break;
          case 49: // alt button
            // when rpeseed, set alt flag
            seq.state.altPressed = true;
            // Need to light up only the buttons that have alt function
            break;
          case 48: // shift button
            // when pressed, set shift flag
            seq.state.shiftPressed = true;
            // Need to light up only the buttons that have shift function
            break;
          case 47: // Perform button
            seq.mode.Perform();
            break;
          case 46: // Drum button
            seq.mode.Drum();
            break;
          case 45: // Note button
            seq.mode.Note();
            break;
          case 44: // step button
            if (seq.state.altPressed) {
              seq.mode.altStep();
            } else {
              seq.mode.Step();
            }
            break;
          case 39: // track four mute/solo button
            if (seq.state.altPressed) {
              seq.state.selectedTrack = 0;
              notGridBtnLEDS[9] = 0;
              notGridBtnLEDS[10] = 0;
              notGridBtnLEDS[11] = 0;
              notGridBtnLEDS[12] = 4;
            } else if (seq.state.shiftPressed) {
              if (!seq.track[seq.state.selectedTrackRange + 3].solo) {
                seq.track.forEach(function(track, i) {
                  if (i != seq.state.selectedTrackRange + 3) {
                    track.mute = true;
                    track.solo = false;
                  } else {
                    track.mute = false;
                    track.solo = true;
                  }
                });
              }else{
                seq.track.forEach(function(track, i) {
                  track.mute = false;
                  track.solo = false;
                });
              }
            } else {
              seq.track[seq.state.selectedTrackRange + 3].mute = !seq.track[seq.state.selectedTrackRange + 3].mute;
            }
            notGridBtnLEDS[8] = seq.track[seq.state.selectedTrackRange + 3].mute ? 0 : SOLO_GREEN;
            notGridBtnLEDS[7] = seq.track[seq.state.selectedTrackRange + 2].mute ? 0 : SOLO_GREEN;
            notGridBtnLEDS[6] = seq.track[seq.state.selectedTrackRange + 1].mute ? 0 : SOLO_GREEN;
            notGridBtnLEDS[5] = seq.track[seq.state.selectedTrackRange + 0].mute ? 0 : SOLO_GREEN;
            ipc.server.emit(seqLoop_ipcSocket, 'seq.trackVar', seq.track);
            updateAllNotGridBtnLEDS();
            break;
          case 38: // track three mute/solo button
            if (seq.state.altPressed) {
              seq.state.selectedTrack = 1;
              notGridBtnLEDS[9] = 0;
              notGridBtnLEDS[10] = 0;
              notGridBtnLEDS[11] = 4;
              notGridBtnLEDS[12] = 0;
            } else if (seq.state.shiftPressed) {
              if (!seq.track[seq.state.selectedTrackRange + 2].solo) {
                seq.track.forEach(function(track, i) {
                  if (i != seq.state.selectedTrackRange + 2) {
                    track.mute = true;
                    track.solo = false;
                  } else {
                    track.mute = false;
                    track.solo = true;
                  }
                });
              }else{
                seq.track.forEach(function(track, i) {
                  track.mute = false;
                  track.solo = false;
                });
              }
            } else {
              seq.track[seq.state.selectedTrackRange + 2].mute = !seq.track[seq.state.selectedTrackRange + 2].mute;
            }
            notGridBtnLEDS[8] = seq.track[seq.state.selectedTrackRange + 3].mute ? 0 : SOLO_GREEN;
            notGridBtnLEDS[7] = seq.track[seq.state.selectedTrackRange + 2].mute ? 0 : SOLO_GREEN;
            notGridBtnLEDS[6] = seq.track[seq.state.selectedTrackRange + 1].mute ? 0 : SOLO_GREEN;
            notGridBtnLEDS[5] = seq.track[seq.state.selectedTrackRange + 0].mute ? 0 : SOLO_GREEN;
            ipc.server.emit(seqLoop_ipcSocket, 'seq.trackVar', seq.track);
            updateAllNotGridBtnLEDS();
            break;
          case 37: // track two mute/solo button
            if (seq.state.altPressed) {
              seq.state.selectedTrack = 2;
              notGridBtnLEDS[9] = 0;
              notGridBtnLEDS[10] = 4;
              notGridBtnLEDS[11] = 0;
              notGridBtnLEDS[12] = 0;
            } else if (seq.state.shiftPressed) {
              if (!seq.track[seq.state.selectedTrackRange + 1].solo) {
                seq.track.forEach(function(track, i) {
                  if (i != seq.state.selectedTrackRange + 1) {
                    track.mute = true;
                    track.solo = false;
                  } else {
                    track.mute = false;
                    track.solo = true;
                  }
                });
              }else{
                seq.track.forEach(function(track, i) {
                  track.mute = false;
                  track.solo = false;
                });
              }
            } else {
              seq.track[seq.state.selectedTrackRange + 1].mute = !seq.track[seq.state.selectedTrackRange + 1].mute;
            }
            notGridBtnLEDS[8] = seq.track[seq.state.selectedTrackRange + 3].mute ? 0 : SOLO_GREEN;
            notGridBtnLEDS[7] = seq.track[seq.state.selectedTrackRange + 2].mute ? 0 : SOLO_GREEN;
            notGridBtnLEDS[6] = seq.track[seq.state.selectedTrackRange + 1].mute ? 0 : SOLO_GREEN;
            notGridBtnLEDS[5] = seq.track[seq.state.selectedTrackRange + 0].mute ? 0 : SOLO_GREEN;
            ipc.server.emit(seqLoop_ipcSocket, 'seq.trackVar', seq.track);
            updateAllNotGridBtnLEDS();
            break;
          case 36: // track one mute/solo button
            if (seq.state.altPressed) {
              seq.state.selectedTrack = 3;
              notGridBtnLEDS[9] = 4;
              notGridBtnLEDS[10] = 0;
              notGridBtnLEDS[11] = 0;
              notGridBtnLEDS[12] = 0;
            } else if (seq.state.shiftPressed) {
              if (!seq.track[seq.state.selectedTrackRange + 0].solo) {
                seq.track.forEach(function(track, i) {
                  if (i != seq.state.selectedTrackRange + 0) {
                    track.mute = true;
                    track.solo = false;
                  } else {
                    track.mute = false;
                    track.solo = true;
                  }
                });
              }else{
                seq.track.forEach(function(track, i) {
                  track.mute = false;
                  track.solo = false;
                });
              }
            } else {
              seq.track[seq.state.selectedTrackRange + 0].mute = !seq.track[seq.state.selectedTrackRange + 0].mute;
            }
            notGridBtnLEDS[8] = seq.track[seq.state.selectedTrackRange + 3].mute ? 0 : SOLO_GREEN;
            notGridBtnLEDS[7] = seq.track[seq.state.selectedTrackRange + 2].mute ? 0 : SOLO_GREEN;
            notGridBtnLEDS[6] = seq.track[seq.state.selectedTrackRange + 1].mute ? 0 : SOLO_GREEN;
            notGridBtnLEDS[5] = seq.track[seq.state.selectedTrackRange + 0].mute ? 0 : SOLO_GREEN;
            ipc.server.emit(seqLoop_ipcSocket, 'seq.trackVar', seq.track);
            updateAllNotGridBtnLEDS();
            break;
          case 35: // grid right
            break;
          case 34: // grid left
            break;
          case 33: // browser button
            break;
          case 32: // pattern down button
            break;
          case 31: // pattern up button
            break;
          case 26: // encoder bank button
            // timout to reset back to bank 0 or 1
            seq.state.encoderBank++;
            if (seq.settings.encoders.global) {
              if (seq.settings.encoders.banks == "4BankMode") {
                if (seq.state.encoderBank == 4) {
                  seq.state.encoderBank = 0;
                }
                notGridBtnLEDS[23] = seq.state.encoderBank;
              }
              if (seq.settings.encoders.banks == "16BankMode") {
                if (seq.state.encoderBank == 16) {
                  seq.state.encoderBank = 0;
                }
                notGridBtnLEDS[23] = seq.state.encoderBank + 16;
              }
            } else {
              if (seq.project.encoders.banks == "4BankMode") {
                if (seq.state.encoderBank == 4) {
                  seq.state.encoderBank = 0;
                }
                notGridBtnLEDS[23] = seq.state.encoderBank;
              }
              if (seq.project.encoders.banks == "16BankMode") {
                if (seq.state.encoderBank == 16) {
                  seq.state.encoderBank = 0;
                }
                notGridBtnLEDS[23] = seq.state.encoderBank + 16;
              }
            }
            updateAllNotGridBtnLEDS();
            break;
          case 25: // Select button
            break;
          case 19: // encoder 4 touch
            if (seq.state.encBeingTouched == 0 || seq.state.encBeingTouched == 19) {
              seq.state.encBeingTouched = message[1];
              if (seq.state.OLEDmemMapContents != "encoder19") {
                clearOLEDmemMap();
              }
              // get encoder's assign name for it current function
              if (seq.settings.encoders.global) {
                name = seq.settings.encoders.control[seq.state.encoderBank][3].name;
                // console.log(name);
                PlotStringToPixelMemMap("Control Name:", 0, 0, 16);
                PlotStringToPixelMemMap(name, 0, 20, 16);
                PlotStringToPixelMemMap(seq.settings.encoders.control[seq.state.encoderBank][3].value.toString() + "    ", 0, 40, 16);
                FireOLED_SendMemMap(0);
                seq.state.OLEDmemMapContents = "encoder19";
              }
            }
            break;
          case 18: // encoder 3 touch
            if (seq.state.encBeingTouched == 0 || seq.state.encBeingTouched == 18) {
              seq.state.encBeingTouched = message[1];
              if (seq.state.OLEDmemMapContents != "encoder18") {
                clearOLEDmemMap();
              }
              if (seq.settings.encoders.global) {
                name = seq.settings.encoders.control[seq.state.encoderBank][2].name;
                // console.log(name);
                PlotStringToPixelMemMap("Control Name:", 0, 0, 16);
                PlotStringToPixelMemMap(name, 0, 20, 16);
                PlotStringToPixelMemMap(seq.settings.encoders.control[seq.state.encoderBank][2].value.toString() + "    ", 0, 40, 16);
                FireOLED_SendMemMap(0);
                seq.state.OLEDmemMapContents = "encoder18";
              }
            }
            break;
          case 17: // encoder 2 touch
            if (seq.state.encBeingTouched == 0 || seq.state.encBeingTouched == 17) {
              seq.state.encBeingTouched = message[1];
              if (seq.state.OLEDmemMapContents != "encoder17") {
                clearOLEDmemMap();
              }
              if (seq.settings.encoders.global) {
                name = seq.settings.encoders.control[seq.state.encoderBank][1].name;
                // console.log(name);
                PlotStringToPixelMemMap("Control Name:", 0, 0, 16);
                PlotStringToPixelMemMap(name, 0, 20, 16);
                PlotStringToPixelMemMap(seq.settings.encoders.control[seq.state.encoderBank][1].value.toString() + "    ", 0, 40, 16);
                FireOLED_SendMemMap(0);
                seq.state.OLEDmemMapContents = "encoder17";
              }
            }
            break;
          case 16: // encoder 1 touch
            if (seq.state.encBeingTouched == 0 || seq.state.encBeingTouched == 16) {
              seq.state.encBeingTouched = message[1];
              if (seq.state.OLEDmemMapContents != "encoder16") {
                clearOLEDmemMap();
              }
              if (seq.settings.encoders.global) {
                name = seq.settings.encoders.control[seq.state.encoderBank][0].name;
                // console.log(name);
                PlotStringToPixelMemMap("Control Name:", 0, 0, 16);
                PlotStringToPixelMemMap(name, 0, 20, 16);
                PlotStringToPixelMemMap(seq.settings.encoders.control[seq.state.encoderBank][0].value.toString() + "    ", 0, 40, 16);
                FireOLED_SendMemMap(0);
                seq.state.OLEDmemMapContents = "encoder16";
              }
            }
            break;
        }
        break;
      case 128: // note-off event
        if (message[1] >= 54 && message[1] <= 117) { // grid button
          let btnIndex = message[1] - 54;

          if (btnIndex < 32) {
            seq.state.gridBtnsPressedLower &= ~(1 << btnIndex);
          } else {
            seq.state.gridBtnsPressedUpper &= ~(1 << (btnIndex - 32));
          }

          // console.log(seq.state.gridBtnsPressedLower);

          btnLEDSysEx[7] = btnIndex;
          btnLEDSysEx[8] = (gridBtnLEDcolor.btn[btnIndex].red) & 0x7F;
          btnLEDSysEx[9] = (gridBtnLEDcolor.btn[btnIndex].grn) & 0x7F;
          btnLEDSysEx[10] = (gridBtnLEDcolor.btn[btnIndex].blu) & 0x7F;
          fireMidiOut.sendMessage(btnLEDSysEx);
        }
        switch (message[1]) {
          case 53: // rec button
            break;
          case 52: // stop button
            break;
          case 51: // play button
            break;
          case 50: // pat/song button
            break;
          case 49: // alt button
            // when rpeseed, set alt flag and highlight button leds that have alt function
            seq.state.altPressed = false;
            updateAllNotGridBtnLEDS();
            break;
          case 48: // shift button
            // when pressed, set shift flag and highlight button LEDs that have shift function
            seq.state.shiftPressed = false;
            updateAllNotGridBtnLEDS();
            break;
          case 47: // Perform button
            break;
          case 46: // Drum button
            break;
          case 45: // Note button
            break;
          case 44: // step button
            break;
          case 39: // track four mute/solo button
            break;
          case 38: // track three mute/solo button
            break;
          case 37: // track two mute/solo button
            break;
          case 36: // track one mute/solo button
            break;
          case 35: // grid right
            break;
          case 34: // grid left
            break;
          case 33: // browser button
            break;
          case 32: // pattern down button
            break;
          case 31: // pattern up button
            break;
          case 26: // encoder bank button
            break;
          case 25: // Select button
            break;
          case 19: // encoder 4 touch
            if (seq.state.encBeingTouched == 19) {
              seq.state.encBeingTouched = 0;
            }
            break;
          case 18: // encoder 3 touch
            if (seq.state.encBeingTouched == 18) {
              seq.state.encBeingTouched = 0;
            }
            break;
          case 17: // encoder 2 touch
            if (seq.state.encBeingTouched == 17) {
              seq.state.encBeingTouched = 0;
            }
            break;
          case 16: // encoder 1 touch
            if (seq.state.encBeingTouched == 16) {
              seq.state.encBeingTouched = 0;
            }
            break;
        }
        break;
      case 176: // CC event
        if (message[1] == 118 && message[2] == 127) {
          // FireOLED_DrawBitmap_partial(xOffset, ++yOffset, bitmaps.bitmap_thermom32x32, 32, 32);
          PlotStringToPixelMemMap("~ABCDEFGH", 0, 0, 32, 0, 1);
          PlotStringToPixelMemMap("ancdefghij", 0, 32, 32, 1, 0);
          // PlotStringToPixelMemMap("klmnopqrstuvwxyz", 0, 48, 32, 2, 1);
          // PlotStringToPixelMemMap("RSTUVYZ", 0, 48, 24, 3, 0);
          FireOLED_SendMemMap(0);
          xOffset = 0;
        } else if (message[1] == 118 && message[2] == 1) {
          if (yOffset == 0) {
            yOffset++;
            xOffset++;
          }
          yOffset--;
          // PlotStringToPixelMemMap("ABCDEFGHIJKLMN", 0, 0, 24, 0, 0);
          // PlotStringToPixelMemMap("OPQRSTUVY", 0, 16, 24, 1, 1);
          // PlotStringToPixelMemMap("abcdefghklm", 0, 32, 24, 2, 0);
          // PlotStringToPixelMemMap("nopqrstu", 0, 48, 24, 3, 1);
          // function PlotBitmapToPixelMemmap(inBitmap, xOrigin, yOrigin, bmp_width, bmp_height, invert) {
          PlotBitmapToPixelMemmap(bitmaps.bitmap_X_64x64, 0, 0, 64, 64, 2);
          FireOLED_SendMemMap(0);
        }
        switch (message[1]) {
          case 118: // select encoder
            break;
          case 19:
            if (seq.settings.encoders.global) {
              if (seq.settings.encoders.control[seq.state.encoderBank][3].midiCCtype == "abs") {
                if (message[2] >= 1 && message[2] < 10) {
                  seq.settings.encoders.control[seq.state.encoderBank][3].value += message[2];
                  if (seq.settings.encoders.control[seq.state.encoderBank][3].value > 127) {
                    seq.settings.encoders.control[seq.state.encoderBank][3].value = 127;
                  }
                } else if (message[2] <= 127 && message[2] > 100) {
                  seq.settings.encoders.control[seq.state.encoderBank][3].value -= (128 - message[2]);
                  if (seq.settings.encoders.control[seq.state.encoderBank][3].value < 0) {
                    seq.settings.encoders.control[seq.state.encoderBank][3].value = 0;
                  }
                }
              }
              if (seq.state.encBeingTouched == 19) {
                PlotStringToPixelMemMap(seq.settings.encoders.control[seq.state.encoderBank][3].value.toString() + "    ", 0, 40, 16);
                FireOLED_SendMemMap(8);
              }
            }
            break;
          case 18:
            if (seq.settings.encoders.global) {
              if (seq.settings.encoders.control[seq.state.encoderBank][2].midiCCtype == "abs") {
                if (message[2] >= 1 && message[2] < 10) {
                  seq.settings.encoders.control[seq.state.encoderBank][2].value += message[2];
                  if (seq.settings.encoders.control[seq.state.encoderBank][2].value > 127) {
                    seq.settings.encoders.control[seq.state.encoderBank][2].value = 127;
                  }
                } else if (message[2] <= 127 && message[2] > 100) {
                  seq.settings.encoders.control[seq.state.encoderBank][2].value -= (128 - message[2]);
                  if (seq.settings.encoders.control[seq.state.encoderBank][2].value < 0) {
                    seq.settings.encoders.control[seq.state.encoderBank][2].value = 0;
                  }
                }
              }
              if (seq.state.encBeingTouched == 18) {
                PlotStringToPixelMemMap(seq.settings.encoders.control[seq.state.encoderBank][2].value.toString() + "    ", 0, 40, 16);
                FireOLED_SendMemMap(8);
              }
            }
            break;
          case 17:
            if (seq.settings.encoders.global) {
              if (seq.settings.encoders.control[seq.state.encoderBank][1].midiCCtype == "abs") {
                if (message[2] >= 1 && message[2] < 10) {
                  seq.settings.encoders.control[seq.state.encoderBank][1].value += message[2];
                  if (seq.settings.encoders.control[seq.state.encoderBank][1].value > 127) {
                    seq.settings.encoders.control[seq.state.encoderBank][1].value = 127;
                  }
                } else if (message[2] <= 127 && message[2] > 100) {
                  seq.settings.encoders.control[seq.state.encoderBank][1].value -= (128 - message[2]);
                  if (seq.settings.encoders.control[seq.state.encoderBank][1].value < 0) {
                    seq.settings.encoders.control[seq.state.encoderBank][1].value = 0;
                  }
                }
              }
              if (seq.state.encBeingTouched == 17) {
                PlotStringToPixelMemMap(seq.settings.encoders.control[seq.state.encoderBank][1].value.toString() + "    ", 0, 40, 16);
                FireOLED_SendMemMap(8);
              }
            }
            break;
          case 16:
            if (seq.settings.encoders.global) {
              if (seq.settings.encoders.control[seq.state.encoderBank][0].midiCCtype == "abs") {
                if (message[2] >= 1 && message[2] < 10) {
                  seq.settings.encoders.control[seq.state.encoderBank][0].value += message[2];
                  if (seq.settings.encoders.control[seq.state.encoderBank][0].value > 127) {
                    seq.settings.encoders.control[seq.state.encoderBank][0].value = 127;
                  }
                } else if (message[2] <= 127 && message[2] > 100) {
                  seq.settings.encoders.control[seq.state.encoderBank][0].value -= (128 - message[2]);
                  if (seq.settings.encoders.control[seq.state.encoderBank][0].value < 0) {
                    seq.settings.encoders.control[seq.state.encoderBank][0].value = 0;
                  }
                }
              }
              if (seq.state.encBeingTouched == 16) {
                PlotStringToPixelMemMap(seq.settings.encoders.control[seq.state.encoderBank][0].value.toString() + "    ", 0, 40, 16);
                FireOLED_SendMemMap(8);
              }
            }
            break;
        }
        break;
      default:
        console.log("event not recognised");
    }
  }
});

function settings(selEnc) {
  // draw setings to OLED and settimeout so that settings disappear after a few seconds
  // If the timeout is still active, use btnEnc parameter to to figure out what should
  // be done to the settings.

  //
}

function enableSequencer() {

}

/**************************************************************************************************

     Plot a string of characters as glyphs into Bitmap Memory Map

     paramters:
      inString - string of character to plot
      xOrigin - x coordinate of starting point
      yOrigin - ^^^
      heightPx - Height in pixels that the text should be printed in. accepts 16, 24, or 32
      spacing - space in pixels between characters
      invert - 0 or none for normal, 1 for inverted color

    returns:
      cursor position on x-axis after plotting string

**************************************************************************************************/
function PlotStringToPixelMemMap(inString, xOrigin, yOrigin, heightPx, spacing = 2, invert = 0) {
  let font;
  switch (heightPx) {
    case 16:
      font = bitmaps.font_16px;
      break;
    case 24:
      font = bitmaps.font_24px;
      break;
    case 32:
      font = bitmaps.font_32px;
      break;
    default:
      font = bitmaps.font_16px;
  }
  let cursor = xOrigin;
  for (let i = 0; i < inString.length; i++) {
    // get the width of the character from the array. Its the last value in each array.
    let currentCharWidth = font[inString.charCodeAt(i) - 32][font[inString.charCodeAt(i) - 32].length - 1];
    let currentCharData = font[inString.charCodeAt(i) - 32];
    PlotBitmapToPixelMemmap(currentCharData, cursor, yOrigin, currentCharWidth, heightPx, invert);
    cursor += currentCharWidth;
    if (font[inString.charCodeAt(i + 1) - 32] != undefined) { // If there are still characters in the string to plot
      if (cursor + spacing + (font[inString.charCodeAt(i + 1) - 32][font[inString.charCodeAt(i + 1) - 32].length - 1]) > 127) {
        break;
      }
    }
    if (spacing > 0) {
      let spaceBitmap = new Array((((spacing / 8) + 0.9999999) & 0xff) * heightPx);
      for (let g = 0; g < spaceBitmap.length; g++) {
        spaceBitmap[g] = 0;
      }
      PlotBitmapToPixelMemmap(spaceBitmap, cursor, yOrigin, spacing, heightPx, invert);
    }
    cursor += spacing;
  }
  return cursor;
}

/*************************************************************************************************
        Update all of the grid button LED from the gridBtnLEDcolor object.
        This function sends the sysEx commands with a ~1ms delay between each.
*************************************************************************************************/
function updateAllGridBtnLEDs() {
  if (seq.mode.current == 0) {
    for (let i = seq.state.selectedTrackRange; i < seq.state.selectedTrackRange + 4; i++) {
      for (let y = 0; y < 16; y++) {
        if ((seq.track[i].patterns["id_" + seq.track[i].currentPattern].patLength < 16) && (y < seq.track[i].patterns["id_" + seq.track[i].currentPattern].patLength)) {
          if (seq.track[i].patterns["id_" + seq.track[i].currentPattern].events["id_" + y].enabled) {
            gridBtnLEDcolor.btn[i * 16 + y].red = seq.track[i].patterns["id_" + seq.track[i].currentPattern].color.red;
            gridBtnLEDcolor.btn[i * 16 + y].grn = seq.track[i].patterns["id_" + seq.track[i].currentPattern].color.grn;
            gridBtnLEDcolor.btn[i * 16 + y].blu = seq.track[i].patterns["id_" + seq.track[i].currentPattern].color.blu;
          } else {
            gridBtnLEDcolor.btn[i * 16 + y].red = 0;
            gridBtnLEDcolor.btn[i * 16 + y].grn = 0;
            gridBtnLEDcolor.btn[i * 16 + y].blu = 0;
          }
        } else if (seq.track[i].patterns["id_" + seq.track[i].currentPattern].patLength < 16) {
          gridBtnLEDcolor.btn[i * 16 + y].red = 0;
          gridBtnLEDcolor.btn[i * 16 + y].grn = 0;
          gridBtnLEDcolor.btn[i * 16 + y].blu = 0;
        } else {
          if (seq.track[i].patterns["id_" + seq.track[i].currentPattern].events["id_" + (y + (seq.track[i].patterns["id_" + seq.track[i].currentPattern].viewArea * 16))].enabled) {
            gridBtnLEDcolor.btn[i * 16 + y].red = seq.track[i].patterns["id_" + seq.track[i].currentPattern].color.red;
            gridBtnLEDcolor.btn[i * 16 + y].grn = seq.track[i].patterns["id_" + seq.track[i].currentPattern].color.grn;
            gridBtnLEDcolor.btn[i * 16 + y].blu = seq.track[i].patterns["id_" + seq.track[i].currentPattern].color.blu;
          } else {
            gridBtnLEDcolor.btn[i * 16 + y].red = 0;
            gridBtnLEDcolor.btn[i * 16 + y].grn = 0;
            gridBtnLEDcolor.btn[i * 16 + y].blu = 0;
          }
        }
      }
    }
  }
  let count = 0;
  let updateInterval = setInterval(function() {
    let sysEx = btnLEDSysEx;
    sysEx[7] = count;
    sysEx[8] = (gridBtnLEDcolor.btn[count].red) & 0x7f;
    sysEx[9] = (gridBtnLEDcolor.btn[count].grn) & 0x7f;
    sysEx[10] = (gridBtnLEDcolor.btn[count].blu) & 0x7f;
    fireMidiOut.sendMessage(sysEx);
    count++;
    if (count > 63) {
      clearInterval(updateInterval);
    }
  }, 1);
}

function updateAllNotGridBtnLEDS() {
  let message = [0xB0, 0, 0];
  var count = 0;
  let intVal = setInterval(function() {
    if (count < 23) { // button id's 31-53
      message[1] = count + 31;
      message[2] = notGridBtnLEDS[count];
      fireMidiOut.sendMessage(message);
    } else { //
      // channel/mixer/user1/user2 LEDs
      message[1] = 0x1b;
      message[2] = notGridBtnLEDS[23];
      fireMidiOut.sendMessage(message);
      clearInterval(intVal);
    }
    count++;
  }, 1);
}

/*
  Write a section or all of the OLED bitmap memory map to the device

  paramters:
    section - 0 or none: all
              1: rows 0,1,2
              2: rows 4,5,6
              3: rows 7,8
  returns:
    true if operation completed successfully
    false if there was a problem.
*/
function FireOLED_SendMemMap(section = 0) {
  clearTimeout(seq.state.OLEDclearTimeout);
  seq.state.OLEDclearTimeout = setTimeout(function() {
    clearOLEDmemMap();
    FireOLED_SendMemMap();
  }, seq.settings.general.OLEDtimeout * 1000);

  let timeMillis = Date.now();
  if (timeMillis - seq.state.lastOLEDupdateTime < 50) {
    return;
  }
  seq.state.lastOLEDupdateTime = Date.now();

  let y;
  let x;
  let xOrigin = 0,
    yOrigin = 0,
    yHeight = 64;
  switch (section) {
    case 1: // lines / pages 0, 1
      yHeight = 16;
      break;
    case 2: // lines / pages 2, 3,
      yHeight = 16;
      yOrigin = 16;
      break;
    case 3: // lines / pages 4, 5
      yHeight = 16;
      yOrigin = 32;
      break;
    case 4: // lines / pages 6, 7
      yHeight = 16;
      yOrigin = 48;
      break;
    case 5: // lines / pages 0, 1, 2
      yHeight = 24;
      break;
    case 6: // lines / pages 3, 4, 5
      yHeight = 24;
      yOrigin = 24;
      break;
    case 7: // lines / pages 0, 1, 2, 3
      yHeight = 32;
      break;
    case 8: // lines / pages 4, 5, 6, 7
      yHeight = 32;
      yOrigin = 32;
      break;
  } // no "0" or default needed since values were set at declaration, writes all 8 lines

  let newArraySize = ((((128 * yHeight) / 7) + 0.999999999) & 0xffff);
  var bit7_OLEDBitmap = new Uint8Array(newArraySize);
  for (x = 0; x < newArraySize; ++x) {
    bit7_OLEDBitmap[x] = 0;
  }
  for (x = 0; x < 128; x++) {
    for (y = yOrigin; y < (yOrigin + yHeight); y++) {
      let xUnwound = x + (128 * (((y - yOrigin) / 8) & 0xff));
      let bitByteMut = bitmaps.bitMutate_byteAddr[y % 8][xUnwound % 7];
      if (fireOLED_pixelMemMap[x][y] > 0) {
        bit7_OLEDBitmap[bitByteMut[1] + (((xUnwound / 7) & 0xff) * 8)] |= (1 << bitByteMut[0]);
      } else {
        bit7_OLEDBitmap[bitByteMut[1] + (((xUnwound / 7) & 0xff) * 8)] &= (~(1 << bitByteMut[0])) & 0xff;
      }
    }
  }

  let newSysEx = new Array(bit7_OLEDBitmap.length + 12);

  // calculate row start value, and return false if the bitmap overruns the OLED
  let rowStart = (yOrigin / 8) & 0xff;
  if (rowStart > 7) {
    return false;
  }
  let rowEnd = ((yHeight / 8) & 0xff) - 1 + rowStart;
  if (rowEnd > 7) {
    return false;
  }
  newSysEx[0] = 0xf0; // sys ex
  newSysEx[1] = 0x47; // Akai manufacturer ID
  newSysEx[2] = 0x7F; // All Call Address
  newSysEx[3] = 0x43; // Fire Sub-ID
  newSysEx[4] = 0x0E; // Write OLED command
  newSysEx[5] = (bit7_OLEDBitmap.length + 4) >>> 7; // payload length, btis 7-13
  newSysEx[6] = (bit7_OLEDBitmap.length + 4) & 0x7F; // payload length, bits 0-7
  newSysEx[7] = rowStart;
  newSysEx[8] = rowEnd;
  newSysEx[9] = xOrigin;
  newSysEx[10] = 127;
  let i = 0;
  while (i < bit7_OLEDBitmap.length) {
    newSysEx[i + 11] = bit7_OLEDBitmap[i];
    i++;
  }
  newSysEx[bit7_OLEDBitmap.length + 11] = 0xf7;
  fireMidiOut.sendMessage(newSysEx);
  return true;
}

/*
plot a bitmap to the OLED pixel memory map

paramters:
  inbitmap - array of bytes representing a glyph. generate at https://javl.github.io/image2cpp/
  xOrigin, yOrigin
  bmp_width, bmp_height - dimensions of incoming bitmap
  invert - 0 for normal, 1 for inverted colors

*/
function PlotBitmapToPixelMemmap(inBitmap, xOrigin, yOrigin, bmp_width, bmp_height, invert) {
  let x, y;
  for (x = 0; x < bmp_width; x++) {
    for (y = 0; y < bmp_height; y++) {
      let outBit = (inBitmap[(y * (((bmp_width / 8) + 0.999999999) & 0xff)) + ((x / 8) & 0xff)]) & (0x80 >>> (x % 8));
      if (invert == 1) {
        fireOLED_pixelMemMap[x + xOrigin][y + yOrigin] = outBit > 0 ? 0 : 1;
      } else if (invert == 0) {
        fireOLED_pixelMemMap[x + xOrigin][y + yOrigin] = outBit > 0 ? 1 : 0;
      } else if (invert > 1) {
        fireOLED_pixelMemMap[x + xOrigin][y + yOrigin] = fireOLED_pixelMemMap[x + xOrigin][y + yOrigin] == 0 ? (outBit > 0 ? 1 : 0) : (outBit > 0 ? 0 : 1);
      }
    }
  }
}

function clearOLEDmemMap() {
  for (let i = 0; i < 128; i++) {
    for (let p = 0; p < 64; p++) {
      fireOLED_pixelMemMap[i][p] = 0;
    }
  }
}

async function debug(s, lvl, comment) {
  if (!lvl) {
    lvl = 5;
  }
  if (lvl <= settings.debugLevel) {
    console.log("______________________");
    console.log("|    DEBUG OUTPUT    |");
    if (comment) {
      console.log(comment);
    }
    console.log("----------------------");
    console.log(s);
    console.log("______________________");
    console.log("**********************");
    console.log(" ");
    console.log(" ");
  }
}

function exit() {
  fireMidiIn.closePort();
  fireMidiOut.closePort();
  virInput.closePort();
  virOutput.closePort();
}


function exitHandler(options, exitCode) {
  exit();
  if (options.cleanup) debug('clean', 2);
  if (exitCode || exitCode === 0) debug(exitCode, 1);
  if (options.exit) process.exit();
  console.log({
    exitCode
  });
  console.log("Change debug logging level with '--debugLevel [0-5]'");
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, {
  cleanup: true
}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {
  exit: true
}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {
  exit: true
}));
process.on('SIGUSR2', exitHandler.bind(null, {
  exit: true
}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {
  exit: true
}));

// 120 bpm, 16 steps,
// 60/120 = 0.5 sec/beat
// 16/4 = 4 steps/beats
// 4 * 0.5 = total pattern time

// (60/bpm)*(patternLength/stepPerBeat)
