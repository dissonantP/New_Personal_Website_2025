import { ProjectCard } from './Projects/ProjectCard'
import '../App.css'

const projects = [
  {
    name: 'Bay Area Shows',
    url: 'https://bayareashows.org',
    thumbnail: './projects/bay-area-shows.png',
    thumbnailType: 'image',
    description: 'I wrote over 40 webscrapers to make this daily concert listing website.',
  },
  {
    name: 'Shader-Web',
    url: 'https://shader-web.dissonant.info/',
    thumbnail: './projects/shader-web.png',
    thumbnailType: 'image',
    description: 'A sandbox for writing camera effects in GLSL',
  },
  {
    name: 'Sticker Layout',
    url: 'https://maxpleaner.com/sticker_layout.html',
    thumbnail: './projects/sticker-layout.png',
    thumbnailType: 'image',
    description: 'A handy utility for laying out images in a printable grid with configurable sizes and margins.',
  },
  {
    name: 'Spotify-Explorer',
    url: 'https://spotify-explorer.dissonant.info/',
    thumbnail: './projects/spotify-explorer.png',
    thumbnailType: 'image',
    description: 'A resource for music nerds; all the obscure genres you could wish for. I scraped Spotify for all the \'Sound of\' playlists and listed them here.',
  },
  {
    name: 'Video Streamer',
    thumbnail: './projects/video-streamer.png',
    thumbnailType: 'image',
    description: 'Custom video streaming application (access by request)',
  },
  {
    name: 'Jellyfin',
    thumbnail: './projects/jellyfin.png',
    thumbnailType: 'image',
    description: 'Enhanced media streaming with improved UI and smart TV support (access by request)',
  },
  {
    name: 'P5 Playground',
    url: 'https://maxpleaner.github.io/p5_playground',
    thumbnail: './projects/p5-playground.png',
    thumbnailType: 'image',
    description: 'Generative art experiments using the p5.js library',
  },
  {
    name: 'ComfyUI Web',
    url: 'https://gen.dissonant.info',
    thumbnail: './projects/comfy-web.png',
    thumbnailType: 'image',
    description: 'Custom web interface for AI image generation via RunPod backend',
  },
  {
    name: 'Pinball',
    url: 'https://maxpleaner.github.io/pinball/',
    thumbnail: './projects/pinball.png',
    thumbnailType: 'image',
    description: 'Browser-based pinball game created in P5.js',
  },
]

function Projects() {
  return (
    <div style={{ width: '100%', marginTop: '30px', paddingLeft: '15px', paddingRight: '15px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', justifyItems: 'center' }}>
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </div>
  )
}

export default Projects
 
 