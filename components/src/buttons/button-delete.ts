import {
    customElement,
  } from 'lit/decorators.js';
import {
    Button,
  } from './button.js';

@customElement('asljs-button-delete')
export class ButtonDelete
  extends Button
{
  constructor() {
    super();
    this.text = 'Delete';
  }

  protected override get defaultIcon(): string {
    return '&#xF5DE;';
  }

  protected override get themeIconKey(): 'deleteIcon' {
    return 'deleteIcon';
  }
}