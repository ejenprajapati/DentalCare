
import { Routes, Route, Navigate} from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ServicesPage from './pages/ServicesPage';
import BlogsPage from './pages/BlogsPage';
import AppointmentPage from './pages/AppointmentPage';
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
// import AboutPage from './pages/AboutPage';
// import ContactPage from './pages/ContactPage';
import './App.css';
function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return<SignupPage />;;
}

function App() {
  return (
    
      <div className="app">
        <Header />
        <main className="main-content">
         
            <Routes>
              <Route path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              {/* <Route path="/home" element={<HomePage />} /> */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/signup" element={<RegisterAndLogout />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/blogs" element={<BlogsPage />} />
              <Route path="/appointment" element={
                  <ProtectedRoute>
                    <AppointmentPage />
                  </ProtectedRoute>
                }/>

              <Route path="*" element={<NotFound />}></Route>
            </Routes>
          
        </main>
        <Footer />
      </div>

  );
}

export default App;
