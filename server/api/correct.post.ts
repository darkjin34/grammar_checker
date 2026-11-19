import { GoogleGenAI } from '@google/genai'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ text?: unknown }>(event)
  const text = typeof body?.text === 'string' ? body.text.trim() : ''

  if (!text || text.length > 3000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Enter between 1 and 3,000 characters.',
    })
  }

  const { geminiApiKey } = useRuntimeConfig(event)

  if (!geminiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The Gemini API key is missing.',
    })
  }

  const gemini = new GoogleGenAI({ apiKey: geminiApiKey })

  const config = {
    systemInstruction: [
        'Rewrite the passage in natural, professional English.',
        'Restructure sentences where it improves clarity or flow, even if the original is grammatical.',
        'Preserve the original meaning, facts, conditions, and technical terms.',
        'Return only the rewritten passage.',
    ].join(' '),
    }

    let correctedText: string | undefined

    try {
    const firstResult = await gemini.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: `Proofread this passage:\n\n${text}`,
        config,
    })

    correctedText = firstResult.text?.trim()

    if (correctedText === text) {
        const reviewResult = await gemini.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: [
            'Review this passage sentence by sentence.',
            'Check capitalization after commas and periods, subject–verb agreement, and acronyms such as ID.',
            'Apply any needed fixes and return the full passage.',
            '',
            text,
        ].join('\n'),
        config,
        })

        correctedText = reviewResult.text?.trim() || correctedText
    }
    } catch {
    throw createError({
        statusCode: 502,
        statusMessage: 'Gemini could not process your request. Try again.',
    })
    }

    if (!correctedText) {
    throw createError({
        statusCode: 502,
        statusMessage: 'Gemini returned no corrected text.',
    })
    }

    setResponseHeader(event, 'X-Grammar-Route', 'local-debug')
    console.log('Grammar route completed', {
    unchanged: correctedText === text,
    })

    return { correctedText }
})