import React from 'react';
import MemberCard from './MemberCard';
import MemberTable from './MemberTable';
import { useFetchItems } from '../api/useFetch';
import useStore from '../store/useStore';

export default function MemberList() {
  const { data, isLoading, isError } = useFetchItems();
  const setSelectedItem = useStore((s) => s.setSelectedItem);
  const [view, setView] = React.useState('card'); // 'card' or 'table'

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error</p>;

  return (
    <section>
      <div className="list-controls">
        <div>
          <button onClick={() => setView('card')}>Card</button>
          <button onClick={() => setView('table')}>Table</button>
        </div>
      </div>

      {view === 'card' ? (
        <div className="card-grid">
          {data.map((m) => <MemberCard key={m.id} member={m} onSelect={setSelectedItem} />)}
        </div>
      ) : (
        <MemberTable data={data} onSelect={setSelectedItem} />
      )}
    </section>
  );
}