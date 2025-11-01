import { ScrollArea } from '@/components/ui/scroll-area'
import { SlidePreview } from './slide-preview'
import { SpeakerNotes } from './speaker-notes'
import { SlideNavigation } from './slide-navigation'

type Slide = {
  title: string
  bullets: string[]
}

type SlidesTabProps = {
  slides: Slide[]
  speakerNotes: string[]
  currentSlide: number
  onSlideChange: (slide: number) => void
  onEditSlide?: (index: number) => void
  onRegenerateSlide?: (index: number) => void
}

export function SlidesTab({
  slides,
  speakerNotes,
  currentSlide,
  onSlideChange,
  onEditSlide,
  onRegenerateSlide,
}: SlidesTabProps) {
  return (
    <div className='h-[calc(100vh-8rem)]'>
      <div className='flex h-full'>
        <div className='w-1/2 border-r'>
          <div className='p-4 border-b'>
            <h2 className='text-lg font-semibold'>Slide Previews</h2>
            <p className='text-sm text-muted-foreground'>
              {slides.length} slides generated
            </p>
          </div>
          <ScrollArea className='h-[calc(100%-5rem)]'>
            <div className='p-4 space-y-4'>
              {slides.map((slide, idx) => (
                <SlidePreview
                  key={idx}
                  slide={slide}
                  index={idx}
                  totalSlides={slides.length}
                  isActive={currentSlide === idx}
                  onSelect={() => onSlideChange(idx)}
                  onEdit={() => onEditSlide?.(idx)}
                  onRegenerate={() => onRegenerateSlide?.(idx)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className='w-1/2'>
          <div className='p-4 border-b'>
            <h2 className='text-lg font-semibold'>
              AI-Generated Speaker Notes
            </h2>
            <p className='text-sm text-muted-foreground'>
              Slide {currentSlide + 1} of {slides.length}
            </p>
          </div>
          <div className='p-4 h-[calc(100%-5rem)] flex flex-col'>
            <div className='flex-1'>
              <SpeakerNotes
                slide={slides[currentSlide]}
                speakerNote={speakerNotes[currentSlide]}
              />
            </div>
          </div>
        </div>
      </div>
      <SlideNavigation
        currentSlide={currentSlide}
        totalSlides={slides.length}
        onPrevious={() => onSlideChange(Math.max(0, currentSlide - 1))}
        onNext={() =>
          onSlideChange(Math.min(slides.length - 1, currentSlide + 1))
        }
        variant='floating'
      />
    </div>
  )
}
