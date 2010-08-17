exports.Widget = function Widget(options) {
  this.options_ = options;
  this.handle_ = createHandle();
  this.handle_.widget = this;
  this.__defineSetter__(
    "content",
    function(value) {
      sendMessage("widget:setContent", this.handle_, value);
    });
};

exports.add = function add(widget) {
  sendMessage("widget:add", widget.handle_, {
      label: widget.options_.label,
      content: widget.options_.content
    });
};

registerReceiver("widget:onClick", function(name, handle) {
  handle.widget.options_.onClick.call(handle.widget);
});
