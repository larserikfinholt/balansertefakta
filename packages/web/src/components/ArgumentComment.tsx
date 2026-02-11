import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { VALIDATIONS_FOR_ARGUMENT } from '../lib/queries';
import { EvidenceSection, type EvidenceLinkWithArtifact } from './EvidenceSection';

const validationTypeLabels: Record<string, string> = {
  CONFIRMED: 'Bekreftet',
  CHALLENGED: 'Utfordret',
  NUANCED: 'Nyansert',
};

interface Counterposition {
  id: string;
  content: string;
  createdBy?: { id: string; displayName: string } | null;
}

interface CreatedBy {
  id: string;
  displayName: string;
}

export interface ArgumentData {
  id: string;
  content: string;
  argumentType: 'PRO' | 'CONTRA';
  strength: string;
  validationCount: number;
  createdAt?: string;
  createdBy: CreatedBy | null;
  counterpositions: Counterposition[];
  evidenceLinks: EvidenceLinkWithArtifact[];
}

interface Props {
  argument: ArgumentData;
  questionId: string;
  isAuthenticated: boolean;
  isVerified: boolean;
  canAcknowledge: boolean;
  justAcknowledged: boolean;
  validating: boolean;
  onAcknowledge: (argumentId: string) => void;
  onAddCounterposition: (argumentId: string, argumentContent: string) => void;
}

const getStyles = (isPro: boolean) => ({
  wrapper: {
    display: 'flex',
    gap: '0.6rem',
    marginBottom: '0.75rem',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '600' as const,
    flexShrink: 0,
    background: isPro ? '#e8f5e9' : '#ffebee',
    color: isPro ? '#2e7d32' : '#c62828',
  },
  bubble: {
    flex: 1,
    borderRadius: '12px',
    padding: '0.6rem 0.85rem',
    fontSize: '0.9rem',
    lineHeight: '1.4',
    background: isPro ? '#f1f8e9' : '#fce4ec',
    borderLeft: `3px solid ${isPro ? '#66bb6a' : '#ef5350'}`,
  },
  authorRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem',
  },
  authorName: {
    fontWeight: '600' as const,
    fontSize: '0.8rem',
    color: '#333',
  },
  sideLabel: {
    fontSize: '0.7rem',
    fontWeight: '600' as const,
    padding: '0.1rem 0.4rem',
    borderRadius: '8px',
    background: isPro ? '#c8e6c9' : '#ffcdd2',
    color: isPro ? '#2e7d32' : '#c62828',
  },
  content: {
    marginBottom: '0.3rem',
    color: '#1a1a2e',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.35rem',
    alignItems: 'center',
  },
  action: {
    background: 'none',
    border: 'none',
    fontSize: '0.78rem',
    color: '#666',
    cursor: 'pointer',
    padding: 0,
    fontWeight: '500' as const,
  },
  acknowledgeActive: {
    color: '#1a73e8',
    fontWeight: '600' as const,
  },
  acknowledgeDisabled: {
    color: '#ccc',
    cursor: 'not-allowed',
  },
  validationBadge: {
    background: 'transparent',
    border: 'none',
    color: '#1a73e8',
    fontSize: '0.75rem',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline' as const,
  },
  validationList: {
    marginTop: '0.3rem',
    padding: '0.5rem',
    background: 'rgba(0,0,0,0.04)',
    borderRadius: '6px',
    fontSize: '0.75rem',
  },
  validationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.15rem 0',
  },
  validationType: {
    color: '#888',
    fontStyle: 'italic' as const,
  },
  noValidations: {
    fontSize: '0.72rem',
    color: '#bbb',
    marginTop: '0.2rem',
  },
  // Counterposition (sub-comment)
  subComment: {
    display: 'flex',
    gap: '0.5rem',
    marginLeft: '2.5rem',
    marginBottom: '0.5rem',
  },
  subAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.6rem',
    color: '#999',
    flexShrink: 0,
  },
  subBubble: {
    background: '#f5f5f5',
    borderRadius: '10px',
    padding: '0.4rem 0.7rem',
    fontSize: '0.82rem',
    lineHeight: '1.3',
    color: '#555',
  },
  subLabel: {
    fontSize: '0.68rem',
    fontWeight: '600' as const,
    color: '#888',
    marginBottom: '0.15rem',
  },
});

