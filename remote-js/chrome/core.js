var console = {
  log: function console_log(msg) {
    sendMessage('console:log', "" + msg);
  }
};

var widget = {
  Widget: function(options) {
    this.options_ = options;
    this.handle_ = createHandle();
    this.handle_.widget = this;
  },

  add: function(widget) {
    sendMessage("widget:add", widget.handle_, {
      label: widget.options_.label,
      content: widget.options_.content
    });
  }
};

registerReceiver("widget:onClick", function(name, handle) {
  handle.widget.options_.onClick();
});

var xhr = {
  XMLHttpRequest: function xhr_XMLHttpRequest() {
  }
};

xhr.XMLHttpRequest.prototype = {
  open: function xhr_XHR_open(method, uri, async) {
    this.method = method;
    this.uri = uri;
    this.async = async;
  },

  send: function xhr_XHR_send(data) {
    this.handle = createHandle();
    this.handle.xhr = this;
    
    (this.async ? sendMessage : callMessage)("xhr:send", this.handle,
                                             this.method, this.uri,
                                             this.async, data);
  }
};

registerReceiver(
  "xhr:onreadystatechange",
  function(name, handle, readyState, status, responseText) {
    handle.xhr.readyState = readyState;
    handle.xhr.status = status;
    handle.xhr.responseText = responseText;
    handle.xhr.onreadystatechange();
  });

function main_require(name) {
  switch (name) {
  case "widget":
    return widget;
  case "xhr":
    return xhr;
  }
  throw Error("Unknown package '" + name + "'.");
}

registerReceiver(
  "doMain",
  function(name, script) {
    // create the sandbox for the main script
    var main = createSandbox();

    // set up globals of the sandbox
    main.console = console;
    main.require = main_require;
    main.exports = {};

    evalInSandbox(main, script);
    main.exports.main();
  });
