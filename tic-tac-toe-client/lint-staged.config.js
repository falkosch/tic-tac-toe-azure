module.exports = {
  '*.{ts,tsx,js,json,md}': filenames =>
    filenames.map(filename => `eslint --format=codeframe --fix "${filename}"`),
  '*.ts{,x}': () => 'tsc --project tsconfig.json --noEmit',
  '*.{scss,css}': filenames => filenames.map(filename => `stylelint --fix "${filename}"`),
};
