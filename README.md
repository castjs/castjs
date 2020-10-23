<p align="center">
  <img src="https://i.imgur.com/SE0fwqV.jpg" alt="Castjs" width="100%">
</p>

<h4 align="center">Javascript library for the complex chromecast SDK</h4>

<p align="center">
  <b>Castjs</b> provides simple events and functions to communicate with chromecast devices from the browser.
  <br>
  This library works in chrome, opera, brave and vivaldi, see it in action and check out the <a href="https://castjs.io/demo/">online demo</a>.
</p>

##### Import library

```html
<script src="https://castjs.io/cast.min.js"></script>            <!-- master  -->
<script src="https://castjs.io/cast.min.js@latest"></script> --> <!-- latest  -->
<script src="https://castjs.io/cast.min.js@v4.0.2"></script> --> <!-- version -->
<script src="https://castjs.io/cast.min.js@master"></script>     <!-- master  -->
```

##### Casting a media source

```js
var cc = new Castjs();
$('button').on('click', () => {
    if (cc.available) {
        cc.cast('https://castjs.io/demo/sintel.mp4');
    }
});
```

##### Adding metadata to media source

```js
var cc = new Castjs();
var metadata = {
    title      : 'Sintel',
    description: 'Third Open Movie by Blender Foundation',
    poster     : 'https://castjs.io/demo/poster.jpg',
    muted      : false,
    paused     : false,
    time       : 35,
    subtitles: [{
        active: true,
        label:  'English',
        source: 'https://castjs.io/demo/english.vtt'
    }, {
        label:  'Spanish',
        source: 'https://castjs.io/demo/spanish.vtt'
  }]
}
$('button').on('click', () => {
    if (cc.available) {
        cc.cast('https://castjs.io/demo/sintel.mp4', metadata);
    }
});
```

##### Documentation:

```javascript
// Default instance
const cc = new Castjs();

// Custom receiver or joinpolicy
const cc = new Castjs({
    receiver  : 'CC1AD845',              // default
    joinpolicy: 'tab_and_origin_scoped', // default
//  joinpolicy: 'custom_controller_scoped',
//  joinpolicy: 'origin_scoped',
//  joinpolicy: 'page_scoped',
});

// Castjs Events
cc.on('available',    ()  => {});  // Casting is available
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

##### TODO

```
- Add local media and stream support after google fixes service worker crash
- Add name space messaging support for custom receivers
- Maybe add video element support: new Castjs($('#video'))

// Suggestions? Let me know!
```

<p align="center">
  Do you want to support my work, feel free to donate a <a href="https://www.buymeacoffee.com/fenny" target="_blank">☕ Hot Beverage</a>
</p>
