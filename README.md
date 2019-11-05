<h1 align="center">
  <br>
  <img src="https://i.imgur.com/elCjMDx.png" alt="Castjs" width="150">
  <br>
  Castjs v1
  <br>
  <br>
</h1>

<h4 align="center">Javascript library for the complex chromecast SDK</h4>

<p align="center">
  <b>Castjs</b> provides simple events and functions to communicate with chromecast devices from the browser.
  <br>
  This library works in chrome, opera, brave and vivaldi.
</p>

##### Getting started

```html
<script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"></script>
<script src="https://cdn.jsdelivr.net/gh/fenny/castjs@1.0.0/cast.min.js"></script>
```

##### Casting a video is simple:

```js
var cc = new Castjs()

$('button').on('click', () => {
  if (cc.available) {
    cc.cast('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4')
  }
})
```

##### Adding some metadata is simple too:

```js
cc.cast('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', {
  title:       'Sintel',
  description: 'Third Open Movie by Blender Foundation',
  poster:      'https://fenny.github.io/Castjs/demo/poster.png',
})
```

##### Documentation:

```javascript
// Invoke CastJS
const cc = new Castjs()
// Optional arguments
const cc = new Castjs({ 
  receiver:   'CC1AD845',       // Custom cast application id.
  joinpolicy: 'origin_scoped',  // https://developers.google.com/cast/docs/reference/chrome/chrome.cast.html#.AutoJoinPolicy
  language:   null,             // Language to use.
  resume:     true              // If true, a session will be re-joined without reloading the page.
})

// Create events
cc.on('available',    ()           => {}) // Cast device available
cc.on('state',        (str)        => {}) // Media state changed
cc.on('session',      (media)      => {}) // Connected
cc.on('time',         (obj)        => {}) // Time changed
cc.on('volume',       (float)      => {}) // Volume changed
cc.on('mute',         (bool)       => {}) // Muted or Unmuted
cc.on('pause',        (bool)       => {}) // Pause event
cc.on('end',          ()           => {}) // Media ended
cc.on('disconnected', ()           => {}) // Disconnected
cc.on('error',        (str)        => {}) // Error

// Remove events
cc.off()            // Removes all callbacks
cc.off('event')     // Removes all callbacks for event
cc.off('event', fn) // Removes specific callback for event

// Casting media
cc.cast('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4') // Cast media source
cc.cast('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', {
  poster:      'https://fenny.github.io/Castjs/demo/poster.png',
  title:       'Sintel',
  description: 'Third Open Movie by Blender Foundation',
  subtitles: [{
      active: true,
      label:  'English',
      src:    'https://fenny.github.io/Castjs/demo/english.vtt'
  }, {
      label:  'Spanish',
      src:    'https://fenny.github.io/Castjs/demo/spanish.vtt'
  }],
  muted:  false,
  paused: false
})  // Cast media url with metadata

// Cast controllers
cc.media           // Media object with information
cc.device          // Connected device name
cc.seek(50)        // Seeks to input percentage (0 - 100)
cc.volume(0.2)     // Change volume float (0 - 1)
cc.play()          // Plays media
cc.pause()         // Pauses media
cc.mute(bool)      // Boolean to mute or unmute
cc.subtitle(index) // Make subtitle track active
cc.disconnect()    // Disconnect session
```

<p align="center">
  <br>
  <br>
  <br>
  <a href="https://www.buymeacoffee.com/fenny" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important;" ></a>
<p align="center">
