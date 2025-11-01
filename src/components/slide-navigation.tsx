import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SlideNavigationProps = {
  currentSlide: number
  totalSlides: number
  onPrevious: () => void
  onNext: () => void
  variant?: 'default' | 'floating'
}

export function SlideNavigation({
  currentSlide,
  totalSlides,
  onPrevious,
  onNext,
  variant = 'default',
}: SlideNavigationProps) {
  const isFirstSlide = currentSlide === 0
  const isLastSlide = currentSlide === totalSlides - 1

  if (variant === 'floating') {
    return (
      <div className='fixed bottom-6 left-1/2 transform -translate-x-1/2'>
        <div className='flex gap-2 items-center p-2 rounded-lg border shadow-lg bg-background'>
          <Button
            size='sm'
            variant='outline'
            disabled={isFirstSlide}
            onClick={onPrevious}
          >
            <ChevronLeft className='mr-1 size-4' />
            Prev
          </Button>
          <span className='px-3 py-1 text-sm'>
            {currentSlide + 1} / {totalSlides}
          </span>
          <Button
            size='sm'
            variant='outline'
            disabled={isLastSlide}
            onClick={onNext}
          >
            Next
            <ChevronRight className='ml-1 size-4' />
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className='flex gap-4 justify-center items-center p-4 border-t'>
      <Button variant='outline' disabled={isFirstSlide} onClick={onPrevious}>
        <ChevronLeft className='mr-2 size-4' />
        Previous
      </Button>
      <span className='px-4 py-2 text-sm font-medium rounded-md bg-muted'>
        {currentSlide + 1} / {totalSlides}
      </span>
      <Button variant='outline' disabled={isLastSlide} onClick={onNext}>
        Next
        <ChevronRight className='ml-2 size-4' />
      </Button>
    </div>
  )
}
