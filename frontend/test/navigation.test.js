import test from 'node:test';
import assert from 'node:assert/strict';

import { navigate } from '../src/router/navigation.js';
import { INFO_LINKS } from '../src/constants/siteLinks.js';

test('1. Router navigation: navigate updates history without throwing', () => {
  let pushStateCalled = false;
  let dispatchedEvent = null;

  globalThis.window = {
    history: {
      pushState: (_state, _title, url) => {
        pushStateCalled = true;
        assert.equal(url, '/analysis/new');
      },
      replaceState: () => {},
    },
    dispatchEvent: (event) => {
      dispatchedEvent = event;
    },
  };

  globalThis.PopStateEvent = class {
    constructor(type) {
      this.type = type;
    }
  };

  navigate('/analysis/new');
  assert.equal(pushStateCalled, true);
  assert.equal(dispatchedEvent?.type, 'popstate');
});

test('2. Site links: Privacy and Terms are active and ready', () => {
  const privacyLink = INFO_LINKS.find((l) => l.id === 'privacy');
  const termsLink = INFO_LINKS.find((l) => l.id === 'terms');
  const contactsLink = INFO_LINKS.find((l) => l.id === 'contacts');

  assert.ok(privacyLink, 'Privacy link must exist in INFO_LINKS');
  assert.equal(privacyLink.href, '/privacy');
  assert.equal(privacyLink.ready, true, 'Privacy link should be marked ready');

  assert.ok(termsLink, 'Terms link must exist in INFO_LINKS');
  assert.equal(termsLink.href, '/terms');
  assert.equal(termsLink.ready, true, 'Terms link should be marked ready');

  assert.ok(contactsLink, 'Contacts link must exist in INFO_LINKS');
  assert.equal(contactsLink.ready, false, 'Contacts link remains in progress');
});
