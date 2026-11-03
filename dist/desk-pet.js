(() => {
  'use strict';

  const settings = window.SITE_DATA?.settings || {};
  const config = settings.deskPet || {};
  const uiScale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1;
  const root = document.querySelector('#desk-pet');
  if (!root || config.enabled === false) return;
  const bubble = root.querySelector('.pet-bubble');
  const message = root.querySelector('.pet-message');
  const context = root.querySelector('.pet-context');
  const button = root.querySelector('.pet-character');
  const closeButton = root.querySelector('.pet-bubble-close');
  const frames = [...root.querySelectorAll('.pet-frame')];
  const meal = root.querySelector('.pet-meal');
  const mealStill = meal?.src || '';
  const resourceBase = document.currentScript?.src || document.baseURI;
  const mealAnimation = meal?.dataset.animatedSrc ? new URL(meal.dataset.animatedSrc, resourceBase).href : '';
  const reducedMotion = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const idleAfter = Number.isFinite(config.idleAfter) ? Math.max(1000, Math.min(600000, config.idleAfter)) : 3000;
  const duration = Number.isFinite(config.speechDuration) ? Math.max(1000, Math.min(30000, config.speechDuration)) : 6500;
  const storageKey = `${settings.storageKey || 'personal-academic-homepage'}-desk-pet-actions`;
  const words = {
    en: {
      photo: ['Portrait mode unlocked! Look closely: this researcher runs on ideas and rice.', 'A closer look at the human behind the papers. I take care of the cute department!'],
      paper: ['Paper portal opened! Bring an idea back when you return.', 'A paper has been picked! Your research energy just went up.'],
      code: ['Off to inspect the code! May all your runs be reproducible.', 'The code is ready. May your experiments run on the first try!'],
      project: ['A new project to explore! I will guard this page for you.'],
      scholar: ['A little scholarly treasure hunt? Save room for one more paper!'],
      github: ['Repository exploration time. A tiny star makes a fish very happy!'],
      cv: ['Opening the CV. A researcher’s journey, neatly on paper.'],
      email: ['A new collaboration may start with this hello!'],
      institution: ['Off to campus! Come back with a fresh research idea.'],
      advisor: ['Visiting the advisor’s page. Prepare your research questions!'],
      service: ['Peer review keeps science swimming forward. Respect!'],
      news: ['A fresh update! Good research deserves a little celebration.'],
      navigation: ['Here we are. Pick something interesting and dive in!'],
      external: ['A new page to explore. I will keep your place here!'],
      poke: ['Hey, no poking! I am digesting a very important paper.', 'Careful! One more poke and I might demand a new research idea.'],
      idle: ['Wake up, time for research! Even Koromon has fallen asleep. I will handle the rice.', 'Koromon is napping, I am eating... who is doing the research? Your turn!'],
      idleAwake: ['You bring the research, I will bring the appetite. One more paper before I finish this rice?', 'I am refilling my rice bowl. How about refilling your research ideas?']
    },
    zh: {
      photo: ['研究员本尊放大成功！请欣赏一位靠灵感和米饭驱动的科研人～', '照片可以放大，科研热情也要同步放大！可爱担当就交给本鱼啦～'],
      paper: ['论文传送门已开启！看完记得带着灵感回来交流呀～', '这篇论文被你翻牌啦！科研浓度 +1，小鱼批准。'],
      code: ['代码入口已打开！祝你一次跑通，实验结果漂漂亮亮～', '去代码仓库探险吧！小鱼在这里为你的复现保驾护航。'],
      project: ['项目传送门开启！去逛逛吧，我帮你守着这页。'],
      scholar: ['学术寻宝模式启动！说好只看一篇，可别一看就是一下午哦～'],
      github: ['去仓库逛逛吧，顺手一颗小星星，小鱼能开心一整天！'],
      cv: ['简历已为你打开！科研人的成长路线图，请查收～'],
      email: ['叮！合作的第一步，也许就是这一封问候。'],
      institution: ['出发，云逛校园！记得带个新想法回来呀～'],
      advisor: ['导师主页传送门已开启！研究问题准备好了没？'],
      service: ['认真审稿也是科研的守护技能，小鱼肃然起敬！'],
      news: ['新动态值得围观！每一点科研进展，都值得小小庆祝。'],
      navigation: ['到站啦～挑一项感兴趣的内容，一起往下探索吧！'],
      external: ['新的页面已经出发！小鱼在这里等你凯旋～'],
      poke: ['别戳我啦！小鱼还在消化刚才那篇论文呢。', '再戳就要收科研灵感税啦！快交一个新点子～'],
      idle: ['醒醒，该科研了，滚球兽都睡了～我先干一碗大米饭！', '滚球兽睡觉，我负责干饭……那科研就拜托你啦！'],
      idleAwake: ['你负责科研，我负责干饭！别等我一碗见底，你还在发呆呀～', '大米饭给我充能，论文给你充电。咱俩都有光明的未来！']
    }
  };
  const language = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  let current;
  let speechTimer;
  let idleTimer;
  let reactionTimer;
  let lastActivity = performance.now();
  let reminded = false;
  let active = !document.hidden;
  let eating = false;
  let canAnimateMeal = true;
  let drag;
  let suppressClick = false;
  let actions = [];
  try {
    const stored = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    if (Array.isArray(stored)) actions = stored.slice(-24);
  } catch { /* File previews can restrict storage. */ }

  const record = (action, detail = '') => {
    root.dataset.lastAction = action;
    actions.push({ action, context: String(detail).slice(0, 180), timestamp: Date.now() });
    actions = actions.slice(-24);
    try { sessionStorage.setItem(storageKey, JSON.stringify(actions)); } catch { /* Reactions work without storage. */ }
  };
  const pool = (category) => {
    const custom = config.messages?.[category] ?? (category === 'idleAwake' ? config.messages?.idle : undefined);
    const value = custom && typeof custom === 'object' && !Array.isArray(custom) ? custom[language()] || custom.en || custom.zh : custom;
    const values = (Array.isArray(value) ? value : value ? [value] : []).map(String).filter((text) => text.trim());
    return values.length ? values : words[language()][category] || words[language()].external;
  };
  const expression = (name) => {
    if (eating) name = 'eating';
    frames.forEach((frame) => frame.classList.toggle('is-active', frame.dataset.expression === name));
    root.dataset.expression = name;
  };
  const syncMeal = () => {
    if (!meal) return;
    const animated = eating && active && !document.hidden && !reducedMotion?.matches && canAnimateMeal;
    const source = animated && mealAnimation ? mealAnimation : mealStill;
    if (source && meal.src !== source) meal.src = source;
  };
  const reactionExpression = (category) => category === 'poke' ? 'shy' : category?.startsWith('idle') ? 'wry' : 'happy';
  const setEating = (value) => {
    if (eating === value) return;
    eating = value;
    root.classList.toggle('is-eating', value);
    root.dataset.state = value ? 'eating' : 'awake';
    syncMeal();
    expression(value ? 'happy' : current ? reactionExpression(current.category) : 'front');
  };
  meal?.addEventListener('error', () => {
    if (meal.src === mealAnimation && canAnimateMeal) {
      canAnimateMeal = false;
      syncMeal();
    }
  });
  if (typeof reducedMotion?.addEventListener === 'function') reducedMotion.addEventListener('change', syncMeal);
  else reducedMotion?.addListener(syncMeal);
  const positionBubble = () => {
    if (bubble.hidden) return;
    const rect = root.getBoundingClientRect();
    root.classList.toggle('bubble-left', rect.left + rect.width / 2 < window.innerWidth / 2);
    root.classList.toggle('bubble-below', rect.top < bubble.offsetHeight + 20 * uiScale && window.innerHeight - rect.bottom > bubble.offsetHeight + 20 * uiScale);
    const preferred = root.classList.contains('bubble-left') ? rect.left + 4 * uiScale : rect.right - 8 * uiScale - bubble.offsetWidth;
    const screenLeft = Math.max(12 * uiScale, Math.min(window.innerWidth - bubble.offsetWidth - 12 * uiScale, preferred));
    bubble.style.left = `${screenLeft - rect.left}px`;
    bubble.style.right = 'auto';
    bubble.style.setProperty('--bubble-tail-x', `${Math.max(18 * uiScale, Math.min(bubble.offsetWidth - 24 * uiScale, rect.left + rect.width / 2 - screenLeft))}px`);
  };
  const labels = () => {
    const zh = language() === 'zh';
    root.setAttribute('aria-label', zh ? 'Big Fat Fish 大肥鱼网页桌宠' : 'Big Fat Fish desk companion');
    button.setAttribute('aria-label', zh ? '戳一戳 Big Fat Fish 大肥鱼；按住可拖动，方向键可移动' : 'Poke Big Fat Fish. Drag or use arrow keys to move.');
    button.title = zh ? '戳一戳我，也可以按住拖动～' : 'Poke me, or drag to move!';
    closeButton.setAttribute('aria-label', zh ? '关闭提示' : 'Close message');
    if (current) {
      const options = pool(current.category);
      message.textContent = options[current.variant % options.length];
      positionBubble();
    }
  };
  const hideSpeech = () => {
    clearTimeout(speechTimer);
    bubble.hidden = true;
    current = undefined;
    expression('front');
  };
  const notify = (category, detail = '') => {
    const options = pool(category);
    current = { category, variant: Math.floor(Math.random() * options.length) };
    context.textContent = detail;
    context.hidden = !detail;
    bubble.hidden = false;
    expression(reactionExpression(category));
    labels();
    root.classList.add('is-reacting');
    clearTimeout(reactionTimer);
    reactionTimer = setTimeout(() => root.classList.remove('is-reacting'), 480);
    clearTimeout(speechTimer);
    if (!document.hidden) speechTimer = setTimeout(hideSpeech, duration);
    record(category, detail);
  };
  const checkIdle = () => {
    idleTimer = undefined;
    if (!active || document.hidden || reminded) return;
    const remaining = idleAfter - (performance.now() - lastActivity);
    if (remaining > 0) { idleTimer = setTimeout(checkIdle, remaining); return; }
    reminded = true;
    setEating(true);
    // Let Koromon's matching three-second sleep timer settle before choosing the line.
    requestAnimationFrame(() => {
      if (!eating || !active || document.hidden) return;
      notify(document.querySelector('#cursor-companion')?.classList.contains('is-sleeping') ? 'idle' : 'idleAwake');
    });
  };
  const activity = () => {
    lastActivity = performance.now();
    reminded = false;
    if (eating) {
      setEating(false);
      if (current?.category.startsWith('idle')) hideSpeech();
    }
    if (active && !document.hidden && !idleTimer) idleTimer = setTimeout(checkIdle, idleAfter);
  };
  const setPosition = (x, y) => {
    const rect = root.getBoundingClientRect();
    root.style.left = `${Math.max(8 * uiScale, Math.min(window.innerWidth - rect.width - 8 * uiScale, x))}px`;
    root.style.top = `${Math.max(8 * uiScale, Math.min(window.innerHeight - rect.height - 8 * uiScale, y))}px`;
    root.style.right = 'auto';
    root.style.bottom = 'auto';
    positionBubble();
  };

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('a[href], button[data-pet-action]') : null;
    if (!target || event.defaultPrevented || root.contains(target)) return;
    const href = target.getAttribute('href') || '';
    if ((!href && !target.dataset.petAction) || /^(javascript:|data:)/i.test(href)) return;
    activity();
    const category = target.dataset.petAction || (href.startsWith('#') ? 'navigation' : href.startsWith('mailto:') ? 'email' : 'external');
    notify(Object.prototype.hasOwnProperty.call(words.en, category) ? category : 'external', target.dataset.petContext || (href.startsWith('#') ? target.textContent.trim() : ''));
    // No preventDefault/window.open: links keep their normal destination and behavior.
  });
  button.addEventListener('click', () => {
    if (suppressClick) { suppressClick = false; return; }
    activity();
    notify('poke');
  });
  closeButton.addEventListener('click', hideSpeech);
  button.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    const rect = root.getBoundingClientRect();
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, moved: false };
    suppressClick = false;
    try { button.setPointerCapture(event.pointerId); } catch { /* Synthetic/legacy pointer events. */ }
  });
  button.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6 * uiScale) return;
    drag.moved = true;
    root.classList.add('is-dragging');
    setPosition(drag.left + dx, drag.top + dy);
    activity();
  });
  const endDrag = () => {
    if (!drag) return;
    suppressClick = drag.moved;
    drag = undefined;
    root.classList.remove('is-dragging');
  };
  button.addEventListener('pointerup', endDrag);
  button.addEventListener('pointercancel', endDrag);
  button.addEventListener('lostpointercapture', endDrag);
  button.addEventListener('keydown', (event) => {
    const delta = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[event.key];
    if (!delta) return;
    event.preventDefault();
    const rect = root.getBoundingClientRect();
    setPosition(rect.left + delta[0] * uiScale, rect.top + delta[1] * uiScale);
  });
  ['pointermove', 'pointerdown', 'click', 'scroll', 'keydown', 'wheel'].forEach((name) => window.addEventListener(name, activity, { passive: true }));
  const pause = () => {
    active = false;
    clearTimeout(idleTimer);
    idleTimer = undefined;
    clearTimeout(speechTimer);
    setEating(false);
    if (current?.category.startsWith('idle')) hideSpeech();
    root.classList.add('is-paused');
  };
  const resume = () => {
    if (document.hidden) return;
    active = true;
    root.classList.remove('is-paused');
    activity();
    if (!bubble.hidden) speechTimer = setTimeout(hideSpeech, duration);
  };
  window.addEventListener('blur', pause);
  window.addEventListener('focus', resume);
  window.addEventListener('pagehide', pause);
  document.addEventListener('visibilitychange', () => document.hidden ? pause() : resume());
  window.addEventListener('resize', () => {
    if (root.style.left) {
      const rect = root.getBoundingClientRect();
      setPosition(rect.left, rect.top);
    }
    positionBubble();
  }, { passive: true });
  new MutationObserver(labels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  root.hidden = false;
  document.documentElement.dataset.deskPet = 'true';
  labels();
  root.dataset.state = 'awake';
  expression('front');
  activity();
})();
