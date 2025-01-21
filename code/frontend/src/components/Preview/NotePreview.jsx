import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import DOMPurify from 'dompurify'
import PropTypes from 'prop-types'
import taskLists from 'markdown-it-task-lists'
import anchor from 'markdown-it-anchor'
import tocDoneRight from 'markdown-it-toc-done-right'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import footnote from 'markdown-it-footnote'
import { full as emoji }from 'markdown-it-emoji'
import deflist from 'markdown-it-deflist'
import ins from 'markdown-it-ins'
import mark from 'markdown-it-mark'
import math from 'markdown-it-math'
import plantuml from 'markdown-it-plantuml'
import abbr from 'markdown-it-abbr'
import { imgSize } from '@mdit/plugin-img-size'
import linkifyit from 'linkify-it'
import { icon } from '../../utils/chainIcon'

linkifyit()

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) { } // eslint-disable-line no-unused-vars, no-empty
    }
    return '' // use external default escaping
  }
}).use(taskLists)
  .use(anchor, {
    permalink: anchor.permalink.linkInsideHeader({
      symbol: icon,
      placement: 'before'
    })
  })
  .use(tocDoneRight, { listType: 'ul' })
  .use(sub)
  .use(sup)
  .use(footnote)
  .use(emoji)
  .use(deflist)
  .use(ins)
  .use(mark)
  .use(math)
  .use(plantuml)
  .use(abbr)
  .use(imgSize)

md.renderer.rules.code_inline = function(tokens, idx, options, env, slf) { // eslint-disable-line no-unused-vars
  const token = tokens[idx]
  return `<code class="inline-code">${md.utils.escapeHtml(token.content)}</code>`
}

const NotePreview = ({ content }) => {
  const viewMode = useSelector(state => state.note.viewMode)
  const [html, setHtml] = useState('')

  useEffect(() => {
    const rendered = md.render(content || '')
    setHtml(DOMPurify.sanitize(rendered))
  }, [content])

  return (
    <div className="flex justify-center h-full overflow-auto p-4">
      <div className={`
        ${viewMode === 'preview' ? 'max-w-3xl' : 'max-w-3xl'}
        w-full
        prose prose-slate dark:prose-invert
      `}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}

NotePreview.propTypes = {
  content: PropTypes.string.isRequired
}

export default NotePreview