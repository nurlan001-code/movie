import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home/home';
import Header from './components/Header/Header';
import MovieRecommender from './pages/MovieRecommender/MovieRecommender';
import Register from './pages/Register/Register';
import LoginPage from './pages/login/login';
import MovieDetail from './components/ui/MovieDetail';
import { AuthProvider } from './context/AuthContext';


function App() {
  return(
  <AuthProvider>
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Movies" element={<MovieRecommender />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
