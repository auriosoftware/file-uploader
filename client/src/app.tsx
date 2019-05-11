import React from 'react';
import style from './app.module.scss';
import Home from "./containers/home/home";

const App = () => {
  return (
    <div className={style.App}>
      <Home/>
    </div>
  );
};

export default App;
