import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

type Slide = {
  title: string
  bullets: string[]
}

type AudienceViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  slides: Slide[]
  currentSlide: number
  onSlideChange: (slide: number) => void
}

export const AudienceViewDialog = ({
  open,
  onOpenChange,
  slides,
  currentSlide,
  onSlideChange,
}: AudienceViewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[95vw] h-[95vh] p-0 gap-0'>
        <div className='flex flex-col h-full'>
          <div className='flex justify-between items-center p-4 border-b'>
            <div>
              <DialogTitle className='text-lg font-semibold'>
                Audience View
              </DialogTitle>
              <DialogDescription className='text-sm'>
                Slide {currentSlide + 1} of {slides.length}
              </DialogDescription>
            </div>
          </div>

          <div className='flex flex-1 justify-center items-center p-8 bg-gradient-to-br from-background to-muted/30'>
            <Card className='w-full max-w-6xl bg-gradient-to-br shadow-2xl aspect-video from-background to-muted/50'>
              <CardContent className='flex flex-col justify-center p-16 h-full'>
                <h1 className='mb-12 text-5xl font-[650] tracking-[-0.04em] text-center text-balance'>
                  {slides[currentSlide]?.title}
                </h1>
                <div className='space-y-8'>
                  {slides[currentSlide]?.bullets.map((bullet, index) => (
                    <div key={index} className='flex items-start text-2xl'>
                      <span className='mr-6 text-3xl text-primary'>•</span>
                      <span className='text-pretty'>{bullet}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className='flex gap-4 justify-center items-center p-4 border-t bg-background'>
            <Button
              variant='outline'
              size='lg'
              disabled={currentSlide === 0}
              onClick={() => onSlideChange(Math.max(0, currentSlide - 1))}
            >
              <ChevronLeft className='mr-2 size-5' />
              Previous
            </Button>
            <div className='px-6 py-2 bg-muted rounded-md text-base font-medium min-w-[120px] text-center'>
              {currentSlide + 1} / {slides.length}
            </div>
            <Button
              variant='outline'
              size='lg'
              disabled={currentSlide === slides.length - 1}
              onClick={() =>
                onSlideChange(Math.min(slides.length - 1, currentSlide + 1))
              }
            >
              Next
              <ChevronRight className='ml-2 size-5' />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
