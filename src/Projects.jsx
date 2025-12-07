import { useState, useEffect } from 'react'
import { NotionRenderer } from 'react-notion-x'
import { NotionAPI } from 'notion-client'
import './App.css'

const LINKS_PAGE_ID = 'SITES-1b2832ab6c5a8088ab58dde400c65b43'

function Projects() {
  const [pagesData, setPagesData] = useState({})
  const [pageIds, setPageIds] = useState([])
  const [loading, setLoading] = useState(true)

  const notionApi = new NotionAPI()

  useEffect(() => {
    const fetchLinkedPages = async () => {
      try {
        // Fetch parent page
        const parentRecordMap = await notionApi.getPage(LINKS_PAGE_ID)

        // Extract child page IDs from the parent page blocks
        const extractedPageIds = []
        Object.values(parentRecordMap.block || {}).forEach(block => {
          if (block.value?.type === 'child_page') {
            extractedPageIds.push(block.value.id)
          }
        })

        setPageIds(extractedPageIds)
        console.log('Found page IDs:', extractedPageIds)

        // Fetch each linked page
        const pagesDataMap = {}
        for (const pageId of extractedPageIds) {
          try {
            const recordMap = await notionApi.getPage(pageId)
            pagesDataMap[pageId] = recordMap
          } catch (error) {
            console.error(`Error fetching page ${pageId}:`, error)
          }
        }
        setPagesData(pagesDataMap)
      } catch (error) {
        console.error('Error loading linked pages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLinkedPages()
  }, [notionApi])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading projects...</div>
  }

  if (pageIds.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>No projects found</div>
  }

  return (
    <div style={{ width: '100%', padding: '20px' }}>
      {pageIds.map((pageId) => (
        <div key={pageId} style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <NotionRenderer recordMap={pagesData[pageId]} fullPage={false} />
        </div>
      ))}
    </div>
  )
}

export default Projects

