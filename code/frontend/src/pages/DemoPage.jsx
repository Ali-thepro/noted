import NoteEditor from '../components/Editor/NoteEditor'
import NotePreview from '../components/Preview/NotePreview'
import { useSelector } from 'react-redux'
import { useState } from 'react'

function DemoPage() {
  const [markdownText, setMarkdownText] = useState('# Hello, world!\n\nSome **bold** text.')
  const viewMode = useSelector(state => state.note.viewMode)


  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex flex-1 overflow-hidden">
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col h-full`}>
            <div className="flex-1 overflow-hidden">
              <NoteEditor content={markdownText} onChange={setMarkdownText} />
            </div>
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full overflow-auto border-l dark:border-gray-700`}>
            <NotePreview content={markdownText} />
          </div>
        )}
      </div>
    </div>
  )
}

export default DemoPage
