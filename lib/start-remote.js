let {Cc, Ci} = require('chrome');

let jetpackService = Cc["@mozilla.org/jetpack/service;1"]
                     .getService(Ci.nsIJetpackService);

exports.main = function(options, callbacks) {
  var process = jetpackService.createJetpack();

  // Whenever our add-on is disabled or uninstalled, we want to
  // destroy the remote process.

  require("unload").when(function() {
                           process.destroy();
                           process = null;
                         });

  // Set up message receivers that the remote process will use to
  // communicate with us.

  process.registerReceiver(
    "console:log",
    function(name, msg) {
      console.log(msg);
    });

  process.registerReceiver(
    "widget:setContent",
    function(name, handle, value) {
      console.log("setting widget status to", uneval(value));
      handle.widget.content = value;
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
      handle.widget = w;
      widget.add(w);
    });

  process.registerReceiver(
    "xhr:sync-send",
    function(name, handle, method, uri, data) {
      var xhr = require("xhr");
      console.log("asymmetric-sync req received");
      var req = new xhr.XMLHttpRequest();
      req.open(method, uri, true);
      req.onreadystatechange = function() {
        console.log("asymmetric-sync req.onreadystatechange");
        if (req.readyState == 4)
          handle.finishedReq = req;
      };
      handle.req = req;
      req.send(data);
      console.log("asymmetric-sync req sent");
    });

  process.registerReceiver(
    "xhr:sync-send:poll",
    function(name, handle) {
      if (!('finishedReq' in handle))
        return null;
      return {readyState: handle.finishedReq.readyState,
              status: handle.finishedReq.status,
              responseText: handle.finishedReq.responseText};
    });

  process.registerReceiver(
    "xhr:async-send",
    function(name, handle, method, uri, data) {
      var xhr = require("xhr");
      console.log("req received");
      var req = new xhr.XMLHttpRequest();
      req.open(method, uri, true);
      req.onreadystatechange = function() {
        console.log("req.onreadystatechange");
        var status = (req.readyState == 4) ? req.status : undefined;
        process.sendMessage("xhr:onreadystatechange", handle,
                            req.readyState, status, req.responseText);
      };
      req.send(data);
      console.log("req sent");
    });

  // Now send code to the remote process.

  var self = require("self");

  process.evalScript(self.data.load("chrome/core.js"));
  process.sendMessage("doMain", self.data.load("sub-chrome/main.js"));
};
