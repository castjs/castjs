var ChromecastJS = function(scope, receiver) {
  var self = this;
  self.Scope = scope ? scope : 'tab_and_origin_scoped';
  self.Receiver = receiver ? receiver : 'CC1AD845';
  self.Events = [];
  self.Available = false;
  self.Connected = false;
  self.Player = null;
  self.Controller = null;
  self.Session = null;
  self.Template = {
    content: null,
    poster: null,
    title: null,
    description: null,
    subtitles: [],
    progress: 0,
    time: 0,
    duration: 0,
    volume: 0.3,
    muted: false,
    paused: false,
    state: 'DISCONNECTED'
  }
  self.Media = Object.assign({}, self.Template)
  // internal handlers
  var Availability = setInterval(function() {
    if (window.chrome && window.chrome.cast && window.chrome.cast.isAvailable) {
      clearInterval(Availability);
      Init();
    }
  }, 250)
  function Trigger(event, args) {
    if (self.Events[event]) {
      self.Events[event](args)
    }
  }
  function Init() {
    cast.framework.CastContext.getInstance().setOptions({
      receiverApplicationId: self.Receiver,
      autoJoinPolicy: self.Scope
    });
    self.Player = new cast.framework.RemotePlayer();
    self.Controller = new cast.framework.RemotePlayerController(self.Player);
    self.Controller.addEventListener('isConnectedChanged', isConnectedChanged);
    self.Controller.addEventListener('currentTimeChanged', currentTimeChanged);
    self.Controller.addEventListener('durationChanged', durationChanged);
    self.Controller.addEventListener('volumeLevelChanged', volumeLevelChanged);
    self.Controller.addEventListener('isMutedChanged', isMutedChanged);
    self.Controller.addEventListener('isPausedChanged', isPausedChanged);
    self.Controller.addEventListener('playerStateChanged', playerStateChanged);
    self.Available = true;
    Trigger('available');
  }
  // Controller handlers
  function isConnectedChanged() {
    if (!self.Player.isConnected) {
      self.Connected = false
      return
    }
    self.Connected = true
    Trigger('connected')
    if (self.Player.isMediaLoaded && self.Player.playerState) {
      self.Media = {
        content: self.Player.mediaInfo.contentId,
        poster: self.Player.imageUrl || null,
        title: self.Player.title || null,
        description: self.Player.mediaInfo.metadata.subtitle || null,
        subtitles: [],
        progress: self.Controller.getSeekPosition(self.Player.currentTime, self.Player.duration),
        time: self.Controller.getFormattedTime(self.Player.currentTime),
        duration: self.Controller.getFormattedTime(self.Player.duration),
        volume: self.Player.volumeLevel,
        muted: self.Player.isMuted,
        state: self.Player.playerState
      }
      // Format loaded subtitles
      for (var i = 0; i < self.Player.mediaInfo.tracks.length; i++) {
        if (self.Player.mediaInfo.tracks[i].type === 'TEXT') {
          self.Media.subtitles.push({
            active: false,
            label: self.Player.mediaInfo.tracks[i].name,
            srclang: self.Player.mediaInfo.tracks[i].language,
            src: self.Player.mediaInfo.tracks[i].trackContentId
          })
        }
      }
      // Update the active subtitle
      var activeTrackId = cast.framework.CastContext.getInstance().getCurrentSession().getSessionObj().media[0].activeTrackIds[0]
      if (activeTrackId && self.Media.subtitles[activeTrackId]) {
        self.Media.subtitles[activeTrackId].active = true
      }
      Trigger('media', self.Media)
    } else {
      self.Session = cast.framework.CastContext.getInstance().getCurrentSession()
      if (self.Session && self.Media.content) {
        var mediaInfo = new chrome.cast.media.MediaInfo(self.Media.content)
        //mediaInfo.contentType = 'video/mp4' ??
        mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata()
        // The sexy subtitle support function <3
        if (self.Media.subtitles.length) {
          mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle()
          mediaInfo.textTrackStyle.fontFamily = 'Arial'
          mediaInfo.textTrackStyle.foregroundColor = '#FFFFFF'
          mediaInfo.textTrackStyle.backgroundColor = '#00000000'
          mediaInfo.textTrackStyle.fontScale = '1.1'
          mediaInfo.textTrackStyle.edgeColor = '#00000099'
          mediaInfo.textTrackStyle.edgeType = chrome.cast.media.TextTrackEdgeType.DROP_SHADOW
          var tracks = [];
          for (var i = 0; i < self.Media.subtitles.length; i++) {
            var track = new chrome.cast.media.Track(i, chrome.cast.media.TrackType.TEXT)
            track.trackContentId = self.Media.subtitles[i].src
            track.trackContentType = 'text/vtt'
            track.subtype = chrome.cast.media.TextTrackType.CAPTIONS
            track.name = self.Media.subtitles[i].label
            track.language = self.Media.subtitles[i].srclang
            tracks.push(track);
          }
          mediaInfo.tracks = tracks
        }
        if (self.Media.poster) {
          mediaInfo.metadata.images = [{
            'url': self.Media.poster
          }]
        }
        if (self.Media.title) {
          mediaInfo.metadata.title = self.Media.title
        }
        if (self.Media.description) {
          mediaInfo.metadata.subtitle = self.Media.description
        }
        var request = new chrome.cast.media.LoadRequest(mediaInfo)
        request.currentTime = self.Media.time
        request.autoplay = !self.Media.paused
        if (self.Media.subtitles.length > 0) {
          for (var i = 0; i < self.Media.subtitles.length; i++) {
            if (self.Media.subtitles[i] && self.Media.subtitles[i].active) {
              request.activeTrackIds = [i]
            }
          }
        }
        self.Session.loadMedia(request).then(function() {
          Trigger('loaded', self.Media)
        }, function(e) {
          Trigger('error', 'ChromecastJS.cast():', e)
        })
      }
    }
  }
  function currentTimeChanged() {
    self.Media.progress = self.Controller.getSeekPosition(self.Player.currentTime, self.Player.duration)
    self.Media.time = self.Controller.getFormattedTime(self.Player.currentTime)
    self.Media.duration = self.Controller.getFormattedTime(self.Player.duration)
    Trigger('time', {
      progress: self.Media.progress,
      time: self.Media.time,
      duration: self.Media.duration
    })
    if (self.Media.progress >= 100) {
      self.disconnect()
    }
  }
  function durationChanged() {
    self.Media.duration = self.Player.duration
  }
  function volumeLevelChanged() {
    self.Media.volume = Math.round(self.Player.volumeLevel * 100)
    Trigger('volume', self.Media.volume)
  }
  function isMutedChanged() {
    self.Media.muted = self.Player.isMuted
    Trigger('muteOrUnmute', self.Media.muted)
  }
  function isPausedChanged() {
    self.Media.paused = self.Player.isPaused
    Trigger('playOrPause', self.Media.paused)
  }
  function playerStateChanged() {
    if (!self.Player.playerState) {
      return self.disconnect()
    }
    self.Media.state = self.Player.playerState === 'IDLE' ? 'DISCONNECTED' : self.Player.playerState;
    Trigger('state', self.Media.state);
  }
  // external handlers
  ChromecastJS.prototype.on = function(event, callback) {
    self.Events[event] = callback
  }
  ChromecastJS.prototype.cast = function(media, callback) {
    if (!media || !media.content) {
      if (callback) {
        callback('No media content specified.')
      }
      return Trigger('error', 'No media content specified.')
    }
    for (var key in media) {
      if (media.hasOwnProperty(key)) {
        self.Media[key] = media[key]
      }
    }
    cast.framework.CastContext.getInstance().requestSession().then(function() {
      if (callback) {
        callback(null)
      }
    }, function(err) {
      if (callback) {
        callback(err)
      }
      Trigger('error', err)
    })
  }
  ChromecastJS.prototype.state = function() {
    return self.Media.state
  }
  ChromecastJS.prototype.media = function() {
    return self.Media
  }
  ChromecastJS.prototype.duration = function(percentage) {
    return {
      progress: self.Media.progress,
      time: self.Media.time,
      duration: self.Media.duration
    }
  }
  ChromecastJS.prototype.seek = function(percentage) {
    self.Player.currentTime = self.Controller.getSeekTime(percentage, self.Player.duration)
    self.Controller.seek()
  }
  ChromecastJS.prototype.volume = function(percentage) {
    if (typeof percentage === 'undefined') {
      return Math.round(self.Player.volumeLevel * 100)
    }
    self.Player.volumeLevel = percentage / 100
    self.Controller.setVolumeLevel()
  }
  ChromecastJS.prototype.play = function() {
    if (self.Player.isPaused) {
      self.Controller.playOrPause()
    }
  }
  ChromecastJS.prototype.pause = function() {
    if (!self.Player.isPaused) {
      self.Controller.playOrPause()
    }
  }
  ChromecastJS.prototype.paused = function() {
    return self.Player.isPaused
  }
  ChromecastJS.prototype.muted = function(boolean) {
    if (typeof boolean === 'undefined') {
      return cc.Player.isMuted
    }
    if (boolean && !self.Player.isMuted) {
      self.Controller.muteOrUnmute()
    } else if (!boolean && self.Player.isMuted) {
      self.Controller.muteOrUnmute()
    }
  }
  ChromecastJS.prototype.subtitles = function(index) {
    if (typeof index === 'undefined') {
      return self.Media.subtitles
    }
    var tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest([index])
    cast.framework.CastContext.getInstance().getCurrentSession().getSessionObj().media[0].editTracksInfo(tracksInfoRequest, null, null)
    for (var i = 0; i < self.Media.subtitles.length; i++) {
      self.Media.subtitles[i].active = false
      if (i === index) {
        self.Media.subtitles[i].active = true
      }
    }
  }
  ChromecastJS.prototype.disconnect = function() {
    cast.framework.CastContext.getInstance().endCurrentSession(true);
    self.Controller.stop();
    self.Media = Object.assign({}, self.Template);
    self.Player.isMediaLoaded = false;
    self.Media.state = 'DISCONNECTED';
    Trigger('disconnected');
  }
}
