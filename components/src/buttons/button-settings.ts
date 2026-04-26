import {
    customElement,
  } from 'lit/decorators.js';
import {
    Button,
  } from './button.js';

@customElement('asljs-button-settings')
export class ButtonSettings
  extends Button
{
  constructor() {
    super();
    this.text = 'Settings';
  }

  protected override get defaultIcon(): string {
    return '&#xF3E5;';
  }

  protected override get themeIconKey(): 'settingsIcon' {
    return 'settingsIcon';
  }
}