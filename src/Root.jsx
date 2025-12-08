import { useState } from 'react'
import { Link } from 'react-router-dom'
import About from './Pages/About'
import Music from './Pages/Music'
import Projects from './Pages/Projects'
import Socials from './Pages/Socials'
import './App.css'

function Root() {
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('page') || 'about'
  })

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.history.pushState(null, '', `?page=${page}`)
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'about':
        return <About />
      case 'music':
        return <Music />
      case 'projects':
        return <Projects />
      case 'socials':
        return <Socials />
      default:
        return <About />
    }
  }

  return (
    <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingLeft: '15px', paddingRight: '30px', paddingBottom: '100px' }}>
      <img src="./maxpleaner_logo_split.png" alt="Max Pleaner" className="main-logo" style={{ maxWidth: '400px', width: '100%', height: 'auto' }} />
      <div style={{ width: '100%', maxWidth: '900px', marginTop: '20px', marginBottom: '0px', paddingBottom: '40px'}}>
        <div className="nav-button-group">
          <button onClick={() => handlePageChange('about')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <img src="./about.png" alt="About" className={`nav-button-img nav-button-img-about ${currentPage === 'about' ? 'nav-button-img-active' : ''}`} />
          </button>
          <button onClick={() => handlePageChange('projects')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <img src="./projects.png" alt="Projects" className={`nav-button-img ${currentPage === 'projects' ? 'nav-button-img-active' : ''}`} />
          </button>
          <button onClick={() => handlePageChange('music')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <img src="./music.png" alt="Music" className={`nav-button-img nav-button-img-music ${currentPage === 'music' ? 'nav-button-img-active' : ''}`} />
          </button>
          <button onClick={() => handlePageChange('socials')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <img src="./socials.png" alt="Socials" className={`nav-button-img ${currentPage === 'socials' ? 'nav-button-img-active' : ''}`} />
          </button>
          <a href="https://www.youtube.com/@dissonantprotean5495" target="_blank" rel="noopener noreferrer" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-block' }}>
            <img src="./youtube.png" alt="Youtube" className="nav-button-img" />
          </a>
        </div>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {renderContent()}
      </div>
    </div>
  )
}

export default Root


