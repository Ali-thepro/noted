import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ScrollToTop from './components/ScrollToTop'
import NotFound from './pages/NotFound'
import Header from './components/Header'
import About from './pages/About'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
      </Routes>
    </Router>
  )
}

export default App