// Castjs - Chromecast Sender Library
// https://github.com/castjs/castjs

if (window.chrome && !window.chrome.cast) {
    var script = document.createElement('script');
    script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
    document.head.appendChild(script);
}

class Castjs {

    constructor(opt) {
        opt = opt || {};

        var joinpolicies = [
            'tab_and_origin_scoped',
            'origin_scoped',
            'page_scoped'
        ];

        if (!opt.joinpolicy || joinpolicies.indexOf(opt.joinpolicy) === -1) {
            opt.joinpolicy = 'tab_and_origin_scoped';
        }

        if (!opt.receiver || opt.receiver === '') {
            opt.receiver = 'CC1AD845';
        }

        this._events     = {};
        this._player     = null;
        this._controller = null;
        this._context    = null;

        this._available   = false;
        this._connected   = false;
        this._device      = 'Chromecast';
        this._src         = '';
        this._title       = '';
        this._description = '';
        this._poster      = '';
        this._subtitles   = [];
        this._volume      = 1;
        this._muted       = false;
        this._paused      = false;
        this._time        = 0;
        this._duration    = 0;
        this._progress    = 0;
        this._state       = 'disconnected';
        this.subtitleStyle = opt.subtitleStyle || null;
        this.debug        = opt.debug || false;

        this.version    = 'v7.0.0';
        this.receiver   = opt.receiver;
        this.joinpolicy = opt.joinpolicy;

        this._init();
    }

    // Public getters / setters

    available() {
        return this._available;
    }

    connected() {
        return this._connected;
    }

    device() {
        return this._device;
    }

    state() {
        return this._state;
    }

    paused() {
        return this._paused;
    }

    src() {
        return this._src;
    }

    title() {
        return this._title;
    }

    description() {
        return this._description;
    }

    poster() {
        return this._poster;
    }

    subtitles() {
        return this._subtitles;
    }

    progress() {
        return this._progress;
    }

    volume(value) {
        if (typeof value === 'undefined') {
            return this._volume;
        }
        if (this._controller) {
            this._player.volumeLevel = value;
            this._controller.setVolumeLevel();
        }
        return this;
    }

    muted(value) {
        if (typeof value === 'undefined') {
            return this._muted;
        }
        if (this._controller && !!value !== this._muted) {
            this._controller.muteOrUnmute();
        }
        return this;
    }

    time(value) {
        if (typeof value === 'undefined') {
            return this._time;
        }
        if (value === true) {
            return this._format_time(this._time);
        }
        if (this._controller) {
            this._player.currentTime = value;
            this._controller.seek();
        }
        this._time = value;
        return this;
    }

    duration(value) {
        if (value === true) {
            return this._format_time(this._duration);
        }
        return this._duration;
    }

    // Actions

    play() {
        if (this._controller && this._paused) {
            this._controller.playOrPause();
        }
        return this;
    }

    pause() {
        if (this._controller && !this._paused) {
            this._controller.playOrPause();
        }
        return this;
    }

    cast(src, metadata) {
        metadata = metadata || {};

        if (!src) {
            return this.trigger('error', 'No media source specified.');
        }

        this._src         = src;
        this._title       = metadata.title || '';
        this._description = metadata.description || '';
        this._poster      = metadata.poster || '';
        this._subtitles   = metadata.subtitles || [];
        this._time        = metadata.time || 0;
        this._paused      = metadata.paused || false;

        if (metadata.subtitleStyle) {
            this.subtitleStyle = metadata.subtitleStyle;
        }

        var session = this._context.getCurrentSession();

        if (session) {
            this._load_media(session);
        } else {
            this._context.requestSession().then(() => {
                var new_session = this._context.getCurrentSession();
                if (!new_session) {
                    return this.trigger('error', 'Could not connect with the cast device');
                }
                this._load_media(new_session);
            }, (err) => {
                if (err !== 'cancel') {
                    this.trigger('error', err);
                }
            });
        }

        return this;
    }

