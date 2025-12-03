import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabaseClient';
import SignIn from './components/SignIn';
import NotesDashboard from './components/NotesDashboard';
import './index.css'
import toast, { Toaster } from 'react-hot-toast';

export default function App(){
  const [session, setSession] = useState(null);

  useEffect(()=>{
    // get session on load
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    // auth listener
    const { subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return ()=> subscription.unsubscribe();
  },[]);

  return session ? <NotesDashboard session={session} /> : <SignIn />;
}
