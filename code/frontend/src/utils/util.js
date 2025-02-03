export const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false
  return a.every((item, index) => item === b[index])
}