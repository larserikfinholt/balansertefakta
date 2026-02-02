import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import { GET_QUESTION } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { EvidenceSection, type EvidenceLinkWithArtifact } from '../components/EvidenceSection';
import { MaturityChecklist } from '../components/MaturityChecklist';
import { ScopeBadge, type ScopeData } from '../components/ScopeBadge';
import { ScopeEditor } from '../components/ScopeEditor';
import { DisagreementList, type Disagreement } from '../components/DisagreementList';
import { AddDisagreementModal } from '../components/AddDisagreementModal';
import { MeasureCard } from '../components/MeasureCard';
import { UserStancePanel } from '../components/UserStancePanel';
import { StanceDistribution } from '../components/StanceDistribution';
import { QuestionSummary } from '../components/QuestionSummary';
import { CreateClaimModal } from '../components/CreateClaimModal';
import { CreateArgumentModal } from '../components/CreateArgumentModal';
import { CreateCounterpositionModal } from '../components/CreateCounterpositionModal';

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
    marginBottom: '1.5rem',
    color: '#666',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    marginBottom: '0.5rem',
    marginRight: '0.5rem',
  },
  balanced: {
    background: '#d4edda',
    color: '#155724',
  },
  unbalanced: {
    background: '#fff3cd',
    color: '#856404',
  },
  headerSection: {
    marginBottom: '1.5rem',
  },
  scopeRow: {
    marginTop: '0.5rem',
    marginBottom: '1rem',
  },
  twoColumnLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '1.5rem',
  },
  mainContent: {
    minWidth: 0,
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    color: '#1a1a2e',
    margin: 0,
  },
  addButton: {
    padding: '0.5rem 1rem',
    background: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  claimCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  claimHeader: {
    marginBottom: '1rem',
  },
  claimStatement: {
    fontSize: '1.1rem',
    fontWeight: '500' as const,
    marginBottom: '0.5rem',
  },
  claimMeta: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  claimTypeBadge: {
    padding: '0.15rem 0.5rem',
    background: '#e3f2fd',
    color: '#1565c0',
    borderRadius: '4px',
    fontSize: '0.75rem',
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
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  columnTitle: {
    fontWeight: '600' as const,
    fontSize: '0.9rem',
    textTransform: 'uppercase' as const,
  },
  columnAddButton: {
    padding: '0.2rem 0.5rem',
    background: 'transparent',
    border: '1px solid currentColor',
    borderRadius: '4px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    opacity: 0.7,
  },
  argument: {
    padding: '0.75rem',
    background: 'white',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
  },
  argumentContent: {
    marginBottom: '0.25rem',
  },
  strengthIndicator: {
    display: 'inline-flex',
    gap: '2px',
    marginLeft: '0.5rem',
    verticalAlign: 'middle',
  },
  strengthBar: {
    width: '4px',
    height: '12px',
    borderRadius: '2px',
  },
  counterposition: {
    marginTop: '0.5rem',
    paddingLeft: '1rem',
    borderLeft: '2px solid #ccc',
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic' as const,
  },
  counterpositionButton: {
    fontSize: '0.7rem',
    color: '#666',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem 0',
    marginTop: '0.25rem',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666',
  },
  stats: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.85rem',
    color: '#666',
  },
  emptyState: {
    padding: '0.75rem',
    background: 'white',
    borderRadius: '4px',
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic' as const,
  },
};

const claimTypeLabels: Record<string, string> = {
  EMPIRICAL: 'Empirisk',
  CAUSAL: 'Kausal',
  PROGNOSTIC: 'Prognostisk',
  NORMATIVE: 'Normativ',
  DEFINITIONAL: 'Definitorisk',
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
  scope: ScopeData | null;
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
  scope: ScopeData | null;
  arguments: Argument[];
}

interface QuestionClaim {
  id: string;
  claim: Claim;
}

interface MeasureArgument {
  id: string;
  content: string;
  argumentType: 'PRO' | 'CONTRA';
  strength: string;
  counterpositions: Counterposition[];
  evidenceLinks: EvidenceLinkWithArtifact[];
}

interface Measure {
  id: string;
  title: string;
  description: string | null;
  rationale: string | null;
  status: string;
  isBalanced: boolean;
  proArgumentCount: number;
  contraArgumentCount: number;
  arguments: MeasureArgument[];
}

interface QuestionMeasure {
  id: string;
  measure: Measure;
}

interface MaturityChecklistData {
  hasScope: boolean;
  hasDisagreementAxis: boolean;
  hasProArguments: boolean;
  hasContraArguments: boolean;
  hasSupportingEvidence: boolean;
  hasChallengingEvidence: boolean;
  completenessScore: number;
}

interface Question {
  id: string;
  title: string;
  description: string | null;
  status: string;
  isBalanced: boolean;
  maturityChecklist: MaturityChecklistData;
  scope: ScopeData | null;
  disagreements: Disagreement[];
  claims: QuestionClaim[];
  measures: QuestionMeasure[];
}

