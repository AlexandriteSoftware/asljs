import { html as selectTemplate }
  from './bootstrap-select.tpl.js';
import { html as textInputTemplate }
  from './bootstrap-text-input.tpl.js';
import { ComponentsTheme }
  from './theme.js';

export function createBootstrapTheme(
  ): ComponentsTheme
{
  return { button:
             { className: 'btn btn-primary',
               variants:
                 { add:
                     { icon:
                         '<i class="bi bi-plus"></i>',
                       text: 'Add' },
                   delete:
                     { icon:
                         '<i class="bi bi-trash"></i>',
                       text: 'Delete' },
                   settings:
                     { icon:
                         '<i class="bi bi-gear"></i>',
                       text: 'Settings' } } },
           list:
             { container:
                 '<div class="list-group" data-role="items"></div>' },
           textInput:
             { template: textInputTemplate,
               input:
                 `
            <input type="text"
                   class="form-control"
                   data-control-invalid-class="is-invalid">
          `,
               textarea:
                 `
            <textarea class="form-control"
                      data-control-invalid-class="is-invalid"></textarea>
          ` },
           select:
             { template: selectTemplate,
               select:
                 `
            <select class="form-select"
                    data-control-invalid-class="is-invalid"></select>
          ` } };
}
