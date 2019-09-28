import React, {createRef} from 'react';
import './App.css';
import Game from './Sketch/game'
import ThreeWrapper from './ThreeWrapper';
function App() {
  let topref = createRef<HTMLDivElement>();
  let val = 3;
  let game = new Game(val, window.innerWidth);
  let update = () => {
    game.reset(val);
  };
  let componentWillUnmount = ()=>{
    game.stop();
  }
  return (
    <div className="App">
        <ThreeWrapper game={game}/>
    </div>
  );
}

export default App;
