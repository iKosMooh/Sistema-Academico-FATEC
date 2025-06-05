"use client";

import { useState } from 'react';
import SubMenu from '../painel-aulas/SubMenu';
import { AppContextProvider } from '../painel-aulas/AppContext';

export default function HomePage() {
  const [selectedKey, setSelectedKey] = useState('home');

  const handleSelect = (key: string) => {
    setSelectedKey(key);
  };

  return (
    <AppContextProvider>
      <SubMenu onSelect={handleSelect} selectedKey={selectedKey} />
    </AppContextProvider>
  );
}
