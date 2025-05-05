const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_2_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function generateInsights(parsedText, courseDescription, type, courseInsights) {
  console.log('🎯 Generating insights with Gemini 2.0...');

  const response = await axios.post(
    `${GEMINI_2_ENDPOINT}?key=${GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [
            { text: `
You are analyzing student performance on an exam or homework submission.

Course Description:
${courseDescription}

Exam, Quiz, or Homework:
${type}

Content:
${parsedText}

Your Output:
- Common mistakes the student made
- Topics that need additional review
- Student's strengths and weaknesses
- Motivational, specific advice
- Write in clear professional English
` }
          ]
        }
      ]
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const aiInsights = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const overallInsights = await synthesizeInsights(courseInsights, aiInsights);
  let synthesizedJSX = overallInsights.match(/```jsx\s*([\s\S]*?)```/)?.[1]?.trim() || '';
  if (!synthesizedJSX) {
    console.warn('⚠️ Warning: No JSX block found. Returning basic fallback.');
    return '<div>No insights generated. Please try again later.</div>';
  }
  // Remove outer <>...</> fragment if present
  if (synthesizedJSX.startsWith('<>') && synthesizedJSX.endsWith('</>')) {
    synthesizedJSX = synthesizedJSX.slice(2, -3).trim();
  }
  
  console.log('✅ JSX insights extracted');
  
  return synthesizedJSX;
}

// 🛠️ synthesizeInsights should be outside the first function
async function synthesizeInsights(courseInsights, aiInsights) {
  console.log('🔵 Synthesizing insights together...');

  const prompt = `
  You are generating a personalized student performance report.
  
  You have two sources of input:
  - "Course Insights": General trends observed across the entire course cohort.
  - "AI Insights": Analysis based on a newly submitted assignment.
  
  Your job:
  - Synthesize the Course Insights and the AI Insights together.
  - Identify key strengths and areas of improvement.
  - Provide clear actionable next steps.
  
  Output Format:
  ✅ Return the report as plain JSX inside a Markdown code block (triple backticks).
  ✅ Use ONLY <ul> and <li> tags for **all** bullet points (no <ol> needed).
  ✅ Group points clearly under the following headings:
  
  Example output:
  
  \`\`\`jsx
  <>
    <h3>🏆 Strengths</h3>
    <ul>
      <li>Mastered loops and conditionals.</li>
      <li>Effective recursion use in basic problems.</li>
    </ul>
  
    <h3>🔍 Areas for Improvement</h3>
    <ul>
      <li>Difficulty with dynamic programming optimizations.</li>
      <li>Struggles with recursion debugging.</li>
    </ul>
  
    <h3>🚀 Recommended Next Steps</h3>
    <ul>
      <li>Review dynamic programming strategies.</li>
      <li>Complete recursion debugging exercises.</li>
    </ul>
  </>
  \`\`\`
  
  Important Rules:
  - ✅ Only output valid JSX inside the code block.
  - ✅ Do not output any commentary or explanation.
  - ✅ Every point must be inside a <ul> and <li>.
  - ✅ Each section should have a clear heading (h3) and bullet list underneath.
  
  ---
  Course Insights:
  ${courseInsights}
  
  AI Insights:
  ${aiInsights}
  `;
  

  const synthResponse = await axios.post(
    `${GEMINI_2_ENDPOINT}?key=${GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const synthesizedText = synthResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return synthesizedText;
}

// Export both functions properly
module.exports = { generateInsights };