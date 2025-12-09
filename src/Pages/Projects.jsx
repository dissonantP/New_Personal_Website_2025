import { ProjectCard, GAP_SPACE } from './Projects/ProjectCard'
import '../App.css'

const projects = [
  {
    name: 'bayareashows.org',
    url: 'https://bayareashows.org',
    thumbnail: './projects/bay-area-shows.png',
    thumbnailType: 'image',
    description: 'Over 40 web scrapers running daily to fetch local concert listings.',
  },
  {
    name: 'Shader-Web',
    url: 'https://maxpleaner.github.io/ShaderWeb/',
    thumbnail: './projects/shader-web.png',
    thumbnailType: 'image',
    description: 'A web sandbox for writing camera effects in GLSL. The associated mobile app is WIP.',
  },
  {
    name: 'Sticker Layout',
    url: 'https://maxpleaner.github.io/StickerLayout',
    thumbnail: './projects/sticker-layout.png',
    thumbnailType: 'image',
    description: 'A utility for laying out images in a grid (useful for printing stickers).',
  },
  // {
  //   name: 'Spotify-Explorer',
  //   url: 'https://spotify-explorer.dissonant.info/',
  //   thumbnail: './projects/spotify-explorer.png',
  //   thumbnailType: 'image',
  //   description: 'A resource for music nerds; all the obscure genres you could wish for. I scraped Spotify for all the \'Sound of\' playlists and listed them here.',
  // },
  {
    name: 'Video Streamer',
    thumbnail: './projects/video-streamer.png',
    url: 'https://github.com/maxpleaner/VideoStreamer',
    thumbnailType: 'image',
    description: 'A video streaming app similar to Jellyfin or Plex',
  },
  // {
  //   name: 'Jellyfin',
  //   thumbnail: './projects/jellyfin.png',
  //   thumbnailType: 'image',
  //   description: 'Enhanced media streaming with improved UI and smart TV support (access by request)',
  // },
  {
    name: 'P5 Playground',
    url: 'https://maxpleaner.github.io/p5_playground',
    thumbnail: './projects/p5-playground.png',
    thumbnailType: 'image',
    description: 'Generative art experiments using the p5.js library',
  },
  // {
  //   name: 'ComfyUI Web',
  //   url: 'https://gen.dissonant.info',
  //   thumbnail: './projects/comfy-web.png',
  //   thumbnailType: 'image',
  //   description: 'A streamlined AI image generation interface (WIP)',
  // },
  {
    name: 'Pinball',
    url: 'https://maxpleaner.github.io/pinball/',
    thumbnail: './projects/pinball.png',
    thumbnailType: 'image',
    description: 'Browser-based pinball game created in P5.js',
  },
  {
    name: 'Font Browser (Houdini)',
    url: 'https://loving-snowstorm-ec0.notion.site/houdini-tools?v=1b7832ab6c5a80ae8702000c474aabb1',
    thumbnail: './projects/houdini-font-browser.webp',
    thumbnailType: 'image',
    description: 'A better font picker for Houdini',
  },
  {
    name: 'Model Importer (Houdini)',
    url: 'https://loving-snowstorm-ec0.notion.site/houdini-tools?v=1b7832ab6c5a80ae8702000c474aabb1',
    thumbnail: './projects/houdini-models-resource-downloader.webp',
    thumbnailType: 'image',
    description: 'A Houdini integration for models.spriters-resource.com. Import retro game models.',
  },
  {
    name: 'SDF Growth (Houdini)',
    url: 'https://loving-snowstorm-ec0.notion.site/houdini-tools?v=1b7832ab6c5a80ae8702000c474aabb1',
    thumbnail: './projects/houdini-concentric-growth.webp',
    thumbnailType: 'image',
    description: 'A versatile 2D growth effect.',
  },
  {
    name: "Asset Picker (Houdini)",
    url: 'https://loving-snowstorm-ec0.notion.site/houdini-tools?v=1b7832ab6c5a80ae8702000c474aabb1',
    thumbnail: './projects/houdini-asset-library.webp',
    thumbnailType: 'image',
    description: 'An easy way to pick & choose things from asset packs.',
  },
  {
    name: "Macro Controller Tutorial",
    url: "https://www.youtube.com/watch?v=DURUt0cEEYQ",
    thumbnail: './projects/macro-controllers.png',
    thumbnailType: 'image',
    description: 'A tutorial on how to use a generic numpad as a scriptable Ableton macro controller.',
  },
  {
    name: "Copernicus Scripting Tutorial",
    url: "https://www.youtube.com/watch?v=M3KA7Gul9LU",
    thumbnail: './projects/houdini-cops-scripting.png',
    thumbnailType: 'image',
    description: "An in-depth guide to scripting in Houdini's new compositing system.",
  },

  // TODOS
  // - Spotify Interface
  // - Image Manipulator Mcp
  // - Headless Houdini Generator
  // - Touch Designer Projects
  // - Houdini Projects
  // - Blog Posts
]

function Projects() {
  return (
    <div style={{ width: '100%', marginTop: '15px', paddingLeft: '15px', paddingRight: '15px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: GAP_SPACE, justifyContent: 'center', maxWidth: '1400px' }}>
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </div>
  )
}

export default Projects
 
 