// global window.CONFIG

const config = window.CONFIG.ui;
const endpoint = `${config.host}${process.env.PORT === 80 ? '' : `:${process.env.PORT}`}${config.path}`;

let basePath, restPath, wsPath;

// rest API path
if(config.ssl) {
  basePath = `https://${endpoint}`;
} else {
  basePath = `http://${endpoint}`;
}

restPath = basePath + 'api/';

// ws API path
if(config.ssl) {
  wsPath = `wss://${endpoint}/api`;
} else {
  wsPath = `ws://${endpoint}/api`;
}

export {
  wsPath,
  restPath,
  basePath
};
