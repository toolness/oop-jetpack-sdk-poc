This is Benjamin Smedberg's hacked-up proof-of-concept XPI from the
[Jetpack-Electrolysis Integration Bug][] converted into a Jetpack
package. The original XPI was forged during a late-night hack session
at the [2010 Mozilla Summit][] in Whistler, Canada.

Note that this experiment doesn't require any changes to the Jetpack
SDK: it just does all out-of-process work in an add-on. It's intended
to familiarize Jetpack platform developers with how out-of-process
communication works, so as to help us figure out how to integrate
support for out-of-process add-ons into the Jetpack platform itself.

  [2010 Mozilla Summit]: https://wiki.mozilla.org/Summit2010
  [Jetpack-Electrolysis Integration Bug]: https://bugzilla.mozilla.org/show_bug.cgi?id=567703

## Requirements ##

* The [Jetpack SDK 0.5][] or later.
* A [Firefox nightly][] built after July 15, 2010.

  [Jetpack SDK 0.5]: https://jetpack.mozillalabs.com/sdk/0.5/docs/
  [Firefox nightly]: http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/

## Usage ##

1. Activate your SDK and clone this git repository in the `packages`
   subdirectory of your SDK and enter it:

    `git clone git://github.com/toolness/oop-jetpack-sdk-poc.git`

    `cd oop-jetpack-sdk-poc`

2. Run the addon against your installation of the latest Firefox nightly.
   On OS X systems, you'll need to type something like this:

    `cfx run -a firefox -b /Applications/Minefield.app`

3. Once Firefox starts up, you should see a widget at the bottom of the
   browser labeled "Click me!" (it may be truncated due to size constraints).
   Do what it says.

4. The widget label should change to "..." for a moment and then change
   to the Twitter status of [toolness](http://twitter.com/toolness).

## Code Walkthrough ##

The add-on's entry point is in <code>[lib/start-remote.js][]</code>. This code
uses <code>[nsIJetpackService][]</code> to create a
<code>[nsIJetpack][]</code>, which represents a remote process. It
also sets up some message receivers that the remote process can
communicate with.

All code executed in the remote process is contained in the
<code>[remote-js][]</code> directory. Within it are two
subdirectories containing privileged (a.k.a. "chrome") code and
less-privileged (a.k.a. "sub-chrome") code.

<code>[remote-js/chrome/core.js][]</code> manages communication
with the parent process and has access to privileged message-sending
globals that sub-chrome code doesn't have.

<code>[remote-js/sub-chrome/main.js][]</code> would typically be
the code written by an add-on developer&mdash;that is, it's the code
that would normally be in `lib/main.js`, were the Jetpack SDK to
support Electrolysis out-of-the-box.

  [lib/start-remote.js]: http://github.com/toolness/oop-jetpack-sdk-poc/blob/master/lib/start-remote.js
  [nsIJetpackService]: http://mxr.mozilla.org/mozilla-central/source/js/jetpack/nsIJetpackService.idl
  [nsIJetpack]: http://mxr.mozilla.org/mozilla-central/source/js/jetpack/nsIJetpack.idl
  [remote-js]: http://github.com/toolness/oop-jetpack-sdk-poc/tree/master/remote-js/
  [remote-js/chrome/core.js]: http://github.com/toolness/oop-jetpack-sdk-poc/blob/master/remote-js/chrome/core.js
  [remote-js/sub-chrome/main.js]: http://github.com/toolness/oop-jetpack-sdk-poc/blob/master/remote-js/sub-chrome/main.js
