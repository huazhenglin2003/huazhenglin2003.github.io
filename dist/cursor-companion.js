(() => {
  'use strict';

  const appearance = window.SITE_DATA?.settings?.appearance || {};
  const uiScale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1;
  const layer = document.querySelector('#cursor-companion');
  if (!layer || appearance.customCursor === false || typeof window.matchMedia !== 'function') return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const follower = layer.querySelector('.koromon-follower');
  const sprite = layer.querySelector('.koromon-hop');
  const facing = layer.querySelector('.koromon-facing');
  const leftEar = layer.querySelector('.koromon-ear-left');
  const rightEar = layer.querySelector('.koromon-ear-right');
  const shadow = layer.querySelector('.koromon-shadow');
  const idleFrame = layer.querySelector('.koromon-idle');
  const blinkFrame = layer.querySelector('.koromon-blink');
  const sleepFrame = layer.querySelector('.koromon-sleep');
  const resourceBase = document.currentScript?.src || document.baseURI;
  const sleepStill = sleepFrame.src;
  const sleepAnimation = new URL(sleepFrame.dataset.animatedSrc, resourceBase).href;
  const sleepAfter = Number.isFinite(appearance.cursorSleepAfter) ? Math.max(1000, Math.min(60000, appearance.cursorSleepAfter)) : 3000;
  const trailLayer = layer.querySelector('.koromon-trails');
  const size = (Number.isFinite(appearance.cursorSize) ? Math.max(36, Math.min(72, appearance.cursorSize)) : 52) * uiScale;
  layer.style.setProperty('--companion-size', `${size}px`);

  const particles = Array.from({ length: 20 }, () => {
    const node = document.createElement('i');
    node.className = 'koromon-spark';
    trailLayer.append(node);
    return { node, alive: false, born: 0, x: 0, y: 0, dx: 0, dy: 0, angle: 0 };
  });
  const state = {
    visible: false, available: true, x: 0, y: 0, targetX: 0, targetY: 0,
    pointerX: 0, pointerY: 0, lastMove: 0, lastFrame: 0, lastTrail: 0,
    directionX: 0, directionY: 0, pace: 0, hopping: false,
    hopStart: 0, hopDuration: 290, hopX: 0, hopY: 0, hopPace: 0,
    yaw: 0, leftEar: 0, rightEar: 0, sleeping: false, lastActivity: 0,
    canSleep: true, canAnimateSleep: true
  };
  let frame = null;
  let blinkTimer;
  let sleepTimer;
  let particleIndex = 0;

  const clearTrails = () => particles.forEach((particle) => {
    particle.alive = false;
    particle.node.style.opacity = '0';
  });
  const sleepImage = (animated) => {
    const next = animated && state.canAnimateSleep ? sleepAnimation : sleepStill;
    if (sleepFrame.src !== next) sleepFrame.src = next;
  };
  const resetPose = () => {
    state.yaw = state.leftEar = state.rightEar = 0;
    facing.style.transform = '';
    leftEar.style.transform = '';
    rightEar.style.transform = '';
    sprite.style.transform = '';
    layer.dataset.facing = 'front';
  };
  const wake = () => {
    if (!state.sleeping) return;
    state.sleeping = false;
    layer.classList.remove('is-sleeping');
    layer.dataset.state = 'awake';
    sleepImage(false);
    state.lastFrame = 0;
  };
  const enterSleep = () => {
    sleepTimer = undefined;
    if (!state.visible || !state.canSleep || !finePointer.matches || document.hidden) return;
    const remaining = sleepAfter - (performance.now() - state.lastActivity);
    if (remaining > 0) {
      sleepTimer = setTimeout(enterSleep, remaining);
      return;
    }
    state.sleeping = true;
    state.hopping = false;
    state.lastFrame = 0;
    clearTimeout(blinkTimer);
    layer.classList.remove('is-blinking');
    clearTrails();
    resetPose();
    state.x = state.targetX;
    state.y = state.targetY;
    follower.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
    shadow.style.transform = 'scale(1.1, .8)';
    shadow.style.opacity = '.12';
    layer.classList.add('is-sleeping');
    layer.dataset.state = 'sleeping';
    layer.dataset.direction = 'idle';
    sleepImage(!reducedMotion.matches);
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  };
  const armSleep = (now = performance.now()) => {
    state.lastActivity = now;
    clearTimeout(sleepTimer);
    sleepTimer = setTimeout(enterSleep, sleepAfter);
  };
  const stop = () => {
    state.visible = false;
    state.hopping = false;
    state.lastFrame = 0;
    layer.hidden = true;
    layer.classList.remove('is-blinking');
    clearTimeout(blinkTimer);
    clearTimeout(sleepTimer);
    wake();
    resetPose();
    clearTrails();
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  };
  const setTarget = (x, y) => {
    // Stay to the bottom right until an edge needs the companion to tuck inward.
    const left = x + size + 22 * uiScale > window.innerWidth ? x - size - 14 * uiScale : x + 14 * uiScale;
    const top = y + size + 24 * uiScale > window.innerHeight ? y - size - 12 * uiScale : y + 16 * uiScale;
    state.targetX = Math.max(5 * uiScale, Math.min(window.innerWidth - size - 5 * uiScale, left));
    state.targetY = Math.max(5 * uiScale, Math.min(window.innerHeight - size - 5 * uiScale, top));
  };
  const beginHop = (now) => {
    state.hopping = true;
    state.hopStart = now;
    state.hopDuration = 310 - state.pace * 75;
    state.hopX = state.directionX;
    state.hopY = state.directionY;
    state.hopPace = state.pace;
  };
  const requestFrame = () => {
    if (frame === null && state.visible && !state.sleeping) frame = requestAnimationFrame(tick);
  };
  const drawParticles = (now) => {
    let alive = false;
    particles.forEach((particle) => {
      if (!particle.alive) return;
      const progress = (now - particle.born) / 560;
      if (progress >= 1) {
        particle.alive = false;
        particle.node.style.opacity = '0';
        return;
      }
      alive = true;
      particle.node.style.transform = `translate3d(${particle.x + particle.dx * progress}px, ${particle.y + particle.dy * progress}px, 0) rotate(${particle.angle}deg) scale(${1 - progress * .55})`;
      particle.node.style.opacity = String(.68 * (1 - progress) ** 1.45);
    });
    return alive;
  };
  const emitTrail = (now) => {
    if (appearance.cursorTrail === false || reducedMotion.matches || state.sleeping || now - state.lastTrail < 28) return;
    const particle = particles[particleIndex++ % particles.length];
    particle.alive = true;
    particle.born = now;
    particle.x = state.x + size * .48 - state.directionX * size * .17;
    particle.y = state.y + size * .72 - state.directionY * size * .12;
    particle.dx = (-state.directionX * 13) * uiScale;
    particle.dy = (-state.directionY * 10 + 3) * uiScale;
    particle.angle = Math.atan2(state.directionY, state.directionX) * 180 / Math.PI;
    particle.node.style.width = `${(4.5 + state.hopPace * 3) * uiScale}px`;
    particle.node.style.height = `${(3 + state.hopPace * 1.5) * uiScale}px`;
    state.lastTrail = now;
  };

  function tick(now) {
    frame = null;
    if (!state.visible || state.sleeping) return;
    const dt = state.lastFrame ? Math.min(40, now - state.lastFrame) : 16;
    state.lastFrame = now;
    const reduced = reducedMotion.matches;
    const follow = reduced ? 1 : 1 - Math.exp(-dt / 48);
    state.x += (state.targetX - state.x) * follow;
    state.y += (state.targetY - state.y) * follow;
    const recentlyMoving = now - state.lastMove < 100;
    if (!reduced && !state.hopping && recentlyMoving && state.pace > .02) beginHop(now);

    let lift = 0;
    let hopX = 0;
    let hopY = 0;
    let tilt = 0;
    let squash = 0;
    let earLeft = 0;
    let earRight = 0;
    if (state.hopping && !reduced) {
      const progress = Math.min(1, (now - state.hopStart) / state.hopDuration);
      const arc = Math.sin(progress * Math.PI);
      lift = arc * (5 + state.hopPace * 6) * uiScale;
      hopX = arc * state.hopX * 4 * uiScale;
      hopY = arc * state.hopY * 3 * uiScale - lift;
      tilt = arc * state.hopX * 10;
      squash = arc * .055;
      const strength = .6 + state.hopPace * .4;
      earLeft = (Math.sin(progress * Math.PI * 2) * 19 - state.hopX * 11) * strength;
      earRight = (-Math.sin(progress * Math.PI * 2 + .5) * 21 - state.hopX * 9) * strength;
      emitTrail(now);
      if (progress >= 1) state.hopping = false;
    }
    follower.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
    sprite.style.transform = `translate3d(${hopX}px, ${hopY}px, 0) rotate(${tilt}deg) scale(${1 - squash}, ${1 + squash})`;
    const spring = reduced ? 1 : 1 - Math.exp(-dt / 65);
    const yaw = !reduced && (state.hopping || recentlyMoving) ? state.directionX * 29 : 0;
    state.yaw += (yaw - state.yaw) * spring;
    state.leftEar += (earLeft - state.leftEar) * spring;
    state.rightEar += (earRight - state.rightEar) * spring;
    facing.style.transform = `perspective(${180 * uiScale}px) rotateY(${state.yaw}deg) skewY(${-state.yaw * .07}deg)`;
    leftEar.style.transform = `rotate(${state.leftEar}deg)`;
    rightEar.style.transform = `rotate(${state.rightEar}deg)`;
    layer.dataset.facing = state.yaw > 3 ? 'right' : state.yaw < -3 ? 'left' : 'front';
    shadow.style.transform = `scale(${1 - lift / uiScale * .035})`;
    shadow.style.opacity = String(.13 - lift / uiScale * .005);

    const trailsAlive = drawParticles(now);
    const distance = Math.hypot(state.targetX - state.x, state.targetY - state.y);
    const poseMoving = Math.abs(state.yaw) + Math.abs(state.leftEar) + Math.abs(state.rightEar) > .12;
    if (distance > .08 || state.hopping || trailsAlive || poseMoving) requestFrame();
    else {
      state.lastFrame = 0;
      state.pace = 0;
      layer.dataset.direction = 'idle';
      resetPose();
    }
  }

  const move = (event) => {
    if (!state.available || !finePointer.matches || event.pointerType === 'touch' || document.hidden) return;
    if (event.target instanceof Element && event.target.closest('input, textarea, [contenteditable="true"]')) {
      stop();
      return;
    }
    const now = performance.now();
    const wasVisible = state.visible;
    const dx = wasVisible ? event.clientX - state.pointerX : 0;
    const dy = wasVisible ? event.clientY - state.pointerY : 0;
    const distance = Math.hypot(dx, dy);
    const elapsed = Math.max(8, Math.min(64, now - state.lastMove));
    if (state.sleeping && distance <= .5) return;
    if (!wasVisible || distance > .5) {
      wake();
      armSleep(now);
    }
    if (distance > .5) {
      state.directionX = dx / distance;
      state.directionY = dy / distance;
      state.pace = Math.min(1, distance / uiScale / elapsed / 1.3);
      layer.dataset.direction = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    }
    state.pointerX = event.clientX;
    state.pointerY = event.clientY;
    state.lastMove = now;
    setTarget(event.clientX, event.clientY);
    if (!wasVisible) {
      state.x = state.targetX;
      state.y = state.targetY;
      state.pace = 0;
      state.hopping = false;
      resetPose();
      follower.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
    } else if (!reducedMotion.matches && !state.hopping && distance > .5) beginHop(now);
    layer.hidden = false;
    state.visible = true;
    layer.dataset.state = 'awake';
    requestFrame();
  };
  const blink = (event) => {
    if (event.button !== 0 || !state.visible || !finePointer.matches || event.pointerType === 'touch') return;
    wake();
    armSleep();
    requestFrame();
    if (!blinkFrame.complete || !blinkFrame.naturalWidth) return;
    clearTimeout(blinkTimer);
    layer.classList.add('is-blinking');
    blinkTimer = setTimeout(() => layer.classList.remove('is-blinking'), 180);
  };
  const syncMotion = () => {
    layer.classList.toggle('is-reduced-motion', reducedMotion.matches);
    if (reducedMotion.matches) {
      state.hopping = false;
      clearTrails();
      resetPose();
      requestFrame();
    }
    if (state.sleeping) sleepImage(!reducedMotion.matches);
  };
  const watch = (query, handler) => {
    if (typeof query.addEventListener === 'function') query.addEventListener('change', handler);
    else query.addListener(handler);
  };

  idleFrame.addEventListener('error', () => { state.available = false; stop(); }, { once: true });
  sleepFrame.addEventListener('error', () => {
    if (sleepFrame.src === sleepAnimation) {
      state.canAnimateSleep = false;
      sleepImage(false);
    } else {
      state.canSleep = false;
      wake();
    }
  });
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerdown', blink, { passive: true });
  window.addEventListener('wheel', () => {
    if (!state.visible) return;
    wake();
    armSleep();
    requestFrame();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', stop);
  window.addEventListener('blur', stop);
  window.addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('resize', () => {
    if (!state.visible) return;
    setTarget(state.pointerX, state.pointerY);
    if (state.sleeping) {
      state.x = state.targetX;
      state.y = state.targetY;
      follower.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
    } else requestFrame();
  }, { passive: true });
  watch(finePointer, () => { if (!finePointer.matches) stop(); });
  watch(reducedMotion, syncMotion);
  syncMotion();
})();
