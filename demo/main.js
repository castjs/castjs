var cc = new Castjs();
var $debug    = $('#debug');

var $metadata = {
  source:      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  poster:      'https://fenny.github.io/Castjs/demo/poster.png',
  title:       'Sintel',
  description: 'Third Open Movie by Blender Foundation',
  subtitles: [{
      active: true,
      label:  'English',
      src:    'https://fenny.github.io/Castjs/demo/english.vtt'
  }, {
      label:  'Spanish',
      src:    'https://fenny.github.io/Castjs/demo/spanish.vtt'
  }]
};
$('#video').on('seeked', () => {
  if (cc.session) {
    cc.seek(Math.floor(($('#video')[0].currentTime/$('#video')[0].duration) * 100))
  }
})
$('#video').on('pause', () => {
  if (cc.session) {
    cc.pause()
  }
})
$('#video').on('play', () => {
  if (cc.session) {
    cc.play()
  }
})
$('#video').on('volumechange', () => {
  if (cc.session) {
    cc.volume($('#video')[0].volume)
  }
})
updateUI()
$('#cast').on('click', () => {
  $metadata.source = $('#source').val()
  $metadata.poster = $('#poster').val()
  $metadata.title = $('#title').val()
  $metadata.description = $('#description').val()
  $metadata.subtitles = []
  if ($('#subtitle-1').val()) {
    $metadata.subtitles.push({
      active: true,
      label:  $('#subtitle-1').val().substring($('#subtitle-1').val().lastIndexOf('/')+1).split('.')[0],
      src:    $('#subtitle-1').val()
    })
  }
  if ($('#subtitle-2').val()) {
    $metadata.subtitles.push({
      label:  $('#subtitle-2').val().substring($('#subtitle-2').val().lastIndexOf('/')+1).split('.')[0],
      src:    $('#subtitle-2').val()
    })
  }
  updateUI()
  cc.cast($metadata.source, $metadata);
})
$('#disconnect').on('click', () => {
  if (cc.session) {
    cc.disconnect();
    $('#video')[0].currentTime = 0;
    $('#video')[0].pause()
  }
})
function updateUI() {
  $('#source').val($metadata.source || $metadata.src);
  $('#poster').val($metadata.poster);
  $('#title').val($metadata.title);
  $('#description').val($metadata.description)
  for (var i = 0; i < 2; i++) {
    $('#subtitle-' + (i + 1)).val($metadata.subtitles[i].src);
  }
  $('#video').attr('src', $metadata.source || $metadata.src)
  if ($metadata.paused) {
    $('#video')[0].pause()
  } else {
    $('#video')[0].play()
  }
  $('#video').on('loadedmetadata', () => {
    try {
      $('#video')[0].currentTime = ($('#video')[0].duration / 100) * $metadata.progress;
    } catch (err) {

    }
  })
}

cc.on('available', () => {
  $('#cast').removeClass('disabled')
});
cc.on('session', () => {
  $('#cast').hide()
  $('#disconnect').show();
  $metadata = cc.media;
  updateUI()
  $debug.html(JSON.stringify(cc.media, undefined, 2));
})
cc.on('state', () => {
  $debug.html(JSON.stringify(cc.media, undefined, 2));
})
cc.on('time', () => {
  $debug.html(JSON.stringify(cc.media, undefined, 2));
})
cc.on('volume', () => {
  $debug.html(JSON.stringify(cc.media, undefined, 2));
})
cc.on('mute', () => {
  $debug.html(JSON.stringify(cc.media, undefined, 2));
})
cc.on('pause', () => {
  $debug.html(JSON.stringify(cc.media, undefined, 2));
})
cc.on('end', () => {
  $debug.html(JSON.stringify(cc.media, undefined, 2));
})
cc.on('disconnected', () => {
  $('#cast').show();
  $('#disconnect').hide();
  $debug.html('Disconnected');
})
cc.on('error', (err) => {
  $debug.html(err);
})
