import { useEffect, useState, useRef, useCallback } from 'react'

type PresentationSlide = {
  title: string
  bullets: string[]
}

type PresentationConnectionState =
  | 'connecting'
  | 'connected'
  | 'closed'
  | 'terminated'

interface PresentationConnection {
  state: PresentationConnectionState
  id: string
  url: string
  addEventListener(
    type: 'connect' | 'close' | 'terminate' | 'message',
    listener: (event: Event | MessageEvent) => void
  ): void
  removeEventListener(
    type: 'connect' | 'close' | 'terminate' | 'message',
    listener: (event: Event | MessageEvent) => void
  ): void
  send(data: string | ArrayBuffer): void
  close(): void
  terminate(): void
  _fallbackTimeout?: ReturnType<typeof setTimeout>
}

interface PresentationAvailability {
  value: boolean
  addEventListener(type: 'change', listener: (event: Event) => void): void
  removeEventListener(type: 'change', listener: (event: Event) => void): void
}

interface PresentationRequest {
  start(): Promise<PresentationConnection>
  reconnect(presentationId: string): Promise<PresentationConnection>
  getAvailability(): Promise<PresentationAvailability>
  addEventListener(
    type: 'connectionavailable',
    listener: (event: { connection: PresentationConnection }) => void
  ): void
  removeEventListener(
    type: 'connectionavailable',
    listener: (event: { connection: PresentationConnection }) => void
  ): void
}

interface NavigatorPresentation {
  defaultRequest: PresentationRequest | null
}

type UsePresentationAPIReturn = {
  isAvailable: boolean
  isActive: boolean
  error: string | null
  startPresentation: () => Promise<void>
  sendSlideUpdate: (slideIndex: number) => void
  endPresentation: () => void
}

