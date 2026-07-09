import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmLabel = '확인',
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
    >
      <Card style={{ width: '100%', maxWidth: '360px' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0' }}>{title}</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 1.5rem 0', whiteSpace: 'pre-wrap' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" fullWidth onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
          <Button fullWidth onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmModal;
