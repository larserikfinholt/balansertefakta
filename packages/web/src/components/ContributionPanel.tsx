import { useQuery } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { MY_STATUS, CAN_PUBLISH } from '../lib/queries';

interface Props {
  questionId: string;
  variant?: 'panel' | 'bar';
}

const panelStyles = {
  panel: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.25rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600' as const,
    marginBottom: '0.75rem',
    color: '#1a1a2e',
  },
  loginPrompt: {
    fontSize: '0.9rem',
    color: '#666',
    textAlign: 'center' as const,
    padding: '1rem 0',
  },
  nextStep: {
    fontSize: '0.88rem',
    color: '#333',
    lineHeight: '1.5',
    marginBottom: '0.75rem',
  },
  readyBadge: {
    display: 'inline-block',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600' as const,
    marginBottom: '0.5rem',
  },
  readyPro: {
    background: '#e8f5e9',
    color: '#2e7d32',
  },
  readyContra: {
    background: '#ffebee',
    color: '#c62828',
  },
  progressBar: {
    height: '6px',
    background: '#eee',
    borderRadius: '3px',
    overflow: 'hidden' as const,
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  hint: {
    fontSize: '0.78rem',
    color: '#888',
    lineHeight: '1.3',
    fontStyle: 'italic' as const,
  },
  section: {
    marginBottom: '0.75rem',
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid #eee',
  },
};

const barStyles = {
  bar: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    background: 'white',
    borderTop: '1px solid #e0e0e0',
    boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
    padding: '0.6rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
    zIndex: 100,
  },
  barSegment: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.82rem',
  },
  barLabel: {
    fontWeight: '600' as const,
    fontSize: '0.75rem',
  },
  barProgress: {
    width: '60px',
    height: '4px',
    background: '#eee',
    borderRadius: '2px',
    overflow: 'hidden' as const,
  },
  barProgressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  barReady: {
    fontSize: '0.78rem',
    fontWeight: '600' as const,
    padding: '0.2rem 0.5rem',
    borderRadius: '10px',
  },
  barHint: {
    fontSize: '0.72rem',
    color: '#999',
    maxWidth: '120px',
  },
  barDivider: {
    width: '1px',
    height: '24px',
    background: '#e0e0e0',
  },
  barCredits: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.8rem',
    color: '#666',
    fontWeight: '500' as const,
  },
  loginText: {
    fontSize: '0.82rem',
    color: '#666',
  },
};

