import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import { JSDOM }
  from 'jsdom';
import {
  togglePanelUi,
} from './panel-collapse-ui.js';

test(
  'togglePanelUi collapses panel and updates button state',
  () => {
    const dom = new JSDOM(
      '<div id="panels"></div><section id="panel"></section><button id="toggle"></button>');

    const document = dom.window.document;
    const panels = document.getElementById('panels') as HTMLElement;
    const panel = document.getElementById('panel') as HTMLElement;
    const button = document.getElementById('toggle') as HTMLButtonElement;

    const collapsed =
      togglePanelUi({
        panelElement: panel,
        toggleButtonElement: button,
        panelsElement: panels,
        collapsedPanelsClass: 'chat-collapsed',
        expandedLabel: 'Chat ▾',
        collapsedLabel: 'Chat ▸',
      });

    assert.equal(collapsed, true);
    assert.equal(panel.classList.contains('collapsed'), true);
    assert.equal(panels.classList.contains('chat-collapsed'), true);
    assert.equal(button.getAttribute('aria-expanded'), 'false');
    assert.equal(button.textContent, 'Chat ▸');
  });
