import { useEffect, useState } from 'react'

type PresentationConnection = {
  id: string
  url: string
  state: string
  addEventListener(
    type: 'message' | 'close' | 'terminate',
    listener: (event: Event | MessageEvent) => void
  ): void
  send(data: string | ArrayBuffer): void
}

type SlideData = {
  type: 'init' | 'slide-update'
  slide: {
    title: string
    bullets: string[]
  }
  slideIndex: number
  totalSlides: number
}

export function Presentation() {
  const [currentSlide, setCurrentSlide] = useState<SlideData | null>(null)

  useEffect(() => {
    const nav = navigator as typeof navigator & {
      presentation?: {
        receiver?: {
          connectionList: Promise<{
            connections: PresentationConnection[]
            addEventListener(
              type: 'connectionavailable',
              listener: (event: { connection: PresentationConnection }) => void
            ): void
          }>
        }
      }
    }

    if (!nav.presentation?.receiver) {
      return
    }

    const handleConnection = (connection: PresentationConnection) => {
      const messageHandler = (event: Event | MessageEvent) => {
        if (event instanceof MessageEvent) {
          try {
            const data = JSON.parse(event.data as string) as SlideData
            setCurrentSlide(data)
          } catch {
            // Silent fail
          }
        }
      }

      connection.addEventListener('message', messageHandler)

      const sendReady = () => {
        try {
          connection.send(JSON.stringify({ type: 'receiver-ready' }))
        } catch {
          if (connection.state === 'connecting') {
            setTimeout(sendReady, 50)
          }
        }
      }

      if (connection.state === 'connected') {
        setTimeout(sendReady, 50)
      } else if (connection.state === 'connecting') {
        const checkConnected = setInterval(() => {
          if (connection.state === 'connected') {
            clearInterval(checkConnected)
            setTimeout(sendReady, 50)
          } else if (
            connection.state === 'closed' ||
            connection.state === 'terminated'
          ) {
            clearInterval(checkConnected)
          }
        }, 50)
      }

      connection.addEventListener('close', () => {
        setCurrentSlide(null)
      })

      connection.addEventListener('terminate', () => {
        setCurrentSlide(null)
      })
    }

    nav.presentation.receiver.connectionList
      .then(list => {
        list.connections.forEach(conn => {
          handleConnection(conn)
        })

        list.addEventListener(
          'connectionavailable',
          (event: { connection: PresentationConnection }) => {
            handleConnection(event.connection)
          }
        )
      })
      .catch(() => {
        // Silent fail
      })
  }, [])

  return (
    <div className='flex flex-col justify-center items-center p-8 min-h-screen bg-muted-foreground'>
      <div className='w-full max-w-6xl'>
        {currentSlide ? (
          <div className='p-12 bg-gradient-to-br rounded-lg from-background to-muted/50'>
            <h2 className='mb-8 text-5xl font-[650] tracking-[-0.04em] text-center text-balance'>
              {currentSlide.slide.title}
            </h2>
            <ul className='space-y-6'>
              {currentSlide.slide.bullets.map((bullet, index) => (
                <li
                  key={index}
                  className='flex items-start text-2xl text-pretty [font-feature-settings:"ss01","ss03"]'
                >
                  <span className='mr-4 text-3xl text-primary'>•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <div className='mt-8 text-center text-muted-foreground'>
              Slide {currentSlide.slideIndex + 1} of {currentSlide.totalSlides}
            </div>
          </div>
        ) : (
          <div className='p-12 text-center rounded-lg backdrop-blur-sm bg-black/50'>
            <p className='text-xl font-medium tracking-tight text-slate-300'>
              Waiting for presentation to start...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
