const CARD_WIDTH = '300px'
const CARD_HEIGHT = '290px'
const IMAGE_HEIGHT = '200px'
const TITLE_MARGIN_BOTTOM = '12px'
const IMAGE_MARGIN_BOTTOM = '9px'
const BORDER_COLOR = 'rgba(255, 255, 255, 0.2)'
const BORDER_COLOR_IMAGE = 'rgba(255, 255, 255, 0.3)'
const BORDER_WIDTH = '8px'
export const GAP_SPACE = '20px'

export function ProjectCard({ project }) {
  return (
    <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ width: CARD_WIDTH, height: CARD_HEIGHT, display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: '#000', padding: '15px', border: '2px solid rgba(255, 255, 255, 0.5)' }}>
        <h3 style={{ fontSize: '1.0em', marginTop: 0, marginBottom: TITLE_MARGIN_BOTTOM, textAlign: 'center' }}>{project.name}</h3>
        {project.thumbnailType === 'image' && (
          <div style={{ flex: `0 0 ${IMAGE_HEIGHT}`, overflow: 'hidden', marginBottom: IMAGE_MARGIN_BOTTOM, border: `1px solid ${BORDER_COLOR_IMAGE}` }}>
            <img src={project.thumbnail} alt={project.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}
        <p style={{ marginTop: 0, marginBottom: 0, color: 'white', flex: '1 1 auto', overflow: 'hidden' }}>{project.description}</p>
      </div>
    </a>
  )
}
