import '../App.css'

function StyledList({ children }) {
  return (
    <ul className="styled-list" style={{ paddingLeft: '1.2em', marginLeft: 0, listStylePosition: 'outside' }}>
      {children}
    </ul>
  )
}

function About() {
  return (
    <div style={{ marginTop: '30px', width: '100%', paddingLeft: '0px', paddingRight: '10px', textAlign: 'center' }}>
      <p>Hello! I am a person currently living in Oakland, California.</p>
      <p>Professionally, I am a software developer with the following expertise:</p>
      <div style={{ display: 'inline-block', textAlign: 'left' }}>
        <StyledList>
          <li>Full-stack app development</li>
          <li>Technical art and 3D automation</li>
        </StyledList>
      </div>
      <p>Beyond that, I have fun with creative technology:</p>
      <div style={{ display: 'inline-block', textAlign: 'left' }}>
        <StyledList>
          <li>Ableton with ClyphXPro and VCV Rack</li>
          <li>Procedural art and design with Houdini, Touch Designer, Photoshop, P5, Three.js, etc</li>
          <li>Printing stickers, posters, t-shirts, and FDM / Resin models.</li>
        </StyledList>
      </div>

      <p>I also play in some bands.</p>
    </div>
  )
}

export default About

 