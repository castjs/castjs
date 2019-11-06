var cc = new Castjs();
cc.on('available', () => {
  $('#cast').removeClass('disabled')
})
cc.on('session', () => {
  $('#cast').removeClass('disabled')
  $('#cast').addClass('session')
  if (cc.media.paused) {
    $('#play').removeClass('fa-pause').addClass('fa-play')
  } else {
    $('#play').removeClass('fa-play').addClass('fa-pause')
  }
})
cc.on('disconnect', () => {
  $('#cast').removeClass('session')
})
cc.on('state', (state) => {
  console.log(state)
  $('.state').text(state)
})
cc.on('pause', () => {
  if (cc.media.paused) {
    $('#play').removeClass('fa-pause').addClass('fa-play')
  } else {
    $('#play').removeClass('fa-play').addClass('fa-pause')
  }
})
cc.on('mute', () => {
  if (cc.media.muted) {
    $('#mute').removeClass('fa-volume-up').addClass('fa-volume-mute')
  } else {
    $('#mute').removeClass('fa-volume-mute').addClass('fa-volume-up')
  }
})
cc.on('time', (obj) => {
  $('.time').text(obj.time);
  $('.duration').text(obj.duration);
  $('input[type="range"]').attr('value', obj.progress);
  $('input[type="range"]').rangeslider('update', true);
})
$('#cast').on('click', () => {
  if (cc.available) {
    cc.cast('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', {
      poster:      'https://fenny.github.io/Castjs/demo/poster.jpg',
      title:       'Sintel',
      description: 'Third Open Movie by Blender Foundation',
      subtitles: [{
          active: true,
          label:  'English',
          src:    'https://fenny.github.io/Castjs/demo/english.vtt'
      }, {
          label:  'Spanish',
          src:    'https://fenny.github.io/Castjs/demo/spanish.vtt'
      }],
      muted:  false,
      paused: false
    })
  }
})
$('.jq-dropdown-menu').on('click', 'a', function(e) {
  e.preventDefault();
  var index = $(this).attr('href')
  if (cc.session) {
    cc.subtitle(index)
  }
  $('.jq-dropdown-menu a').removeClass('active')
  $(this).addClass('active')
})
$('#mute').on('click', () => {
  if (cc.session) {
    if ($('#mute').hasClass('fa-volume-up')) {
      cc.mute(true);
      $('#mute').removeClass('fa-volume-up').addClass('fa-volume-mute')
    } else {
      cc.mute(false);
      $('#mute').removeClass('fa-volume-mute').addClass('fa-volume-up')
    }
  }
})
$('#play').on('click', () => {
  if (cc.session) {
    if ($('#play').hasClass('fa-play')) {
      cc.play();
      $('#play').removeClass('fa-play').addClass('fa-pause')
    } else {
      cc.pause();
      $('#play').removeClass('fa-pause').addClass('fa-play')
    }
  }
})
$('#stop').on('click', () => {
  if (cc.session) {
    cc.disconnect();
    $('#cast').removeClass('session');
  }
})
$('#back').on('click', () => {
  if (cc.session) {
    var goback = cc.media.progress - 1;
    if (goback <= 0) {
      goback = 0;
    }
    cc.seek(goback)
  }
})
var slider = $('input[type="range"]').rangeslider({
  polyfill: false,
  onSlideEnd: function(pos, val) {
    if (cc.session) {
      cc.seek(val)
    }
  }
});
