import { useQuery } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import { GET_QUESTION } from '../lib/queries';
import { EvidenceSection, type EvidenceLinkWithArtifact } from '../components/EvidenceSection';

const styles = {
  breadcrumb: {
    marginBottom: '1rem',
    color: '#666',
    fontSize: '0.9rem',
  },
  breadcrumbLink: {
    color: '#1a1a2e',
    textDecoration: 'none',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  description: {
    marginBottom: '2rem',
    color: '#666',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  balanced: {
    background: '#d4edda',
    color: '#155724',
  },
  unbalanced: {
    background: '#fff3cd',
    color: '#856404',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#1a1a2e',
  },
  claimCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  claimStatement: {
    fontSize: '1.1rem',
    fontWeight: '500' as const,
    marginBottom: '1rem',
  },
  argumentsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  argumentsColumn: {
    padding: '1rem',
    borderRadius: '4px',
  },
  proColumn: {
    background: '#e8f5e9',
  },
  contraColumn: {
    background: '#ffebee',
  },
  columnTitle: {
    fontWeight: '600' as const,
    marginBottom: '0.75rem',
    fontSize: '0.9rem',
    textTransform: 'uppercase' as const,
  },
  argument: {
    padding: '0.75rem',
    background: 'white',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
  },
  counterposition: {
    marginTop: '0.5rem',
    paddingLeft: '1rem',
    borderLeft: '2px solid #ccc',
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic' as const,
  },
  loading: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666',
  },
  stats: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '0.5rem',
    fontSize: '0.85rem',
    color: '#666',
  },
};

interface Counterposition {
  id: string;
  content: string;
}

interface Argument {
  id: string;
  content: string;
  argumentType: 'PRO' | 'CONTRA';
  strength: string;
  counterpositions: Counterposition[];
  evidenceLinks: EvidenceLinkWithArtifact[];
}

interface Claim {
  id: string;
  statement: string;
  claimType: string;
  status: string;
  isBalanced: boolean;
  proArgumentCount: number;
  contraArgumentCount: number;
  arguments: Argument[];
}

interface QuestionClaim {
  id: string;
  claim: Claim;
}

interface Question {
  id: string;
  title: string;
  description: string | null;
  status: string;
  isBalanced: boolean;
  claims: QuestionClaim[];
}

export function QuestionPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useQuery<{ question: Question | null }>(GET_QUESTION, {
    variables: { id },
  });

  if (loading) return <div style={styles.loading}>Laster spørsmål...</div>;
  if (error) return <div style={styles.loading}>Feil: {error.message}</div>;
  if (!data?.question) return <div style={styles.loading}>Spørsmål ikke funnet</div>;

  const { question } = data;

  return (
    <div>
      <div style={styles.breadcrumb}>
        <Link to="/" style={styles.breadcrumbLink}>Hjem</Link> / Spørsmål
      </div>

      <h1 style={styles.title}>{question.title}</h1>
      
      <div style={{ ...styles.statusBadge, ...(question.isBalanced ? styles.balanced : styles.unbalanced) }}>
        {question.isBalanced ? '⚖️ Balansert' : '⚠️ Trenger motposisjon'}
      </div>
      
      {question.description && <p style={styles.description}>{question.description}</p>}

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Påstander</h2>
        
        {question.claims.map(({ claim }) => (
          <div key={claim.id} style={styles.claimCard}>
            <div style={styles.claimStatement}>{claim.statement}</div>
            <div style={styles.stats}>
              <span>Type: {claim.claimType}</span>
              <span>Pro: {claim.proArgumentCount}</span>
              <span>Contra: {claim.contraArgumentCount}</span>
              <span style={claim.isBalanced ? styles.balanced : styles.unbalanced}>
                {claim.isBalanced ? '⚖️' : '⚠️'}
              </span>
            </div>
            
            <div style={styles.argumentsContainer}>
              <div style={{ ...styles.argumentsColumn, ...styles.proColumn }}>
                <div style={styles.columnTitle}>✓ For-argumenter</div>
                {claim.arguments
                  .filter((arg) => arg.argumentType === 'PRO')
                  .map((arg) => (
                    <div key={arg.id} style={styles.argument}>
                      {arg.content}
                      {arg.counterpositions.map((cp) => (
                        <div key={cp.id} style={styles.counterposition}>
                          Motposisjon: {cp.content}
                        </div>
                      ))}
                      <EvidenceSection
                        evidenceLinks={arg.evidenceLinks}
                        argumentId={arg.id}
                      />
                    </div>
                  ))}
                {claim.arguments.filter((a) => a.argumentType === 'PRO').length === 0 && (
                  <div style={styles.argument}>Ingen for-argumenter ennå</div>
                )}
              </div>
              
              <div style={{ ...styles.argumentsColumn, ...styles.contraColumn }}>
                <div style={styles.columnTitle}>✗ Mot-argumenter</div>
                {claim.arguments
                  .filter((arg) => arg.argumentType === 'CONTRA')
                  .map((arg) => (
                    <div key={arg.id} style={styles.argument}>
                      {arg.content}
                      {arg.counterpositions.map((cp) => (
                        <div key={cp.id} style={styles.counterposition}>
                          Motposisjon: {cp.content}
                        </div>
                      ))}
                      <EvidenceSection
                        evidenceLinks={arg.evidenceLinks}
                        argumentId={arg.id}
                      />
                    </div>
                  ))}
                {claim.arguments.filter((a) => a.argumentType === 'CONTRA').length === 0 && (
                  <div style={styles.argument}>Ingen mot-argumenter ennå</div>
                )}
              </div>
            </div>
          </div>
        ))}

        {question.claims.length === 0 && (
          <p style={styles.description}>Ingen påstander knyttet til dette spørsmålet ennå.</p>
        )}
      </div>
    </div>
  );
}
