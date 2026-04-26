import {
    customElement,
  } from 'lit/decorators.js';
import {
    Button,
  } from './button.js';

@customElement('asljs-button-add')
export class ButtonAdd
  extends Button
{
  constructor() {
    super();
    this.text = 'Add';
  }

  protected override get defaultIcon(): string {
    return '&#xF26E;';
  }

  protected override get themeIconKey(): 'addIcon' {
    return 'addIcon';
  }
}