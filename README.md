<h1 align="center">
  <br>
  <img src="https://i.imgur.com/elCjMDx.png" alt="Castjs" width="100">
  <br>
  Castjs
  <br>
  <br>
</h1>

<h4 align="center">Javascript library for the complex chromecast SDK</h4>

<p align="center">
  <b>Castjs</b> provides simple events and functions to communicate with chromecast devices from the browser.
  <br>
  This library works in chrome, opera, brave and vivaldi, see it in action and check out the <a href="https://castjs.io/demo/">online demo</a>.
</p>

##### Getting started
```html
<script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"></script>
<script src="https://castjs.io/cast.min.js"></script>
```

##### Casting a video is simple:

```js
var device = new Castjs();
var source = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4';
$('button').on('click', () => {
  if (cc.available) {
    cc.cast(source);
  }
});
```

##### Adding some metadata is simple too:

```js
var device   = new Castjs();
var source   = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4';
var metadata = {
  title:       'Sintel',
  description: 'Third Open Movie by Blender Foundation',
  poster:      'https://castjs.io/demo/poster.jpg',
  subtitles: [{
    active: true,
    label:  'English',
    source: 'https://castjs.io/demo/english.vtt'
  }, {
    label:  'Spanish',
    source: 'https://castjs.io/demo/spanish.vtt'
  }],
  muted:  false,
  paused: false,
  time:   35
}
$('button').on('click', () => {
  if (cc.available) {
    cc.cast(source, metadata);
  }
});
```

##### Documentation:

```javascript
// New Castjs instance wiht optional opt
const cc = new Castjs();
const cc = new Castjs({
    receiver  : 'CC1AD845',              // default receiver
    joinpolicy: 'tab_and_origin_scoped', // default joinpolicy
    // custom_controller_scoped
    // origin_scoped
    // page_scoped
});

// Castjs Events
cc.on('available',    ()  => {});  // Casting is available
cc.on('search',       ()  => {});  // Searching devices
cc.on('cancel',       ()  => {});  // Cancelled the device selection
cc.on('connect',      ()  => {});  // Connected with device
cc.on('disconnect',   ()  => {});  // Disconnected with device
cc.on('statechange',  ()  => {});  // Device state
cc.on('timeupdate',   ()  => {});  // Current time changed
cc.on('volumechange', ()  => {});  // Volume changed
cc.on('mute',         ()  => {});  // Muted state changed
cc.on('playing',      ()  => {});  // Media is playing
cc.on('pause',        ()  => {});  // Media is paused
cc.on('end',          ()  => {});  // Media ended
cc.on('buffering',    ()  => {});  // Media is buffering / seeking
cc.on('event',        (e) => {});  // Catch all events except 'error'
cc.on('error',        (e) => {});  // Catch any errors

// Castjs functions
cc.cast(source, [metadata]);  // Create session with media
cc.volume(0.7);              // Change volume
cc.play();                   // Play media
cc.pause();                  // Pause media
cc.mute();                   // Mutes media
cc.unmute();                 // Unmutes media
cc.subtitles(2);             // Change active subtitle index
cc.seek(seconds);            // Seek with seconds
cc.seek(percentage, [true]); // Seek with percentages
cc.disconnect();             // Disconnect session

// Castjs properties
cc.receiver         // Receiver ID
cc.available        // Casting is available
cc.connected        // Connected with cast device
cc.device           // Cast device name
cc.src              // Media source
cc.title            // Media title
cc.description      // Media description
cc.poster           // Media poster image
cc.subtitles        // Media subtitles
cc.volumeLevel      // Volume level
cc.muted            // If muted
cc.paused           // If paused
cc.time             // Time in seconds
cc.timePretty       // Time formatted in time hh:mm:ss
cc.duration         // Duration in seconds
cc.durationPretty   // Duration formatted in hh:mm:ss
cc.progress         // Progress in percentage 0 - 100
cc.state            // State of cast device
```

##### Todo so I won't forget

```
- Add local media and stream support after google fixes service worker crash
- Add name space messaging support for custom receivers
- Maybe add video element support: new Castjs($('#video'))

// Suggestions? Let me know!
```

<p align="center">
  Do you want to support my work, feel free to donate a <a href="https://www.buymeacoffee.com/fenny" target="_blank">☕ Hot Beverage</a>
</p.
