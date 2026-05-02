export type ComponentModelPropertyType =
  'array'
  | 'boolean'
  | 'function'
  | 'number'
  | 'object'
  | 'string';

export interface ComponentModelPropertyDefinition {
  name: string;
  type: ComponentModelPropertyType;
  title?: string;
  description?: string;
  editable?: boolean;
}

export interface ComponentModelDefinition {
  name: string;
  title?: string;
  properties: readonly ComponentModelPropertyDefinition[];
}

function createComponentModelDefinition(
    name: string,
    properties: readonly ComponentModelPropertyDefinition[]
  ): ComponentModelDefinition
{
  return {
    name,
    title: humanizeModelName(name),
    properties: properties.map(
      property => ({
        ...property,
        title: property.title ?? humanizePropertyName(property.name),
      })),
  };
}

function humanizeModelName(
    name: string
  ): string
{
  return name
    .replace(/ModelDefinition$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

function humanizePropertyName(
    name: string
  ): string
{
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, character => character.toUpperCase());
}

const assistedInputProperties =
  [ { name: 'characters',
      type: 'string',
      description: 'Allowed single-character keys. Empty means no filter.' },
  ] as const satisfies readonly ComponentModelPropertyDefinition[];

export const AssistedInputModelDefinition =
  createComponentModelDefinition(
    'AssistedInputModelDefinition',
    assistedInputProperties);

export const AiChatModelDefinition =
  createComponentModelDefinition(
    'AiChatModelDefinition',
    [ { name: 'model',
        type: 'object',
        description: 'Chat runtime state model.', },
      { name: 'options',
        type: 'object',
        description: 'Provider, request, and persistence callbacks.', },
    ]);

export const ButtonModelDefinition =
  createComponentModelDefinition(
    'ButtonModelDefinition',
    [ { name: 'variant',
        type: 'string',
        description: 'Variant key used to resolve theme defaults such as add or delete.' },
      { name: 'icon',
        type: 'string',
        description: 'HTML markup string for the icon.' },
      { name: 'buttonClassName',
        type: 'string',
        title: 'Button class name',
        description: 'Class name applied to the native button.' },
      { name: 'theme',
        type: 'object',
        description: 'Per-instance components theme override.' },
      { name: 'text',
        type: 'string',
        description: 'Visible button label.' },
      { name: 'disabled',
        type: 'boolean',
        description: 'Native disabled state.' },
      { name: 'type',
        type: 'string',
        description: 'Native button type such as button, submit, or reset.' },
    ]);

export const FileViewModelDefinition =
  createComponentModelDefinition(
    'FileViewModelDefinition',
    [ { name: 'provider',
        type: 'object',
        description: 'File provider used to load and optionally save files.' },
      { name: 'handlers',
        type: 'array',
        description: 'Ordered file handlers from most specific to most general.' },
      { name: 'fileName',
        type: 'string',
        title: 'File name',
        description: 'Selected file name to preview.' },
    ]);

export const KeyboardModelDefinition =
  createComponentModelDefinition(
    'KeyboardModelDefinition',
    assistedInputProperties);

export const LetterpadModelDefinition =
  createComponentModelDefinition(
    'LetterpadModelDefinition',
    [ ...assistedInputProperties,
      { name: 'collapsed',
        type: 'boolean',
        description: 'Whether the letterpad is collapsed.' },
    ]);

export const ListModelDefinition =
  createComponentModelDefinition(
    'ListModelDefinition',
    [ { name: 'items',
        type: 'array',
        description: 'Rows rendered by the list.' },
      { name: 'context',
        type: 'object',
        description: 'Shared row binding context.' },
      { name: 'theme',
        type: 'object',
        description: 'Per-instance components theme override.' },
    ]);

export const NumpadModelDefinition =
  createComponentModelDefinition(
    'NumpadModelDefinition',
    assistedInputProperties);

export const PropertiesModelDefinition =
  createComponentModelDefinition(
    'PropertiesModelDefinition',
    [ { name: 'definition',
        type: 'object',
        description: 'Component model definition that drives the generated form.' },
      { name: 'target',
        type: 'object',
        description: 'Target object updated by the generated controls.' },
      { name: 'theme',
        type: 'object',
        description: 'Theme forwarded to nested controls.' },
    ]);

export const SelectModelDefinition =
  createComponentModelDefinition(
    'SelectModelDefinition',
    [ { name: 'label',
        type: 'string' },
      { name: 'description',
        type: 'string' },
      { name: 'validator',
        type: 'function',
        description: 'Validation function that returns an error message or null.' },
      { name: 'theme',
        type: 'object',
        description: 'Per-instance components theme override.' },
      { name: 'value',
        type: 'string' },
      { name: 'placeholder',
        type: 'string' },
      { name: 'items',
        type: 'array' },
      { name: 'disabled',
        type: 'boolean' },
      { name: 'controlClassName',
        type: 'string',
        title: 'Control class name' },
      { name: 'status',
        type: 'object',
        description: 'Observable draft status object.',
        editable: false },
      { name: 'draftValue',
        type: 'string',
        title: 'Draft value',
        description: 'Current in-progress selection.',
        editable: false },
      { name: 'isEmpty',
        type: 'boolean',
        title: 'Is empty',
        editable: false },
      { name: 'isValid',
        type: 'boolean',
        title: 'Is valid',
        editable: false },
      { name: 'errorMessage',
        type: 'string',
        title: 'Error message',
        description: 'Current validation message or null.',
        editable: false },
    ]);

export const TextInputModelDefinition =
  createComponentModelDefinition(
    'TextInputModelDefinition',
    [ { name: 'label',
        type: 'string' },
      { name: 'description',
        type: 'string' },
      { name: 'validator',
        type: 'function',
        description: 'Validation function that returns an error message or null.' },
      { name: 'theme',
        type: 'object',
        description: 'Per-instance components theme override.' },
      { name: 'value',
        type: 'string' },
      { name: 'placeholder',
        type: 'string' },
      { name: 'inputType',
        type: 'string',
        title: 'Input type' },
      { name: 'controlClassName',
        type: 'string',
        title: 'Control class name' },
      { name: 'multiline',
        type: 'boolean' },
      { name: 'autoExtend',
        type: 'boolean',
        title: 'Auto extend' },
      { name: 'autoExtendMaxRows',
        type: 'number',
        title: 'Auto extend max rows',
        description: 'Maximum rows when auto extend is enabled.' },
      { name: 'enterKeyBehavior',
        type: 'string',
        title: 'Enter key behavior' },
      { name: 'disabled',
        type: 'boolean' },
      { name: 'rows',
        type: 'number' },
      { name: 'status',
        type: 'object',
        description: 'Observable draft status object.',
        editable: false },
      { name: 'draftValue',
        type: 'string',
        title: 'Draft value',
        description: 'Current in-progress text.',
        editable: false },
      { name: 'isEmpty',
        type: 'boolean',
        title: 'Is empty',
        editable: false },
      { name: 'isValid',
        type: 'boolean',
        title: 'Is valid',
        editable: false },
      { name: 'errorMessage',
        type: 'string',
        title: 'Error message',
        description: 'Current validation message or null.',
        editable: false },
    ]);

export const ThemeProviderModelDefinition =
  createComponentModelDefinition(
    'ThemeProviderModelDefinition',
    [ { name: 'theme',
        type: 'object',
        description: 'Active components theme.' },
    ]);

export const AllComponentModelDefinitions =
  [ AiChatModelDefinition,
    AssistedInputModelDefinition,
    ButtonModelDefinition,
    FileViewModelDefinition,
    KeyboardModelDefinition,
    LetterpadModelDefinition,
    ListModelDefinition,
    NumpadModelDefinition,
    PropertiesModelDefinition,
    SelectModelDefinition,
    TextInputModelDefinition,
    ThemeProviderModelDefinition,
  ] as const satisfies readonly ComponentModelDefinition[];