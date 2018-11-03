# ChromecastJS

<img src="https://i.imgur.com/uI4i1m5.png" align="right"
     title="Chromecast Javascript Wrapper" width="400" height="125">

ChromecastJS is a javascript wrapper arround the complex chromecast SDK. (6.36 KB minified)!
This wrapper provides simple events and functions to communicate easily with any chromecast.

https://fenny.github.io/ChromecastJS/demo/index.html

## Initialize
```javascript
// Initialize ChromecastJS Object

// receiverApplicationId:
// chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID      [DEFAULT]

// autoJoinPolicy:
// chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
// chrome.cast.AutoJoinPolicy.PAGE_SCOPED
// chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED     [DEFAULT]

//       new ChromecastJS(autoJoinPolicy, receiverApplicationId)
var cc = new ChromecastJS()

cc.on('available', function() {
    // Chromecast is found on the network
})
cc.on('connected', function() {
    // Connected with the chromecast
})
cc.on('media', function(media) {
    // Media changed or loaded, contains media object
    // {
    //     content:     'http://127.0.0.1/video.mp4',
    //     poster:      'http://127.0.0.1/poster.jpg',
    //     title:       'Video Title',
    //     description: 'Me playing with the dog',
    //     subtitles:   [],
    //     time:        4.53,
    //     duration:    887.99,
    //     volume:      0.18,
    //     muted:       false,
    //     paused:      false,
    //     state:       'PLAYING'
    // }
})
cc.on('playOrPause', function(paused) {
    // Media resumed or got paused, returns boolean
    // paused: false
})
cc.on('muteOrUnmute', function(muted) {
    // Media muted or unmuted, returns boolean
    // muted: false
})
cc.on('volume', function(volume) {
    // Media volume changed, returns int
    // volume: 0.18
})
cc.on('state', function(state) {
    // Chromecast state changed, returns string
    // state: 'BUFFERING'

    // Available states are:
    // IDLE, PLAYING, PAUSED, BUFFERING, DISCONNECTED
})
cc.on('time', function(time) {
    // Media time or duration changed, returns object
    // {
    //    progress: 45,
    //    time: 00:03:45,
    //    duration: 00:11:23
    // }
})
cc.on('disconnect', function() {
    // Chromecast session is disconnected
})
cc.on('error', function(err) {
    // Any error occured, returns string
    // 'cast() No media content specified.'
})
```
## Cast function
```javascript
// Cast media to the chromecast, initialize the media object
var media = {
    // Only the actual content key is required
    content:     'http://127.0.0.1/video.mp4',
    // Everything below is optional
    poster:      'http://127.0.0.1/poster.jpg',
    title:       'Video Title',
    description: 'Me playing with the dog',
    subtitles: [{
        active: true,
        label: 'English',
        srclang: 'gb',
        src: 'http://127.0.0.1/gb.vtt'
    }, {
        label: 'French',
        srclang: 'fr',
        src: 'http://127.0.0.1/fr.vtt'
    }],
    time:        4.53,
    volume:      0.18,
    muted:       false,
    paused:      false,
}
// Pass the media object to the cast function
document.getElementById('CastButton').addEventListener('click', function() {
  cc.cast(media)
})
```
## Control functions
```javascript
cc.seek(25)              // Change the media time
cc.changeSubtitle(1)     // Change subtitle by index during casting 0,1,2...subtitles.length
cc.volume(0.5)           // Change volume *1 means 100% TV volume, you have been warned*
cc.playOrPause()         // Switch pause / play
cc.muteOrUnmute()        // Switch mute / unmute
cc.disconnect()          // Disconnect chromecast session
```
# Help us to improve this library and make it a solid wrapper, I respond to issues or pull request within 1 hour!
