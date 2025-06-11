import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { formatRG, gerarCPFValido } from '@/utils/cpf-rg';
import { StatusPreCadastro, TipoDocumento, StatusAtestado } from '@prisma/client';

// Dados da FATEC Itapira
const FATEC_DATA = {
  cursos: [
    {
      nomeCurso: 'Gestão da Produção Industrial',
      cargaHorariaTotal: 2400,
      descricao: 'Curso focado no planejamento e controle da produção industrial, logística, gestão ambiental e de estoque.'
    },
    {
      nomeCurso: 'Gestão Empresarial', 
      cargaHorariaTotal: 2400,
      descricao: 'Curso baseado em contabilidade, economia e administração, com foco em planejamento estratégico empresarial.'
    },
    {
      nomeCurso: 'Desenvolvimento de Software Multiplataforma',
      cargaHorariaTotal: 2400, 
      descricao: 'Curso voltado para desenvolvimento de software para múltiplas plataformas, incluindo web, mobile e cloud.'
    }
  ],
  materias: [
    // Gestão da Produção Industrial
    { nomeMateria: 'Planejamento e Controle da Produção' },
    { nomeMateria: 'Logística Industrial' },
    { nomeMateria: 'Gestão Ambiental' },
    { nomeMateria: 'Gestão de Estoque' },
    { nomeMateria: 'Administração Industrial' },
    
    // Gestão Empresarial
    { nomeMateria: 'Contabilidade Geral' },
    { nomeMateria: 'Economia Empresarial' },
    { nomeMateria: 'Planejamento Estratégico' },
    { nomeMateria: 'Gestão de Pessoas' },
    { nomeMateria: 'Marketing Empresarial' },
    
    // Desenvolvimento de Software
    { nomeMateria: 'Lógica de Programação' },
    { nomeMateria: 'Desenvolvimento Web' },
    { nomeMateria: 'Banco de Dados' },
    { nomeMateria: 'Engenharia de Software' },
    { nomeMateria: 'Programação Mobile' }
  ],
  professores: [
    {
      idProfessor: '111.222.333-96',
      nome: 'José Marcos',
      sobrenome: 'Romão Júnior',
      rg: '11.222.333-4',
      dataNasc: new Date('1975-03-15'),
      cargo: 'Coordenador',
      tel: '(19) 3863-5210'
    },
    {
      idProfessor: '222.333.444-97',
      nome: 'Gilberto Brandão',
      sobrenome: 'Marcon',
      rg: '22.333.444-5',
      dataNasc: new Date('1970-08-22'),
      cargo: 'Coordenador',
      tel: '(19) 3863-5211'
    },
    {
      idProfessor: '333.444.555-98',
      nome: 'Márcia Regina',
      sobrenome: 'Reggiolli',
      rg: '33.444.555-6',
      dataNasc: new Date('1978-11-10'),
      cargo: 'Coordenadora',
      tel: '(19) 3863-5212'
    },
    {
      idProfessor: '444.555.666-99',
      nome: 'Carlos Eduardo',
      sobrenome: 'Silva Santos',
      rg: '44.555.666-7',
      dataNasc: new Date('1980-05-18'),
      cargo: 'Professor',
      tel: '(19) 3863-5213'
    },
    {
      idProfessor: '555.666.777-10',
      nome: 'Ana Paula',
      sobrenome: 'Oliveira Costa',
      rg: '55.666.777-8',
      dataNasc: new Date('1983-09-25'),
      cargo: 'Professora',
      tel: '(19) 3863-5214'
    },
    {
      idProfessor: '666.777.888-21',
      nome: 'Ricardo',
      sobrenome: 'Ferreira Lima',
      rg: '66.777.888-9',
      dataNasc: new Date('1977-12-03'),
      cargo: 'Professor',
      tel: '(19) 3863-5215'
    },
    {
      idProfessor: '777.888.999-32',
      nome: 'Fernanda',
      sobrenome: 'Mendes Rocha',
      rg: '77.888.999-0',
      dataNasc: new Date('1985-04-14'),
      cargo: 'Professora',
      tel: '(19) 3863-5216'
    },
    {
      idProfessor: '888.999.111-43',
      nome: 'Paulo Roberto',
      sobrenome: 'Alves Pereira',
      rg: '88.999.111-1',
      dataNasc: new Date('1974-07-28'),
      cargo: 'Professor',
      tel: '(19) 3863-5217'
    },
    {
      idProfessor: '999.111.222-54',
      nome: 'Luciana',
      sobrenome: 'Barbosa Martins',
      rg: '99.111.222-2',
      dataNasc: new Date('1981-01-20'),
      cargo: 'Professora',
      tel: '(19) 3863-5218'
    },
    {
      idProfessor: '111.333.555-65',
      nome: 'Roberto Carlos',
      sobrenome: 'Souza Nunes',
      rg: '11.333.555-3',
      dataNasc: new Date('1979-10-12'),
      cargo: 'Professor',
      tel: '(19) 3863-5219'
    }
  ]
};

