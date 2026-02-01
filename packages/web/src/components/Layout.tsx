import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

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
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/" style={styles.logo}>
          ⚖️ Balansertefakta
        </Link>
        <span style={styles.tagline}>
          Ingen påstand uten motstemme
        </span>
      </header>
      <main style={styles.main}>{children}</main>
      <footer style={styles.footer}>
        Balansertefakta — Et forsøk på å bygge digital offentlighet som tåler uenighet
      </footer>
    </div>
  );
}
