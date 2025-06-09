"use client";

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface FAQAnswer {
  text?: string;
  list?: string[];
  steps?: string[];
}

interface FAQItem {
  id: string;
  question: string;
  answer: string | FAQAnswer;
}

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => {
      const sections = document.querySelectorAll('.faq-section');
      const scrollPos = window.scrollY + 150;

      sections.forEach(section => {
        const htmlSection = section as HTMLElement;
        if (htmlSection.offsetTop <= scrollPos && htmlSection.offsetTop + htmlSection.offsetHeight > scrollPos) {
          setActiveSection(htmlSection.id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const faqSections = [
    { id: 'geral', title: '📌 Geral', icon: '📌' },
    { id: 'alunos', title: '🎓 Para Alunos', icon: '🎓' },
    { id: 'professores', title: '👨‍🏫 Para Professores', icon: '👨‍🏫' },
    { id: 'coordenadores', title: '👨‍💼 Para Coordenadores', icon: '👨‍💼' },
    { id: 'administradores', title: '🔧 Para Administradores', icon: '🔧' },
    { id: 'tecnicos', title: '⚙️ Problemas Técnicos', icon: '⚙️' },
    { id: 'relatorios', title: '📊 Relatórios e Dados', icon: '📊' },
    { id: 'ajuda', title: '🆘 Precisa de Mais Ajuda?', icon: '🆘' },
    { id: 'dicas', title: '🚀 Dicas Importantes', icon: '🚀' }
  ];

  const faqData: Record<string, FAQItem[]> = {
    geral: [
      {
        id: 'o-que-e-softmare',
        question: 'O que é o SOFTMARE?',
        answer: 'O SOFTMARE é um Sistema Integrado de Gestão Educacional desenvolvido especificamente para instituições de ensino. Ele centraliza todas as atividades acadêmicas em uma única plataforma, desde o cadastro de alunos até o lançamento de notas e controle de frequência.'
      },
      {
        id: 'quem-pode-usar',
        question: 'Quem pode usar o sistema?',
        answer: {
          text: 'O sistema possui diferentes perfis de usuário:',
          list: [
            'Administradores: Acesso completo a todas as funcionalidades',
            'Coordenadores: Gerenciamento de cursos, turmas e relatórios',
            'Professores: Registro de aulas, frequência e notas',
            'Alunos: Consulta de notas, frequência e materiais didáticos'
          ]
        }
      },
      {
        id: 'como-acessar',
        question: 'Como faço para acessar o sistema?',
        answer: {
          text: '',
          steps: [
            'Acesse a página de login em /pages/login',
            'Digite seu CPF e senha fornecidos pela instituição',
            'O sistema irá redirecioná-lo automaticamente para o painel apropriado ao seu perfil'
          ]
        }
      }
    ],
    alunos: [
      {
        id: 'consultar-notas',
        question: 'Como consulto minhas notas?',
        answer: {
          steps: [
            'Faça login no sistema',
            'No menu lateral, clique em "Aulas"',
            'Selecione a aba "Visualizar Notas"',
            'Filtre por disciplina ou período para encontrar suas avaliações'
          ]
        }
      },
      {
        id: 'verificar-frequencia',
        question: 'Como verifico minha frequência?',
        answer: {
          text: 'Acesse o painel de aulas. Na seção "Frequência", você verá:',
          list: [
            'Percentual de presença por disciplina',
            'Faltas justificadas e não justificadas',
            'Aulas ministradas até o momento'
          ]
        }
      },
      {
        id: 'enviar-atestado',
        question: 'Como envio um atestado médico?',
        answer: {
          steps: [
            'No menu principal, clique no botão "🏥 Atestados"',
            'Clique em "Novo Atestado"',
            'Preencha as informações: Data de início e fim do afastamento, Motivo (CID ou descrição), Anexe o arquivo do atestado (PDF ou imagem)',
            'O atestado será analisado pela coordenação'
          ]
        }
      },
      {
        id: 'materiais-aula',
        question: 'Não consigo ver meus materiais de aula',
        answer: {
          list: [
            'Verifique se você está matriculado na turma correta',
            'Os materiais ficam na seção "Arquivos da Turma"',
            'Alguns arquivos podem estar restritos pelo professor'
          ]
        }
      }
    ],
    professores: [
      {
        id: 'registro-aula',
        question: 'Como registro uma aula?',
        answer: {
          steps: [
            'Acesse "Registro de Aulas / Frequência"',
            'Selecione a data e disciplina',
            'Preencha: Conteúdo ministrado, Metodologia aplicada, Observações (opcional)',
            'Marque a presença dos alunos',
            'Salve as informações'
          ]
        }
      },
      {
        id: 'lancar-notas',
        question: 'Como lanço notas dos alunos?',
        answer: {
          steps: [
            'Vá para "Lançamento de Notas"',
            'Selecione a disciplina',
            'Escolha o tipo de avaliação (Prova, Trabalho, Seminário, etc.)',
            'Digite um nome para a avaliação',
            'Insira as notas dos alunos (0 a 10)',
            'Adicione observações se necessário',
            'Clique em "Salvar Notas"'
          ]
        }
      },
      {
        id: 'planejamento-aulas',
        question: 'Como faço o planejamento de aulas?',
        answer: {
          steps: [
            'Acesse o "📅 Calendário"',
            'Clique na data da aula desejada',
            'Adicione: Conteúdo programático, Metodologia a ser aplicada, Recursos necessários',
            'Anexe materiais de apoio se necessário'
          ]
        }
      },
      {
        id: 'gerenciar-aulas-recorrentes',
        question: 'Como gerencio aulas recorrentes?',
        answer: {
          steps: [
            'Vá para "Gerenciar Aulas Recorrentes"',
            'Defina: Dias da semana, Horário de início e fim, Período de recorrência, Disciplina',
            'O sistema criará automaticamente as aulas no calendário'
          ]
        }
      },
      {
        id: 'anexar-arquivos',
        question: 'Como anexo arquivos para os alunos?',
        answer: {
          steps: [
            'Na seção "Arquivos", clique em "Anexar Arquivo"',
            'Selecione o arquivo do seu computador',
            'O arquivo ficará disponível para todos os alunos da turma',
            'Você pode anexar PDFs, imagens, documentos do Word, Excel, etc.'
          ]
        }
      }
    ],
    coordenadores: [
      {
        id: 'cadastro-alunos',
        question: 'Como cadastro novos alunos?',
        answer: {
          steps: [
            'Acesse "Gerenciar Usuários"',
            'Clique em "Novo Aluno"',
            'Preencha todas as informações obrigatórias (marcadas com *)',
            'Adicione foto e documentos se disponíveis',
            'Salve o cadastro - o sistema gerará automaticamente o login'
          ]
        }
      },
      {
        id: 'criar-turma',
        question: 'Como crio uma nova turma?',
        answer: {
          steps: [
            'Vá para "Gerenciar Cursos"',
            'Selecione a aba "Turmas"',
            'Clique em "Nova Turma"',
            'Defina: Nome da turma, Curso vinculado, Ano letivo',
            'Após criar, vincule alunos e disciplinas'
          ]
        }
      },
      {
        id: 'vincular-disciplinas',
        question: 'Como vincular disciplinas a um curso?',
        answer: {
          steps: [
            'Acesse "Disciplinas" no painel acadêmico',
            'Selecione o curso desejado',
            'Escolha as disciplinas disponíveis',
            'Defina a carga horária de cada uma'
          ]
        }
      },
      {
        id: 'analisar-atestados',
        question: 'Como analiso atestados médicos?',
        answer: {
          steps: [
            'Acesse a seção "🏥 Atestados"',
            'Veja todos os atestados pendentes',
            'Para cada atestado: Visualize o documento anexado, Verifique as datas e motivo, Aprove ou rejeite com justificativa',
            'O sistema atualizará automaticamente as faltas do aluno'
          ]
        }
      }
    ],
    administradores: [
      {
        id: 'gerenciar-usuarios',
        question: 'Como gerencio usuários do sistema?',
        answer: {
          steps: [
            'Acesse "Gerenciar Usuários"',
            'Visualize todos os tipos de usuário',
            'Para cada categoria: Adicione novos usuários, Edite informações existentes, Desative contas quando necessário, Redefina senhas'
          ]
        }
      },
      {
        id: 'backup-dados',
        question: 'Como faço backup dos dados?',
        answer: {
          steps: [
            'Vá para "Sistema" → "Reset"',
            'Na seção de manutenção, encontre as opções de backup',
            'Agende backups automáticos ou execute manualmente',
            'Os backups ficam armazenados com segurança'
          ]
        }
      },
      {
        id: 'monitorar-desempenho',
        question: 'Como monitoro o desempenho do sistema?',
        answer: {
          steps: [
            'No dashboard principal, visualize: Usuários ativos, Aulas registradas hoje, Notas lançadas, Status geral do sistema',
            'Relatórios detalhados estão disponíveis em cada seção'
          ]
        }
      },
      {
        id: 'redefinir-senha',
        question: 'Como redefinir senha de um usuário?',
        answer: {
          steps: [
            'Acesse "Gerenciar Usuários"',
            'Encontre o usuário na lista',
            'Clique em "Ações" → "Redefinir Senha"',
            'Uma nova senha temporária será gerada',
            'Informe ao usuário para alterá-la no primeiro login'
          ]
        }
      }
    ],
    tecnicos: [
      {
        id: 'sistema-lento',
        question: 'O sistema está lento, o que fazer?',
        answer: {
          list: [
            'Verifique sua conexão com a internet',
            'Limpe o cache do navegador (Ctrl+Shift+Delete)',
            'Feche outras abas desnecessárias',
            'Se o problema persistir, contacte o suporte técnico'
          ]
        }
      },
      {
        id: 'esqueci-senha',
        question: 'Esqueci minha senha',
        answer: {
          list: [
            'Na tela de login, clique em "Esqueci minha senha"',
            'Digite seu CPF cadastrado',
            'Você receberá instruções por email',
            'Ou procure a coordenação para redefinição manual'
          ]
        }
      },
      {
        id: 'upload-arquivos',
        question: 'Não consigo fazer upload de arquivos',
        answer: {
          list: [
            'Verifique se o arquivo não excede 10MB',
            'Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG',
            'Certifique-se de que não há caracteres especiais no nome do arquivo'
          ]
        }
      },
      {
        id: 'pagina-nao-carrega',
        question: 'A página não carrega',
        answer: {
          list: [
            'Atualize a página (F5)',
            'Verifique se você tem permissão para acessar essa seção',
            'Tente fazer logout e login novamente',
            'Se o erro persistir, anote a mensagem e reporte ao TI'
          ]
        }
      },
      {
        id: 'reportar-bug',
        question: 'Como reportar um bug?',
        answer: {
          steps: [
            'Anote exatamente o que você estava fazendo',
            'Capture uma imagem da tela (Print Screen)',
            'Anote a mensagem de erro completa',
            'Entre em contato com o suporte informando: Seu perfil de usuário, Navegador utilizado, Passos para reproduzir o problema'
          ]
        }
      }
    ],
    relatorios: [
      {
        id: 'gerar-relatorios-frequencia',
        question: 'Como gero relatórios de frequência?',
        answer: {
          steps: [
            'Acesse a seção apropriada ao seu perfil',
            'Selecione o período desejado',
            'Escolha filtros (turma, disciplina, aluno)',
            'Clique em "Gerar Relatório"',
            'Você pode exportar em PDF ou Excel'
          ]
        }
      },
      {
        id: 'exportar-dados',
        question: 'Como exporto dados do sistema?',
        answer: {
          list: [
            'A maioria das listagens possui botão "Exportar"',
            'Formatos disponíveis: Excel, PDF, CSV',
            'Para relatórios personalizados, contacte o administrador'
          ]
        }
      },
      {
        id: 'dados-seguros',
        question: 'Os dados são seguros?',
        answer: {
          text: 'Sim! O sistema possui:',
          list: [
            'Criptografia de dados sensíveis',
            'Backup automático diário',
            'Logs de auditoria de todas as ações',
            'Conformidade com a LGPD'
          ]
        }
      }
    ],
    ajuda: [
      {
        id: 'suporte-tecnico',
        question: 'Suporte Técnico',
        answer: {
          list: [
            'Email: caiomagalhaesdesouza@gmail.com',
            'Telefone: (19) 99312-2734',
            'Chat online: disponível no sistema (botão azul no canto inferior direito)'
          ]
        }
      },
      {
        id: 'horario-atendimento',
        question: 'Horário de Atendimento',
        answer: {
          list: [
            'Segunda a Sexta: 8h às 18h',
            'Sábados: 8h às 12h',
            'Emergências: WhatsApp (19) 99312-2734'
          ]
        }
      },
      {
        id: 'treinamentos',
        question: 'Treinamentos',
        answer: {
          list: [
            'Oferecemos treinamentos presenciais e online',
            'Material de apoio disponível na seção "Ajuda" do sistema',
            'Vídeos tutoriais no nosso canal do YouTube'
          ]
        }
      },
      {
        id: 'sugestoes-melhorias',
        question: 'Sugestões e Melhorias',
        answer: {
          text: 'Sua opinião é importante! Envie sugestões para:',
          list: [
            'Email: caiomagalhaesdesouza@gmail.com',
            'Formulário de feedback dentro do sistema',
            'Reuniões mensais com representantes de cada setor'
          ]
        }
      }
    ],
    dicas: [
      {
        id: 'boas-praticas',
        question: 'Boas Práticas',
        answer: {
          list: [
            'Sempre faça logout ao terminar de usar',
            'Mantenha sua senha segura e não compartilhe',
            'Atualize regularmente suas informações pessoais',
            'Faça backup dos seus arquivos importantes antes de anexar'
          ]
        }
      },
      {
        id: 'navegadores-recomendados',
        question: 'Navegadores Recomendados',
        answer: {
          list: [
            'Chrome (versão 90+)',
            'Firefox (versão 88+)',
            'Edge (versão 90+)',
            'Safari (versão 14+)'
          ]
        }
      },
      {
        id: 'requisitos-sistema',
        question: 'Requisitos do Sistema',
        answer: {
          list: [
            'Conexão à internet estável',
            'JavaScript habilitado',
            'Cookies aceitos',
            'Resolução mínima: 1024x768'
          ]
        }
      }
    ]
  };

  const filteredSections = faqSections.filter(section => {
    if (!searchTerm) return true;
    const sectionData = faqData[section.id] || [];
    return sectionData.some(item => 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof item.answer === 'string' && item.answer.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const renderFAQSection = (sectionId: string, sectionTitle: string, items: FAQItem[]) => (
    <section id={sectionId} className="faq-section mb-16" key={sectionId}>
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        <span className="emoji-no-color">{sectionTitle.split(' ')[0]}</span>
        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent ml-2">
          {sectionTitle.replace(/^.+ /, '')}
        </span>
      </h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300"
          >
            <button
              onClick={() => toggleExpand(item.id)}
              className="w-full p-6 text-left flex items-center justify-between group"
            >
              <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
                {item.question}
              </h3>
              {expandedItems.has(item.id) ? (
                <ChevronUpIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 flex-shrink-0 transition-colors duration-300" />
              )}
            </button>
            {expandedItems.has(item.id) && (
              <div className="px-6 pb-6">
                <div className="text-gray-300 leading-relaxed">
                  {typeof item.answer === 'string' ? (
                    <p>{item.answer}</p>
                  ) : (
                    <div>
                      {item.answer.text && <p className="mb-3">{item.answer.text}</p>}
                      {item.answer.list && (
                        <ul className="space-y-2">
                          {item.answer.list.map((listItem: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span>{listItem}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {item.answer.steps && (
                        <ol className="space-y-2">
                          {item.answer.steps.map((step: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36%206V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative py-12 md:py-20 px-4 text-center">
        <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-4xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-white to-blue-300 bg-clip-text text-transparent">
            FAQ - SOFTMARE
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Perguntas Frequentes sobre o Sistema de Gestão Educacional
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 mb-8">
        <div className="max-w-md mx-auto relative">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="🔍 Buscar no FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 gap-8">
        {/* Sidebar Navigation */}
        <nav className="lg:w-80 lg:sticky lg:top-4 lg:h-fit">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-6 text-blue-300">Navegação Rápida</h3>
            <div className="space-y-2">
              {filteredSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 group ${
                    activeSection === section.id 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                      : 'hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-lg mr-3 group-hover:scale-110 transition-transform duration-300 emoji-no-color">
                    {section.icon}
                  </span>
                  <span className={`font-medium text-sm transition-colors duration-300 ${
                    activeSection === section.id 
                      ? 'text-white' 
                      : 'text-gray-300 group-hover:text-blue-300'
                  }`}>
                    {section.title.replace(/^.+ /, '')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Render all FAQ sections */}
          {filteredSections.map(section => 
            renderFAQSection(section.id, section.title, faqData[section.id] || [])
          )}

          {/* Contact Support Section */}
          <section className="my-16 p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-3xl">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                <span className="emoji-no-color">🆘</span>
                <span className="ml-2">Precisa de Mais Ajuda?</span>
              </h2>
              <p className="text-gray-300 mb-6">
                Nossa equipe de suporte está sempre pronta para ajudar você
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <div className="text-2xl mb-2 emoji-no-color">📧</div>
                  <p className="font-semibold text-blue-300">Email</p>
                  <p className="text-sm text-gray-300">caiomagalhaesdesouza@gmail.com</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <div className="text-2xl mb-2 emoji-no-color">📞</div>
                  <p className="font-semibold text-blue-300">Telefone</p>
                  <p className="text-sm text-gray-300">(19) 99312-2734</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl">
                  <div className="text-2xl mb-2 emoji-no-color">💬</div>
                  <p className="font-semibold text-blue-300">Projeto Público</p>
                  <p className="text-sm text-gray-300">Disponível no Github</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 text-center border-t border-slate-800 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SOFTMARE
          </div>
          <p className="text-gray-400 mb-4">Sistema Integrado de Gestão Educacional</p>
          <p className="text-sm text-gray-500">
            <em>Este FAQ é atualizado regularmente. Para a versão mais recente, acesse sempre a documentação online dentro do sistema.</em>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            <strong>Versão: 2.0 | Última atualização: Dezembro 2024</strong>
          </p>
        </div>
      </footer>

      {/* Add custom CSS for emoji */}
      <style jsx>{`
        .emoji-no-color {
          color: initial !important;
          -webkit-text-fill-color: initial !important;
          text-fill-color: initial !important;
          font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif !important;
        }
      `}</style>
    </div>
  );
};

export default FAQ;
