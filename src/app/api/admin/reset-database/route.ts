import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { formatRG, gerarCPFValido } from '@/utils/cpf-rg';
import { StatusPreCadastro, TipoDocumento, Prisma } from '@prisma/client';

// Dados da FATEC Itapira

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

// Novos cursos para cursinho pré-vestibular
const CURSINHO_CURSOS = [
  {
    nomeCurso: 'Pré-Vestibular Extensivo',
    cargaHorariaTotal: 800,
    descricao: 'Curso anual com foco em todas as disciplinas do ensino médio para vestibulares e ENEM.'
  },
  {
    nomeCurso: 'Pré-Vestibular Intensivo',
    cargaHorariaTotal: 400,
    descricao: 'Curso intensivo para revisão dos principais conteúdos do ensino médio.'
  },
  {
    nomeCurso: 'Pré-Vestibular ENEM',
    cargaHorariaTotal: 600,
    descricao: 'Curso direcionado para o ENEM, com foco em resolução de provas e simulados.'
  }
];

// Matérias típicas do ensino médio/cursinho
const CURSINHO_MATERIAS = [
  { nomeMateria: 'Matemática' },
  { nomeMateria: 'Português' },
  { nomeMateria: 'Física' },
  { nomeMateria: 'Química' },
  { nomeMateria: 'Biologia' },
  { nomeMateria: 'Geografia' },
  { nomeMateria: 'História' },
  { nomeMateria: 'Inglês' },
  { nomeMateria: 'Literatura' },
  { nomeMateria: 'Redação' },
  { nomeMateria: 'Filosofia' },
  { nomeMateria: 'Sociologia' },
  { nomeMateria: 'Artes' },
  { nomeMateria: 'Educação Física' },
  { nomeMateria: 'Atualidades' }
];

// Nomes e sobrenomes reais para alunos
const ALUNOS_NOMES = [
  ['Lucas', 'Silva'],
  ['Mariana', 'Oliveira'],
  ['Pedro', 'Santos'],
  ['Ana', 'Souza'],
  ['Gabriel', 'Ferreira'],
  ['Julia', 'Almeida'],
  ['Rafael', 'Costa'],
  ['Beatriz', 'Martins'],
  ['Felipe', 'Rocha'],
  ['Larissa', 'Barbosa']
];

