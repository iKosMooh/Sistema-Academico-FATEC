"use client";

import { useState } from 'react';
import SubMenu from '../painel-aulas/SubMenu';
import { AppProvider } from '../painel-aulas/AppContext';

export default function HomePage() {
  const [selectedKey, setSelectedKey] = useState('home');

  const handleSelect = (key: string) => {
    setSelectedKey(key);
  };

  return (
    <AppProvider>
      <SubMenu onSelect={handleSelect} selectedKey={selectedKey} />
    </AppProvider>
  );
}
