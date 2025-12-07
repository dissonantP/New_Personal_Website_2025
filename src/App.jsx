import { Routes, Route } from 'react-router-dom'
import Root from './Root'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />} />
    </Routes>
  )
}

export default App
