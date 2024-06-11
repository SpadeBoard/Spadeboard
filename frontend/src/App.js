import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './components/login/login';

function App() {
  return (
      <BrowserRouter>
         <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate replace to="/login" />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
