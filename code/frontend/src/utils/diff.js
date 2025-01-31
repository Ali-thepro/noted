import { diff_match_patch } from 'diff-match-patch'

diff_match_patch.prototype.diff_toDelta = function (diffs) {
  let delta = []

  for (let i = 0; i < diffs.length; i++) {
    const [op, text] = diffs[i]

    switch (op) {
    case diff_match_patch.DIFF_INSERT:
      const encodedInsert = encodeURIComponent(text).replace(/\+/g, ' ') // eslint-disable-line
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

  return delta.join('\t')
}

// diff_match_patch.prototype.diff_fromDelta = function (text, delta) {

// }

export default diff_match_patch