function StrengthIndicator({ strength }: { strength: string }) {
  const levels = strength === 'HIGH' ? 3 : strength === 'MEDIUM' ? 2 : 1;
  const color = strength === 'HIGH' ? '#28a745' : strength === 'MEDIUM' ? '#ffc107' : '#6c757d';
  const label = strength === 'HIGH' ? 'Sterk' : strength === 'MEDIUM' ? 'Middels' : 'Svak';

  return (
    <span style={styles.strengthIndicator} title={`Styrke: ${label}`}>
      {[1, 2, 3].map((level) => (
        <span
          key={level}
          style={{
            ...styles.strengthBar,
            background: level <= levels ? color : '#e0e0e0',
          }}
        />
      ))}
    </span>
  );
}

export function QuestionPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [hasSubmittedStance, setHasSubmittedStance] = useState(false);

  // Modal states
  const [showScopeEditor, setShowScopeEditor] = useState(false);
  const [showDisagreementModal, setShowDisagreementModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showArgumentModal, setShowArgumentModal] = useState<{
    claimId: string;
    type: 'PRO' | 'CONTRA';
  } | null>(null);
  const [showCounterpositionModal, setShowCounterpositionModal] = useState<{
    argumentId: string;
    argumentContent: string;
  } | null>(null);

  const { data, loading, error } = useQuery<{ question: Question | null }>(GET_QUESTION, {
    variables: { id },
  });

  if (loading) return <div style={styles.loading}>Laster sporsmal...</div>;
  if (error) return <div style={styles.loading}>Feil: {error.message}</div>;
  if (!data?.question) return <div style={styles.loading}>Sporsmal ikke funnet</div>;

  const { question } = data;
  const isVerified = user?.authLevel === 'VERIFIED' || user?.authLevel === 'STRONG_ID';

  return (
    <div>
      <div style={styles.breadcrumb}>
        <Link to="/" style={styles.breadcrumbLink}>
          Hjem
        </Link>{' '}
        / Sporsmal
      </div>

      {/* Question Summary - at top if exists */}
      <QuestionSummary questionId={question.id} />

      <div style={styles.twoColumnLayout}>
        <div style={styles.mainContent}>
          <div style={styles.headerSection}>
            <h1 style={styles.title}>{question.title}</h1>

            <div>
              <span style={{ ...styles.statusBadge, ...(question.isBalanced ? styles.balanced : styles.unbalanced) }}>
                {question.isBalanced ? '⚖️ Balansert' : '⚠️ Trenger motposisjon'}
              </span>
            </div>

            <div style={styles.scopeRow}>
              <ScopeBadge
                scope={question.scope}
                showEditButton={isAuthenticated && isVerified}
                onEdit={() => setShowScopeEditor(true)}
              />
            </div>

            {question.description && <p style={styles.description}>{question.description}</p>}
          </div>

          {/* Disagreement Analysis */}
          <DisagreementList
            disagreements={question.disagreements}
            showAddButton={isAuthenticated && isVerified}
            onAddDisagreement={() => setShowDisagreementModal(true)}
          />

          {/* Claims Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Pastander</h2>
              {isAuthenticated && isVerified && (
                <button style={styles.addButton} onClick={() => setShowClaimModal(true)}>
                  + Legg til pastand
                </button>
              )}
            </div>

            {question.claims.map(({ claim }) => (
              <div key={claim.id} style={styles.claimCard}>
                <div style={styles.claimHeader}>
                  <div style={styles.claimStatement}>{claim.statement}</div>
                  <div style={styles.claimMeta}>
                    <span style={styles.claimTypeBadge}>{claimTypeLabels[claim.claimType] || claim.claimType}</span>
                    <span style={styles.stats}>
                      <span>Pro: {claim.proArgumentCount}</span>
                      <span>Contra: {claim.contraArgumentCount}</span>
                    </span>
                    <span style={claim.isBalanced ? styles.balanced : styles.unbalanced}>
                      {claim.isBalanced ? '⚖️' : '⚠️'}
                    </span>
                  </div>
                  {claim.scope && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <ScopeBadge scope={claim.scope} />
                    </div>
                  )}
                </div>

                <div style={styles.argumentsContainer}>
                  <div style={{ ...styles.argumentsColumn, ...styles.proColumn }}>
                    <div style={styles.columnHeader}>
                      <span style={styles.columnTitle}>✓ For-argumenter</span>
                      {isAuthenticated && isVerified && (
                        <button
                          style={{ ...styles.columnAddButton, color: '#155724' }}
                          onClick={() => setShowArgumentModal({ claimId: claim.id, type: 'PRO' })}
                        >
                          + Legg til
                        </button>
                      )}
                    </div>
                    {claim.arguments
                      .filter((arg) => arg.argumentType === 'PRO')
                      .map((arg) => (
                        <div key={arg.id} style={styles.argument}>
                          <div style={styles.argumentContent}>
                            {arg.content}
                            <StrengthIndicator strength={arg.strength} />
                          </div>
                          {arg.scope && (
                            <div style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                              <ScopeBadge scope={arg.scope} />
                            </div>
                          )}
                          {arg.counterpositions.map((cp) => (
                            <div key={cp.id} style={styles.counterposition}>
                              Motposisjon: {cp.content}
                            </div>
                          ))}
                          {isAuthenticated && isVerified && (
                            <button
                              style={styles.counterpositionButton}
                              onClick={() =>
                                setShowCounterpositionModal({ argumentId: arg.id, argumentContent: arg.content })
                              }
                            >
                              + Motposisjon
                            </button>
                          )}
                          <EvidenceSection
                            evidenceLinks={arg.evidenceLinks}
                            argumentId={arg.id}
                            questionId={question.id}
                          />
                        </div>
                      ))}
                    {claim.arguments.filter((a) => a.argumentType === 'PRO').length === 0 && (
                      <div style={styles.emptyState}>Ingen for-argumenter enna</div>
                    )}
                  </div>

                  <div style={{ ...styles.argumentsColumn, ...styles.contraColumn }}>
                    <div style={styles.columnHeader}>
                      <span style={styles.columnTitle}>✗ Mot-argumenter</span>
                      {isAuthenticated && isVerified && (
                        <button
                          style={{ ...styles.columnAddButton, color: '#721c24' }}
                          onClick={() => setShowArgumentModal({ claimId: claim.id, type: 'CONTRA' })}
                        >
                          + Legg til
                        </button>
                      )}
                    </div>
                    {claim.arguments
                      .filter((arg) => arg.argumentType === 'CONTRA')
                      .map((arg) => (
                        <div key={arg.id} style={styles.argument}>
                          <div style={styles.argumentContent}>
                            {arg.content}
                            <StrengthIndicator strength={arg.strength} />
                          </div>
                          {arg.scope && (
                            <div style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                              <ScopeBadge scope={arg.scope} />
                            </div>
                          )}
                          {arg.counterpositions.map((cp) => (
                            <div key={cp.id} style={styles.counterposition}>
                              Motposisjon: {cp.content}
                            </div>
                          ))}
                          {isAuthenticated && isVerified && (
                            <button
                              style={styles.counterpositionButton}
                              onClick={() =>
                                setShowCounterpositionModal({ argumentId: arg.id, argumentContent: arg.content })
                              }
                            >
                              + Motposisjon
                            </button>
                          )}
                          <EvidenceSection
                            evidenceLinks={arg.evidenceLinks}
                            argumentId={arg.id}
                            questionId={question.id}
                          />
                        </div>
                      ))}
                    {claim.arguments.filter((a) => a.argumentType === 'CONTRA').length === 0 && (
                      <div style={styles.emptyState}>Ingen mot-argumenter enna</div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {question.claims.length === 0 && (
              <p style={styles.description}>Ingen pastander knyttet til dette sporsmalet enna.</p>
            )}
          </div>

          {/* Measures Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Tiltak</h2>
              {isAuthenticated && isVerified && (
                <button style={styles.addButton}>+ Legg til tiltak</button>
              )}
            </div>

            {question.measures.map(({ measure }) => (
              <MeasureCard key={measure.id} measure={measure} questionId={question.id} />
            ))}

            {question.measures.length === 0 && <p style={styles.description}>Ingen tiltak foreslatt enna.</p>}
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <MaturityChecklist checklist={question.maturityChecklist} />
          <UserStancePanel questionId={question.id} onStanceSubmitted={() => setHasSubmittedStance(true)} />
          <StanceDistribution questionId={question.id} show={hasSubmittedStance} />
        </div>
      </div>

      {/* Modals */}
      {showScopeEditor && (
        <ScopeEditor
          questionId={question.id}
          currentScope={question.scope}
          onClose={() => setShowScopeEditor(false)}
        />
      )}

      {showDisagreementModal && (
        <AddDisagreementModal questionId={question.id} onClose={() => setShowDisagreementModal(false)} />
      )}

      {showClaimModal && <CreateClaimModal questionId={question.id} onClose={() => setShowClaimModal(false)} />}

      {showArgumentModal && (
        <CreateArgumentModal
          claimId={showArgumentModal.claimId}
          argumentType={showArgumentModal.type}
          questionId={question.id}
          onClose={() => setShowArgumentModal(null)}
        />
      )}

      {showCounterpositionModal && (
        <CreateCounterpositionModal
          argumentId={showCounterpositionModal.argumentId}
          argumentContent={showCounterpositionModal.argumentContent}
          questionId={question.id}
          onClose={() => setShowCounterpositionModal(null)}
        />
      )}
    </div>
  );
}
