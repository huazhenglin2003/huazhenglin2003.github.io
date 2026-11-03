(() => {
  'use strict';

  // VS Code previews rewrite script URLs, but not URLs rendered by JavaScript.
  // Capture the script location now so later renders use the same resource directory.
  const resourceBase = document.currentScript?.src || document.baseURI;
  const uiScale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1;
  const resourceUrl = (url) => {
    if (!url || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\?)/i.test(url)) return url;
    try { return new URL(url, resourceBase).href; } catch { return url; }
  };

  const data = window.SITE_DATA || {};
  const settings = data.settings || {};
  const profile = data.profile || {};
  const storageKey = settings.storageKey || 'personal-academic-homepage';
  const supportedLanguages = ['en', 'zh'];
  const savedValue = (key) => {
    try { return localStorage.getItem(`${storageKey}-${key}`); } catch { return null; }
  };
  const saveValue = (key, value) => {
    try { localStorage.setItem(`${storageKey}-${key}`, value); } catch { /* File preview can restrict storage. */ }
  };
  const initialLanguage = savedValue('language') || settings.defaultLanguage || 'en';
  let language = supportedLanguages.includes(initialLanguage) ? initialLanguage : 'en';
  let theme = savedValue('theme') === 'dark' ? 'dark' : 'light';
  let publicationFilter = 'all';

  const messages = {
    en: {
      skip: 'Skip to content', homepage: 'Academic homepage', onThisPage: 'CONTENTS',
      navigation: 'Main navigation', about: 'About', news: 'News', publications: 'Publications',
      honors: 'Honors', awards: 'Awards', service: 'Service', distinctions: 'Distinctions',
      peerReview: 'Peer review & community', conferences: 'Conferences', journals: 'Journals', community: 'Community', reviewer: 'Reviewer',
      chooseLanguage: 'Choose language', welcome: "HELLO, I'M", interests: 'Research interests',
      latestUpdates: 'Latest updates', filterPublications: 'Filter publications', all: 'All',
      accepted: 'Accepted', preprints: 'Preprints', recognition: 'Recognition', backToTop: 'Back to top',
      darkTheme: 'Switch to dark theme', lightTheme: 'Switch to light theme',
      photo: 'YOUR PHOTO', updated: 'Updated',
      openPhoto: 'View larger photo', closePhoto: 'Close photo', photoTitle: 'Profile photo', photoHint: 'Esc or click outside to close',
      emptyPublications: 'No publications in this category yet.', scholar: 'Google Scholar', firstPage: 'First page · PDF', openPdf: 'Open PDF'
    },
    zh: {
      skip: '跳到正文', homepage: '学术主页', onThisPage: '目录',
      navigation: '主导航', about: '关于我', news: '最新动态', publications: '学术论文',
      honors: '荣誉', awards: '奖项', service: '学术服务', distinctions: '荣誉称号',
      peerReview: '审稿与学术社区', conferences: '学术会议', journals: '学术期刊', community: '学术社区', reviewer: '审稿人',
      chooseLanguage: '选择语言', welcome: '你好，我是', interests: '研究方向',
      latestUpdates: '近期消息', filterPublications: '筛选论文', all: '全部',
      accepted: '已录用', preprints: '预印本', recognition: '荣誉与认可', backToTop: '返回顶部',
      darkTheme: '切换到深色主题', lightTheme: '切换到浅色主题',
      photo: '你的照片', updated: '更新于',
      openPhoto: '点击查看大图', closePhoto: '关闭照片', photoTitle: '个人照片', photoHint: '按 Esc 或点击空白处关闭',
      emptyPublications: '该分类下暂无论文。', scholar: '谷歌学术', firstPage: '论文首页 · PDF', openPdf: '打开 PDF'
    }
  };
  const t = (key) => messages[language][key] || messages.en[key] || key;
  const localize = (value) => {
    if (value == null) return '';
    if (typeof value === 'object') return String(value[language] || value.en || value.zh || '').trim();
    return String(value).trim();
  };
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const safeUrl = (value, image = false) => {
    const url = localize(value);
    if (!url || /[\u0000-\u001f\u007f\\]/.test(url) || url.startsWith('//')) return '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) && !/^https?:\/\//i.test(url) && !( !image && /^mailto:/i.test(url))) return '';
    return url.replace(/^\/(?=assets\/)/, '');
  };
  const externalAttrs = (url) => /^https?:/i.test(url) || /\.pdf(?:[?#]|$)/i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
  const icons = {
    location: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    university: '<path d="m3 8 9-5 9 5H3ZM4 21h16M3 18h18M6 10v8M10 10v8M14 10v8M18 10v8"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    github: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-3c3-.3 6-1.5 6-6a4.7 4.7 0 0 0-1.3-3.3 4.3 4.3 0 0 0-.1-3.2s-1.1-.3-3.6 1.3a12.4 12.4 0 0 0-6 0C6.5 2.2 5.4 2.5 5.4 2.5a4.3 4.3 0 0 0-.1 3.2A4.7 4.7 0 0 0 4 9c0 4.5 3 5.7 6 6a3.5 3.5 0 0 0-1 3v4"/>',
    scholar: '<path d="m2 9 10-5 10 5-10 5-10-5zm4 3v6c4 2 8 2 12 0v-6M22 9v7"/>',
    file: '<path d="M14 3H5v18h14V8l-5-5zm0 0v5h5M8 12h8M8 16h6"/>',
    medal: '<circle cx="12" cy="8" r="5"/><path d="m8 12-2 9 6-3 6 3-2-9m-6-4 1.5 1.5L14 7"/>',
    trophy: '<path d="M8 3h8v5a4 4 0 0 1-8 0V3Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4M12 12v6m-4 3v-3h8v3M6 21h12"/>',
    link: '<path d="M14 3h7v7M21 3 10 14M10 5H4v15h15v-6"/>',
    zoom: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M7.5 10.5h6M10.5 7.5v6"/>',
    moon: '<path d="M20.7 13a9 9 0 0 1-9.7-9.7A9 9 0 1 0 20.7 13Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>'
  };
  const normalizeIcon = (name) => {
    const key = String(name || '').toLowerCase().replace(/[\s_-]+/g, '');
    return key === 'googlescholar' ? 'scholar' : icons[key] ? key : 'link';
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[normalizeIcon(name)]}</svg>`;
  const link = (text, url, iconName = '', action = '', context = '') => `<a href="${escapeHtml(resourceUrl(url))}"${externalAttrs(url)}${action ? ` data-pet-action="${escapeHtml(action)}"` : ''}${context ? ` data-pet-context="${escapeHtml(context)}"` : ''}>${iconName ? icon(iconName) : ''}<span>${escapeHtml(text)}</span></a>`;
  const validLinks = (items = []) => items.map((item) => ({ ...item, icon: normalizeIcon(item.icon), label: localize(item.label), url: safeUrl(item.url) })).filter((item) => item.url && item.label);
  const previewFor = (url) => safeUrl(window.ASSET_PREVIEWS?.files?.[url]?.preview, true);
  const isPdf = (url) => /\.pdf(?:[?#]|$)/i.test(url);
  const publicationAction = (item) => /^(paper|pdf|arxiv|论文)$/i.test(item.label) || item.icon === 'file' ? 'paper'
    : item.icon === 'github' || /^(code|代码)$/i.test(item.label) ? 'code' : 'project';
  const setText = (selector, text) => {
    const element = document.querySelector(selector);
    element.textContent = text;
    element.hidden = !text;
  };
  const dateMarkup = (value) => {
    const date = localize(value);
    const normalized = date.replaceAll('.', '-');
    return /^\d{4}(-\d{2}){0,2}$/.test(normalized)
      ? `<time class="item-date" datetime="${escapeHtml(normalized)}">${escapeHtml(date)}</time>`
      : `<span class="item-date">${escapeHtml(date)}</span>`;
  };

  const photoViewer = document.querySelector('#photo-viewer');
  const largePhoto = photoViewer.querySelector('.photo-viewer-image');
  const closePhotoButton = photoViewer.querySelector('.photo-viewer-close');
  let photoReturnFocus;
  const closePhoto = () => {
    if (photoViewer.hidden) return;
    photoViewer.hidden = true;
    document.body.classList.remove('photo-viewer-open');
    document.body.style.removeProperty('--photo-scrollbar');
    const trigger = photoReturnFocus?.isConnected ? photoReturnFocus : document.querySelector('.portrait-open');
    trigger?.focus({ preventScroll: true });
  };
  const openPhoto = (trigger) => {
    const original = safeUrl(profile.image, true);
    if (!original) return;
    const fallback = trigger.querySelector('img')?.src;
    largePhoto.onerror = () => {
      largePhoto.onerror = null;
      if (fallback && fallback !== largePhoto.src) largePhoto.src = fallback;
    };
    largePhoto.src = resourceUrl(original);
    photoReturnFocus = trigger;
    document.body.style.setProperty('--photo-scrollbar', `${Math.max(0, window.innerWidth - document.documentElement.clientWidth)}px`);
    document.body.classList.add('photo-viewer-open');
    photoViewer.hidden = false;
    closePhotoButton.focus({ preventScroll: true });
  };
  closePhotoButton.addEventListener('click', closePhoto);
  photoViewer.addEventListener('click', (event) => { if (event.target === photoViewer) closePhoto(); });
  document.addEventListener('keydown', (event) => {
    if (photoViewer.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closePhoto(); }
    if (event.key === 'Tab') { event.preventDefault(); closePhotoButton.focus(); }
  });
  document.addEventListener('focusin', (event) => {
    if (!photoViewer.hidden && !photoViewer.contains(event.target)) closePhotoButton.focus({ preventScroll: true });
  });

  const renderTheme = () => {
    document.documentElement.dataset.theme = theme;
    const toggle = document.querySelector('.theme-toggle');
    toggle.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    toggle.setAttribute('aria-label', t(theme === 'dark' ? 'lightTheme' : 'darkTheme'));
    toggle.title = toggle.getAttribute('aria-label');
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#151c24' : '#f6f5f1';
  };

  const renderProfile = () => {
    const name = localize(profile.name);
    const englishName = typeof profile.name === 'object' ? profile.name.en : name;
    const alternateName = typeof profile.name === 'object' ? profile.name[language === 'en' ? 'zh' : 'en'] : '';
    const initials = profile.initials || String(englishName || name || 'YN').split(/\s+/).filter(Boolean).map((part) => Array.from(part)[0]).slice(0, 3).join('').toUpperCase();
    setText('#profile-name', name);
    setText('#nav-name', name || t('homepage'));
    setText('#profile-alternate-name', alternateName && alternateName !== name ? `(${alternateName})` : '');
    const alternate = document.querySelector('#profile-alternate-name');
    alternate.lang = language === 'en' ? 'zh-CN' : 'en';
    setText('#profile-role', localize(profile.role));
    const bio = localize(profile.bio);
    const advisorName = localize(profile.advisor?.name);
    const advisorUrl = safeUrl(profile.advisor?.url);
    const biography = document.querySelector('#profile-bio');
    biography.hidden = !bio;
    biography.innerHTML = advisorName && advisorUrl
      ? bio.split(advisorName).map(escapeHtml).join(link(advisorName, advisorUrl, '', 'advisor', advisorName))
      : escapeHtml(bio);
    document.title = [...new Set([name, localize(settings.title) || t('homepage')].filter(Boolean))].join(' | ');
    document.querySelector('meta[name="description"]').content = localize(settings.description);

    const affiliation = localize(profile.affiliation);
    const affiliationUrl = safeUrl(profile.affiliationUrl);
    const location = localize(profile.location);
    const email = localize(profile.email);
    document.querySelector('#profile-meta').innerHTML = [
      affiliation ? `<p class="profile-meta-row">${icon('university')}${affiliationUrl ? link(affiliation, affiliationUrl, '', 'institution') : `<span>${escapeHtml(affiliation)}</span>`}</p>` : '',
      location ? `<p class="profile-meta-row">${icon('location')}<span>${escapeHtml(location)}</span></p>` : '',
      email ? `<p class="profile-meta-row">${icon('mail')}${link(email, `mailto:${email}`, '', 'email')}</p>` : ''
    ].join('');
    const links = validLinks(profile.links);
    document.querySelector('#profile-links').innerHTML = links.map((item) => link(item.label, item.url, item.icon, item.icon === 'file' ? 'cv' : item.icon === 'scholar' ? 'scholar' : item.icon === 'github' ? 'github' : 'external')).join('');
    const scholar = links.find((item) => item.icon === 'scholar');
    document.querySelector('#publications-scholar').innerHTML = scholar
      ? `<a class="scholar-link" href="${escapeHtml(resourceUrl(scholar.url))}"${externalAttrs(scholar.url)} data-pet-action="scholar">${icon('scholar')}<span>${escapeHtml(t('scholar'))}</span></a>` : '';

    document.querySelector('#research-interests').innerHTML = (profile.interests || []).map(localize).filter(Boolean).map((interest) => `<li>${escapeHtml(interest)}</li>`).join('');

    const portrait = document.querySelector('#profile-portrait');
    const placeholder = `<div class="portrait-placeholder" role="img" aria-label="${escapeHtml(name)}"><span class="portrait-initials" aria-hidden="true">${escapeHtml(initials)}</span><span class="portrait-caption" aria-hidden="true">${escapeHtml(t('photo'))}</span></div>`;
    const original = safeUrl(profile.image, true);
    const image = previewFor(original) || original;
    portrait.innerHTML = image ? `<button class="portrait-open" type="button" data-pet-action="photo" data-pet-context="${escapeHtml(name)}" aria-label="${escapeHtml(t('openPhoto') + ': ' + name)}" title="${escapeHtml(t('openPhoto'))}"><img src="${escapeHtml(resourceUrl(image))}" alt="${escapeHtml(localize(profile.imageAlt) || name)}" width="150" height="192" decoding="async" fetchpriority="high"><span class="portrait-zoom" aria-hidden="true">${icon('zoom')}</span></button>` : placeholder;
    portrait.querySelector('.portrait-open')?.addEventListener('click', (event) => openPhoto(event.currentTarget));
    portrait.querySelector('img')?.addEventListener('error', (event) => {
      const img = event.currentTarget;
      if (image !== original && !img.dataset.triedOriginal) {
        img.dataset.triedOriginal = 'true';
        img.src = resourceUrl(original);
      } else portrait.innerHTML = placeholder;
    });
    document.querySelector('#photo-viewer-title').textContent = `${name} · ${t('photoTitle')}`;
    largePhoto.alt = localize(profile.imageAlt) || name;
    closePhotoButton.setAttribute('aria-label', t('closePhoto'));
    photoViewer.querySelector('.photo-viewer-hint').textContent = t('photoHint');
  };

  const renderNews = () => {
    document.querySelector('#news-list').innerHTML = (data.news || []).map((item) => {
      const url = safeUrl(item.link);
      const symbol = ({ paper: '🎉', award: '🏅', update: '↗' })[item.kind] || '';
      const message = localize(item.text);
      const text = url ? link(message, url, '', item.kind === 'paper' ? 'paper' : 'news') : escapeHtml(message);
      return `<article class="news-item">${dateMarkup(item.date)}<p>${symbol && !/^(🎉|🏅|🏆|↗)/u.test(message) ? `<span class="news-icon" aria-hidden="true">${symbol}</span>` : ''}${text}</p></article>`;
    }).join('');
  };

  const renderPublications = () => {
    const all = data.publications || [];
    const papers = publicationFilter === 'all' ? all : all.filter((paper) => paper.type === publicationFilter);
    const names = [...(data.authorNames || []), typeof profile.name === 'object' ? profile.name.en : profile.name].filter(Boolean);
    setText('#publication-note', localize(settings.publicationNote));
    document.querySelectorAll('[data-filter]').forEach((button) => {
      const active = button.dataset.filter === publicationFilter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const list = document.querySelector('#publication-list');
    list.innerHTML = papers.map((paper, paperIndex) => {
      const links = validLinks(paper.links);
      const paperLink = links.find((item) => /^(paper|arxiv|论文)$/i.test(item.label)) || links.find((item) => item.icon === 'file') || links[0];
      const title = localize(paper.title);
      const original = safeUrl(paper.image, true);
      const pdf = isPdf(original) ? original : '';
      const image = previewFor(original) || (pdf ? '' : original);
      if (pdf && !links.some((item) => item.url === pdf)) links.push({ label: 'PDF', url: pdf, icon: 'file' });
      const authors = (paper.authors || []).map((value) => {
        const author = localize(value);
        const plainName = author.replace(/[\s*†‡]+$/g, '');
        const markers = author.slice(plainName.length).trim();
        const name = names.includes(plainName) ? `<strong>${escapeHtml(plainName)}</strong>` : escapeHtml(plainName);
        const description = [...markers].map((mark) => mark === '†' ? (language === 'zh' ? '共同贡献' : 'Equal contribution')
          : mark === '*' ? (language === 'zh' ? '通讯作者' : 'Corresponding author') : mark).join('; ');
        return name + (markers ? `<sup class="author-markers" aria-label="${escapeHtml(description)}" title="${escapeHtml(description)}">${escapeHtml(markers)}</sup>` : '');
      }).join(', ');
      const thumbnail = pdf ? `<a class="publication-thumbnail is-pdf${image ? '' : ' is-unavailable'}" href="${escapeHtml(resourceUrl(pdf))}" target="_blank" rel="noopener noreferrer" data-pet-action="paper" data-pet-context="${escapeHtml(title)}" aria-label="${escapeHtml(t('openPdf') + ': ' + title)}">${image ? `<img src="${escapeHtml(resourceUrl(image))}" alt="${escapeHtml(localize(paper.imageAlt) || title)}" width="740" height="960" loading="${paperIndex < 6 ? 'eager' : 'lazy'}" decoding="async">` : icon('file')}<span class="pdf-thumbnail-caption">${escapeHtml(image ? t('firstPage') : t('openPdf'))} ↗</span></a>`
        : image ? `<div class="publication-thumbnail"><img src="${escapeHtml(resourceUrl(image))}" alt="${escapeHtml(localize(paper.imageAlt) || title)}" loading="lazy" decoding="async"></div>` : '';
      const venueShort = localize(paper.venueShort) || localize(paper.year);
      const venue = localize(paper.venue);
      const summary = localize(paper.summary);
      return `<article class="publication-card${thumbnail ? ' has-image' : ''}">${thumbnail}<div class="publication-content">
        <h3>${paperLink ? link(title, paperLink.url, '', 'paper', title) : escapeHtml(title)}</h3>
        ${authors ? `<p class="authors">${authors}</p>` : ''}
        <div class="publication-meta">
          ${venueShort ? `<span class="venue-badge${paper.type === 'preprint' ? ' preprint' : ''}">${escapeHtml(venueShort)}</span>` : ''}
          ${paper.type === 'accepted' && paper.ccfRank ? `<span class="ccf-badge">CCF ${escapeHtml(paper.ccfRank)}</span>` : ''}
          ${venue ? `<span class="venue">${escapeHtml(venue)}</span>` : ''}
        </div>
        ${summary ? `<p class="publication-summary">${escapeHtml(summary)}</p>` : ''}
        <div class="publication-links">${links.map((item) => link(item.label, item.url, item.icon, publicationAction(item), title)).join('')}</div>
      </div></article>`;
    }).join('') || `<p class="empty-state">${escapeHtml(t('emptyPublications'))}</p>`;
    list.querySelectorAll('.publication-thumbnail img').forEach((image) => {
      image.addEventListener('error', () => {
        const card = image.closest('.publication-card');
        const thumbnail = image.closest('.publication-thumbnail');
        if (thumbnail.classList.contains('is-pdf')) {
          image.remove();
          thumbnail.classList.add('is-unavailable');
          thumbnail.insertAdjacentHTML('afterbegin', icon('file'));
          thumbnail.querySelector('.pdf-thumbnail-caption').textContent = t('openPdf') + ' ↗';
          return;
        }
        thumbnail.remove();
        card.classList.remove('has-image');
      }, { once: true });
    });
  };

  const renderRecognition = (items, selector, iconName) => {
    document.querySelector(selector).innerHTML = (items || []).map((item) => {
      const url = safeUrl(item.link);
      const title = localize(item.title);
      const organization = localize(item.organization);
      return `<article class="recognition-item">${dateMarkup(item.date)}<div class="recognition-content"><p class="recognition-title">${url ? link(title, url) : escapeHtml(title)}</p>${organization ? `<span class="recognition-organization">${escapeHtml(organization)}</span>` : ''}</div><span class="recognition-mark" aria-hidden="true">${icon(iconName)}</span></article>`;
    }).join('');
  };

  const renderService = () => {
    const groups = [
      { category: 'conference', label: 'conferences', icon: 'scholar' },
      { category: 'journal', label: 'journals', icon: 'file' },
      { category: 'other', label: 'community', icon: 'link' }
    ];
    document.querySelector('#service-list').innerHTML = groups.map((group) => {
      const items = (data.service || []).filter((item) => (['conference', 'journal'].includes(item.category) ? item.category : 'other') === group.category);
      if (!items.length) return '';
      return `<div class="service-group"><h3 class="service-group-title">${icon(group.icon)}<span>${escapeHtml(t(group.label))}</span></h3><ul>${items.map((item) => {
        const venue = localize(item.venue);
        const url = safeUrl(item.link);
        const role = localize(item.role) || t('reviewer');
        const years = (item.years || []).map(localize).filter(Boolean).join(' · ');
        return `<li class="service-item"><div class="service-entry"><p class="service-venue">${url ? link(venue, url, '', 'service', venue) : escapeHtml(venue)}</p><span class="service-role">${escapeHtml(role)}</span></div>${years ? `<span class="service-years">${escapeHtml(years)}</span>` : ''}</li>`;
      }).join('')}</ul></div>`;
    }).join('');
  };

  const setupAppearance = () => {
    const appearance = settings.appearance || {};
    const root = document.documentElement;
    root.dataset.crest = String(appearance.crestWatermark !== false);
    root.dataset.characterCursor = String(appearance.customCursor !== false);
    const opacity = appearance.crestOpacity;
    root.style.setProperty('--crest-opacity', String(Number.isFinite(opacity) ? Math.max(0, Math.min(.2, opacity)) : .075));
  };

  const updateActiveNavigation = () => {
    const sections = Array.from(document.querySelectorAll('main > section')).filter((section) => !section.hidden);
    const offset = window.innerWidth <= 960 * uiScale ? document.querySelector('.sidebar').offsetHeight + 32 * uiScale : 80 * uiScale;
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= offset) active = section;
    }
    const atBottom = window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) active = sections.at(-1);
    document.querySelectorAll('.section-nav a').forEach((item) => {
      const selected = item.getAttribute('href') === `#${active?.id}`;
      item.classList.toggle('is-active', selected);
      if (selected) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    });
  };

  const render = () => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach((element) => { element.setAttribute('aria-label', t(element.dataset.i18nAria)); });
    document.querySelectorAll('[data-language]').forEach((button) => { button.setAttribute('aria-pressed', String(button.dataset.language === language)); });
    renderTheme();
    renderProfile();
    renderNews();
    renderPublications();
    renderRecognition(data.honors, '#honor-list', 'medal');
    renderRecognition(data.awards, '#award-list', 'trophy');
    renderService();
    [['news', data.news], ['publications', data.publications], ['honors', data.honors], ['awards', data.awards], ['service', data.service]].forEach(([id, items]) => {
      const hidden = !items?.length;
      document.querySelector(`#${id}`).hidden = hidden;
      document.querySelector(`.section-nav a[href="#${id}"]`).hidden = hidden;
    });
    setText('#copyright', `© ${new Date().getFullYear()} ${localize(profile.name)}`);
    setText('#last-updated', settings.lastUpdated ? `${t('updated')} ${localize(settings.lastUpdated).replaceAll('-', '.')}` : '');
    updateActiveNavigation();
  };

  document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () => {
      language = button.dataset.language;
      saveValue('language', language);
      render();
    });
  });
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      publicationFilter = button.dataset.filter;
      renderPublications();
      updateActiveNavigation();
    });
  });
  document.querySelector('.theme-toggle').addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    saveValue('theme', theme);
    renderTheme();
  });
  let navigationFrame;
  const scheduleNavigation = () => {
    if (navigationFrame) return;
    navigationFrame = requestAnimationFrame(() => {
      updateActiveNavigation();
      navigationFrame = null;
    });
  };
  window.addEventListener('scroll', scheduleNavigation, { passive: true });
  window.addEventListener('resize', scheduleNavigation);
  window.addEventListener('load', scheduleNavigation);
  setupAppearance();
  render();
})();
