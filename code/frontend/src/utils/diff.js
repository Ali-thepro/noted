import { diff_match_patch } from 'diff-match-patch'

function encode(str) {
  return encodeURIComponent(str.replace(/%20/g, '+'))
}

function unescaper(delta) {
  return delta
    .replace(/%21/g, '!')
    .replace(/%7E/g, '~')
    .replace(/%27/g, '\'')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%3B/g, ';')
    .replace(/%2F/g, '/')
    .replace(/%3F/g, '?')
    .replace(/%3A/g, ':')
    .replace(/%40/g, '@')
    .replace(/%26/g, '&')
    .replace(/%3D/g, '=')
    .replace(/%2B/g, '+')
    .replace(/%24/g, '$')
    .replace(/%2C/g, ',')
    .replace(/%23/g, '#')
    .replace(/%2A/g, '*')
}



diff_match_patch.prototype.diff_toDelta = function (diffs) {
  let delta = []

  for (let i = 0; i < diffs.length; i++) {
    const [op, text] = diffs[i]

    switch (op) {
    case diff_match_patch.DIFF_INSERT:
      const encodedInsert = encode(text).replace(/\+/g, " ") // eslint-disable-line
      delta.push(`+${encodedInsert}`)
      break
    case diff_match_patch.DIFF_DELETE:
      const deleteCount = [...text].length // eslint-disable-line
      delta.push(`-${deleteCount}`)
      break
    case diff_match_patch.DIFF_EQUAL:
      const equalCount = [...text].length // eslint-disable-line
      delta.push(`=${equalCount}`)
      break
    }
  }

  const deltaParts = delta.join('\t')
  return unescaper(deltaParts)
}

diff_match_patch.prototype.diff_fromDelta = function (text, delta) {
  let diffs = []
  let i = 0

  const runes = [...text]
  const tokens = delta.split('\t')

  for (let token of tokens) {
    if (token.length === 0) {
      continue
    }

    const op = token.charAt(0)
    let param = token.charAt(1)

    if (op === '+') {
      param = param.replace(/\+/g, '%2b')
      param = decodeURIComponent(param)
      diffs.push([diff_match_patch.DIFF_INSERT, param])
    } else if (op === '-' || op === '=') {
      const n = parseInt(param, 10)
      if (isNaN(n) || n < 0) {
        throw new Error('Invalid number in DiffFromDelta:' + param)
      }
      i += n
      if (i > runes.length) {
        break
      }
      const text = runes.slice(i - n, i).join('')
      if (op === '-') {
        diffs.push([diff_match_patch.DIFF_DELETE, text])
      } else {
        diffs.push([diff_match_patch.DIFF_EQUAL, text])
      }
    } else {
      throw new Error('Unknown DiffOp: ' + op)
    }
  }
  if (i !== runes.length) {
    throw new Error('Delta length larger than source text')
  }

  return diffs
}

export default diff_match_patch
