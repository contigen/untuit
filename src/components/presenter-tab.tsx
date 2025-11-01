import { Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SlideNavigation } from './slide-navigation'
import { SpeakerNotes } from './speaker-notes'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Slides } from '@/schema'
import { usePresentationAPI } from './use-presentation-api'
import { useEffect } from 'react'
import { toast } from 'sonner'

type Slide = Slides['slides'][number]

type PresenterTabProps = {
  slides: Slide[]
  speakerNotes: string[]
  currentSlide: number
  onSlideChange: (slide: number) => void
  onOpenAudienceView: () => void
}

export function PresenterTab({
  slides,
  speakerNotes,
  currentSlide,
  onSlideChange,
  onOpenAudienceView,
}: PresenterTabProps) {
  const {
    isAvailable,
    isActive,
    error,
    startPresentation,
    sendSlideUpdate,
    endPresentation,
  } = usePresentationAPI(slides, currentSlide)

  async function handleStartExternalPresentation() {
    if (!isAvailable && !!error) {
      toast.error(error)
      return
    }

    try {
      await startPresentation()
    } catch (err) {
      console.error('Failed to start presentation:', err)
      if (err instanceof Error) {
        console.error('Error details:', err.name, err.message, err.stack)
      }
    }
  }

  const handleEndPresentation = () => {
    endPresentation()
  }

  useEffect(() => {
    if (isActive) {
      sendSlideUpdate(currentSlide)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, isActive])
  return (
    <div className='h-[calc(100vh-8rem)] px-6'>
      <div className='flex h-full'>
        <div className='flex flex-col w-2/3 border-r'>
          <div className='flex justify-between items-center p-4 border-b'>
            <div>
              <h2 className='text-lg font-semibold'>Presentation View</h2>
              <p className='text-sm text-muted-foreground'>
                Slide {currentSlide + 1} of {slides.length}
              </p>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' onClick={onOpenAudienceView}>
                Audience View
              </Button>
              {!isActive ? (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleStartExternalPresentation}
                  disabled={!isAvailable}
                  title={
                    error
                      ? error
                      : isAvailable
                        ? 'Share to external display'
                        : 'No display available - check browser settings'
                  }
                >
                  <Monitor className='mr-2 size-4' />
                  Share Display
                </Button>
              ) : (
                <Button
                  variant='default'
                  size='sm'
                  onClick={handleEndPresentation}
                  className='bg-green-600 hover:bg-green-700'
                >
                  <Monitor className='mr-2 size-4' />
                  Sharing ({currentSlide + 1}/{slides.length})
                </Button>
              )}
            </div>
          </div>
          <div className='flex flex-1 justify-center items-center p-8'>
            <Card className='w-full max-w-4xl bg-gradient-to-br aspect-video from-background to-muted/50'>
              <CardContent className='flex flex-col justify-center p-12 h-full'>
                <h1 className='mb-8 text-4xl font-[650] tracking-[-0.04em] text-center text-balance'>
                  {slides[currentSlide]?.title}
                </h1>
                <ul className='space-y-6'>
                  {slides[currentSlide]?.hasMarkdown ? (
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {slides[currentSlide].bullets.join('\n')}
                    </Markdown>
                  ) : (
                    slides[currentSlide]?.bullets.map((bullet, idx) => (
                      <li
                        key={idx}
                        className='text-lg text-pretty [font-feature-settings:"ss01","ss03"]'
                      >
                        {bullet}
                      </li>
                    ))
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
          <SlideNavigation
            currentSlide={currentSlide}
            totalSlides={slides.length}
            onPrevious={() => onSlideChange(Math.max(0, currentSlide - 1))}
            onNext={() =>
              onSlideChange(Math.min(slides.length - 1, currentSlide + 1))
            }
          />
        </div>
        <div className='w-1/3'>
          <div className='p-4 border-b'>
            <h2 className='text-lg font-semibold'>Speaker Notes</h2>
            <p className='text-sm text-muted-foreground'>
              Notes for current slide
            </p>
          </div>
          {isActive && (
            <Card className='mx-4 mt-4 border-green-600/50 bg-green-600/5'>
              <CardHeader>
                <CardTitle className='flex items-center text-base text-green-600'>
                  <Monitor className='inline mr-2 w-4 h-4' />
                  Displaying on External Screen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  Your presentation is currently being displayed on an external
                  monitor. Use the navigation controls below to advance slides.
                </p>
              </CardContent>
            </Card>
          )}
          {error && (
            <Card className='mx-4 mt-4 border-destructive/50 bg-destructive/5'>
              <CardHeader>
                <CardTitle className='flex items-center text-base text-destructive'>
                  Presentation Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>{error}</p>
              </CardContent>
            </Card>
          )}
          <ScrollArea className='h-[calc(100%-5rem)]'>
            <div className='p-4'>
              <SpeakerNotes
                slide={slides[currentSlide]}
                speakerNote={speakerNotes[currentSlide]}
                showTiming={true}
              />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
