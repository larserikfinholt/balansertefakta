import { useState, CSSProperties } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GET_EVIDENCE_LINK,
  CREATE_CHALLENGE_RESPONSE,
  ACKNOWLEDGE_CHALLENGE,
} from '../lib/queries';
import { ChallengeBadge, challengeTypeLabels, strengthLabels } from '../components/ChallengeBadge';
import { ChallengeSourceModal } from '../components/ChallengeSourceModal';

const styles: Record<string, CSSProperties> = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  breadcrumb: {
    marginBottom: '1.5rem',
    color: '#666',
    fontSize: '0.9rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
  },
  breadcrumbLink: {
    color: '#0066cc',
    textDecoration: 'none',
  },
  breadcrumbSeparator: {
    color: '#999',
    margin: '0 0.25rem',
  },
  breadcrumbCurrent: {
    color: '#333',
  },
  sourceCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem',
  },
  sourceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  sourceTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: '0.5rem',
  },
  sourceMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    fontSize: '0.9rem',
    color: '#666',
  },
  extractQuote: {
    borderLeft: '4px solid #1a1a2e',
    paddingLeft: '1rem',
    margin: '1rem 0',
    fontSize: '1.05rem',
    fontStyle: 'italic',
    color: '#333',
    lineHeight: 1.6,
  },
  pageRef: {
    fontStyle: 'normal',
    fontSize: '0.85rem',
    color: '#6c757d',
  },
  badges: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  credibilityHigh: {
    background: '#d4edda',
    color: '#155724',
  },
  credibilityMedium: {
    background: '#fff3cd',
    color: '#856404',
  },
  credibilityLow: {
    background: '#f8d7da',
    color: '#721c24',
  },
  strengthBadge: {
    background: '#e9ecef',
    color: '#495057',
  },
  sourceLink: {
    display: 'inline-block',
    marginTop: '1rem',
    color: '#0066cc',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  challengeCard: {
    background: '#fff',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    marginBottom: '1rem',
    overflow: 'hidden',
  },
  challengeHeader: {
    padding: '1rem',
    background: '#f8f9fa',
    borderBottom: '1px solid #e9ecef',
  },
  challengeHeaderTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  challengeType: {
    fontWeight: 600,
    color: '#856404',
    fontSize: '0.95rem',
  },
  challengeDescription: {
    fontSize: '0.95rem',
    color: '#333',
    lineHeight: 1.5,
  },
  challengeMeta: {
    fontSize: '0.8rem',
    color: '#6c757d',
    marginTop: '0.5rem',
  },
  challengeBody: {
    padding: '1rem',
  },
  responseThread: {
    marginTop: '0.5rem',
  },
  responseItem: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '0.75rem',
    marginBottom: '0.5rem',
  },
  nestedResponse: {
    marginLeft: '1.5rem',
    borderLeft: '2px solid #dee2e6',
  },
  responseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  responseAuthor: {
    fontWeight: 500,
    fontSize: '0.85rem',
    color: '#333',
  },
  responseTime: {
    fontSize: '0.75rem',
    color: '#6c757d',
  },
  responseContent: {
    fontSize: '0.9rem',
    lineHeight: 1.5,
    color: '#333',
  },
  replyButton: {
    background: 'none',
    border: 'none',
    color: '#0066cc',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: '0.25rem 0',
    marginTop: '0.25rem',
  },
  counterEvidence: {
    marginTop: '0.5rem',
    padding: '0.5rem',
    background: '#e3f2fd',
    borderRadius: '4px',
    fontSize: '0.85rem',
  },
  form: {
    marginTop: '1rem',
    padding: '1rem',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  formTitle: {
    fontSize: '0.9rem',
    fontWeight: 500,
    marginBottom: '0.5rem',
    color: '#333',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '0.9rem',
    resize: 'vertical',
    minHeight: '80px',
    fontFamily: 'inherit',
    marginBottom: '0.5rem',
  },
  buttonRow: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
  },
  submitButton: {
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  cancelButton: {
    background: 'none',
    border: '1px solid #dee2e6',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    color: '#666',
  },
  acknowledgeButton: {
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    marginLeft: '0.5rem',
  },
  challengeButton: {
    background: 'none',
    border: '1px solid #dc3545',
    color: '#dc3545',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
  },
  loginPrompt: {
    textAlign: 'center',
    padding: '1rem',
    color: '#6c757d',
    fontSize: '0.9rem',
  },
  loginLink: {
    color: '#0066cc',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
  error: {
    color: '#dc3545',
    fontSize: '0.85rem',
    marginTop: '0.5rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#6c757d',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  contextCard: {
    background: '#f0f4f8',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  contextLabel: {
    fontWeight: 500,
    color: '#666',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    marginBottom: '0.25rem',
  },
  contextText: {
    color: '#333',
  },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'nå';
  if (diffMins < 60) return `${diffMins} min siden`;
  if (diffHours < 24) return `${diffHours} t siden`;
  if (diffDays < 7) return `${diffDays} d siden`;
  return date.toLocaleDateString('nb-NO');
}

function getCredibilityStyle(score: number | null) {
  if (score === null) return styles.credibilityMedium;
  if (score >= 0.8) return styles.credibilityHigh;
  if (score >= 0.5) return styles.credibilityMedium;
  return styles.credibilityLow;
}

interface ChallengeResponse {
  id: string;
  content: string;
  depth: number;
  createdAt: string;
  createdBy: {
    id: string;
    displayName: string | null;
  };
  evidenceLink?: {
    id: string;
    extract: {
      content: string;
      artifact: {
        title: string;
        url: string;
      };
    };
  } | null;
  replies?: ChallengeResponse[];
}

interface Challenge {
  id: string;
  challengeType: string;
  description: string;
  status: string;
  responseCount: number;
  createdAt: string;
  createdBy: {
    id: string;
    displayName: string | null;
  } | null;
  responses: ChallengeResponse[];
}

export function EvidencePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ challengeId: string; parentId: string | null } | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_EVIDENCE_LINK, {
    variables: { id },
  });

  const [createResponse, { loading: submitting }] = useMutation(CREATE_CHALLENGE_RESPONSE, {
    onCompleted: () => {
      setReplyContent('');
      setReplyingTo(null);
      refetch();
    },
  });

  const [acknowledgeChallenge] = useMutation(ACKNOWLEDGE_CHALLENGE, {
    onCompleted: () => refetch(),
  });

  if (loading) return <div style={styles.loading}>Laster kildeinformasjon...</div>;
  if (error) return <div style={styles.loading}>Feil: {error.message}</div>;
  if (!data?.evidenceLink) return <div style={styles.loading}>Kilde ikke funnet</div>;

  const { evidenceLink } = data;
  const { extract, claim, argument } = evidenceLink;
  const artifact = extract.artifact;
  const domain = artifact.outlet?.domain;

  const isAuthenticated = !!user;
  const isVerified = user?.authLevel !== 'ANONYMOUS';
  const isEvidencePoster = user?.id === evidenceLink.createdBy?.id;

  const handleReply = (challengeId: string, parentId: string | null = null) => {
    setReplyingTo({ challengeId, parentId });
    setReplyContent('');
  };

  const handleSubmitReply = () => {
    if (!replyingTo || !replyContent.trim() || submitting) return;
    createResponse({
      variables: {
        input: {
          challengeId: replyingTo.challengeId,
          parentId: replyingTo.parentId,
          content: replyContent.trim(),
        },
      },
    });
  };

  const handleAcknowledge = (challengeId: string) => {
    if (window.confirm('Er du sikker på at du vil anerkjenne denne utfordringen?')) {
      acknowledgeChallenge({ variables: { challengeId } });
    }
  };

  const renderResponse = (response: ChallengeResponse, challengeId: string, canReply: boolean) => (
    <div
      key={response.id}
      style={{
        ...styles.responseItem,
        ...(response.depth > 0 ? styles.nestedResponse : {}),
      }}
    >
      <div style={styles.responseHeader}>
        <span style={styles.responseAuthor}>{response.createdBy?.displayName || 'Anonym'}</span>
        <span style={styles.responseTime}>{formatTimeAgo(response.createdAt)}</span>
      </div>
      <div style={styles.responseContent}>{response.content}</div>
      {response.evidenceLink && (
        <div style={styles.counterEvidence}>
          <strong>Motkilde:</strong> {response.evidenceLink.extract.content.slice(0, 100)}...
          <a href={response.evidenceLink.extract.artifact.url} target="_blank" rel="noopener noreferrer">
            ({response.evidenceLink.extract.artifact.title})
          </a>
        </div>
      )}
      {canReply && response.depth < 1 && (
        <button style={styles.replyButton} onClick={() => handleReply(challengeId, response.id)}>
          Svar
        </button>
      )}
      {response.replies &&
        response.replies.map((reply) => renderResponse(reply, challengeId, false))}
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Link to="/" style={styles.breadcrumbLink}>Hjem</Link>
        <span style={styles.breadcrumbSeparator}>→</span>
        {claim && (
          <>
            <Link to={`/question/${claim.id}`} style={styles.breadcrumbLink}>
              Påstand
            </Link>
            <span style={styles.breadcrumbSeparator}>→</span>
          </>
        )}
        {argument && (
          <>
            <span style={styles.breadcrumbCurrent}>
              {argument.argumentType === 'PRO' ? 'For-argument' : 'Mot-argument'}
            </span>
            <span style={styles.breadcrumbSeparator}>→</span>
          </>
        )}
        <span style={styles.breadcrumbCurrent}>Kildediskusjon</span>
      </div>

      {/* Context card */}
      {(claim || argument) && (
        <div style={styles.contextCard}>
          {claim && (
            <div style={{ marginBottom: argument ? '0.75rem' : 0 }}>
              <div style={styles.contextLabel}>Påstand</div>
              <div style={styles.contextText}>{claim.statement}</div>
            </div>
          )}
          {argument && (
            <div>
              <div style={styles.contextLabel}>
                {argument.argumentType === 'PRO' ? 'For-argument' : 'Mot-argument'}
              </div>
              <div style={styles.contextText}>{argument.content}</div>
            </div>
          )}
        </div>
      )}

      {/* Source card */}
      <div style={styles.sourceCard}>
        <div style={styles.sourceHeader}>
          <div>
            <div style={styles.sourceTitle}>{artifact.title}</div>
            <div style={styles.sourceMeta}>
              {domain && <span>{domain.name || domain.hostname}</span>}
              {artifact.publishedAt && (
                <span>{new Date(artifact.publishedAt).toLocaleDateString('nb-NO')}</span>
              )}
              {artifact.authors?.length > 0 && <span>{artifact.authors.join(', ')}</span>}
            </div>
          </div>
          <div style={styles.badges}>
            {domain?.credibilityScore !== null && domain?.credibilityScore !== undefined && (
              <span style={{ ...styles.badge, ...getCredibilityStyle(domain.credibilityScore) }}>
                {Math.round(domain.credibilityScore * 100)}%
              </span>
            )}
            <span style={{ ...styles.badge, ...styles.strengthBadge }}>
              {strengthLabels[evidenceLink.supportStrength] || evidenceLink.supportStrength}
            </span>
          </div>
        </div>

        <blockquote style={styles.extractQuote}>
          "{extract.content}"
          {extract.pageNumber && <span style={styles.pageRef}> (s. {extract.pageNumber})</span>}
          {extract.timestamp && <span style={styles.pageRef}> ({extract.timestamp})</span>}
        </blockquote>

        <a href={artifact.url} target="_blank" rel="noopener noreferrer" style={styles.sourceLink}>
          Se original kilde →
        </a>
      </div>

      {/* Challenges section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          Utfordringer
          <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#666' }}>
            ({evidenceLink.challenges.length})
          </span>
        </h2>

        {evidenceLink.challenges.length === 0 ? (
          <div style={styles.emptyState}>
            <p>Ingen utfordringer mot denne kilden ennå.</p>
          </div>
        ) : (
          evidenceLink.challenges.map((challenge: Challenge) => (
            <div key={challenge.id} style={styles.challengeCard}>
              <div style={styles.challengeHeader}>
                <div style={styles.challengeHeaderTop}>
                  <span style={styles.challengeType}>
                    {challengeTypeLabels[challenge.challengeType] || challenge.challengeType}
                  </span>
                  <ChallengeBadge
                    status={challenge.status}
                    responseCount={challenge.responseCount}
                    compact
                  />
                </div>
                <div style={styles.challengeDescription}>{challenge.description}</div>
                <div style={styles.challengeMeta}>
                  {challenge.createdBy?.displayName || 'Anonym'} • {formatTimeAgo(challenge.createdAt)}
                </div>
              </div>

              <div style={styles.challengeBody}>
                {challenge.responses.length > 0 && (
                  <div style={styles.responseThread}>
                    {challenge.responses.map((response) =>
                      renderResponse(response, challenge.id, isVerified)
                    )}
                  </div>
                )}

                {replyingTo?.challengeId === challenge.id && (
                  <div style={styles.form}>
                    <div style={styles.formTitle}>
                      {replyingTo.parentId ? 'Svar på kommentar' : 'Svar på utfordring'}
                    </div>
                    <textarea
                      style={styles.textarea}
                      placeholder="Skriv ditt svar..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      disabled={submitting}
                    />
                    <div style={styles.buttonRow}>
                      <button style={styles.cancelButton} onClick={() => setReplyingTo(null)}>
                        Avbryt
                      </button>
                      <button
                        style={styles.submitButton}
                        onClick={handleSubmitReply}
                        disabled={submitting || !replyContent.trim()}
                      >
                        {submitting ? 'Sender...' : 'Send svar'}
                      </button>
                    </div>
                  </div>
                )}

                {!replyingTo && isVerified && (
                  <div style={styles.actions}>
                    <button style={styles.replyButton} onClick={() => handleReply(challenge.id)}>
                      Svar på utfordring
                    </button>
                    {isEvidencePoster &&
                      challenge.status !== 'ACKNOWLEDGED' &&
                      challenge.status !== 'RETRACTED' && (
                        <button
                          style={styles.acknowledgeButton}
                          onClick={() => handleAcknowledge(challenge.id)}
                        >
                          Anerkjenn utfordring
                        </button>
                      )}
                  </div>
                )}

                {!isAuthenticated && (
                  <div style={styles.loginPrompt}>
                    <Link to="/login" style={styles.loginLink}>
                      Logg inn
                    </Link>{' '}
                    for å delta i diskusjonen
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <div style={{ marginTop: '1rem' }}>
          <button style={styles.challengeButton} onClick={() => setChallengeModalOpen(true)}>
            Ny utfordring mot kilden
          </button>
        </div>
      </div>

      {challengeModalOpen && (
        <ChallengeSourceModal evidenceLinkId={id!} onClose={() => setChallengeModalOpen(false)} />
      )}
    </div>
  );
}
