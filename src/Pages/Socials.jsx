import '../App.css'

function Socials() {
  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ maxWidth: '400px', textAlign: 'center', marginTop: '30px', marginLeft: 'auto', marginRight: 'auto' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '15px' }}>
            <a href="mailto:maxpleaner@gmail.com?subject=Contact from dissonant.info" className="contact-link">Email</a>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <a href="https://linkedin.com/in/maxpleaner" target="_blank" rel="noopener noreferrer" className="contact-link">LinkedIn</a>
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

