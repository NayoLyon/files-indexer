import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Store from 'electron-store';
import Root from './components/Root';
import { configureStore, history } from './store/configureStore';
import './app.global.css';
import { selectMaster, selectToScan } from './modules/folders/foldersAction';

const store = configureStore();

// Load application config
const configStore = new Store();
const masterFolder = configStore.get('masterFolder');
const toScanFolder = configStore.get('toScanFolder');
if (masterFolder) {
  store.dispatch(selectMaster(masterFolder));
}
if (toScanFolder) {
  store.dispatch(selectToScan(toScanFolder));
}

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./components/Root', () => {
    const NextRoot = require('./components/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
