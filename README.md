<p align="center">
  <a href="https://castjs.com/"><img src="https://i.imgur.com/ZjTpQ3S.png" alt="Castjs" width="100%"></a>
</p>

<p align="center">
  <b>Cast video to any Chromecast, straight from the browser.</b><br>
  A tiny wrapper around the Google Cast SDK with simple methods and events.
</p>

<p align="center">
  <a href="https://github.com/castjs/castjs/releases"><img src="https://img.shields.io/github/v/release/castjs/castjs?label=version&color=185FA5" alt="Version"></a>
  <a href="https://www.jsdelivr.com/package/gh/castjs/castjs"><img src="https://data.jsdelivr.com/v1/package/gh/castjs/castjs/badge?style=rounded" alt="jsDelivr"></a>
  <img src="https://img.shields.io/badge/size-~15kb-0F6E56" alt="Size">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/castjs/castjs?color=185FA5" alt="License"></a>
</p>

<p align="center">
  <a href="https://castjs.com/"><b>Live demo</b></a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#api">API</a> ·
  <a href="#queue">Queue</a> ·
  <a href="#faq">FAQ</a>
</p>

<p align="center">
  <a href="https://castjs.com/"><img src="https://i.imgur.com/vDdyBwj.png" alt="Castjs demo" width="100%"></a>
</p>

---

## Features

<table>
  <tr>
    <td>✅ Subtitles with custom styling</td>
    <td>✅ Playlists and queues</td>
  </tr>
  <tr>
    <td>✅ MP4, WebM, HLS, DASH and audio</td>
    <td>✅ Live streams</td>
  </tr>
  <tr>
    <td>✅ Custom receivers and custom data</td>
    <td>✅ Resumes sessions after a page reload</td>
  </tr>
  <tr>
    <td>✅ One class, simple events</td>
    <td>✅ Zero dependencies</td>
  </tr>
</table>

---

## Quick start

**1. Add the script**

```html
<script src="https://cdn.jsdelivr.net/gh/castjs/castjs@v7.3.0/cast.min.js"></script>
```

**2. Create an instance**

```js
const cjs = new Castjs();
```

**3. Cast on click**

```js
document.getElementById('cast').addEventListener('click', () => {
  if (cjs.available()) {
    cjs.cast('https://www.peach.themazzone.com/durian/movies/sintel-1024-surround.mp4', {
      title: 'Sintel',
      poster: 'https://castjs.com/media/poster.jpg'
    });
  }
});
```

> [!NOTE]
> Your page needs **HTTPS** (or `localhost`) and your media needs **CORS** enabled (`Access-Control-Allow-Origin: *`).
> The Google Cast framework (`cast_sender.js`) is loaded automatically.

---

## Supported browsers

Works in Chromium-based browsers: **Chrome**, **Edge**, **Opera**, **Brave** and **Vivaldi**, on desktop and Android.
Firefox and Safari don't support Google Cast; Castjs fires an `error` event there so you can hide your cast button.

---

## API

### Options

```js
const cjs = new Castjs({
  receiver: 'CC1AD845',                // default media receiver
  joinpolicy: 'tab_and_origin_scoped', // 'tab_and_origin_scoped' | 'origin_scoped' | 'page_scoped'
  language: 'nl-NL',                   // cast dialog language, defaults to the browser language
  debug: true                          // debug logs
});
```

### Methods

```js
cjs.cast(src, metadata)     // start casting
cjs.play()                  // resume playback
cjs.pause()                 // pause playback
cjs.disconnect()            // end the session

cjs.time(120)               // seek to 2:00
cjs.volume(0.5)             // set volume (0 → 1)
cjs.muted(true)             // mute / unmute

cjs.subtitle(0)             // switch subtitle by index
cjs.subtitle(-1)            // subtitles off

cjs.queue(items, options)   // cast a playlist (see Queue)
cjs.next()                  // next queue item
cjs.prev()                  // previous queue item
cjs.index(2)                // jump to queue item 2
```

### Events

