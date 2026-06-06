import { useState } from 'react'

const AuthPanel = ({
  currentUser,
  isConfigured,
  isLoading,
  errorMessage,
  onSignIn,
  onSignUp,
  onSignOut,
}) => {
  const [mode, setMode] = useState('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isSignUp = mode === 'sign-up';

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSignUp) {
      await onSignUp({ name, email, password });
    } else {
      await onSignIn({ email, password });
    }

    setPassword('');
  }

  if (!isConfigured) {
    return (
      <section className="auth-panel">
        <p>Configure Appwrite to enable shared accounts and reviews.</p>
      </section>
    )
  }

  if (currentUser) {
    return (
      <section className="auth-panel signed-in">
        <div>
          <span>Signed in</span>
          <strong>{currentUser.name || currentUser.email}</strong>
        </div>
        <button type="button" onClick={onSignOut} disabled={isLoading}>
          Sign Out
        </button>
      </section>
    )
  }

  return (
    <section className="auth-panel">
      <form className={isSignUp ? 'sign-up' : ''} onSubmit={handleSubmit}>
        {isSignUp && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          minLength="8"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Please wait' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <button
        className="auth-toggle"
        type="button"
        onClick={() => setMode(isSignUp ? 'sign-in' : 'sign-up')}
      >
        {isSignUp ? 'Already have an account? Sign in' : 'New here? Create account'}
      </button>

      {errorMessage && <p className="auth-error">{errorMessage}</p>}
    </section>
  )
}

export default AuthPanel
