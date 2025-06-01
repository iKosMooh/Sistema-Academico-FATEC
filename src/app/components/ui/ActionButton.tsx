"use client";

import React, { useState, useRef, useEffect } from 'react';

interface ActionButtonProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded"
      >
        Ações
      </button>

      {isOpen && (
        <div
          className="
            origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg 
            bg-gray-100 ring-1 ring-black ring-opacity-5 z-10
          "
        >
          <div className="py-1">
            <button
              onClick={() => { onEdit(); setIsOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              Editar
            </button>
            <button
              onClick={() => { onDelete(); setIsOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-200"
            >
              Deletar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
