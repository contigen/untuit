import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Slide = {
  title: string
  bullets: string[]
}

type SlidePreviewProps = {
  slide: Slide
  index: number
  totalSlides: number
  isActive: boolean
  onSelect: () => void
  onEdit?: () => void
  onRegenerate?: () => void
}

export function SlidePreview({
  slide,
  index,
  totalSlides,
  isActive,
  onSelect,
  onEdit,
  onRegenerate,
}: SlidePreviewProps) {
  return (
    <Card
      className={`cursor-pointer transition-colors ${
        isActive ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
      }`}
      onClick={onSelect}
    >
      <CardHeader className='pb-2'>
        <div className='flex justify-between items-center'>
          <CardTitle className='text-base'>{slide.title}</CardTitle>
          <span className='text-xs text-muted-foreground'>
            {index + 1}/{totalSlides}
          </span>
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        <ul className='space-y-1'>
          {slide.bullets.map((bullet, idx) => (
            <li
              key={idx}
              className='text-sm line-clamp-2 text-muted-foreground'
            >
              {bullet}
            </li>
          ))}
        </ul>
        <div className='flex gap-2 mt-3'>
          <Button size='sm' variant='outline' onClick={onEdit} disabled>
            <Edit className='mr-1 size-3' />
            Edit
          </Button>
          <Button size='sm' variant='outline' onClick={onRegenerate} disabled>
            Regenerate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
