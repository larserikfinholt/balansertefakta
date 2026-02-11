import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_QUESTIONS_BY_SUBTOPIC } from '../lib/queries';

interface Props {
  subtopicId: string;
  currentQuestionId: string;
  variant?: 'sidebar' | 'horizontal';
}

const sidebarStyles = {
  panel: {
    background: 'white',
    borderRadius: '8px',
    padding: '1.25rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600' as const,
    marginBottom: '0.75rem',
    color: '#1a1a2e',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  item: {
    padding: '0.5rem 0',
    borderBottom: '1px solid #f0f0f0',
  },
  link: {
    color: '#1a1a2e',
    textDecoration: 'none',
    fontSize: '0.85rem',
    lineHeight: '1.3',
    display: 'block',
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.7rem',
    marginLeft: '0.4rem',
    verticalAlign: 'middle',
  },
};

const horizontalStyles = {
  section: {
    marginTop: '2rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600' as const,
    color: '#1a1a2e',
    marginBottom: '0.75rem',
  },
  row: {
    display: 'flex',
    gap: '0.75rem',
    overflowX: 'auto' as const,
    paddingBottom: '0.5rem',
  },
  card: {
    background: 'white',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    minWidth: '200px',
    maxWidth: '280px',
    fontSize: '0.85rem',
    color: '#1a1a2e',
    textDecoration: 'none',
    flexShrink: 0,
    display: 'block',
    lineHeight: '1.3',
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.7rem',
    marginLeft: '0.4rem',
    verticalAlign: 'middle',
  },
};

export function RelatedQuestions({ subtopicId, currentQuestionId, variant = 'sidebar' }: Props) {
  const { data } = useQuery(GET_QUESTIONS_BY_SUBTOPIC, {
    variables: { subtopicId, excludeId: currentQuestionId },
  });

  const questions = data?.questionsBySubtopic ?? [];

  if (questions.length === 0) return null;

  if (variant === 'horizontal') {
    return (
      <div style={horizontalStyles.section}>
        <div style={horizontalStyles.title}>Relaterte diskusjoner</div>
        <div style={horizontalStyles.row}>
          {questions.map((q: { id: string; title: string; isBalanced: boolean }) => (
            <Link key={q.id} to={`/question/${q.id}`} style={horizontalStyles.card}>
              {q.title}
              <span style={horizontalStyles.badge}>
                {q.isBalanced ? '⚖️' : '⚠️'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={sidebarStyles.panel}>
      <div style={sidebarStyles.title}>Relaterte diskusjoner</div>
      <ul style={sidebarStyles.list}>
        {questions.map((q: { id: string; title: string; isBalanced: boolean }) => (
          <li key={q.id} style={sidebarStyles.item}>
            <Link to={`/question/${q.id}`} style={sidebarStyles.link}>
              {q.title}
              <span style={sidebarStyles.badge}>
                {q.isBalanced ? '⚖️' : '⚠️'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
