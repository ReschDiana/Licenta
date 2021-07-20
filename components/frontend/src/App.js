import React from 'react';
import Harta from './pages/Harta';

function App() {
  return (
    <div className="App">
      <Harta />
    </div>
  );
}

export default App;

/*import React from 'react';
import Harta from './pages/Harta';
import Statistics from './pages/Statistics'


import { BrowserRouter, NavLink, Route, Switch } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div className='rcv-menubar'>
          <NavLink className="rcv-menuitem" activeClassName="rcv-menuitem-active" to="/" exact={true}>Harta</NavLink>
          <div className='rcv-separator'/>
          <NavLink className="rcv-menuitem" activeClassName="rcv-menuitem-active" to="/statistics" exact={true}>Statistici</NavLink>
        </div>
        <Switch>
          <Route path='/' exact={true} component={Harta} />
          <Route path='/statistics' exact={true} component={Statistics} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App*/