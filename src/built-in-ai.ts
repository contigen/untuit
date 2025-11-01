import { SYSTEM_PROMPT } from './constant'

export const promptOpts: LanguageModelCreateOptions = {
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
  initialPrompts: [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
  ],
}

export const themeLanguageModelPrompt: LanguageModelCreateOptions = {
  expectedInputs: [
    {
      type: 'text',
      languages: ['en'],
    },
  ],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
  initialPrompts: [
    {
      role: 'system',
      content: `Generate 3 diverse, professional presentation theme styles for a presentation with a certain topic. 

Each theme should include:
- name: A creative, descriptive name
- palette: An array of 3 hex color codes (primary background, text/foreground, accent)
- font: A web-safe font name (e.g., Georgia, Inter, Poppins, Helvetica, Arial)
- description: A brief description of the theme's aesthetic
- layoutHints: An array of 2-3 short layout/style hint`,
    },
  ],
}
