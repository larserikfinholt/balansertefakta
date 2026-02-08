import { useQuery } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { MY_STATUS, CAN_PUBLISH } from '../lib/queries';

interface Props {
  questionId: string;
}

const styles = {
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
  intro: {
    fontSize: '0.8rem',
    color: '#666',
    marginBottom: '1rem',
    lineHeight: '1.4',
  },
  loginPrompt: {
    fontSize: '0.9rem',
    color: '#666',
    textAlign: 'center' as const,
    padding: '1rem 0',
  },
  sideSection: {
    marginBottom: '1rem',
    padding: '0.75rem',
    borderRadius: '6px',
  },
  proSection: {
    background: '#f1f8e9',
    border: '1px solid #c5e1a5',
  },
  contraSection: {
    background: '#fce4ec',
    border: '1px solid #ef9a9a',
  },
  sideTitle: {
    fontSize: '0.85rem',
    fontWeight: '600' as const,
    marginBottom: '0.5rem',
  },
  progressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.2rem 0',
    fontSize: '0.8rem',
    color: '#333',
  },
  progressLabel: {
    color: '#666',
    fontSize: '0.78rem',
  },
  progressDone: {
    color: '#2e7d32',
    fontWeight: '600' as const,
    fontSize: '0.78rem',
  },
  progressPending: {
    color: '#c62828',
    fontWeight: '600' as const,
    fontSize: '0.78rem',
  },
  statusReady: {
    fontSize: '0.78rem',
    color: '#2e7d32',
    fontWeight: '600' as const,
    marginTop: '0.3rem',
  },
  statusNotReady: {
    fontSize: '0.78rem',
    color: '#999',
    marginTop: '0.3rem',
  },
  hint: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '0.75rem',
    lineHeight: '1.3',
    fontStyle: 'italic' as const,
  },
};

export function ContributionPanel({ questionId }: Props) {
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

  if (!isAuthenticated) {
    return (
      <div style={styles.panel}>
        <div style={styles.title}>Delta i debatten</div>
        <div style={styles.loginPrompt}>
          Logg inn for a bidra med argumenter og kilder.
        </div>
      </div>
    );
  }

  const isVerified = user?.authLevel === 'VERIFIED' || user?.authLevel === 'STRONG_ID';
  const credits = statusData?.myStatus?.validationCredits ?? 0;

  const proPublish = canPublishProData?.canPublish;
  const contraPublish = canPublishContraData?.canPublish;

  const proOpposing = proPublish?.opposingValidationsCount ?? 0;
  const proRequired = proPublish?.requiredOpposingValidations ?? 2;
  const proCreditsReq = proPublish?.requiredCredits ?? 2;
  const canPro = proPublish?.allowed ?? false;

  const contraOpposing = contraPublish?.opposingValidationsCount ?? 0;
  const contraRequired = contraPublish?.requiredOpposingValidations ?? 2;
  const contraCreditsReq = contraPublish?.requiredCredits ?? 2;
  const canContra = contraPublish?.allowed ?? false;

  return (
    <div style={styles.panel}>
      <div style={styles.title}>Delta i debatten</div>

      {!isVerified && (
        <div style={styles.loginPrompt}>
          Du trenger en verifisert konto for a bidra.
        </div>
      )}

      {isVerified && (
        <>
          <div style={styles.intro}>
            For a publisere argumenter ma du forst anerkjenne motsidens argumenter.
            Dette sikrer at alle leser og forstar begge sider.
          </div>

          {/* PRO publish status */}
          <div style={{ ...styles.sideSection, ...styles.proSection }}>
            <div style={{ ...styles.sideTitle, color: '#2e7d32' }}>
              Publisere for-argument
            </div>
            <div style={styles.progressRow}>
              <span style={styles.progressLabel}>Mot-anerkjennelser</span>
              <span style={proOpposing >= proRequired ? styles.progressDone : styles.progressPending}>
                {proOpposing}/{proRequired}
              </span>
            </div>
            <div style={styles.progressRow}>
              <span style={styles.progressLabel}>Kreditter</span>
              <span style={credits >= proCreditsReq ? styles.progressDone : styles.progressPending}>
                {credits}/{proCreditsReq}
              </span>
            </div>
            {canPro ? (
              <div style={styles.statusReady}>Klar til publisering</div>
            ) : (
              <div style={styles.statusNotReady}>Ikke klar</div>
            )}
          </div>

          {/* CONTRA publish status */}
          <div style={{ ...styles.sideSection, ...styles.contraSection }}>
            <div style={{ ...styles.sideTitle, color: '#c62828' }}>
              Publisere mot-argument
            </div>
            <div style={styles.progressRow}>
              <span style={styles.progressLabel}>For-anerkjennelser</span>
              <span style={contraOpposing >= contraRequired ? styles.progressDone : styles.progressPending}>
                {contraOpposing}/{contraRequired}
              </span>
            </div>
            <div style={styles.progressRow}>
              <span style={styles.progressLabel}>Kreditter</span>
              <span style={credits >= contraCreditsReq ? styles.progressDone : styles.progressPending}>
                {credits}/{contraCreditsReq}
              </span>
            </div>
            {canContra ? (
              <div style={styles.statusReady}>Klar til publisering</div>
            ) : (
              <div style={styles.statusNotReady}>Ikke klar</div>
            )}
          </div>

          <div style={styles.hint}>
            Trykk "Anerkjenn" pa argumenter i innholdet for a tjene kreditter.
            A anerkjenne betyr at du har lest og forstatt argumentet — ikke at du er enig.
          </div>
        </>
      )}
    </div>
  );
}
