class Castjs {
  // Main variables
  constructor(receiver, joinpolicy) {
    var joinpolicies = [
      'tab_and_origin_scoped',
      'origin_scoped',
      'page_scoped'
    ];
    // Doesn't matter in what order arguments are given
    if (receiver && receiver.indexOf(joinpolicies) === -1) {
      var tmp     = joinpolicy;
      joinpolicy  = receiver;
      receiver    = tmp;
    }
    // Application variables
    this.events         = {};
    this.receiver       = receiver    || 'CC1AD845';
    this.joinpolicy     = joinpolicy  || 'tab_and_origin_scoped';
    this.available      = false;
    this.player         = null;
    this.controller     = null;
    this.session        = null;
    this.device         = null;
    // Media variables
    this.source         = null;
    this.title          = null;
    this.description    = null;
    this.poster         = null;
    this.subtitles      = [];
    this.volumeLevel    = 1;
    this.muted          = false;
    this.paused         = false;
    this.time           = 0;
    this.timePretty     = '00:00:00';
    this.duration       = 0;
    this.durationPretty = '00:00:00';
    this.progress       = 0;
    this.state          = 'disconnected';
    var interval = setInterval(() => {
      // Casting only works on chrome, opera, brave and vivaldi
      if (!window.chrome) {
        clearInterval(interval);
        return this.trigger('error', 'Casting is not available');
      }
      if (window.chrome.cast && window.chrome.cast.isAvailable) {
        clearInterval(interval);
        // Set cast options
        cast.framework.CastContext.getInstance().setOptions({
          receiverApplicationId:  this.receiver,
          autoJoinPolicy:         this.joinpolicy,
          language:               this.language,
          resumeSavedSession:     this.resume
        });
        // Create controller
        this.player     = new cast.framework.RemotePlayer();
        this.controller = new cast.framework.RemotePlayerController(this.player);
        // Register callback events
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
    }, 250);
  };
  // Player controller events
  controller_isConnectedChanged() {
    // Weird bug, need to skip a tick...
    setTimeout(() => {
      // Check if we have a running session
      this.session = this.player.isConnected
      if (!this.session) {
        return;
      }
      // Return if no media is loaded, nothing to update
      if (!this.player.isMediaLoaded) {
        return;
      }
      // Set device name
      this.device = cast.framework.CastContext.getInstance().getCurrentSession().getCastDevice().friendlyName;
      // Update media variables
      this.source         = this.player.mediaInfo.contentId;
      this.title          = this.player.title                       || null;
      this.description    = this.player.mediaInfo.metadata.subtitle || null;
      this.poster         = this.player.imageUrl                    || null;
      this.subtitles      = [];
      this.volumeLevel    = this.player.volumeLevel;
      this.muted          = this.player.isMuted;
      this.paused         = this.player.isPaused;
      this.time           = this.player.currentTime;
      this.timePretty     = this.controller.getFormattedTime(this.player.currentTime);
      this.duration       = this.player.duration;
      this.durationPretty = this.controller.getFormattedTime(this.player.duration);
      this.progress       = this.controller.getSeekPosition(this.player.currentTime, this.player.duration);
      this.state          = this.player.playerState.toLowerCase();
      // Loop over the subtitle tracks
      for (var i in this.player.mediaInfo.tracks) {
        // Check for subtitle
        if (this.player.mediaInfo.tracks[i].type === 'TEXT') {
          // Push to media subtitles array
          this.subtitles.push({
            label:  this.player.mediaInfo.tracks[i].name,
            source:    this.player.mediaInfo.tracks[i].trackContentId
          })
        }
      }
      // Get the active subtitle
      var active = cast.framework.CastContext.getInstance().getCurrentSession().getSessionObj().media[0].activeTrackIds;
      if (active.length && this.subtitles[active[0]]) {
        this.subtitles[active[0]].active = true;
      }
      // Trigger session event
      this.trigger('session');
    })
  };
  controller_currentTimeChanged() {
    this.time           = this.player.currentTime;
    this.duration       = this.player.duration;
    this.progress       = this.controller.getSeekPosition(this.time, this.duration);
    this.timePretty     = this.controller.getFormattedTime(this.time);
    this.durationPretty = this.controller.getFormattedTime(this.duration);
    this.trigger('timeupdate');
  };
  controller_durationChanged() {
    this.duration = this.player.duration;
  };
  controller_volumeLevelChanged() {
    this.volumeLevel = this.player.volumeLevel;
    this.trigger('volumechange');
  };
  controller_isMutedChanged() {
    this.muted = this.player.isMuted;
    this.trigger('muted');
  };
  controller_isPausedChanged() {
    this.paused = this.player.isPaused;
    this.trigger('paused');
  };
  controller_playerStateChanged(){
    this.state = this.player.playerState.toLowerCase();
    if (this.state === 'idle') {
      this.trigger('ended')
    }
    this.trigger('statechange');
  };
  // Class functions
  on(event, fn) {
    // If event is not registered, create array to store callbacks
    if (!this.events[event]) {
      this.events[event] = [];
    }
    // Push callback into event array
    this.events[event].push(fn);
  };
  off(event, fn) {
    // If no event name was given, reset all events
    if (!event) {
      return this.events = {}
    }
    // If event does not exist, do nothing
    if (!this.events[event]) {
      return;
    }
    // If no function exist, remove all callbacks f event
    if (typeof fn === 'undefined') {
      return this.events[event] = [];
    }
    // If event name and function exist, remove callback
    for (var i in this.events[event]) {
      if (this.events[event][i] === fn) {
        this.events[event].splice(i, 1);
        break;
      }
    }
  };
  trigger(event) {
    // Slice arguments into array
    var tail = Array.prototype.slice.call(arguments, 1)
    // If event exist, call callback with callback data
    for (var i in this.events[event]) {
      this.events[event][i].apply(this, tail);
    }
    // any callback
    for (var i in this.events['any']) {
      this.events['any'][i].apply(this, [event]);
    }
  };
  cast(source, metadata = {}) {
    // We need a source! Don't forget to enable CORS
    if (!source) {
      return this.trigger('error', 'No media source specified.');
    }
    metadata.source = source;
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
      var mediaInfo       = new chrome.cast.media.MediaInfo(this.source);
      mediaInfo.metadata  = new chrome.cast.media.GenericMediaMetadata();
      // This part is the reason why people love this library <3
      if (this.subtitles.length) {
        // I'm using the Netflix subtitle styling, never had complains
        mediaInfo.textTrackStyle                  = new chrome.cast.media.TextTrackStyle();
        mediaInfo.textTrackStyle.backgroundColor  = '#00000000';
        mediaInfo.textTrackStyle.edgeColor        = '#00000016';
        mediaInfo.textTrackStyle.edgeType         = chrome.cast.media.TextTrackEdgeType.DROP_SHADOW;
        mediaInfo.textTrackStyle.fontFamily       = chrome.cast.media.TextTrackFontGenericFamily.CASUAL;
        mediaInfo.textTrackStyle.fontScale        = 1.0;
        mediaInfo.textTrackStyle.foregroundColor  = '#FFFFFF';

        var tracks = [];
        for (var i in this.subtitles) {
          var track = new chrome.cast.media.Track(i, chrome.cast.media.TrackType.TEXT);
          track.name              = this.subtitles[i].label;
          track.subtype           = chrome.cast.media.TextTrackType.CAPTIONS;
          track.trackContentId    = this.subtitles[i].source;
          track.trackContentType  = 'text/vtt'
          // This bug made me question life for a while
          track.trackId           = parseInt(i);
          track.type              = chrome.cast.media.TrackType.TEXT;
          tracks.push(track);
        }
        mediaInfo.tracks = tracks;
      }
      // Let's prepare the metadata
      mediaInfo.metadata.images   = [new chrome.cast.Image(this.poster)];
      mediaInfo.metadata.title    = this.title;
      mediaInfo.metadata.subtitle = this.description;
      // Prepare the actual request
      var request = new chrome.cast.media.LoadRequest(mediaInfo);
      // Didn't really test this currenttime thingy, dont forget
      request.currentTime = this.time;
      request.autoplay    = !this.paused;
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
        this.device = cast.framework.CastContext.getInstance().getCurrentSession().getCastDevice().friendlyName;
        this.trigger('session');
        return this;
      }, (err) => {
        this.trigger('error', err);
        return this;
      })
    }, (err) => {
      this.trigger('error', err)
      return this;
    })
  };
  seek(seconds, percentage) {
    // if seek(15, true) we assume 15 is percentage instead of seconds
    if (percentage) {
      seconds = this.controller.getSeekTime(seconds, this.player.duration);
    }
    this.player.currentTime = seconds;
    this.controller.seek();
    return this;
  };
  volume(float) {
    this.player.volumeLevel = float;
    this.controller.setVolumeLevel();
    return this;
  };
  play() {
    if (this.paused) {
      this.controller.playOrPause();
    }
    return this;
  };
  pause() {
    if (!this.paused) {
      this.controller.playOrPause();
    }
    return this;
  };
  mute() {
    if (this.muted === false) {
      this.controller.muteOrUnmute();
    }
    return this;
  };
  unmute() {
    if (this.muted === true) {
      this.controller.muteOrUnmute();
    }
    return this;
  };
  subtitle(index) {
    // Another function why people love this library <3
    var request = new chrome.cast.media.EditTracksInfoRequest([parseInt(index)]);
    cast.framework.CastContext.getInstance().getCurrentSession().getSessionObj().media[0].editTracksInfo(request, () => {
      for (var i in this.subtitles) {
        delete this.subtitles[i].active;
        if (i == index) {
          this.subtitles[i].active = true;
        }
      }
      return this;
    }, (err) => {
      this.trigger('error', err)
    });
  };
  disconnect() {
    // Terminate session
    cast.framework.CastContext.getInstance().endCurrentSession(true);
    this.controller.stop();
    // Reset some variables
    this.session              = false;
    this.source         = null;
    this.title          = null;
    this.description    = null;
    this.poster         = null;
    this.subtitles      = [];
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
  };
  // Todo: custom receiver messaging
  // message = () => {};
}
