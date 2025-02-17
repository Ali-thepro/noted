import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import ScrollToTop from './components/ScrollToTop'
import NotFound from './pages/NotFound'
import Header from './components/Header'
import About from './pages/About'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import OAuthCallback from './pages/OAuthCallback'
import DemoPage from './pages/DemoPage'
import NotePage from './pages/NotePage'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'


const App = () => {
  const theme = useSelector(state => state.theme)
  const darkModeToastStyle = {
    backgroundColor: '#2d3748',
    color: '#a0aec0',
  }

  return (
    <Router>
      <ScrollToTop />
      <Header />
      <ToastContainer
        position="top-right"
        className="toast-position"
        pauseOnFocusLoss={false}
        toastStyle={theme === 'dark' ? darkModeToastStyle : {}}
        draggable={true}
      />
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/notes/:id" element={<NotePage />} />
        </Route>
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
