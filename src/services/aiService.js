/**
 * Google Gemini integration for VOCA conversation.
 * System prompt: scenario context, current goal, conversation history.
 * Returns: { reply, feedback[] } for spoken response + on-screen tips.
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function getApiKey() {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || typeof key !== 'string' || !key.trim()) {
    throw new Error(
      'Gemini API key not found. Use a .env file (not .env.example) in the project root with: VITE_GEMINI_API_KEY=your_key (the VITE_ prefix is required). Then restart the dev server (npm run dev). Key: aistudio.google.com/apikey'
    );
  }
  return key.trim();
}

function getModel() {
  return import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
}

function buildSystemPrompt({ scenarioTitle, characterRole, currentGoal, goals, goalIndex, isGreeting = false }) {
  const goalList = goals?.length ? goals.map((g, i) => `${i + 1}. ${g}`).join('\n') : 'N/A';
  const current = currentGoal ? `Current goal: ${currentGoal}` : 'No specific goal.';

  const greetingInstruction = isGreeting
    ? '\nIMPORTANT: This is the start of the conversation. Greet the user warmly as your character would, introduce yourself briefly, and invite them to start practicing. Keep it friendly and encouraging (1–2 sentences).'
    : '';

  return `You are the AI character in a language learning conversation. You play the role of: ${characterRole} in a ${scenarioTitle} scenario.

Your goals for this scenario (help the user practice these):
${goalList}

${current} (Goal ${(goalIndex ?? 0) + 1} of ${goals?.length ?? 0})
${greetingInstruction}

Rules:
- Respond naturally and briefly as ${characterRole} would (1–3 sentences).
- After your reply, give the learner one short feedback or tip to improve (pronunciation, phrase, or next step).
- Respond in the same language the user used (e.g. English). If the user is practicing another language, you may respond in that language and add a brief English tip.
- Output valid JSON only, no markdown or extra text.

Output format (JSON only):
{"reply": "Your spoken response as the character", "feedback": [{"type": "success", "text": "Great pronunciation!"}] or {"type": "tip", "text": "Try saying: ..."} or {"type": "goal", "text": "Next: ..."}]}
You may include 1 or 2 feedback items. "type" must be one of: success, tip, goal.`;
}

/**
 * Build Gemini contents array from conversation history + latest user message.
 * Gemini uses role "user" and "model" (not "assistant").
 */
function buildContents(conversationHistory, userMessage) {
  const contents = [];
  for (const m of conversationHistory || []) {
    if (!m?.text) continue;
    const role = m.role === 'user' ? 'user' : 'model';
    contents.push({ role, parts: [{ text: m.text }] });
  }
  contents.push({ role: 'user', parts: [{ text: userMessage }] });
  return contents;
}

/**
 * Send user message to Gemini and get reply + feedback.
 * @param {Object} options - Same as before (userMessage, conversationHistory, scenario, etc.)
 * @returns {Promise<{ reply: string, feedback: Array<{ type: string, text: string }> }>}
 */
export async function getAIResponse({
  userMessage,
  conversationHistory,
  scenarioTitle,
  characterRole,
  currentGoal,
  goals,
  goalIndex = 0,
  isGreeting = false,
}) {
  const apiKey = getApiKey();
  const model = getModel();

  const systemInstruction = buildSystemPrompt({
    scenarioTitle,
    characterRole,
    currentGoal,
    goals,
    goalIndex,
    isGreeting,
  });

  // For greeting, send empty conversation with a prompt to greet
  const contents = isGreeting
    ? [{ role: 'user', parts: [{ text: 'Start the conversation by greeting the user warmly.' }] }]
    : buildContents(
        (conversationHistory || []).filter((m) => m?.text),
        userMessage
      );

  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || err?.message || `Gemini API error: ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.[0];
  const content = part?.text?.trim();
  if (!content) throw new Error('Empty response from Gemini');

  try {
    const parsed = JSON.parse(content);
    const reply = typeof parsed.reply === 'string' ? parsed.reply : '';
    const feedback = Array.isArray(parsed.feedback)
      ? parsed.feedback.filter((f) => f && (f.type === 'success' || f.type === 'tip' || f.type === 'goal') && f.text)
      : [];
    return { reply, feedback };
  } catch {
    return { reply: content, feedback: [] };
  }
}

export default getAIResponse;
