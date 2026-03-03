/* ============================================================
   F1 ENGINE SOUND + RACE TRACK — mrchaos10 Portfolio
   Scroll-triggered engine vroom + milestone car animation
   ============================================================ */
'use strict';

// ── F1 AUDIO ENGINE ─────────────────────────────────────────────
var F1 = {
  ctx:      null,
  enabled:  false,
  muted:    false,
  cooldown: false,
  lastY:    window.scrollY,

  init: function () {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this.enabled = true;
    } catch (e) { /* audio unavailable */ }
  },

  resume: function () {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  playVroom: function (intensity) {
    if (!this.ctx || !this.enabled || this.muted) return;
    this.resume();
    intensity = Math.max(0.05, Math.min(1, intensity));

    var ctx     = this.ctx;
    var now     = ctx.currentTime;
    var dur     = 0.35 + intensity * 0.55;
    var baseHz  = 55  + intensity * 55;
    var peakHz  = 140 + intensity * 580;

    /* Main sawtooth rev */
    var osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(baseHz, now);
    osc1.frequency.exponentialRampToValueAtTime(peakHz,        now + dur * 0.32);
    osc1.frequency.exponentialRampToValueAtTime(baseHz * 1.4,  now + dur);

    /* Sub-harmonic body */
    var osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(baseHz * 0.5, now);
    osc2.frequency.exponentialRampToValueAtTime(peakHz * 0.45, now + dur * 0.32);
    osc2.frequency.exponentialRampToValueAtTime(baseHz * 0.7,  now + dur);

    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600 + intensity * 900;
    filter.Q.value = 1.4;

    var gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0,                        now);
    gainNode.gain.linearRampToValueAtTime(0.11 + intensity * 0.09, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.001,      now + dur);

    [osc1, osc2].forEach(function (o) { o.connect(filter); });
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now); osc2.start(now);
    osc1.stop(now + dur + 0.05);
    osc2.stop(now + dur + 0.05);
  },

  onScroll: function () {
    var sy = window.scrollY;
    var dy = Math.abs(sy - this.lastY);
    this.lastY = sy;
    if (!this.enabled && dy > 4) this.init();
    if (!this.enabled || this.muted || this.cooldown || dy < 6) return;
    var self = this;
    this.cooldown = true;
    this.playVroom(Math.min(dy / 80, 1));
    setTimeout(function () { self.cooldown = false; }, 150);
  }
};

window.addEventListener('scroll', function () { F1.onScroll(); }, { passive: true });
document.addEventListener('click', function () { if (!F1.enabled) F1.init(); }, { once: true });

// ── SOUND TOGGLE BUTTON ─────────────────────────────────────────
(function () {
  var btn = document.createElement('button');
  btn.id        = 'f1SoundBtn';
  btn.className = 'f1-sound-btn';
  btn.setAttribute('aria-label', 'Toggle F1 engine sound');
  btn.title     = 'Toggle F1 Engine Sound';
  btn.innerHTML = '<i class="fas fa-volume-up" aria-hidden="true"></i><span>F1 Sound</span>';
  document.body.appendChild(btn);

  btn.addEventListener('click', function () {
    if (!F1.enabled) {
      F1.init();
      F1.muted = false;
    } else {
      F1.muted = !F1.muted;
    }
    var icon = btn.querySelector('i');
    icon.className = F1.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    btn.classList.toggle('f1-muted', F1.muted);
    if (!F1.muted) F1.playVroom(0.85);
  });
}());

// ── F1 RACE TRACK (experience.html only) ────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  var wrapper  = document.getElementById('f1RaceWrapper');
  var strip    = document.getElementById('f1TrackStrip');
  var carEl    = document.getElementById('f1Car');
  var cardsCol = document.getElementById('f1CardsCol');

  if (!wrapper || !strip || !carEl || !cardsCol) return;

  var cards = Array.from(cardsCol.querySelectorAll('.exp-card'));
  if (!cards.length) return;

  /* Build milestone dots on the track strip */
  var dots = cards.map(function (card, i) {
    var d = document.createElement('div');
    d.className = 'f1-milestone-dot';
    d.setAttribute('aria-hidden', 'true');
    d.setAttribute('title', 'Milestone ' + (i + 1));
    strip.appendChild(d);
    return d;
  });

  var currentCard = -1;

  function recalc() {
    var colH = cardsCol.offsetHeight;
    if (!colH) return;
    cards.forEach(function (card, i) {
      var mid = card.offsetTop - cardsCol.offsetTop + card.offsetHeight * 0.5;
      var pct = Math.max(1, Math.min(99, (mid / colH) * 100));
      if (dots[i]) dots[i].style.top = pct + '%';
    });
  }

  function moveCar() {
    var viewMid = window.innerHeight * 0.38;
    var best = 0, bestDist = Infinity;
    cards.forEach(function (card, i) {
      var r    = card.getBoundingClientRect();
      var dist = Math.abs((r.top + r.height * 0.25) - viewMid);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });

    if (best === currentCard) return;
    currentCard = best;

    if (dots[best] && dots[best].style.top) {
      carEl.style.top = 'calc(' + dots[best].style.top + ' - 35px)';
      carEl.classList.add('f1-revving');
      F1.playVroom(0.88);
      setTimeout(function () { carEl.classList.remove('f1-revving'); }, 550);
    }

    dots.forEach(function (d, i) { d.classList.toggle('active', i === best); });
  }

  recalc();
  moveCar();

  window.addEventListener('scroll', moveCar, { passive: true });
  window.addEventListener('resize', function () { recalc(); moveCar(); });
});
