import { Link } from 'react-router-dom'
import './App.css'

function StyledList({ children }) {
  return (
    <ul className="styled-list" style={{ paddingLeft: '1.2em', marginLeft: 0, listStylePosition: 'outside' }}>
      {children}
    </ul>
  )
}

function About() {
  return (
    <div style={{ marginTop: '30px', maxWidth: '1000px', width: '100%', paddingLeft: '10px', paddingRight: '10px' }}>
      <p>Hello! I am a person currently living in Oakland, California.</p>
      <p>Professionally, I am a software developer with the following expertise:</p>
      <StyledList>
        <li>Full-stack app development</li>
        <li>Technical art and 3D automation</li>
      </StyledList>
      <p>Beyond that, I have fun with creative technology:</p>
      <StyledList>
        <li>Ableton with ClyphXPro and VCV Rack</li>
        <li>Procedural art and design with Houdini, Touch Designer, Photoshop, P5, Three.js, etc</li>
        <li>Printing stickers, posters, t-shirts, and FDM / Resin models.</li>
      </StyledList>

      <p>I also play in some bands.</p>
      <p style={{ marginTop: '20px' }}>
        <Link to="/contact" className="contact-link">contact</Link>
      </p>
    </div>
  )
}

export default About

 