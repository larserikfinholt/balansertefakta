import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import {
  GET_QUESTION,
  GET_UNVALIDATED_OPPOSING_ARGUMENTS,
  CREATE_VALIDATION,
  MY_STATUS,
  CAN_PUBLISH,
} from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { type EvidenceLinkWithArtifact } from '../components/EvidenceSection';
import { ContributionPanel } from '../components/ContributionPanel';
import { CreateClaimModal } from '../components/CreateClaimModal';
import { CreateArgumentModal } from '../components/CreateArgumentModal';
import { CreateCounterpositionModal } from '../components/CreateCounterpositionModal';
import { RelatedQuestions } from '../components/RelatedQuestions';
import { PostCard } from '../components/PostCard';
import { useIsMobile } from '../hooks/useIsMobile';

interface Counterposition {
  id: string;
  content: string;
  createdBy?: { id: string; displayName: string } | null;
}

interface CreatedBy {
  id: string;
  displayName: string;
}

interface Argument {
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

interface Claim {
  id: string;
  statement: string;
  claimType: string;
  status: string;
  isBalanced: boolean;
  proArgumentCount: number;
  contraArgumentCount: number;
  createdBy: CreatedBy | null;
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
  subtopic: {
    id: string;
  };
  claims: QuestionClaim[];
}

const getStyles = (isMobile: boolean) => ({
  page: {
    background: '#f0f2f5',
    minHeight: '100vh',
    paddingBottom: '5rem',
  },
  breadcrumb: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0.75rem 1rem 0.5rem',
    color: '#666',
    fontSize: '0.85rem',
  },
  breadcrumbLink: {
    color: '#1a1a2e',
    textDecoration: 'none',
  },
  // Page header banner
  pageHeader: {
    maxWidth: '900px',
    margin: '0 auto 1.5rem auto',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: isMobile ? '0' : '0 0 12px 12px',
    padding: isMobile ? '1.5rem 1rem' : '2rem 2.5rem',
    color: 'white',
    position: 'relative' as const,
  },
  headerTitle: {
    fontSize: isMobile ? '1.4rem' : '1.75rem',
    fontWeight: '700' as const,
    marginBottom: '0.5rem',
    lineHeight: '1.3',
    margin: 0,
    paddingRight: '3rem',
  },
  headerDescription: {
    fontSize: '0.95rem',
    opacity: 0.85,
    marginBottom: '1rem',
    maxWidth: '600px',
    lineHeight: '1.5',
    margin: '0.5rem 0 1rem 0',
  },
  headerStats: {
    display: 'flex',
    gap: isMobile ? '1rem' : '1.5rem',
    fontSize: '0.85rem',
    opacity: 0.75,
    flexWrap: 'wrap' as const,
  },
  statValue: {
    fontWeight: '700' as const,
    fontSize: '1.1rem',
    display: 'block',
  },
  balanceBadge: {
    position: 'absolute' as const,
    top: isMobile ? '1rem' : '1.5rem',
    right: isMobile ? '1rem' : '2rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600' as const,
  },
  balanced: {
    background: 'rgba(212, 237, 218, 0.9)',
    color: '#155724',
  },
  unbalanced: {
    background: 'rgba(255, 243, 205, 0.9)',
    color: '#856404',
  },
  // Feed
  feedContainer: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: isMobile ? '0 0.5rem' : '0',
  },
  addPostButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.85rem 1rem',
    background: 'white',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    fontSize: '0.9rem',
    color: '#666',
    cursor: 'pointer',
    marginBottom: '1rem',
    textAlign: 'left' as const,
  },
  addPostAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#e3f2fd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1565c0',
    fontWeight: '600' as const,
    flexShrink: 0,
  },
  emptyFeed: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#999',
    fontSize: '0.95rem',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#666',
    fontSize: '0.95rem',
  },
});

