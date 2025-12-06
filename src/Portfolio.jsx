import { Link } from 'react-router-dom'
import './App.css'

function Portfolio() {
  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px', paddingTop: '30px', display: 'flex', flexDirection: 'column' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', marginBottom: '40px' }}>← Back</Link>
      <img src="/portfolio.png" alt="Portfolio" className="nav-image" style={{ maxWidth: '200px', width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '30px' }} />
    </div>
  )
}

export default Portfolio

