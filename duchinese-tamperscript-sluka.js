// ==UserScript==
// @name         Du Chinese inline text for Sluka
// @namespace    local.duchinese.sluka
// @version      1.0.0
// @description  Replace a Du Chinese lesson canvas with HTML that Sluka can scan.
// @match        https://duchinese.net/lessons/*
// @match        https://www.duchinese.net/lessons/*
// @run-at       document-idle
// @noframes
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  let active;
  let scriptIndex = 0;
  let showOriginal = false;
  let pending = false;

  function splitTranscript(text) {
    // Observed layout: Simplified title and body, then Traditional title and body.
    const blocks = text.split(/\r?\n(?:[^\S\r\n]*\r?\n)+/).map(block => block.trim());
    if (blocks.length !== 4) return null;
    const [simplifiedTitle, simplifiedBody, traditionalTitle, traditionalBody] = blocks;
    if (simplifiedTitle.includes('\n') || traditionalTitle.includes('\n')) return null;
    if (!blocks.every(block => /\p{Script=Han}/u.test(block))) return null;
    if (simplifiedBody.split('\n').length !== traditionalBody.split('\n').length) return null;
    return [[simplifiedTitle, simplifiedBody], [traditionalTitle, traditionalBody]];
  }

  function render(state) {
    const [title, body] = state.versions[scriptIndex];
    state.article.lang = scriptIndex === 0 ? 'zh-Hans' : 'zh-Hant';
    const paragraphs = [title, ...body.split(/\r?\n/)].filter(line => line.trim()).map(line => {
      const paragraph = document.createElement('p');
      paragraph.textContent = line.trim();
      return paragraph;
    });
    state.article.replaceChildren(...paragraphs);
  }

  function applyView(state) {
    state.article.hidden = showOriginal;
    if (showOriginal) {
      state.clipper.style.setProperty('display', state.display, state.priority);
    } else {
      state.clipper.style.setProperty('display', 'none', 'important');
    }
    state.toggle.textContent = showOriginal ? 'Show Sluka text' : 'Show original player';
    state.select.disabled = showOriginal;
  }

  function sync() {
    const isLesson = /^\/lessons\/\d+(?:-|\/|$)/.test(location.pathname);
    const clipper = isLesson ? document.querySelector('.lesson-canvas-clipper') : null;
    const raw = [...(clipper?.querySelectorAll('canvas') ?? [])]
      .map(canvas => canvas.textContent.trim())
      .find(text => /\p{Script=Han}/u.test(text));

    if (active?.clipper === clipper && active.raw === raw && active.panel.isConnected) return;
    if (active) {
      active.clipper.style.setProperty('display', active.display, active.priority);
      active.panel.remove();
      active = undefined;
    }

    const versions = raw && splitTranscript(raw);
    if (!versions) return;

    const panel = document.createElement('section');
    panel.setAttribute('aria-label', 'Sluka lesson view');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Transcript character script');
    select.style.marginInlineStart = '0.5rem';
    for (const label of ['Simplified', 'Traditional']) {
      const option = document.createElement('option');
      option.textContent = label;
      select.append(option);
    }
    select.selectedIndex = scriptIndex;

    const article = document.createElement('article');
    article.style.cssText = 'padding: 1rem; font-size: 1.3rem; line-height: 1.8;';

    const state = {
      clipper, raw, versions, panel, article, toggle, select,
      display: clipper.style.getPropertyValue('display'),
      priority: clipper.style.getPropertyPriority('display'),
    };
    toggle.addEventListener('click', () => {
      showOriginal = !showOriginal;
      applyView(state);
    });
    select.addEventListener('change', () => {
      scriptIndex = select.selectedIndex;
      render(state);
    });

    render(state);
    panel.append(toggle, select, article);
    clipper.before(panel);
    applyView(state);
    active = state;
  }

  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      sync();
    });
  });
  observer.observe(document.body, { childList: true, characterData: true, subtree: true });
  sync();
})();
