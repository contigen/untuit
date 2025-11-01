import { Upload } from 'lucide-react'
import { ButtonWithSpinner } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { slidesAISchema, type Slides } from '@/schema'
import { slidesAtom, slidesMetadataAtom } from '@/atom'
import { useSetAtom } from 'jotai'
import { promptOpts } from '@/built-in-ai'
import { useTransition } from 'react'

const INPUT_NAME = 'input'

export function InputTab({
  onGenerateSlides,
}: {
  onGenerateSlides: () => void
}) {
  const [pending, startTransition] = useTransition()
  const setSlides = useSetAtom(slidesAtom)
  const setSlidesMetadata = useSetAtom(slidesMetadataAtom)
  async function generateSlides(inputText: string) {
    if ('LanguageModel' in self) {
      startTransition(async () => {
        try {
          const session = await LanguageModel.create({
            ...promptOpts,
            monitor(m) {
              m.addEventListener('downloadprogress', e => {
                // add model download UI
                console.log(`Downloaded ${e.loaded * 100}%`)
              })
            },
          })
          const availability = await LanguageModel.availability()
          console.log(availability)
          if (availability === 'downloadable') {
            toast.info('Language Model API is available')
          }
          if (availability === 'downloading') {
            toast.success('Language Model API is downloading')
          }
          const response = await session.prompt(
            [{ role: 'user', content: inputText }],
            {
              responseConstraint: slidesAISchema,
            }
          )
          const result = JSON.parse(response) as Slides
          console.log('Slides: ', result)
          setSlides(result.slides)
          setSlidesMetadata({
            topic: result.metadata.topic,
            suggestedDuration: result.metadata.suggestedDuration,
            generatedAt: new Date().toLocaleString(),
          })
          onGenerateSlides()
        } catch (err) {
          toast.error('Error generating slides')
          console.error(err)
        }
      })
    } else {
      toast.warning('Language Model API is not supported')
    }
  }

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault()
    const formData = new FormData(evt.currentTarget)
    const input = formData.get(INPUT_NAME)?.toString().trim()
    if (!input) return toast.warning('Input is required')
    await generateSlides(input)
  }
  return (
    <div className='mx-auto space-y-6 max-w-2xl'>
      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Create Your Presentation
        </h1>
        <p className='text-muted-foreground'>
          Paste your text or upload a document to generate AI-powered slides
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Content</CardTitle>
          <CardDescription>
            Add the content you want to turn into a presentation
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={pending} className='space-y-4'>
              <Textarea
                placeholder='Paste your text here or upload a file below...'
                name={INPUT_NAME}
                className='min-h-[200px] resize-vertical'
                required
              />
              <div className='flex justify-center items-center w-full opacity-50 cursor-not-allowed pointer-events-none'>
                <label className='flex flex-col justify-center items-center w-full h-32 rounded-lg border-2 border-dashed transition-colors cursor-pointer border-muted-foreground/25 hover:bg-muted/50'>
                  <div className='flex flex-col justify-center items-center pt-5 pb-6'>
                    <Upload className='mb-2 w-8 h-8 text-muted-foreground' />
                    <p className='mb-2 text-sm text-muted-foreground'>
                      <span className='font-semibold'>Click to upload</span> or
                      drag and drop
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      PDF, DOC, DOCX (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    type='file'
                    className='hidden'
                    accept='.pdf,.doc,.docx'
                  />
                </label>
              </div>
              <ButtonWithSpinner
                size='lg'
                pending={pending}
                className='w-full'
                type='submit'
              >
                Generate Slides
              </ButtonWithSpinner>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
