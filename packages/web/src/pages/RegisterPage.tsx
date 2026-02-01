import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { REGISTER } from '../lib/queries';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    background: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  label: {
    fontWeight: 500,
    fontSize: '0.9rem',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem',
    background: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  error: {
    color: '#dc3545',
    background: '#f8d7da',
    padding: '0.75rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  link: {
    textAlign: 'center' as const,
    marginTop: '1rem',
    fontSize: '0.9rem',
  },
  hint: {
    fontSize: '0.8rem',
    color: '#666',
    marginTop: '0.25rem',
  },
};

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [registerMutation, { loading }] = useMutation(REGISTER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passordene stemmer ikke overens');
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError('Passordet må være minst 8 tegn');
      return;
    }

    try {
      const { data } = await registerMutation({
        variables: {
          input: { email, password, displayName },
        },
      });

      if (data?.register) {
        login(data.register.token, data.register.user);
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrering feilet');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Opprett konto</h1>

      {error && <div style={styles.error}>{error}</div>}

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Visningsnavn</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={styles.input}
            required
            placeholder="Hvordan vil du vises for andre?"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>E-post</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
            autoComplete="email"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Passord</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            autoComplete="new-password"
            minLength={8}
          />
          <div style={styles.hint}>Minst 8 tegn</div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Bekreft passord</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
          disabled={loading}
        >
          {loading ? 'Oppretter konto...' : 'Opprett konto'}
        </button>
      </form>

      <div style={styles.link}>
        Har du allerede konto? <Link to="/login">Logg inn</Link>
      </div>
    </div>
  );
}
