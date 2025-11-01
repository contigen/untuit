import { z } from 'zod'

export const slidesSchema = z.object({
  slides: z.array(
    z.object({
      title: z.string(),
      bullets: z.array(z.string()),
      speakerNote: z.string(),
      hasMarkdown: z.boolean(),
    })
  ),
  metadata: z.object({
    topic: z.string(),
    suggestedDuration: z.string(),
  }),
})

export type Slides = z.infer<typeof slidesSchema>

export const slidesAISchema = z.toJSONSchema(slidesSchema)

export const themeSchema = z.array(
  z.object({
    name: z.string(),
    palette: z.array(z.string()),
    font: z.string(),
    description: z.string(),
    layoutHints: z.array(z.string()),
  })
)

export type Theme = z.infer<typeof themeSchema>

export const themeAISchema = z.toJSONSchema(themeSchema)
