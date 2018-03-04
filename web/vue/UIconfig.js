// This config is used in both the
// frontend as well as the web server.

// see https://github.com/askmike/gekko/blob/stable/docs/installing_gekko_on_a_server.md

const CONFIG = {
  headless:true,
  api: {
    host: '0.0.0.0',
    port: 3000,
  },
  ui: {
    ssl: false,
    host: 'murmuring-dawn-73902.herokuapp.com',
    port: process.env.PORT || 3000,
    path: '/'
  },
  adapter: 'sqlite'
}

if(typeof window === 'undefined')
  module.exports = CONFIG;
else
  window.CONFIG = CONFIG;
