import React from 'react';
import { Card } from './ui/Card';
import { renderStars } from '../lib/stars';
import type { ScoutedArticle } from '../types';

interface ArticleCardProps {
  article: ScoutedArticle;
  selected: boolean;
  onSelect: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, selected, onSelect }) => {
  return (
    <Card
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        padding: '1rem',
        border: selected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', margin: 0, lineHeight: 1.4 }}>{article.title}</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--warning)', whiteSpace: 'nowrap' }}>
          {renderStars(article.importance)}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        <span>{article.press}</span>
        <span>·</span>
        <span>{article.date}</span>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', lineHeight: 1.5 }}>
        {article.reason}
      </p>
      <a
        href={article.link}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}
      >
        원문 보기 ↗
      </a>
    </Card>
  );
};

export default ArticleCard;
