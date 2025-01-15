import { useEffect, useState } from 'react'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return '' // use external default escaping
  }
})

const NotePreview = ({ content }) => {
  const [html, setHtml] = useState('')

  useEffect(() => {
    const rendered = md.render(content || '')
    setHtml(DOMPurify.sanitize(rendered))
  }, [content])

  return (
    <div 
      className="prose prose-slate dark:prose-invert max-w-none h-full overflow-auto p-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default NotePreview 