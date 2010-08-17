exports.register = function(process) {
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
};
