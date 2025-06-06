"use client";

import { AppContextProvider } from '../painel-aulas/AppContext';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  const features = [
    {
      icon: "👥",
      title: "Gestão de Pessoas",
      description: "Sistema completo de cadastro e gerenciamento de alunos, professores e administradores com perfis personalizados",
      details: ["Cadastro biométrico", "Histórico acadêmico", "Controle de acesso", "Relatórios detalhados"]
    },
    {
      icon: "📚",
      title: "Gestão Acadêmica",
      description: "Controle total sobre cursos, disciplinas, turmas e cronogramas acadêmicos em tempo real",
      details: ["Matriz curricular", "Grade horária", "Calendário acadêmico", "Pré-requisitos"]
    },
    {
      icon: "📊",
      title: "Analytics Avançado",
      description: "Dashboard inteligente com métricas de performance, frequência e análises preditivas",
      details: ["BI integrado", "Relatórios automáticos", "Métricas em tempo real", "Previsões de desempenho"]
    },
    {
      icon: "🔐",
      title: "Segurança Enterprise",
      description: "Sistema de autenticação multicamadas com criptografia avançada e auditoria completa",
      details: ["Autenticação 2FA", "Logs de auditoria", "Backup automático", "LGPD compliance"]
    },
    {
      icon: "📱",
      title: "Mobile First",
      description: "Interface responsiva e adaptativa para todos os dispositivos com experiência nativa",
      details: ["PWA integrado", "Offline sync", "Push notifications", "Touch optimized"]
    },
    {
      icon: "⚡",
      title: "Performance Ultra",
      description: "Arquitetura moderna com carregamento instantâneo e otimizações avançadas",
      details: ["Server-side rendering", "Edge computing", "Cache inteligente", "CDN global"]
    }
  ];

  const technologies = [
    {
      name: "Next.js 14",
      description: "Framework React de última geração com App Router e Server Components",
      color: "from-gray-900 to-black",
      icon: "⚡"
    },
    {
      name: "Prisma ORM",
      description: "ORM type-safe com migrations automáticas e query builder inteligente",
      color: "from-blue-600 to-purple-600",
      icon: "🗄️"
    },
    {
      name: "NextAuth.js",
      description: "Autenticação enterprise com suporte a múltiplos provedores e JWT",
      color: "from-green-600 to-blue-600",
      icon: "🔐"
    },
    {
      name: "Tailwind CSS",
      description: "Framework CSS utility-first para design systems modernos",
      color: "from-cyan-500 to-blue-500",
      icon: "🎨"
    },
    {
      name: "TypeScript",
      description: "Superset do JavaScript com tipagem estática e IntelliSense avançado",
      color: "from-blue-500 to-blue-700",
      icon: "📝"
    },
    {
      name: "Zod Validation",
      description: "Schema validation com inferência de tipos e validação runtime",
      color: "from-orange-500 to-red-500",
      icon: "✅"
    }
  ];

  return (
    <AppContextProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
        </div>

        {/* Header Hero Section */}
        <header className="relative min-h-screen flex items-center justify-center px-4">
          <div className="text-center z-10 max-w-6xl mx-auto">
            <div className={`transform transition-all duration-2000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <h1 className="text-8xl md:text-9xl font-black mb-8 bg-gradient-to-r from-blue-400 via-white to-blue-300 bg-clip-text text-transparent">
                SOFTMARE
              </h1>
              <div className="text-2xl md:text-3xl font-light mb-12 text-blue-100">
                Sistema Integrado de Gestão Educacional
                <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mt-4 rounded-full"></div>
              </div>
              
              <p className="text-xl md:text-2xl font-light text-gray-300 max-w-4xl mx-auto leading-relaxed mb-16">
                Revolucione a gestão educacional com nossa plataforma de última geração. 
                Desenvolvida com as tecnologias mais avançadas do mercado para proporcionar 
                uma experiência única e eficiente.
              </p>

              <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                <button className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-xl font-semibold hover:from-blue-500 hover:to-purple-500 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25">
                  Explorar Funcionalidades
                </button>
                <button className="px-12 py-4 border-2 border-blue-400 rounded-full text-xl font-semibold hover:bg-blue-400 hover:text-slate-900 transition-all duration-300">
                  Ver Demonstração
                </button>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
            <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
          </div>
        </header>

        {/* Features Showcase */}
        <section className="py-32 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Funcionalidades Avançadas
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Descubra um ecossistema completo de ferramentas que transformarão sua instituição educacional
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 hover:border-blue-500/50 transition-all duration-500 hover:transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="text-6xl mb-6">{feature.icon}</div>
                    <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{feature.description}</p>
                    
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center text-sm text-blue-300">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-32 px-4 bg-gradient-to-b from-transparent to-slate-800/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Stack Tecnológico
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Desenvolvido com as tecnologias mais modernas e robustas do mercado para garantir performance e escalabilidade
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {technologies.map((tech, index) => (
                <div 
                  key={index}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 p-8 hover:border-purple-500/50 transition-all duration-500"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-6">
                      <span className="text-4xl mr-4">{tech.icon}</span>
                      <h3 className="text-2xl font-bold text-white">{tech.name}</h3>
                    </div>
                    <p className="text-gray-400 leading-relaxed">{tech.description}</p>
                  </div>

                  {/* Hover Animation */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* System Architecture Visualization */}
        <section className="py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Arquitetura do Sistema
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Uma arquitetura moderna e escalável projetada para suportar milhares de usuários simultâneos
              </p>
            </div>

            <div className="relative">
              {/* Architecture Diagram */}
              <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  
                  {/* Frontend Layer */}
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <span className="text-3xl">🖥️</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Frontend</h3>
                    <ul className="text-gray-400 space-y-2">
                      <li>Next.js 14 App Router</li>
                      <li>React Server Components</li>
                      <li>Tailwind CSS</li>
                      <li>TypeScript</li>
                    </ul>
                  </div>

                    {/* API Layer */}
                    <div className="text-center relative z-10">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <span className="text-3xl">⚡</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">API Layer</h3>
                    <ul className="text-gray-400 space-y-2">
                      <li>Next.js API Routes</li>
                      <li>NextAuth.js</li>
                      <li>Zod Validation</li>
                      <li>JWT Tokens</li>
                    </ul>
                    </div>

                  {/* Database Layer */}
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <span className="text-3xl">🗄️</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Database</h3>
                    <ul className="text-gray-400 space-y-2">
                      <li>Prisma ORM</li>
                      <li>MySQL/PostgreSQL</li>
                      <li>Migrations</li>
                      <li>Type Safety</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {/* Stats Section */}
        <section className="py-32 px-4 bg-gradient-to-b from-slate-800/30 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "99.9%", label: "Uptime", icon: "⚡" },
                { number: "50ms", label: "Response Time", icon: "🚀" },
                { number: "10K+", label: "Users Support", icon: "👥" },
                { number: "100%", label: "Type Safe", icon: "🛡️" }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Transforme sua Instituição
            </h2>
            <p className="text-xl text-gray-400 mb-12 leading-relaxed">
              Junte-se às instituições que já transformaram sua gestão educacional com o SOFTMARE
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <button className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-xl font-semibold hover:from-blue-500 hover:to-purple-500 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25">
                Começar Agora
              </button>
              <button className="px-12 py-4 border-2 border-cyan-400 rounded-full text-xl font-semibold hover:bg-cyan-400 hover:text-slate-900 transition-all duration-300">
                Agendar Demo
              </button>
            </div>
          </div>
        </section>
        {/* Footer */}
        <footer className="py-16 px-4 bg-gradient-to-b from-transparent to-slate-900 border-t border-slate-800">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SOFTMARE
            </div>
            <p className="text-gray-400 mb-8">Sistema Integrado de Gestão Educacional</p>
            <div className="text-sm text-gray-500">
              © 2024 SOFTMARE. Desenvolvido com 💙 usando Next.js, Prisma e as melhores tecnologias.
            </div>
          </div>
        </footer>
      </div>
    </AppContextProvider>
  );
}
