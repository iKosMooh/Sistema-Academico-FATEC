// src/app/cadastro/page.tsx
'use client';

import { useState } from 'react';

export default function CadastroPage() {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('Aluno');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resposta = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cpf,
        senhaHash: senha, // Em produção, utilize hashing seguro
        tipo,
      }),
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      setMensagem('Usuário cadastrado com sucesso!');
      setCpf('');
      setSenha('');
      setTipo('Aluno');
    } else {
      setMensagem(dados.error || 'Erro ao cadastrar usuário.');
    }
  };

  return (
    <div>
      <h1>Cadastro de Usuário</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>CPF:</label>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Tipo:</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="Aluno">Aluno</option>
            <option value="Professor">Professor</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button type="submit">Cadastrar</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
}
