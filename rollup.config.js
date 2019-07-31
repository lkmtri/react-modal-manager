module.exports = {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/react-modal-manager.js',
      format: 'cjs',
    },
    {
      file: 'dist/react-modal-manager.esm.js',
      format: 'esm',
    },
  ],
};
