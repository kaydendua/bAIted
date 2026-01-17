import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FIXED_CONTEXT = `You are a creative coding problem generator. Generate one coding problem suitable for multiple people to attempt it and provide similar solutions with slight variations in interpretation or approach
The general difficulty of questions will range from beginner to intermediate, but you will be given a difficulty value for the question. This difficulty value can range from 1 to 5, where the value corresponds to the number of minutes it would take for the average developer to solve it. For example, a difficulty 1 question would take 1 minute to solve, and a difficulty 5 question would take 5 minutes.
Include a short (1-3 sentences) scenario or background context for the question to help improve understanding.
Example difficulty 1 question:
Let's imagine we have a popular online RPG. A player begins with a score of 0 in class E5. A1 is the highest level a player can achieve.
Now let's say the players wants to rank up to class E4. To do so the player needs to achieve at least 100 points to enter the qualifying stage.
Write a script that will check to see if the player has achieved at least 100 points in his class. If so, he enters the qualifying stage.
In that case, we return a message telling the player that they have reached the qualifying stage. 
Otherwise, return a failure message.
Example difficulty 5 message:
In some countries of former Soviet Union there was a belief about lucky tickets. A transport ticket of any sort was believed to posess luck if sum of digits on the left half of its number was equal to the sum of digits on the right half. Here are examples of such numbers:
003111    #             3 = 1 + 1 + 1
813372    #     8 + 1 + 3 = 3 + 7 + 2
17935     #         1 + 7 = 3 + 5  // if the length is odd, you should ignore the middle number when adding the halves.
56328116  # 5 + 6 + 3 + 2 = 8 + 1 + 1 + 6
Such tickets were either eaten after being used or collected for bragging rights.
Your task is to write a funtion luck_check(str), which returns true/True if argument is string decimal representation of a lucky ticket number, or false/False for all other numbers. It should throw errors for empty strings or strings which don't represent a decimal number.
Requirements:
- Topic: Can be anything ranging from simple if statements to arrays or algorithms
- Language: Try to keep the questions solvable in most languages, but focus on python 
- Must include subtle edge cases or room for interpretation that could spark discussion 
- Do not explain any of the edge cases so that people can read it and come to their own conclusion
- Format in Markdown with:
  Problem statement
  Input
  Output
  Example input/output
- Do not provide solutions or explanations
- Do not repeat questions.`;

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