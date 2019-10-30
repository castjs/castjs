## 📺 Castjs

<img src="https://i.imgur.com/uI4i1m5.png" align="right"
     title="Chromecast Javascript Wrapper" width="300" height="100">
DEMO: [https://fenny.github.io/Castjs/demo/](https://fenny.github.io/Castjs/demo/)<br>
CastJS is a simple javascript wrapper arround the complex chromecast SDK. (6.08 KB minified)!
This wrapper provides simple events and methods to easily communicate with any cast device.

```html
<script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"></script>
<script src="https://cdn.jsdelivr.net/gh/fenny/castjs@latest/castjs.min.js"></script>
```

```javascript
// Invoke CastJS
const cc = new Castjs()
// Optional arguments
const cc = new Castjs({
     receiver:   'CC1AD845',
     joinpolicy: 'origin_scoped'
})
// Events
cc.on('available',    ()           => {}) // Cast device available
cc.on('connected',    ()           => {}) // Connected
cc.on('state',        (str)        => {}) // State changed
cc.on('media',        (obj)        => {}) // Media changed
cc.on('time',         (obj)        => {}) // Time changed
cc.on('volume',       (int)        => {}) // Volume changed
cc.on('muted',        (boolean)    => {}) // Muted changed
cc.on('paused',       (boolean)    => {}) // Paused changed
cc.on('ended',        ()           => {}) // Media ended
cc.on('disconnected', ()           => {}) // Disconnected
cc.on('error',        (str)        => {}) // Error

// Remove events
cc.off()                           // Removes all event listeners
cc.off('event')                    // Removes specific event listener

// Metadata object
const metadata = {
  poster:      'https://fenny.github.io/Castjs/demo/poster.png',
  title:       'Sintel',
  description: 'Sample video for chromecast',
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
}

// Methods
cc.cast('https://example.com/video.mp4')            // Cast media url
cc.cast('https://example.com/video.mp4', metadata)  // Cast media url with metadata

cc.duration()   // Returns Object with time information
cc.seek(50)     // Seeks to input percentage (0-100)
cc.mediainfo()  // Returns media object
cc.state()      // Returns String state of media
cc.pause()      // Pauses media
cc.paused()     // Returns Boolean
cc.play()       // Plays media
cc.muted()      // Returns Boolean
cc.muted(true)  // Boolean Mutes or Unmutes media
cc.volume()     // Returns volume percentage (0-100)
cc.volume(30)   // Change volume percentage (0-100)
cc.disconnect() // Disconnect and destroy session
```

### Bugs, ideas or notes, don't hesitate to open an issue and help us to improve this library!
