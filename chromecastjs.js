class ChromecastJS {
  constructor(scope, reciever) {
    // Define global object
    const that = this;
    // Define object variables
    that.Scope = scope ? scope : "tab_and_origin_scoped";
    that.Receiver = reciever ? reciever : "CC1AD845";
    that.Events = [];
    that.Available = false;
    that.Connected = false;
    that.Player = null;
    that.Controller = null;
    that.Session = null;
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
      state: "DISCONNECTED"
    };
    that.Media = that.Template;
    // Check if a chromecast is available, trigger 'Init' event
    const castInterval = setInterval(() => {
      if (
        typeof window.chrome !== "undefined" &&
        typeof window.chrome.cast !== "undefined" &&
        window.chrome.cast.isAvailable
      ) {
        clearInterval(castInterval);
        Init();
      }
    }, 250);
    // Call event function
    function TriggerEvent(event, args) {
      if (typeof that.Events[event] !== "undefined") {
        if (typeof args !== "undefined") {
          return that.Events[event](args);
        }
        that.Events[event]();
      }
    }
    // Initialize cast framework events
    function Init() {
      cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: that.Receiver,
        autoJoinPolicy: that.Scope
      });
      that.Player = new cast.framework.RemotePlayer();
      that.Controller = new cast.framework.RemotePlayerController(that.Player);
      // Controller events
      that.Controller.addEventListener(
        "isConnectedChanged",
        IsConnectedChanged
      );
      that.Controller.addEventListener("currentTimeChanged", () => {
        that.Media.time = that.Player.currentTime;
        TriggerEvent("time", {
          progress:
            that.Controller.getSeekPosition(
              that.Player.currentTime,
              that.Player.duration
            ) || 0,
          time: that.Controller.getFormattedTime(that.Player.currentTime),
          duration: that.Controller.getFormattedTime(that.Player.duration)
        });
      });
      that.Controller.addEventListener("durationChanged", () => {
        that.Media.duration = that.Player.duration;
      });
      that.Controller.addEventListener("volumeLevelChanged", () => {
        that.Media.volume = that.Player.volumeLevel * 100;
        TriggerEvent("volume", that.Media.volume);
      });
      that.Controller.addEventListener("isMutedChanged", () => {
        console.log(that.Player.isMuted);
        that.Media.muted = that.Player.isMuted;
        TriggerEvent("muteOrUnmute", that.Media.muted);
      });
      that.Controller.addEventListener("isPausedChanged", () => {
        that.Media.paused = that.Player.isPaused;
        TriggerEvent("playOrPause", that.Media.paused);
      });
      that.Controller.addEventListener("playerStateChanged", () => {
        if (that.Player.playerState) {
          that.Media.state = that.Player.playerState;
        } else {
          cast.framework.CastContext.getInstance().endCurrentSession();
          that.Controller.stop();
          that.Media = that.Template;
          that.Player.isMediaLoaded = false;
          that.Media.state = "DISCONNECTED";
          TriggerEvent("disconnect");
        }
        TriggerEvent("state", that.Media.state);
      });
      that.Available = true;
      TriggerEvent("available");
    }

    function IsConnectedChanged() {
      // Avoid bug in the cast framework not updating the Player object instantly
      setTimeout(() => {
        if (!that.Player.isConnected) {
          that.Connected = false;
          return;
        }
        that.Connected = true;
        TriggerEvent("connected");
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
          };
          // Format loaded subtitles
          for (var i = 0; i < that.Player.mediaInfo.tracks.length; i++) {
            if (that.Player.mediaInfo.tracks[i].type === "TEXT") {
              that.Media.subtitles.push({
                active: false,
                label: that.Player.mediaInfo.tracks[i].name,
                srclang: that.Player.mediaInfo.tracks[i].language,
                src: that.Player.mediaInfo.tracks[i].trackContentId
              });
            }
          }
          // Update the active subtitle
          const activeTrackId = cast.framework.CastContext.getInstance().b.getSessionObj()
            .media[0].activeTrackIds[0];
          if (
            activeTrackId &&
            typeof that.Media.subtitles[activeTrackId] !== "undefined"
          ) {
            that.Media.subtitles[activeTrackId].active = true;
          }
          TriggerEvent("media", that.Media);
        } else {
          that.Session = cast.framework.CastContext.getInstance().getCurrentSession();
          if (that.Session && that.Media.content) {
            const mediaInfo = new chrome.cast.media.MediaInfo(
              that.Media.content
            );
            //mediaInfo.contentType = 'video/mp4' ??
            mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
            // The sexy subtitle support function <3
            if (that.Media.subtitles.length > 0) {
              mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
              mediaInfo.textTrackStyle.fontFamily = "Arial";
              mediaInfo.textTrackStyle.foregroundColor = "#FFFFFF";
              mediaInfo.textTrackStyle.backgroundColor = "#00000000";
              mediaInfo.textTrackStyle.fontScale = "1.1";
              mediaInfo.textTrackStyle.edgeColor = "#00000099";
              mediaInfo.textTrackStyle.edgeType =
                chrome.cast.media.TextTrackEdgeType.DROP_SHADOW;
              const tracks = [];
              for (var i = 0; i < that.Media.subtitles.length; i++) {
                const track = new chrome.cast.media.Track(
                  i,
                  chrome.cast.media.TrackType.TEXT
                );
                track.trackContentId = that.Media.subtitles[i].src;
                track.trackContentType = "text/vtt";
                track.subtype = chrome.cast.media.TextTrackType.CAPTIONS;
                track.name = that.Media.subtitles[i].label;
                track.language = that.Media.subtitles[i].srclang;
                tracks.push(track);
              }
              mediaInfo.tracks = tracks;
            }
            if (that.Media.poster) {
              mediaInfo.metadata.images = [
                {
                  url: that.Media.poster
                }
              ];
            }
            if (that.Media.title) {
              mediaInfo.metadata.title = that.Media.title;
            }
            if (that.Media.description) {
              mediaInfo.metadata.subtitle = that.Media.description;
            }
            const request = new chrome.cast.media.LoadRequest(mediaInfo);
            request.currentTime = that.Media.time;
            request.autoplay = !that.Media.paused;
            if (that.Media.subtitles.length > 0) {
              for (var i = 0; i < that.Media.subtitles.length; i++) {
                if (
                  typeof that.Media.subtitles[i].active != "undefined" &&
                  that.Media.subtitles[i].active
                ) {
                  request.activeTrackIds = [i];
                }
              }
            }
            that.Session.loadMedia(request).then(
              () => {
                TriggerEvent("media", that.Media);
              },
              e => {
                TriggerEvent("error", "ChromecastJS.cast():", e);
              }
            );
          }
        }
      }, 0);
    }
  }

  // Define object methods
  on(event, callback) {
    that.Events[event] = callback;
  }

  cast(media, callback) {
    if (!media.content) {
      if (callback) {
        callback("No media content specified.");
      }
      return TriggerEvent("error", "No media content specified.");
    }
    for (const key in media) {
      if (media.hasOwnProperty(key)) {
        that.Media[key] = media[key];
      }
    }
    cast.framework.CastContext.getInstance()
      .requestSession()
      .then(
        () => {
          if (callback) {
            callback(null);
          }
        },
        e => {
          if (callback) {
            callback(e);
          }
          TriggerEvent("error", `ChromecastJS.cast(): ${e}`);
        }
      );
  }

  seek(percentage) {
    if (!that.Connected || !that.Player.canSeek) {
      return TriggerEvent("error", ".seek(): Not connected or can't seek");
    }
    that.Player.currentTime = that.Controller.getSeekTime(
      percentage,
      that.Player.duration
    );
    that.Controller.seek();
  }

  volume(percentage) {
    if (!that.Connected || !that.Player.canControlVolume) {
      return TriggerEvent(
        "error",
        ".volume(): Not connected or can't control volume"
      );
    }
    that.Player.volumeLevel = percentage / 100;
    that.Controller.setVolumeLevel();
  }

  playOrPause() {
    if (!that.Connected || !that.Player.canPause) {
      return TriggerEvent(
        "error",
        ".playOrPause(): Not connected or can't pause or play"
      );
    }
    that.Controller.playOrPause();
  }

  muteOrUnmute() {
    if (!that.Connected || !that.Player.canControlVolume) {
      return TriggerEvent(
        "error",
        ".muteOrUnmute(): Not connected or can't control volume"
      );
    }
    that.Controller.muteOrUnmute();
  }

  changeSubtitle(index) {
    if (!that.Connected) {
      return TriggerEvent("error", ".changeSubtitle(): Not connected");
    }
    const tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest([
      index
    ]);
    cast.framework.CastContext.getInstance()
      .b.getSessionObj()
      .media[0].editTracksInfo(tracksInfoRequest, null, null);
    for (let i = 0; i < that.Media.subtitles.length; i++) {
      that.Media.subtitles[i].active = false;
      if (i === index) {
        that.Media.subtitles[i].active = true;
      }
    }
  }

  disconnect() {
    cast.framework.CastContext.getInstance().endCurrentSession();
  }
}
