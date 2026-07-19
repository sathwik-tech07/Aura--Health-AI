import React, { useEffect } from 'react';

interface Props {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  duration?: number;
}

const UndoToast: React.FC<Props> = ({ message, actionLabel = 'Undo', onAction, onClose, duration = 5000 }) => {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed left-1/2 transform -translate-x-1/2 bottom-20 z-50">
      <div className="bg-dark-900 border border-white/5 rounded-lg px-4 py-3 flex items-center gap-4">
        <div className="text-sm text-gray-200">{message}</div>
        {onAction && <button onClick={onAction} className="px-3 py-1 rounded bg-white/5">{actionLabel}</button>}
        <button onClick={onClose} className="px-2 py-1 text-xs text-gray-400">✕</button>
      </div>
    </div>
  );
};

export default UndoToast;
