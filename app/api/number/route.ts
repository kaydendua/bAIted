import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://api.cerebras.ai/v1",
  apiKey: process.env.CEREBRAS_API_KEY,
});

const FIXED_CONTEXT = `You are a creative coding problem generator. Generate one coding problem suitable for multiple people to attempt it and provide similar solutions with slight variations in interpretation or approach.

The general difficulty of questions will range from beginner to intermediate, but you will be given a difficulty value for the question. This difficulty value can range from 1 to 5, where the value corresponds to the number of minutes it would take for the average developer to solve it.

Requirements:
- Topic: Can be anything ranging from simple if statements to arrays or algorithms
- Language: Python focused but should be solvable in most languages
- Must include subtle edge cases or room for interpretation that could spark discussion
- Format in clean Markdown with clear structure
- Include 2-3 example test cases with inputs and expected outputs
- DO NOT provide ANY solutions, code, or implementation hints
- DO NOT explain the edge cases - let players discover them
- Keep the problem statement concise but complete

Example format:
# [Problem Title]

[Brief 1-2 sentence scenario/context]

[Clear problem description]

## Example 1:
\`\`\`
Input: [input]
Output: [output]
\`\`\`

## Example 2:
\`\`\`
Input: [input]
Output: [output]
\`\`\`

## Constraints:
- [constraint 1]
- [constraint 2]`;

const FIXED_NUMBER = 3;

let generatedProblem: string | null = null; // Store the generated problem

export async function POST(req: NextRequest) {
  try {
    const { getSolution, modification, lobbyCode } = await req.json();

    let prompt;
    
    if (getSolution) {
      // Generate solution for the problem (used by AI assistant for impostors)
      prompt = `Here is a coding problem:\n\n${generatedProblem}\n\nProvide ONLY the Python code solution. No explanations, no comments, no text outside the code block. Just the raw working Python code.`;
      
      if (modification) {
        prompt += `\n\nModification requested: ${modification}\n\nUpdate the code accordingly. Again, ONLY code, no explanations.`;
      }
    } else {
      // Generate new coding problem
      prompt = `${FIXED_CONTEXT}\n\nGenerate a difficulty ${FIXED_NUMBER} coding problem. Remember: NO solutions, NO implementation hints, NO code examples in the problem description itself. Only the problem statement with test cases.`;
    }

    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const response = completion.choices[0].message.content;
    
    // Store the problem if we just generated it (for solution generation later)
    if (!getSolution) {
      generatedProblem = response;
    }

    return NextResponse.json({ 
      response 
    });
  } catch (error) {
    console.error('Error in /api/number:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}