export async function POST(request: NextRequest) {
  const steps: string[] = [];
  let progress = 0;
  const totalSteps = 18;

  function logStep(msg: string) {
    steps.push(msg);
    progress = Math.round((steps.length / totalSteps) * 100);
    console.log(msg);
  }

  try {
    const body = await request.json();
    if (!body.confirm) {
      return NextResponse.json({
        success: false,
        error: 'Confirmação necessária para resetar o banco.'
      }, { status: 400 });
    }

    logStep('🔄 Iniciando reset do banco de dados...');

    // TRUNCATE nas tabelas para reset total (MySQL)
    // Desabilita as constraints de chave estrangeira, faz TRUNCATE e reabilita
    try {
      await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);
      const tables = [
        'AtestadoAulas', 'AtestadosMedicos', 'Presencas', 'DocsAulas', 'Aula', 'TurmaAluno', 'Turmas',
        'HistoricoEscolar', 'Notas', 'Enderecos', 'ContatoAluno', 'Alunos', 'DocumentosPreCadastro', 'PreCadastro',
        'CursoMaterias', 'Materias', 'Professores', 'Curso', 'Usuarios', 'Log', 'DiasNaoLetivos'
      ];
      for (const table of tables) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
      }
      await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);
    } catch (err) {
      logStep('❌ Erro ao executar TRUNCATE nas tabelas: ' + (err instanceof Error ? err.message : String(err)));
      throw err;
    }
    logStep('✅ Todas as tabelas limpas');

    // 1. Usuários e Professores/Alunos de demonstração
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
    logStep('Usuários principais criados (1/18)');

    await prisma.alunos.create({
      data: {
        nome: 'Lucas',
        sobrenome: 'Silva',
        cpf: alunoCpf,
        rg: '12.345.678-9',
        nomeMae: 'Maria Silva',
        nomePai: 'João Silva',
        dataNasc: new Date('2005-01-01'),
        descricao: 'Aluno do Pré-Vestibular Extensivo'
      }
    });
    logStep('Aluno principal criado (2/18)');

    await prisma.professores.createMany({ data: professoresValidos });
    logStep('Professores criados (3/18)');

    await prisma.curso.createMany({ data: CURSINHO_CURSOS });
    const cursos = await prisma.curso.findMany();
    logStep('Cursos criados (4/18)');

    await prisma.materias.createMany({ data: CURSINHO_MATERIAS });
    const materias = await prisma.materias.findMany();
    logStep('Matérias criadas (5/18)');

    const cursoMaterias = [];
    for (const curso of cursos) {
      for (const materia of materias) {
        cursoMaterias.push({
          idCurso: curso.idCurso,
          idMateria: materia.idMateria,
          cargaHoraria: 40
        });
      }
    }
    await prisma.cursoMaterias.createMany({ data: cursoMaterias });
    logStep('Vínculos curso-matéria criados (6/18)');

    const alunosData = [];
    const usuariosAlunosData = [];
    for (let i = 0; i < ALUNOS_NOMES.length; i++) {
      const [nome, sobrenome] = ALUNOS_NOMES[i];
      const cpf = gerarCPFValido();
      const rg = gerarRGValido();
      alunosData.push({
        nome,
        sobrenome,
        cpf,
        rg,
        nomeMae: `Maria ${sobrenome}`,
        nomePai: `João ${sobrenome}`,
        dataNasc: new Date(2005, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        descricao: `Aluno do cursinho pré-vestibular`
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
    logStep('Alunos e usuários de alunos criados (7/18)');

    const enderecosData = alunos.map((aluno, i) => ({
      idAluno: aluno.idAluno,
      cep: `13450-${(100 + i).toString().padStart(3, '0')}`,
      rua: `Rua dos Estudantes, ${100 + i}`,
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
    logStep('Endereços e contatos dos alunos criados (8/18)');

    const turmasData = [];
    for (let i = 0; i < cursos.length; i++) {
      turmasData.push({
        idCurso: cursos[i].idCurso,
        nomeTurma: `${cursos[i].nomeCurso} - Turma ${i + 1}`,
        anoLetivo: 2024
      });
    }
    await prisma.turmas.createMany({ data: turmasData });
    const turmas = await prisma.turmas.findMany();
    logStep('Turmas criadas (9/18)');

    const matriculasData = alunos.map((aluno, i) => ({
      idTurma: turmas[i % turmas.length].idTurma,
      idAluno: aluno.idAluno,
      statusMatricula: 'Ativa' as const
    }));
    await prisma.turmaAluno.createMany({ data: matriculasData });
    logStep('Matrículas de alunos nas turmas criadas (10/18)');

    // 10. Criar aulas (distribuição realista, só aulas passadas estão ministradas)
    const aulasData = [];
    const diasSemana = [1, 2, 3, 4, 5]; // Segunda a Sexta
    const dataBase = new Date('2025-01-06'); // Primeira segunda-feira de 2025
    const totalSemanas = 40;
    const hoje = new Date();

    // Buscar turmas, materias e cursoMaterias novamente para garantir integridade
    const turmasAtualizadas = await prisma.turmas.findMany();
    const materiasAtualizadas = await prisma.materias.findMany();
    const cursoMateriasAtualizadas = await prisma.cursoMaterias.findMany();

    // Garante que todas as turmas, materias e cursoMaterias existem
    if (!turmasAtualizadas.length || !materiasAtualizadas.length || !cursoMateriasAtualizadas.length) {
      logStep('❌ Falha ao buscar turmas, matérias ou vínculos curso-matéria. Verifique se as etapas anteriores foram concluídas.');
      throw new Error('Falha ao buscar turmas, matérias ou vínculos curso-matéria.');
    }

    for (const turma of turmasAtualizadas) {
      const cursoMateriasTurma = cursoMateriasAtualizadas.filter(cm => cm.idCurso === turma.idCurso);
      let materiaIndex = 0;
      for (const cm of cursoMateriasTurma) {
        // Garante que a matéria existe
        const materia = materiasAtualizadas.find(m => m.idMateria === cm.idMateria);
        if (!materia) continue;
        for (let semana = 0; semana < totalSemanas; semana++) {
          const diaSemana = diasSemana[(materiaIndex + semana) % diasSemana.length];
          const dataAula = new Date(dataBase);
          dataAula.setDate(dataBase.getDate() + (semana * 7) + (diaSemana - 1));
          aulasData.push({
            idTurma: turma.idTurma,
            idMateria: cm.idMateria,
            dataAula: dataAula,
            horario: `${18 + (materiaIndex % 3)}:30`,
            duracaoMinutos: 120,
            aulaConcluida: dataAula < hoje,
            presencasAplicadas: dataAula < hoje,
            descricao: `Aula de ${materia.nomeMateria}`,
            conteudoMinistrado: dataAula < hoje
              ? `Conteúdo da semana ${semana + 1} de ${materia.nomeMateria} - ${dataAula.toLocaleDateString('pt-BR')}`
              : null
          });
        }
        materiaIndex++;
      }
    }

    // Antes de criar as aulas, verifique se todos os idTurma e idMateria existem
    const turmaIds = new Set(turmasAtualizadas.map(t => t.idTurma));
    const materiaIds = new Set(materiasAtualizadas.map(m => m.idMateria));
    const aulasFiltradas = aulasData.filter(a =>
      turmaIds.has(a.idTurma) && materiaIds.has(a.idMateria)
    );

    // Criação em lotes menores para evitar erro de constraint
    const batchSize = 25;
    for (let i = 0; i < aulasFiltradas.length; i += batchSize) {
      const batch = aulasFiltradas.slice(i, i + batchSize);
      try {
        await prisma.aula.createMany({ data: batch, skipDuplicates: true });
      } catch (err: unknown) {
        if (typeof err === 'object' && err !== null && 'code' in err && 'message' in err) {
          logStep(`❌ Erro ao criar lote de aulas: ${(err as { code?: string; message?: string }).code || ''} ${(err as { message?: string }).message || err}`);
        } else {
          logStep(`❌ Erro ao criar lote de aulas: ${String(err)}`);
        }
        throw err;
      }
    }
    const aulas = await prisma.aula.findMany();
    logStep('Aulas criadas (11/17)');

    // 12. Presenças (apenas para aulas já ministradas)
    // Ajuste: limite o número de aulas para presenças para evitar travamento
    const alunosAtualizados = await prisma.alunos.findMany();
    const professoresAtualizados = await prisma.professores.findMany();
    const alunosIdsSet = new Set(alunosAtualizados.map(a => a.idAluno));
    const professoresIdsSet = new Set(professoresAtualizados.map(p => p.idProfessor));
    const presencasData = [];

    // Limite de aulas para presenças (ex: só as 100 primeiras aulas concluídas)
    const aulasParaPresenca = aulas.filter(a => a.aulaConcluida).slice(0, 100);

    for (const aula of aulasParaPresenca) {
      const alunosDaTurma = await prisma.turmaAluno.findMany({
        where: { idTurma: aula.idTurma }
      });
      for (const ta of alunosDaTurma) {
        if (!alunosIdsSet.has(ta.idAluno)) continue;
        const idProfessor = professoresAtualizados[Math.floor(Math.random() * professoresAtualizados.length)]?.idProfessor;
        if (!idProfessor || !professoresIdsSet.has(idProfessor)) continue;
        presencasData.push({
          idAula: aula.idAula,
          idAluno: ta.idAluno,
          idProfessor,
          presente: Math.random() > 0.15,
          dataRegistro: aula.dataAula
        });
      }
    }
    const presencaBatchSize = 100;
    for (let i = 0; i < presencasData.length; i += presencaBatchSize) {
      const batch = presencasData.slice(i, i + presencaBatchSize);
      try {
        await prisma.presencas.createMany({ data: batch, skipDuplicates: true });
      } catch (err: unknown) {
        if (typeof err === 'object' && err !== null && 'code' in err && 'message' in err) {
          logStep(`❌ Erro ao criar lote de presenças: ${(err as { code?: string; message?: string }).code || ''} ${(err as { message?: string }).message || err}`);
        } else {
          logStep(`❌ Erro ao criar lote de presenças: ${String(err)}`);
        }
        throw err;
      }
    }
    logStep('Presenças lançadas (12/17)');

    // 13. Notas (apenas para aulas já ministradas)
    const notasData = [];
    const tiposAvaliacao = ['Simulado', 'Redação', 'Prova', 'Exercício', 'Trabalho'];
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
          for (let i = 0; i < 2; i++) {
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
    logStep('Notas lançadas (13/17)');

    // 14. Histórico Escolar (dados fictícios)
    const historicoEscolarData = alunos.map((aluno, i) => ({
      idAluno: aluno.idAluno,
      idCurso: cursos[i % cursos.length].idCurso,
      idMateria: materias[i % materias.length].idMateria,
      nota: Math.round((Math.random() * 4 + 6) * 100) / 100,
      frequencia: Math.round((Math.random() * 20 + 80) * 100) / 100
    }));
    await prisma.historicoEscolar.createMany({ data: historicoEscolarData });
    logStep('Histórico escolar criado (14/17)');

    // 15. Dias não letivos (feriados nacionais e simulados)
    const diasNaoLetivos = [
      { data: new Date('2025-01-01'), descricao: 'Ano Novo' },
      { data: new Date('2025-02-28'), descricao: 'Carnaval' },
      { data: new Date('2025-04-18'), descricao: 'Sexta-feira Santa' },
      { data: new Date('2025-04-21'), descricao: 'Tiradentes' },
      { data: new Date('2025-05-01'), descricao: 'Dia do Trabalhador' },
      { data: new Date('2025-06-19'), descricao: 'Corpus Christi' },
      { data: new Date('2025-09-07'), descricao: 'Independência do Brasil' },
      { data: new Date('2025-10-12'), descricao: 'Nossa Senhora Aparecida' },
      { data: new Date('2025-11-02'), descricao: 'Finados' },
      { data: new Date('2025-11-15'), descricao: 'Proclamação da República' },
      { data: new Date('2025-12-25'), descricao: 'Natal' },
      { data: new Date('2025-07-09'), descricao: 'Recesso Escolar' },
      { data: new Date('2025-07-10'), descricao: 'Recesso Escolar' }
    ];
    await prisma.diasNaoLetivos.createMany({ data: diasNaoLetivos });
    logStep('Dias não letivos cadastrados (15/17)');

    // 16. Log
    const logsData = [
      { action: 'Sistema resetado e populado com dados de demonstração', dateTime: new Date() },
      { action: 'Usuários administrativos criados', dateTime: new Date() },
      { action: 'Dados do cursinho pré-vestibular importados', dateTime: new Date() }
    ];
    await prisma.log.createMany({ data: logsData });
    logStep('Logs do sistema criados (16/17)');

    // 17. Pré-cadastros e documentos (documentos inexistentes fisicamente)
    const preCadastrosData = [];
    const documentosPreCadastroData: Array<{ idPreCadastro?: number; tipoDocumento: TipoDocumento; nomeArquivo: string; caminhoArquivo: string; tamanhoArquivo: number }> = [];
    for (let i = 1; i <= 5; i++) {
      const cpf = gerarCPFValido();
      preCadastrosData.push({
        nome: `Candidato${i}`,
        sobrenome: `Teste${i}`,
        cpf,
        rg: gerarRGValido(),
        nomeMae: `Maria Candidata${i}`,
        nomePai: `João Candidato${i}`,
        dataNasc: new Date(2006 + i, 1, 1),
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
        idCursoDesejado: cursos[(i - 1) % cursos.length].idCurso
      });
      // Não preencha idPreCadastro manualmente, pois será autoincrementado
      documentosPreCadastroData.push({
        // idPreCadastro será preenchido após inserção dos pré-cadastros
        tipoDocumento: TipoDocumento.RG,
        nomeArquivo: `arquivo_inexistente_gerado_pelo_reset.pdf`,
        caminhoArquivo: `alunos/${cpf}/arquivo_inexistente_gerado_pelo_reset.pdf`,
        tamanhoArquivo: 1024 * 100,
      });
    }
    // Cria os pré-cadastros e obtém os IDs gerados
    await prisma.preCadastro.createMany({
      data: preCadastrosData,
      skipDuplicates: true
    });
    // Busca os pré-cadastros recém-criados para obter os IDs corretos
    const preCadastrosInseridos = await prisma.preCadastro.findMany({
      orderBy: { idPreCadastro: 'desc' },
      take: preCadastrosData.length
    });
    // Associa os documentos aos IDs corretos
    for (let i = 0; i < documentosPreCadastroData.length; i++) {
      if (preCadastrosInseridos[i]?.idPreCadastro) {
        documentosPreCadastroData[i] = {
          ...documentosPreCadastroData[i],
          idPreCadastro: preCadastrosInseridos[i].idPreCadastro
        };
      }
    }
    // Só cria documentos se houver IDs válidos
    if (documentosPreCadastroData.every(d => typeof d.idPreCadastro === 'number')) {
      await prisma.documentosPreCadastro.createMany({ data: documentosPreCadastroData as Prisma.DocumentosPreCadastroCreateManyInput[] });
      logStep('Pré-cadastros e documentos criados (17/17)');
    } else {
      logStep('⚠️ Não foi possível associar documentos aos pré-cadastros (IDs não encontrados)');
    }

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
      diasNaoLetivos: diasNaoLetivos.length,
      logs: logsData.length
    };

    logStep('🎉 Reset concluído com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Banco resetado e populado com sucesso!',
      summary: `Criados: ${JSON.stringify(resumo)}`,
      data: resumo,
      steps,
      progress
    });

  } catch (error) {
    console.error('❌ Erro ao resetar banco:', error);
    steps.push('❌ Erro ao resetar banco: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor ao resetar banco',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      steps,
      progress
    });
  } finally {
    await prisma.$disconnect();
  }
}
