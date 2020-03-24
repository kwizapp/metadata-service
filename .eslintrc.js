module.exports = {
  extends: ['@kwizapp/eslint-config-js'],
  // define parser options to make features such as async/wait work
  parserOptions: {
    ecmaVersion: 2017,
  },
  // define the environment
  env: {
    node: true,
    jest: true,
  },
}
