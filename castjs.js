function CastJS (options = {}) {
  if (!(this instanceof CastJS)) {
    console.warn('don\'t invoke CastJS without \'new\'')
    return new CastJS(options)
  }
  var self        = this;
  self.receiver   = options.receiver    || 'CC1AD845';
  self.joinpolicy = options.joinpolicy  || 'origin_scoped';
  self.events     = [];
  self.available  = false;
  self.connected  = false;
  self.player     = null;
  self.controller = null;
  self.session    = null;
  self.media      = null;
  self.template   = {
    src:          null,
    poster:       null,
    title:        null,
    description:  null,
    subtitles:    [],
    progress:     0,
    time:         0,
    duration:     0,
    volume:       30,
    muted:        false,
    paused:       false
  }
  self.media      = Object.assign({}, self.template)
  self.state      = 'DISCONNECTED'
  if (window.chrome) {
    var interval = setInterval(function() {
      if (window.chrome.cast && window.chrome.cast.isAvailable) {
        clearInterval(interval);
        Init();
      }
    }, 250)
  }
  function Trigger(event, args) {
    if (self.events[event]) {
      self.events[event](args)
    }
  }
  function Init() {
    cast.framework.CastContext.getInstance().setOptions({
      receiverApplicationId:  self.receiver,
      autoJoinPolicy:         self.joinpolicy
    });
    self.player     = new cast.framework.RemotePlayer();
    self.controller = new cast.framework.RemotePlayerController(self.player);
    self.controller.addEventListener('isConnectedChanged',  isConnectedChanged);
    self.controller.addEventListener('currentTimeChanged',  currentTimeChanged);
    self.controller.addEventListener('durationChanged',     durationChanged);
    self.controller.addEventListener('volumeLevelChanged',  volumeLevelChanged);
    self.controller.addEventListener('isMutedChanged',      isMutedChanged);
    self.controller.addEventListener('isPausedChanged',     isPausedChanged);
    self.controller.addEventListener('playerStateChanged',  playerStateChanged);
    self.available = true;
    Trigger('available');
  }
  function isConnectedChanged() {
    setTimeout(function() {
      if (!self.player.isConnected) {
        return self.connected = false
      }
      self.connected = true
      Trigger('connected')
      if (self.player.isMediaLoaded && self.player.playerState) {
        self.media = {
          src:          self.player.mediaInfo.contentId,
          poster:       self.player.imageUrl || null,
          title:        self.player.title || null,
          description:  self.player.mediaInfo.metadata.subtitle || null,
          subtitles:    [],
          progress:     self.controller.getSeekPosition(self.player.currentTime, self.player.duration),
          time:         self.controller.getFormattedTime(self.player.currentTime),
          duration:     self.controller.getFormattedTime(self.player.duration),
          volume:       self.player.volumeLevel,
          muted:        self.player.isMuted,
          state:        self.player.playerState
        }
        // Format loaded subtitles
        for (var i = 0; i < self.player.mediaInfo.tracks.length; i++) {
          if (self.player.mediaInfo.tracks[i].type === 'TEXT') {
            self.media.subtitles.push({
              label:  self.player.mediaInfo.tracks[i].name,
              src:    self.player.mediaInfo.tracks[i].trackContentId
            })
          }
        }
        // Update the active subtitle
        var activeTrackId = cast.framework.CastContext.getInstance().getCurrentSession().getSessionObj().media[0].activeTrackIds[0]
        if (typeof activeTrackId !== 'undefined' && self.media.subtitles[activeTrackId]) {
          self.media.subtitles[activeTrackId].active = true
        }
        Trigger('media', self.media)
      }
    }, 0)
  }
  function currentTimeChanged() {
    self.media.progress = self.controller.getSeekPosition(self.player.currentTime, self.player.duration)
    self.media.time     = self.controller.getFormattedTime(self.player.currentTime)
    self.media.duration = self.controller.getFormattedTime(self.player.duration)
    Trigger('time', {
      progress: self.media.progress,
      time:     self.media.time,
      duration: self.media.duration
    })
    if (self.media.progress >= 100) {
      Trigger('ended')
      self.disconnect()
    }
  }
  function durationChanged() {
    self.media.duration = self.player.duration
  }
  function volumeLevelChanged() {
    self.media.volume = Math.round(self.player.volumeLevel * 100)
    Trigger('volume', self.media.volume)
  }
  function isMutedChanged() {
    self.media.muted = self.player.isMuted
    Trigger('muted', self.media.muted)
  }
  function isPausedChanged() {
    self.media.paused = self.player.isPaused
    Trigger('paused', self.media.paused)
  }
  function playerStateChanged() {
    if (!self.player.playerState) {
      return self.disconnect()
    }
    self.media.state = self.player.playerState === 'IDLE' ? 'DISCONNECTED' : self.player.playerState;
    Trigger('state', self.media.state);
  }
  // external handlers
  CastJS.prototype.on = function(event, callback) {
    self.events[event] = callback
  }
  CastJS.prototype.off = function(event) {
    delete self.events[event]
  }
  CastJS.prototype.cast = function(src, options = {}) {
    if (!src) {
      return Trigger('error', 'No media source specified.')
    }
    options.src = src
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        self.media[key] = options[key]
      }
    }
    cast.framework.CastContext.getInstance().requestSession().then(function() {
      self.session = cast.framework.CastContext.getInstance().getCurrentSession()
      if (self.session && self.media.src) {
        var mediaInfo       = new chrome.cast.media.MediaInfo(self.media.src)
        mediaInfo.metadata  = new chrome.cast.media.GenericMediaMetadata()
        // The sexy subtitle support function <3
        if (self.media.subtitles.length) {
          mediaInfo.textTrackStyle                  = new chrome.cast.media.TextTrackStyle()
          mediaInfo.textTrackStyle.fontFamily       = 'Arial'
          mediaInfo.textTrackStyle.foregroundColor  = '#FFFFFF'
          mediaInfo.textTrackStyle.backgroundColor  = '#00000000'
          mediaInfo.textTrackStyle.fontScale        = '1.1'
          mediaInfo.textTrackStyle.edgeColor        = '#00000099'
          mediaInfo.textTrackStyle.edgeType         = chrome.cast.media.TextTrackEdgeType.DROP_SHADOW
          var tracks = [];
          for (var i = 0; i < self.media.subtitles.length; i++) {
            var track                = new chrome.cast.media.Track(i, chrome.cast.media.TrackType.TEXT)
            track.trackContentId    = self.media.subtitles[i].src
            track.trackContentType  = 'text/vtt'
            track.subtype           = chrome.cast.media.TextTrackType.CAPTIONS
            track.name              = self.media.subtitles[i].label
            tracks.push(track);
          }
          mediaInfo.tracks = tracks
        }
        if (self.media.poster) {
          mediaInfo.metadata.images = [{
            'url': self.media.poster
          }]
        }
        if (self.media.title) {
          mediaInfo.metadata.title = self.media.title
        }
        if (self.media.description) {
          mediaInfo.metadata.subtitle = self.media.description
        }
        console.log(mediaInfo)
        var request         = new chrome.cast.media.LoadRequest(mediaInfo)
        request.currentTime = self.media.time
        request.autoplay    = !self.media.paused
        if (self.media.subtitles.length > 0) {
          for (var i = 0; i < self.media.subtitles.length; i++) {
            if (self.media.subtitles[i] && self.media.subtitles[i].active) {
              request.activeTrackIds = [i]
            }
          }
        }
        self.session.loadMedia(request).then(function() {
          Trigger('media', self.media)
        }, function(err) {
          Trigger('error', 'Cast error: ' + err)
        })
      }
    }, function(err) {
      Trigger('error', 'Cast error: ' + err)
    })
  }
  CastJS.prototype.state = function() {
    return self.media.state
  }
  CastJS.prototype.media = function() {
    return self.media
  }
  CastJS.prototype.time = function(percentage) {
    return {
      progress: self.media.progress,
      time:     self.media.time,
      duration: self.media.duration
    }
  }
  CastJS.prototype.seek = function(percentage) {
    self.player.currentTime = self.controller.getSeekTime(percentage, self.player.duration)
    self.controller.seek()
  }
  CastJS.prototype.volume = function(percentage) {
    if (typeof percentage === 'undefined') {
      return Math.round(self.player.volumeLevel * 100)
    }
    self.player.volumeLevel = percentage / 100
    self.controller.setVolumeLevel()
  }
  CastJS.prototype.play = function() {
    if (self.player.isPaused) {
      self.controller.playOrPause()
    }
  }
  CastJS.prototype.pause = function() {
    if (!self.player.isPaused) {
      self.controller.playOrPause()
    }
  }
  CastJS.prototype.paused = function() {
    return self.player.isPaused
  }
  CastJS.prototype.muted = function(boolean) {
    if (typeof boolean === 'undefined') {
      return self.player.isMuted
    }
    if (boolean && !self.player.isMuted) {
      self.controller.muteOrUnmute()
    } else if (!boolean && self.player.isMuted) {
      self.controller.muteOrUnmute()
    }
  }
  CastJS.prototype.subtitles = function(index) {
    if (typeof index === 'undefined') {
      return self.media.subtitles
    }
    var tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest([index])
    cast.framework.CastContext.getInstance().getCurrentSession().getSessionObj().media[0].editTracksInfo(tracksInfoRequest, null, null)
    for (var i = 0; i < self.media.subtitles.length; i++) {
      delete self.media.subtitles[i].active
      if (i === index) {
        self.media.subtitles[i].active = true
      }
    }
  }
  CastJS.prototype.disconnect = function() {
    cast.framework.CastContext.getInstance().endCurrentSession(true);
    self.controller.stop();
    self.media = Object.assign({}, self.template);
    self.player.isMediaLoaded = false;
    self.media.state = 'DISCONNECTED';
    Trigger('disconnected');
  }
}
