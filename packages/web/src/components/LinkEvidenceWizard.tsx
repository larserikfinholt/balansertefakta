import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_ARTIFACT, CREATE_EXTRACT, LINK_EVIDENCE, GET_QUESTION } from '../lib/queries';
import { useAuth } from '../context/AuthContext';

interface Props {
  claimId?: string;
  argumentId?: string;
  measureId?: string;
  counterpositionId?: string;
  questionId: string;
  onClose: () => void;
  onCreated?: () => void;
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600' as const,
    color: '#1a1a2e',
    margin: 0,
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#666',
    padding: '0.25rem',
  },
  steps: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    padding: '0.75rem',
    background: '#f8f9fa',
    borderRadius: '4px',
  },
  step: {
    flex: 1,
    textAlign: 'center' as const,
    padding: '0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
  },
  activeStep: {
    background: '#1a1a2e',
    color: 'white',
  },
  completedStep: {
    background: '#d4edda',
    color: '#155724',
  },
  inactiveStep: {
    background: '#e9ecef',
    color: '#6c757d',
  },
  field: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '500' as const,
    marginBottom: '0.5rem',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.9rem',
  },
  select: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.9rem',
    background: 'white',
  },
  textarea: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.9rem',
    resize: 'vertical' as const,
    minHeight: '100px',
    fontFamily: 'inherit',
  },
  hint: {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: '0.25rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  backButton: {
    padding: '0.75rem 1.5rem',
    background: '#f5f5f5',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  nextButton: {
    flex: 1,
    padding: '0.75rem',
    background: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  buttonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  error: {
    color: '#dc3545',
    fontSize: '0.85rem',
    marginTop: '0.5rem',
  },
  loginPrompt: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '0.9rem',
    padding: '2rem 1rem',
  },
};

const artifactTypes = [
  { value: 'ARTICLE', label: 'Artikkel' },
  { value: 'STUDY', label: 'Studie' },
  { value: 'REPORT', label: 'Rapport' },
  { value: 'BOOK', label: 'Bok' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'PODCAST', label: 'Podcast' },
  { value: 'OFFICIAL_DOCUMENT', label: 'Offisielt dokument' },
  { value: 'SOCIAL_MEDIA', label: 'Sosiale medier' },
  { value: 'OTHER', label: 'Annet' },
];

const extractTypes = [
  { value: 'QUOTE', label: 'Sitat' },
  { value: 'PARAPHRASE', label: 'Parafrase' },
  { value: 'DATA_POINT', label: 'Datapunkt' },
  { value: 'FIGURE', label: 'Figur/graf' },
  { value: 'TABLE', label: 'Tabell' },
];

const linkageStrengths = [
  { value: 'DIRECT', label: 'Direkte stotte', description: 'Kilden adresserer pastanden direkte' },
  { value: 'INDIRECT', label: 'Indirekte stotte', description: 'Kilden stotter en premiss' },
  { value: 'CONSISTENT_WITH', label: 'Konsistent med', description: 'Kilden samsvarer men beviser ikke' },
  {
    value: 'WEAKLY_INDICATIVE',
    label: 'Svakt indikerende',
    description: 'Kilden antyder men er ikke konklusiv',
  },
  {
    value: 'MISUSED_OR_NOT_SUPPORTING',
    label: 'Feilbrukt/stotter ikke',
    description: 'Kilden brukes feil eller stotter ikke pastanden',
  },
];

