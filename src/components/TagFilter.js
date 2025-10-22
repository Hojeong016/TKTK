import React from 'react';
import useStore from '../store/useStore';
import '../styles/components.css';

export default function TagFilter({ tags = [] }) {
  const selectedTags = useStore((s) => s.selectedTags);
  const toggleTag = useStore((s) => s.toggleTag);

  if (!tags || tags.length === 0) return null;

  return (
    <div className="tag-filter" role="toolbar" aria-label="Filters">
      {tags.map((t) => {
        const active = selectedTags.includes(t);
        return (
          <button
            key={t}
            className={`tag-btn ${active ? 'active' : ''}`}
            onClick={() => toggleTag(t)}
            aria-pressed={active}
            type="button"
          >
            {t.replace(/^tier:|^right:|^stream:|^game:/, '')}
          </button>
        );
      })}
      {selectedTags.length > 0 && (
        <button className="tag-clear" onClick={() => useStore.getState().setSelectedTags([])} type="button">Clear</button>
      )}
    </div>
  );
}