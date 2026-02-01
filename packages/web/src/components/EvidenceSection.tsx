import { useState } from 'react';
import { ChallengeSourceModal } from './ChallengeSourceModal';

const styles = {
  container: {
    marginTop: '0.5rem',
  },
  toggle: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: '0.25rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  toggleActive: {
    color: '#1a1a2e',
  },
  evidenceList: {
    marginTop: '0.5rem',
    borderTop: '1px solid #e0e0e0',
    paddingTop: '0.5rem',
  },
  evidenceCard: {
    background: '#f8f9fa',
    borderRadius: '4px',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    fontSize: '0.85rem',
  },
  challengedCard: {
    borderLeft: '3px solid #dc3545',
  },
  extractQuote: {
    borderLeft: '3px solid #6c757d',
    paddingLeft: '0.75rem',
    margin: '0 0 0.5rem 0',
    fontStyle: 'italic',
    color: '#495057',
  },
  sourceInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  sourceLeft: {
    flex: 1,
    minWidth: '200px',
  },
  sourceTitle: {
    fontWeight: '500' as const,
    color: '#1a1a2e',
    marginBottom: '0.25rem',
  },
  sourceMeta: {
    fontSize: '0.8rem',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  sourceLink: {
    color: '#0066cc',
    textDecoration: 'none',
    fontSize: '0.8rem',
  },
  credibilityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '10px',
    fontSize: '0.75rem',
    fontWeight: '500' as const,
  },
  highCredibility: {
    background: '#d4edda',
    color: '#155724',
  },
  mediumCredibility: {
    background: '#fff3cd',
    color: '#856404',
  },
  lowCredibility: {
    background: '#f8d7da',
    color: '#721c24',
  },
  strengthBadge: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    borderRadius: '10px',
    fontSize: '0.7rem',
    background: '#e9ecef',
    color: '#495057',
  },
  challengedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '10px',
    fontSize: '0.75rem',
    background: '#f8d7da',
    color: '#721c24',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  challengeButton: {
    background: 'none',
    border: '1px solid #dc3545',
    color: '#dc3545',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  challengeList: {
    marginTop: '0.5rem',
    paddingTop: '0.5rem',
    borderTop: '1px dashed #dee2e6',
  },
  challengeItem: {
    background: '#fff3cd',
    padding: '0.5rem',
    borderRadius: '4px',
    marginBottom: '0.25rem',
    fontSize: '0.8rem',
  },
  challengeType: {
    fontWeight: '500' as const,
    color: '#856404',
  },
  pageReference: {
    fontSize: '0.75rem',
    color: '#6c757d',
  },
};

// Challenge type labels in Norwegian
const challengeTypeLabels: Record<string, string> = {
  MISQUOTE: 'Feilsitering',
  CHERRY_PICKING: 'Selektiv bruk',
  OUT_OF_CONTEXT: 'Tatt ut av kontekst',
  OUTDATED: 'Utdatert',
  METHODOLOGY: 'Metodefeil',
  CONFLICT_OF_INTEREST: 'Interessekonflikt',
  RELEVANCE: 'Ikke relevant',
};

// Support strength labels
const strengthLabels: Record<string, string> = {
  STRONGLY_SUPPORTS: 'Sterk',
  SUPPORTS: 'Stotter',
  WEAKLY_SUPPORTS: 'Svak',
  NEUTRAL: 'Noytral',
  CONTRADICTS: 'Motsier',
};

interface Challenge {
  id: string;
  challengeType: string;
  description: string;
  status: string;
}

interface Domain {
  name: string | null;
  hostname: string;
  credibilityScore: number | null;
}

interface Outlet {
  name: string;
  domain: Domain;
}

interface Artifact {
  id: string;
  title: string;
  url: string;
  artifactType: string;
  publishedAt: string | null;
  authors: string[];
  outlet: Outlet | null;
}

interface Extract {
  id: string;
  content: string;
  extractType: string;
  pageNumber: string | null;
}

export interface EvidenceLink {
  id: string;
  supportStrength: string;
  isChallenged: boolean;
  challenges: Challenge[];
  extract: Extract;
}

