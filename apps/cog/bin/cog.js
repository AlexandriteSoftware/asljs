#!/usr/bin/env node

import { main }
  from '../dist/main/main.js';

/* global console, process */

main()
  .catch(
    error => {
      console.error(
        error instanceof Error
          ? error.message
          : String(error));

      process.exitCode = 1;
    });
