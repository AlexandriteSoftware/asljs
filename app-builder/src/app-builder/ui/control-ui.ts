import { SelectItem }
  from 'asljs-components';

export type AppBuilderButtonElement =
  & HTMLElement
  & {
    text: string;
    icon: string;
    disabled: boolean;
    buttonClassName: string;
    type: 'button' | 'submit' | 'reset';
  };

export type AppBuilderTextInputElement =
  & HTMLElement
  & {
    value: string | null;
    placeholder: string | null;
    inputType: string;
    controlClassName: string;
    disabled: boolean;
  };

export type AppBuilderSelectElement =
  & HTMLElement
  & {
    value: string | null;
    items: SelectItem[];
    placeholder: string | null;
    controlClassName: string;
    disabled: boolean;
  };

export function mustElement<T extends HTMLElement>(id: string): T
{
  const element =
    document.getElementById(id);

  if (element === null) {
    throw new Error(`Missing element #${id}`);
  }

  return element as T;
}

export function configureButton(
  element: AppBuilderButtonElement,
  options: {
    text?: string;
    icon?: string;
    className: string;
  }
): void
{
  element.type = 'button';
  element.buttonClassName = options.className;

  setButtonContent(
    element,
    {
      text: options.text ?? '',
      icon: options.icon ?? ''
    }
  );
}

export function setButtonContent(
  element: HTMLElement & { text?: string; icon?: string; },
  options: {
    text: string;
    icon?: string;
  }
): void
{
  element.text = options.text;
  element.icon = options.icon ?? '';

  if (element.localName === 'button') {
    element.textContent = options.text;
  }
}

export function configureTextInput(
  element: AppBuilderTextInputElement,
  options: {
    placeholder?: string;
    inputType?: string;
    className?: string;
  }
): void
{
  element.placeholder = options.placeholder ?? null;
  element.inputType = options.inputType ?? 'text';

  element.controlClassName = options.className
    ?? 'form-control bootstrap-input';
}

export function configureSelect(
  element: AppBuilderSelectElement,
  options: {
    className: string;
    items?: SelectItem[];
    placeholder?: string | null;
  }
): void
{
  element.controlClassName = options.className;
  element.items = options.items ?? [];
  element.placeholder = options.placeholder ?? null;
}

export function readControlValue(
  element: { value: string | null; }
): string
{
  return element.value ?? '';
}

export function writeControlValue(
  element: { value: string | null; },
  value: string
): void
{
  element.value = value;
}

export function focusInnerControl(
  element: HTMLElement
): void
{
  const control =
    element.querySelector(
      'input, textarea, select, button') as
    | HTMLElement
    | null;

  if (control !== null) {
    control.focus();
    return;
  }

  element.focus();
}

export function selectInnerTextControl(
  element: HTMLElement
): void
{
  const control =
    element.querySelector(
      'input, textarea') as
    | HTMLInputElement
    | HTMLTextAreaElement
    | null;

  control?.focus();
  control?.select();
}
