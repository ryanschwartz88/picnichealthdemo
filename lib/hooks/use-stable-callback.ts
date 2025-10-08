import { useRef, useCallback, useEffect } from "react"

export function useStableCallback<T extends (...args: any[]) => any>(callback: T) {
  const callbackRef = useRef<T>(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback((...args: Parameters<T>): ReturnType<T> => {
    return callbackRef.current(...args)
  }, [])
}
