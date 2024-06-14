import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './pages/login/login';
import GameRoom from './pages/game-room/game-room';

import PrivateRoutes from './utils/private-routes';

function App() {
  return (
      <BrowserRouter>
         <Routes>
              <Route element={<PrivateRoutes/>}>
                <Route path="/" element={<Navigate replace to="/game-room" />} />
                <Route path='/game-room' element={<GameRoom/>} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate replace to="/login" />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
