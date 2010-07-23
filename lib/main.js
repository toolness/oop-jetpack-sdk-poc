let {Cc, Ci} = require('chrome');

let jetpackService = Cc["@mozilla.org/jetpack/service;1"]
                     .getService(Ci.nsIJetpackService);

exports.main = function(options, callbacks) {
  var process = jetpackService.createJetpack();

  require("unload").when(function() {
                           process.destroy();
                           process = null;
                         });

  // set up receivers for the global stuff
  process.registerReceiver(
    "console:log",
    function(name, msg) {
      console.log(msg);
    });

  process.registerReceiver(
    "widget:add",
    function(name, handle, options) {
      var widget = require("widget");
      var w = new widget.Widget({label: options.label,
                                 content: options.content,
                                 onClick: function remote_widget_onclick() {
	                           process.sendMessage("widget:onClick",
                                                       handle);
                                 }});
      widget.add(w);
    });

  process.registerReceiver(
    "xhr:send",
    function(name, handle, method, uri, async, data) {
      var xhr = require("xhr");
      console.log("req received");
      var req = new xhr.XMLHttpRequest();
      req.open(method, uri, async);
      req.onreadystatechange = function() {
        console.log("req.onreadystatechange");
        process.sendMessage("xhr:onreadystatechange", handle,
                            req.readyState, req.status, req.responseText);
      };
      req.send(data);
      console.log("req sent");
    });

  var self = require("self");

  process.evalScript(self.data.load("chrome/core.js"));
  process.sendMessage("doMain", self.data.load("sub-chrome/main.js"));
};
