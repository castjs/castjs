// load chromecast SDK
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'
document.getElementsByTagName('head')[0].appendChild(script);

// castjs class
class Castjs {
    // constructor takes optional options
    constructor(opt = {}) {
        // valid join policies
        var joinpolicies = [
            'custom_controller_scoped',
            'tab_and_origin_scoped',
            'origin_scoped',
            'page_scoped'
        ];

        // only allow valid join policy
        if (!opt.joinpolicies || joinpolicies.indexOf(opt.joinpolicy) === -1) {
            opt.joinpolicy = 'tab_and_origin_scoped';
        }

        // set default receiver ID if none provided
        if (!opt.receiver || opt.receiver === '') {
            opt.receiver = 'CC1AD845';
        }

        // application variables
        this.events     = {}
        this.receiver   = opt.receiver;
        this.joinpolicy = opt.joinpolicy;
        this.available  = false;
        this.connected  = false;
        this.player     = null;
        this.controller = null;
        this.device     = 'Chromecast';

        // media variables
        this.src         = ''
        this.title       = ''
        this.description = ''
        this.poster      = ''
        this.subtitles   = []

        // player variable
        this.volumeLevel    = 1;
        this.muted          = false;
        this.paused         = false;
        this.time           = 0;
        this.timePretty     = '00:00:00';
        this.duration       = 0;
        this.durationPretty = '00:00:00';
        this.progress       = 0;
        this.state          = 'disconnected';

        this.intervalIsAvailable = setInterval(() => {
            // casting only works on chrome, opera, brave and vivaldi
            if (!window.chrome) {
                clearInterval(this.intervalIsAvailable);
                return this.trigger('error', 'Casting is not available');
            }

            // wait for isAvailable boolean
            if (window.chrome.cast && window.chrome.cast.isAvailable) {
                // terminate loop
                clearInterval(this.intervalIsAvailable);

                // initialize cast API
                cast.framework.CastContext.getInstance().setOptions({
                    receiverApplicationId:  this.receiver,
                    autoJoinPolicy:         this.joinpolicy,
                });
                // create remote player controller
                this.player = new cast.framework.RemotePlayer();
                this.controller = new cast.framework.RemotePlayerController(this.player);

                // register callback events
                this.controller.addEventListener('isConnectedChanged',  this.controller_isConnectedChanged.bind(this));
                this.controller.addEventListener('currentTimeChanged',  this.controller_currentTimeChanged.bind(this));
                this.controller.addEventListener('durationChanged',     this.controller_durationChanged.bind(this));
                this.controller.addEventListener('volumeLevelChanged',  this.controller_volumeLevelChanged.bind(this));
                this.controller.addEventListener('isMutedChanged',      this.controller_isMutedChanged.bind(this));
                this.controller.addEventListener('isPausedChanged',     this.controller_isPausedChanged.bind(this));
                this.controller.addEventListener('playerStateChanged',  this.controller_playerStateChanged.bind(this));
                this.available = true;
                this.trigger('available');
            }
        }, 250); // update every 250ms
    }

