import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { summarizeNoteServer } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

export default function NotesDashboard({ session }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const user = session.user;

  async function loadNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      toast.error('Error loading notes');
    } else setNotes(data);
  }

  useEffect(() => {
    if (user) loadNotes();
  }, [user]);

  async function addNote() {
    if (!content.trim()) return toast.error('Note content cannot be empty');
    const { error } = await supabase.from('notes').insert({
      user_id: user.id,
      title: title || null,
      content
    });
    if (error) {
      console.error(error);
      toast.error('Failed to add note');
    } else {
      setTitle('');
      setContent('');
      toast.success('Note added!');
      loadNotes();
    }
  }

  async function deleteNote(id) {
    const confirmDelete = confirm('Delete this note?');
    if (!confirmDelete) return;
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) {
      console.error(error);
      toast.error('Failed to delete');
    } else {
      toast.success('Note deleted');
      loadNotes();
    }
  }

  async function updateNote(id, newTitle, newContent) {
    const { error } = await supabase
      .from('notes')
      .update({
        title: newTitle,
        content: newContent,
        updated_at: new Date()
      })
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) {
      console.error(error);
      toast.error('Update failed');
    } else {
      toast.success('Note updated');
      loadNotes();
    }
  }

  async function handleSummarize(id) {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) {
        toast.error('You must be logged in to summarize notes');
        return;
      }

      const loadingToast = toast.loading('Summarizing your note...');
      const res = await summarizeNoteServer(token, id);
      toast.dismiss(loadingToast);

      if (res?.summary) {
        toast.success('Summary generated!');
        loadNotes();
      } else {
        toast.error('Failed to summarize');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error while summarizing');
    }
  }

  // 🧭 Logout Function
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
      toast.error('Failed to logout');
    } else {
      toast.success('Logged out successfully');
      // optional redirect
      window.location.reload(); // or navigate('/login') if using react-router
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Header with Logout */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Your Notes</h2>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition"
        >
          Logout
        </button>
      </header>

      {/* Note Input Form */}
      <div className="bg-white p-5 rounded-2xl shadow-md mb-8 border border-gray-100 hover:shadow-lg transition">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title (optional)"
          className="w-full mb-3 border border-gray-200 focus:ring-2 focus:ring-blue-400 rounded-lg px-3 py-2 outline-none"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write something insightful..."
          className="w-full border border-gray-200 focus:ring-2 focus:ring-blue-400 rounded-lg px-3 py-2 h-28 outline-none"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={addNote}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Add Note
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="grid md:grid-cols-2 gap-6">
        {notes.map((n) => (
          <NoteCard
            key={n.id}
            note={n}
            onDelete={deleteNote}
            onUpdate={updateNote}
            onSummarize={handleSummarize}
          />
        ))}
      </div>
    </div>
  );
}

function NoteCard({ note, onDelete, onUpdate, onSummarize }) {
  const [editing, setEditing] = useState(false);
  const [t, setT] = useState(note.title || '');
  const [c, setC] = useState(note.content || '');
  const [loading, setLoading] = useState(false);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all">
      {editing ? (
        <>
          <input
            value={t}
            onChange={(e) => setT(e.target.value)}
            className="w-full mb-2 border border-gray-200 rounded-lg px-3 py-2 outline-none"
          />
          <textarea
            value={c}
            onChange={(e) => setC(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 h-28 outline-none"
          />
          <div className="flex gap-3 justify-end mt-3">
            <button
              onClick={() => {
                onUpdate(note.id, t, c);
                setEditing(false);
              }}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold text-gray-800">
              {note.title || 'Untitled'}
            </h3>
            <div className="text-xs text-gray-400">
              {new Date(note.created_at).toLocaleString()}
            </div>
          </div>
          <p className="mt-3 text-gray-700 whitespace-pre-wrap leading-relaxed">
            {note.content}
          </p>

          {note.summary && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg text-gray-700 italic shadow-inner">
              <strong className="text-blue-700 font-semibold">Summary:</strong>{' '}
              {note.summary}
            </div>
          )}

          <div className="flex gap-2 mt-4 justify-end">
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition"
            >
              Delete
            </button>
            <button
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                await onSummarize(note.id);
                setLoading(false);
              }}
              className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition"
            >
              {loading ? 'Summarizing...' : 'Summarize'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
