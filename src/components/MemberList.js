import React from 'react';
import MemberCard from './MemberCard';
import TagFilter from './TagFilter';
import { useFetchItems } from '../api/useFetch';
import useStore from '../store/useStore';

export default function MemberList() {
  const { data, isLoading, isError } = useFetchItems({ requireAuth: false });
  const setSelectedItem = useStore((s) => s.setSelectedItem);
  const selectedTags = useStore((s) => s.selectedTags);

  // derive tag options from data (rights/badges only)
  const tags = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    const set = new Set();
    data.forEach((m) => {
      const rightValue = m.discord?.right || [];
      const rights = Array.isArray(rightValue) ? rightValue : [rightValue];
      rights.forEach((r) => {
        if (r) set.add(`right:${String(r)}`);
      });
    });
    return Array.from(set);
  }, [data]);

  const matchTag = React.useCallback((member, tag) => {
    if (!tag) return true;
    if (tag.startsWith('right:')) {
      const rightValue = member.discord?.right || [];
      const rights = Array.isArray(rightValue) ? rightValue : [rightValue];
      return rights.includes(tag.split(':')[1]);
    }
    return false;
  }, []);

  const filtered = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!selectedTags || selectedTags.length === 0) return data;
    return data.filter((m) => selectedTags.some((t) => matchTag(m, t)));
  }, [data, selectedTags, matchTag]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error</p>;
  if (!data) return null;

  return (
    <section>
      <div className="list-controls">
        <TagFilter tags={tags} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-member-state">
          <div className="empty-member-icon">🎮</div>
          <h3 className="empty-member-title">가입하고 첫 멤버로 합류하세요</h3>
          <p className="empty-member-text">클랜의 첫 번째 플레이어가 되어보세요!</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((m) => (
            <MemberCard key={m.id} member={m} onSelect={setSelectedItem} />
          ))}
        </div>
      )}
    </section>
  );
}
