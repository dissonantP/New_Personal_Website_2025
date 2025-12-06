import { Link } from 'react-router-dom'
import './App.css'

function Contact() {
  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px', paddingTop: '30px', display: 'flex', flexDirection: 'column' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', marginBottom: '40px' }}>← Back</Link>
      <img src="/contact.png" alt="Contact" className="nav-image" style={{ maxWidth: '200px', width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '30px' }} />
      <ul className="styled-list contact-page" style={{ paddingLeft: '1.2em', marginLeft: 0, listStylePosition: 'outside' }}>
        <li>
          <a href="mailto:maxpleaner@gmail.com?subject=Contact from dissonant.info">Email</a>
        </li>
        <li>
          <a href="https://linkedin.in/maxpleaner" target="_blank" rel="noopener noreferrer">Linkedin</a>
        </li>
        <li>
          <a href="https://www.instagram.com/macskamz/" target="_blank" rel="noopener noreferrer">Instagram</a>
        </li>
        <li>
          <a href="https://discordapp.com/users/642836614963396608" target="_blank" rel="noopener noreferrer">Discord</a>
        </li>
        <li>
          <a href="https://www.youtube.com/channel/UCavlhcY0RxmNLN4MYDYML2g" target="_blank" rel="noopener noreferrer">Youtube Channel</a>
        </li>
        <li>
          <a href="https://www.etsy.com/shop/recursiveself" target="_blank" rel="noopener noreferrer">Etsy Store</a>
        </li>
      </ul>
    </div>
  )
}

export default Contact

