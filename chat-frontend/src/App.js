import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Chat from './components/Chat/Chat';
import SignUp from './components/SignUp/SignUp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<SignUp />}></Route>
        <Route path='/chat' element={<Chat />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
