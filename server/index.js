require('babel-core/register')({
  'presets': [
    'stage-3',
    ["latest-node", { "target": "current" }]
  ],
  'plugins': ['dynamic-import-node']
})

require('babel-polyfill')
const app = require('./app/index');