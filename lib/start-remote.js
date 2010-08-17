let {Cc, Ci} = require('chrome');

let url = require("url");

let jetpackService = Cc["@mozilla.org/jetpack/service;1"]
                     .getService(Ci.nsIJetpackService);

exports.main = function(options, callbacks) {
  startRemoteProcess(packaging.getURLForData("/sub-chrome/"));
};

function startRemoteProcess(root) {
  var process = jetpackService.createJetpack();
  var fs = new (require("securable-module").LocalFileSystem)(root);

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
    "core:exception",
    function(name, obj) {
      console.log("exception in child", JSON.stringify(obj));
    });

  process.registerReceiver(
    "require",
    function(name, path) {
      var module;
      try {
        var moduleName = path + "-server";

        module = require(moduleName);
        module.register(process);

        var parentFS = require("cuddlefish").parentLoader.fs;
        var moduleURL = parentFS.resolveModule(null, moduleName);
        var info = url.URL(moduleURL);
        var pkgName = packaging.options.resourcePackages[info.host];
        var clientURL = url.URL("chrome/" + path + "-client.js",
                                packaging.options.packageData[pkgName]);
        var filename = require("url").toFilename(clientURL);
        return {
          isChrome: true,
          script: {
            filename: filename,
            contents: require("file").read(filename)
          }
        };
      } catch (e if /Error: Module ".*" not found/.test(e)) {
        var fullPath = fs.resolveModule(null, path);
        if (fullPath) {
          var script = fs.getFile(fullPath);
          script.filename = fullPath;
          return {
            isChrome: false,
            script: script
          };
        }
      }
      return null;
    });

  process.evalScript(require("self").data.load("chrome/core.js"));
};
