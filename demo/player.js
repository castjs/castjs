function debug(msg) {
  var d = new Date();
  var n = d.toLocaleTimeString().split(' ')[0]
  if (typeof msg === 'string') {
    $('#debug').append('[' + n + '] ' + msg + '\n')
  } else {
    $('#debug').append('[' + n + '] ' + JSON.stringify(msg) + '\n')
  }
  var textarea = document.getElementById('debug');
textarea.scrollTop = textarea.scrollHeight;
}

var cjs = new Castjs();

cjs.on('event', (e) => {
  if (e === 'statechange') {
    debug(e + '\t: ' + cjs.state)
  } else if (e === 'volumechange') {
    debug(e + '\t: ' + cjs.volumeLevel)
  } else if (e === 'timeupdate') {
    debug(e + '\t: ' + cjs.timePretty + ' - ' + cjs.durationPretty)
  } else if (e === 'playing') {
    debug(e + '\t: ' + cjs.title)
  } else if (e === 'connect') {
    debug(e + '\t: ' + cjs.device)
  } else if (e === 'available') {
    debug(e + '\t: Castjs ' + cjs.version)
  } else if (e === 'buffering') {
    debug(e + '\t: ' + cjs.timePretty)
  } else if (e === 'mute') {
    debug(e + '\t\t: ' + cjs.volumeLevel)
  } else if (e === 'unmute') {
    debug(e + '\t: ' + cjs.volumeLevel)
  } else if (e === 'pause') {
    debug(e + '\t: ' + cjs.timePretty)
  } else if (e === 'disconnect') {
    debug(e + '\t: ' + cjs.device)
  } else {
    debug(e)
  }
})

cjs.on('available', () => {
  $('#cast').removeClass('disabled')
})

cjs.on('connect', () => {
  $('#cast').removeClass('disabled')
  $('#cast').addClass('connected')
  if (cjs.paused) {
    $('#play').removeClass('fa-pause').addClass('fa-play')
  } else {
    $('#play').removeClass('fa-play').addClass('fa-pause')
  }
})

cjs.on('mute', () => {
  $('#mute').removeClass('fa-volume-up').addClass('fa-volume-mute')
})

cjs.on('unmute', () => {
  $('#mute').removeClass('fa-volume-mute').addClass('fa-volume-up')
})

cjs.on('statechange', () => {
  $('#state').text(cjs.device + ': ' + cjs.state)
})

cjs.on('buffering', () => {
  //debug('Event -> buffering')
})


cjs.on('playing', () => {
  $('#play').removeClass('fa-play').addClass('fa-pause')
})

cjs.on('pause', () => {
  $('#play').removeClass('fa-pause').addClass('fa-play')
})

cjs.on('timeupdate', () => {
  $('#time').text(cjs.timePretty);
  $('#duration').text(cjs.durationPretty);
  $('#range').attr('value', cjs.progress);
  $('#range').rangeslider('update', true);
})

cjs.on('error', (err) => {
  debug('Event -> error: ' + err)
})

$('#cast').on('click', () => {
  if (cjs.available) {
    cjs.cast('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', {
      poster     : 'https://castjs.io/demo/poster.jpg',
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
  cjs.subtitle(index)
  $('.jq-dropdown-menu a').removeClass('active')
  $(this).addClass('active')
})

$('#mute').on('click', () => {
    if ($('#mute').hasClass('fa-volume-up')) {
      cjs.mute()
      $('#mute').removeClass('fa-volume-up').addClass('fa-volume-mute')
    } else {
      cjs.unmute()
      $('#mute').removeClass('fa-volume-mute').addClass('fa-volume-up')
    }
})

$('#play').on('click', () => {
    if ($('#play').hasClass('fa-play')) {
      cjs.play();
      $('#play').removeClass('fa-play').addClass('fa-pause')
    } else {
      cjs.pause();
      $('#play').removeClass('fa-pause').addClass('fa-play')
    }
})

$('#stop').on('click', () => {
    cjs.disconnect();
    $('#cast').removeClass('connected');
})

$('#back').on('click', () => {
  var goback = cjs.time - 30;
  if (goback < 1) {
    goback = 0;
  }
  cjs.seek(goback)
})
$('#forward').on('click', () => {
  var goforward = cjs.time + 30;
  if (goforward >= cjs.duration) {
    goforward = cjs.duration;
  }
  cjs.seek(goforward)
})

var slider = $('input[type="range"]').rangeslider({
  polyfill: false,
  onSlideEnd: function(pos, val) {
    if (cjs.connected) {
      cjs.seek(val, true);
    }
  }
});