```js
cjs.on('available',      () => {})  // Cast framework is ready
cjs.on('connect',        () => {})  // connected to a device
cjs.on('disconnect',     () => {})  // session ended

cjs.on('statechange',    () => {})  // player state changed
cjs.on('playing',        () => {})  // media is playing
cjs.on('pause',          () => {})  // media is paused
cjs.on('buffering',      () => {})  // buffering / seeking
cjs.on('end',            () => {})  // media ended

cjs.on('timeupdate',     () => {})  // current time changed
cjs.on('volumechange',   () => {})  // volume changed
cjs.on('mute',           () => {})  // muted
cjs.on('unmute',         () => {})  // unmuted
cjs.on('subtitlechange', () => {})  // active subtitle changed
cjs.on('queuechange',    () => {})  // queue loaded or current item changed

cjs.on('event',          (e) => {}) // every event except 'error'
cjs.on('error',          (e) => {}) // errors
```

### Getters

```js
cjs.available()      // boolean, Cast is ready
cjs.connected()      // boolean, connected to a device
cjs.device()         // device name
cjs.state()          // current state
cjs.paused()         // boolean

cjs.src()            // media URL
cjs.title()          // media title
cjs.description()    // media description
cjs.poster()         // poster URL
cjs.subtitles()      // subtitle tracks
cjs.progress()       // progress (0 → 100)

cjs.volume()         // volume (0 → 1)
cjs.muted()          // boolean
cjs.time()           // current time in seconds
cjs.time(true)       // formatted time ("01:23")
cjs.duration()       // duration in seconds
cjs.duration(true)   // formatted duration

cjs.queue()          // queue items
cjs.index()          // current queue index (-1 without a queue)
```

### Metadata

```js
cjs.cast('https://example.com/video.mp4', {
  title: 'My video',
  description: 'Optional description',
  poster: 'https://example.com/poster.jpg',
  time: 30,                    // start position in seconds
  paused: false,

  type: 'video/mp4',           // content type, guessed from the extension when omitted
                               // e.g. 'application/x-mpegurl' (HLS) or 'application/dash+xml' (DASH)
  live: false,                 // true for live streams
  data: { token: 'abc' },      // custom data for your receiver

  subtitles: [{
    label: 'English',
    src: 'https://example.com/en.vtt',
    subtype: 'SUBTITLES',      // SUBTITLES | CAPTIONS | DESCRIPTIONS | CHAPTERS | METADATA
    active: true
  }],

  // optional, Netflix-style defaults are already applied
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

---

## Queue

Every item takes the same fields as the `cast()` metadata, plus `src`.

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
  repeat: false,               // true loops the queue
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

<details>
<summary><b>Can I cast local files?</b></summary>
<br>
No. It used to work with service workers, but Google dropped support. See <a href="https://github.com/fenny/chromecast-service-worker-crash">this issue</a>.
</details>

<details>
<summary><b>Can I list the available devices and pick one myself?</b></summary>
<br>
No. The Cast SDK only lets the browser show its own device picker, <code>cjs.cast()</code> opens it.
</details>

<details>
<summary><b>Does it work in Firefox or Safari?</b></summary>
<br>
No, they don't support Google Cast. Castjs fires an <code>error</code> event so you can hide your cast button.
</details>

<details>
<summary><b>Do I need to enable CORS?</b></summary>
<br>
Yes, Chromecast is strict about CORS. <code>Access-Control-Allow-Origin: *</code> is the simplest solution, or allow the <code>CrKey</code> user-agent to be more specific.
</details>

<details>
<summary><b>My HLS or DASH stream doesn't play</b></summary>
<br>
Castjs guesses the content type from the file extension. If your URL has no <code>.m3u8</code> or <code>.mpd</code> extension, pass it yourself: <code>type: 'application/x-mpegurl'</code>.
</details>

---

<p align="center">
  Like Castjs? <a href="https://www.buymeacoffee.com/fenny">☕ Buy me a hot beverage</a><br>
  <sub>MIT licensed</sub>
</p>
