import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import './types/globals';
import './types/augmentations';
import './lib';

import './style/app.css';

import * as Components from './components';

function renderApp() {
  let app = (
    <Components.DynamicImage />
  );

  if (WEBPACK_DEV_SERVER) {
    return (
      <AppContainer>
        { app }
      </AppContainer>
    );
  }

  return app;
}

const container = document.getElementById('app');

if (container) {
  render(renderApp(), container);
}

if (WEBPACK_DEV_SERVER && module.hot) {
  module.hot.accept(
    [
    ],
    (ids) => {
      render(renderApp(), container);
    },
  );
}

// tslint:disable-next-line no-console
console.debug(`IOTAGram Version ${ VERSION }`);
