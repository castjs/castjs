'use strict';
// v1.0
class Castjs {
  constructor(options = {}) {
    if (!(this instanceof Castjs)) {
      console.warn('Castjs: don\'t invoke Castjs without \'new\'');
      return new Castjs(options);
    }
    this.receiver   = options.receiver   || 'CC1AD845';
    this.joinpolicy = options.joinpolicy || 'origin_scoped';
    this.available  = false;
    this.connected  = false;
    this.player     = null;
    this.controller = null;
    this.events     = {};
    self.template   = {
      source:       null,
      poster:       null,
      title:        null,
      description:  null,
      subtitles:    [],
      progress:     0,
      time:         0,
      duration:     0,
      volume:       0.3,
      muted:        false,
      paused:       false,
      state:        'disconnected'
    };
    this.media = Object.assign({}, self.template);
    this.scanner();
  };
  // Init functions
  scanner = () => {
    // Casting only works on chrome, opera, brave and vivaldi
    if (!window.chrome) {
      return console.warn('Castjs: Casting is not supported in this browser')
    }
    // Check if sender SDK is loaded and if there is a receiver available
    var interval = setInterval(() => {
      if (window.chrome.cast && window.chrome.cast.isAvailable) {
        clearInterval(interval);
        this.init();
      }
    }, 250)
  };
  init = () => {
    // Set cast options
    cast.framework.CastContext.getInstance().setOptions({
      receiverApplicationId:  this.receiver,
      autoJoinPolicy:         this.joinpolicy
    });
    // Create controller
    this.player     = new cast.framework.RemotePlayer();
    this.controller = new cast.framework.RemotePlayerController(this.player);
    // Register callback events
    this.controller.addEventListener('isConnectedChanged',  this.isConnectedChanged);
    this.controller.addEventListener('currentTimeChanged',  this.currentTimeChanged);
    this.controller.addEventListener('durationChanged',     this.durationChanged);
    this.controller.addEventListener('volumeLevelChanged',  this.volumeLevelChanged);
    this.controller.addEventListener('isMutedChanged',      this.isMutedChanged);
    this.controller.addEventListener('isPausedChanged',     this.isPausedChanged);
    this.controller.addEventListener('playerStateChanged',  this.playerStateChanged);
    this.available = true;
    this.trigger('available')
  };
  // Controller events
  isConnectedChanged  = () => {
    // Weird bug, need to skip a tick...
    setTimeout(() => {
      // Check if we are connected
      this.connected = this.player.isConnected
      if (!this.connected) {
        return;
      }
      this.trigger('connected')
      // Return if no media is loaded, nothing to update
      if (!this.player.isMediaLoaded) {
        return;
      }
      // Update media object
      this.media = {
        src:          this.player.mediaInfo.contentId,
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
      // Trigger session event with media object
      this.trigger('session', this.media)
    })
  };
  currentTimeChanged = () => {
    this.media.progress = this.controller.getSeekPosition(this.player.currentTime, this.player.duration);
    this.media.time     = this.controller.getFormattedTime(this.player.currentTime);
    this.media.duration = this.controller.getFormattedTime(this.player.duration);
    this.trigger('time', {
      progress: this.media.progress,
      time:     this.media.time,
      duration: this.media.duration
    })
    if (this.media.progress >= 100) {
      this.trigger('end');
      this.disconnect();
    }
  };
  durationChanged = () => {
    this.media.duration = this.player.duration;
  };
  volumeLevelChanged = () => {
    this.media.volume = this.player.volumeLevel;
    this.trigger('volume', this.media.volume);
  };
  isMutedChanged = () => {
    this.media.muted = this.player.isMuted;
    this.trigger('muted', this.media.muted);
  };
  isPausedChanged = () => {
    this.media.paused = this.player.isPaused;
    this.trigger('pause', this.media.paused);
  };
  playerStateChanged = () => {
    this.media.state = this.player.playerState.toLowerCase();
    if (this.media.state === 'idle') {
      this.media.state = 'disconnected';
    }
    this.trigger('state', this.media.state);
  };
  // Castjs methods
  on = (event, fn) => {
    // If event is not registered, create array to store callbacks
    if (!this.events[event]) {
      this.events[event] = [];
    }
    // Push callback into event array
    this.events[event].push(fn);
  };
  off = (event, fn) => {
    // If wildcard was given, reset all events
    if (!event) {
      return this.events = {}
    }
    // If event does not exist, do nothing
    if (!this.events[event]) {
      return;
    }
    // If no function or wildcard was given, we remove all callbacks for this event
    if (typeof fn === 'undefined' || fn === '*') {
      return this.events[event] = [];
    }
    // If event and function exist, remove it
    for (var i in this.events[event]) {
      if (this.events[event][i] === fn) {
        this.events[event].splice(i, 1);
        break;
      }
    }
  };
  trigger = (event, data) => {
    // If event exist, call callback with callback data
    for (var i in this.events[event]) {
      this.events[event][i](data);
    }
  };
  cast = (source, metadata = {}) => {
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
        this.trigger('connected');
        this.trigger('session', this.media);
      }, (err) => {
        this.trigger('error', err);
      })
    }, (err) => {
      this.trigger('error', err)
    })
  };
  seek = (percentage) => {
    this.player.currentTime = this.controller.getSeekTime(percentage, this.player.duration);
    this.controller.seek();
  };
  volume = (float) => {
    this.player.volumeLevel = float;
    this.controller.setVolumeLevel();
  };
  play = () => {
    if (this.media.paused) {
      this.controller.playOrPause();
    }
  };
  pause = () => {
    if (!this.media.paused) {
      this.controller.playOrPause();
    }
  };
  mute = (bool) => {
    // Brainfart, this could be cleaner code
    if (bool === true && this.media.muted === false) {
      this.controller.muteOrUnmute();
    } else if (bool === false && this.media.muted === true) {
      this.controller.muteOrUnmute();
    }
  };
  subtitle = (index) => {
    // Another function why people love this library <3
    var request = new chrome.cast.media.EditTracksInfoRequest([index]);
    cast.framework.CastContext.getInstance().getCurrentSession().getSessionObj().media[0].editTracksInfo(request, null, null);
    for (var i in this.media.subtitles) {
      delete this.media.subtitles[i].active;
      if (i === index) {
        this.media.subtitles[i].active = true;
      }
    }
  };
  disconnect = () => {
    // Terminate session
    cast.framework.CastContext.getInstance().endCurrentSession(true);
    this.controller.stop();
    // Reset some variables
    this.media                = Object.assign({}, self.template);
    this.connected            = false;
    this.media.state          = 'disconnected';
    this.trigger('disconnected');
  };
  // Todo: custom receiver messaging
  // message = () => {};
}
