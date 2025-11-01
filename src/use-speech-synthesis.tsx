import type { stateField } from '@/type'
import { useState } from 'react'

let speechSynth: SpeechSynthesis | undefined
let utterance: SpeechSynthesisUtterance | undefined
if (typeof window !== `undefined`) {
  speechSynth = speechSynthesis
  utterance = new SpeechSynthesisUtterance()
}

function makeChunksOfText(text: string) {
  const maxLength = 190
  const speechChunks = []

  // Split the text into chunks of maximum length maxLength without breaking words
  while (text.length > 0) {
    if (text.length <= maxLength) {
      speechChunks.push(text)
      break
    }

    const chunk = text.substring(0, maxLength + 1)

    const lastSpaceIndex = chunk.lastIndexOf(' ')
    if (lastSpaceIndex !== -1) {
      speechChunks.push(text.substring(0, lastSpaceIndex))
      text = text.substring(lastSpaceIndex + 1)
    } else {
      // If there are no spaces in the chunk, split at the maxLength
      speechChunks.push(text.substring(0, maxLength))
      text = text.substring(maxLength)
    }
  }

  return speechChunks
}

async function speakText(text: string) {
  const speechChunks = makeChunksOfText(text)
  for (let i = 0; i < speechChunks.length; i++) {
    await new Promise<void>((resolve, reject) => {
      window.speechSynthesis.cancel()
      const speech = new SpeechSynthesisUtterance(speechChunks[i])
      speech.rate = 0.8
      window.speechSynthesis.speak(speech)
      speech.onend = () => {
        resolve()
      }
      speech.onerror = reject
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// function splitText(text: string, size: number) {
//   const words = text.split(` `)
//   const chunks = []
//   let chunk = ``
//   for (const word of words) {
//     if ((chunk + word).length > size) {
//       chunks.push(chunk)
//       chunk = ``
//     }
//     chunk += (chunk ? ` ` : ``) + word
//   }
//   if (chunk) chunks.push(chunk)
//   return chunks
// }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// function speakChunk(chunks: string[]) {
//   let idx = 0

//   function speakNextChunk() {
//     if (idx < chunks.length) {
//       speechSynth?.cancel()
//       const utterance = new SpeechSynthesisUtterance(chunks[idx])
//       utterance.rate = 0.9
//       utterance.onend = () => {
//         idx++
//         speakNextChunk()
//       }
//       speechSynth?.speak(utterance)
//     }
//   }

//   speakNextChunk()
// }

export function useSpeechSynthesis(_utterance: string, onEnd?: () => void) {
  const [speechSynthOptions, setSpeechSynthOptions] = useState({
    paused: speechSynth?.paused,
    speaking: speechSynth?.speaking,
  })
  const [errMessage, setErrMessage] = useState(``)
  type synthOptionsType = typeof speechSynthOptions
  const updateStateConfig = (stateValue: stateField<synthOptionsType>) => {
    setSpeechSynthOptions(prev => ({ ...prev, ...stateValue }))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // function modifyUtteranceRate() {
  //   if (utterance) {
  //     utterance.rate = 0.9
  //     utterance.text = _utterance
  //   }
  // }
  function speak() {
    // modifyUtteranceRate()
    // utterance && speechSynth?.speak(utterance)
    // speakChunk(_utterance.split(` `))
    speakText(_utterance)
    updateStateConfig({ speaking: true })
  }
  function pause() {
    speechSynth?.pause()
    updateStateConfig({ paused: true })
  }
  function resume() {
    speechSynth?.resume()
    updateStateConfig({ paused: false })
  }
  if (utterance) {
    utterance.onstart = () => {
      updateStateConfig({ speaking: true })
    }
    utterance.onpause = evt => {
      console.log(speechSynth?.paused)
      console.log(speechSynth?.speaking)
      console.log(evt)
      updateStateConfig({ paused: true })
    }
    utterance.onend = () => {
      onEnd?.()
      updateStateConfig({ speaking: false })
    }
    utterance.onerror = evt => {
      updateStateConfig({ speaking: false })
      setErrMessage(evt.error)
    }
  }
  return { speechSynth, speak, pause, resume, speechSynthOptions, errMessage }
}
