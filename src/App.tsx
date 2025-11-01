'use client'

import { useState } from 'react'
import {
  Bot,
  FileText,
  Presentation,
  Download,
  Mic,
  HatGlasses,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from './components/header'
import { AudienceViewDialog } from './components/audience-view-dialog'
import { InputTab } from './components/input-tab'
import { SlidesTab } from './components/slides-tab'
import { PresenterTab } from './components/presenter-tab'
import { ExportTab } from './components/export-tab'
import { useAtomValue } from 'jotai'
import { slidesAtom } from './atom'
import { PracticeTab } from './components/practice-tab'
import { PreviewTab } from './components/preview-tab'

export default function App() {
  const [activeTab, setActiveTab] = useState('input')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [audienceView, setAudienceView] = useState(false)
  const slides = useAtomValue(slidesAtom)

  const openAudienceView = () => {
    setAudienceView(true)
  }

  const updateTab = (tab: string) => () => setActiveTab(tab)

  const speakerNotes = slides.reduce(
    (acc, slide, index) => {
      acc[index] = slide.speakerNote
      return acc
    },
    {} as { [key: number]: string }
  )
  const speakerNotesArray = slides.map(slide => slide.speakerNote)
  const isSlidesEmpty = slides.length === 0

  return (
    <div className='flex flex-col min-h-screen'>
      <AudienceViewDialog
        open={audienceView}
        onOpenChange={setAudienceView}
        slides={slides}
        currentSlide={currentSlide}
        onSlideChange={setCurrentSlide}
      />
      <Header />
      <main className='flex-1'>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='my-4 w-full'
        >
          <div className='container'>
            <TabsList className='grid grid-cols-6 mx-auto w-full'>
              <TabsTrigger value='input' className='flex gap-2 items-center'>
                <FileText className='size-4' />
                Input
              </TabsTrigger>
              <TabsTrigger
                value='slides'
                className='flex gap-2 items-center'
                disabled={isSlidesEmpty}
              >
                <Bot className='size-4' />
                Slides
              </TabsTrigger>
              <TabsTrigger
                value='presenter'
                className='flex gap-2 items-center'
                disabled={isSlidesEmpty}
              >
                <Presentation className='size-4' />
                Presenter
              </TabsTrigger>
              <TabsTrigger
                value='practice'
                className='flex gap-2 items-center'
                disabled={isSlidesEmpty}
              >
                <Mic className='size-4' />
                Practice
              </TabsTrigger>
              <TabsTrigger
                value='preview'
                className='flex gap-2 items-center'
                disabled={isSlidesEmpty}
              >
                <HatGlasses className='size-4' />
                Preview
              </TabsTrigger>
              <TabsTrigger
                value='export'
                className='flex gap-2 items-center'
                disabled={isSlidesEmpty}
              >
                <Download className='size-4' />
                Export
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='input' className='container py-8'>
            <InputTab onGenerateSlides={updateTab('slides')} />
          </TabsContent>
          <TabsContent value='slides' className='h-[calc(100vh-8rem)]'>
            <SlidesTab
              slides={slides}
              speakerNotes={speakerNotesArray}
              currentSlide={currentSlide}
              onSlideChange={setCurrentSlide}
            />
          </TabsContent>
          <TabsContent value='presenter' className='h-[calc(100vh-8rem)]'>
            <PresenterTab
              slides={slides}
              speakerNotes={speakerNotesArray}
              currentSlide={currentSlide}
              onSlideChange={setCurrentSlide}
              onOpenAudienceView={openAudienceView}
            />
          </TabsContent>
          <TabsContent value='practice'>
            <PracticeTab
              slides={slides}
              speakerNotes={speakerNotes}
              currentSlide={currentSlide}
              setCurrentSlide={setCurrentSlide}
            />
          </TabsContent>

          <TabsContent value='preview'>
            <PreviewTab
              slides={slides}
              currentSlide={currentSlide}
              onExportClick={updateTab('export')}
            />
          </TabsContent>
          <TabsContent value='export' className='container py-8'>
            <ExportTab
              slides={slides}
              onPresentNow={updateTab('presenter')}
              onCreateNew={updateTab('input')}
              onPreviewClick={updateTab('preview')}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
