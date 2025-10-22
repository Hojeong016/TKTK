import React from 'react';
import MemberCard from './MemberCard';
import TagFilter from './TagFilter';
import { useFetchItems } from '../api/useFetch';
import useStore from '../store/useStore';

export default function MemberList() {
  const { data, isLoading, isError } = useFetchItems();
  const setSelectedItem = useStore((s) => s.setSelectedItem);
  const selectedTags = useStore((s) => s.selectedTags);

  // derive tag options from data (tier only)
  const tags = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    const set = new Set();
    data.forEach((m) => {
      if (m.game?.tier) set.add(`tier:${String(m.game.tier)}`);
    });
    return Array.from(set);
  }, [data]);

  const matchTag = React.useCallback((member, tag) => {
    if (!tag) return true;
    if (tag.startsWith('tier:')) return String(member.game?.tier) === tag.split(':')[1];
    if (tag.startsWith('right:')) return String(member.discord?.right) === tag.split(':')[1];
    if (tag === 'stream:soop') return Boolean(member.streaming?.soop);
    if (tag === 'stream:chzzk') return Boolean(member.streaming?.chzzk);
    if (tag.startsWith('game:')) return (member.game?.gamename || member.info?.gamename) === tag.split(':')[1];
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

      <div className="card-grid">
        {filtered.map((m) => (
          <MemberCard key={m.id} member={m} onSelect={setSelectedItem} />
        ))}
      </div>
    </section>
  );
}