import './App.css'
import { Link } from 'react-router-dom'

function Socials() {
  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px', paddingTop: '30px', textAlign: 'center' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'inline-block' }}>← Back</Link>
      <div style={{ maxWidth: '400px', textAlign: 'center', marginTop: '20px', marginBottom: '20px', marginLeft: 'auto', marginRight: 'auto' }}>
        <img src="/socials.png" alt="Socials" className="page-header-img" />
      </div>
      <div style={{ maxWidth: '400px', textAlign: 'center', marginTop: '30px', marginLeft: 'auto', marginRight: 'auto' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '15px' }}>
            <a href="mailto:maxpleaner@gmail.com?subject=Contact from dissonant.info" className="contact-link">Email</a>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <a href="https://linkedin.in/maxpleaner" target="_blank" rel="noopener noreferrer" className="contact-link">LinkedIn</a>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <a href="https://www.instagram.com/macskamz/" target="_blank" rel="noopener noreferrer" className="contact-link">Instagram</a>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <a href="https://discordapp.com/users/642836614963396608" target="_blank" rel="noopener noreferrer" className="contact-link">Discord</a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Socials