// Função simples para gerar RG válido (apenas tamanho e dígitos)
function gerarRGValido(): string {
  let rg = '';
  for (let i = 0; i < 9; i++) {
    rg += Math.floor(Math.random() * 10);
  }
  return formatRG(rg);
}

// Gera CPFs e RGs válidos e formatados para professores
function gerarProfessoresValidos() {
  const nomes = [
    ['José Marcos', 'Romão Júnior'],
    ['Gilberto Brandão', 'Marcon'],
    ['Márcia Regina', 'Reggiolli'],
    ['Carlos Eduardo', 'Silva Santos'],
    ['Ana Paula', 'Oliveira Costa'],
    ['Ricardo', 'Ferreira Lima'],
    ['Fernanda', 'Mendes Rocha'],
    ['Paulo Roberto', 'Alves Pereira'],
    ['Luciana', 'Barbosa Martins'],
    ['Roberto Carlos', 'Souza Nunes']
  ];
  const cargos: string[] = [
    'Coordenador',
    'Coordenador',
    'Coordenadora',
    'Professor',
    'Professora',
    'Professor',
    'Professora',
    'Professor',
    'Professora',
    'Professor'
  ];
  const tels = [
    '(19) 3863-5210', '(19) 3863-5211', '(19) 3863-5212', '(19) 3863-5213', '(19) 3863-5214',
    '(19) 3863-5215', '(19) 3863-5216', '(19) 3863-5217', '(19) 3863-5218', '(19) 3863-5219'
  ];
  const datasNasc = [
    '1975-03-15', '1970-08-22', '1978-11-10', '1980-05-18', '1983-09-25',
    '1977-12-03', '1985-04-14', '1974-07-28', '1981-01-20', '1979-10-12'
  ];

  const professores: {
    idProfessor: string;
    nome: string;
    sobrenome: string;
    rg: string;
    dataNasc: Date;
    cargo: string;
    tel: string;
    fotoPath?: string | null;
    docsPath?: string | null;
    descricao?: string | null;
  }[] = [];
  for (let i = 0; i < 10; i++) {
    let cpf: string;
    let rg: string;
    // Garante que o CPF e RG gerados são válidos e únicos na lista
    do {
      cpf = gerarCPFValido();
    } while (professores.some(p => p.idProfessor === cpf));
    do {
      rg = gerarRGValido();
    } while (professores.some(p => p.rg === rg));
    professores.push({
      idProfessor: cpf,
      nome: nomes[i][0],
      sobrenome: nomes[i][1],
      rg: rg,
      dataNasc: new Date(datasNasc[i]),
      cargo: cargos[i],
      tel: tels[i],
      fotoPath: null,
      docsPath: null,
      descricao: null
    });
  }
  return professores;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.confirm) {
      return NextResponse.json({
        success: false,
        error: 'Confirmação necessária para resetar o banco.'
      }, { status: 400 });
    }

    console.log('🔄 Iniciando reset do banco de dados...');

    // TRUNCATE nas tabelas para reset total (MySQL)
    const tables = [
      'AtestadoAulas', 'AtestadosMedicos', 'Presencas', 'DocsAulas', 'Aula', 'TurmaAluno', 'Turmas',
      'HistoricoEscolar', 'Notas', 'Enderecos', 'ContatoAluno', 'Alunos', 'DocumentosPreCadastro', 'PreCadastro',
      'CursoMaterias', 'Materias', 'Professores', 'Curso', 'Usuarios', 'Log', 'DiasNaoLetivos'
    ];
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM \`${table}\`;`);
      } catch (err) {
        console.warn(`Não foi possível limpar a tabela ${table}:`, err);
      }
    }
    console.log('✅ Todas as tabelas limpas');

    // 1. Usuários e Professores/Alunos de demonstração (garantir prioridade)
    const salt = await bcrypt.genSalt(10);

    // CPFs fixos para os usuários de demonstração
    const adminCpf = '111.222.333-96';
    const coordCpf = '839.582.438-60';
    const profCpf = '649.565.688-27';
    const alunoCpf = '477.719.710-75';

    // Professores válidos (garantir que os 3 primeiros sejam os de demonstração)
    const professoresValidos = gerarProfessoresValidos();
    professoresValidos[0].idProfessor = adminCpf;
    professoresValidos[0].nome = 'José Marcos';
    professoresValidos[0].sobrenome = 'Romão Júnior';
    professoresValidos[0].cargo = 'Coordenador';

    professoresValidos[1].idProfessor = coordCpf;
    professoresValidos[1].nome = 'Gilberto Brandão';
    professoresValidos[1].sobrenome = 'Marcon';
    professoresValidos[1].cargo = 'Coordenador';

    professoresValidos[2].idProfessor = profCpf;
    professoresValidos[2].nome = 'Márcia Regina';
    professoresValidos[2].sobrenome = 'Reggiolli';
    professoresValidos[2].cargo = 'Coordenadora';

    // Usuários de demonstração
    const usuarios = [
      { cpf: adminCpf, senhaHash: await bcrypt.hash('admin', salt), tipo: 'Admin' as const },
      { cpf: coordCpf, senhaHash: await bcrypt.hash('coord123', salt), tipo: 'Coordenador' as const },
      { cpf: profCpf, senhaHash: await bcrypt.hash('prof123', salt), tipo: 'Professor' as const },
      { cpf: alunoCpf, senhaHash: await bcrypt.hash('aluno123', salt), tipo: 'Aluno' as const }
    ];

    await prisma.usuarios.createMany({ data: usuarios });

    // Cria também o aluno correspondente ao usuário '477.719.710-75'
    await prisma.alunos.create({
      data: {
        nome: 'Aluno1',
        sobrenome: 'Silva Santos',
        cpf: alunoCpf,
        rg: '12.345.678-9',
        nomeMae: 'Maria Teste',
        nomePai: 'João Teste',
        dataNasc: new Date('2001-01-01'),
        descricao: 'Aluno do 3º semestre de Gestão Empresarial'
      }
    });

    // 2. Professores
    await prisma.professores.createMany({ data: professoresValidos });
    console.log('✅ Usuários, aluno de teste e professores criados');

    // 3. Cursos
    await prisma.curso.createMany({ data: FATEC_DATA.cursos });
    const cursos = await prisma.curso.findMany();

    // 4. Matérias
    await prisma.materias.createMany({ data: FATEC_DATA.materias });
    const materias = await prisma.materias.findMany();

    // 5. Vincular matérias aos cursos
    const cursoMaterias = [];
    for (let i = 0; i < cursos.length; i++) {
      const materiasPorCurso = materias.slice(i * 5, (i + 1) * 5);
      for (const materia of materiasPorCurso) {
        cursoMaterias.push({
          idCurso: cursos[i].idCurso,
          idMateria: materia.idMateria,
          cargaHoraria: 80
        });
      }
    }
    await prisma.cursoMaterias.createMany({ data: cursoMaterias });

    // 6. Alunos (além do aluno de demonstração)
    const alunosData = [];
    const usuariosAlunosData = [];
    for (let i = 2; i <= 10; i++) {
      const cpf = gerarCPFValido();
      const rg = gerarRGValido();
      alunosData.push({
        nome: `Aluno${i}`,
        sobrenome: `Santos Silva`,
        cpf,
        rg,
        nomeMae: `Maria Santos Silva ${i}`,
        nomePai: `João Santos Silva ${i}`,
        dataNasc: new Date(2000 + i, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        descricao: `Aluno do ${Math.ceil(i / 3)}º semestre`
      });
      usuariosAlunosData.push({
        cpf,
        senhaHash: await bcrypt.hash(cpf, salt),
        tipo: 'Aluno' as const
      });
    }
    await prisma.alunos.createMany({ data: alunosData });
    await prisma.usuarios.createMany({ data: usuariosAlunosData });
    const alunos = await prisma.alunos.findMany();

    // 7. Endereços e contatos para alunos
    const enderecosData = alunos.map((aluno, i) => ({
      idAluno: aluno.idAluno,
      cep: `13450-${(100 + i).toString().padStart(3, '0')}`,
      rua: `Rua das Flores, ${100 + i}`,
      cidade: 'Itapira',
      uf: 'SP',
      numero: (100 + i).toString()
    }));

    const contatosData = alunos.map((aluno, i) => ({
      idAluno: aluno.idAluno,
      nomeTel1: 'Celular',
      tel1: `(19) 9${(8000 + i).toString()}-${(1000 + i).toString()}`,
      nomeTel2: 'Casa',
      tel2: `(19) 3863-${(5000 + i).toString()}`
    }));

    await prisma.$transaction(async (tx) => {
      await tx.enderecos.createMany({ data: enderecosData });
      await tx.contatoAluno.createMany({ data: contatosData });
    }, { timeout: 30000 });

    // 8. Turmas
    const turmasData = [];
    for (let i = 1; i <= 10; i++) {
      const cursoIndex = (i - 1) % 3;
      turmasData.push({
        idCurso: cursos[cursoIndex].idCurso,
        nomeTurma: `${cursos[cursoIndex].nomeCurso.split(' ')[0]} ${Math.ceil(i / 3)}° Sem`,
        anoLetivo: 2024
      });
    }
    await prisma.turmas.createMany({ data: turmasData });
    const turmas = await prisma.turmas.findMany();

    // 9. Matricular alunos nas turmas
    const matriculasData = alunos.map((aluno, i) => ({
      idTurma: turmas[i % turmas.length].idTurma,
      idAluno: aluno.idAluno,
      statusMatricula: 'Ativa' as const
    }));
    await prisma.turmaAluno.createMany({ data: matriculasData });

    // 10. Criar aulas
    const aulasData = [];
    const dataBase = new Date('2024-03-01');
    for (const turma of turmas) {
      const cursoMateriasTurma = await prisma.cursoMaterias.findMany({
        where: { idCurso: turma.idCurso },
        include: { materia: true }
      });
      for (let semana = 0; semana < 10; semana++) {
        for (const cm of cursoMateriasTurma) {
          const dataAula = new Date(dataBase);
          dataAula.setDate(dataBase.getDate() + (semana * 7) + (Math.floor(Math.random() * 5)));
          aulasData.push({
            idTurma: turma.idTurma,
            idMateria: cm.idMateria,
            dataAula: dataAula,
            horario: '19:00',
            duracaoMinutos: 180,
            aulaConcluida: semana < 8,
            presencasAplicadas: semana < 8,
            descricao: `Aula de ${cm.materia.nomeMateria}`,
            conteudoMinistrado: semana < 8 ? `Conteúdo da semana ${semana + 1}` : null
          });
        }
      }
    }
    const batchSize = 50;
    for (let i = 0; i < aulasData.length; i += batchSize) {
      const batch = aulasData.slice(i, i + batchSize);
      await prisma.aula.createMany({ data: batch });
    }
    const aulas = await prisma.aula.findMany();

    // 11. DocsAulas (um arquivo por aula)
    const docsAulasData = aulas.slice(0, 10).map((aula, i) => ({
      idAula: aula.idAula,
      src: `/pastas/aulas/${aula.idAula}/material${i + 1}.pdf`
    }));
    await prisma.docsAula.createMany({ data: docsAulasData });

    // 12. Presenças
    const presencasData = [];
    const aulasConc = aulas.filter(a => a.aulaConcluida);
    for (const aula of aulasConc) {
      const alunosDaTurma = await prisma.turmaAluno.findMany({
        where: { idTurma: aula.idTurma }
      });
      for (const ta of alunosDaTurma) {
        presencasData.push({
          idAula: aula.idAula,
          idAluno: ta.idAluno,
          idProfessor: professoresValidos[Math.floor(Math.random() * professoresValidos.length)].idProfessor,
          presente: Math.random() > 0.2,
          dataRegistro: aula.dataAula
        });
      }
    }
    const presencaBatchSize = 100;
    for (let i = 0; i < presencasData.length; i += presencaBatchSize) {
      const batch = presencasData.slice(i, i + presencaBatchSize);
      await prisma.presencas.createMany({ data: batch });
    }

    // 13. Notas
    const notasData = [];
    const tiposAvaliacao = ['Prova 1', 'Prova 2', 'Trabalho', 'Projeto', 'Seminário'];
    for (const turma of turmas) {
      const alunosDaTurma = await prisma.turmaAluno.findMany({
        where: { idTurma: turma.idTurma }
      });
      const cursoMateriasTurma = await prisma.cursoMaterias.findMany({
        where: { idCurso: turma.idCurso },
        include: { materia: true }
      });
      for (const ta of alunosDaTurma) {
        for (const cm of cursoMateriasTurma) {
          for (let i = 0; i < 3; i++) {
            notasData.push({
              nome: `${tiposAvaliacao[i % tiposAvaliacao.length]} - ${cm.materia?.nomeMateria || 'Matéria'}`,
              idAluno: ta.idAluno,
              idMateria: cm.idMateria,
              idTurma: turma.idTurma,
              idProfessor: professoresValidos[Math.floor(Math.random() * professoresValidos.length)].idProfessor,
              valorNota: Math.round((Math.random() * 4 + 6) * 100) / 100,
              tipoAvaliacao: tiposAvaliacao[i % tiposAvaliacao.length],
              dataLancamento: new Date()
            });
          }
        }
      }
    }
    const notasBatchSize = 100;
    for (let i = 0; i < notasData.length; i += notasBatchSize) {
      const batch = notasData.slice(i, i + notasBatchSize);
      await prisma.notas.createMany({ data: batch });
    }

    // 14. HistoricoEscolar (um por aluno)
    const historicoEscolarData = alunos.map((aluno, i) => ({
      idAluno: aluno.idAluno,
      idCurso: cursos[i % cursos.length].idCurso,
      idMateria: materias[i % materias.length].idMateria,
      nota: Math.round((Math.random() * 4 + 6) * 100) / 100,
      frequencia: Math.round((Math.random() * 20 + 80) * 100) / 100
    }));
    await prisma.historicoEscolar.createMany({ data: historicoEscolarData });

    // 15. Dias não letivos
    const diasNaoLetivos = [
      { data: new Date('2024-04-21'), descricao: 'Tiradentes' },
      { data: new Date('2024-05-01'), descricao: 'Dia do Trabalhador' },
      { data: new Date('2024-09-07'), descricao: 'Independência do Brasil' },
      { data: new Date('2024-10-12'), descricao: 'Nossa Senhora Aparecida' },
      { data: new Date('2024-11-02'), descricao: 'Finados' },
      { data: new Date('2024-11-15'), descricao: 'Proclamação da República' },
      { data: new Date('2024-12-25'), descricao: 'Natal' }
    ];
    await prisma.diasNaoLetivos.createMany({ data: diasNaoLetivos });

    // 16. Log
    const logsData = [
      { action: 'Sistema resetado e populado com dados de demonstração', dateTime: new Date() },
      { action: 'Usuários administrativos criados', dateTime: new Date() },
      { action: 'Dados da FATEC Itapira importados', dateTime: new Date() }
    ];
    await prisma.log.createMany({ data: logsData });

    // 17. Pré-cadastros e documentos
    const preCadastrosData = [];
    const documentosPreCadastroData = [];
    // Certifique-se de que 'cursos' está disponível neste escopo
    for (let i = 1; i <= 5; i++) {
      const cpf = gerarCPFValido();
      preCadastrosData.push({
        nome: `Candidato${i}`,
        sobrenome: `Teste${i}`,
        cpf,
        rg: gerarRGValido(),
        nomeMae: `Maria Candidata${i}`,
        nomePai: `João Candidato${i}`,
        dataNasc: new Date(2000 + i, 1, 1),
        email: `candidato${i}@mail.com`,
        telefone: `19999999${100 + i}`,
        telefoneResponsavel: null,
        nomeResponsavel: null,
        cep: `13450-00${i}`,
        rua: `Rua dos Pré-Cadastros, ${i}`,
        cidade: 'Itapira',
        uf: 'SP',
        numero: `${i}`,
        complemento: null,
        status: StatusPreCadastro.Pendente,
        dataEnvio: new Date(),
        dataAvaliacao: null,
        avaliadoPor: null,
        observacoes: null,
        motivoRejeicao: null,
        idCursoDesejado: cursos[(i - 1) % cursos.length].idCurso // Adiciona o campo obrigatório
      });
      documentosPreCadastroData.push({
        idPreCadastro: i,
        tipoDocumento: TipoDocumento.RG,
        nomeArquivo: `rg_candidato${i}.pdf`,
        caminhoArquivo: `alunos/${cpf}/rg_candidato${i}.pdf`,
        tamanhoArquivo: 1024 * 100,
      });
    }
    await prisma.preCadastro.createMany({ data: preCadastrosData });
    await prisma.documentosPreCadastro.createMany({ data: documentosPreCadastroData });

    const atestadosData = alunos.slice(0, 3).map((aluno, i) => ({
      idAluno: aluno.idAluno,
      dataInicio: new Date('2024-05-01'),
      dataFim: new Date('2024-05-05'),
      motivo: 'Doença',
      arquivoPath: `/pastas/alunos/${aluno.cpf}/atestado${i + 1}.pdf`,
      status: StatusAtestado.Pendente,
      observacoes: null,
      avaliadoPor: professoresValidos[0].idProfessor,
      dataAvaliacao: null,
      justificativaRejeicao: null
    }));
    await prisma.atestadosMedicos.createMany({ data: atestadosData });
    const atestados = await prisma.atestadosMedicos.findMany();
    const atestadoAulasData = atestados.map((at, i) => ({
      idAtestado: at.idAtestado,
      idAula: aulas[i]?.idAula || aulas[0].idAula,
      aplicado: false,
      dataAplicacao: null
    }));
    await prisma.atestadoAulas.createMany({ data: atestadoAulasData });

    // Resumo
    const resumo = {
      usuarios: await prisma.usuarios.count(),
      cursos: cursos.length,
      materias: materias.length,
      professores: professoresValidos.length,
      alunos: alunos.length,
      turmas: turmas.length,
      aulas: aulas.length,
      presencas: presencasData.length,
      notas: notasData.length,
      historico: historicoEscolarData.length,
      preCadastros: preCadastrosData.length,
      atestados: atestadosData.length,
      diasNaoLetivos: diasNaoLetivos.length,
      logs: logsData.length
    };

    console.log('🎉 Reset concluído com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Banco resetado e populado com sucesso!',
      summary: `Criados: ${JSON.stringify(resumo)}`,
      data: resumo
    });

  } catch (error) {
    console.error('❌ Erro ao resetar banco:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor ao resetar banco',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