// Extended interface that includes artifact relation through extract
export interface EvidenceLinkWithArtifact extends Omit<EvidenceLink, 'extract'> {
  extract: Extract & {
    artifact: Artifact;
  };
}

interface EvidenceSectionProps {
  evidenceLinks: EvidenceLinkWithArtifact[];
  argumentId: string;
}

function getCredibilityStyle(score: number | null) {
  if (score === null) return styles.mediumCredibility;
  if (score >= 0.8) return styles.highCredibility;
  if (score >= 0.5) return styles.mediumCredibility;
  return styles.lowCredibility;
}

function getCredibilityLabel(score: number | null): string {
  if (score === null) return 'Ukjent';
  const percent = Math.round(score * 100);
  return `${percent}%`;
}

export function EvidenceSection({ evidenceLinks, argumentId }: EvidenceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [selectedEvidenceLinkId, setSelectedEvidenceLinkId] = useState<string | null>(null);

  if (evidenceLinks.length === 0) {
    return null;
  }

  const handleChallengeClick = (evidenceLinkId: string) => {
    setSelectedEvidenceLinkId(evidenceLinkId);
    setChallengeModalOpen(true);
  };

  const hasChallengedEvidence = evidenceLinks.some((e) => e.isChallenged);

  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.toggle,
          ...(isExpanded ? styles.toggleActive : {}),
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{isExpanded ? '▼' : '▶'}</span>
        <span>
          {evidenceLinks.length} {evidenceLinks.length === 1 ? 'kilde' : 'kilder'}
        </span>
        {hasChallengedEvidence && (
          <span style={styles.challengedBadge}>Bestridt</span>
        )}
      </button>

      {isExpanded && (
        <div style={styles.evidenceList}>
          {evidenceLinks.map((evidence) => {
            const { extract } = evidence;
            const { artifact } = extract;
            const domain = artifact.outlet?.domain;

            return (
              <div
                key={evidence.id}
                style={{
                  ...styles.evidenceCard,
                  ...(evidence.isChallenged ? styles.challengedCard : {}),
                }}
              >
                <blockquote style={styles.extractQuote}>
                  "{extract.content}"
                  {extract.pageNumber && (
                    <span style={styles.pageReference}> (s. {extract.pageNumber})</span>
                  )}
                </blockquote>

                <div style={styles.sourceInfo}>
                  <div style={styles.sourceLeft}>
                    <div style={styles.sourceTitle}>{artifact.title}</div>
                    <div style={styles.sourceMeta}>
                      {domain && (
                        <>
                          <span>{domain.name || domain.hostname}</span>
                          <span
                            style={{
                              ...styles.credibilityBadge,
                              ...getCredibilityStyle(domain.credibilityScore),
                            }}
                          >
                            {getCredibilityLabel(domain.credibilityScore)}
                          </span>
                        </>
                      )}
                      <span style={styles.strengthBadge}>
                        {strengthLabels[evidence.supportStrength] || evidence.supportStrength}
                      </span>
                      {evidence.isChallenged && (
                        <span style={styles.challengedBadge}>Bestridt</span>
                      )}
                    </div>
                    <a
                      href={artifact.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.sourceLink}
                    >
                      Se kilde →
                    </a>
                  </div>
                </div>

                {evidence.challenges.length > 0 && (
                  <div style={styles.challengeList}>
                    {evidence.challenges.map((challenge) => (
                      <div key={challenge.id} style={styles.challengeItem}>
                        <span style={styles.challengeType}>
                          {challengeTypeLabels[challenge.challengeType] || challenge.challengeType}:
                        </span>{' '}
                        {challenge.description}
                      </div>
                    ))}
                  </div>
                )}

                <div style={styles.actions}>
                  <button
                    style={styles.challengeButton}
                    onClick={() => handleChallengeClick(evidence.id)}
                  >
                    Bestrid kilde
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {challengeModalOpen && selectedEvidenceLinkId && (
        <ChallengeSourceModal
          evidenceLinkId={selectedEvidenceLinkId}
          onClose={() => {
            setChallengeModalOpen(false);
            setSelectedEvidenceLinkId(null);
          }}
        />
      )}
    </div>
  );
}
