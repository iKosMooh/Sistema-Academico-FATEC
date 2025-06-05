"use client";

import { AppContextProvider } from '../painel-aulas/AppContext';

export default function HomePage() {
  return (
    <AppContextProvider>
      <div>Home Page Content</div>
    </AppContextProvider>
  );
}
