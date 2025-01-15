import { useEffect, useState } from 'react'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import DOMPurify from 'dompurify'
import PropTypes from 'prop-types'
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) { } // eslint-disable-line no-unused-vars, no-empty
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

NotePreview.propTypes = {
  content: PropTypes.string.isRequired
}

export default NotePreview
