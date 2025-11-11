import React from 'react';

export default function Toast({ open, message, type = 'success' }) {
  if (!open) return null;

  return (
    <div className={`toast toast-${type}`}>
      {message}
    </div>
  );
}
