import { ComponentsTheme }
  from './theme.js';

export function createBootstrapTheme(): ComponentsTheme
{
  return {
    button: {
      className: 'btn btn-primary',
      variants: {
        add: { icon: '<i class="bi bi-plus"></i>', text: 'Add' },
        delete: { icon: '<i class="bi bi-trash"></i>', text: 'Delete' },
        settings: { icon: '<i class="bi bi-gear"></i>', text: 'Settings' }
      }
    },
    list: { container: '<div class="list-group" data-role="items"></div>' },
    textInput: {
      template: `
            <div class="mb-3"
                 data-bind-class-asljs-text-input-empty="isEmpty"
                 data-bind-class-asljs-text-input-invalid="hasError">
              <label class="form-label"
                     data-bind-text="label"
                     data-bind-prop-hidden="hideLabel"
                     data-bind-prop-for="inputId"></label>
              <div data-role="control-host"></div>
              <div class="invalid-feedback"
                   data-bind-text="errorMessage"
                   data-bind-prop-hidden="hideError"
                   data-bind-prop-id="errorId"></div>
              <div class="form-text"
                   data-bind-text="description"
                   data-bind-prop-hidden="hideDescription"
                   data-bind-prop-id="descriptionId"></div>
            </div>
          `,
      input: `
            <input type="text"
                   class="form-control"
                   data-control-invalid-class="is-invalid">
          `,
      textarea: `
            <textarea class="form-control"
                      data-control-invalid-class="is-invalid"></textarea>
          `
    },
    select: {
      template: `
            <div class="mb-3"
                 data-bind-class-asljs-select-empty="isEmpty"
                 data-bind-class-asljs-select-invalid="hasError">
              <label class="form-label"
                     data-bind-text="label"
                     data-bind-prop-hidden="hideLabel"
                     data-bind-prop-for="inputId"></label>
              <div data-role="control-host"></div>
              <div class="invalid-feedback"
                   data-bind-text="errorMessage"
                   data-bind-prop-hidden="hideError"
                   data-bind-prop-id="errorId"></div>
              <div class="form-text"
                   data-bind-text="description"
                   data-bind-prop-hidden="hideDescription"
                   data-bind-prop-id="descriptionId"></div>
            </div>
          `,
      select: `
            <select class="form-select"
                    data-control-invalid-class="is-invalid"></select>
          `
    }
  };
}
