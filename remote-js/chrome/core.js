// Set up our "proxy" objects that just send messages to our parent
// process to do the real work.

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
    this.__defineSetter__(
      "content",
      function(value) {
        sendMessage("widget:setContent", this.handle_, value);
      });
  },

  add: function(widget) {
    sendMessage("widget:add", widget.handle_, {
      label: widget.options_.label,
      content: widget.options_.content
    });
  }
};

registerReceiver("widget:onClick", function(name, handle) {
  handle.widget.options_.onClick.call(handle.widget);
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
    // createHandle() allows us to pass our object references back and
    // forth with the parent process.
    this.handle = createHandle();
    this.handle.xhr = this;

    if (this.async)
      sendMessage("xhr:async-send", this.handle, this.method, this.uri, data);
    else {
      callMessage("xhr:sync-send", this.handle, this.method, this.uri, data);

      var response;
      while (!response)
        // It's too bad we can't sleep the thread or anything here, at the very
        // least. Once bug 582808 is resolved, though, we'll be able to do
        // this without any kind of polling.
        response = callMessage("xhr:sync-send:poll", this.handle)[0];
      for (name in response)
        this.handle.xhr[name] = response[name];
    }
  }
};

// Register our own message receivers that the parent process
// can use to initiate communication with us.

registerReceiver(
  "xhr:onreadystatechange",
  function(name, handle, readyState, status, responseText) {
    handle.xhr.readyState = readyState;
    handle.xhr.status = status;
    handle.xhr.responseText = responseText;
    handle.xhr.onreadystatechange();
  });

registerReceiver(
  "doMain",
  function(name, script) {
    // Create the sandbox for the main script.
    var main = createSandbox();

    // Set up the globals of the sandbox.
    main.exports = {};
    main.console = console;
    main.require = function require(name) {
      switch (name) {
      case "widget":
        return widget;
      case "xhr":
        return xhr;
      }
      throw new Error("Unknown package '" + name + "'.");
    };

    // Run the add-on!
    evalInSandbox(main, script);
    main.exports.main();
  });
