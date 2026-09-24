import { asyncHandler } from '../middleware/asyncHandler.js';
import { chatCompletion } from '../services/chat.service.js';

/**
 * POST /api/chat (public — rate-limited, no auth)
 * Body (validated): { messages: [{role, content}...], lang: en|ta, page: donor|request }
 */
export const postChat = asyncHandler(async (req, res) => {
  const { messages, lang, page } = req.body;
  const clean = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .slice(-10)
    .map((m) => ({ role: m.role, content: String(m.content || '').slice(0, 2000) }));

  if (clean.length === 0 || clean[clean.length - 1].role !== 'user') {
    return res.status(400).json({ message: 'Last message must be from user' });
  }

  const result = await chatCompletion(clean, { lang, page });
  return res.status(200).json({ reply: result.reply, model: result.model, fallback: result.fallback });
});

export default { postChat };
