const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_1_5_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';

async function extractTextFromFile(pageBuffers) {

  const response = await axios.post(
    `${GEMINI_1_5_ENDPOINT}?key=${GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [
            ...pageBuffers.map(buffer => ({
              inlineData: { mimeType: "image/png", data: buffer.toString('base64') }
            })),
            { text: `
This document contains handwritten exams and homework.

Extract:
- All questions and answers visible
- Recognize correctness markings (✅/❌ or words like 'correct', 'incorrect')
- Classify each question as [Correct], [Incorrect], [Partial], or [Unclear]
- Maintain question numbers if possible
- DO NOT hallucinate
- DO NOT skip any visible text
` }
          ]
        }
      ]
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const extractedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return extractedText;
}

module.exports = { extractTextFromFile };
