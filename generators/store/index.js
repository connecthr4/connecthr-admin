const path = require('path');
const fs = require('fs');

module.exports = function (plop) {
  const camelCase = plop.getHelper('camelCase');

  plop.setGenerator('store', {
    description: 'Generate a Zustand store',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Store name (e.g. auth, ui, tours):',
        validate: function (input) {
          const folderName = camelCase(input);
          const folderPath = path.resolve(__dirname, '../../src/store', folderName);

          if (!/^[a-z][a-zA-Z0-9]*$/.test(folderName)) {
            return 'Store folder must be valid camelCase (e.g., auth, tour, ui)';
          }

          if (fs.existsSync(folderPath)) {
            return `Store '${folderName}' already exists at ${folderPath}`;
          }

          return true;
        },
      },
      {
        type: 'input',
        name: 'storeDescription',
        message: 'Please add a description for this store:',
        validate: function (input) {
          return input.trim() !== '' ? true : 'Description cannot be empty';
        },
      },
    ],
    actions: [
      {
        type: 'add',
        path: '../src/store/{{camelCase name}}/types.ts',
        templateFile: path.join(__dirname, './types.ts.hbs'),
      },
      {
        type: 'add',
        path: '../src/store/{{camelCase name}}/use{{pascalCase name}}Store.ts',
        templateFile: path.join(__dirname, './useStore.ts.hbs'),
      },
      {
        type: 'add',
        path: '../src/store/{{camelCase name}}/index.ts',
        templateFile: path.join(__dirname, './index.ts.hbs'),
      },
    ],
  });
};