export function QuestionPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const isMobile = useIsMobile();
  const styles = getStyles(isMobile);

  // Modal states
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showArgumentModal, setShowArgumentModal] = useState<{
    claimId: string;
    type: 'PRO' | 'CONTRA';
  } | null>(null);
  const [showCounterpositionModal, setShowCounterpositionModal] = useState<{
    argumentId: string;
    argumentContent: string;
  } | null>(null);

  // Validation state
  const [justValidated, setJustValidated] = useState<Set<string>>(new Set());

  const { data, loading, error } = useQuery<{ question: Question | null }>(GET_QUESTION, {
    variables: { id },
  });

  // Fetch unvalidated opposing arguments for BOTH sides
  const { data: unvalidatedForPro, refetch: refetchPro } = useQuery(
    GET_UNVALIDATED_OPPOSING_ARGUMENTS,
    {
      variables: { questionId: id!, argumentType: 'PRO' },
      skip: !isAuthenticated,
    }
  );
  const { data: unvalidatedForContra, refetch: refetchContra } = useQuery(
    GET_UNVALIDATED_OPPOSING_ARGUMENTS,
    {
      variables: { questionId: id!, argumentType: 'CONTRA' },
      skip: !isAuthenticated,
    }
  );

  // Check publish status for both sides
  const { data: canPublishProData } = useQuery(CAN_PUBLISH, {
    variables: { contentType: 'ARGUMENT', argumentType: 'PRO' },
    skip: !isAuthenticated,
  });
  const { data: canPublishContraData } = useQuery(CAN_PUBLISH, {
    variables: { contentType: 'ARGUMENT', argumentType: 'CONTRA' },
    skip: !isAuthenticated,
  });

  // Create validation mutation
  const [createValidation, { loading: validating }] = useMutation(CREATE_VALIDATION, {
    refetchQueries: [
      { query: MY_STATUS },
      { query: GET_QUESTION, variables: { id } },
      { query: CAN_PUBLISH, variables: { contentType: 'ARGUMENT', argumentType: 'PRO' } },
      { query: CAN_PUBLISH, variables: { contentType: 'ARGUMENT', argumentType: 'CONTRA' } },
    ],
    onCompleted: () => {
      refetchPro();
      refetchContra();
    },
  });

  if (loading) return <div style={styles.loading}>Laster sporsmal...</div>;
  if (error) return <div style={styles.loading}>Feil: {error.message}</div>;
  if (!data?.question) return <div style={styles.loading}>Sporsmal ikke funnet</div>;

  const { question } = data;
  const isVerified = user?.authLevel === 'VERIFIED' || user?.authLevel === 'STRONG_ID';

  // Merge unvalidated IDs from both sides
  const unvalidatedIds = new Set([
    ...(unvalidatedForPro?.unvalidatedOpposingArguments ?? []).map((a: { id: string }) => a.id),
    ...(unvalidatedForContra?.unvalidatedOpposingArguments ?? []).map((a: { id: string }) => a.id),
  ]);

  // Publish status per side
  const proPublish = canPublishProData?.canPublish;
  const contraPublish = canPublishContraData?.canPublish;
  const canPublishPro = proPublish?.allowed ?? false;
  const canPublishContra = contraPublish?.allowed ?? false;

  const handleAcknowledge = (argumentId: string) => {
    createValidation({
      variables: {
        input: {
          argumentId,
          validationType: 'CONFIRMED',
          comment: 'Anerkjent via innholdsvisning',
        },
      },
    }).then(() => {
      setJustValidated((prev) => new Set(prev).add(argumentId));
    });
  };

  // Computed stats
  const totalClaims = question.claims.length;
  const totalArgs = question.claims.reduce(
    (sum, qc) => sum + qc.claim.arguments.length,
    0
  );
  const totalEvidence = question.claims.reduce(
    (sum, qc) => sum + qc.claim.arguments.reduce((s, a) => s + a.evidenceLinks.length, 0),
    0
  );

  const userInitial = user?.displayName?.charAt(0)?.toUpperCase() || '?';

  return (
    <div style={styles.page}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Link to="/" style={styles.breadcrumbLink}>Hjem</Link>
        {' '}/{' '}Sporsmal
      </div>

      {/* Page Header Banner */}
      <div style={styles.pageHeader}>
        <span style={{
          ...styles.balanceBadge,
          ...(question.isBalanced ? styles.balanced : styles.unbalanced),
        }}>
          {question.isBalanced ? '⚖️ Balansert' : '⚠️ Ubalansert'}
        </span>

        <h1 style={styles.headerTitle}>{question.title}</h1>

        {question.description && (
          <p style={styles.headerDescription}>{question.description}</p>
        )}

        <div style={styles.headerStats}>
          <span>
            <span style={styles.statValue}>{totalClaims}</span>
            {totalClaims === 1 ? 'pastand' : 'pastander'}
          </span>
          <span>
            <span style={styles.statValue}>{totalArgs}</span>
            {totalArgs === 1 ? 'argument' : 'argumenter'}
          </span>
          <span>
            <span style={styles.statValue}>{totalEvidence}</span>
            {totalEvidence === 1 ? 'kilde' : 'kilder'}
          </span>
        </div>
      </div>

      {/* Feed */}
      <div style={styles.feedContainer}>
        {/* Add claim prompt */}
        {isAuthenticated && isVerified && (
          <button style={styles.addPostButton} onClick={() => setShowClaimModal(true)}>
            <div style={styles.addPostAvatar}>{userInitial}</div>
            <span>Legg til en ny pastand...</span>
          </button>
        )}

        {/* Claim posts */}
        {question.claims.map(({ claim }) => (
          <PostCard
            key={claim.id}
            claim={claim}
            questionId={question.id}
            isAuthenticated={isAuthenticated}
            isVerified={isVerified}
            canPublishPro={canPublishPro}
            canPublishContra={canPublishContra}
            proPublish={proPublish}
            contraPublish={contraPublish}
            unvalidatedIds={unvalidatedIds}
            justValidated={justValidated}
            validating={validating}
            isMobile={isMobile}
            onAcknowledge={handleAcknowledge}
            onAddArgument={(claimId, type) => setShowArgumentModal({ claimId, type })}
            onAddCounterposition={(argumentId, argumentContent) =>
              setShowCounterpositionModal({ argumentId, argumentContent })
            }
          />
        ))}

        {question.claims.length === 0 && (
          <div style={styles.emptyFeed}>
            Ingen pastander knyttet til dette sporsmalet enna.
          </div>
        )}

        {/* Related Questions */}
        <RelatedQuestions
          subtopicId={question.subtopic.id}
          currentQuestionId={question.id}
          variant="horizontal"
        />
      </div>

      {/* Contribution Bar */}
      <ContributionPanel questionId={question.id} variant="bar" />

      {/* Modals */}
      {showClaimModal && (
        <CreateClaimModal questionId={question.id} onClose={() => setShowClaimModal(false)} />
      )}

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
