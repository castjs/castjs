# CastJS

<img src="https://i.imgur.com/uI4i1m5.png" align="right"
     title="Chromecast Javascript Wrapper" width="300" height="100">
DEMO: https://fenny.github.io/CastJS/demo/index.html<br>
ChromecastJS is a simple javascript wrapper arround the complex chromecast SDK. (6.21 KB minified)!
This wrapper provides simple events and methods to easily communicate with any cast device.

```html
<script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"></script>
<script src="https://fenny.github.io/castjs/castjs.min.js"></script>
```

```javascript
// Optional arguments: (joinpolicy, receiver)
const cc = new CastJS()

// Events
cc.on('available',    ()    => {}) // Cast device available
cc.on('connected',    ()    => {}) // Connected
cc.on('disconnected', ()    => {}) // Disconnected
cc.on('state',        (str) => {}) // State changed
cc.on('media',        (obj) => {}) // Media loaded
cc.on('ended',        ()    => {}) // Media ended
cc.on('timeupdate',   (obj) => {}) // Time updated
cc.on('volumechange', (int) => {}) // Volume changed
cc.on('error',        (str) => {}) // Error

// Media object
const media = {
  content:     'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  poster:      'https://fenny.github.io/CastJS/demo/poster.png',
  title:       'Sintel',
  description: 'Sample video for chromecast',
  subtitles: [{
      active: true,
      label:  'English',
      src:    'https://fenny.github.io/CastJS/demo/english.vtt'
  }, {
      label:  'Spanish',
      src:    'https://fenny.github.io/CastJS/demo/spanish.vtt'
  }],
  muted:  false,
  paused: false
}

// Methods
cc.cast(media)  // Cast media object
cc.duration()   // Returns Object with time information
cc.seek(50)     // Seeks to input percentage (0-100)
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

# Bugs, ideas or notes, don't hesitate to open an issue and help us to improve this library!
