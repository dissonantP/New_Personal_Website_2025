import { Link } from 'react-router-dom'
import './App.css'

function BandBox({ title, description, links, imageSrc, imageAlt }) {
  return (
    <div className="band-box">
      <h3>{title}</h3>
      <p>{description}</p>
      <ul>
        {links.map((link, index) => (
          <li key={index}>
            <a href={link.url} target="_blank" rel="noopener noreferrer">{link.text}</a>
          </li>
        ))}
      </ul>
      <img className="band-img" src={imageSrc} alt={imageAlt} />
    </div>
  )
}

function Music() {
  return (
    <div style={{ paddingLeft: '30px', paddingRight: '30px', paddingTop: '30px', display: 'flex', flexDirection: 'column' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', marginBottom: '40px' }}>← Back</Link>
      <img src="/music.png" alt="Music" className="nav-image" style={{ maxWidth: '170px', width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '30px' }} />
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <BandBox
          title="Half Rotten Goddess"
          description={<>I play drums in this band.<br />Somewhere between punk, pop, and prog.</>}
          links={[
            { url: 'https://halfrottengoddess.bandcamp.com/album/half-rotten-goddess', text: 'Bandcamp' },
            { url: 'https://www.instagram.com/halfrottengoddess/', text: 'Instagram' }
          ]}
          imageSrc="/hrg.jpeg"
          imageAlt="Half Rotten Goddess"
        />
        
        <BandBox
          title="War of Knives"
          description={<>Also the drummer here.<br />Sludge with blast beats.</>}
          links={[
            { url: 'https://warofknives.bandcamp.com', text: 'Bandcamp' },
            { url: 'https://weedian420.bandcamp.com/track/war-of-knives-holy-conquest', text: "Our entry for Weedian's \"California Sludge\" comp" },
            { url: 'https://www.instagram.com/warofknives/', text: 'Instagram' }
          ]}
          imageSrc="/wok2.png"
          imageAlt="War of Knives"
        />
        
        <BandBox
          title="Protean"
          description={<>My solo electronic project.<br />Progressive electropunk.</>}
          links={[
            { url: 'https://dissonant-protean.bandcamp.com', text: 'Bandcamp' }
          ]}
          imageSrc="/protean.jpg"
          imageAlt="Dissonant Protean"
        />
      </div>
    </div>
  )
}

export default Music

