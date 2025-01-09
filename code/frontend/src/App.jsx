import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import ScrollToTop from './components/ScrollToTop'
import NotFound from './pages/NotFound'
import Header from './components/Header'
import About from './pages/About'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'


const App = () => {


  return (
    <Router>
      <ScrollToTop />
      <Header />
      <ToastContainer
        position="top-right"
        className="toast-position"
        pauseOnFocusLoss={false}
        draggable={true}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  )
}

export default App