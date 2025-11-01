'use client'

import { useCallback } from 'react'
import { CheckCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { useAtomValue, useSetAtom } from 'jotai'
import { slidesMetadataAtom, themesAtom, selectedThemeIndexAtom } from '@/atom'
import { useTransition } from 'react'
import { themeLanguageModelPrompt } from '@/built-in-ai'
import { Spinner } from './ui/spinner'
import { themeAISchema, type Slides, type Theme } from '@/schema'

type PreviewTabProps = {
  slides: Slides['slides']
  currentSlide: number
  onExportClick: () => void
}

export function PreviewTab({
  slides,
  currentSlide,
  onExportClick,
}: PreviewTabProps) {
  const styles = useAtomValue(themesAtom)
  const setStyles = useSetAtom(themesAtom)
  const selectedStyle = useAtomValue(selectedThemeIndexAtom)
  const setSelectedStyle = useSetAtom(selectedThemeIndexAtom)
  const [pending, startTransition] = useTransition()
  const slidesMetadata = useAtomValue(slidesMetadataAtom)

  const generateThemes = useCallback(async () => {
    if ('LanguageModel' in self) {
      startTransition(async () => {
        try {
          const session = await LanguageModel.create(themeLanguageModelPrompt)
          const topic = slidesMetadata.topic
          const prompt = `Generate 3 diverse, professional presentation theme styles for a presentation about "${topic}"`

          const response = await session.prompt(
            [{ role: 'user', content: prompt }],
            {
              responseConstraint: themeAISchema,
            }
          )
          const result = JSON.parse(response) as Theme
          setStyles(result)
          toast.success('Themes generated successfully')
        } catch {
          toast.error('Failed to generate themes')
          setStyles([])
        }
      })
    } else {
      toast.warning('Language Model API is not supported')
      setStyles([])
    }
  }, [slidesMetadata.topic, setStyles])

  function regenerateStyles() {
    setSelectedStyle(null)
    generateThemes()
  }

  return (
    <div className='container py-8'>
      <div className='mx-auto space-y-8 max-w-6xl'>
        <div className='space-y-2 text-center'>
          <h1 className='text-3xl font-[620] tracking-tight'>
            Preview & Choose Styles
          </h1>
          <p className='text-muted-foreground'>
            Generate and preview AI-powered design themes for your presentation
          </p>
        </div>
        {styles.length === 0 && !pending && (
          <div className='flex justify-center'>
            <Button onClick={generateThemes} disabled={pending}>
              Generate Themes
            </Button>
          </div>
        )}
        {pending ? (
          <div className='flex justify-center items-center'>
            <div className='space-y-4 text-center'>
              <div className='flex justify-center'>
                <Spinner strokeColor='#7c3bed' width='48' strokeWidth='2' />
              </div>
              <p className='text-muted-foreground'>Generating styles</p>
            </div>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              {styles.map((style, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    selectedStyle === index
                      ? 'ring-2 ring-primary shadow-lg scale-105'
                      : 'hover:shadow-md hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedStyle(index)}
                >
                  <div
                    className='flex flex-col justify-between p-4 h-32 rounded-t-lg'
                    style={{
                      background: `linear-gradient(135deg, ${style.palette[0]} 0%, ${style.palette[1]} 100%)`,
                      color: style.palette[2] || style.palette[1],
                    }}
                  >
                    <div>
                      <h3
                        className='text-lg font-bold'
                        style={{ fontFamily: style.font }}
                      >
                        {style.name}
                      </h3>
                    </div>
                    <div className='text-xs opacity-75'>
                      <p>{style.description}</p>
                    </div>
                  </div>

                  <CardContent className='p-4 space-y-4'>
                    <div className='space-y-2'>
                      <p className='text-xs font-medium text-muted-foreground'>
                        Color Palette
                      </p>
                      <div className='flex gap-2'>
                        {style.palette.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className='w-8 h-8 rounded border'
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <p className='text-xs font-medium text-muted-foreground'>
                        Font
                      </p>
                      <p
                        className='p-3 text-base font-medium rounded bg-muted/30'
                        style={{ fontFamily: style.font }}
                      >
                        {style.font}
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <p className='text-xs font-medium text-muted-foreground'>
                        Layout Approach
                      </p>
                      <ul className='space-y-1 text-xs'>
                        {style.layoutHints.map((hint, hintIndex) => (
                          <li key={hintIndex} className='text-muted-foreground'>
                            • {hint}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedStyle === index && (
                      <Button className='gap-2 w-full' size='sm'>
                        <CheckCircle className='w-4 h-4' />
                        Selected
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedStyle !== null && (
              <div className='space-y-6'>
                <Card className='border-2 border-primary/20'>
                  <CardHeader>
                    <div className='flex justify-between items-center'>
                      <div>
                        <CardTitle className='text-lg'>Live Preview</CardTitle>
                        <CardDescription>
                          How your slide will look with{' '}
                          {styles[selectedStyle].name}
                        </CardDescription>
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={regenerateStyles}
                        className='gap-2 bg-transparent'
                      >
                        <RefreshCw className='w-4 h-4' />
                        Try Different Styles
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <div className='overflow-hidden rounded-lg border shadow-lg'>
                      <div
                        className='flex flex-col justify-center p-12 min-h-96'
                        style={{
                          backgroundColor: styles[selectedStyle].palette[0],
                          color: styles[selectedStyle].palette[1],
                        }}
                      >
                        <h2
                          className='mb-8 text-4xl font-bold'
                          style={{ fontFamily: styles[selectedStyle].font }}
                        >
                          {slides[currentSlide]?.title}
                        </h2>
                        <ul
                          className='space-y-4 text-lg'
                          style={{ fontFamily: styles[selectedStyle].font }}
                        >
                          {slides[currentSlide]?.bullets.map(
                            (bullet, index) => (
                              <li key={index} className='flex items-start'>
                                <span className='mr-4'>•</span>
                                <span>{bullet}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <p className='mb-3 text-sm font-medium'>
                        Preview on other slides:
                      </p>
                      <div className='grid grid-cols-2 gap-4'>
                        {slides.slice(1, 3).map((slide, idx) => (
                          <div
                            key={idx}
                            className='overflow-hidden rounded border'
                          >
                            <div
                              className='flex flex-col justify-center p-6 min-h-32'
                              style={{
                                backgroundColor:
                                  styles[selectedStyle].palette[0],
                                color: styles[selectedStyle].palette[1],
                              }}
                            >
                              <h3
                                className='text-xl font-bold'
                                style={{
                                  fontFamily: styles[selectedStyle].font,
                                }}
                              >
                                {slide.title}
                              </h3>
                              <p className='mt-2 text-xs opacity-75'>
                                {slide.bullets.length} key points
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <Card className='bg-muted/50'>
                        <CardContent className='p-4'>
                          <p className='mb-2 text-xs text-muted-foreground'>
                            Style Details
                          </p>
                          <div className='space-y-2 text-sm'>
                            <div>
                              <p className='font-medium'>
                                {styles[selectedStyle].name}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {styles[selectedStyle].description}
                              </p>
                            </div>
                            <div className='pt-2 border-t'>
                              <p className='text-xs text-muted-foreground'>
                                Font: {styles[selectedStyle].font}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className='bg-muted/50'>
                        <CardContent className='p-4'>
                          <p className='mb-2 text-xs text-muted-foreground'>
                            Color Scheme
                          </p>
                          <div className='flex gap-2 mb-2'>
                            {styles[selectedStyle].palette.map((color, idx) => (
                              <div
                                key={idx}
                                className='w-6 h-6 rounded border'
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {styles[selectedStyle].palette.length} primary
                            colors
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className='pt-4 border-t'>
                      <Button
                        variant='outline'
                        onClick={onExportClick}
                        className='gap-2 w-full bg-transparent'
                      >
                        Continue to Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
