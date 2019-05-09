import React from 'react';
import style from './App.module.scss';
import Home from "./containers/home/Home";

const App: React.FC = () => {
  return (
    <div className={style.App}>
      <Home/>
    </div>
  );
};

export default App;
