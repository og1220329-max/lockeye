/* Logo builder */
function buildLogo(size, ring) {
  var vb = ring ? 120 : 108;
  var off = ring ? 6 : 0;
  function rays(cx, cy, rIn, rOut, count, cA, cB) {
    var s = '';
    for (var i = 0; i < count; i++) {
      var a = (i / count) * Math.PI * 2;
      var x1 = cx + Math.cos(a) * rIn, y1 = cy + Math.sin(a) * rIn;
      var x2 = cx + Math.cos(a) * rOut, y2 = cy + Math.sin(a) * rOut;
      s += '<line x1="' + x1.toFixed(2) + '" y1="' + y1.toFixed(2) + '" x2="' + x2.toFixed(2) + '" y2="' + y2.toFixed(2) + '" stroke="' + (i % 2 ? cA : cB) + '" stroke-width="' + (i % 2 ? 1 : 0.6) + '" stroke-opacity="' + (i % 2 ? 0.85 : 0.5) + '" stroke-linecap="round"/>';
    }
    return s;
  }
  function lens(id, x, y, hot, ray1, ray2) {
    var w = 46, cx = x + w / 2, cy = y + w / 2, r = w / 2 - 3;
    return '<defs><clipPath id="clip-' + id + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + w + '" rx="11"/></clipPath><radialGradient id="glow-' + id + '" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFF4E6"/><stop offset="22%" stop-color="' + hot + '"/><stop offset="60%" stop-color="' + ray2 + '" stop-opacity="0.35"/><stop offset="100%" stop-color="#150B09" stop-opacity="0"/></radialGradient></defs><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + w + '" rx="11" fill="#160C0A"/><g clip-path="url(#clip-' + id + ')"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + w + '" fill="#1A0E0C"/>' + rays(cx, cy, 3, r + 4, 72, ray1, ray2) + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#glow-' + id + ')"/><circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#FFF7EC"/></g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + w + '" rx="11" fill="none" stroke="#3A1C18" stroke-width="1.4"/>';
  }
  var goggles = '<g transform="translate(' + (off + 2) + ',' + (off + (ring ? 34 : 31)) + ')">' + lens('L', 0, 0, '#FF6A5A', '#E0352A', '#7A1620') + lens('R', 50, 0, '#FFB04A', '#FF8A1E', '#8A3D08') + '<rect x="44" y="16" width="8" height="14" rx="3" fill="#1A0E0C"/><rect x="-7" y="17" width="7" height="12" rx="3" fill="#241412"/><rect x="96" y="17" width="7" height="12" rx="3" fill="#241412"/></g>';
  var ringEls = ring ? '<circle cx="' + (vb / 2) + '" cy="' + (vb / 2) + '" r="' + (vb / 2 - 3) + '" fill="#F4F2EC" stroke="#8B1A2E" stroke-width="5"/><circle cx="' + (vb / 2) + '" cy="' + (vb / 2) + '" r="' + (vb / 2 - 9) + '" fill="none" stroke="#E2A06A" stroke-width="1.2" stroke-opacity="0.6"/>' : '';
  return '<svg width="' + size + '" height="' + size * (ring ? 1 : 0.62) + '" viewBox="0 0 ' + vb + ' ' + (ring ? vb : 67) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="LockEye logo">' + ringEls + goggles + '</svg>';
}
document.querySelectorAll('.logo-mark').forEach(function(el) {
  var size = parseInt(el.dataset.size || '42', 10);
  var ring = el.dataset.ring === '1';
  el.innerHTML = buildLogo(size, ring);
});

/* Loader */
window.addEventListener('load', function() {
  setTimeout(function() {
    document.getElementById('loader').classList.add('done');
  }, 1750);
  loadSiteSettings();
  buildPricing();
});


/* Site settings */
async function loadSiteSettings() {
  try {
    var res = await fetch('/api/settings');
    var s = await res.json();
    var emailEl = document.getElementById('displayEmail');
    var respEl = document.getElementById('displayResponse');
    if (emailEl && s.contact && s.contact.email) emailEl.textContent = s.contact.email;
    if (respEl && s.contact && s.contact.responseTime) respEl.textContent = s.contact.responseTime;
    document.querySelectorAll('a[href^="mailto:"]').forEach(function(a) {
      if (s.contact && s.contact.email) a.href = 'mailto:' + s.contact.email;
    });
  } catch (e) {}
}

