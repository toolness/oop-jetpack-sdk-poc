exports.register = function(process) {
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
};
