let songs = [
  ['लॉलीपॉप लागेलू', 'Pawan Singh • Bhojpuri Classics', '#e95226', 'dance', 'BZ_Pmu1g1ts'],
  ['दिलवा ले गईले राजा', 'Shilpi Raj • Bhojpuri hit', '#913fbe', 'love', '5kJMtNWUytY'],
  ['नथुनिया 2', 'Bhojpuri dance mix', '#e6a71c', 'dance', ''],
  ['पलंगिया सोने ना दिया', 'Bhojpuri late night', '#17706b', 'road', ''],
  ['छलकता हमरो गगरिया', 'Monsoon mix', '#177e90', 'love', ''],
  ['पुदीना ए हसीना', 'Full volume', '#cb4d44', 'dance', ''],
  ['चुनरिया लेले अइहा', 'Highway tunes', '#557b38', 'road', ''],
  ['गोरिया चली ना', 'Fresh arrival', '#a44b75', 'love', '']
];
let index = 1, playing = false, seconds = 0, duration = 222, timer, ytPlayer, ytReady = false, loadedVideoId = '';
const config = window.YT_CONFIG || { apiKey: '' };
const needsLocalServer = location.protocol === 'file:';
const $ = (selector) => document.querySelector(selector);
const songsEl = $('#songs');
const discoverGrid = $('#discoverGrid');
const liveCount = $('#liveCount');

function showToast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(showToast.timeout); showToast.timeout = setTimeout(() => $('#toast').classList.remove('show'), 2400); }
function renderSongs() { songsEl.innerHTML = songs.map((song, i) => `<article class="song" data-row="${i}"><span class="song-num">${String(i + 1).padStart(2, '0')}</span><span class="song-cover" style="--c:${song[2]}"></span><div><b>${song[0]}</b><small>${song[1]}</small></div><button type="button" data-song="${i}" aria-label="Play ${song[0]}">▶</button></article>`).join(''); document.querySelector('[data-filter="all"] span').textContent = String(songs.length).padStart(2, '0'); }
function renderDiscover(filter = 'all') { discoverGrid.innerHTML = songs.map((song, i) => `<article class="discover-card ${filter !== 'all' && song[3] !== filter ? 'hidden' : ''}" style="--card:${song[2]}" data-card="${i}"><small>${song[3].toUpperCase()} RIDE</small><b>${song[0]}</b><small>${song[1]}</small><div class="card-actions"><button type="button" class="heart" data-save="${i}" aria-label="Save ${song[0]}">♡</button><button type="button" class="card-play" data-play="${i}" aria-label="Play ${song[0]}">▶</button></div></article>`).join(''); }
function render() {
  const song = songs[index];
  $('#title').textContent = song[0]; $('#artist').textContent = song[1];
  $('#heroStatus').textContent = playing ? `चल रहा है — ${song[0]}` : 'आज के सबसे गरम गाने';
  document.querySelector('.progress i').style.width = `${Math.min(100, (seconds / duration) * 100)}%`;
  $('#elapsed').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  $('#play').textContent = playing ? '❚❚' : '▶'; $('#heroPlay').textContent = playing ? '❚❚' : '▶';
  document.querySelectorAll('.song').forEach(row => row.classList.toggle('active', +row.dataset.row === index));
  document.querySelectorAll('[data-song]').forEach(button => button.textContent = +button.dataset.song === index && playing ? '❚❚' : '▶');
}
function currentVideoId() { return songs[index]?.[4]; }
function startTimer() { clearInterval(timer); timer = setInterval(() => { if (ytReady && currentVideoId()) { seconds = Math.floor(ytPlayer.getCurrentTime() || 0); duration = Math.floor(ytPlayer.getDuration() || 222); } else { seconds++; if (seconds >= duration) change(index + 1, true); } render(); }, 500); }
function playCurrent() { const videoId = currentVideoId(); if (ytReady && videoId) { if (loadedVideoId === videoId) ytPlayer.playVideo(); else { loadedVideoId = videoId; ytPlayer.loadVideoById(videoId); } return true; } if (!videoId) showToast('Add your API key to unlock this fresh-hit track'); return false; }
function toggle() { if (needsLocalServer) { showToast('Start server.js, then open localhost:4173'); return; } if (playing) { playing = false; clearInterval(timer); if (ytReady && currentVideoId()) ytPlayer.pauseVideo(); render(); return; } if (ytReady && currentVideoId()) { playing = true; playCurrent(); startTimer(); render(); return; } if (currentVideoId()) { showToast('YouTube player is loading — try again in a moment'); return; } playing = true; startTimer(); render(); }
function change(nextIndex, keepPlaying = playing) { index = (nextIndex + songs.length) % songs.length; seconds = 0; clearInterval(timer); playing = keepPlaying; if (playing) { if (currentVideoId() && ytReady) playCurrent(); else if (!currentVideoId()) showToast('Connect the YouTube API key for this track'); startTimer(); } render(); if (!playing) showToast(`${songs[index][0]} selected`); }

window.onYouTubeIframeAPIReady = () => { ytPlayer = new YT.Player('youtubePlayer', { height: '200', width: '200', videoId: currentVideoId(), playerVars: { playsinline: 1, controls: 0, rel: 0, origin: location.origin }, events: { onReady: () => { ytReady = true; loadedVideoId = currentVideoId(); }, onError: () => showToast('This YouTube video is unavailable — choose another track'), onStateChange: event => { if (event.data === YT.PlayerState.PLAYING) { playing = true; startTimer(); } if (event.data === YT.PlayerState.PAUSED) { playing = false; clearInterval(timer); } if (event.data === YT.PlayerState.ENDED) change(index + 1, true); render(); } } }); };
if (needsLocalServer) { showToast('Audio needs http://localhost:4173 — see README'); } else { const youtubeScript = document.createElement('script'); youtubeScript.src = 'https://www.youtube.com/iframe_api'; youtubeScript.async = true; document.head.appendChild(youtubeScript); }

