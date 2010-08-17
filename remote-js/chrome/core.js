// Set up our "proxy" objects that just send messages to our parent
// process to do the real work.

var global = this;

var console = {
  log: function console_log(msg) {
    sendMessage('console:log', "" + msg);
  }
};

function require(name) {
  var response = callMessage("require", name)[0];
  if (response == null)
    throw new Error("Unknown module '" + name + "'.");

  var module = createSandbox();

  // Set up the globals of the sandbox.
  module.exports = {};
  module.console = console;
  module.require = require;

  if (response.isChrome)
    ["registerReceiver",
     "createHandle",
     "sendMessage",
     "callMessage"].forEach(
       function(name) {
         module[name] = global[name];
       });

  try {
    evalInSandbox(module, '//@line 1 "' + response.script.filename + 
                  '"\n' + response.script.contents);
  } catch (e) {
    console.log("error while loading module: " + name + " " + e +
                " " + e.stack);
    throw e;
  }
  return module.exports;
};

var main = require("main");
if ('main' in main)
  main.main();
