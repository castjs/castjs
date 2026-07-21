<p align="center">
  <img src="https://i.imgur.com/ZjTpQ3S.png" alt="Castjs" width="100%">
</p>

<h4 align="center">Javascript library (&lt;10kb) for the complex Chromecast SDK</h4>

<p align="center">
  <b>Castjs</b> provides simple events and functions to communicate with Chromecast devices from the browser.<br>
  This library works in Chrome, Opera, Brave, Edge and Vivaldi. See it in action on the <a href="https://castjs.io/">online demo</a>.
  <br><br>
  <a href="https://castjs.io/"><img src="https://i.imgur.com/vDdyBwj.png" width="100%"></a>
  <br><br>
  Do you want to support my work? Feel free to donate a <a href="https://www.buymeacoffee.com/fenny" target="_blank">☕ Hot Beverage</a>
</p>

---

## Getting Started

Include the library from [cdnjs](https://cdnjs.com/libraries/castjs):

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/castjs/7.0.0/cast.min.js"></script>
```

> The Google Cast framework (`cast_sender.js`) is automatically loaded if it is not already present on the page.

---

## Casting Media

Make sure you enable [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) on your media resources:

```
Access-Control-Allow-Origin: *
```

```html
<button id="cast">Cast</button>

<script src="https://cdnjs.cloudflare.com/ajax/libs/castjs/7.0.0/cast.min.js"></script>
<script>
const cjs = new Castjs();

document.getElementById('cast').addEventListener('click', () => {
  if (cjs.available()) {
    // Simple example
    cjs.cast('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4');

    // Full example with metadata + subtitles
    cjs.cast('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', {
      poster: 'https://castjs.io/media/poster.jpg',
      title: 'Sintel',
      description: 'Third Open Movie by Blender Foundation',
      subtitles: [{
        active: true,
        label: 'English',
        src: 'https://castjs.io/media/english.vtt'
      }, {
        label: 'Spanish',
        src: 'https://castjs.io/media/spanish.vtt'
      }]
    });
  }
});
</script>
```

---

## Supported Browsers

Almost any Chromium-based browser supports the Cast framework:

- [Chrome](https://www.google.com/chrome/)
- [Edge](https://www.microsoft.com/edge)
- [Opera](https://www.opera.com/)
- [Brave](https://brave.com/)
- [Vivaldi](https://vivaldi.com/)

> Requires **HTTPS** (or `localhost`)

---

## API Documentation

### Initialize

```js
// Default instance
const cjs = new Castjs();

// Custom options
const cjs = new Castjs({
  joinpolicy: 'tab_and_origin_scoped', // default
                                       // 'tab_and_origin_scoped' | 'origin_scoped' | 'page_scoped'
  receiver: 'CC1AD845',                // default media receiver
  debug: true                          // enable debug logs
});
```

### Methods

```js
cjs.cast(src, metadata)     // Start casting
cjs.play()                  // Resume playback
cjs.pause()                 // Pause playback
cjs.disconnect()            // End session

cjs.time()                  // Get current time (seconds)
cjs.time(120)               // Seek to 2:00
cjs.time(true)              // Get formatted time ("02:00")

cjs.duration()              // Get duration (seconds)
cjs.duration(true)          // Get formatted duration

cjs.volume()                // Get volume (0 → 1)
cjs.volume(0.5)             // Set volume

cjs.muted()                 // Get mute state
cjs.muted(true)             // Mute
cjs.muted(false)            // Unmute

cjs.subtitle(0)             // Change active subtitle by index
```

### Events

```js
cjs.on('available',      () => {})    // Cast framework is ready
cjs.on('connect',        () => {})    // Connected to a device
cjs.on('disconnect',     () => {})    // Session ended

cjs.on('statechange',    () => {})    // Player state changed
cjs.on('playing',        () => {})    // Media is playing
cjs.on('pause',          () => {})    // Media is paused
cjs.on('buffering',      () => {})    // Buffering / seeking
cjs.on('end',            () => {})    // Media ended

cjs.on('timeupdate',     () => {})    // Current time changed
cjs.on('volumechange',   () => {})    // Volume changed
cjs.on('mute',           () => {})    // Muted
cjs.on('unmute',         () => {})    // Unmuted
cjs.on('subtitlechange', () => {})    // Active subtitle changed

cjs.on('event',          (e) => {})   // Catch all events except 'error'
cjs.on('error',          (e) => {})   // Catch any errors
```

### Getters

```js
cjs.available()      // boolean  – is Cast available
cjs.connected()      // boolean  – is connected to a device
cjs.device()         // string   – device name
cjs.state()          // string   – current state
cjs.paused()         // boolean  – is paused

cjs.src()            // current media URL
cjs.title()          // media title
cjs.description()    // media description
cjs.poster()         // poster image URL
cjs.subtitles()      // array of subtitle tracks
cjs.progress()       // progress (0 → 100)

cjs.volume()         // volume (0 → 1)
cjs.muted()          // is muted
cjs.time()           // current time in seconds
cjs.time(true)       // formatted time ("01:23")
cjs.duration()       // duration in seconds
cjs.duration(true)   // formatted duration
```

### Metadata

```js
cjs.cast('https://example.com/video.mp4', {
  title: 'My Video',
  description: 'Optional description',
  poster: 'https://example.com/poster.jpg',
  time: 30,                    // start position in seconds
  paused: false,

  subtitles: [{
    label: 'English',
    src: 'https://example.com/en.vtt',
    subtype: 'SUBTITLES',      // SUBTITLES | CAPTIONS | DESCRIPTIONS | CHAPTERS | METADATA
    active: true
  }],

  // Optional (Netflix-style defaults are already applied)
  subtitleStyle: {
    backgroundColor: '#00000000',
    foregroundColor: '#FFFFFF',
    edgeType: 'DROP_SHADOW',
    edgeColor: '#000000FF',
    fontFamily: 'CASUAL',
    fontScale: 1.0
  }
});
```

---

## FAQ

**Question:** Can I cast local resources?<br>
**Answer:** It was possible in the past using service workers, but Google dropped support. See [this issue](https://github.com/fenny/chromecast-service-worker-crash).

**Question:** Do I need to enable CORS?<br>
**Answer:** Yes. Chromecast is strict about CORS. You can allow the `CrKey` user-agent if you want to be more specific, but `Access-Control-Allow-Origin: *` is the simplest solution.

---

<p align="center">
  Do you want to support my work? Feel free to donate a <a href="https://www.buymeacoffee.com/fenny" target="_blank">☕ Hot Beverage</a>
</p>

---
