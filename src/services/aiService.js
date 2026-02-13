/**
 * Google Gemini integration for VOCA conversation.
 * System prompt: scenario context, current goal, conversation history.
 * Returns: { reply, feedback[] } for spoken response + on-screen tips.
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function getApiKey() {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file.');
  }
  return key;
}

function getModel() {
  return import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
}

function buildSystemPrompt({ scenarioTitle, characterRole, currentGoal, goals, goalIndex }) {
  const goalList = goals?.length ? goals.map((g, i) => `${i + 1}. ${g}`).join('\n') : 'N/A';
  const current = currentGoal ? `Current goal: ${currentGoal}` : 'No specific goal.';

  return `You are the AI character in a language learning conversation. You play the role of: ${characterRole} in a ${scenarioTitle} scenario.

Your goals for this scenario (help the user practice these):
${goalList}

${current} (Goal ${(goalIndex ?? 0) + 1} of ${goals?.length ?? 0})

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
}) {
  const apiKey = getApiKey();
  const model = getModel();

  const systemInstruction = buildSystemPrompt({
    scenarioTitle,
    characterRole,
    currentGoal,
    goals,
    goalIndex,
  });

  const contents = buildContents(
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
