/**
 * OpenAI GPT-4 integration for VOCA conversation.
 * System prompt: scenario context, current goal, conversation history.
 * Returns: { reply, feedback[] } for spoken response + on-screen tips.
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

function getApiKey() {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  if (!key) {
    throw new Error('VITE_OPENAI_API_KEY is not set. Add it to your .env file.');
  }
  return key;
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
 * Send user message to GPT-4 and get reply + feedback.
 * @param {Object} options
 * @param {string} options.userMessage - Latest user utterance
 * @param {Array<{role:string,text:string}>} options.conversationHistory - Full history (user + assistant)
 * @param {string} options.scenarioTitle - e.g. "Café"
 * @param {string} options.characterRole - e.g. "Barista"
 * @param {string} [options.currentGoal] - Current goal text
 * @param {string[]} [options.goals] - All goals for scenario
 * @param {number} [options.goalIndex] - 0-based current goal index
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

  const systemPrompt = buildSystemPrompt({
    scenarioTitle,
    characterRole,
    currentGoal,
    goals,
    goalIndex,
  });

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(conversationHistory || [])
      .filter((m) => m?.text)
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
    { role: 'user', content: userMessage },
  ];

  const res = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from OpenAI');

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
