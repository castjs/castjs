# ChromecastJS

<img src="https://i.imgur.com/uI4i1m5.png" align="right"
     title="Chromecast Javascript Wrapper" width="300" height="100">
DEMO: https://fenny.github.io/ChromecastJS/demo/index.html<br>
ChromecastJS is a javascript wrapper arround the complex chromecast SDK. (5.93 KB minified)!
This wrapper provides simple events and functions to communicate easily with any chromecast.

```html
<script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"></script>
<script src="https://fenny.github.io/ChromecastJS/chromecastjs.min.js"></script>
```

```javascript
// Optional arguments: scope, receiverID
var cc = new ChromecastJS()

// Events
cc.on('available', () => {}) 
// Casting is available
cc.on('connected', () => {}) 
// Connected with cast device
cc.on('disconnected', () => {}) 
// Disconnected from cast device
cc.on('media', (media) => {}) 
// Media successfully loaded, returns media object
cc.on('ended', () => {}) 
// Media ended
cc.on('timeupdate', (obj) => {}) 
// { progress: 45, time: '00:03:45', duration: '00:11:23' }
cc.on('volumechange', (volume) => {}) 
// Returns volume in percentage 0-100
cc.on('error', () => {}) 
// Returns string containing error message

// Media object
var media = {
  content:     'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  poster:      'https://fenny.github.io/ChromecastJS/demo/poster.png',
  title:       'Sintel',
  description: 'Sample video for chromecast',
  subtitles: [{
      active:   true,
      label:    'English',
      srclang:  'en',
      src:      'https://fenny.github.io/ChromecastJS/demo/english.vtt'
  }, {
      label:    'Spanish',
      srclang:  'es',
      src:      'https://fenny.github.io/ChromecastJS/demo/spanish.vtt'
  }],
  muted:  false,
  paused: false
}

// Methods
cc.duration() 
// { progress: 45, time: '00:03:45', duration: '00:11:23' }
cc.seek(perecentage) 
// seek to 0-100 perecentage
cc.state() 
// Returns state of media
cc.pause() 
// Pauses media
cc.paused() 
// Returns boolean (true / false)
cc.play() 
// Plays media
cc.muted() 
// Returns if media is muted
cc.muted(true) 
// If boolean, mute or unmute media
cc.volume() 
// Returns volume in percentage
cc.volume(30) 
// Change volume to 30%
cc.disconnect() 
// Destroy session
```

# Help us to improve this library and make it a solid wrapper, I respond to issues or pull request within 1 hour!
