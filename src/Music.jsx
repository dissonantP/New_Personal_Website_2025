import './App.css'

function Music() {
  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div className="band-boxes-container">
      <div className="band-box">
        <h3>Half Rotten Goddess</h3>
        <p>I play drums in this band.<br />Somewhere between punk, pop, and prog.</p>
        <ul style={{ listStyle: 'none' }}>
          <li><a href="https://halfrottengoddess.bandcamp.com/album/half-rotten-goddess" target="_blank" rel="noopener noreferrer">Bandcamp</a></li>
          <li><a href="https://www.instagram.com/halfrottengoddess/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
        </ul>
        <img src="./hrg.jpeg" alt="Half Rotten Goddess" className="band-img" />
      </div>

      <div className="band-box">
        <h3>War of Knives</h3>
        <p>Also the drummer here.<br />Sludge metal with blast beats.</p>
        <ul style={{ listStyle: 'none' }}>
          <li><a href="https://warofknives.bandcamp.com" target="_blank" rel="noopener noreferrer">Bandcamp</a></li>
          <li><a href="https://weedian420.bandcamp.com/track/war-of-knives-holy-conquest" target="_blank" rel="noopener noreferrer">Track on "California Sludge" comp</a></li>
          <li><a href="https://www.instagram.com/warofknives/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
        </ul>
        <img src="./wok2.png" alt="War of Knives" className="band-img" />
      </div>

      <div className="band-box">
        <h3>Dissonant Protean</h3>
        <p>This is my solo electronic project.<br />Progressive electropunk.</p>
        <ul style={{ listStyle: 'none' }}>
          <li><a href="https://dissonant-protean.bandcamp.com" target="_blank" rel="noopener noreferrer">Bandcamp</a></li>
        </ul>
        <img src="./protean.jpg" alt="Dissonant Protean" className="band-img" />
      </div>
      </div>
    </div>
  )
}

export default Music

