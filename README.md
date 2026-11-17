<p align="center">
  <img src="https://i.imgur.com/ZjTpQ3S.png" alt="Castjs" width="100%">
</p>

<h4 align="center">Javascript library (~15kb) for the complex Chromecast SDK</h4>

<p align="center">
  <b>Castjs</b> provides simple events and functions to communicate with Chromecast devices from the browser.<br>
  This library works in Chrome, Opera, Brave, Edge and Vivaldi. See it in action on the <a href="https://castjs.com/">online demo</a>.
  <br><br>
  <a href="https://castjs.com/"><img src="https://i.imgur.com/vDdyBwj.png" width="100%"></a>
  <br><br>
  Do you want to support my work? Feel free to donate a <a href="https://www.buymeacoffee.com/fenny" target="_blank">☕ Hot Beverage</a>
</p>

---

## Getting Started

Include the library from [jsDelivr](https://www.jsdelivr.com/package/gh/castjs/castjs):

```html
<script src="https://cdn.jsdelivr.net/gh/castjs/castjs@v7.3.0/cast.min.js"></script>
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

<script src="https://cdn.jsdelivr.net/gh/castjs/castjs@v7.3.0/cast.min.js"></script>
<script>
const cjs = new Castjs();

document.getElementById('cast').addEventListener('click', () => {
  if (cjs.available()) {
    // Simple example
    cjs.cast('https://www.peach.themazzone.com/durian/movies/sintel-1024-surround.mp4');

    // Full example with metadata + subtitles
    cjs.cast('https://www.peach.themazzone.com/durian/movies/sintel-1024-surround.mp4', {
      poster: 'https://castjs.com/media/poster.jpg',
      title: 'Sintel',
      description: 'Third Open Movie by Blender Foundation',
      subtitles: [{
        active: true,
        label: 'English',
        src: 'https://castjs.com/media/english.vtt'
      }, {
        label: 'Spanish',
        src: 'https://castjs.com/media/spanish.vtt'
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
  language: 'nl-NL',                   // cast dialog language, defaults to the browser language
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
cjs.subtitle(-1)            // Turn subtitles off

cjs.queue(items, options)   // Cast a playlist (see Queue)
cjs.next()                  // Next item in the queue
cjs.prev()                  // Previous item in the queue
cjs.index()                 // Get current queue index
cjs.index(2)                // Jump to queue item 2
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
cjs.on('queuechange',    () => {})    // Queue loaded or current item changed

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
cjs.queue()          // array of queue items
cjs.index()          // current queue index (-1 when not using a queue)
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

  type: 'video/mp4',           // content type, guessed from the file extension when omitted
                               // e.g. 'application/x-mpegurl' (HLS) or 'application/dash+xml' (DASH)
  live: false,                 // true for live streams
  data: { token: 'abc' },      // custom data sent to your receiver with the load request

  subtitles: [{
    label: 'English',
    src: 'https://example.com/en.vtt',
    subtype: 'SUBTITLES',      // SUBTITLES | CAPTIONS | DESCRIPTIONS | CHAPTERS | METADATA
    active: true
  }],

  // Optional (Netflix-style defaults are already applied)
  subtitlestyle: {
    backgroundColor: '#00000000',
    foregroundColor: '#FFFFFF',
    edgeType: 'DROP_SHADOW',
    edgeColor: '#000000FF',
    fontFamily: 'CASUAL',
    fontScale: 1.0
  }
});
```

### Queue

Every item accepts the same fields as the `cast()` metadata, plus `src`.

```js
cjs.queue([{
  src: 'https://example.com/episode1.mp4',
  title: 'Episode 1',
  poster: 'https://example.com/ep1.jpg'
}, {
  src: 'https://example.com/episode2.m3u8',
  title: 'Episode 2',
  subtitles: [{ label: 'English', src: 'https://example.com/ep2-en.vtt', active: true }],
  data: { id: 2 }              // custom data for this item
}], {
  start: 0,                    // index to start with
  repeat: false,               // true to loop the queue
  time: 0,                     // start position of the first item in seconds
  paused: false,
  data: { token: 'abc' }       // custom data for the load request
});

cjs.on('queuechange', () => {
  console.log('Now playing', cjs.index(), cjs.title());
});
```

`cjs.cast()` replaces the queue with a single item.

---

## FAQ

**Question:** Can I cast local resources?<br>
**Answer:** It was possible in the past using service workers, but Google dropped support. See [this issue](https://github.com/fenny/chromecast-service-worker-crash).

**Question:** Can I list the available devices and pick one myself?<br>
**Answer:** No. The Cast SDK only lets the browser show its own device picker, `cjs.cast()` opens it.

**Question:** Does it work in Firefox or Safari?<br>
**Answer:** No, they don't support Google Cast. Castjs fires an `error` event so you can hide your cast button.

**Question:** Do I need to enable CORS?<br>
**Answer:** Yes. Chromecast is strict about CORS. You can allow the `CrKey` user-agent if you want to be more specific, but `Access-Control-Allow-Origin: *` is the simplest solution.

---

<p align="center">
  Do you want to support my work? Feel free to donate a <a href="https://www.buymeacoffee.com/fenny" target="_blank">☕ Hot Beverage</a>
</p>

---
