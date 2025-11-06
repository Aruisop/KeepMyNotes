import React from 'react';
import { supabase } from '../services/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';

export default function SignIn(){
  const signIn = async () => {
    // this will redirect to provider (set redirect URL in Supabase console)
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if(error) alert(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-4">SmartNotes</h1>
        <p className="mb-6 text-sm text-slate-500">Sign in with Google to continue</p>
        <button onClick={signIn} className="w-full py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700">
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
