import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LOGIN } from '../lib/queries';
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
  testUsers: {
    marginTop: '2rem',
    padding: '1rem',
    background: '#e9ecef',
    borderRadius: '4px',
    fontSize: '0.85rem',
  },
  testUsersTitle: {
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
};

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [loginMutation, { loading }] = useMutation(LOGIN);

  const from = (location.state as LocationState)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await loginMutation({
        variables: {
          input: { email, password },
        },
      });

      if (data?.login) {
        login(data.login.token, data.login.user);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Innlogging feilet');
    }
  };

  const fillTestUser = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('password123');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Logg inn</h1>

      {error && <div style={styles.error}>{error}</div>}

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="email">E-post</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
            autoComplete="email"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="password">Passord</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            autoComplete="current-password"
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
          {loading ? 'Logger inn...' : 'Logg inn'}
        </button>
      </form>

      <div style={styles.link}>
        Har du ikke konto? <Link to="/register">Registrer deg</Link>
      </div>

      <div style={styles.testUsers}>
        <div style={styles.testUsersTitle}>Testbrukere:</div>
        <div>
          <button
            type="button"
            onClick={() => fillTestUser('vegard@test.no')}
            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: '0.25rem 0' }}
          >
            Venstre-Vegard (vegard@test.no)
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => fillTestUser('henrik@test.no')}
            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: '0.25rem 0' }}
          >
            Høyre-Henrik (henrik@test.no)
          </button>
        </div>
        <div style={{ marginTop: '0.5rem', opacity: 0.7 }}>Passord: password123</div>
      </div>
    </div>
  );
}
