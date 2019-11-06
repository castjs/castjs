class Castjs {
  // Main variables
  constructor(receiver, options = {}) {
    // Casting only works on chrome, opera, brave and vivaldi
    if (!window.chrome) {
      return console.warn('Castjs: Casting is not supported in this browser');
    }
    // If no receiver is specified
    if (typeof receiver === 'object') {
      options = receiver;
      receiver = null;
    }
    // Set main variables
    this.receiver   = receiver            || 'CC1AD845';
    this.joinpolicy = options.joinpolicy  || 'tab_and_origin_scoped';
    this.language   = options.language    || null;
    this.resume     = options.resume      || true;
    this.available  = false;
    this.session    = null;
    this.device     = null;
    this.player     = null;
    this.controller = null;
    this.events     = {};
    this.template   = {
      source:       null,
      poster:       null,
      title:        null,
      description:  null,
      subtitles:    [],
      volume:       1,
      muted:        false,
      paused:       false,
      progress:     0,
      time:         '00:00:00',
      duration:     '00:00:00',
      state:        'disconnected'
    };
    this.media = Object.assign({}, this.template);
    // Wait for sender SDK
    var interval = setInterval(() => {
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
      // Update media object
      this.media = {
        source:       this.player.mediaInfo.contentId,
        poster:       this.player.imageUrl || null,
        title:        this.player.title || null,
        description:  this.player.mediaInfo.metadata.subtitle || null,
        subtitles:    [], // We update this later
        progress:     this.controller.getSeekPosition(this.player.currentTime, this.player.duration),
        time:         this.controller.getFormattedTime(this.player.currentTime),
        duration:     this.controller.getFormattedTime(this.player.duration),
        volume:       this.player.volumeLevel,
        muted:        this.player.isMuted,
        paused:       this.player.isPaused,
        state:        this.player.playerState.toLowerCase()
      }
      // Loop over the subtitle tracks
      for (var i in this.player.mediaInfo.tracks) {
        // Check for subtitle
        if (this.player.mediaInfo.tracks[i].type === 'TEXT') {
          // Push to media subtitles array
          this.media.subtitles.push({
            label:  this.player.mediaInfo.tracks[i].name,
            src:    this.player.mediaInfo.tracks[i].trackContentId
          })
        }
      }
      // Get the active subtitle
      var active = cast.framework.CastContext.getInstance().getCurrentSession().getSessionObj().media[0].activeTrackIds;
      if (active.length && this.media.subtitles[active[0]]) {
        this.media.subtitles[active[0]].active = true;
      }
      // Trigger session event
      this.trigger('session');
    })
  };
  controller_currentTimeChanged() {
    this.media.progress = this.controller.getSeekPosition(this.player.currentTime, this.player.duration);
    this.media.time     = this.controller.getFormattedTime(this.player.currentTime);
    this.media.duration = this.controller.getFormattedTime(this.player.duration);
    this.trigger('time', {
      progress: this.media.progress,
      time:     this.media.time,
      duration: this.media.duration
    });
    if (this.media.progress >= 100) {
      this.trigger('end');
      this.disconnect();
    }
  };
  controller_durationChanged() {
    this.media.duration = this.player.duration;
  };
  controller_volumeLevelChanged() {
    this.media.volume = this.player.volumeLevel;
    this.trigger('volume', this.media.volume);
  };
  controller_isMutedChanged() {
    this.media.muted = this.player.isMuted;
    this.trigger('muted', this.media.muted);
  };
  controller_isPausedChanged() {
    this.media.paused = this.player.isPaused;
    this.trigger('pause', this.media.paused);
  };
  controller_playerStateChanged(){
    this.media.state = this.player.playerState.toLowerCase();
    if (this.media.state === 'idle') {
      this.media.state = 'disconnected';
    }
    this.trigger('state', this.media.state);
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
  trigger(event, data) {
    // If event exist, call callback with callback data
    for (var i in this.events[event]) {
      this.events[event][i](data);
    }
    // any callback
    for (var i in this.events['any']) {
      this.events['any'][i](event);
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
        this.media[key] = metadata[key];
      }
    }
    // Time to request a session!
    cast.framework.CastContext.getInstance().requestSession().then(() => {
      if (!cast.framework.CastContext.getInstance().getCurrentSession()) {
        return this.trigger('error', 'Could not connect with the cast device');
      }
      // Create media cast object
      var mediaInfo       = new chrome.cast.media.MediaInfo(this.media.source);
      mediaInfo.metadata  = new chrome.cast.media.GenericMediaMetadata();
      // This part is the reason why people love this library <3
      if (this.media.subtitles.length) {
        // I'm using the Netflix subtitle styling, never had complains
        mediaInfo.textTrackStyle                  = new chrome.cast.media.TextTrackStyle();
        mediaInfo.textTrackStyle.fontFamily       = 'Arial';
        mediaInfo.textTrackStyle.foregroundColor  = '#FFFFFF';
        mediaInfo.textTrackStyle.backgroundColor  = '#00000000';
        mediaInfo.textTrackStyle.fontScale        = '1.1';
        mediaInfo.textTrackStyle.edgeColor        = '#00000099';
        mediaInfo.textTrackStyle.edgeType         = 'DROP_SHADOW';
        var tracks = [];
        for (var i in this.media.subtitles) {
          var track = new chrome.cast.media.Track(i, 'TEXT');
          track.trackContentId    = this.media.subtitles[i].src;
          track.trackContentType  = 'text/vtt';
          track.subtype           = 'CAPTIONS';
          track.name              = this.media.subtitles[i].label
          tracks.push(track);
        }
        mediaInfo.tracks = tracks;
      }
      // Let's prepare the metadata
      mediaInfo.metadata.images   = [{ url: this.media.poster }];
      mediaInfo.metadata.title    = this.media.title;
      mediaInfo.metadata.subtitle = this.media.description;
      // Prepare the actual request
      var request = new chrome.cast.media.LoadRequest(mediaInfo);
      // Didn't really test this currenttime thingy, dont forget
      request.currentTime = this.media.time;
      request.autoplay    = !this.media.paused;
      // If multiple subtitles, use the active: true one
      if (this.media.subtitles.length) {
        for (var i in this.media.subtitles) {
          if (this.media.subtitles[i].active) {
            request.activeTrackIds = [i];
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
  seek(percentage) {
    this.player.currentTime = this.controller.getSeekTime(percentage, this.player.duration);
    this.controller.seek();
    return this;
  };
  volume(float) {
    this.player.volumeLevel = float;
    this.controller.setVolumeLevel();
    return this;
  };
  play() {
    if (this.media.paused) {
      this.controller.playOrPause();
    }
    return this;
  };
  pause() {
    if (!this.media.paused) {
      this.controller.playOrPause();
    }
    return this;
  };
  mute(bool) {
    // Brainfart, this could be cleaner code
    if (bool === true && this.media.muted === false) {
      this.controller.muteOrUnmute();
    } else if (bool === false && this.media.muted === true) {
      this.controller.muteOrUnmute();
    }
    return this;
  };
  subtitle(index) {
    // Another function why people love this library <3
    var request = new chrome.cast.media.EditTracksInfoRequest([index]);
    cast.framework.CastContext.getInstance().getCurrentSession().getSessionObj().media[0].editTracksInfo(request, null, null);
    for (var i in this.media.subtitles) {
      delete this.media.subtitles[i].active;
      if (i === index) {
        this.media.subtitles[i].active = true;
      }
    }
    return this;
  };
  disconnect() {
    // Terminate session
    cast.framework.CastContext.getInstance().endCurrentSession(true);
    this.controller.stop();
    // Reset some variables
    this.media                = Object.assign({}, this.template);
    this.session              = false;
    this.media.state          = 'disconnected';
    this.trigger('disconnect');
    return this;
  };
  // Todo: custom receiver messaging
  // message = () => {};
}
