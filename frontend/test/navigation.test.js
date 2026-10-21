import test from 'node:test';
import assert from 'node:assert/strict';

import { navigate } from '../src/router/navigation.js';

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

