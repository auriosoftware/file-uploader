import React from 'react';
import style from './app.module.scss';
import {ConnectedHomeComponent} from "./containers/home/home";

const App = () => {
  return (
      <div className={style.App}>
          <ConnectedHomeComponent/>
      </div>
  );
};

export default App;
