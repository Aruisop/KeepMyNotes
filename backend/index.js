require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const fetch = (...args) => import('node-fetch').then(m => m.default(...args));

const app = express();
app.use(cors());
app.use(express.json());

// --- Environment variables ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GROQ_API_KEY) {
  console.error(' Missing env vars. Please set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and GROQ_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// --- Helper: Validate frontend token ---
async function getUserFromToken(token) {
  try {
    const res = await supabase.auth.getUser(token);
    if (res.error) return null;
    return res.data.user;
  } catch (e) {
    console.error('getUserFromToken error', e);
    return null;
  }
}

// --- Main route: Summarize a note ---
app.post('/api/summarize-note', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing authorization header' });
    const token = auth.split(' ')[1];
    const user = await getUserFromToken(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    const { noteId } = req.body;
    if (!noteId) return res.status(400).json({ error: 'noteId required' });

    // --- Fetch note ---
    const { data: note, error: fetchErr } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single();

    if (fetchErr || !note) return res.status(404).json({ error: 'Note not found' });

    // --- Natural paragraph-style summarization prompt ---
    const prompt = `
      You are a helpful assistant that writes brief, fluent summaries in natural language.
      Summarize the following note into a short paragraph (2–3 sentences). 
      Keep the first line blank,
      the tone is informal and friendly.
      Make sure to assist the user in a concise manner sharing recommendations/insights if applicable.
      Keep the summary relevant to the note content.
      The content should be easy to read and understand.
      Avoid bullet points, headings, or list formatting. Just give a clean summary paragraph.
      For ambiguous or very short notes, do your best to infer the main idea and summarize accordingly.
      dont hallucianate any info.
      
      Note:
      ${note.content}
    `;

    // --- Call Groq API ---
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 250,
      }),
    });
   
    const groqJson = await groqRes.json();

    if (!groqRes.ok) {
      console.error('Groq API error:', groqJson);
      return res.status(500).json({ error: 'Groq API error', details: groqJson });
    }

    let summary =
      groqJson?.choices?.[0]?.message?.content?.trim() ||
      groqJson?.choices?.[0]?.text?.trim() ||
      'No summary';

    // --- Clean any leftover AI markers (like "Summary:" etc.) ---
    summary = summary.replace(/^summary[:\-\s]*/i, '');

    // --- Store summary in Supabase ---
    await supabase
      .from('notes')
      .update({ summary })
      .eq('id', noteId)
      .eq('user_id', user.id);

    res.json({ summary });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Start server ---
app.listen(process.env.PORT || 3000, () => console.log('Server started on port 3000'));
