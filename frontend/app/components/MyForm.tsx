import React, { useState } from 'react';
import { socket } from '../libs/socket';

export function MyForm() {
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    socket.timeout(5000).emit('update-cell', value, () => {
      setIsLoading(false);
    });
  }

  return (
    <form onSubmit={ onSubmit }>
      <input onChange={ e => setValue(e.target.value) } />

      <button type="submit" disabled={ isLoading }>Submit</button>
    </form>
  );
}