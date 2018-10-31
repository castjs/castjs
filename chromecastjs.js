var castSender = document.createElement('script');
castSender.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'
document.body.appendChild(castSender)
var ChromecastJS = function(scope, reciever) {
    // Variables
    var cc = this
    this.Available = false
    this.Events = []
    this.Player = null
    this.Controller = null
    this.Session = null
    this.MediaTemplate = {
        content: null,
        poster: null,
        title: null,
        description: null,
        subtitles: [],
        time: 0,
        duration: 0,
        volume: 0.5,
        muted: false,
        paused: false,
        state: 'DISCONNECTED'
    }
    this.Media = this.MediaTemplate
    // Prototypes
    ChromecastJS.prototype.on = function(event, callback) {
        this.Events[event] = callback
    }
    ChromecastJS.prototype.cast = function(media, callback) {
        if (!media.content) {
            if (typeof cc.Events['error'] != 'undefined') {
                cc.Events['error']('No media content specified.')
            }
            return
        }
        cast.framework.CastContext.getInstance().requestSession().then(function() {
            if (callback) {
                callback(null)
            }
        }, function(e) {
            if (callback) {
                callback(e)
            }
            if (typeof cc.Events['error'] != 'undefined') {
                cc.Events['error']('requestSession:', e)
            }
        })
        for (var key in media) {
            if (media.hasOwnProperty(key)) {
                cc.Media[key] = media[key]
            }
        }
    }
    ChromecastJS.prototype.seek = function(percentage) {
        if (percentage && cc.Player.canSeek) {
            cc.Player.currentTime = cc.Controller.getSeekTime(percentage, cc.Player.duration)
            cc.Controller.seek()
        }
    }
    ChromecastJS.prototype.volume = function(volume) {
        cc.Player.volumeLevel = volume
        cc.Controller.setVolumeLevel()
    }
    ChromecastJS.prototype.playOrPause = function() {
        cc.Controller.playOrPause()
    }
    ChromecastJS.prototype.muteOrUnmute = function() {
        cc.Controller.muteOrUnmute()
    }
    ChromecastJS.prototype.disconnect = function() {
        cast.framework.CastContext.getInstance().endCurrentSession()
    }
    ChromecastJS.prototype.changeSubtitle = function(id) {
        var tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest([id + 1]);
        cast.framework.CastContext.getInstance().b.getSessionObj().media[0].editTracksInfo(tracksInfoRequest, null, null);
    }
    // Check if a chromecast is available, trigger 'initialize' event
    var castInterval = setInterval(function() {
        if (typeof window.chrome != 'undefined' && typeof window.chrome.cast != 'undefined' && window.chrome.cast.isAvailable) {
            clearInterval(castInterval)
            initialize()  
        }
    }, 250)
    // Functions
    function initialize() {
        cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId: reciever || chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: scope || chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED
        });
        cc.Player = new cast.framework.RemotePlayer()
        cc.Controller = new cast.framework.RemotePlayerController(cc.Player)

        cc.Controller.addEventListener('isConnectedChanged', isConnectedChanged)
        cc.Controller.addEventListener('currentTimeChanged', currentTimeChanged)
        cc.Controller.addEventListener('durationChanged', durationChanged)
        cc.Controller.addEventListener('volumeLevelChanged', volumeLevelChanged)
        cc.Controller.addEventListener('isMutedChanged', isMutedChanged)
        cc.Controller.addEventListener('playerStateChanged', playerStateChanged)

        cc.Available = true;
        cc.Events['available'](true)
    }

    function isConnectedChanged() {
        setTimeout(function() {
            if (cc.Player.isConnected) {
                if (typeof cc.Events['connected'] != 'undefined') {
                    cc.Events['connected']()
                }
                if (cc.Player.isMediaLoaded) {
                    cc.Media = {
                        content: cc.Player.mediaInfo.contentId,
                        poster: cc.Player.imageUrl || null,
                        title: cc.Player.title || null,
                        description: cc.Player.mediaInfo.metadata.subtitle || null,
                        subtitles: [],
                        time: cc.Player.currentTime,
                        duration: cc.Player.duration,
                        volume: cc.Player.volumeLevel,
                        muted: cc.Player.isMuted,
                        state: cc.Player.playerState
                    }
                    for (var i = 0; i < cc.Player.mediaInfo.tracks.length; i++) {
                      if (cc.Player.mediaInfo.tracks[i].type == 'TEXT') {
                        cc.Media.subtitles.push({
                          label: cc.Player.mediaInfo.tracks[i].name,
                          srclang: cc.Player.mediaInfo.tracks[i].language,
                          src: cc.Player.mediaInfo.tracks[i].trackContentId
                        })
                      }
                    }
                    if (typeof cc.Events['media'] != 'undefined') {
                        cc.Events['media'](cc.Media)
                    }
                } else {
                    cc.Session = cast.framework.CastContext.getInstance().getCurrentSession()
                    if (cc.Session) {
                        var mediaInfo = new chrome.cast.media.MediaInfo(cc.Media.content, 'video/mp4');
                        mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();

                        if (cc.Media.subtitles.length > 0) {
                          mediaInfo.textTrackStyle = textTrackStyle();
                          mediaInfo.tracks = textTrackCaptions(cc.Media.subtitles)
                        }

                        if (cc.Media.poster) {
                            mediaInfo.metadata.images = [{
                                'url': cc.Media.poster
                            }];
                        }
                        if (cc.Media.title) {
                            mediaInfo.metadata.title = cc.Media.title;
                        }
                        if (cc.Media.description) {
                            mediaInfo.metadata.subtitle = cc.Media.description
                        }

                        var request = new chrome.cast.media.LoadRequest(mediaInfo)

                        request.currentTime = cc.Media.time
                        request.autoplay = !cc.Media.paused

                        if (cc.Media.subtitles.length > 0) {
                          for (var i = 0; i < cc.Media.subtitles.length; i++) {
                            if (typeof cc.Media.subtitles[i].active != 'undefined') {
                              request.activeTrackIds = [i + 1];
                            }
                          }
                        }
                        cc.Session.loadMedia(request).then(function() {
                            if (typeof cc.Events['media'] != 'undefined') {
                                cc.Events['media'](cc.Media)
                            }
                        }, function(e) {
                            if (typeof cc.Events['error'] != 'undefined') {
                                cc.Events['error']('loadMedia:', e)
                            }
                        })
                    }
                }
            }
        }, 0)
    }

    function textTrackStyle() {
        var textTrackStyle = new chrome.cast.media.TextTrackStyle();
        textTrackStyle.fontFamily = 'Arial';
        textTrackStyle.foregroundColor = '#FFFFFF';
        textTrackStyle.backgroundColor = '#00000000';
        textTrackStyle.fontScale = '1.1';
        textTrackStyle.edgeColor = '#00000099';
        textTrackStyle.edgeType = chrome.cast.media.TextTrackEdgeType.DROP_SHADOW;
      return textTrackStyle;
    }
    function textTrackCaptions(subtitles) {
      var tracks = [];
      for (var i = 0; i < subtitles.length; i++) {
          var track = new chrome.cast.media.Track(i + 1, chrome.cast.media.TrackType.TEXT);
          track.trackContentId = subtitles[i].src;
          track.trackContentType = 'text/vtt';
          track.subtype = chrome.cast.media.TextTrackType.CAPTIONS;
          track.name = subtitles[i].label;
          track.language = subtitles[i].srclang;
          tracks.push(track);
      }
      return tracks;
    }
    function currentTimeChanged() {
        cc.Media.time = cc.Player.currentTime
        if (typeof cc.Events['time'] != 'undefined') {
            cc.Events['time']({
                progress: cc.Controller.getSeekPosition(cc.Player.currentTime, cc.Player.duration) || 0,
                time: cc.Controller.getFormattedTime(cc.Player.currentTime),
                duration: cc.Controller.getFormattedTime(cc.Player.duration)
            })
        }
    }

    function durationChanged() {
        cc.Media.duration = cc.Player.duration
        if (typeof cc.Events['time'] != 'undefined') {
            cc.Events['time']({
                progress: cc.Controller.getSeekPosition(cc.Player.currentTime, cc.Player.duration) || 0,
                time: cc.Controller.getFormattedTime(cc.Player.currentTime),
                duration: cc.Controller.getFormattedTime(cc.Player.duration)
            })
        }
    }

    function volumeLevelChanged() {
        cc.Media.volume = cc.Player.volumeLevel
        if (typeof cc.Events['volume'] != 'undefined') {
            cc.Events['volume'](cc.Media.volume)
        }
    }

    function isMutedChanged() {
        cc.Media.muted = cc.Player.isMuted
        if (typeof cc.Events['muteOrUnmute'] != 'undefined') {
            cc.Events['muteOrUnmute'](cc.Media.muted)
        }
    }

    function playerStateChanged() {
        if (cc.Player.playerState) {
            cc.Media.state = cc.Player.playerState
        } else {
            cc.Media = cc.MediaTemplate
            cast.framework.CastContext.getInstance().endCurrentSession()
            cc.Media = cc.MediaTemplate
            cc.Media.state = 'DISCONNECTED'
            if (typeof cc.Events['disconnect'] != 'undefined') {
                cc.Events['disconnect']()
            }
        }
        if (typeof cc.Events['state'] != 'undefined') {
            cc.Events['state'](cc.Media.state)
        }
    }
}
