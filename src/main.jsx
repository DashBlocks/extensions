import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { IntlProvider } from 'react-intl';
import App from './containers/App.jsx';

function clickExtension(Extension) {
  if (Extension == 'playgama') {
    let ExtCode = document.getElementById('playgama')
    ExtCode.innerHTML(`<a src=\"/editor.html?extension=https://github.com/Playgama/bridge-scratch/releases/download/v1.25.0-preview/PlaygamaBridge.js\"><button>Open the extension</button></a>${ExtCode}`)
  }
  if (Extension == 'yagames') {
    let ExtCode = document.getElementById('yagames')
    ExtCode.innerHTML(`<a src=\"/editor.html?extension=https://dashblocks.github.io/extensions/static/extensions/timaaos/YaGames.js/\"><button>Open the extension</button></a>${ExtCode}`)
  }
  if (Extension == 'TelegramBotAPI') {
    let ExtCode = document.getElementById('TelegramBotAPI')
    ExtCode.innerHTML(`<a src=\"/editor.html?extension=https://dashblocks.github.io/extensions/static/extensions/damir2809/TelegramBotAPI.js/\"><button>Open the extension</button></a>${ExtCode}`)
  }
  if (Extension == 'Den4ik12Pathfinding') {
    let ExtCode = document.getElementById('Den4ik12Pathfinding')
    ExtCode.innerHTML(`<a src=\"/editor.html?extension=https://dashblocks.github.io/extensions/static/extensions/Den4ik-12/Pathfinding.js/\"><button>Open the extension</button></a>${ExtCode}`)
  }
  if (Extension == 'Den4ik12WheelScroll') {
    let ExtCode = document.getElementById('Den4ik12WheelScroll')
    ExtCode.innerHTML(`<a src=\"/editor.html?extension=https://dashblocks.github.io/extensions/static/extensions/Den4ik-12/WheelScroll%201.2.js/\"><button>Open the extension</button></a>${ExtCode}`)
  }
  if (Extension == 'htmlalert') {
    let ExtCode = document.getElementById('htmlalert')
    ExtCode.innerHTML(`<a src=\"/editor.html?extension=https://dashblocks.github.io/extensions/static/extensions/scratch_craft_2/Modals.js/\"><button>Open the extension</button></a>${ExtCode}`)
  }
  if (Extension == 'MediaRecord') {
    let ExtCode = document.getElementById('MediaRecord')
    ExtCode.innerHTML(`<a src=\"/editor.html?extension=https://dashblocks.github.io/extensions/static/extensions/scratch_craft_2/MediaRecorder.js/\">Open the extension<button></button></a>${ExtCode}`)
  }
  if (Extension == 'notification') {
    let ExtCode = document.getElementById('notification')
    ExtCode.innerHTML(`<a src=\"/editor.html?extension=https://dashblocks.github.io/extensions/static/extensions/shilenin/Notification.js/\">Open the extension<button></button></a>${ExtCode}`)
  }
  if (Extension == 'ultimateBlockCleaner') {
    let ExtCode = document.getElementById('ultimateBlockCleaner')
    ExtCode.innerHTML(`<a src=\"/editor.html?extension=https://dashblocks.github.io/extensions/static/extensions/shilenin/CodeCleaner.js/\">Open the extension<button></button></a>${ExtCode}`)
  }
}

const initialState = {};
function rootReducer(state = initialState) {
  return state;
}
const store = createStore(rootReducer);

const locale = 'en';
const messages = {};

const rootEl = document.getElementById('root');
const root = createRoot(rootEl);
root.render(
  <Provider store={store}>
    <IntlProvider locale={locale} messages={messages}>
      <App />
    </IntlProvider>
  </Provider>
);
