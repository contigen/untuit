'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Zap,
  Pause,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Mic,
  Volume2,
} from 'lucide-react'
import { useSpeechRecognition } from '@/use-speech-recognition'
import { useSpeechSynthesis } from '@/use-speech-synthesis'
import { Button } from '@/components/ui/button'
import type { Slides } from '@/schema'

type Slide = Slides['slides'][number]

interface PracticeTabProps {
  slides: Slide[]
  speakerNotes: { [key: number]: string }
  currentSlide: number
  setCurrentSlide: (index: number) => void
}

export function PracticeTab({
  slides,
  speakerNotes,
  currentSlide,
  setCurrentSlide,
}: PracticeTabProps) {
  const [isPracticing, setIsPracticing] = useState(false)
  const [practiceTime, setPracticeTime] = useState(0)
  const [practiceStarted, setPracticeStarted] = useState(false)
  const [practiceMetrics, setPracticeMetrics] = useState({
    currentSlideTime: 0,
    slideTimes: [] as number[],
    wordCount: 0,
    pauseCount: 0,
  })
  const practiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentSlideNote = speakerNotes[currentSlide]
  const { transcript, startSpeechRec, stopSpeechRec } = useSpeechRecognition()
  const listening = transcript.listening
  const { speak, pause, resume, speechSynthOptions } = useSpeechSynthesis(
    currentSlideNote,
    () => {
      if (currentSlide < slides.length - 1) {
        setTimeout(() => setCurrentSlide(currentSlide + 1), 500)
      }
    }
  )

  useEffect(() => {
    if (practiceStarted && isPracticing) {
      practiceTimerRef.current = setInterval(() => {
        setPracticeTime(t => t + 1)
      }, 1000)
    } else {
      if (practiceTimerRef.current) clearInterval(practiceTimerRef.current)
    }
    return () => {
      if (practiceTimerRef.current) clearInterval(practiceTimerRef.current)
    }
  }, [practiceStarted, isPracticing])

  useEffect(() => {
    if (practiceStarted && isPracticing) {
      startSpeechRec()
    } else if (!practiceStarted || !isPracticing) {
      stopSpeechRec()
    }
  }, [practiceStarted, isPracticing, startSpeechRec, stopSpeechRec])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  function getComprehensiveFeedback() {
    const avgTimePerSlide = practiceTime / (currentSlide + 1)
    const totalSlides = slides.length
    const estimatedTotalTime = avgTimePerSlide * totalSlides

    const feedbackItems = []

    if (avgTimePerSlide < 30) {
      feedbackItems.push({
        type: 'pace',
        text: 'Speaking too quickly - aim for 30-90 seconds per slide',
        severity: 'warning',
        suggestion:
          'Pause between key points and let audience absorb information',
      })
    } else if (avgTimePerSlide > 120) {
      feedbackItems.push({
        type: 'pace',
        text: 'Spending a lot of time per slide',
        severity: 'info',
        suggestion:
          'Consider consolidating content or breaking into more slides',
      })
    } else {
      feedbackItems.push({
        type: 'pace',
        text: "Good speaking pace - you're on track",
        severity: 'success',
        suggestion: 'Keep up this rhythm throughout your presentation',
      })
    }

    if (currentSlide === slides.length - 1 && estimatedTotalTime < 5 * 60) {
      feedbackItems.push({
        type: 'progress',
        text: 'Presentation is under 5 minutes',
        severity: 'info',
        suggestion: 'Consider adding more detail or elaboration to key points',
      })
    } else if (estimatedTotalTime > 20 * 60) {
      feedbackItems.push({
        type: 'progress',
        text: 'Presentation may be running long',
        severity: 'warning',
        suggestion:
          'Review and trim content, or increase delivery pace slightly',
      })
    }

    if (
      practiceMetrics.pauseCount > 0 &&
      currentSlide > practiceMetrics.pauseCount * 2
    ) {
      feedbackItems.push({
        type: 'pauses',
        text: 'Frequent pauses detected',
        severity: 'info',
        suggestion: 'Practice for smoother transitions between slides',
      })
    }

    return feedbackItems
  }

  function startPractice() {
    setPracticeStarted(true)
    setIsPracticing(true)
  }

  function pausePractice() {
    if (isPracticing) {
      pause()
      setPracticeMetrics({
        ...practiceMetrics,
        pauseCount: practiceMetrics.pauseCount + 1,
      })
    } else {
      resume()
    }
    setIsPracticing(!isPracticing)
  }

  function readNotes() {
    if (speechSynthOptions.speaking) {
      pause()
    } else {
      speak()
    }
  }

  function stopPractice() {
    setPracticeStarted(false)
    setIsPracticing(false)
    setPracticeTime(0)
  }

  return (
    <div className='h-[calc(100vh-8rem)] flex px-6'>
      <div className='flex flex-col w-2/3 border-r'>
        <div className='flex justify-between items-center p-4 border-b'>
          <div>
            <h2 className='text-lg font-semibold'>Practice Mode</h2>
            <p className='text-sm text-muted-foreground'>
              Rehearse and improve your delivery
            </p>
            {listening && (
              <div className='flex gap-2 items-center mt-2 text-xs text-primary'>
                <Mic className='w-3 h-3 animate-pulse' />
                Listening...
              </div>
            )}
          </div>
          <div className='text-right'>
            <div className='font-mono text-3xl font-bold text-primary'>
              {formatTime(practiceTime)}
            </div>
            <p className='mt-1 text-xs text-muted-foreground'>Elapsed Time</p>
          </div>
        </div>

        <div className='flex flex-1 justify-center items-center p-8'>
          <div className='w-full max-w-4xl bg-gradient-to-br aspect-video from-background to-muted/50'>
            <div className='flex flex-col justify-center p-12 h-full'>
              <h1 className='mb-8 text-4xl font-bold text-center text-balance'>
                {slides[currentSlide]?.title}
              </h1>
              <div className='space-y-6'>
                {slides[currentSlide]?.bullets.map((bullet, index) => (
                  <div key={index} className='flex items-start text-xl'>
                    <span className='mr-4 text-2xl text-primary'>•</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className='flex gap-4 justify-center items-center p-4 border-t'>
          {!practiceStarted ? (
            <Button
              size='lg'
              onClick={startPractice}
              className='flex gap-2 items-center'
            >
              Start Practice
            </Button>
          ) : (
            <>
              <Button
                size='lg'
                className={`gap-2 flex items-center ${
                  isPracticing
                    ? 'text-white bg-primary'
                    : 'bg-transparent text-primary'
                }`}
                onClick={pausePractice}
              >
                {isPracticing ? (
                  <>
                    <Pause className='w-4 h-4' />
                    Pause
                  </>
                ) : (
                  <>
                    <Zap className='w-4 h-4' />
                    Resume
                  </>
                )}
              </Button>
              <Button
                size='lg'
                variant='outline'
                className='flex gap-2 items-center bg-transparent text-primary'
                onClick={stopPractice}
              >
                <X className='w-4 h-4' />
                Stop
              </Button>
            </>
          )}

          {practiceStarted && (
            <>
              <Button
                variant='outline'
                className='flex gap-2 items-center bg-transparent text-primary'
                disabled={currentSlide === 0}
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              >
                <ChevronLeft className='mr-2 w-4 h-4' />
                Prev
              </Button>
              <span className='px-4 py-2 text-sm font-medium rounded-md bg-muted'>
                {currentSlide + 1} / {slides.length}
              </span>
              <Button
                variant='outline'
                className='flex gap-2 items-center bg-transparent text-primary'
                disabled={currentSlide === slides.length - 1}
                onClick={() =>
                  setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))
                }
              >
                Next
                <ChevronRight className='ml-2 w-4 h-4' />
              </Button>
            </>
          )}
        </div>
      </div>
      <div className='w-1/3'>
        <div className='p-4 border-b'>
          <h2 className='text-lg font-semibold'>Delivery Feedback</h2>
          <p className='text-sm text-muted-foreground'>
            Real-time coaching insights
          </p>
        </div>
        <div className='h-[calc(100%-5rem)] overflow-auto'>
          <div className='p-4 space-y-4'>
            {practiceStarted ? (
              <>
                <div className='space-y-3'>
                  {getComprehensiveFeedback().map((feedback, idx) => (
                    <div
                      key={idx}
                      className={`border-l-4 p-4 ${
                        feedback.severity === 'success'
                          ? 'border-l-green-500 bg-green-500/5'
                          : feedback.severity === 'warning'
                            ? 'border-l-orange-500 bg-orange-500/5'
                            : 'border-l-blue-500 bg-blue-500/5'
                      }`}
                    >
                      <div className='flex gap-3 items-start'>
                        <div
                          className={`mt-0.5 text-lg ${
                            feedback.severity === 'success'
                              ? 'text-green-500'
                              : feedback.severity === 'warning'
                                ? 'text-orange-500'
                                : 'text-blue-500'
                          }`}
                        >
                          {feedback.severity === 'success'
                            ? '✓'
                            : feedback.severity === 'warning'
                              ? '⚠'
                              : 'ℹ'}
                        </div>
                        <div className='flex-1'>
                          <p className='mb-1 text-sm font-medium'>
                            {feedback.text}
                          </p>
                          <p className='text-xs italic text-muted-foreground'>
                            {feedback.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='rounded-lg border'>
                  <div className='flex gap-2 items-center p-4'>
                    <Clock className='w-4 h-4' />
                    Timing Analysis
                  </div>
                  <div className='p-4 space-y-3'>
                    <div className='flex justify-between items-center text-sm'>
                      <span className='text-muted-foreground'>Total Time</span>
                      <span className='font-semibold'>
                        {formatTime(practiceTime)}
                      </span>
                    </div>
                    <div className='flex justify-between items-center text-sm'>
                      <span className='text-muted-foreground'>
                        Avg per Slide
                      </span>
                      <span className='font-semibold'>
                        {formatTime(
                          Math.floor(practiceTime / (currentSlide + 1))
                        )}
                      </span>
                    </div>
                    <div className='flex justify-between items-center text-sm'>
                      <span className='text-muted-foreground'>
                        Est. Total Duration
                      </span>
                      <span className='font-semibold'>
                        {formatTime(
                          Math.floor(
                            (practiceTime / (currentSlide + 1)) * slides.length
                          )
                        )}
                      </span>
                    </div>
                    <div className='flex justify-between items-center text-sm'>
                      <span className='text-muted-foreground'>
                        Suggested Duration
                      </span>
                      <span className='font-semibold'>10-15 minutes</span>
                    </div>
                  </div>
                </div>

                <div className='rounded-lg border'>
                  <div className='flex items-center p-4'>
                    <TrendingUp className='mr-2 w-4 h-4' />
                    Progress
                  </div>
                  <div className='p-4'>
                    <div className='w-full h-2 rounded-full bg-muted'>
                      <div
                        className='h-2 rounded-full transition-all bg-primary'
                        style={{
                          width: `${
                            ((currentSlide + 1) / slides.length) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <p className='mt-3 text-xs text-muted-foreground'>
                      {currentSlide + 1} of {slides.length} slides completed
                    </p>
                  </div>
                </div>

                <div className='rounded-lg border'>
                  <div className='p-4'>
                    <div className='flex justify-between items-center mb-2'>
                      <h3 className='text-base font-semibold'>
                        Speaking Notes
                      </h3>
                      <button
                        onClick={readNotes}
                        className='flex gap-1 items-center px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20'
                        disabled={!currentSlideNote}
                      >
                        <Volume2 className='w-3 h-3' />
                        {speechSynthOptions.speaking ? 'Pause' : 'Read'}
                      </button>
                    </div>
                    <p className='text-sm leading-relaxed text-muted-foreground'>
                      {currentSlideNote}
                    </p>
                    {transcript.preview && (
                      <div className='pt-4 mt-4 border-t'>
                        <p className='mb-1 text-xs font-medium text-muted-foreground'>
                          Your Practice Transcript:
                        </p>
                        <p className='text-xs italic leading-relaxed text-muted-foreground'>
                          {transcript.preview || transcript.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className='flex flex-col justify-center items-center h-96 text-center'>
                <Mic className='mb-4 w-12 h-12 text-muted-foreground/30' />
                <p className='text-muted-foreground'>
                  Click "Start Practice" to begin your rehearsal session
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