    subtitle(index) {
        if (!this._controller) return this;

        var request = new chrome.cast.media.EditTracksInfoRequest([parseInt(index) + 1]);
        var media = null;

        try {
            media = this._context.getCurrentSession().getSessionObj().media[0];
        } catch (e) {}

        if (!media) {
            return this.trigger('error', 'No active media session');
        }

        media.editTracksInfo(request, () => {
            for (var i = 0; i < this._subtitles.length; i++) {
                delete this._subtitles[i].active;
                if (i == index) {
                    this._subtitles[i].active = true;
                }
            }
            this.trigger('subtitlechange');
        }, (err) => {
            this.trigger('error', err);
        });

        return this;
    }

    disconnect() {
        if (this._context) {
            this._context.endCurrentSession(true);
        }
        if (this._controller) {
            this._controller.stop();
        }
        this._detach_player();

        this._connected   = false;
        this._device      = 'Chromecast';
        this._src         = '';
        this._title       = '';
        this._description = '';
        this._poster      = '';
        this._subtitles   = [];
        this._volume      = 1;
        this._muted       = false;
        this._paused      = false;
        this._time        = 0;
        this._duration    = 0;
        this._progress    = 0;
        this._state       = 'disconnected';

        this.trigger('disconnect');
        return this;
    }

    // Events

    on(event, cb) {
        if (!this._events[event]) {
            this._events[event] = [];
        }
        this._events[event].push(cb);

        if (event === 'available' && this._available) {
            setTimeout(() => cb(), 0);
        }
        return this;
    }

    off(event) {
        if (!event) {
            this._events = {};
        } else if (this._events[event]) {
            this._events[event] = [];
        }
        return this;
    }

    trigger(event) {
        var args = Array.prototype.slice.call(arguments, 1);
        var list = this._events[event] || [];

        for (var i = 0; i < list.length; i++) {
            list[i].apply(this, args);
        }

        if (event !== 'error') {
            var global = this._events['event'] || [];
            for (var j = 0; j < global.length; j++) {
                global[j].call(this, event);
            }
        }
        return this;
    }

    // Internal

