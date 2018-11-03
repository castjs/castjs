var ChromecastJS = function (scope, reciever) {
    // Load framework if not exist
    if (typeof window.chrome.cast === 'undefined') {
        var castFramework = document.createElement('script');
        castFramework.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'
        document.body.appendChild(castFramework)
    }
    // Define global object
    var that = this
    // Define object variables
    that.Scope = (scope) ? scope : 'tab_and_origin_scoped'
    that.Receiver = (reciever) ? reciever : 'CC1AD845'
    that.Events = []
    that.Available = false
    that.Connected = false
    that.Player = null
    that.Controller = null
    that.Session = null
    that.Template = {
        content: null,
        poster: null,
        title: null,
        description: null,
        subtitles: [],
        time: 0,
        duration: 0,
        volume: 0.3,
        muted: false,
        paused: false,
        state: 'DISCONNECTED'
    }
    that.Media = that.Template
    // Define object methods
    ChromecastJS.prototype.on = function (event, callback) {
        that.Events[event] = callback
        return that
    }
    ChromecastJS.prototype.cast = function (media, callback) {
        if (!media.content) {
            if (typeof that.Events['error'] !== 'undefined') {
                that.Events['error']('No media content specified.')
            }
            if (callback) {
                callback('No media content specified.')
            }
            return
        }
        for (var key in media) {
            if (media.hasOwnProperty(key)) {
                that.Media[key] = media[key]
            }
        }
        cast.framework.CastContext.getInstance().requestSession().then(function () {
            if (callback) {
                callback(null)
            }
        }, function (e) {
            if (callback) {
                callback(e)
            }
            if (typeof that.Events['error'] !== 'undefined') {
                that.Events['error']('ChromecastJS.cast():', e)
            }
        })
    }
    ChromecastJS.prototype.seek = function (percentage) {
        if (!that.Connected || !that.Player.canSeek) {
            if (typeof that.Events['error'] !== 'undefined') {
                that.Events['error']('ChromecastJS.seek(): Not connected or can\'t seek')
            }
            return
        }
        that.Player.currentTime = that.Controller.getSeekTime(percentage, that.Player.duration)
        that.Controller.seek()
    }
    ChromecastJS.prototype.volume = function (percentage) {
        if (!that.Connected || !that.Player.canControlVolume) {
           	if (typeof that.Events['error'] !== 'undefined') {
                that.Events['error']('ChromecastJS.volume(): Not connected or can\'t control volume')
            }
            return
        }
        // Todo ~ Beautify this function (Percentage to leading zero with 2 decimals)
        percentage = (percentage.toString().length === 1) ? '0' + percentage : percentage
        percentage = (percentage == '100') ? 1 : parseFloat('0.' + percentage)
        that.Player.volumeLevel = percentage
        that.Controller.setVolumeLevel()
    }
    ChromecastJS.prototype.playOrPause = function () {
        if (!that.Connected || !that.Player.canPause) {
            if (typeof that.Events['error'] !== 'undefined') {
                that.Events['error']('ChromecastJS.playOrPause(): Not connected or can\'t pause or play')
            }
            return
        }
        that.Controller.playOrPause()
    }
    ChromecastJS.prototype.muteOrUnmute = function () {
        if (!that.Connected || !that.Player.canControlVolume) {
            if (typeof that.Events['error'] !== 'undefined') {
                that.Events['error']('ChromecastJS.muteOrUnmute(): Not connected or can\'t control volume')
            }
            return
        }
        that.Controller.muteOrUnmute()
    }
    ChromecastJS.prototype.changeSubtitle = function (index) {
        if (!that.Connected) {
            if (typeof that.Events['error'] !== 'undefined') {
                that.Events['error']('ChromecastJS.changeSubtitle(): Not connected')
            }
            return
        }
        var tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest([index])
        cast.framework.CastContext.getInstance().b.getSessionObj().media[0].editTracksInfo(tracksInfoRequest, null, null)
    }
    ChromecastJS.prototype.disconnect = function () {
        cast.framework.CastContext.getInstance().endCurrentSession()
    }
    // Check if a chromecast is available, trigger 'Init' event
    var castInterval = setInterval(function () {
        if (typeof window.chrome !== 'undefined' && typeof window.chrome.cast !== 'undefined' && window.chrome.cast.isAvailable) {
            clearInterval(castInterval)
            Init()
        }
    }, 250)
    // Initialize cast framework events
    function Init() {
        cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId: that.Receiver,
            autoJoinPolicy: that.Scope
        })
        that.Player = new cast.framework.RemotePlayer()
        that.Controller = new cast.framework.RemotePlayerController(that.Player)
        that.Controller.addEventListener('isConnectedChanged', IsConnectedChanged)
        that.Controller.addEventListener('currentTimeChanged', TimeChanged)
        that.Controller.addEventListener('durationChanged', TimeChanged)
        that.Controller.addEventListener('volumeLevelChanged', VolumeLevelChanged)
        that.Controller.addEventListener('isMutedChanged', 	IsMutedChanged)
        that.Controller.addEventListener('isPausedChanged', IsPausedChanged)
        that.Controller.addEventListener('playerStateChanged', PlayerStateChanged)
        that.Available = true;
        if (typeof that.Events['available'] !== 'undefined') {
            that.Events['available']()
        }
    }

    function IsConnectedChanged() {
        // Avoid bug in the cast framework not updating the Player object instantly
        setTimeout(function () {
            if (that.Player.isConnected) {
                that.Connected = true
                if (typeof that.Events['connected'] !== 'undefined') {
                    that.Events['connected']()
                }
                if (that.Player.isMediaLoaded && that.Player.playerState) {
                    that.Media = {
                        content: that.Player.mediaInfo.contentId,
                        poster: that.Player.imageUrl || null,
                        title: that.Player.title || null,
                        description: that.Player.mediaInfo.metadata.subtitle || null,
                        subtitles: [],
                        time: that.Player.currentTime,
                        duration: that.Player.duration,
                        volume: that.Player.volumeLevel,
                        muted: that.Player.isMuted,
                        state: that.Player.playerState
                    }
                    // Format loaded subtitles
                    for (var i = 0; i < that.Player.mediaInfo.tracks.length; i++) {
                        if (that.Player.mediaInfo.tracks[i].type === 'TEXT') {
                            that.Media.subtitles.push({
                                label: that.Player.mediaInfo.tracks[i].name,
                                srclang: that.Player.mediaInfo.tracks[i].language,
                                src: that.Player.mediaInfo.tracks[i].trackContentId
                            })
                        }
                    }
                    if (typeof that.Events['media'] !== 'undefined') {
                        that.Events['media'](that.Media)
                    }
                } else {
                    that.Session = cast.framework.CastContext.getInstance().getCurrentSession()
                    if (that.Session && that.Media.content) {
                        var mediaInfo = new chrome.cast.media.MediaInfo(that.Media.content)
                        //mediaInfo.contentType = 'video/mp4' ??
                        mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata()
                        // The sexy subtitle support function <3
                        if (that.Media.subtitles.length > 0) {
                            mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle()
                            mediaInfo.textTrackStyle.fontFamily = 'Arial'
                            mediaInfo.textTrackStyle.foregroundColor = '#FFFFFF'
                            mediaInfo.textTrackStyle.backgroundColor = '#00000000'
                            mediaInfo.textTrackStyle.fontScale = '1.1'
                            mediaInfo.textTrackStyle.edgeColor = '#00000099'
                            mediaInfo.textTrackStyle.edgeType = chrome.cast.media.TextTrackEdgeType.DROP_SHADOW
                            var tracks = [];
                            for (var i = 0; i < that.Media.subtitles.length; i++) {
                                var track = new chrome.cast.media.Track(i, chrome.cast.media.TrackType.TEXT)
                                track.trackContentId = that.Media.subtitles[i].src
                                track.trackContentType = 'text/vtt'
                                track.subtype = chrome.cast.media.TextTrackType.CAPTIONS
                                track.name = that.Media.subtitles[i].label
                                track.language = that.Media.subtitles[i].srclang
                                tracks.push(track);
                            }
                            mediaInfo.tracks = tracks
                        }
                        if (that.Media.poster) {
                            mediaInfo.metadata.images = [{
                                'url': that.Media.poster
                            }]
                        }
                        if (that.Media.title) {
                            mediaInfo.metadata.title = that.Media.title
                        }
                        if (that.Media.description) {
                            mediaInfo.metadata.subtitle = that.Media.description
                        }
                        var request = new chrome.cast.media.LoadRequest(mediaInfo)
                        request.currentTime = that.Media.time
                        request.autoplay = !that.Media.paused
                        if (that.Media.subtitles.length > 0) {
                            for (var i = 0; i < that.Media.subtitles.length; i++) {
                                if (typeof that.Media.subtitles[i].active != 'undefined' && that.Media.subtitles[i].active) {
                                    request.activeTrackIds = [i]
                                }
                            }
                        }
                        that.Session.loadMedia(request).then(function () {
                            if (typeof that.Events['media'] !== 'undefined') {
                                that.Events['media'](that.Media)
                            }
                        }, function (e) {
                            if (typeof that.Events['error'] !== 'undefined') {
                                that.Events['error']('ChromecastJS.cast():', e)
                            }
                        })
                    }
                }
            }
        }, 0)
    }

    function TimeChanged() {
        that.Media.time = that.Player.currentTime
        if (typeof that.Events['time'] !== 'undefined') {
            that.Events['time']({
                progress: that.Controller.getSeekPosition(that.Player.currentTime, that.Player.duration) || 0,
                time: that.Controller.getFormattedTime(that.Player.currentTime),
                duration: that.Controller.getFormattedTime(that.Player.duration)
            })
        }
    }

    function VolumeLevelChanged() {
    	that.Media.volume = that.Player.volumeLevel
        if (typeof that.Events['volume'] !== 'undefined') {
        	var percentage = (that.Media.volume == '1') ? '100' : that.Media.volume.toFixed(2).replace('0.', '').replace('.', '')
            that.Events['volume'](percentage)
        }
    }

    function IsMutedChanged() {
        that.Media.muted = that.Player.isMuted
        if (typeof that.Events['muteOrUnmute'] !== 'undefined') {
            that.Events['muteOrUnmute'](that.Media.muted)
        }
    }

    function IsPausedChanged() {
    	that.Media.paused = that.Player.isPaused
    	if (typeof that.Events['playOrPause'] !== 'undefined') {
            that.Events['playOrPause'](that.Media.paused)
        }
    }

    function PlayerStateChanged() {
        if (that.Player.playerState) {
            that.Media.state = that.Player.playerState
        } else {
            cast.framework.CastContext.getInstance().endCurrentSession()
            that.Media = that.Template
            that.Player.isMediaLoaded = false
            that.Media.state = 'DISCONNECTED'
            if (typeof that.Events['disconnect'] !== 'undefined') {
                that.Events['disconnect']()
            }
        }
        if (typeof that.Events['state'] !== 'undefined') {
            that.Events['state'](that.Media.state)
        }
    }
}
