# RQ134 CLI Plugin parameter

The CLI loads the plugins listed with the `--plugin` parameter. The parameter
can be repeated to load several plugins, in the given order.

```pwsh
part check --plugin ./artefacts/plugin.js --plugin asljs-part/plugins/npm
```

The value is a module specifier:

- a path, absolute or starting with `.`, resolved from the working directory;
- a package specifier, resolved from the project root first, then from the
  `asljs-part` package, so the built-in plugins load when `part` is installed
  globally.

See [RQ207 Plugin][RQ207] for what a plugin is and how loading fails.

[RQ207]: <RQ207 Plugin.md>
