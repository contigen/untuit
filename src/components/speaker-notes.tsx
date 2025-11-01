import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAtomValue } from 'jotai'
import { slidesMetadataAtom } from '@/atom'

type Slide = {
  title: string
  bullets: string[]
}

type SpeakerNotesProps = {
  slide: Slide
  speakerNote: string
  showTiming?: boolean
}

export function SpeakerNotes({
  slide,
  speakerNote,
  showTiming = false,
}: SpeakerNotesProps) {
  const slidesMetadata = useAtomValue(slidesMetadataAtom)
  const suggestedDuration = slidesMetadata.suggestedDuration
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>{slide.title}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <h4 className='mb-2 font-medium'>Key Points:</h4>
            <ul className='space-y-2'>
              {slide.bullets.map((bullet, idx) => (
                <li key={idx} className='flex items-start'>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className='mb-2 font-medium'>Speaker Notes:</h4>
            <p className='leading-relaxed text-muted-foreground'>
              {speakerNote}
            </p>
          </div>
        </CardContent>
      </Card>

      {showTiming && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Timing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span>Suggested duration:</span>
                <span className='font-medium'>{suggestedDuration}</span>
              </div>
              <div className='flex justify-between'>
                <span>Current time:</span>
                <span className='font-medium'>0:00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
