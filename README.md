# ChromecastJS

<img src="https://i.imgur.com/uI4i1m5.png" align="right"
     title="Chromecast Javascript Wrapper" width="300" height="100">
DEMO: https://fenny.github.io/ChromecastJS/demo/index.html<br>
ChromecastJS is a javascript wrapper arround the complex chromecast SDK. (6.36 KB minified)!
This wrapper provides simple events and functions to communicate easily with any chromecast.

```javascript
// optional arguments: scope, receiverID
var cc = new ChromecastJS()

// Events
cc.on('available')      =>  		// cast extention is available
cc.on('connected')      => 		// connected to receiver
cc.on('media')          => obj 	        // media changed 
cc.on('playOrPause')    => boolean      // playing or paused
cc.on('muteOrUnmute')   => boolean      // mute or unmuted
cc.on('volume')         => string	// volume changed
cc.on('state')          => string	// playerstate changed
cc.on('time')           => obj	        // time changed { progress: 45, time: '00:03:45', duration: '00:11:23' }
cc.on('disconnect')     => 		// disconnected
cc.on('error')          => err	        // catch any error

// Cast object
var media = {
    content:     'http://127.0.0.1/video.mp4',
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

// Methods
cc.cast(media) 		// Cast media object, only content is required
cc.seek(25)           	// Seek media 'percentage'
cc.changeSubtitle(1)  	// Change subtitle 'index'
cc.volume(50)         	// Change volume 'percentage'
cc.playOrPause()      	// Toggle play or pause
cc.muteOrUnmute()	// Toggle mute or unmute
cc.disconnect()	    	// End session

// Variables
cc.Available 		// Boolean, if cast extention is available
cc.Connected 		// Boolean, if connected with receiver
cc.Media 		// Media object
cc.Media.content  	// String, content url
cc.Media.poster  	// String, poster url
cc.Media.title  	// String, title
cc.Media.description    // String, description
cc.Media.subtitles  	// Array, of subtitles
cc.Media.time  		// Float, current time
cc.Media.duration  	// Float, duration
cc.Media.volume  	// Float, volume
cc.Media.muted  	// Boolean, muted
cc.Media.paused 	// Boolean, paused
cc.Media.state  	// String, state of player
```

# Help us to improve this library and make it a solid wrapper, I respond to issues or pull request within 1 hour!
