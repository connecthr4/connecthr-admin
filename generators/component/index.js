const path = require('path');
const fs = require('fs');

module.exports = function (plop) {
  const pascalCase = plop.getHelper('pascalCase');

  plop.setGenerator('component', {
    description: 'Generate a component folder',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name:',
        validate: function (input) {
          const formattedName = pascalCase(input);
          const folderPath = path.resolve(__dirname, '../../src/components', plop.getHelper('pascalCase')(input));

          if (!/^[A-Z][a-zA-Z0-9]*$/.test(formattedName)) {
            return 'Component name must be valid PascalCase (e.g., MyComponent)';
          }

          if (fs.existsSync(folderPath)) {
            return `Component '${formattedName}' already exists at ${folderPath}`;
          }

          return true;
        },
      },
      {
        type: 'input',
        name: 'componentDescription',
        message: 'Please add a description for this component:',
        validate: function (input) {
          return input.trim() !== '' ? true : 'Description cannot be empty';
        },
      },
    ],
    actions: [
      {
        type: 'add',
        path: '../src/components/{{pascalCase name}}/{{pascalCase name}}.tsx',
        templateFile: path.join(__dirname, './component.tsx.hbs'),
      },
      {
        type: 'add',
        path: '../src/components/{{pascalCase name}}/{{pascalCase name}}.module.scss',
        templateFile: path.join(__dirname, './styles.tsx.hbs'),
      },
      {
        type: 'add',
        path: '../src/components/{{pascalCase name}}/index.ts',
        templateFile: path.join(__dirname, './index.ts.hbs'),
      },
      //   {
      //     type: 'add',
      //     path: '../src/components/{{pascalCase name}}/{{pascalCase name}}.test.tsx',
      //     templateFile: path.join(__dirname, './test.tsx.hbs'),
      //   },
      {
        type: 'add',
        path: '../src/components/{{pascalCase name}}/{{pascalCase name}}.stories.tsx',
        templateFile: path.join(__dirname, './stories.tsx.hbs'),
      },
    ],
  });
};
