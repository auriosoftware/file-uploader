import React from 'react';
import style from './app.module.scss';
import { ConnectedHomeComponent } from './containers/home/home';

export const App = () => {
  return (
      <div className={style.App}>
          <ConnectedHomeComponent/>
      </div>
  );
};
