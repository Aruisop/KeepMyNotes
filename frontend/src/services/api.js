const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function summarizeNoteServer(token, noteId){
  const r = await fetch(`${API_URL}/api/summarize-note`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ noteId })
  });
  return r.json();
}
