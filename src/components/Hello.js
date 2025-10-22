import React from 'react';

function Hello({ name = 'World' }) {
  return <h2>Hello, {name}!</h2>;
}

export default Hello;