function StrengthIndicator({ strength }: { strength: string }) {
  const levels = strength === 'HIGH' ? 3 : strength === 'MEDIUM' ? 2 : 1;
  const color = strength === 'HIGH' ? '#28a745' : strength === 'MEDIUM' ? '#ffc107' : '#6c757d';
  const label = strength === 'HIGH' ? 'Sterk' : strength === 'MEDIUM' ? 'Middels' : 'Svak';

  return (
    <span style={{ display: 'inline-flex', gap: '2px', marginLeft: '0.5rem', verticalAlign: 'middle' }} title={`Styrke: ${label}`}>
      {[1, 2, 3].map((level) => (
        <span
          key={level}
          style={{
            width: '4px',
            height: '12px',
            borderRadius: '2px',
            background: level <= levels ? color : '#e0e0e0',
          }}
        />
      ))}
    </span>
  );
}

function ValidationBadge({ argumentId, count }: { argumentId: string; count: number }) {
  const [expanded, setExpanded] = useState(false);
  const [fetchValidations, { data, loading }] = useLazyQuery(VALIDATIONS_FOR_ARGUMENT, {
    variables: { argumentId },
  });

  const styles = getStyles(true); // styles don't depend on side for validation badge

  const handleClick = () => {
    if (!expanded && !data) {
      fetchValidations();
    }
    setExpanded(!expanded);
  };

  if (count === 0) {
    return <div style={styles.noValidations}>Ingen anerkjennelser enna</div>;
  }

  return (
    <div style={{ marginTop: '0.3rem' }}>
      <button style={styles.validationBadge} onClick={handleClick}>
        {count} anerkjennelse{count !== 1 ? 'r' : ''}
      </button>
      {expanded && (
        <div style={styles.validationList}>
          {loading && <span>Laster...</span>}
          {data?.validationsForArgument?.map((v: { id: string; user: { displayName: string }; validationType: string }) => (
            <div key={v.id} style={styles.validationItem}>
              <span>{v.user.displayName}</span>
              <span style={styles.validationType}>
                {validationTypeLabels[v.validationType] || v.validationType}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ArgumentComment({
  argument: arg,
  questionId,
  isAuthenticated,
  isVerified,
  canAcknowledge,
  justAcknowledged,
  validating,
  onAcknowledge,
  onAddCounterposition,
}: Props) {
  const isPro = arg.argumentType === 'PRO';
  const styles = getStyles(isPro);
  const initial = arg.createdBy?.displayName?.charAt(0)?.toUpperCase() || '?';
  const creditLabel = isPro ? 'mot' : 'for';

  return (
    <>
      <div style={styles.wrapper}>
        <div style={styles.avatar}>{initial}</div>
        <div style={{ flex: 1 }}>
          <div style={styles.bubble}>
            <div style={styles.authorRow}>
              <span style={styles.authorName}>
                {arg.createdBy?.displayName || 'Anonym'}
              </span>
              <span style={styles.sideLabel}>
                {isPro ? 'For' : 'Mot'}
              </span>
            </div>
            <div style={styles.content}>
              {arg.content}
              <StrengthIndicator strength={arg.strength} />
            </div>
            <EvidenceSection
              evidenceLinks={arg.evidenceLinks}
              argumentId={arg.id}
              questionId={questionId}
            />
          </div>

          {/* Action row */}
          <div style={styles.actions}>
            {canAcknowledge && !justAcknowledged && (
              <button
                style={{
                  ...styles.action,
                  ...(validating ? styles.acknowledgeDisabled : {}),
                }}
                onClick={() => onAcknowledge(arg.id)}
                disabled={validating}
                title="A anerkjenne betyr at du har lest og forstatt argumentet — ikke at du er enig."
              >
                ✓ Anerkjenn
                <span style={{ fontSize: '0.68rem', color: '#999', marginLeft: '0.25rem' }}>
                  ({creditLabel}-kreditt)
                </span>
              </button>
            )}
            {justAcknowledged && (
              <span style={{ ...styles.action, ...styles.acknowledgeActive }}>
                ✓ Anerkjent +1
              </span>
            )}
            {isAuthenticated && isVerified && (
              <button
                style={styles.action}
                onClick={() => onAddCounterposition(arg.id, arg.content)}
              >
                + Innvending
              </button>
            )}
          </div>

          <ValidationBadge argumentId={arg.id} count={arg.validationCount} />
        </div>
      </div>

      {/* Counterpositions as sub-comments */}
      {arg.counterpositions.map((cp) => {
        const cpInitial = cp.createdBy?.displayName?.charAt(0)?.toUpperCase() || '?';
        return (
          <div key={cp.id} style={styles.subComment}>
            <div style={styles.subAvatar}>{cpInitial}</div>
            <div style={styles.subBubble}>
              <div style={styles.subLabel}>Innvending</div>
              {cp.content}
              {cp.createdBy && (
                <div style={{ fontSize: '0.68rem', color: '#999', marginTop: '0.15rem' }}>
                  — {cp.createdBy.displayName}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
