## 📺 Castjs 1.9.9

DEMO: [https://fenny.github.io/Castjs/demo/](https://fenny.github.io/Castjs/demo/)<br>
CastJS is a simple javascript wrapper arround the complex chromecast SDK.
This library provides simple events and methods to easily communicate with any cast device.    
Browser support: chrome, opera, brave and vivaldi.

```html
<script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"></script>
<script src="https://cdn.jsdelivr.net/gh/fenny/castjs@1.9.9/castjs.min.js"></script>
```

```javascript
// Invoke CastJS
const cc = new Castjs()
// Optional arguments
const cc = new Castjs({ receiver: 'CC1AD845', joinpolicy: 'origin_scoped' })

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
cc.off()                           // Removes all callbacks
cc.off('event')                    // Removes all callbacks for event
cc.off('event', fn)                // Removes specific callback for event

// Casting media
cc.cast('https://example.com/video.mp4') // Cast media url
cc.cast('https://example.com/video.mp4', {
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
})  // Cast media url with metadata

// Cast controllers
cc.media           // Media object with information
cc.seek(50)        // Seeks to input percentage (0 - 100)
cc.volume(0.2)     // Change volume percentage (0 - 1.0)
cc.play()          // Plays media
cc.pause()         // Pauses media
cc.mute(bool)      // Boolean to mute or unmute
cc.subtitle(index) // Make subtitle track active
cc.disconnect()    // Disconnect session
```

### Bugs, ideas or notes, don't hesitate to open an issue and help us to improve this library!
