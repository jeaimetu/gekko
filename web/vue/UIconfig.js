// This config is used in both the
// frontend as well as the web server.

// see https://github.com/askmike/gekko/blob/stable/docs/installing_gekko_on_a_server.md

const CONFIG = {
  headless: true,
  api: {
    host: 'murmuring-dawn-73902.herokuapp.com',
    port: 443,
    timeout: 120000 // 2 minutes
  },
  ui: {
    ssl: true,
    host: 'murmuring-dawn-73902.herokuapp.com',
    port: 443,
    path: '/'
  },
  adapter: 'mongodb'
}

if(typeof window === 'undefined')
  module.exports = CONFIG;
else
  window.CONFIG = CONFIG;
