import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

    // 1. Deletar todos os dados SEM transação para evitar timeout
    console.log('🗑️ Removendo dados existentes...');
    
    // Remova as tabelas na ordem correta para evitar violação de foreign key
    // Ordem sugerida: dependentes -> principais

    await prisma.atestadoAulas.deleteMany();
    await prisma.atestadosMedicos.deleteMany();
    await prisma.presencas.deleteMany();
    await prisma.docsAula.deleteMany();
    await prisma.aula.deleteMany();
    await prisma.turmaAluno.deleteMany();
    await prisma.turmas.deleteMany();
    await prisma.historicoEscolar.deleteMany();
    await prisma.notas.deleteMany();
    await prisma.enderecos.deleteMany();
    await prisma.contatoAluno.deleteMany();
    await prisma.alunos.deleteMany();
    await prisma.documentosPreCadastro.deleteMany();
    await prisma.preCadastro.deleteMany();
    await prisma.cursoMaterias.deleteMany();
    await prisma.materias.deleteMany();
    await prisma.professores.deleteMany();
    await prisma.curso.deleteMany();
    await prisma.usuarios.deleteMany();
    await prisma.log.deleteMany();
    await prisma.diasNaoLetivos.deleteMany();

    console.log('✅ Todos os dados antigos removidos');

    // 2. Criar dados básicos primeiro
    const salt = await bcrypt.genSalt(10);
    const usuarios = [
      { cpf: '111.222.333-96', senhaHash: await bcrypt.hash('admin', salt), tipo: 'Admin' as const },
      { cpf: '839.582.438-60', senhaHash: await bcrypt.hash('coord123', salt), tipo: 'Coordenador' as const },
      { cpf: '649.565.688-27', senhaHash: await bcrypt.hash('prof123', salt), tipo: 'Professor' as const },
      { cpf: '390.533.128-40', senhaHash: await bcrypt.hash('aluno123', salt), tipo: 'Aluno' as const }
    ];

    await prisma.usuarios.createMany({ data: usuarios });
    console.log('✅ Usuários criados');

    // 3. Criar cursos
    await prisma.curso.createMany({ data: FATEC_DATA.cursos });
    const cursos = await prisma.curso.findMany();
    console.log('✅ Cursos criados');

    // 4. Criar matérias
    await prisma.materias.createMany({ data: FATEC_DATA.materias });
    const materias = await prisma.materias.findMany();
    console.log('✅ Matérias criadas');

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
    console.log('✅ Matérias vinculadas aos cursos');

    // 6. Criar professores
    await prisma.professores.createMany({ data: FATEC_DATA.professores });
    console.log('✅ Professores criados');

    // 7. Criar alunos (10 alunos)
    const alunosData = [];
    for (let i = 1; i <= 10; i++) {
      alunosData.push({
        nome: `Aluno${i}`,
        sobrenome: `Santos Silva`,
        cpf: `${(100 + i).toString().padStart(3, '0')}.${(200 + i).toString().padStart(3, '0')}.${(300 + i).toString().padStart(3, '0')}-${(10 + i).toString().padStart(2, '0')}`,
        rg: `${(10 + i).toString().padStart(2, '0')}.${(100 + i).toString().padStart(3, '0')}.${(200 + i).toString().padStart(3, '0')}-${i.toString()}`.substring(0, 12), // Garantir max 12 chars
        nomeMae: `Maria Santos Silva ${i}`,
        nomePai: `João Santos Silva ${i}`,
        dataNasc: new Date(2000 + i, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        descricao: `Aluno do ${Math.ceil(i / 3)}º semestre`
      });
    }
    
    await prisma.alunos.createMany({ data: alunosData });
    const alunos = await prisma.alunos.findMany();
    console.log('✅ Alunos criados');

    // 8. Criar endereços e contatos para alunos em uma transação menor
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
    console.log('✅ Endereços e contatos criados');

    // 9. Criar turmas
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
    console.log('✅ Turmas criadas');

    // 10. Matricular alunos nas turmas
    const matriculasData = alunos.map((aluno, i) => ({
      idTurma: turmas[i % turmas.length].idTurma,
      idAluno: aluno.idAluno,
      statusMatricula: 'Ativa' as const
    }));
    await prisma.turmaAluno.createMany({ data: matriculasData });
    console.log('✅ Matrículas criadas');

    // 11. Criar aulas em lotes menores
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
    
    // Criar aulas em lotes de 50
    const batchSize = 50;
    for (let i = 0; i < aulasData.length; i += batchSize) {
      const batch = aulasData.slice(i, i + batchSize);
      await prisma.aula.createMany({ data: batch });
      console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} de aulas criado`);
    }
    
    const aulas = await prisma.aula.findMany();
    console.log('✅ Todas as aulas criadas');

    // 12. Criar presenças em lotes
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
          idProfessor: FATEC_DATA.professores[Math.floor(Math.random() * FATEC_DATA.professores.length)].idProfessor,
          presente: Math.random() > 0.2,
          dataRegistro: aula.dataAula
        });
      }
    }
    
    // Criar presenças em lotes de 100
    const presencaBatchSize = 100;
    for (let i = 0; i < presencasData.length; i += presencaBatchSize) {
      const batch = presencasData.slice(i, i + presencaBatchSize);
      await prisma.presencas.createMany({ data: batch });
      console.log(`✅ Lote ${Math.floor(i/presencaBatchSize) + 1} de presenças criado`);
    }
    console.log('✅ Todas as presenças criadas');

    // 13. Criar notas em lotes
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
              idProfessor: FATEC_DATA.professores[Math.floor(Math.random() * FATEC_DATA.professores.length)].idProfessor,
              valorNota: Math.round((Math.random() * 4 + 6) * 100) / 100,
              tipoAvaliacao: tiposAvaliacao[i % tiposAvaliacao.length],
              dataLancamento: new Date()
            });
          }
        }
      }
    }
    
    // Criar notas em lotes de 100
    const notasBatchSize = 100;
    for (let i = 0; i < notasData.length; i += notasBatchSize) {
      const batch = notasData.slice(i, i + notasBatchSize);
      await prisma.notas.createMany({ data: batch });
      console.log(`✅ Lote ${Math.floor(i/notasBatchSize) + 1} de notas criado`);
    }
    console.log('✅ Todas as notas criadas');

    // 14. Criar dados finais
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
    console.log('✅ Dias não letivos criados');

    const logsData = [
      { action: 'Sistema resetado e populado com dados de demonstração', dateTime: new Date() },
      { action: 'Usuários administrativos criados', dateTime: new Date() },
      { action: 'Dados da FATEC Itapira importados', dateTime: new Date() }
    ];
    
    await prisma.log.createMany({ data: logsData });
    console.log('✅ Logs criados');

    // Gerar resumo
    const resumo = {
      usuarios: usuarios.length,
      cursos: cursos.length, 
      materias: materias.length,
      professores: FATEC_DATA.professores.length,
      alunos: alunos.length,
      turmas: turmas.length,
      aulas: aulas.length,
      presencas: presencasData.length,
      notas: notasData.length
    };

    console.log('🎉 Reset concluído com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Banco resetado e populado com sucesso!',
      summary: `Criados: ${resumo.usuarios} usuários, ${resumo.cursos} cursos, ${resumo.materias} matérias, ${resumo.professores} professores, ${resumo.alunos} alunos, ${resumo.turmas} turmas, ${resumo.aulas} aulas, ${resumo.presencas} presenças e ${resumo.notas} notas.`,
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
