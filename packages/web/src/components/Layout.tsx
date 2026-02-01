import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    background: '#1a1a2e',
    color: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    color: 'white',
  },
  tagline: {
    fontSize: '0.9rem',
    opacity: 0.8,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  authLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  loginLink: {
    background: 'rgba(255,255,255,0.1)',
  },
  registerLink: {
    background: '#4a4a6a',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userName: {
    fontSize: '0.9rem',
  },
  logoutButton: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  main: {
    flex: 1,
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  footer: {
    background: '#1a1a2e',
    color: 'white',
    padding: '1rem 2rem',
    textAlign: 'center' as const,
    fontSize: '0.9rem',
  },
};

export function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <Link to="/" style={styles.logo}>
            Balansertefakta
          </Link>
          <span style={styles.tagline}>Ingen påstand uten motstemme</span>
        </div>
        <div style={styles.headerRight}>
          {isLoading ? null : isAuthenticated ? (
            <div style={styles.userInfo}>
              <span style={styles.userName}>
                {user?.displayName || user?.email}
              </span>
              <button style={styles.logoutButton} onClick={logout}>
                Logg ut
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                style={{ ...styles.authLink, ...styles.loginLink }}
              >
                Logg inn
              </Link>
              <Link
                to="/register"
                style={{ ...styles.authLink, ...styles.registerLink }}
              >
                Registrer
              </Link>
            </>
          )}
        </div>
      </header>
      <main style={styles.main}>{children}</main>
      <footer style={styles.footer}>
        Balansertefakta — Et forsøk på å bygge digital offentlighet som tåler
        uenighet
      </footer>
    </div>
  );
}
