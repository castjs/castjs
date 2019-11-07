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
  This library works in chrome, opera, brave and vivaldi, see it in action and check out the <a href="https://fenny.github.io/Castjs/demo/">demo v2.0.0</a>.
</p>

##### Getting started
Include the Cast sender and Castjs in your html page, Castjs is hosted on jsDelivr CDN for easy inclusion on your site.

```html
<script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"></script>
<script src="https://cdn.jsdelivr.net/gh/fenny/castjs@3.0.0/cast.min.js"></script>
```

##### Casting a video is simple:

```js
var device = new Castjs();
var source = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4';
$('button').on('click', () => {
  if (device.available) {
    device.cast(source);
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
  poster:      'https://fenny.github.io/Castjs/demo/poster.jpg',
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
$('button').on('click', () => {
  if (device.available) {
    device.cast(source, metadata);
  }
});
```

##### Documentation:

```javascript
// Invoke Castjs (See bottom for optional arguments)
const device = new Castjs();

// Castjs Events
device.on('available',    ()  => {});  // Casting is available
device.on('session',      ()  => {});  // Casting session detected
device.on('statechange',  ()  => {});  // Casting state changed
device.on('timeupdate',   ()  => {});  // Current time changed
device.on('volumechange', ()  => {});  // Volume changed
device.on('muted',        ()  => {});  // Muted changed
device.on('paused',       ()  => {});  // Paused changed
device.on('ended',        ()  => {});  // Media ended
device.on('disconnect',   ()  => {});  // Session disconnected
device.on('error',        (e) => {});  // Error event
device.on('any',          (e) => {});  // Any event

// Castjs functions
device.cast(source, metadata);  // Create session with media
device.volume(1.0);             // Change volume
device.play();                  // Play media
device.pause();                 // Pause media
device.mute();                  // Mutes media
device.unmute();                // Unmutes media
device.subtitle(2);             // Change active subtitle index
device.disconnect();            // Disconnect session
device.seek(seconds);           // Seek with seconds
device.seek(percentage, true);  // Seek with percentages

// Castjs properties
device.receiver         // Returns receiver id
device.available        // Returns available true or false
device.session          // Returns session true or false
device.device           // Returns cast device name
device.source           // Returns media source
device.title            // Returns media title
device.description      // Returns media description
device.poster           // Returns media poster image
device.subtitles        // Returns subtitle array
device.volumeLevel      // Returns volume 0 - 1
device.muted            // Returns muted true or false
device.paused           // Returns paused true or false
device.time             // Returns duration in seconds
device.timePretty       // Returns formatted current time hh:mm:ss
device.duration         // Returns duration in seconds
device.durationPretty   // Returns formatted duration hh:mm:ss
device.progress         // Returns time progress 0 - 100

// Optional Castjs arguments, order does not matter
// receiver ~ custom receiver id
// joinpolicy ~ tab_and_origin_scoped, origin_scoped, page_scoped
const device = new Castjs(receiver);
const device = new Castjs(joinpolicy);
const device = new Castjs(receiver, joinpolicy);
const device = new Castjs(joinpolicy, receiver);
```

##### Todo so I won't forget

```javascript
- Add local media and stream support after google fixes service worker crash
- Add name space messaging support for custom receivers
- Maybe add video element support: new Castjs($('#video'))

// Suggestions? Let me know!
```
<p align="center">
  <br>
  <br>
  <a href="https://www.buymeacoffee.com/fenny" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important;" ></a>
<p align="center">