    _log() {
        if (this.debug) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('[Castjs]');
            console.log.apply(console, args);
        }
    }

    _format_time(seconds) {
        if (!seconds || seconds < 0) return '00:00';

        var h = Math.floor(seconds / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = Math.floor(seconds % 60);

        var result =
            (m < 10 ? '0' + m : m) + ':' +
            (s < 10 ? '0' + s : s);

        if (h > 0) {
            result = (h < 10 ? '0' + h : h) + ':' + result;
        }
        return result;
    }

    _get_browser() {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf('firefox') > -1) return 'Firefox: Please enable casting';
        if (ua.indexOf('opr/') > -1) return 'Opera: Please enable casting';
        if (navigator.brave) return 'Brave: Please enable casting';
        return 'This Browser';
    }

    _init() {
        if (window.chrome && window.chrome.cast && window.chrome.cast.isAvailable) {
            this._setup();
            return;
        }

        window['__onGCastApiAvailable'] = (isAvailable) => {
            if (isAvailable) {
                this._setup();
            } else {
                this.trigger('error', 'Casting is not enabled in ' + this._get_browser());
            }
        };
    }

    _setup() {
        this._context = cast.framework.CastContext.getInstance();

        this._context.setOptions({
            receiverApplicationId: this.receiver,
            autoJoinPolicy: this.joinpolicy,
            language: 'en-US',
            resumeSavedSession: true
        });

        this._context.addEventListener(
            cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            (event) => this._on_session_state_changed(event)
        );

        this._available = true;
        this._log('Framework ready');
        this.trigger('available');

        if (this._context.getCurrentSession()) {
            this._attach_player();
        }
    }

    _on_session_state_changed(event) {
        this._log('Session state:', event.sessionState);

        switch (event.sessionState) {
            case cast.framework.SessionState.SESSION_STARTED:
            case cast.framework.SessionState.SESSION_RESUMED:
                this._attach_player();
                this._connected = true;
                this._device = this._context.getCurrentSession().getCastDevice().friendlyName || this._device;
                this._state = 'connected';
                this.trigger('statechange');
                this.trigger('connect');
                break;

            case cast.framework.SessionState.SESSION_ENDED:
                this._detach_player();
                this._connected = false;
                this._device = 'Chromecast';
                this._state = 'disconnected';
                this.trigger('statechange');
                this.trigger('disconnect');
                break;

            case cast.framework.SessionState.SESSION_START_FAILED:
                this.trigger('error', 'Could not start Cast session');
                break;
        }
    }

    _attach_player() {
        this._player = new cast.framework.RemotePlayer();
        this._controller = new cast.framework.RemotePlayerController(this._player);

        this._controller.addEventListener('isConnectedChanged',   () => this._is_connected_changed());
        this._controller.addEventListener('isMediaLoadedChanged', () => this._is_media_loaded_changed());
        this._controller.addEventListener('isMutedChanged',       () => this._is_muted_changed());
        this._controller.addEventListener('isPausedChanged',      () => this._is_paused_changed());
        this._controller.addEventListener('currentTimeChanged',   () => this._current_time_changed());
        this._controller.addEventListener('durationChanged',      () => this._duration_changed());
        this._controller.addEventListener('volumeLevelChanged',   () => this._volume_changed());
        this._controller.addEventListener('playerStateChanged',   () => this._player_state_changed());

        if (this._player.isMediaLoaded) {
            this._is_media_loaded_changed();
        }
    }

    _detach_player() {
        this._player = null;
        this._controller = null;
    }

    _load_media(session) {
        var mediaInfo = new chrome.cast.media.MediaInfo(this._src);
        mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
        mediaInfo.metadata.title = this._title;
        mediaInfo.metadata.subtitle = this._description;

        if (this._poster) {
            mediaInfo.metadata.images = [new chrome.cast.Image(this._poster)];
        }

        if (this._subtitles && this._subtitles.length) {
            mediaInfo.textTrackStyle = {
                backgroundColor: '#00000000',
                foregroundColor: '#FFFFFF',
                edgeType: 'DROP_SHADOW',
                edgeColor: '#000000FF',
                fontFamily: 'SANS_SERIF',
                fontScale: 0.95,
                fontStyle: 'NORMAL'
            };

            if (this.subtitleStyle) {
                for (var key in this.subtitleStyle) {
                    mediaInfo.textTrackStyle[key] = this.subtitleStyle[key];
                }
            }

            var tracks = [];
            for (var i = 0; i < this._subtitles.length; i++) {
                var sub = this._subtitles[i];
                var track = new chrome.cast.media.Track(i + 1, 'TEXT');

                track.name = sub.label || ('Track ' + (i + 1));
                track.trackContentId = sub.src;
                track.trackContentType = 'text/vtt';
                track.trackId = i + 1;
                track.subtype = sub.subtype ? sub.subtype.toUpperCase() : Castjs.globals.subtype.CAPTIONS;

                tracks.push(track);
            }
            mediaInfo.tracks = tracks;
        }

        var request = new chrome.cast.media.LoadRequest(mediaInfo);
        request.currentTime = this._time || 0;
        request.autoplay = !this._paused;

        if (this._subtitles && this._subtitles.length) {
            for (var j = 0; j < this._subtitles.length; j++) {
                if (this._subtitles[j].active) {
                    request.activeTrackIds = [j + 1];
                    break;
                }
            }
        }

        session.loadMedia(request).then(() => {
            this._device = session.getCastDevice().friendlyName || this._device;
            this._log('Media loaded');
            if (this._paused) {
                this._controller.playOrPause();
            }
        }, (err) => {
            this.trigger('error', err);
        });
    }

    // Event handlers

    _is_connected_changed() {
        if (!this._player) return;

        this._connected = this._player.isConnected;
        if (this._connected) {
            this._device = this._context.getCurrentSession()?.getCastDevice()?.friendlyName || this._device;
        }
    }

    _is_media_loaded_changed() {
        if (!this._player || !this._player.isMediaLoaded) return;

        setTimeout(() => {
            if (!this._player || !this._player.mediaInfo) return;

            this._device      = this._context.getCurrentSession()?.getCastDevice()?.friendlyName || this._device;
            this._src         = this._player.mediaInfo.contentId;
            this._title       = this._player.title || '';
            this._description = this._player.mediaInfo.metadata ? this._player.mediaInfo.metadata.subtitle : '';
            this._poster      = this._player.imageUrl || '';
            this._volume      = Number(this._player.volumeLevel.toFixed(1));
            this._muted       = this._player.isMuted;
            this._paused      = this._player.isPaused;
            this._time        = Math.round(this._player.currentTime * 10) / 10;
            this._duration    = this._player.duration;
            this._progress    = this._controller.getSeekPosition(this._time, this._duration);
            this._state       = this._player.playerState.toLowerCase();

            this._subtitles = [];
            var tracks = this._player.mediaInfo.tracks || [];
            for (var i = 0; i < tracks.length; i++) {
                if (tracks[i].type === 'TEXT') {
                    this._subtitles.push({
                        label: tracks[i].name,
                        src: tracks[i].trackContentId,
                        subtype: tracks[i].subtype,
                        active: false
                    });
                }
            }

            try {
                var active = this._context.getCurrentSession().getSessionObj().media[0].activeTrackIds;
                if (active && active.length) {
                    var idx = active[0] - 1;
                    if (this._subtitles[idx]) {
                        this._subtitles[idx].active = true;
                    }
                }
            } catch (e) {}

            this.trigger('timeupdate');
        }, 0);
    }

    _current_time_changed() {
        if (!this._player) return;

        var past = this._time;
        this._time = Math.round(this._player.currentTime * 10) / 10;
        this._duration = this._player.duration;
        this._progress = this._controller.getSeekPosition(this._time, this._duration);

        if (past != this._time || this._player.isPaused) {
            this.trigger('timeupdate');
        }
    }

    _duration_changed() {
        if (!this._player) return;
        this._duration = this._player.duration;
    }

    _volume_changed() {
        if (!this._player) return;

        this._volume = Number(this._player.volumeLevel.toFixed(1));
        if (this._player.isMediaLoaded) {
            this.trigger('volumechange');
        }
    }

    _is_muted_changed() {
        if (!this._player) return;

        var muted = this._player.isMuted;
        if (muted === this._muted) return;
        if (this._mute_lock) return;

        this._muted = muted;
        this.trigger(muted ? 'mute' : 'unmute');

        this._mute_lock = true;
        setTimeout(() => {
            this._mute_lock = false;
            if (this._player && this._player.isMuted !== this._muted) {
                this._muted = this._player.isMuted;
                this.trigger(this._muted ? 'mute' : 'unmute');
            }
        }, 400);
    }

    _is_paused_changed() {
        if (!this._player) return;

        this._paused = this._player.isPaused;
        if (this._paused) {
            this.trigger('pause');
        }
    }

    _player_state_changed() {
        if (!this._player || !this._player.isConnected) return;

        this._device = this._context.getCurrentSession()?.getCastDevice()?.friendlyName || this._device;
        this._state = this._player.playerState.toLowerCase();

        switch (this._state) {
            case 'idle':
                this._state = 'ended';
                this.trigger('statechange');
                this.trigger('end');
                break;

            case 'buffering':
                this._current_time_changed();
                this.trigger('statechange');
                this.trigger('buffering');
                break;

            case 'playing':
                if (this._player.isPaused) return;
                this._paused = false;
                setTimeout(() => {
                    this.trigger('statechange');
                    this.trigger('playing');
                }, 0);
                break;

            case 'paused':
                this.trigger('statechange');
                break;
        }
    }
}

Castjs.globals = {
    subtype: {
        SUBTITLES: 'SUBTITLES',
        CAPTIONS: 'CAPTIONS',
        DESCRIPTIONS: 'DESCRIPTIONS',
        CHAPTERS: 'CHAPTERS',
        METADATA: 'METADATA'
    },
    joinpolicy: {
        TAB_AND_ORIGIN_SCOPED: 'tab_and_origin_scoped',
        ORIGIN_SCOPED: 'origin_scoped',
        PAGE_SCOPED: 'page_scoped'
    }
};

if (typeof module !== 'undefined') {
    module.exports = Castjs;
}
