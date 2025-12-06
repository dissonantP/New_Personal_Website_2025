import { Routes, Route } from 'react-router-dom'
import Root from './Root'
import Portfolio from './Portfolio'
import Music from './Music'
import Contact from './Contact'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/music" element={<Music />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  )
}

export default App