export function ContributionPanel({ questionId, variant = 'panel' }: Props) {
  const { isAuthenticated, user } = useAuth();

  const { data: statusData } = useQuery(MY_STATUS, {
    skip: !isAuthenticated,
  });

  const { data: canPublishProData } = useQuery(CAN_PUBLISH, {
    variables: { contentType: 'ARGUMENT', argumentType: 'PRO' },
    skip: !isAuthenticated,
  });

  const { data: canPublishContraData } = useQuery(CAN_PUBLISH, {
    variables: { contentType: 'ARGUMENT', argumentType: 'CONTRA' },
    skip: !isAuthenticated,
  });

  const isVerified = user?.authLevel === 'VERIFIED' || user?.authLevel === 'STRONG_ID';
  const credits = statusData?.myStatus?.validationCredits ?? 0;

  const proPublish = canPublishProData?.canPublish;
  const contraPublish = canPublishContraData?.canPublish;

  const canPro = proPublish?.allowed ?? false;
  const canContra = contraPublish?.allowed ?? false;

  const proOpposing = proPublish?.opposingValidationsCount ?? 0;
  const proRequired = proPublish?.requiredOpposingValidations ?? 2;
  const proCreditsReq = proPublish?.requiredCredits ?? 2;

  const contraOpposing = contraPublish?.opposingValidationsCount ?? 0;
  const contraRequired = contraPublish?.requiredOpposingValidations ?? 2;
  const contraCreditsReq = contraPublish?.requiredCredits ?? 2;

  const proProgress = Math.min(1, (proOpposing / proRequired + credits / proCreditsReq) / 2);
  const contraProgress = Math.min(1, (contraOpposing / contraRequired + credits / contraCreditsReq) / 2);

  // ---- BAR VARIANT ----
  if (variant === 'bar') {
    if (!isAuthenticated) {
      return (
        <div style={barStyles.bar}>
          <span style={barStyles.loginText}>Logg inn for a delta i debatten</span>
        </div>
      );
    }

    if (!isVerified) {
      return (
        <div style={barStyles.bar}>
          <span style={barStyles.loginText}>Verifiser kontoen din for a bidra</span>
        </div>
      );
    }

    const proRemaining = proRequired - proOpposing;
    const contraRemaining = contraRequired - contraOpposing;

    return (
      <div style={barStyles.bar}>
        {/* PRO segment */}
        <div style={barStyles.barSegment}>
          <span style={{ ...barStyles.barLabel, color: '#2e7d32' }}>For</span>
          {canPro ? (
            <span style={{ ...barStyles.barReady, background: '#e8f5e9', color: '#2e7d32' }}>
              Klar
            </span>
          ) : (
            <>
              <div style={barStyles.barProgress}>
                <div style={{ ...barStyles.barProgressFill, width: `${proProgress * 100}%`, background: '#4caf50' }} />
              </div>
              <span style={barStyles.barHint}>
                {proRemaining > 0 ? `${proRemaining} mot-arg.` : ''}
              </span>
            </>
          )}
        </div>

        <div style={barStyles.barDivider} />

        {/* Credits */}
        <div style={barStyles.barCredits}>
          <span>{credits}</span>
          <span style={{ fontSize: '0.72rem', color: '#999' }}>kreditter</span>
        </div>

        <div style={barStyles.barDivider} />

        {/* CONTRA segment */}
        <div style={barStyles.barSegment}>
          <span style={{ ...barStyles.barLabel, color: '#c62828' }}>Mot</span>
          {canContra ? (
            <span style={{ ...barStyles.barReady, background: '#ffebee', color: '#c62828' }}>
              Klar
            </span>
          ) : (
            <>
              <div style={barStyles.barProgress}>
                <div style={{ ...barStyles.barProgressFill, width: `${contraProgress * 100}%`, background: '#ef5350' }} />
              </div>
              <span style={barStyles.barHint}>
                {contraRemaining > 0 ? `${contraRemaining} for-arg.` : ''}
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  // ---- PANEL VARIANT (original) ----
  if (!isAuthenticated) {
    return (
      <div style={panelStyles.panel}>
        <div style={panelStyles.title}>Delta i debatten</div>
        <div style={panelStyles.loginPrompt}>
          Logg inn for a bidra med argumenter og kilder.
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div style={panelStyles.panel}>
        <div style={panelStyles.title}>Delta i debatten</div>
        <div style={panelStyles.loginPrompt}>
          Du trenger en verifisert konto for a bidra.
        </div>
      </div>
    );
  }

  const getNextStepText = (
    side: 'pro' | 'contra',
    canPublish: boolean,
    opposing: number,
    required: number,
    creditsNeeded: number,
  ) => {
    if (canPublish) return null;
    const opposingLabel = side === 'pro' ? 'mot' : 'for';
    const remaining = required - opposing;
    const creditShortfall = creditsNeeded - credits;

    if (remaining > 0 && creditShortfall > 0) {
      return `Anerkjenn ${remaining} ${opposingLabel}-argument${remaining > 1 ? 'er' : ''} til for a lase opp`;
    }
    if (remaining > 0) {
      return `Anerkjenn ${remaining} ${opposingLabel}-argument${remaining > 1 ? 'er' : ''} til`;
    }
    if (creditShortfall > 0) {
      return `Du trenger ${creditShortfall} kreditt${creditShortfall > 1 ? 'er' : ''} til`;
    }
    return null;
  };

  return (
    <div style={panelStyles.panel}>
      <div style={panelStyles.title}>Delta i debatten</div>

      {/* PRO side */}
      <div style={{ ...panelStyles.section, borderColor: canPro ? '#c5e1a5' : '#eee' }}>
        {canPro ? (
          <div style={{ ...panelStyles.readyBadge, ...panelStyles.readyPro }}>
            Klar til a legge til for-argument
          </div>
        ) : (
          <>
            <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#2e7d32', marginBottom: '0.4rem' }}>
              For-argument
            </div>
            <div style={panelStyles.progressBar}>
              <div style={{ ...panelStyles.progressFill, width: `${proProgress * 100}%`, background: '#4caf50' }} />
            </div>
            <div style={panelStyles.nextStep}>
              {getNextStepText('pro', canPro, proOpposing, proRequired, proCreditsReq)}
            </div>
          </>
        )}
      </div>

      {/* CONTRA side */}
      <div style={{ ...panelStyles.section, borderColor: canContra ? '#ef9a9a' : '#eee' }}>
        {canContra ? (
          <div style={{ ...panelStyles.readyBadge, ...panelStyles.readyContra }}>
            Klar til a legge til mot-argument
          </div>
        ) : (
          <>
            <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#c62828', marginBottom: '0.4rem' }}>
              Mot-argument
            </div>
            <div style={panelStyles.progressBar}>
              <div style={{ ...panelStyles.progressFill, width: `${contraProgress * 100}%`, background: '#ef5350' }} />
            </div>
            <div style={panelStyles.nextStep}>
              {getNextStepText('contra', canContra, contraOpposing, contraRequired, contraCreditsReq)}
            </div>
          </>
        )}
      </div>

      <div style={panelStyles.hint}>
        Trykk "Anerkjenn" pa argumenter fra den andre siden for a lase opp publisering.
      </div>
    </div>
  );
}
