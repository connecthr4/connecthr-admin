/** based on doc @ https://nextjs.org/docs/app/api-reference/config/eslint */

const path = require('path');

const buildEslintCommand = (filenames) =>
  `eslint --fix --quiet ${filenames.map((f) => `"${path.relative(process.cwd(), f)}"`).join(' ')}`;

module.exports = {
  '*.{js,jsx,ts,tsx}': ['prettier --write', buildEslintCommand],
};
