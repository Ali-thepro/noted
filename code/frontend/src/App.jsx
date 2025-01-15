import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import ScrollToTop from './components/ScrollToTop'
import NotFound from './pages/NotFound'
import Header from './components/Header'
import About from './pages/About'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import OAuthCallback from './pages/OAuthCallback'
import DemoPage from './pages/DemoPage'


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
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/demo" element={<DemoPage />} />
      </Routes>
    </Router>
  )
}

export default App