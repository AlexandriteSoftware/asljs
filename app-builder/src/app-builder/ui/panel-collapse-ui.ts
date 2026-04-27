import {
  setButtonContent,
} from './control-ui.js';

type ToggleButtonElement =
  HTMLElement
  & {
    text?: string;
    icon?: string;
  };

export type TogglePanelUiOptions =
  { panelElement: HTMLElement;
    toggleButtonElement: ToggleButtonElement;
    panelsElement: HTMLElement;
    collapsedPanelsClass: string;
    expandedText: string;
    collapsedText: string;
    expandedIcon?: string;
    collapsedIcon?: string; };

export function togglePanelUi(
    options: TogglePanelUiOptions
  ): boolean
{
  const collapsed = !options.panelElement.classList.contains('collapsed');

  const nextText =
    collapsed
      ? options.collapsedText
      : options.expandedText;

  setButtonContent(options.toggleButtonElement, {
    text: nextText,
    icon: collapsed
      ? options.collapsedIcon
      : options.expandedIcon,
  });

  options.toggleButtonElement.setAttribute(
    'aria-expanded',
    collapsed
      ? 'false'
      : 'true');

  options.panelElement.classList.toggle('collapsed', collapsed);
  options.panelsElement.classList.toggle(
    options.collapsedPanelsClass,
    collapsed);

  return collapsed;
}
