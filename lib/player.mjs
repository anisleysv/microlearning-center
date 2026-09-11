let apiPromise;
function youtubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve,reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => failed(),15000);
    function failed() { clearTimeout(timer); script.remove(); apiPromise = null; reject(Error('No se pudo cargar YouTube. Reintenta o consulta la fuente original.')); }
    window.onYouTubeIframeAPIReady = () => { clearTimeout(timer); resolve(window.YT); };
    script.src = 'https://www.youtube.com/iframe_api'; script.onerror = failed;
    document.head.append(script);
  });
  return apiPromise;
}
export function createPlayer({ onProgress, onFinish, onStatus, onSpeed }) {
  let player, source, lesson, ready = false, awaitingCue = true, armed = false, generation = 0, speed = 1.5;
  const identityMatches = event => ready && lesson && (!event || event.target === player) && player.getVideoData().video_id === source.videoId;
  function revoke() { armed = false; awaitingCue = true; }
  function reset() {
    generation++; revoke(); ready = false; lesson = null;
    if (player) { try { player.pauseVideo(); player.destroy(); } catch { /* A detached iframe may already be unavailable. */ } }
    player = null;
    const host = document.getElementById('playerHost'); host.replaceChildren();
    const target = document.createElement('div'); target.id = 'player'; host.append(target);
  }
  function finish() {
    if (!identityMatches() || !armed || player.getCurrentTime() < lesson.endSeconds - 0.25) return;
    const finished = lesson; revoke(); player.pauseVideo(); onFinish(finished.id);
  }
  function update() {
    if (!identityMatches() || !armed || player.getPlayerState() !== window.YT.PlayerState.PLAYING) return;
    const time = player.getCurrentTime(); onProgress(time);
    if (time >= lesson.endSeconds) finish();
  }
  // One timer for the controller lifetime, regardless of how many materials are selected.
  const timer = window.setInterval(update,250);
  async function setSource(nextSource, initialLesson, playbackSpeed) {
    reset(); source = nextSource; lesson = initialLesson; speed = playbackSpeed;
    const token = generation;
    try {
      const YT = await youtubeAPI();
      if (token !== generation) return;
      player = new YT.Player('player', {
        videoId:source.videoId,
        playerVars:{playsinline:1,rel:0,autoplay:0,controls:1,cc_load_policy:1,cc_lang_pref:source.language,hl:source.language,start:lesson.startSeconds,origin:location.origin},
        events:{
          onReady(event) {
            if (token !== generation || event.target !== player) return;
            ready = true; player.getIframe().title = 'Reproductor de YouTube: ' + source.officialTitle;
            cue(lesson);
          },
          onStateChange(event) {
            if (token !== generation || !identityMatches(event)) return;
            const time = player.getCurrentTime();
            if (event.data === YT.PlayerState.CUED) {
              if (player.getPlayerState() === YT.PlayerState.CUED && time >= lesson.startSeconds - 1 && time < lesson.endSeconds) awaitingCue = false;
            } else if (event.data === YT.PlayerState.PLAYING) {
              if (awaitingCue) { player.pauseVideo(); return; }
              if (!armed && time >= lesson.startSeconds - 1 && time < lesson.endSeconds) { armed = true; player.setPlaybackRate(speed); onStatus(''); }
              update();
            } else if (event.data === YT.PlayerState.PAUSED && armed) onProgress(time);
            else if (event.data === YT.PlayerState.ENDED) finish();
          },
          onPlaybackRateChange(event) { if (token === generation && identityMatches(event) && armed && !awaitingCue) onSpeed(event.data); },
          onError(event) { if (token === generation && event.target === player) onStatus('No se pudo reproducir el video. Vuelve a seleccionar una lección o visita la fuente original.'); }
        }
      });
    } catch (error) { if (token === generation) onStatus(error.message, true); }
  }
  function cue(next) {
    revoke(); lesson = next;
    if (!ready) return;
    player.pauseVideo();
    player.cueVideoById({videoId:source.videoId,startSeconds:lesson.startSeconds,endSeconds:lesson.endSeconds});
  }
  return { setSource, cue, reset, pause() { revoke(); if (ready) player.pauseVideo(); }, setSpeed(value) { speed = value; if (ready) player.setPlaybackRate(speed); }, destroy() { reset(); clearInterval(timer); } };
}
