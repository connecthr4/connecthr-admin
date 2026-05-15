const path = require('path');
const fs = require('fs');

module.exports = function (plop) {
  /**
   * Route Generator
   */
  plop.setGenerator('route', {
    description: 'Generate Next.js app route',

    prompts: [
      {
        type: 'input',
        name: 'routeName',
        message: 'Route name:',

        validate: function (input) {
          if (!input.trim()) {
            return 'Route name is required';
          }

          // kebab-case validation
          if (!/^[a-z0-9-]+$/.test(input)) {
            return 'Route name should contain only lowercase letters, numbers, and "-"';
          }

          const routePath = path.resolve(__dirname, `../src/app/${input}`);

          if (fs.existsSync(routePath)) {
            return `Route '${input}' already exists`;
          }

          return true;
        },
      },

      {
        type: 'input',
        name: 'routeDescription',
        message: 'Route description:',

        validate: function (input) {
          return input.trim() !== '' ? true : 'Description cannot be empty';
        },
      },

      {
        type: 'confirm',
        name: 'hasLayout',
        message: 'Create layout.tsx?',
        default: false,
      },

      {
        type: 'confirm',
        name: 'hasLoading',
        message: 'Create loading.tsx?',
        default: false,
      },

      {
        type: 'confirm',
        name: 'hasError',
        message: 'Create error.tsx?',
        default: false,
      },
    ],

    actions: function (data) {
      const actions = [];

      /**
       * page.tsx (always create)
       */
      actions.push({
        type: 'add',
        path: '../src/app/{{routeName}}/page.tsx',
        templateFile: path.join(__dirname, './page.tsx.hbs'),
      });

      /**
       * layout.tsx
       */
      if (data.hasLayout) {
        actions.push({
          type: 'add',
          path: '../src/app/{{routeName}}/layout.tsx',
          templateFile: path.join(__dirname, './layout.tsx.hbs'),
        });
      }

      /**
       * loading.tsx
       */
      if (data.hasLoading) {
        actions.push({
          type: 'add',
          path: '../src/app/{{routeName}}/loading.tsx',
          templateFile: path.join(__dirname, './loading.tsx.hbs'),
        });
      }

      /**
       * error.tsx
       */
      if (data.hasError) {
        actions.push({
          type: 'add',
          path: '../src/app/{{routeName}}/error.tsx',
          templateFile: path.join(__dirname, './error.tsx.hbs'),
        });
      }

      return actions;
    },
  });
};
