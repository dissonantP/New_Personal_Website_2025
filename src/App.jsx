import { Routes, Route } from 'react-router-dom'
import Root from './Root'
import Projects from './Projects'
import Music from './Music'
import Socials from './Socials'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/music" element={<Music />} />
      <Route path="/socials" element={<Socials />} />
    </Routes>
  )
}

export default App
