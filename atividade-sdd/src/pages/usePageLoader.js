import { useEffect, useRef, useState } from 'react'
import { getById } from '../api/pages'
import { isPageOfType, isPageOwnedBy } from './page-ownership'

export function usePageLoader({ id, type, userId, onIdChange, onLoaded }) {
  const isNew = id === undefined
  const [loadedPage, setLoadedPage] = useState(null)
  const [loading, setLoading] = useState(!isNew)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [trackedId, setTrackedId] = useState(id)
  const onLoadedRef = useRef(onLoaded)

  useEffect(() => {
    onLoadedRef.current = onLoaded
  }, [onLoaded])

  if (trackedId !== id) {
    const previousId = trackedId
    setTrackedId(id)
    setLoadedPage(null)
    setLoading(!isNew)
    setNotFound(false)
    setLoadError('')
    onIdChange?.({ previousId })
  }

  useEffect(() => {
    if (isNew) return

    let active = true

    getById(id)
      .then((page) => {
        if (!active) return

        if (!isPageOfType(page, type) || !isPageOwnedBy(page, userId)) {
          setNotFound(true)
          return
        }

        setLoadedPage(page)
        onLoadedRef.current?.(page)
      })
      .catch((error) => {
        if (!active) return

        if (error.status === 404) {
          setNotFound(true)
          return
        }

        setLoadError(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, isNew, type, userId, reloadKey])

  function retry() {
    setLoading(true)
    setLoadedPage(null)
    setLoadError('')
    setNotFound(false)
    setReloadKey((current) => current + 1)
  }

  function markNotFound() {
    setNotFound(true)
    setLoadError('')
  }

  function startLoading() {
    setLoading(true)
  }

  return {
    loadedPage,
    loading,
    notFound,
    loadError,
    retry,
    markNotFound,
    startLoading,
  }
}
