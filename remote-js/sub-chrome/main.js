// This is the main script of a Jetpack-based add-on.

const widget = require("widget");

exports.main = function() {
  console.log("Addon main function");
  widget.add(new widget.Widget({
    label: "Test Widget",
    content: "Test Widget",
    onClick: function() {
      var xhr = require("xhr");
      console.log("Widget clicked");
      var req = new xhr.XMLHttpRequest();
      req.open("GET", "http://benjamin.smedbergs.us/tests/guidgen", true);
      req.onreadystatechange = function(evt) {
        if (req.readyState == 4)
          if (200 == req.status)
            console.log("Data received: " + req.responseText);
          else
            console.log("Fetch error: " + req.status);
      };
      req.send(null);
    }
  }));
};
