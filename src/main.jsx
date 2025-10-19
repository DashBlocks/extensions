import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { IntlProvider } from 'react-intl';
import App from './containers/App.jsx';

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
