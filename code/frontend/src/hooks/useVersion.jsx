import { useState, useCallback } from 'react'

function useVersionManager(createVersionFn, timeLimit = 15 * 60 * 1000) {
  const [lastVersionTime, setLastVersionTime] = useState(Date.now())
  const maybeCreateVersion = useCallback(async (newContent) => {
    const now = Date.now()
    if (now - lastVersionTime >= timeLimit) {
      try {
        await createVersionFn(newContent)
        setLastVersionTime(now)
      } catch (error) {
        console.error('Version creation failed:', error)
      }
    }
    return null
  }, [lastVersionTime, timeLimit, createVersionFn])


  return { maybeCreateVersion }
}

export default useVersionManager
