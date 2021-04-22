import React from 'react';
import './App.css';
import Game from './lib/game'
import ThreeWrapper from './components/ThreeWrapper';

function App() {
  let game = new Game(4, window.innerWidth);
  return (
    <div className="App" >
      <h1 className="App-header">Rubik's Cube Demo</h1>
      <div className="link-panel">
        <a className="link" href="https://shuby-mao.web.app/">Home</a>
        <a className="link" href="https://shuby-mao.web.app/">Project Page</a>
        <a className="link" href="https://github.com/shubymao/rubiks-cube-web">Github Repo</a>
      </div>
      <ThreeWrapper game={game}/>
      <div className="panel">
        <button onClick={()=>game.reset(1)}>1x1</button>
        <button onClick={()=>game.reset(2)}>2x2</button>
        <button onClick={()=>game.reset(3)}>3x3</button>
        <button onClick={()=>game.reset(4)}>4x4</button>
        <button onClick={()=>game.reset(5)}>5x5</button>
        <button onClick={()=>game.shuffle()}>Shuffle</button>
      </div>
    </div>
  );
}

export default App;
