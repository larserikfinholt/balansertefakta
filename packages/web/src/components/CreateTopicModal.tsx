import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_TOPIC, GET_TOPICS } from '../lib/queries';
import { useAuth } from '../context/AuthContext';

interface Props {
  onClose: () => void;
  onCreated?: (topicId: string) => void;
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
    marginBottom: '1.5rem',
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
  textarea: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.9rem',
    resize: 'vertical' as const,
    minHeight: '80px',
    fontFamily: 'inherit',
  },
  hint: {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: '0.25rem',
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

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[æ]/g, 'ae')
    .replace(/[ø]/g, 'o')
    .replace(/[å]/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function CreateTopicModal({ onClose, onCreated }: Props) {
  const { isAuthenticated, user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  const [createTopic, { loading, error }] = useMutation(CREATE_TOPIC, {
    refetchQueries: [{ query: GET_TOPICS }],
    onCompleted: (data) => {
      onCreated?.(data.createTopic.id);
      onClose();
    },
  });

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugEdited(true);
  };

  const handleSubmit = () => {
    if (!title.trim() || !slug.trim()) return;

    createTopic({
      variables: {
        input: {
          title: title.trim(),
          description: description.trim() || null,
          slug: slug.trim(),
        },
      },
    });
  };

  const isVerified = user?.authLevel === 'VERIFIED' || user?.authLevel === 'STRONG_ID';

  if (!isAuthenticated || !isVerified) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <h2 style={styles.title}>Opprett tema</h2>
            <button style={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
          <div style={styles.loginPrompt}>
            Du må vaere logget inn med en verifisert konto for å opprette temaer.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Opprett tema</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Tittel *</label>
          <input
            type="text"
            style={styles.input}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="f.eks. Klimaendringer"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Beskrivelse</label>
          <textarea
            style={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kort beskrivelse av temaet..."
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>URL-slug *</label>
          <input
            type="text"
            style={styles.input}
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="klimaendringer"
          />
          <div style={styles.hint}>Brukes i URL-en: /topic/{slug || 'slug'}</div>
        </div>

        {error && <div style={styles.error}>Feil: {error.message}</div>}

        <div style={styles.actions}>
          <button style={styles.cancelButton} onClick={onClose}>
            Avbryt
          </button>
          <button
            style={{
              ...styles.saveButton,
              ...(!title.trim() || !slug.trim() || loading ? styles.saveButtonDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={!title.trim() || !slug.trim() || loading}
          >
            {loading ? 'Oppretter...' : 'Opprett'}
          </button>
        </div>
      </div>
    </div>
  );
}
