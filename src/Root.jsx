import { Link } from 'react-router-dom'
import About from './About'
import './App.css'

function Root() {
  return (
    <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingLeft: '15px', paddingRight: '30px' }}>
      <img src="/maxpleaner_logo_split.png" alt="Max Pleaner" className="main-logo" style={{ maxWidth: '400px', width: '100%', height: 'auto' }} />
      <div style={{ width: '100%', maxWidth: '900px', marginTop: '20px', marginBottom: '0px', paddingBottom: '40px', borderBottom: '1px solid rgba(255, 255, 255, 0.3)' }}>
        <div className="nav-button-group">
          <Link to="/projects" className="square-nav-button">Projects</Link>
          <Link to="/music" className="square-nav-button">Music</Link>
          <Link to="/socials" className="square-nav-button">Socials</Link>
          <Link to="https://www.youtube.com/@dissonantprotean5495" className="square-nav-button">Youtube</Link>
        </div>
      </div>
      <div style={{ maxWidth: '900px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <About />
      </div>
    </div>
  )
}

export default Root


