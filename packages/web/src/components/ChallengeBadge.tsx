import { CSSProperties } from 'react';

type ChallengeStatus = 'OPEN' | 'DISCUSSED' | 'ACKNOWLEDGED' | 'RETRACTED' | 'FLAGGED';

interface ChallengeBadgeProps {
  status: ChallengeStatus | string;
  responseCount?: number;
  compact?: boolean;
}

const baseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  padding: '0.125rem 0.5rem',
  borderRadius: '10px',
  fontSize: '0.75rem',
  fontWeight: 500,
};

const statusStyles: Record<ChallengeStatus, CSSProperties> = {
  OPEN: {
    background: '#fff3cd',
    color: '#856404',
  },
  DISCUSSED: {
    background: '#ffe5d0',
    color: '#c44d00',
  },
  ACKNOWLEDGED: {
    background: '#f8d7da',
    color: '#721c24',
  },
  RETRACTED: {
    background: '#e9ecef',
    color: '#6c757d',
    textDecoration: 'line-through',
  },
  FLAGGED: {
    background: '#dc3545',
    color: '#fff',
    fontWeight: 600,
  },
};

const statusLabels: Record<ChallengeStatus, string> = {
  OPEN: 'Bestridt',
  DISCUSSED: 'Bestridt (under diskusjon)',
  ACKNOWLEDGED: 'Bestridt (anerkjent)',
  RETRACTED: 'Tilbaketrukket',
  FLAGGED: 'Feil flagget',
};

const compactLabels: Record<ChallengeStatus, string> = {
  OPEN: 'Bestridt',
  DISCUSSED: 'Diskutert',
  ACKNOWLEDGED: 'Anerkjent',
  RETRACTED: 'Tilbaketrukket',
  FLAGGED: 'Flagget',
};

export function ChallengeBadge({ status, responseCount, compact = false }: ChallengeBadgeProps) {
  const normalizedStatus = status as ChallengeStatus;
  const style = statusStyles[normalizedStatus] || statusStyles.OPEN;
  const labels = compact ? compactLabels : statusLabels;
  const label = labels[normalizedStatus] || 'Bestridt';

  return (
    <span style={{ ...baseStyle, ...style }}>
      {label}
      {responseCount !== undefined && responseCount > 0 && (
        <span style={{
          background: 'rgba(0,0,0,0.15)',
          padding: '0 0.25rem',
          borderRadius: '8px',
          fontSize: '0.7rem',
        }}>
          {responseCount}
        </span>
      )}
    </span>
  );
}

// Challenge type labels in Norwegian
export const challengeTypeLabels: Record<string, string> = {
  MISQUOTE: 'Feilsitering',
  CHERRY_PICKING: 'Selektiv bruk',
  OUT_OF_CONTEXT: 'Tatt ut av kontekst',
  OUTDATED: 'Utdatert',
  METHODOLOGY: 'Metodefeil',
  CONFLICT_OF_INTEREST: 'Interessekonflikt',
  RELEVANCE: 'Ikke relevant',
};

// Support strength labels
export const strengthLabels: Record<string, string> = {
  STRONGLY_SUPPORTS: 'Sterk',
  SUPPORTS: 'Støtter',
  WEAKLY_SUPPORTS: 'Svak',
  NEUTRAL: 'Nøytral',
  CONTRADICTS: 'Motsier',
};
