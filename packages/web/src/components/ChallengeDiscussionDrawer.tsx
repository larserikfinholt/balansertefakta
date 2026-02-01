import { useState, CSSProperties } from 'react';
import { useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CREATE_CHALLENGE_RESPONSE, GET_QUESTION } from '../lib/queries';
import { ChallengeBadge, challengeTypeLabels } from './ChallengeBadge';

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '450px',
    maxWidth: '100vw',
    background: '#fff',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #e9ecef',
    background: '#f8f9fa',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6c757d',
    padding: '0',
    lineHeight: 1,
  },
  challengeType: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#856404',
    marginBottom: '0.25rem',
  },
  challengeDescription: {
    fontSize: '0.9rem',
    color: '#333',
    lineHeight: 1.5,
  },
  challengeMeta: {
    fontSize: '0.8rem',
    color: '#6c757d',
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '1rem 1.25rem',
  },
  responseThread: {
    marginBottom: '1rem',
  },
  responseItem: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '0.75rem',
    marginBottom: '0.5rem',
  },
  nestedResponse: {
    marginLeft: '1.5rem',
    borderLeft: '2px solid #e9ecef',
    paddingLeft: '0.75rem',
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
  footer: {
    borderTop: '1px solid #e9ecef',
    padding: '1rem 1.25rem',
    background: '#f8f9fa',
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  fullPageLink: {
    color: '#0066cc',
    fontSize: '0.85rem',
    textDecoration: 'none',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
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
  },
  submitButton: {
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    alignSelf: 'flex-end',
  },
  submitButtonDisabled: {
    background: '#6c757d',
    cursor: 'not-allowed',
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
  emptyState: {
    textAlign: 'center',
    padding: '2rem 1rem',
    color: '#6c757d',
  },
  error: {
    color: '#dc3545',
    fontSize: '0.85rem',
    marginTop: '0.5rem',
  },
};

interface ChallengeResponse {
  id: string;
  content: string;
  depth: number;
  createdAt: string;
  createdBy: {
    id: string;
    displayName: string | null;
  };
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

interface ChallengeDiscussionDrawerProps {
  challenge: Challenge;
  evidenceLinkId: string;
  onClose: () => void;
  questionId?: string;
}

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

function ResponseItem({
  response,
  onReply,
  canReply,
}: {
  response: ChallengeResponse;
  onReply: (parentId: string) => void;
  canReply: boolean;
}) {
  const isNested = response.depth > 0;

  return (
    <div style={isNested ? { ...styles.responseItem, ...styles.nestedResponse } : styles.responseItem}>
      <div style={styles.responseHeader}>
        <span style={styles.responseAuthor}>
          {response.createdBy?.displayName || 'Anonym'}
        </span>
        <span style={styles.responseTime}>{formatTimeAgo(response.createdAt)}</span>
      </div>
      <div style={styles.responseContent}>{response.content}</div>
      {canReply && response.depth < 1 && (
        <button style={styles.replyButton} onClick={() => onReply(response.id)}>
          Svar
        </button>
      )}
      {response.replies && response.replies.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          {response.replies.map((reply) => (
            <ResponseItem
              key={reply.id}
              response={reply}
              onReply={onReply}
              canReply={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ChallengeDiscussionDrawer({
  challenge,
  evidenceLinkId,
  onClose,
  questionId,
}: ChallengeDiscussionDrawerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [createResponse, { loading }] = useMutation(CREATE_CHALLENGE_RESPONSE, {
    refetchQueries: questionId ? [{ query: GET_QUESTION, variables: { id: questionId } }] : [],
    onCompleted: () => {
      setContent('');
      setReplyingTo(null);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    createResponse({
      variables: {
        input: {
          challengeId: challenge.id,
          parentId: replyingTo,
          content: content.trim(),
        },
      },
    });
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const isAuthenticated = !!user;
  const isVerified = user?.authLevel !== 'ANONYMOUS';

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={styles.drawer}>
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <div style={styles.challengeType}>
                {challengeTypeLabels[challenge.challengeType] || challenge.challengeType}
              </div>
              <ChallengeBadge status={challenge.status} responseCount={challenge.responseCount} compact />
            </div>
            <button style={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
          <div style={styles.challengeDescription}>{challenge.description}</div>
          <div style={styles.challengeMeta}>
            <span>{challenge.createdBy?.displayName || 'Anonym'}</span>
            <span>•</span>
            <span>{formatTimeAgo(challenge.createdAt)}</span>
          </div>
        </div>

        <div style={styles.content}>
          {challenge.responses.length === 0 ? (
            <div style={styles.emptyState}>
              <p>Ingen svar ennå.</p>
              <p>Vær den første til å svare på denne utfordringen.</p>
            </div>
          ) : (
            <div style={styles.responseThread}>
              {challenge.responses.map((response) => (
                <ResponseItem
                  key={response.id}
                  response={response}
                  onReply={handleReply}
                  canReply={isVerified}
                />
              ))}
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <div style={styles.footerLinks}>
            <Link to={`/evidence/${evidenceLinkId}`} style={styles.fullPageLink}>
              Åpne full diskusjon →
            </Link>
          </div>

          {!isAuthenticated ? (
            <div style={styles.loginPrompt}>
              <Link to="/login" style={styles.loginLink}>
                Logg inn
              </Link>{' '}
              for å delta i diskusjonen
            </div>
          ) : !isVerified ? (
            <div style={styles.loginPrompt}>
              Du må være verifisert for å svare på utfordringer
            </div>
          ) : (
            <form style={styles.form} onSubmit={handleSubmit}>
              {replyingTo && (
                <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                  Svarer på kommentar{' '}
                  <button
                    type="button"
                    onClick={cancelReply}
                    style={{ ...styles.replyButton, marginLeft: '0.5rem' }}
                  >
                    Avbryt
                  </button>
                </div>
              )}
              <textarea
                style={styles.textarea}
                placeholder={replyingTo ? 'Skriv ditt svar...' : 'Legg til et svar på denne utfordringen...'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
              />
              {error && <div style={styles.error}>{error}</div>}
              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  ...(loading || !content.trim() ? styles.submitButtonDisabled : {}),
                }}
                disabled={loading || !content.trim()}
              >
                {loading ? 'Sender...' : 'Send svar'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
