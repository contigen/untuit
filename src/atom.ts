import { atomWithStorage } from 'jotai/utils'
import type { Slides, Theme } from './schema'

export const slidesAtom = atomWithStorage<Slides['slides']>('slides', [])

export const slidesMetadataAtom = atomWithStorage<
  Slides['metadata'] & { generatedAt: string }
>('slidesMetadata', {
  topic: '',
  generatedAt: '',
  suggestedDuration: '00:00',
})

export const suggestedDurationAtom = atomWithStorage<string>(
  'suggestedDuration',
  '00:00'
)

export const themesAtom = atomWithStorage<Theme>('themes', [])
export const selectedThemeIndexAtom = atomWithStorage<number | null>(
  'selectedThemeIndex',
  null
)