/* Nav scroll */
var topNav = document.getElementById('topNav');
if (topNav) {
  window.addEventListener('scroll', function() {
    topNav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

/* Scroll progress bar */
(function() {
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.insertBefore(bar, document.body.firstChild);
  function update() {
    var scrolled = window.scrollY;
    var total = document.documentElement.scrollHeight - window.innerHeight;
    var pct = total > 0 ? (scrolled / total) * 100 : 0;
    bar.style.width = Math.min(pct, 100) + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* Reveal observer */
var revealIO = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(function(el) { revealIO.observe(el); });

/* Mobile tab bar active tracking */
(function() {
  var tabs = document.querySelectorAll('.mtb-item');
  if (!tabs.length) return;
  var targets = Array.from(tabs).map(function(t) { return document.getElementById(t.dataset.target); }).filter(Boolean);
  function setActive(id) {
    tabs.forEach(function(t) { t.classList.toggle('active', t.dataset.target === id); });
  }
  var tabIO = new IntersectionObserver(function(entries) {
    var visible = entries.filter(function(e) { return e.isIntersecting; });
    if (visible.length) {
      visible.sort(function(a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      setActive(visible[0].target.id);
    }
  }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
  targets.forEach(function(t) { tabIO.observe(t); });
  tabs.forEach(function(t) {
    t.addEventListener('click', function() { setActive(t.dataset.target); });
  });
})();

/* Pricing */
function buildPricing() {
  var grid = document.getElementById('priceGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="plan reveal tilt"><div class="pname">Free</div><div class="price">$0</div><div class="price-cap">The standard experience: money on the line, verified check-ins, a streak to protect.</div><ul><li><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 7L9 18l-5-5"/></svg> Stake money to show up</li><li><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 7L9 18l-5-5"/></svg> GPS + selfie check-in</li><li><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 7L9 18l-5-5"/></svg> Basic streak tracking</li><li><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 7L9 18l-5-5"/></svg> Charity routing on skip</li></ul><a class="btn btn-ghost" href="/demo">Start free &rarr;</a></div><div class="plan pro reveal tilt"><span class="plan-tag">Most popular</span><div class="pname" style="color:var(--maroon)">LockEye Pro &middot; Lifetime</div><div class="price">$24.99 <small>$99.99</small></div><div class="price-cap">Everything in Free, plus the tools that make skipping even harder to justify.</div><ul><li><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 7L9 18l-5-5"/></svg> Unlimited goals</li><li><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 7L9 18l-5-5"/></svg> 1 grace pass / month</li><li><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 7L9 18l-5-5"/></svg> Streak revival token</li><li><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 7L9 18l-5-5"/></svg> 1.5&times; points multiplier</li><li><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 7L9 18l-5-5"/></svg> Group challenges + founder badge</li></ul><a class="btn btn-hero" href="#" id="claim-founder-btn">Claim founder price &rarr;</a><div class="scarce"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B1A2E" stroke-width="2"><path d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-2-1-3-1-3 2 1 3 3 3 5a5 5 0 0 1-10 0c0-5 5-7 5-11z"/></svg> First 2,000 founders only</div></div>';
  var claimBtn = document.getElementById('claim-founder-btn');
  if (claimBtn) {
    claimBtn.addEventListener('click', function(e) {
      e.preventDefault();
      setEmailMode('founder');
      var input = document.getElementById('em-input');
      if (input) { input.value = ''; input.style.borderColor = ''; }
      openEmailModal();
      setTimeout(function() { try { input.focus(); } catch (_) {} }, 380);
    });
  }
}

/* Demo */
(function() {
  var CHARITIES = [
    { name: 'St. Jude Children\'s Research', sub: 'Childhood cancer treatment & research' },
    { name: 'Feeding America', sub: 'Fighting food insecurity nationwide' },
    { name: 'ASPCA', sub: 'Animal welfare & rescue' },
    { name: 'Khan Academy', sub: 'Free education for everyone' }
  ];
  var state = { stake: 30, charity: null, verified: [], outcome: null };
  var currentStep = 0;
  var STEPS = ['Stake', 'Charity', 'Verify', 'Result'];

  function money(n) { return '$' + Math.round(n).toLocaleString(); }

  function renderDots() {
    var wrap = document.getElementById('dsn-steps');
    if (!wrap) return;
    wrap.innerHTML = STEPS.map(function(s, i) {
      var cls = 'dsn-dot';
      if (i < currentStep) cls += ' done';
      if (i === currentStep) cls += ' active';
      return '<div class="' + cls + '" title="' + s + '"></div>';
    }).join('');
  }

  function updateReceipt() {
    var staked = document.getElementById('dr-staked');
    var outcome = document.getElementById('dr-outcome');
    var charity = document.getElementById('dr-charity');
    if (!staked) return;
    staked.textContent = money(state.stake);
    if (state.outcome === 'kept') {
      outcome.textContent = 'Kept'; outcome.style.color = 'var(--green)';
      charity.textContent = '$0';
    } else if (state.outcome === 'skipped') {
      outcome.textContent = 'Forfeited'; outcome.style.color = 'var(--maroon)';
      charity.textContent = money(state.stake * 0.85);
    } else {
      outcome.textContent = 'Pending'; outcome.style.color = 'var(--ink-soft)';
      charity.textContent = '$0';
    }
  }

  function phoneHTML(dir) {
    var anim = dir === 'back' ? 'ph-screen-back' : 'ph-screen-inner';
    var top = '<div class="ph-top"><span>LOCKEYE 5G</span><span class="live"><i></i> SECURE</span><span>9:41 AM</span></div>';
    if (currentStep === 0) return '<div class="' + anim + '">' + top + '<div class="ph-label">Set your stake <span class="stake-pill">step 1 of 4</span></div><div class="goal-card"><div class="goal-title" style="font-size:15px;margin-bottom:10px">How much is a skipped session worth to you?</div><div style="background:var(--cream-2);border-radius:14px;padding:20px;text-align:center;margin-bottom:12px"><div style="font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft);margin-bottom:6px">Your stake</div><div style="font-family:var(--display);font-weight:800;font-size:42px;color:var(--maroon);letter-spacing:-.03em" id="ph-stake-big">' + money(state.stake) + '</div></div><div style="font-size:12px;color:var(--ink-soft);text-align:center">If you skip, 85% goes to your charity</div></div></div>';
    if (currentStep === 1) return '<div class="' + anim + '">' + top + '<div class="ph-label">Choose your charity <span class="stake-pill">step 2 of 4</span></div><div class="goal-card" style="padding:12px"><div style="font-size:12px;color:var(--ink-soft);margin-bottom:10px">Where your forfeits go if you skip:</div>' + CHARITIES.map(function(c, i) { return '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;margin-bottom:6px;background:' + (state.charity === i ? '#F3DEE2' : 'var(--cream-2)') + ';border:1px solid ' + (state.charity === i ? 'var(--maroon)' : 'transparent') + '"><span style="font-size:12px;font-weight:600;color:' + (state.charity === i ? 'var(--maroon)' : 'var(--ink)') + '">' + c.name + '</span></div>'; }).join('') + '</div></div>';
    if (currentStep === 2) {
      var gps = state.verified.indexOf('gps') !== -1, selfie = state.verified.indexOf('selfie') !== -1;
      return '<div class="' + anim + '">' + top + '<div class="ph-label">Verification <span class="stake-pill">step 3 of 4</span></div><div class="goal-card"><div class="goal-title" style="font-size:14px;margin-bottom:12px">Tap each to simulate verification</div>' + [['gps', 'GPS location', 'At Gold\'s Gym &middot; confirmed', gps, '<path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/>'], ['selfie', 'Selfie check', 'Face matched &middot; liveness OK', selfie, '<rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="4"/><path d="M8 6l1.5-2h5L16 6"/>']].map(function(v) { return '<div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:11px;margin-bottom:8px;background:' + (v[3] ? 'rgba(31,138,85,.1)' : 'var(--cream-2)') + ';border:1.5px solid ' + (v[3] ? 'var(--green)' : 'var(--line)') + '"><div style="width:28px;height:28px;border-radius:8px;background:' + (v[3] ? 'rgba(31,138,85,.15)' : 'var(--cream)') + ';display:flex;align-items:center;justify-content:center;flex:0 0 auto"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + (v[3] ? 'var(--green)' : 'var(--ink-soft)') + '" stroke-width="2">' + v[4] + '</svg></div><div style="flex:1"><div style="font-size:13px;font-weight:600">' + v[1] + '</div><div style="font-size:11px;color:var(--ink-soft)">' + (v[3] ? v[2] : 'Pending...') + '</div></div><div style="width:20px;height:20px;border-radius:50%;background:' + (v[3] ? 'var(--green)' : 'var(--line)') + ';display:flex;align-items:center;justify-content:center">' + (v[3] ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 7L9 18l-5-5"/></svg>' : '') + '</div></div>'; }).join('') + '</div></div>';
    }
    if (currentStep === 3) return '<div class="' + anim + '">' + top + '<div class="ph-label">What happened? <span class="stake-pill">step 4 of 4</span></div><div class="goal-card"><div class="goal-title" style="font-size:14px;margin-bottom:14px">Simulate your morning decision</div><div style="background:' + (state.outcome === 'kept' ? 'rgba(31,138,85,.1)' : state.outcome === 'skipped' ? 'rgba(139,26,46,.1)' : 'var(--cream-2)') + ';border-radius:14px;padding:18px;text-align:center;margin-bottom:10px;border:1.5px solid ' + (state.outcome === 'kept' ? 'var(--green)' : state.outcome === 'skipped' ? 'var(--maroon)' : 'var(--line)') + '"><div style="font-family:var(--display);font-weight:800;font-size:22px;color:' + (state.outcome === 'kept' ? 'var(--green)' : state.outcome === 'skipped' ? 'var(--maroon)' : 'var(--ink-soft)') + '">' + (state.outcome === 'kept' ? 'You showed up.' : state.outcome === 'skipped' ? 'You skipped.' : 'Waiting...') + '</div>' + (state.outcome ? '<div style="font-size:12px;color:var(--ink-soft);margin-top:6px">' + (state.outcome === 'kept' ? money(state.stake) + ' stays in your wallet' : '85% to ' + (CHARITIES[state.charity] ? CHARITIES[state.charity].name : 'your charity')) + '</div>' : '') + '</div></div></div>';
    if (currentStep === 4) {
      var kept = state.outcome === 'kept';
      return '<div class="' + anim + '">' + top + '<div class="ph-label">Session result <span class="stake-pill">complete</span></div><div class="goal-card"><div style="text-align:center;padding:10px 0 14px"><div style="width:48px;height:48px;border-radius:50%;background:' + (kept ? 'rgba(31,138,85,.15)' : 'rgba(139,26,46,.1)') + ';display:flex;align-items:center;justify-content:center;margin:0 auto 12px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="' + (kept ? 'var(--green)' : 'var(--maroon)') + '" stroke-width="2.5">' + (kept ? '<path d="M20 7L9 18l-5-5"/>' : '<path d="M5 12h14M13 6l6 6-6 6"/>') + '</svg></div><div style="font-family:var(--display);font-weight:800;font-size:20px;color:' + (kept ? 'var(--green)' : 'var(--maroon)') + '">' + (kept ? 'Wallet kept.' : 'Money moved.') + '</div><div style="font-size:12px;color:var(--ink-soft);margin-top:6px">' + (kept ? money(state.stake) + ' returned to you.' : money(state.stake * 0.85) + ' sent to ' + (CHARITIES[state.charity] ? CHARITIES[state.charity].name : 'charity')) + '</div></div><div style="background:var(--cream-2);border-radius:12px;padding:12px 14px"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px"><span>Staked</span><b>' + money(state.stake) + '</b></div><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px"><span>To wallet</span><b style="color:' + (kept ? 'var(--green)' : 'var(--ink-soft)') + '">' + (kept ? money(state.stake) : '$0') + '</b></div><div style="display:flex;justify-content:space-between;font-size:12.5px"><span>To charity</span><b style="color:var(--maroon)">' + (kept ? '$0' : money(state.stake * 0.85)) + '</b></div></div><div style="font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-soft);text-align:center;margin-top:12px">Streak: ' + (kept ? '8 days' : '0 days, reset') + '</div></div></div>';
    }
    return '';
  }

  function ctrlHTML() {
    var cc = document.getElementById('demo-ctrl-content');
    if (!cc) return;
    if (currentStep === 0) {
      cc.innerHTML = '<div class="dc-head"><span>Step 1 / 4: Set your stake</span><span class="live-tag"><i></i>Interactive</span></div><div class="dc-step-title">How much will you put on the line?</div><div class="dc-step-desc">Pick the amount you\'d genuinely feel. Too low and it won\'t move you, too high and you should set a sensible limit. This is real money in the real app.</div><div class="stake-grid">' + [10, 20, 30, 50, 75, 100].map(function(v) { return '<div class="stake-chip' + (state.stake === v ? ' selected' : '') + '" data-stake="' + v + '">' + money(v) + '</div>'; }).join('') + '</div><div class="stake-custom"><span>Custom</span><input type="number" id="stake-custom-input" min="1" max="500" placeholder="$' + state.stake + '" value="' + ([10, 20, 30, 50, 75, 100].indexOf(state.stake) === -1 ? state.stake : '') + '" /></div>';
      cc.querySelectorAll('.stake-chip').forEach(function(chip) {
        chip.addEventListener('click', function() { state.stake = +chip.dataset.stake; renderPhone(); ctrlHTML(); });
      });
      var ci = cc.querySelector('#stake-custom-input');
      if (ci) ci.addEventListener('input', function() { var v = parseInt(ci.value, 10); if (v > 0) { state.stake = v; renderPhone('same'); } });
      return;
    }
    if (currentStep === 1) {
      cc.innerHTML = '<div class="dc-head"><span>Step 2 / 4: Choose charity</span><span class="live-tag"><i></i>Interactive</span></div><div class="dc-step-title">Where do your forfeits go?</div><div class="dc-step-desc">If you skip a session, 85% of your stake routes here automatically. You set this once, and it doesn\'t change session to session.</div><div class="charity-grid">' + CHARITIES.map(function(c, i) { return '<div class="charity-chip' + (state.charity === i ? ' selected' : '') + '" data-idx="' + i + '"><div class="ch-ico" style="background:' + (state.charity === i ? '#F3DEE2' : 'var(--cream-2)') + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + (state.charity === i ? 'var(--maroon)' : 'var(--ink-soft)') + '" stroke-width="2"><path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg></div><div><div class="ch-name">' + c.name + '</div><div class="ch-sub">' + c.sub + '</div></div>' + (state.charity === i ? '<svg style="margin-left:auto;flex:0 0 auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--maroon)" stroke-width="2.5"><path d="M20 7L9 18l-5-5"/></svg>' : '') + '</div>'; }).join('') + '</div>';
      cc.querySelectorAll('.charity-chip').forEach(function(chip) {
        chip.addEventListener('click', function() { state.charity = +chip.dataset.idx; renderPhone(); ctrlHTML(); updateNext(); });
      });
      return;
    }
    if (currentStep === 2) {
      cc.innerHTML = '<div class="dc-head"><span>Step 3 / 4: Verify attendance</span><span class="live-tag"><i></i>Interactive</span></div><div class="dc-step-title">Tap each check to verify.</div><div class="dc-step-desc">In the real app these happen automatically: GPS reads your location and the camera runs liveness detection. Tap each to simulate.</div><div class="verify-steps">' + [['gps', 'GPS location', 'Confirms you\'re physically at the gym', '<path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/>'], ['selfie', 'Selfie check', 'Liveness detection confirms it\'s you', '<rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="4"/><path d="M8 6l1.5-2h5L16 6"/>']].map(function(v) { return '<div class="vstep' + (state.verified.indexOf(v[0]) !== -1 ? ' done-step' : '') + '" data-key="' + v[0] + '"><div class="vs-ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2">' + v[3] + '</svg></div><div class="vs-text"><div class="vs-name">' + v[1] + '</div><div class="vs-sub">' + v[2] + '</div></div><div class="vs-check">' + (state.verified.indexOf(v[0]) !== -1 ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 7L9 18l-5-5"/></svg>' : '') + '</div></div>'; }).join('') + '</div>';
      cc.querySelectorAll('.vstep').forEach(function(step) {
        step.addEventListener('click', function() {
          var k = step.dataset.key;
          if (state.verified.indexOf(k) === -1) state.verified.push(k);
          renderPhone(); ctrlHTML(); updateNext();
        });
      });
      return;
    }
    if (currentStep === 3) {
      cc.innerHTML = '<div class="dc-head"><span>Step 3 / 4: Simulate outcome</span><span class="live-tag"><i></i>Interactive</span></div><div class="dc-step-title">What did your morning self do?</div><div class="dc-step-desc">This is the moment of truth. In the real app, the outcome is determined by whether you verified attendance or not. No self-reporting needed.</div><div class="outcome-row"><div class="oc-btn oc-show' + (state.outcome === 'kept' ? ' selected-oc' : '') + '" id="oc-show"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.2"><path d="M20 7L9 18l-5-5"/></svg><span class="oc-big">Showed up</span><span class="oc-sub">Keep ' + money(state.stake) + '</span></div><div class="oc-btn oc-skip' + (state.outcome === 'skipped' ? ' selected-oc' : '') + '" id="oc-skip"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--maroon)" stroke-width="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg><span class="oc-big">Skipped</span><span class="oc-sub">' + money(state.stake * 0.85) + ' &rarr; charity</span></div></div>';
      var ocShow = document.getElementById('oc-show');
      var ocSkip = document.getElementById('oc-skip');
      if (ocShow) ocShow.addEventListener('click', function() { state.outcome = 'kept'; renderPhone(); ctrlHTML(); updateNext(); updateReceipt(); });
      if (ocSkip) ocSkip.addEventListener('click', function() { state.outcome = 'skipped'; renderPhone(); ctrlHTML(); updateNext(); updateReceipt(); });
      return;
    }
    if (currentStep === 4) {
      var kept = state.outcome === 'kept';
      cc.innerHTML = '<div class="dc-head"><span>Step 4 / 4: Result</span><span class="live-tag"><i></i>Complete</span></div><div class="dc-step-title">' + (kept ? 'Money back in your pocket.' : 'Your skip did some good.') + '</div><div class="result-summary ' + (kept ? 'rs-kept' : 'rs-skipped') + '"><div class="rs-title">' + (kept ? 'Verified. Kept.' : 'Forfeited. Routed.') + '</div><div class="rs-rows"><div class="rs-row"><span>Staked</span><b>' + money(state.stake) + '</b></div><div class="rs-row"><span>Returned to wallet</span><b style="color:' + (kept ? 'var(--green)' : 'var(--ink-soft)') + '">' + (kept ? money(state.stake) : '$0') + '</b></div><div class="rs-row"><span>To ' + (CHARITIES[state.charity] ? CHARITIES[state.charity].name : 'charity') + '</span><b style="color:var(--maroon)">' + (kept ? '$0' : money(state.stake * 0.85)) + '</b></div>' + (!kept ? '<div class="rs-row"><span>Platform fee</span><b>' + money(state.stake * 0.15) + '</b></div>' : '') + '</div></div><div style="font-family:var(--mono);font-size:11px;color:var(--ink-soft);text-align:center;line-height:1.7">' + (kept ? 'Streak now 8 days. ' + money(state.stake) + ' stays in your account.' : 'Streak reset. ' + money(state.stake * 0.85) + ' processed to ' + (CHARITIES[state.charity] ? CHARITIES[state.charity].name : 'your chosen charity') + '.') + '</div>';
      return;
    }
  }

  function updateNext() {
    var btn = document.getElementById('demo-next');
    var back = document.getElementById('demo-back');
    if (!btn) return;
    if (back) back.style.display = currentStep > 0 ? '' : 'none';
    if (currentStep === STEPS.length) { btn.textContent = '\u21ba Run again'; btn.disabled = false; return; }
    btn.textContent = 'Continue \u2192';
    btn.disabled = (currentStep === 1 && state.charity === null) || (currentStep === 2 && state.verified.length < 2) || (currentStep === 3 && !state.outcome);
  }

  function renderPhone(dir) {
    var scr = document.getElementById('demo-screen');
    if (!scr) return;
    scr.innerHTML = phoneHTML(dir);
    var big = document.getElementById('ph-stake-big');
    if (big) big.textContent = money(state.stake);
  }

  function goTo(step, dir) {
    currentStep = step; renderDots(); renderPhone(dir); ctrlHTML(); updateNext(); updateReceipt();
  }

  var nextBtn = document.getElementById('demo-next');
  var backBtn = document.getElementById('demo-back');
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      if (currentStep === STEPS.length) { state = { stake: 30, charity: null, verified: [], outcome: null }; goTo(0, 'back'); }
      else goTo(currentStep + 1, 'forward');
    });
  }
  if (backBtn) {
    backBtn.addEventListener('click', function() { if (currentStep > 0) goTo(currentStep - 1, 'back'); });
  }

  goTo(0, 'forward');
})();

/* Email Modal */
function openEmailModal() {
  var m = document.getElementById('emailModal');
  if (m) { m.classList.add('show'); m.setAttribute('aria-hidden', 'false'); }
}

function hideEmailModal() {
  var m = document.getElementById('emailModal');
  if (m) { m.classList.remove('show'); m.setAttribute('aria-hidden', 'true'); }
}

var EMAIL_MODES = {
  default: {
    eyebrow: 'Early access &middot; founding 2,000',
    title: 'Get in before the gym does.',
    body: "We're rolling out access in waves. Drop your email and we'll save your founder spot. No card now, nothing to pay yet.",
    fine: 'No spam. One email when your wave opens.',
    banner: false,
    submit: 'Save my spot',
    successTitle: "You're on the list.",
    successBody: "We'll email you the moment your founder wave opens. Time to stop paying for a gym you skip."
  },
  founder: {
    eyebrow: 'Founder lifetime &middot; $24.99 at launch',
    title: 'Lock in the founder price.',
    body: "Claim your spot in the first 2,000 founders. The $24.99 lifetime price is held for you, but you don't pay anything now.",
    fine: 'No card, no charge today. Just your email.',
    banner: true,
    submit: 'Claim my founder spot',
    successTitle: "Your founder spot is locked.",
    successBody: "It's completely free for now. We'll email you the moment the app launches so you can claim the $24.99 lifetime price. No charge until then."
  }
};
var currentEmailMode = 'default';

function setEmailMode(mode) {
  currentEmailMode = (EMAIL_MODES[mode] ? mode : 'default');
  var m = EMAIL_MODES[mode] || EMAIL_MODES.default;
  function set(id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; }
  var eb = document.getElementById('em-eyebrow');
  if (eb) eb.innerHTML = '<i></i>' + m.eyebrow;
  set('em-title', m.title);
  set('em-body', m.body);
  set('em-fine', m.fine);
  set('em-submit', m.submit);
  set('em-success-title', m.successTitle);
  set('em-success-body', m.successBody);
  var banner = document.getElementById('em-freebanner');
  if (banner) banner.style.display = m.banner ? 'flex' : 'none';
  var fv = document.getElementById('em-form-view'), sv = document.getElementById('em-success-view');
  if (fv) fv.style.display = '';
  if (sv) sv.classList.remove('show');
  var err = document.getElementById('em-error');
  if (err) { err.classList.remove('show'); err.textContent = ''; }
}

(function() {
  var m = document.getElementById('emailModal');
  if (!m) return;
  m.querySelectorAll('[data-close]').forEach(function(b) { b.addEventListener('click', hideEmailModal); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') hideEmailModal(); });
  var submit = document.getElementById('em-submit');
  var input = document.getElementById('em-input');
  var errEl = document.getElementById('em-error');
  var sending = false;
  function showErr(msg) { if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); } }
  function clearErr() { if (errEl) { errEl.textContent = ''; errEl.classList.remove('show'); } }
  async function go() {
    if (sending) return;
    var v = (input.value || '').trim();
    clearErr();
    input.style.borderColor = '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      input.style.borderColor = 'var(--maroon)';
      showErr('Please enter a valid email address.');
      input.focus();
      return;
    }
    sending = true;
    var label = submit.textContent;
    submit.disabled = true;
    submit.style.opacity = '.7';
    submit.textContent = 'Saving\u2026';
    try {
      var res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v, signupType: currentEmailMode === 'founder' ? 'Founder lifetime ($24.99 at launch)' : 'Early-access waitlist' })
      });
      if (res.ok) {
        document.getElementById('em-form-view').style.display = 'none';
        document.getElementById('em-success-view').classList.add('show');
      } else {
        var data;
        try { data = await res.json(); } catch (e) {}
        showErr((data && data.error) || 'Something went wrong. Please try again.');
      }
    } catch (e) {
      showErr('Network error. Check your connection and try again.');
    } finally {
      sending = false;
      submit.disabled = false;
      submit.style.opacity = '';
      submit.textContent = label;
    }
  }
  if (submit) submit.addEventListener('click', go);
  if (input) {
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') go(); });
    input.addEventListener('input', clearErr);
  }
})();

/* Toast */
function showToast(msg) {
  var t = document.getElementById('toast');
  if (t) { t.textContent = msg; t.style.opacity = '1'; setTimeout(function() { t.style.opacity = '0'; }, 3500); }
}

/* Nav active */
(function() {
  var sections = ['top', 'how', 'about', 'demo', 'contact', 'proof', 'calc-hero', 'pricing'];
  var sectionEls = sections.map(function(id) { return document.getElementById(id); }).filter(Boolean);
  function updateActiveNav() {
    var scrollY = window.scrollY + 120;
    var current = 'top';
    sectionEls.forEach(function(el) { if (el && el.offsetTop <= scrollY) current = el.id; });
    document.querySelectorAll('.links a').forEach(function(link) {
      var href = link.getAttribute('href');
      link.classList.toggle('active', href === '#' + current);
    });
  }
  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();
})();

/* Hamburger menu */
(function() {
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      navLinks.classList.toggle('open');
    });
  }
})();

/* Depth & Motion Engine */
(function() {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var isTouch = window.matchMedia('(hover: none)').matches || ('ontouchstart' in window);
  var isSmall = window.matchMedia('(max-width: 900px)').matches;
  var MAX = 9;
  var cards = Array.from(document.querySelectorAll('.tilt'));
  function bindCursorTilt(card) {
    var raf = null, rect = null;
    function onMove(e) {
      if (!rect) rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;
      var py = (e.clientY - rect.top) / rect.height;
      var ry = (px - 0.5) * 2 * MAX;
      var rx = -(py - 0.5) * 2 * MAX;
      if (raf) return;
      raf = requestAnimationFrame(function() {
        card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
        card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        card.style.setProperty('--tz', '12px');
        raf = null;
      });
    }
    card.addEventListener('mouseenter', function() { rect = card.getBoundingClientRect(); card.classList.add('tilting'); card.style.willChange = 'transform'; });
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', function() {
      card.classList.remove('tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--tz', '0px');
      rect = null;
      setTimeout(function() { card.style.willChange = 'auto'; }, 450);
    });
  }
  var gyroActive = false;
  function applyGyro(beta, gamma) {
    var rx = Math.max(-MAX, Math.min(MAX, (beta - 45) * 0.18));
    var ry = Math.max(-MAX, Math.min(MAX, gamma * 0.18));
    for (var ci = 0; ci < cards.length; ci++) {
      cards[ci].style.setProperty('--rx', rx.toFixed(2) + 'deg');
      cards[ci].style.setProperty('--ry', ry.toFixed(2) + 'deg');
    }
  }
  var gyroRaf = null, lastG = 0;
  function onOrient(e) {
    var now = performance.now();
    if (now - lastG < 33) return;
    lastG = now;
    if (gyroRaf) return;
    gyroRaf = requestAnimationFrame(function() {
      applyGyro(e.beta || 0, e.gamma || 0);
      gyroRaf = null;
    });
  }
  function startGyro() {
    gyroActive = true;
    cards.forEach(function(c) { c.classList.add('tilting'); });
    window.addEventListener('deviceorientation', onOrient, { passive: true });
  }
  function bindPressFallback(card) {
    card.addEventListener('touchstart', function() { card.classList.add('press'); }, { passive: true });
    var release = function() { card.classList.remove('press'); };
    card.addEventListener('touchend', release, { passive: true });
    card.addEventListener('touchcancel', release, { passive: true });
  }
  if (isTouch || isSmall) {
    var DOE = window.DeviceOrientationEvent;
    var needsPermission = DOE && typeof DOE.requestPermission === 'function';
    if (needsPermission) {
      cards.forEach(bindPressFallback);
      var ask = function() {
        DOE.requestPermission().then(function(state) {
          if (state === 'granted') {
            cards.forEach(function(c) { c.classList.remove('press'); });
            startGyro();
          }
        }).catch(function() {}).finally(function() {
          document.removeEventListener('touchend', ask);
        });
      };
      document.addEventListener('touchend', ask, { once: true, passive: true });
    } else if (DOE) {
      startGyro();
      setTimeout(function() { if (!lastG) cards.forEach(bindPressFallback); }, 1200);
    } else {
      cards.forEach(bindPressFallback);
    }
  } else {
    cards.forEach(bindCursorTilt);
  }
  var players = Array.from(document.querySelectorAll('[data-parallax]')).map(function(el) { return { el: el, rate: parseFloat(el.dataset.parallax) || 0.08 }; });
  if (players.length) {
    var damp = isSmall ? 0.5 : 1;
    var pRaf = null;
    function onScroll() {
      if (pRaf) return;
      pRaf = requestAnimationFrame(function() {
        var y = window.scrollY;
        for (var pi = 0; pi < players.length; pi++) {
          var offset = (-y * players[pi].rate * damp).toFixed(1);
          players[pi].el.style.transform = 'translate3d(0, ' + offset + 'px, 0)';
        }
        pRaf = null;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();

/* FAQ Accordion */
(function() {
  var items = document.querySelectorAll('.faq-item');
  items.forEach(function(item) {
    var btn = item.querySelector('.faq-q');
    var content = item.querySelector('.faq-a');
    if (!btn || !content) return;
    var inner = document.createElement('div');
    while (content.firstChild) inner.appendChild(content.firstChild);
    content.appendChild(inner);
    btn.addEventListener('click', function() {
      var isOpen = item.classList.contains('open');
      items.forEach(function(other) {
        if (other !== item) other.classList.remove('open');
      });
      if (isOpen) {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* Waitlist count loader */
(function() {
  function updateCounts(c) {
    var count = c || 0;
    var countEl = document.getElementById('wl-count');
    var fillEl = document.getElementById('wl-fill');
    var heroEl = document.getElementById('wl-hero-count');
    if (countEl) countEl.textContent = count;
    if (heroEl) { heroEl.textContent = count; heroEl.classList.remove('pulse'); setTimeout(function() { heroEl.classList.add('pulse'); }, 10); }
    if (fillEl) {
      var pct = Math.min((count / 2000) * 100, 100);
      setTimeout(function() { fillEl.style.width = pct + '%'; }, 400);
    }
  }
  var bar = document.getElementById('waitlistBar');
  var hero = document.getElementById('heroSocial');
  if (!bar && !hero) return;
  fetch('/api/waitlist/count').then(function(r) { return r.json(); }).then(function(d) {
    updateCounts(d.count || 0);
  }).catch(function() { updateCounts(0); });
})();

/* Animated Counter */
(function() {
  var row = document.getElementById('counterRow');
  if (!row) return;
  var counters = row.querySelectorAll('[data-count]');
  if (!counters.length) return;
  var counted = false;
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function animateCount(el) {
    var target = parseInt(el.dataset.count, 10);
    var isMoney = el.parentElement.textContent.trim().startsWith('$');
    var duration = 1600 + Math.random() * 400;
    var start = performance.now();
    function tick(now) {
      var t = Math.min((now - start) / duration, 1);
      var val = Math.round(easeOut(t) * target);
      el.textContent = isMoney ? val.toLocaleString() : val;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counterIO = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting && !counted) {
        counted = true;
        counters.forEach(animateCount);
        counterIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  counterIO.observe(row);
})();