    // Player controller events
    controller_isConnectedChanged() {
        // check if we have a running session
        this.connected = this.player.isConnected;
        if (!this.connected) {
            return;
        }
        // trigger connect event
        this.trigger('connect');

        // Weird bug, need to skip a tick...
        setTimeout(() => {
            // return if no media is loaded, nothing to update
            if (!this.player.isMediaLoaded) {
                return;
            }

            // Set device name
            this.device = cast.framework.CastContext.getInstance().getCurrentSession().getCastDevice().friendlyName || 'Chromecast'

            // Update media variables
            this.src                = this.player.mediaInfo.contentId;
            this.title              = this.player.mediaInfo.metadata.title || null;
            this.description        = this.player.mediaInfo.metadata.subtitle || null;
            this.poster             = this.player.imageUrl || null;
            this.subtitles          = [];
            this.volumeLevel        = this.player.volumeLevel;
            this.muted              = this.player.isMuted;
            this.paused             = this.player.isPaused;
            this.time               = this.player.currentTime;
            this.timePretty         = this.controller.getFormattedTime(this.player.currentTime);
            this.duration           = this.player.duration;
            this.durationPretty     = this.controller.getFormattedTime(this.player.duration);
            this.progress           = this.controller.getSeekPosition(this.player.currentTime, this.player.duration);
            this.state              = this.player.playerState.toLowerCase();

            // Loop over the subtitle tracks
            for (var i in this.player.mediaInfo.tracks) {
                // Check for subtitle
                if (this.player.mediaInfo.tracks[i].type === 'TEXT') {
                    // Push to media subtitles array
                    this.subtitles.push({
                        label: this.player.mediaInfo.tracks[i].name,
                        src:   this.player.mediaInfo.tracks[i].trackContentId
                    });
                }
            }
            // Get the active subtitle
            var active = cast.framework.CastContext.getInstance().getCurrentSession().getSessionObj().media[0].activeTrackIds;
            if (active.length && this.subtitles[active[0]]) {
                this.subtitles[active[0]].active = true;
            }

            // check when connection drops
            this.intervalIsConnected = setInterval(() => {
                this.connected = this.player.isConnected
                if (!this.connected) {
                    clearInterval(this.intervalIsConnected);
                    this.state = 'disconnected'
                    this.trigger('disconnect')
                    this.trigger('statechange')
                }
            }, 1000)
        }, 0);
    }
    controller_currentTimeChanged() {
        this.time           = this.player.currentTime;
        this.duration       = this.player.duration;
        this.progress       = this.controller.getSeekPosition(this.time, this.duration);
        this.timePretty     = this.controller.getFormattedTime(this.time);
        this.durationPretty = this.controller.getFormattedTime(this.duration);
        this.trigger('timeupdate');
    }
    controller_durationChanged() {
        this.duration = this.player.duration;
    }
    controller_volumeLevelChanged() {
        this.volumeLevel = this.player.volumeLevel;
        this.trigger('volumechange');
    }
    controller_isMutedChanged() {
        this.muted = this.player.isMuted;
        this.trigger('mute');
    }
    controller_isPausedChanged() {
        this.paused = this.player.isPaused;
        if (this.paused) {
            this.trigger('pause');
        }
    }
    controller_playerStateChanged() {
        this.connected = this.player.isConnected
        if (this.connected) {
            this.device = cast.framework.CastContext.getInstance().getCurrentSession().getCastDevice().friendlyName || 'Chromecast'
        }
        this.state = this.player.playerState.toLowerCase();
        if (this.state === 'idle') {
            this.state = 'ended'
            this.trigger('end');
        } else if (this.state === 'buffering') {
            this.trigger('buffering');
        } else if (this.state === 'playing') {
            this.trigger('playing')
        }
        
        this.trigger('statechange');
    }
    // Class functions
    on(event, cb) {
        // If event is not registered, create array to store callbacks
        if (!this.events[event]) {
            this.events[event] = [];
        }
        // Push callback into event array
        this.events[event].push(cb);
        return this
    }
    off(event) {
        if (!event) {
            // if no event name was given, reset all events
            this.events = {};
        } else if (this.events[event]) {
            // remove all callbacks from event
            this.events[event] = [];
        }
        return this
    }
    trigger(event) {
        // Slice arguments into array
        var tail = Array.prototype.slice.call(arguments, 1);
        // If event exist, call callback with callback data
        for (var i in this.events[event]) {
            this.events[event][i].apply(this, tail);
        }
        // dont call global event if error
        if (event === 'error') {
            return this
        }
        // call global event handler if exist
        for (var i in this.events['event']) {
            this.events['event'][i].apply(this, [event]);
        }
        return this
    }
    cast(src, metadata = {}) {
        // We need a source! Don't forget to enable CORS
        if (!src) {
            return this.trigger('error', 'No media source specified.');
        }
        metadata.src = src;
        // Update media variables with user input
        for (var key in metadata) {
            if (metadata.hasOwnProperty(key)) {
                this[key] = metadata[key];
            }
        }
        // Time to request a session!
        cast.framework.CastContext.getInstance().requestSession().then(() => {
            if (!cast.framework.CastContext.getInstance().getCurrentSession()) {
                return this.trigger('error', 'Could not connect with the cast device');
            }
            // Create media cast object
            var mediaInfo = new chrome.cast.media.MediaInfo(this.src);
            mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();

            // This part is the reason why people love this library <3
            if (this.subtitles.length) {
                // I'm using the Netflix subtitle styling
                // chrome.cast.media.TextTrackFontGenericFamily.CASUAL
                // chrome.cast.media.TextTrackEdgeType.DROP_SHADOW
                mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
                mediaInfo.textTrackStyle.backgroundColor = '#00000000';
                mediaInfo.textTrackStyle.edgeColor       = '#00000016';
                mediaInfo.textTrackStyle.edgeType        = 'DROP_SHADOW';
                mediaInfo.textTrackStyle.fontFamily      = 'CASUAL';
                mediaInfo.textTrackStyle.fontScale       = 1.0;
                mediaInfo.textTrackStyle.foregroundColor = '#FFFFFF';

                var tracks = [];
                for (var i in this.subtitles) {
                    // chrome.cast.media.TrackType.TEXT
                    // chrome.cast.media.TextTrackType.CAPTIONS
                    var track =  new chrome.cast.media.Track(i, 'TEXT');
                    track.name =             this.subtitles[i].label;
                    track.subtype =          'CAPTIONS';
                    track.trackContentId =   this.subtitles[i].src;
                    track.trackContentType = 'text/vtt';
                    // This bug made me question life for a while
                    track.trackId = parseInt(i);
                    tracks.push(track);
                }
                mediaInfo.tracks = tracks;
            }
            // Let's prepare the metadata
            mediaInfo.metadata.images =   [new chrome.cast.Image(this.poster)];
            mediaInfo.metadata.title =    this.title;
            mediaInfo.metadata.subtitle = this.description;
            // Prepare the actual request
            var request = new chrome.cast.media.LoadRequest(mediaInfo);
            // Didn't really test this currenttime thingy, dont forget
            request.currentTime = this.time;
            request.autoplay = !this.paused;
            // If multiple subtitles, use the active: true one
            if (this.subtitles.length) {
                for (var i in this.subtitles) {
                    if (this.subtitles[i].active) {
                        request.activeTrackIds = [parseInt(i)];
                        break;
                    }
                }
            }
            // Here we go!
            cast.framework.CastContext.getInstance().getCurrentSession().loadMedia(request).then(() => {
                // Set device name
                this.device = cast.framework.CastContext.getInstance().getCurrentSession().getCastDevice().friendlyName || 'Chromecast'

                // check when connection drops
                this.intervalIsConnected = setInterval(() => {
                    this.connected = this.player.isConnected
                    if (!this.connected) {
                        clearInterval(this.intervalIsConnected);
                        this.state = 'disconnected'
                        this.trigger('disconnect')
                        this.trigger('statechange')
                    }
                }, 1000)

                return this;
            }, (err) => {
                this.trigger('error', err);
                return this;
            });
        }, (err) => {
            if (err !== 'cancel') {
                this.trigger('error', err);
            }
            return this;
        });
    }
    seek(seconds, percentage) {
        // if seek(15, true) we assume 15 is percentage instead of seconds
        if (percentage) {
            seconds = this.controller.getSeekTime(seconds, this.player.duration);
        }
        this.player.currentTime = seconds;
        this.controller.seek();
        return this;
    }
    volume(float) {
        this.player.volumeLevel = float;
        this.controller.setVolumeLevel();
        return this;
    }
    play() {
        if (this.paused) {
            this.controller.playOrPause();
        }
        return this;
    }
    pause() {
        if (!this.paused) {
            this.controller.playOrPause();
        }
        return this;
    }
    mute() {
        if (this.muted === false) {
          this.controller.muteOrUnmute();
        }
        return this;
    }
    unmute() {
        if (this.muted === true) {
          this.controller.muteOrUnmute();
        }
        return this;
    }
    // subtitles allows you to change active subtitles while casting
    subtitles(index) {
        // this is my favorite part of castjs
        // prepare request to edit the tracks on current session
        var request = new chrome.cast.media.EditTracksInfoRequest([parseInt(index)]);
        cast.framework.CastContext.getInstance().getCurrentSession().getSessionObj().media[0].editTracksInfo(request, () => {
            // after updating the device we should update locally
            // loop trough subtitles
            for (var i in this.subtitles) {
                // remove active key from all subtitles
                delete this.subtitles[i].active;
                // if subtitle matches given index, we set to true
                if (i == index) {
                    this.subtitles[i].active = true;
                }
            }
            // return object
            return this;
        }, (err) => {
            // catch any error
            this.trigger('error', err);
        });
    }
    // disconnect will end the current session
    disconnect() {
        cast.framework.CastContext.getInstance().endCurrentSession(true);
        this.controller.stop();

        // application variables
        this.connected  = false;
        this.device     = 'Chromecast';

        // media variables
        this.src         = ''
        this.title       = ''
        this.description = ''
        this.poster      = ''
        this.subtitles   = []

        // player variable
        this.volumeLevel    = 1;
        this.muted          = false;
        this.paused         = false;
        this.time           = 0;
        this.timePretty     = '00:00:00';
        this.duration       = 0;
        this.durationPretty = '00:00:00';
        this.progress       = 0;
        this.state          = 'disconnected';


        this.trigger('disconnect');
        return this;
    }
}