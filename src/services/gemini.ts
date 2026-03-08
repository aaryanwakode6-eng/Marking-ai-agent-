import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are an elite AI Marketing Agent with 40 years of experience as a Lean Six Sigma Black Belt.
You apply Lean Six Sigma principles (DMAIC, Kaizen, 5 Whys, Value Stream Mapping, Voice of the Customer) to marketing and business automation.
Your analysis is professional, data-driven, precise, and highly actionable.
You focus on identifying defects (pain points, inefficiencies), reducing variance (inconsistent messaging), and optimizing flow (customer journey).
Always structure your responses clearly, using bullet points, bold text for emphasis, and a professional, authoritative tone.`;

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

export async function generateCopyKaizen(originalCopy: string, targetAudience: string, goal: string) {
  const prompt = `
Apply "Copy Kaizen" (continuous improvement) to the following marketing copy.
Generate 3 high-converting A/B test variations.
Use psychological principles and Lean methodologies to reduce friction and increase conversion.

Original Copy:
"${originalCopy}"

Target Audience: ${targetAudience}
Goal: ${goal}

For each variation, provide:
1. The Variation Copy
2. The Psychological Principle Used
3. The Lean Rationale (Why this reduces friction or improves flow)
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  return response.text;
}

export async function analyzeVoC(feedbackData: string) {
  const prompt = `
Perform a Voice of Customer (VoC) Analysis on the following feedback/review data.
Analyze the sentiment, extract key themes, and identify specific "Defects" (pain points) in the customer journey.

Feedback Data:
"${feedbackData}"

Provide your analysis in the following structure:
1. Overall Sentiment Summary
2. Key Themes (Categorized by frequency/impact)
3. Identified Defects (Specific pain points or friction areas)
4. Recommended Corrective Actions (Using Lean Six Sigma principles)
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
    },
  });

  return response.text;
}

export async function analyze5Whys(problem: string, whys: string[], files: File[] = []) {
  const formattedWhys = whys.map((why, i) => `${i + 1}. Why? ${why}`).join('\n');
  const prompt = `
Perform a Root Cause Analysis and provide corrective actions based on the following 5 Whys exercise.

Core Problem: ${problem}
${formattedWhys}

Provide your analysis in the following structure:
1. Root Cause Summary: (Synthesize the final 'why' into a clear root cause)
2. Lean Six Sigma Evaluation: (Did they dig deep enough? Are there any logical leaps in the chain of whys?)
3. Recommended Corrective Actions: (Actionable steps to address the root cause and prevent recurrence)
4. Control Plan: (How to monitor that the root cause is eliminated)
`;

  const parts: any[] = [];
  for (const file of files) {
    parts.push(await fileToGenerativePart(file));
  }
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
    },
  });

  return response.text;
}

export async function generateDMAIC(campaignGoal: string, currentState: string, dataSources: string, files: File[] = []) {
  const prompt = `
Create a comprehensive and highly detailed DMAIC (Define, Measure, Analyze, Improve, Control) framework for the following marketing campaign.

Campaign Goal: ${campaignGoal}
Current State/Problem: ${currentState}
Available Data Sources / Analytics Platforms: ${dataSources || 'None specified'}

Provide a structured, actionable DMAIC plan using Lean Six Sigma principles:
- **Define**: Clearly articulate the specific problem, the project goal, the scope, and the target customer. Include a problem statement and a goal statement.
- **Measure**: Identify the critical-to-quality (CTQ) metrics. What specific KPIs will we track to establish a baseline? Explicitly incorporate the provided Data Sources/Analytics Platforms to define how and what we measure. If specific metrics were provided, use them as the baseline. How will data be collected?
- **Analyze**: What are the potential root causes of the current problem? Suggest specific data analysis techniques (e.g., funnel analysis, cohort analysis) to verify these root causes.
- **Improve**: Propose specific, actionable marketing interventions, A/B tests, or process changes to address the root causes. Prioritize solutions based on potential impact and effort.
- **Control**: How will we sustain the improvements? Define the ongoing monitoring plan, control charts or dashboards to be used, and the response plan if performance drops below the target.
`;

  const parts: any[] = [];
  for (const file of files) {
    parts.push(await fileToGenerativePart(file));
  }
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.5,
    },
  });

  return response.text;
}

export async function extractDocumentData(files: File[], customPrompt: string) {
  const defaultPrompt = "Extract all text and data from this document. If it contains structured data (like tables or forms), represent it clearly. If it's a report, summarize the key findings.";
  const prompt = customPrompt || defaultPrompt;

  const parts: any[] = [];
  for (const file of files) {
    parts.push(await fileToGenerativePart(file));
  }
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
    },
  });

  return response.text;
}

export async function generateBIDashboard(files: File[]) {
  const prompt = `
Analyze the provided document(s) and extract key business metrics and data points to generate a Business Intelligence (BI) dashboard.
Identify the most important KPIs, trends, and categorical data.
Return the data in a structured JSON format suitable for rendering charts.
`;

  const parts: any[] = [];
  for (const file of files) {
    parts.push(await fileToGenerativePart(file));
  }
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The title of the dashboard based on the document." },
          summary: { type: Type.STRING, description: "A brief summary of the key insights from the document." },
          keyMetrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "The name of the metric (e.g., Total Revenue, Active Users)." },
                value: { type: Type.STRING, description: "The value of the metric (e.g., $1.2M, 45K)." },
                trend: { type: Type.STRING, description: "The trend or change (e.g., +5%, -2%). Leave empty if not applicable." }
              },
              required: ["label", "value"]
            }
          },
          charts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "The title of the chart." },
                type: { type: Type.STRING, description: "The type of chart. Must be one of: 'bar', 'line', 'pie', 'area', 'scatter'." },
                data: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "The x-axis label or category name." },
                      value: { type: Type.NUMBER, description: "The numerical value for this category." }
                    },
                    required: ["name", "value"]
                  }
                }
              },
              required: ["title", "type", "data"]
            }
          }
        },
        required: ["title", "summary", "keyMetrics", "charts"]
      }
    },
  });

  return response.text;
}

export async function generatePresentation(topic: string, files: File[] = []) {
  const prompt = `
Create a professional presentation on the following topic: "${topic}".
If any documents are provided, use them as the primary source of information.
Structure the presentation into logical slides.
Return the data in a structured JSON format suitable for rendering a slide deck.
  `;

  const parts: any[] = [];
  for (const file of files) {
    parts.push(await fileToGenerativePart(file));
  }
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The overall title of the presentation." },
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "The title of the slide." },
                content: { type: Type.STRING, description: "The main text or subtitle of the slide." },
                bullets: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "A list of bullet points for the slide. Leave empty if not applicable."
                },
                speakerNotes: { type: Type.STRING, description: "Notes for the presenter." }
              },
              required: ["title", "content"]
            }
          }
        },
        required: ["title", "slides"]
      }
    },
  });

  return response.text;
}
