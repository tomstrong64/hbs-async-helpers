# HBS Async Helpers

Library that adds support for asynchronous function helpers to the handlebars template engine.

## How to install

```shell
npm i hbs-async-helpers
```

## How to import

### CommonJS

```javascript
const Handlebars = require("handlebars");
const asyncHelpers = require("hbs-async-helpers");
```

### ES6

```javascript
import Handlebars from 'handlebars',
import asyncHelpers from 'hbs-async-helpers';
```

## Usage

```javascript
const hb = asyncHelpers(handlebars);

hb.registerHelper(
  "sleep",
  async () =>
    new Promise((resolve) => {
      setTimeout(() => resolve("Done!"), 1000);
    })
);

const template = hb.compile("Mark when is completed: {{#sleep}}{{/sleep}}");
const result = await template();

console.log(result);
// 'Mark when is completed: Done!'
```

# Acknowlegments

This package has been forked from [handlebars-async-helpers](https://github.com/gastonrobledo/handlebars-async-helpers) originally created and maintained by [Gaston Robledo](https://github.com/gastonrobledo).
