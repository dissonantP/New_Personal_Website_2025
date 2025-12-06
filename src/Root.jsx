import { Link } from 'react-router-dom'
import About from './About'
import './App.css'

function Root() {
  return (
    <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingLeft: '15px', paddingRight: '30px' }}>
      <div className="logo-buttons-container">
        <img src="/maxpleaner_logo_split.png" alt="Max Pleaner" className="main-logo" style={{ maxWidth: '400px', width: '100%', height: 'auto' }} />
        <div className="nav-buttons">
          <Link to="/portfolio">
            <img src="/portfolio.png" alt="Portfolio" className="nav-image" style={{ maxWidth: '210px', width: '100%', height: 'auto', borderRadius: '8px' }} />
          </Link>
          <Link to="/music">
            <img src="/music.png" alt="Music" className="nav-image" style={{ maxWidth: '175px', width: '100%', height: 'auto', borderRadius: '8px' }} />
          </Link>
        </div>
      </div>
      <div style={{ maxWidth: '700px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <About />
      </div>
    </div>
  )
}

export default Root


