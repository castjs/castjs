# ChromecastJS

<img src="https://i.imgur.com/uI4i1m5.png" align="right"
     title="Chromecast Javascript Wrapper" width="400" height="125">

ChromecastJS is a javascript wrapper arround the complex chromecast SDK.
This wrapper provides simple events and functions to communicate easily with any chromecast.
Feel free to take a look at the source code, you can see that is a minimal wrapper that is only 5.51 KB minified!


## Getting started

* **content**: relative.
* **poster**: relative.
* **title**: relative.
* **description**: relative.
* **subtitles**: relative.
* **time**: relative.
* **duration**: relative.
* **volume**: relative.
* **muted**: relative.
* **paused**: relative.
* **state**: relative.

## JavaScript API

```js
var ccJS = new ChromecastJS();

ccJS.on('available', function() {
  console.log('Chromecast found on the network')
})
ccJS.on('connected', function() {
  console.log('Connected with chromecast')
})
ccJS.on('media', function(media) {
  console.log('Media changed:', media)
})
ccJS.on('playOrPause', function(paused) {
  console.log('Media is paused or unpaused:', paused)
})
ccJS.on('muteOrUnmute', function(muted) {
  console.log('Media is muted or unmuted:', muted)
})
ccJS.on('volume', function(volume) {
  console.log('Volume change detected:', volume)
})
ccJS.on('state', function(state) {
  console.log('Cast state changed:', state)
})
ccJS.on('time', function(time) {
  console.log('time:', time)
})
ccJS.on('disconnect', function() {
  console.log('disconnected')
})
ccJS.on('error', function(err) {
  console.log('error:', err)
})
```
