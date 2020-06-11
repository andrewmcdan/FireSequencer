# FireSequencer
Akai Fire for FL Studio turned into an independent MIDI step sequencer in node.js

See https://hackaday.io/project/172368-fire-sequencer for a full overview. 

Requirements for running Fire Sequencer:
1. Something that can run node.js (I'm using a RasPi 4)
2. Akai Fire
3. npm install node-ipc
4. npm rebuild midi

Requirement #4 may be a bit of a hassle if you don't have the build environment set up already. It rebuilds
the RTMidi library for your particular platform and can be a bit finicky to get it to work. Once the build
completes succesfully though, everything should work with no problems. 

This is a work in progress and may not function as expected. Much functionality is missing and some hardware 
specific functionality has been temporarily hardcoded .

main.js will eventually become the primary entry point for the project.
For now, I'm running FireSequencer.js and seq_loop.js directly. 
