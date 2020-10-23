
var cc = new Castjs();

cc.on('available', () => {
  $('#cast').removeClass('disabled')
})

cc.on('connect', () => {
  $('#cast').removeClass('disabled')
  $('#cast').addClass('session')
  if (cc.paused) {
    $('#play').removeClass('fa-pause').addClass('fa-play')
  } else {
    $('#play').removeClass('fa-play').addClass('fa-pause')
  }
})

cc.on('disconnect', () => {
  $('#cast').removeClass('session')
})

cc.on('statechange', () => {
  $('#state').text(cc.device + ': ' + cc.state)
})

cc.on('pause', () => {
  if (cc.paused) {
    $('#play').removeClass('fa-pause').addClass('fa-play')
  } else {
    $('#play').removeClass('fa-play').addClass('fa-pause')
  }
})

cc.on('volumechange', () => {
  if (cc.volumeLevel == 0) {
    $('#mute').removeClass('fa-volume-up').addClass('fa-volume-mute')
  } else {
    $('#mute').removeClass('fa-volume-mute').addClass('fa-volume-up')
  }
})

cc.on('timeupdate', () => {
  $('#time').text(cc.timePretty);
  $('#duration').text(cc.durationPretty);
  $('#range').attr('value', cc.progress);
  $('#range').rangeslider('update', true);
})

$('#cast').on('click', () => {
  if (cc.available) {
    cc.cast('https://castjs.io/demo/sintel.mp4', {
      poster     : 'https://castjs.io/poster.jpg',
      title      : 'Sintel',
      description: 'Third Open Movie by Blender Foundation',
      subtitles: [{
          active: true,
          label : 'English',
          src   : 'https://castjs.io/demo/english.vtt'
      }, {
          label : 'Spanish',
          src   : 'https://castjs.io/demo/spanish.vtt'
      }],
    })
  }
})

$('.jq-dropdown-menu').on('click', 'a', function(e) {
  e.preventDefault();
  var index = $(this).attr('href')
  cc.subtitle(index)
  $('.jq-dropdown-menu a').removeClass('active')
  $(this).addClass('active')
})

$('#mute').on('click', () => {
    if ($('#mute').hasClass('fa-volume-up')) {
      cc.mute()
      $('#mute').removeClass('fa-volume-up').addClass('fa-volume-mute')
    } else {
      cc.unmute()
      $('#mute').removeClass('fa-volume-mute').addClass('fa-volume-up')
    }
})

$('#play').on('click', () => {
    if ($('#play').hasClass('fa-play')) {
      cc.play();
      $('#play').removeClass('fa-play').addClass('fa-pause')
    } else {
      cc.pause();
      $('#play').removeClass('fa-pause').addClass('fa-play')
    }
})

$('#stop').on('click', () => {
    cc.disconnect();
    $('#cast').removeClass('session');
})

$('#back').on('click', () => {
    var goback = cc.progress - 1;
    if (goback <= 0) {
      goback = 0;
    }
    cc.seek(goback)
})

var slider = $('input[type="range"]').rangeslider({
  polyfill: false,
  onSlideEnd: function(pos, val) {
    if (cc.connected) {
      cc.seek(val, true);
    }
  }
});


cc.on('event', (event) => {
  //console.log('event:', event)
})

cc.on('available', () => {
  console.log('available')
})

cc.on('search', () => {
  console.log('searching')
})

cc.on('connect', () => {
  console.log('connected')
})

cc.on('disconnect', () => {
  console.log('disconnected')
})


cc.on('playing', () => {
  console.log('playing')
})

cc.on('pause', () => {
  console.log('paused')
})

cc.on('timeupdate', () => {
  //console.log('timeupdate:', cc.time, cc.timePretty, cc.duration, cc.durationPretty, cc.progress)
})

cc.on('volumechange', () => {
  console.log('volumechange:', cc.volumeLevel)
})

cc.on('end', () => {
  console.log('ended')
})

cc.on('buffering', () => {
  console.log('buffering')
})

cc.on('statechange', () => {
  console.log('statechange:', cc.state)
})

cc.on('mute', () => {
  console.log('muted', cc.muted)
})

cc.on('cancel', () => {
  console.log('canceled')
})

cc.on('error', (err) => {
  console.log('error:', err)
})