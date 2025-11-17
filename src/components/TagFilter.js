import React from 'react';
import useStore from '../store/useStore';
import '../styles/components.css';

export default function TagFilter({ tags = [] }) {
  const selectedTags = useStore((s) => s.selectedTags);
  const toggleTag = useStore((s) => s.toggleTag);
  const rightsConfig = useStore((s) => s.rightsConfig);

  if (!tags || tags.length === 0) return null;

  // 태그 표시명 가져오기 함수
  const getTagLabel = (tag) => {
    // right: prefix가 있는 경우 라벨로 변환
    if (tag.startsWith('right:')) {
      const rightKey = tag.replace('right:', '');
      const config = rightsConfig.find(rc => rc.key === rightKey);
      return config ? config.label : rightKey;
    }
    // 다른 prefix는 그대로 제거만
    return tag.replace(/^tier:|^stream:|^game:/, '');
  };

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
            {getTagLabel(t)}
          </button>
        );
      })}
      {selectedTags.length > 0 && (
        <button className="tag-clear" onClick={() => useStore.getState().setSelectedTags([])} type="button">Clear</button>
      )}
    </div>
  );
}