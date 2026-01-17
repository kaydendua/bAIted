import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FIXED_CONTEXT = `You are a creative coding problem generator.

Generate ONE unique coding problem suitable for multiple people to attempt, where different but reasonable interpretations or approaches may lead to slightly different solutions.

Start by generating a short, descriptive title (3–6 words) for the problem. Use this title as a Markdown heading (##). Do NOT use or include the phrase "Problem Statement" anywhere.

The difficulty of the question is given as a number from 1 to 5, representing the number of minutes an average developer would take to solve it.

Include a short scenario or background context (1–3 sentences) to help understanding.

Formatting rules (STRICT):
- Use compact Markdown formatting.
- Do NOT insert extra blank lines between sentences.
- Only insert blank lines between major sections.
- Keep paragraphs tight and concise.
- Avoid unnecessary line breaks.

The problem MUST be formatted in Markdown with the following sections, in this exact order:
- Title (Markdown heading)
- Description
- Input
- Output
- Example

Example formatting rules (STRICT):
- The Example section MUST include both Input and Output.
- "Input" and "Output" must be bolded labels.
- The values for Input and Output MUST be inside fenced code blocks.
- Use triple backticks with \`\`\`text for Input and Output blocks.
- Do NOT place Input or Output inline.
- Do NOT include more than one example.

Example section format (FORMAT ONLY, do not reuse values):
### Example

**Input**
\`\`\`text
[1, 2, 3]
\`\`\`

**Output**
\`\`\`text
6
\`\`\`

Requirements:
- Topic: Anything from basic conditionals to arrays, strings, or simple algorithms.
- Language: Keep it solvable in most languages, but slightly biased toward Python.
- Include subtle edge cases or room for interpretation that could spark discussion.
- Do NOT explain edge cases.
- Do NOT include solutions, hints, or explanations.
- Do NOT repeat previously generated problems.
`;



const FIXED_NUMBER = 3;

let generatedProblem: string | null = null; // Store the generated problem

export async function POST(req: NextRequest) {
  try {
    const { getSolution, modification } = await req.json();

    let prompt;
    
    if (getSolution) {
      // Generate solution for the problem
      prompt = `Here is a coding problem:\n\n${generatedProblem}\n\nProvide ONLY the Python code solution in a code block. Do NOT include any explanatory text, descriptions, or comments outside the code block. Just provide the raw code solution.`;
      
      if (modification) {
        // Modify the solution
        prompt += `\n\nUser requested modification to the solution: ${modification}\n\nPlease update the solution based on this feedback. Again, provide ONLY the code in a code block with no additional text.`;
      }
    } else {
      // Generate initial question
      prompt = `${FIXED_CONTEXT}\n\nDifficulty: ${FIXED_NUMBER}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const response = completion.choices[0].message.content;
    
    // Store the problem if we just generated it
    if (!getSolution) {
      generatedProblem = response;
    }

    return NextResponse.json({ 
      response 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get response' },
      { status: 500 }
    );
  }
}