var usbDetect = require('usb-detection');
const spawn = require('child_process').spawn;
const path = require('path');
const kill = require('tree-kill');

const fireVID = 2536;
const firePID = 67;

var isStarted = false;
var firstTest = true;
var child;

usbDetect.startMonitoring();

var detectionInterval = setInterval(function(){
  usbDetect.find(fireVID, firePID, function(err, devices) {
    if (!err) {
      if(devices.length!=0 && !isStarted){
        console.log("Akai Fire found.");
        console.log("Starting FireSequencer.js");
        let command = 'node';
        let parameters = [path.resolve('FireSequencer.js')];
        child = spawn(command, parameters, {
          stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ]
        });
        isStarted=true;
      }else if(devices.length==0 && isStarted){
          console.log("Fire not detected. Killing sequencer.");
          kill(child.pid)
          isStarted=false;
      }else{
        if(firstTest){
          console.log("Please connect Akai Fire to sequencer device.");
          firstTest=false;
        }
      }
    } else {
      console.log(err);
    }
  });
},1000);

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
  usbDetect.stopMonitoring()
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
