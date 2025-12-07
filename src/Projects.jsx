import { Link } from 'react-router-dom'

function Projects() {
  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px', paddingTop: '30px', textAlign: 'center' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'inline-block' }}>← Back</Link>
      <div style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'center' }}>
        <img src="/projects.png" alt="Projects" className="page-header-img" />
      </div>
    </div>
  )
}

export default Projects