export function LinkEvidenceWizard({
  claimId,
  argumentId,
  measureId,
  counterpositionId,
  questionId,
  onClose,
  onCreated,
}: Props) {
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState(1);

  // Step 1: Artifact
  const [url, setUrl] = useState('');
  const [artifactTitle, setArtifactTitle] = useState('');
  const [artifactType, setArtifactType] = useState('ARTICLE');
  const [authors, setAuthors] = useState('');
  const [publishedAt, setPublishedAt] = useState('');

  // Step 2: Extract
  const [extractContent, setExtractContent] = useState('');
  const [extractType, setExtractType] = useState('QUOTE');
  const [pageNumber, setPageNumber] = useState('');

  // Step 3: Link
  const [linkageStrength, setLinkageStrength] = useState('DIRECT');

  // State
  const [artifactId, setArtifactId] = useState<string | null>(null);
  const [extractId, setExtractId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [createArtifact, { loading: creatingArtifact }] = useMutation(CREATE_ARTIFACT);
  const [createExtract, { loading: creatingExtract }] = useMutation(CREATE_EXTRACT);
  const [linkEvidence, { loading: linking }] = useMutation(LINK_EVIDENCE, {
    refetchQueries: [{ query: GET_QUESTION, variables: { id: questionId } }],
    onCompleted: () => {
      onCreated?.();
      onClose();
    },
  });

  const handleCreateArtifact = async () => {
    if (!url.trim() || !artifactTitle.trim()) return;
    setError(null);

    try {
      const { data } = await createArtifact({
        variables: {
          input: {
            url: url.trim(),
            title: artifactTitle.trim(),
            artifactType,
            authors: authors
              .split(',')
              .map((a) => a.trim())
              .filter(Boolean),
            publishedAt: publishedAt || null,
          },
        },
      });
      setArtifactId(data.createArtifact.id);
      setStep(2);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCreateExtract = async () => {
    if (!extractContent.trim() || !artifactId) return;
    setError(null);

    try {
      const { data } = await createExtract({
        variables: {
          input: {
            artifactId,
            content: extractContent.trim(),
            extractType,
            pageNumber: pageNumber ? parseInt(pageNumber, 10) : null,
          },
        },
      });
      setExtractId(data.createExtract.id);
      setStep(3);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleLinkEvidence = async () => {
    if (!extractId) return;
    setError(null);

    try {
      await linkEvidence({
        variables: {
          input: {
            extractId,
            claimId: claimId || null,
            argumentId: argumentId || null,
            measureId: measureId || null,
            counterpositionId: counterpositionId || null,
            linkageStrength,
          },
        },
      });
    } catch (e: any) {
      setError(e.message);
    }
  };

  const isVerified = user?.authLevel === 'VERIFIED' || user?.authLevel === 'STRONG_ID';
  const loading = creatingArtifact || creatingExtract || linking;

  if (!isAuthenticated || !isVerified) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <h2 style={styles.title}>Legg til kilde</h2>
            <button style={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
          <div style={styles.loginPrompt}>
            Du må vaere logget inn med en verifisert konto for å legge til kilder.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Legg til kilde</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.steps}>
          <div style={{ ...styles.step, ...(step === 1 ? styles.activeStep : step > 1 ? styles.completedStep : styles.inactiveStep) }}>
            1. Kilde
          </div>
          <div style={{ ...styles.step, ...(step === 2 ? styles.activeStep : step > 2 ? styles.completedStep : styles.inactiveStep) }}>
            2. Utdrag
          </div>
          <div style={{ ...styles.step, ...(step === 3 ? styles.activeStep : styles.inactiveStep) }}>
            3. Kobling
          </div>
        </div>

        {step === 1 && (
          <>
            <div style={styles.field}>
              <label style={styles.label}>URL *</label>
              <input
                type="url"
                style={styles.input}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Tittel *</label>
              <input
                type="text"
                style={styles.input}
                value={artifactTitle}
                onChange={(e) => setArtifactTitle(e.target.value)}
                placeholder="Tittel på artikkelen/rapporten"
              />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Type</label>
                <select style={styles.select} value={artifactType} onChange={(e) => setArtifactType(e.target.value)}>
                  {artifactTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Publisert</label>
                <input
                  type="date"
                  style={styles.input}
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Forfattere</label>
              <input
                type="text"
                style={styles.input}
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="Navn, separert med komma"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Sitat/utdrag *</label>
              <textarea
                style={styles.textarea}
                value={extractContent}
                onChange={(e) => setExtractContent(e.target.value)}
                placeholder="Kopier relevant tekst fra kilden..."
              />
              <div style={styles.hint}>Kopier den relevante teksten som stotter pastanden</div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Type</label>
                <select style={styles.select} value={extractType} onChange={(e) => setExtractType(e.target.value)}>
                  {extractTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Sidetall</label>
                <input
                  type="number"
                  style={styles.input}
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  placeholder="f.eks. 42"
                />
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Koblingsstyrke</label>
              <select style={styles.select} value={linkageStrength} onChange={(e) => setLinkageStrength(e.target.value)}>
                {linkageStrengths.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <div style={styles.hint}>
                {linkageStrengths.find((s) => s.value === linkageStrength)?.description}
              </div>
            </div>
          </>
        )}

        {error && <div style={styles.error}>Feil: {error}</div>}

        <div style={styles.actions}>
          {step > 1 && (
            <button style={styles.backButton} onClick={() => setStep(step - 1)}>
              Tilbake
            </button>
          )}

          {step === 1 && (
            <button
              style={{
                ...styles.nextButton,
                ...(!url.trim() || !artifactTitle.trim() || loading ? styles.buttonDisabled : {}),
              }}
              onClick={handleCreateArtifact}
              disabled={!url.trim() || !artifactTitle.trim() || loading}
            >
              {loading ? 'Oppretter...' : 'Neste'}
            </button>
          )}

          {step === 2 && (
            <button
              style={{
                ...styles.nextButton,
                ...(!extractContent.trim() || loading ? styles.buttonDisabled : {}),
              }}
              onClick={handleCreateExtract}
              disabled={!extractContent.trim() || loading}
            >
              {loading ? 'Oppretter...' : 'Neste'}
            </button>
          )}

          {step === 3 && (
            <button
              style={{
                ...styles.nextButton,
                ...(loading ? styles.buttonDisabled : {}),
              }}
              onClick={handleLinkEvidence}
              disabled={loading}
            >
              {loading ? 'Kobler...' : 'Fullfør'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
