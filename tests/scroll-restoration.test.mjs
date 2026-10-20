import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('../app/scroll-restoration.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

// Deterministic browser lifecycle model: executes the actual component, including
// its listeners and animation frames. Covers races that a fast preview can miss.
function page({ path = '/ua', hash = '', type = 'navigate', saved = null, labelPadding = 140, stored = null, now = Date.now() } = {}) {
  const win = new EventTarget();
  const doc = new EventTarget();
  const frames = new Map();
  const storage = stored ?? new Map();
  let frameId = 0;
  let time = 0;
  let wallTime = now;
  let effect;
  let cleanup;
  let refIndex = 0;
  const refs = [];
  class ElementMock {}
  let url = new URL(`https://example.test${path}${hash}`);
  const model = {
    header: 84, height: 12000, revealY: 21.6, labelPadding,
    regions: [], disclosures: [], storageBlocked: false, focused: null, focusCalls: [], tabIndexes: {},
    sections: { top: 0, main: 0, work: 936, about: 4800, services: 8000, contact: 10000 },
  };
  const storageAccess = operation => {
    if (model.storageBlocked) throw new Error('Storage unavailable');
    return operation();
  };
  Object.assign(win, {
    scrollY: 0, innerHeight: 800,
    performance: { now: () => time, getEntriesByType: () => [{ type }] },
    sessionStorage: {
      getItem: key => storageAccess(() => storage.get(key) ?? null),
      setItem: (key, value) => storageAccess(() => storage.set(key, value)),
      removeItem: key => storageAccess(() => storage.delete(key)),
    },
    history: { state: null, scrollRestoration: 'auto', pushState: (_state, _title, target) => { url = new URL(target, url); } },
    requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
    scrollTo: ({ top }) => { win.scrollY = top; win.dispatchEvent(new Event('scroll')); },
  });
  Object.defineProperty(win, 'location', { get: () => url });
  Object.assign(doc, {
    readyState: 'complete', fonts: { status: 'loaded' }, visibilityState: 'visible',
    documentElement: { dataset: {}, get scrollHeight() { return model.height; } },
    querySelector: () => ({ getBoundingClientRect: () => ({ height: model.header }) }),
    querySelectorAll: selector => {
      if (selector === '[data-scroll-region]') return model.regions.map(region => ({
        dataset: { scrollRegion: region.key }, offsetTop: region.start, offsetParent: null, clientTop: 0,
        offsetHeight: region.end - region.start,
        getBoundingClientRect: () => ({
          top: region.start + model.revealY - win.scrollY,
          bottom: region.end + model.revealY - win.scrollY,
          height: region.end - region.start,
        }),
      }));
      if (selector.startsWith('button[data-language-disclosure]')) return model.disclosures
        .filter(disclosure => !selector.includes('[aria-expanded="true"]') || disclosure.open)
        .map(disclosure => ({
          dataset: { languageDisclosure: disclosure.key },
          getAttribute: name => name === 'aria-expanded' ? String(disclosure.open) : null,
          click: () => {
            disclosure.open = !disclosure.open;
            disclosure.clicks = (disclosure.clicks ?? 0) + 1;
            disclosure.onToggle?.();
          },
        }));
      return [];
    },
    getElementById: id => {
      if (!(id in model.sections)) return null;
      const anchor = { offsetTop: model.sections[id], offsetParent: null, clientTop: 0, getBoundingClientRect: () => ({ top: model.sections[id] - win.scrollY }) };
      anchor.hasAttribute = name => name === 'tabindex' && id in model.tabIndexes;
      Object.defineProperty(anchor, 'tabIndex', { get: () => model.tabIndexes[id], set: value => { model.tabIndexes[id] = value; } });
      anchor.focus = options => { model.focused = id; model.focusCalls.push({ id, preventScroll: options?.preventScroll }); };
      anchor.querySelector = () => ['top', 'main'].includes(id) ? null : {
        offsetTop: model.labelPadding, offsetParent: anchor,
        getBoundingClientRect: () => ({ top: model.sections[id] + model.labelPadding + model.revealY - win.scrollY }),
      };
      return anchor;
    },
  });
  const key = () => `hover-scroll:${url.pathname}${url.search}${url.hash}`;
  if (saved !== null) storage.set(key(), String(saved));
  const exports = {};
  const context = vm.createContext({
    window: win, document: doc, URL, Event, Element: ElementMock, exports,
    Date: class extends Date { static now() { return wallTime; } },
    require(name) {
      if (name === 'next/navigation') return { usePathname: () => url.pathname };
      if (name === 'react') return {
        useEffect: fn => { effect = fn; },
        useRef: initial => refs[refIndex++] ?? (refs[refIndex - 1] = { current: initial }),
      };
      throw new Error(name);
    },
  });
  vm.runInContext(source, context);
  function mount() { refIndex = 0; exports.ScrollRestoration(); cleanup = effect(); }
  function advance(count = 40) {
    for (let i = 0; i < count; i++) {
      time += 16;
      wallTime += 16;
      const pending = [...frames.values()]; frames.clear();
      for (const callback of pending) callback(time);
    }
  }
  mount();
  return { win, doc, model, storage, key, advance, navigate: exports.navigateToAnchor,
    clickAnchor: (href, { skip = false, modified = false } = {}) => {
      const link = { href: new URL(href, url).href, target: '', hasAttribute: () => false, classList: { contains: name => skip && name === 'skip-link' } };
      const target = new ElementMock();
      target.closest = () => link;
      const event = new Event('click', { cancelable: true });
      Object.assign(event, { button: 0, metaKey: modified, ctrlKey: false, shiftKey: false, altKey: false });
      Object.defineProperty(event, 'target', { value: target });
      doc.dispatchEvent(event);
      return event;
    },
    prepareLanguage: exports.prepareLanguageNavigation,
    commit: href => { cleanup(); url = new URL(href, url); win.scrollY = 0; mount(); },
    elapse: milliseconds => { wallTime += milliseconds; },
    now: () => wallTime,
    replayEffect: () => { cleanup(); mount(); },
    unmount: () => cleanup(),
    move: y => { win.scrollY = y; win.dispatchEvent(new Event('scroll')); },
    traverse: href => { url = new URL(href, url); win.dispatchEvent(new Event('popstate')); win.dispatchEvent(new Event('hashchange')); },
  };
}

test('the keyboard skip link focuses main without creating a sequential tab stop or native scroll jump', () => {
  const p = page();
  p.move(3500);
  const event = p.clickAnchor('#main', { skip: true });
  assert.equal(event.defaultPrevented, true);
  assert.equal(p.model.focused, 'main');
  assert.equal(p.model.tabIndexes.main, -1);
  assert.deepEqual(p.model.focusCalls, [{ id: 'main', preventScroll: true }]);
  p.advance();
  assert.equal(p.win.scrollY, 0);
  p.unmount();
});

test('ordinary anchors retain focus, and modified skip clicks keep native navigation', () => {
  const p = page();
  assert.equal(p.clickAnchor('#work').defaultPrevented, true);
  assert.equal(p.model.focused, null);
  assert.equal(p.clickAnchor('#main', { skip: true, modified: true }).defaultPrevented, false);
  assert.equal(p.model.focused, null);
  assert.deepEqual(p.model.tabIndexes, {});
  p.unmount();
});

test('skip navigation preserves an existing focus target tabindex', () => {
  const p = page();
  p.model.tabIndexes.main = 0;
  p.clickAnchor('#main', { skip: true });
  assert.equal(p.model.focused, 'main');
  assert.equal(p.model.tabIndexes.main, 0);
  p.unmount();
});

for (const locale of ['ua', 'en']) {
  for (const [expanded, compact, labelPadding] of [[84, 64, 140], [72, 60, 104]]) {
    test(`${locale}: each divider stays 32px below shrinking header ${expanded}→${compact} through layout and reveal changes`, () => {
      const p = page({ path: `/${locale}`, labelPadding });
      for (const id of ['work', 'services', 'about', 'contact']) {
        p.model.header = expanded;
        p.navigate(`#${id}`);
        p.advance(2);
        p.model.header = compact;
        p.model.sections[id] += 137; // font/image layout completes after navigation
        p.model.revealY = 0;
        p.advance();
        assert.equal(p.model.sections[id] + labelPadding - p.win.scrollY, compact + 32);
        assert.equal(p.doc.documentElement.dataset.scrollRestoring, undefined);
      }
      p.unmount();
    });
  }
}

for (const hash of ['', '#services']) {
  test(`reload restores exact coordinate ${hash || 'without hash'} despite hydration/clamping`, () => {
    const p = page({ hash, type: 'reload', saved: 3777 });
    p.doc.fonts.status = 'loading';
    p.model.height = 1200;
    p.advance(3);
    assert.equal(p.storage.get(p.key()), '3777');
    p.replayEffect(); // React development effect setup/cleanup replay
    p.model.height = 12000;
    p.doc.fonts.status = 'loaded';
    p.move(0); // late browser/router reset
    p.advance();
    assert.equal(p.win.scrollY, 3777);
    assert.equal(p.storage.get(p.key()), '3777');
    p.unmount();
  });
}

test('saved zero takes priority over a reload hash', () => {
  const p = page({ hash: '#contact', type: 'reload', saved: 0 });
  p.advance();
  assert.equal(p.win.scrollY, 0);
  p.unmount();
});

test('repeating the current hash navigates again after manual scrolling', () => {
  const p = page({ hash: '#work' });
  p.advance();
  p.move(4000);
  p.navigate('#work');
  p.advance();
  assert.equal(p.win.scrollY, p.model.sections.work + p.model.labelPadding - p.model.header - 32);
  p.unmount();
});

test('slow history traversal finishes before final position alignment', () => {
  const p = page();
  p.navigate('#work'); p.advance(); p.move(1400);
  p.navigate('#services'); p.advance();
  p.win.__VINEXT_RSC_PENDING__ = new Promise(() => {});
  p.traverse('#work');
  p.advance(300); // longer than ordinary settling deadline
  assert.equal(p.doc.documentElement.dataset.scrollRestoring, '');
  p.move(0); // router applies its stale coordinate when traversal commits
  p.win.__VINEXT_RSC_PENDING__ = null;
  p.advance();
  assert.equal(p.win.scrollY, 1400);
  p.unmount();
});

test('user input interrupts restoration and keeps the new position', () => {
  const p = page({ hash: '#contact', type: 'reload', saved: 3500 });
  p.advance(1);
  p.win.dispatchEvent(new Event('wheel'));
  p.move(4200); p.advance();
  assert.equal(p.win.scrollY, 4200);
  assert.equal(p.storage.get(p.key()), '4200');
  p.unmount();
});

test('missing anchor times out and releases restoration', () => {
  const p = page({ hash: '#missing' });
  p.advance(260);
  assert.equal(p.doc.documentElement.dataset.scrollRestoring, undefined);
  p.unmount();
});

test('direct hash entry on home and an internal contact keeps the divider visible', () => {
  for (const path of ['/ua', '/en', '/ua/services/business-websites', '/en/work/yevai']) {
    const p = page({ path, hash: '#contact' });
    p.advance();
    assert.equal(p.model.sections.contact + p.model.labelPadding - p.win.scrollY, p.model.header + 32);
    p.unmount();
  }
});

test('top remains at zero and a non-section anchor uses the header offset', () => {
  const p = page();
  p.move(2400);
  p.navigate('#top'); p.advance();
  assert.equal(p.win.scrollY, 0);
  p.model.sections.main = 500;
  p.navigate('#main'); p.advance();
  assert.equal(p.win.scrollY, 500 - p.model.header);
  p.unmount();
});

function semanticLayout(p, key, { start = 2400, end = 4000, height = 6000 } = {}) {
  p.model.height = height;
  p.model.regions = [
    { key: 'intro', start: 0, end: start },
    { key, start, end },
    { key: 'contact', start: end, end: height - 600 },
    { key: 'footer', start: height - 600, end: height },
  ];
}

const languageMarkerKey = 'hover-language-position';

for (const [suffix, region] of [
  ['', 'about'],
  ['/services/business-websites', 'service-scope'],
  ['/work/yevai', 'case-challenge'],
  ['/privacy', 'privacy-cookies'],
]) {
  for (const locale of ['ua', 'en']) {
    const other = locale === 'ua' ? 'en' : 'ua';
    test('language switch keeps semantic reading position on /' + locale + suffix, () => {
      for (const [expanded, compact] of [[84, 64], [72, 60]]) {
        const p = page({ path: '/' + locale + suffix });
        semanticLayout(p, region);
        p.model.header = expanded;
        // The reading point is three eighths through this semantic section.
        p.move(3000 - expanded - 32);
        const target = p.prepareLanguage('/' + other + suffix);
        assert.ok(target);
        semanticLayout(p, region, { start: 3300, end: 5700, height: 8000 });
        p.commit(target);
        p.advance(2);
        // Header shrink, late translated text/image layout, and reveal motion.
        p.model.header = compact;
        p.model.regions[1].start = 3500;
        p.model.regions[2].start = 6100;
        p.model.revealY = 0;
        p.advance();
        const expectedProbe = 3500 + (6100 - 3500) * 3 / 8;
        assert.equal(p.win.scrollY + compact + 32, expectedProbe);
        assert.equal(p.doc.documentElement.dataset.scrollRestoring, undefined);
        assert.equal(p.storage.get(p.key()), String(p.win.scrollY));
        p.unmount();
      }
    });
  }
}

test('language switch preserves query/hash but an old hash and destination cache cannot override the reading point', () => {
  const p = page({ path: '/ua?service=corporate-websites', hash: '#work' });
  p.advance();
  semanticLayout(p, 'faq');
  p.move(3000 - p.model.header - 32);
  const target = p.prepareLanguage('/en?discard=this#contact');
  assert.equal(target, '/en?service=corporate-websites#work');
  p.storage.set('hover-scroll:' + target, '777');
  semanticLayout(p, 'faq', { start: 3300, end: 5700, height: 8000 });
  p.commit(target);
  p.advance();
  assert.equal(p.win.scrollY, 4200 - p.model.header - 32);
  assert.equal(p.win.location.hash, '#work');
  assert.equal(p.storage.get(languageMarkerKey), undefined);
  p.unmount();
});

test('only same-origin translated versions of the same route prepare a language handoff', () => {
  const p = page({ path: '/ua/services/business-websites' });
  for (const href of [
    '/ua/services/business-websites',
    '/en/work/yevai',
    '/en/services/website-care',
    'https://elsewhere.test/en/services/business-websites',
  ]) assert.equal(p.prepareLanguage(href), null, href);
  assert.equal(p.storage.get(languageMarkerKey), undefined);
  p.unmount();
});

test('language switch pins the exact top and footer bottom as translated document height changes', () => {
  for (const edge of ['top', 'bottom']) {
    const p = page();
    semanticLayout(p, 'about');
    p.move(edge === 'top' ? 0 : p.model.height - p.win.innerHeight);
    const target = p.prepareLanguage('/en');
    semanticLayout(p, 'about', { start: 3300, end: 5700, height: 8000 });
    p.commit(target);
    p.advance(2);
    p.model.height = 9000;
    p.advance();
    assert.equal(p.win.scrollY, edge === 'top' ? 0 : 9000 - p.win.innerHeight);
    p.unmount();
  }
});

for (const type of ['reload', 'back_forward']) {
  for (const saved of [0, 3777]) {
    test(type + ' exact coordinate ' + saved + ' takes priority over a fresh language marker and hash', () => {
      const sourcePage = page({ hash: '#work' });
      semanticLayout(sourcePage, 'about');
      sourcePage.move(3000 - sourcePage.model.header - 32);
      sourcePage.prepareLanguage('/en');
      sourcePage.unmount();
      const p = page({ path: '/en', hash: '#work', type, saved, stored: sourcePage.storage, now: sourcePage.now() });
      semanticLayout(p, 'about', { start: 3300, end: 5700, height: 8000 });
      p.advance();
      assert.equal(p.win.scrollY, saved);
      assert.equal(p.storage.get(p.key()), String(saved));
      p.unmount();
    });
  }
}

test('language handoff survives source and arrival effect replay while fonts and the router are pending', () => {
  const p = page({ hash: '#work' });
  p.advance();
  semanticLayout(p, 'about');
  p.move(3000 - p.model.header - 32);
  const target = p.prepareLanguage('/en');
  p.replayEffect(); // Source still mounted while the translated route loads.
  semanticLayout(p, 'about', { start: 3300, end: 5700, height: 8000 });
  p.doc.fonts.status = 'loading';
  p.win.__VINEXT_RSC_PENDING__ = new Promise(() => {});
  p.commit(target);
  p.advance(2);
  assert.equal(p.storage.get(languageMarkerKey), undefined);
  p.replayEffect(); // Marker was consumed, but the arrival must keep its snapshot.
  p.advance(300);
  assert.equal(p.doc.documentElement.dataset.scrollRestoring, '');
  p.model.regions[1].start = 3500;
  p.model.regions[2].start = 6100;
  p.model.header = 64;
  p.doc.fonts.status = 'loaded';
  p.move(0); // Late router commit applies its own scroll reset.
  p.win.__VINEXT_RSC_PENDING__ = null;
  p.advance();
  assert.equal(p.win.scrollY, 3500 + 2600 * 3 / 8 - 64 - 32);
  assert.equal(p.doc.documentElement.dataset.scrollRestoring, undefined);
  p.unmount();
});

test('expired and wrong-target language handoffs do not affect an unrelated fresh navigation', () => {
  for (const stale of [false, true]) {
    const p = page();
    semanticLayout(p, 'about');
    p.move(3000 - p.model.header - 32);
    const target = p.prepareLanguage('/en');
    if (stale) p.elapse(60_001);
    p.commit(stale ? target : '/en/privacy');
    p.advance();
    assert.equal(p.win.scrollY, 0);
    assert.equal(p.doc.documentElement.dataset.scrollRestoring, undefined);
    assert.equal(p.storage.get(languageMarkerKey), undefined);
    p.unmount();
  }
});

test('a stored handoff also restores after a full document navigation', () => {
  const sourcePage = page({ path: '/ua/privacy' });
  semanticLayout(sourcePage, 'privacy-cookies');
  sourcePage.move(3000 - sourcePage.model.header - 32);
  sourcePage.prepareLanguage('/en/privacy');
  sourcePage.unmount();
  const p = page({ path: '/en/privacy', stored: sourcePage.storage, now: sourcePage.now() });
  semanticLayout(p, 'privacy-cookies', { start: 3300, end: 5700, height: 8000 });
  p.advance();
  assert.equal(p.win.scrollY, 4200 - p.model.header - 32);
  assert.equal(p.storage.get(languageMarkerKey), undefined);
  p.unmount();
});

test('language navigation falls back to its coordinate if a semantic region is absent', () => {
  for (const absentAtSource of [false, true]) {
    const p = page();
    if (!absentAtSource) semanticLayout(p, 'removed-region');
    p.move(2345);
    const target = p.prepareLanguage('/en');
    p.model.regions = [];
    p.commit(target);
    p.advance();
    assert.equal(p.win.scrollY, 2345);
    p.unmount();
  }
});

test('blocked sessionStorage still permits an in-memory language handoff', () => {
  const p = page();
  semanticLayout(p, 'about');
  p.move(3000 - p.model.header - 32);
  p.model.storageBlocked = true;
  let target;
  assert.doesNotThrow(() => { target = p.prepareLanguage('/en'); });
  semanticLayout(p, 'about', { start: 3300, end: 5700, height: 8000 });
  assert.doesNotThrow(() => p.commit(target));
  p.advance();
  assert.equal(p.win.scrollY, 4200 - p.model.header - 32);
  assert.equal(p.doc.documentElement.dataset.scrollRestoring, undefined);
  p.unmount();
});

test('pointer or wheel input cancels language restoration without replaying its handoff', () => {
  for (const input of ['pointerdown', 'wheel']) {
    const p = page();
    semanticLayout(p, 'about');
    p.move(3000 - p.model.header - 32);
    const target = p.prepareLanguage('/en');
    semanticLayout(p, 'about', { start: 3300, end: 5700, height: 8000 });
    p.commit(target);
    p.advance(1);
    p.win.dispatchEvent(new Event(input));
    p.move(4900);
    p.advance();
    assert.equal(p.win.scrollY, 4900);
    assert.equal(p.storage.get(p.key()), '4900');
    assert.equal(p.storage.get(languageMarkerKey), undefined);
    assert.equal(p.doc.documentElement.dataset.scrollRestoring, undefined);
    p.unmount();
  }
});

test('expanded content is restored once before measuring the translated semantic region', () => {
  const p = page();
  semanticLayout(p, 'faq');
  p.model.disclosures = [{ key: 'faq:timeline', open: true }];
  p.move(3000 - p.model.header - 32);
  const target = p.prepareLanguage('/en');
  semanticLayout(p, 'faq', { start: 3300, end: 5000, height: 8000 });
  const disclosure = {
    key: 'faq:timeline', open: false,
    onToggle: () => { p.model.regions[2].start = 5700; },
  };
  p.model.disclosures = [disclosure];
  p.commit(target);
  p.advance();
  assert.equal(disclosure.open, true);
  assert.equal(disclosure.clicks, 1);
  assert.equal(p.win.scrollY, 4200 - p.model.header - 32);
  p.unmount();
});
