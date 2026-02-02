import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_DISAGREEMENT, GET_QUESTION } from '../lib/queries';
import { useAuth } from '../context/AuthContext';

interface Props {
  questionId?: string;
  claimId?: string;
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
    maxWidth: '500px',
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
  description: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '1.5rem',
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
  typeDescription: {
    fontSize: '0.8rem',
    color: '#666',
    marginTop: '0.5rem',
    padding: '0.5rem',
    background: '#f8f9fa',
    borderRadius: '4px',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  cancelButton: {
    flex: 1,
    padding: '0.75rem',
    background: '#f5f5f5',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  saveButton: {
    flex: 1,
    padding: '0.75rem',
    background: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  saveButtonDisabled: {
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

const disagreementTypes = [
  {
    value: 'DATA',
    label: 'Datauenighet',
    description: 'Uenighet om fakta, malinger eller observasjoner. Folk er uenige om hva dataene faktisk viser.',
  },
  {
    value: 'INTERPRETATION',
    label: 'Tolkningsuenighet',
    description:
      'Enighet om data, men uenighet om hva det betyr. Folk tolker de samme faktaene forskjellig.',
  },
  {
    value: 'VALUES_OR_RISK',
    label: 'Verdi/risiko-uenighet',
    description:
      'Uenighet basert på forskjellige verdier, prioriteringer eller risikovurderinger. Ikke et faktasporsmal.',
  },
  {
    value: 'DEFINITIONS',
    label: 'Definisjonsuenighet',
    description: 'Uenighet om hva begreper betyr. Folk bruker samme ord, men mener forskjellige ting.',
  },
  {
    value: 'SCOPE',
    label: 'Omfangsuenighet',
    description:
      'Uenighet om hvilket omfang som er relevant. Folk snakker om forskjellige tidsperioder, geografier eller systemer.',
  },
];

export function AddDisagreementModal({ questionId, claimId, onClose, onCreated }: Props) {
  const { isAuthenticated, user } = useAuth();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');

  const [createDisagreement, { loading, error }] = useMutation(CREATE_DISAGREEMENT, {
    refetchQueries: questionId ? [{ query: GET_QUESTION, variables: { id: questionId } }] : [],
    onCompleted: () => {
      onCreated?.();
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!type || !description.trim()) return;

    createDisagreement({
      variables: {
        input: {
          questionId: questionId || null,
          claimId: claimId || null,
          disagreementType: type,
          description: description.trim(),
        },
      },
    });
  };

  const selectedType = disagreementTypes.find((t) => t.value === type);
  const isVerified = user?.authLevel === 'VERIFIED' || user?.authLevel === 'STRONG_ID';

  if (!isAuthenticated || !isVerified) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <h2 style={styles.title}>Legg til uenighetsakse</h2>
            <button style={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
          <div style={styles.loginPrompt}>
            Du må vaere logget inn med en verifisert konto for å legge til uenighetsakser.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Legg til uenighetsakse</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <p style={styles.description}>
          Identifiser en akse der folk er uenige. Dette hjelper å strukturere debatten og synliggjore hvor
          konfliktene ligger.
        </p>

        <div style={styles.field}>
          <label style={styles.label}>Type uenighet *</label>
          <select style={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Velg type...</option>
            {disagreementTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {selectedType && <div style={styles.typeDescription}>{selectedType.description}</div>}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Beskrivelse *</label>
          <textarea
            style={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beskriv hva uenigheten handler om..."
          />
        </div>

        {error && <div style={styles.error}>Feil: {error.message}</div>}

        <div style={styles.actions}>
          <button style={styles.cancelButton} onClick={onClose}>
            Avbryt
          </button>
          <button
            style={{
              ...styles.saveButton,
              ...(!type || !description.trim() || loading ? styles.saveButtonDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={!type || !description.trim() || loading}
          >
            {loading ? 'Lagrer...' : 'Legg til'}
          </button>
        </div>
      </div>
    </div>
  );
}
