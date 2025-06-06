import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  success: boolean;
  data?: unknown[];
  count?: number;
  error?: string;
}

interface DebugResults {
  [key: string]: TestResult;
}

export async function GET() {
  try {
    console.log('=== DEBUG TABLES - SCHEMA CORRETO ===');
    
    // Baseado no schema.prisma fornecido:
    const tablesTests = [
      { name: 'Curso', query: () => prisma.curso.findMany() },
      { name: 'Turmas', query: () => prisma.turmas.findMany() },
      { name: 'Materias', query: () => prisma.materias.findMany() },
      { name: 'Alunos', query: () => prisma.alunos.findMany() },
      { name: 'Professores', query: () => prisma.professores.findMany() },
      { name: 'CursoMaterias', query: () => prisma.cursoMaterias.findMany() },
      { name: 'TurmaAluno', query: () => prisma.turmaAluno.findMany() },
    ];
    
    const results: DebugResults = {};
    
    for (const test of tablesTests) {
      try {
        console.log(`🔍 Testando tabela: ${test.name}`);
        const data = await test.query();
        results[test.name] = {
          success: true,
          data: data || [],
          count: data?.length || 0
        };
        console.log(`✅ ${test.name}: ${data?.length || 0} registros encontrados`);
      } catch (error) {
        results[test.name] = {
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
        console.log(`❌ ${test.name}: ERRO - ${error}`);
      }
    }
    
    // Teste específico para Turmas com relação Curso
    try {
      console.log('🔍 Testando relação Turmas -> Curso...');
      const turmasComCurso = await prisma.turmas.findMany({
        include: {
          curso: true
        }
      });
      results['Turmas_com_Curso'] = {
        success: true,
        data: turmasComCurso,
        count: turmasComCurso.length
      };
      console.log(`✅ Turmas com Curso: ${turmasComCurso.length} registros`);
      
      // Mostrar estrutura de uma turma como exemplo
      if (turmasComCurso.length > 0) {
        console.log('📋 Exemplo de estrutura de Turma:', {
          idTurma: turmasComCurso[0].idTurma,
          nomeTurma: turmasComCurso[0].nomeTurma,
          anoLetivo: turmasComCurso[0].anoLetivo,
          idCurso: turmasComCurso[0].idCurso,
          curso: turmasComCurso[0].curso
        });
      }
    } catch (error) {
      results['Turmas_com_Curso'] = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      console.log(`❌ Turmas com Curso: ${error}`);
    }

    // Teste específico para CursoMaterias
    try {
      console.log('🔍 Testando CursoMaterias com relações...');
      const cursoMaterias = await prisma.cursoMaterias.findMany({
        include: {
          curso: true,
          materia: true
        }
      });
      results['CursoMaterias_com_relacoes'] = {
        success: true,
        data: cursoMaterias,
        count: cursoMaterias.length
      };
      console.log(`✅ CursoMaterias: ${cursoMaterias.length} registros`);
    } catch (error) {
      results['CursoMaterias_com_relacoes'] = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      console.log(`❌ CursoMaterias: ${error}`);
    }

    // Verificar API CRUD com tabelas
    console.log('\n🔍 TESTANDO NOMES PARA API CRUD:');
    const apiTableNames = ['turmas', 'Turmas', 'turma', 'Turma'];
    
    for (const tableName of apiTableNames) {
      console.log(`📝 Para API CRUD, teste: table: "${tableName}"`);
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Debug completo - verifique o console do servidor',
      schemaCorreto: {
        'Para API CRUD use': {
          'Turmas': 'table: "Turmas"',
          'Curso': 'table: "Curso"', 
          'Materias': 'table: "Materias"',
          'Alunos': 'table: "Alunos"',
          'Professores': 'table: "Professores"'
        },
        'Estrutura Turma': {
          nomeTurma: 'string (max 100)',
          anoLetivo: 'number (Year)',
          idCurso: 'number'
        }
      }
    });

  } catch (error) {
    console.error('💥 Erro geral no debug:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