async function loadFreshHits() {
  try {
    const endpoint = config.apiKey ? (() => { const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); const url = new URL('https://www.googleapis.com/youtube/v3/search'); url.search = new URLSearchParams({ part: 'snippet', type: 'video', q: 'Bhojpuri new song -bhajan -bhakti -devotional -chhath -aarti', order: 'viewCount', publishedAfter: weekAgo, regionCode: 'IN', videoEmbeddable: 'true', videoSyndicated: 'true', maxResults: '24', key: config.apiKey }); return url; })() : '/api/fresh-hits';
    const response = await fetch(endpoint); if (!response.ok) throw new Error('request failed');
    const data = await response.json();
    const colors = ['#e95226', '#913fbe', '#e6a71c', '#17706b', '#177e90', '#cb4d44', '#557b38', '#a44b75'];
    const blocked = /\b(bhakti|bhajan|devotional|devotion|aarti|arti|chhath|shiv|shiva|mahadev|bholenath|ram|hanuman|durga|devi|mata|krishna|radha|navratri|sawan|kanwar|kawariya|islamic|naat|allah)\b|भक्ति|भजन|आरती|छठ|महादेव|भोलेनाथ|शिव|राम|हनुमान|दुर्गा|देवी|माता|कृष्ण|राधा|नवरात्रि|सावन|कांवड़|कावड़|नात|इस्लामिक/i;
    songs = data.items.filter(item => !blocked.test(`${item.snippet.title} ${item.snippet.channelTitle} ${item.snippet.description || ''}`)).slice(0, 12).map((item, i) => [item.snippet.title, item.snippet.channelTitle, colors[i % colors.length], ['dance', 'love', 'road'][i % 3], item.id.videoId]);
    if (!songs.length) throw new Error('no eligible music');
    index = 0; renderSongs(); renderDiscover(); render(); showToast('Fresh hits updated from YouTube');
  } catch { showToast('Could not load fresh hits — using the local selection'); }
}

$('#play').addEventListener('click', toggle); $('#heroPlay').addEventListener('click', toggle);
$('#next').addEventListener('click', () => change(index + 1)); $('#previous').addEventListener('click', () => change(index - 1));
$('#shuffle').addEventListener('click', () => change(Math.floor(Math.random() * songs.length)));
songsEl.addEventListener('click', event => { const button = event.target.closest('[data-song]'); if (!button) return; const selected = +button.dataset.song; if (selected === index) toggle(); else change(selected, true); });
$('#share').addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); showToast('Link copied to your clipboard'); } catch { showToast('Share link ready: copy this page URL'); } });
$('#mood').addEventListener('click', () => { const isDay = document.body.classList.toggle('day'); $('#mood').innerHTML = isDay ? '<span>☀</span> day' : '<span>☾</span> night'; showToast(isDay ? 'Day ride enabled' : 'Night ride enabled'); });
$('#queue').addEventListener('click', () => { $('#hitList').scrollIntoView({ behavior: 'smooth' }); showToast('Showing the hit list'); });
$('#info').addEventListener('click', () => showToast('YouTube playback • Space play • ← / → change song'));
document.querySelector('.playlist-grid').addEventListener('click', event => { const button = event.target.closest('[data-playlist]'); if (!button) return; const lane = button.dataset.playlist; const first = lane === 'all' ? 0 : songs.findIndex(song => song[3] === lane); if (first >= 0) change(first, true); document.querySelector('#discover').scrollIntoView({ behavior: 'smooth' }); });
document.querySelector('.moods').addEventListener('click', event => { const button = event.target.closest('[data-filter]'); if (!button) return; document.querySelectorAll('.mood-chip').forEach(chip => chip.classList.toggle('active', chip === button)); renderDiscover(button.dataset.filter); });
discoverGrid.addEventListener('click', event => { const playButton = event.target.closest('[data-play]'); const saveButton = event.target.closest('[data-save]'); if (playButton) change(+playButton.dataset.play, true); if (saveButton) { saveButton.classList.toggle('saved'); saveButton.textContent = saveButton.classList.contains('saved') ? '♥' : '♡'; showToast(saveButton.classList.contains('saved') ? 'Added to saved rides' : 'Removed from saved rides'); } });
document.addEventListener('keydown', event => { if (event.target.matches('input,textarea')) return; if (event.code === 'Space') { event.preventDefault(); toggle(); } if (event.key === 'ArrowRight') change(index + 1); if (event.key === 'ArrowLeft') change(index - 1); if (event.key.toLowerCase() === 'h') $('#hitList').scrollIntoView({ behavior: 'smooth' }); if (event.key.toLowerCase() === 's') $('#share').click(); });
function visitorId() { let id = localStorage.getItem('bhaukaal-visitor'); if (!id) { id = crypto.randomUUID?.() || Math.random().toString(36).slice(2); localStorage.setItem('bhaukaal-visitor', id); } return id; }
async function heartbeat() { if (needsLocalServer) return; try { const response = await fetch('/api/presence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorId: visitorId() }) }); if (!response.ok) throw new Error('presence unavailable'); const data = await response.json(); liveCount.textContent = data.online; } catch { liveCount.textContent = '—'; } }
document.addEventListener('visibilitychange', () => { if (!document.hidden) heartbeat(); });
renderSongs(); renderDiscover(); render(); loadFreshHits(); heartbeat(); setInterval(heartbeat, 25_000);
