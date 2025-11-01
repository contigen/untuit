import { Bot, Download, Presentation, Eye, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useAtomValue } from 'jotai'
import { slidesMetadataAtom, themesAtom, selectedThemeIndexAtom } from '@/atom'
import { downloadPDF } from '@/lib/pdf-export'

type ExportTabProps = {
  slides: Array<{ title: string; bullets: string[] }>
  onPresentNow: () => void
  onCreateNew: () => void
  onPreviewClick?: () => void
}

export const ExportTab = ({
  slides,
  onPresentNow,
  onCreateNew,
  onPreviewClick,
}: ExportTabProps) => {
  const slidesMetadata = useAtomValue(slidesMetadataAtom)
  const themes = useAtomValue(themesAtom)
  const selectedThemeIndex = useAtomValue(selectedThemeIndexAtom)

  const handlePDFDownload = async () => {
    try {
      const selectedStyle =
        selectedThemeIndex !== null && themes[selectedThemeIndex] !== undefined
          ? {
              name: themes[selectedThemeIndex].name,
              palette: themes[selectedThemeIndex].palette,
              font: themes[selectedThemeIndex].font,
            }
          : themes.length > 0
            ? {
                name: themes[0].name,
                palette: themes[0].palette,
                font: themes[0].font,
              }
            : {
                name: 'Professional',
                palette: ['#1F2937', '#FFFFFF', '#3B82F6'],
                font: 'Inter',
              }

      await downloadPDF(
        {
          slides,
          selectedStyle,
          title: slidesMetadata.topic || 'AI Presentation',
        },
        `${slidesMetadata.topic || 'presentation'}.pdf`
      )
      toast.success('PDF downloaded successfully')
    } catch {
      toast.error('Failed to generate PDF. Please try again.')
    }
  }

  const metadataItems = [
    { label: 'Total Slides', value: slides.length, isLarge: true },
    {
      label: 'Estimated Duration',
      value: slidesMetadata.suggestedDuration,
      isLarge: true,
    },
    {
      label: 'Topic',
      value: slidesMetadata.topic,
      isLarge: false,
    },
    {
      label: 'Generated',
      value: slidesMetadata.generatedAt,
      isLarge: false,
    },
  ]

  return (
    <div className='mx-auto space-y-8 max-w-2xl'>
      <div className='space-y-4 text-center'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold'>Your Deck is Ready!</h1>
          <p className='text-lg text-muted-foreground'>
            Your AI-powered presentation has been generated successfully
          </p>
        </div>
      </div>

      <Card className='border-primary/20 bg-primary/5'>
        <CardHeader>
          <CardTitle className='flex gap-2 items-center'>
            <Bot className='size-5 text-primary' />
            Presentation Summary
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            {metadataItems.map((item, index) => (
              <div key={index} className='space-y-1'>
                <p className='text-muted-foreground'>{item.label}</p>
                <p
                  className={
                    item.isLarge ? 'text-lg font-medium' : 'font-medium'
                  }
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>Export Options</h2>

        <div className='grid gap-4'>
          <Card className='transition-colors hover:bg-muted/50'>
            <CardContent className='p-6'>
              <div className='flex justify-between items-center'>
                <div className='flex gap-4 items-center'>
                  <div className='flex justify-center items-center w-12 h-12 rounded-lg bg-primary/10'>
                    <Download className='size-6 text-primary' />
                  </div>
                  <div>
                    <h3 className='font-semibold'>Download PDF</h3>
                    <p className='text-sm text-muted-foreground'>
                      Get a PDF version of your presentation
                    </p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  {onPreviewClick && themes.length > 0 && (
                    <Button variant='outline' onClick={onPreviewClick}>
                      <Eye className='mr-2 size-4' />
                      Preview Styles
                    </Button>
                  )}
                  <Button onClick={handlePDFDownload}>
                    <Download className='mr-2 size-4' />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className='opacity-50 transition-colors cursor-not-allowed'>
            <CardContent className='p-6'>
              <div className='flex justify-between items-center'>
                <div className='flex gap-4 items-center'>
                  <div className='flex justify-center items-center w-12 h-12 rounded-lg bg-muted'>
                    <Smartphone className='w-6 h-6 text-muted-foreground' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-muted-foreground'>
                      Save to NFC Tag
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Coming soon - Store presentation reference on an NFC tag
                    </p>
                  </div>
                </div>
                <Button disabled variant='outline'>
                  <Smartphone className='mr-2 size-4' />
                  Write Tag
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className='flex gap-4 pt-4'>
        <Button
          variant='outline'
          className='flex-1 bg-transparent'
          onClick={onPresentNow}
        >
          <Presentation className='mr-2 size-4' />
          Present Now
        </Button>
        <Button className='flex-1' onClick={onCreateNew}>
          <Bot className='mr-2 size-4' />
          Create New
        </Button>
      </div>
    </div>
  )
}