export function usePresentationAPI(
  slides: PresentationSlide[],
  currentSlide: number
): UsePresentationAPIReturn {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const connectionRef = useRef<PresentationConnection | null>(null)
  const availabilityRef = useRef<PresentationAvailability | null>(null)
  const requestRef = useRef<PresentationRequest | null>(null)
  const receiverReadyRef = useRef<boolean>(false)

  const sendInitialSlide = useCallback(
    (conn: PresentationConnection) => {
      const slideData = {
        type: 'init',
        slide: slides[currentSlide],
        slideIndex: currentSlide,
        totalSlides: slides.length,
      }

      const trySend = () => {
        if (conn.state === 'connected') {
          if (receiverReadyRef.current) {
            try {
              conn.send(JSON.stringify(slideData))
            } catch {
              // Silent fail
            }
          } else {
            const fallbackTimeout = setTimeout(() => {
              if (!receiverReadyRef.current && conn.state === 'connected') {
                try {
                  conn.send(JSON.stringify(slideData))
                } catch {
                  // Silent fail
                }
              }
            }, 500)

            conn._fallbackTimeout = fallbackTimeout
          }
        } else if (conn.state === 'connecting') {
          setTimeout(trySend, 50)
        }
      }

      trySend()
    },
    [slides, currentSlide]
  )

  useEffect(() => {
    if (!('presentation' in navigator)) {
      setError('Presentation API is not supported in this browser')
      setIsAvailable(false)
      return
    }

    const nav = navigator as Navigator & {
      presentation?: NavigatorPresentation
    }
    if (!nav.presentation) {
      setError('Presentation API is not available')
      setIsAvailable(false)
      return
    }

    try {
      const presentationUrl = window.location.pathname.includes('/presentation')
        ? window.location.href
        : `${window.location.origin}/presentation`

      const PresentationRequestConstructor = (
        window as typeof window & {
          PresentationRequest?: new (urls: string[]) => PresentationRequest
        }
      ).PresentationRequest

      if (!PresentationRequestConstructor) {
        setError('PresentationRequest constructor not available')
        return
      }

      const request = new PresentationRequestConstructor([presentationUrl])
      requestRef.current = request

      nav.presentation.defaultRequest = request
      const handleAvailabilityChange = () => {
        if (availabilityRef.current) {
          setIsAvailable(availabilityRef.current.value)
        }
      }

      request
        .getAvailability()
        .then((availability: PresentationAvailability) => {
          availabilityRef.current = availability
          setIsAvailable(availability.value)
          availability.addEventListener('change', handleAvailabilityChange)
        })
        .catch(() => {
          setIsAvailable(true)
        })

      const handleConnectionAvailable = (event: {
        connection: PresentationConnection
      }) => {
        const conn = event.connection
        connectionRef.current = conn

        conn.addEventListener('close', () => {
          setIsActive(false)
          connectionRef.current = null
        })

        conn.addEventListener('terminate', () => {
          setIsActive(false)
          connectionRef.current = null
        })

        conn.addEventListener('message', (event: Event | MessageEvent) => {
          if (event instanceof MessageEvent) {
            try {
              const data = JSON.parse(event.data as string)
              if (data.type === 'receiver-ready') {
                receiverReadyRef.current = true
                if (conn._fallbackTimeout) {
                  clearTimeout(conn._fallbackTimeout)
                  delete conn._fallbackTimeout
                }
                sendInitialSlide(conn)
              }
            } catch {
              // Silent fail
            }
          }
        })

        conn.addEventListener('connect', () => {
          setIsActive(true)
          setError(null)
          receiverReadyRef.current = false
        })

        setIsActive(true)
        setError(null)
        receiverReadyRef.current = false
      }

      request.addEventListener('connectionavailable', handleConnectionAvailable)

      return () => {
        if (availabilityRef.current) {
          availabilityRef.current.removeEventListener(
            'change',
            handleAvailabilityChange
          )
        }
        request.removeEventListener(
          'connectionavailable',
          handleConnectionAvailable
        )
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to initialize presentation'
      setError(message)
    }
  }, [slides, currentSlide, sendInitialSlide])

  const startPresentation = async () => {
    if (!requestRef.current) {
      setError('Presentation request not initialized')
      return
    }

    try {
      const connection = await requestRef.current.start()
      if (!connectionRef.current) {
        connectionRef.current = connection

        connection.addEventListener('close', () => {
          setIsActive(false)
          connectionRef.current = null
        })

        connection.addEventListener('terminate', () => {
          setIsActive(false)
          connectionRef.current = null
        })

        connection.addEventListener(
          'message',
          (event: Event | MessageEvent) => {
            if (event instanceof MessageEvent) {
              try {
                const data = JSON.parse(event.data as string)
                if (data.type === 'receiver-ready') {
                  receiverReadyRef.current = true
                  sendInitialSlide(connection)
                }
              } catch {
                // Silent fail
              }
            }
          }
        )

        connection.addEventListener('connect', () => {
          setIsActive(true)
          setError(null)
          receiverReadyRef.current = false
        })
      }

      setIsActive(true)
      setError(null)
      receiverReadyRef.current = false

      sendInitialSlide(connection)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to start presentation'
      setError(message)
      setIsActive(false)
    }
  }

  const sendSlideUpdate = (slideIndex: number) => {
    if (!connectionRef.current || !isActive) return

    if (connectionRef.current.state !== 'connected') {
      if (
        connectionRef.current.state === 'closed' ||
        connectionRef.current.state === 'terminated'
      ) {
        setError('Presentation connection is not active')
      }
      return
    }

    setError(null)

    const slideData = {
      type: 'slide-update',
      slide: slides[slideIndex],
      slideIndex,
      totalSlides: slides.length,
    }

    try {
      connectionRef.current.send(JSON.stringify(slideData))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to send slide update'
      setError(message)
    }
  }

  const endPresentation = () => {
    if (connectionRef.current) {
      try {
        if (connectionRef.current.state === 'connected') {
          connectionRef.current.close()
        }
      } catch {
        // Silent fail
      }
      connectionRef.current = null
    }
    setIsActive(false)
    setError(null)
  }

  return {
    isAvailable,
    isActive,
    error,
    startPresentation,
    sendSlideUpdate,
    endPresentation,
  }
}
