# ChromecastJS
Javascript wrapper for the Chromecast SDK

Hi my name is Fenny and I created this wrapper to make is easier to cast media to any chromecast inside the browser.
It supports all features the google SDK has to offer:
Cast, many events, seeking, changing subtitles, volume, play/pause, mute/unmute, disconnect etc

Help me to improve this library and make it a solid wrapper, I respond to issues or pull request within 1 hour.
Enjoy!

## Init
```javascript
// Init the ChromecastJS function, you can define your own join_policy and receiver_app_id.
var cc = new ChromecastJS()
var cc = new ChromecastJS(chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED, chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID)
// AutoJoinPolicy:
// chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
// chrome.cast.AutoJoinPolicy.PAGE_SCOPED
// chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED // Default
```
## Functions
#### .cast(media)
```javascript
//Cast media to the chromecast, make sure you use full paths and CORS is enabled
var media = {
  content: 'http://127.0.0.1/movie.mp4',
  poster: 'http://127.0.0.1/poster.jpg',
  title: 'Movie title',
  description: 'Action / Drama',
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
  time: 0,
  paused: false
}
cc.cast(media)
cc.cast(media, function() {
  console.log('Playing!')
})
```
#### .seek(time)
```javascript
cc.seek(20)
```
#### .changeSubtitle(index)
```javascript
cc.changeSubtitle(2)
```
#### .volume(volume)
```javascript
cc.volume(0.3)
```
#### .playOrPause()
```javascript
cc.playOrPause()
```
#### .muteOrUnmute()
```javascript
cc.muteOrUnmute()
```
#### .disconnect()
```javascript
cc.disconnect()
```
## Events
#### available
```javascript
//There is a chromecast detected on the network
cc.on('available', function() {
  console.log('chromecast is available')
})
```
#### connected
```javascript
//We got are now connected with the chromecast
cc.on('connected', function() {
  console.log('connected with chromecast')
})
```
#### media
```javascript
//When media is loaded or changed on the chromecast
cc.on('media', function(media) {
  console.log('media changed:', media)
})
```
#### playOrPause
```javascript
//When media is played or paused will trigger this event and callback the paused boolean
cc.on('playOrPause', function(paused) {
  console.log('playorpause:', paused)
})
```
#### muteOrUnmute
```javascript
//When media is mute or unmuted will trigger this event and callback the muted boolean
cc.on('muteOrUnmute', function(muted) {
  console.log('muteOrUnmute:', muted)
})
```
#### volume
```javascript
//When volume is changed will trigger this event and callback the volume int value
cc.on('volume', function(volume) {
  console.log('volume:', volume)
})
```
#### state
```javascript
//When the state is changed returns state string value
cc.on('state', function(state) {
  console.log('state:', state)
})
// Playerstates:
// IDLE
// PLAYING
// PAUSED
// BUFFERING
// DISCONNECTED
```
#### time
```javascript
//When there is a time or duration change, will return a object with details
cc.on('time', function(time) {
  console.log('time:', time)
})
// Object:
//  {
//    progress: 45,
//    time: 00:03:45,
//    duration: 00:11:23
/  }
```
#### disconnect
```javascript
//When a session is disconnected
cc.on('disconnect', function() {
  console.log('disconnected')
})
```
#### error
```javascript
//Catch any error
cc.on('error', function(err) {
  console.log('error:', err)
})
```
