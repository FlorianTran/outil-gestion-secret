'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div>
      <h1>Connexion</h1>
      <button className='border-2' onClick={() => signIn('google')}>Se connecter avec Google</button>
    </div>
  );
}
