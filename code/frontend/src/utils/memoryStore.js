const memoryStore = (() => {
  let storedArray = null

  return {
    set: (uint8array) => {
      if (uint8array instanceof Uint8Array) {
        storedArray = uint8array
      } else {
        throw new Error('Input must be a Uint8Array.')
      }
    },
    get: () => storedArray,
    clear: () => {
      storedArray = null
    },
  }
})()

export default memoryStore
