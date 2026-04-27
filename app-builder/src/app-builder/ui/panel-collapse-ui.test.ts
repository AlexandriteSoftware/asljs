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
      '<div id="panels"></div><section id="panel"></section><div id="toggle"></div>');

    const document = dom.window.document;
    const panels = document.getElementById('panels') as HTMLElement;
    const panel = document.getElementById('panel') as HTMLElement;
    const button = document.getElementById('toggle') as HTMLElement & {
      text?: string;
      icon?: string;
    };

    const collapsed =
      togglePanelUi({
        panelElement: panel,
        toggleButtonElement: button,
        panelsElement: panels,
        collapsedPanelsClass: 'chat-collapsed',
        expandedText: 'Chat',
        collapsedText: 'Chat',
        expandedIcon: '<i class="bi bi-chevron-down"></i>',
        collapsedIcon: '<i class="bi bi-chevron-right"></i>',
      });

    assert.equal(collapsed, true);
    assert.equal(panel.classList.contains('collapsed'), true);
    assert.equal(panels.classList.contains('chat-collapsed'), true);
    assert.equal(button.getAttribute('aria-expanded'), 'false');
    assert.equal(button.text, 'Chat');
    assert.equal(button.icon, '<i class="bi bi-chevron-right"></i>');
  });
