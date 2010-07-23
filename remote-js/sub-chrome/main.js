// This is the main script of a Jetpack-based add-on.

const widget = require("widget");

exports.main = function() {
  console.log("Addon main function");
  var options = {
    label: "Click me!",
    content: "Click me!",
    onClick: function() {
      var self = this;
      self.content = "...";
      var xhr = require("xhr");
      console.log("Widget clicked");
      var req = new xhr.XMLHttpRequest();
      var url = ("http://api.twitter.com/1/users/show.json?" +
                 "screen_name=toolness");
      req.open("GET", url, true);
      req.onreadystatechange = function(evt) {
        if (req.readyState == 4) {
          if (200 == req.status) {
            console.log("Data received: " + req.responseText.length +
                        " bytes");
            self.content = JSON.parse(req.responseText).status.text;
          } else {
            console.log("Fetch error: " + req.status);
            self.content = "ERROR";
          }
        }
      };
      req.send(null);
    }
  };
  widget.add(new widget.Widget(options));
};
