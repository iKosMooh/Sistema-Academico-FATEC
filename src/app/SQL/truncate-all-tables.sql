-- Desabilita verificação de chaves estrangeiras
USE sistacad;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE AtestadoAulas;
TRUNCATE TABLE AtestadosMedicos;
TRUNCATE TABLE Presencas;
TRUNCATE TABLE DocsAulas;
TRUNCATE TABLE Aula;
TRUNCATE TABLE TurmaAluno;
TRUNCATE TABLE Turmas;
TRUNCATE TABLE HistoricoEscolar;
TRUNCATE TABLE Notas;
TRUNCATE TABLE Enderecos;
TRUNCATE TABLE ContatoAluno;
TRUNCATE TABLE Alunos;
TRUNCATE TABLE DocumentosPreCadastro;
TRUNCATE TABLE PreCadastro;
TRUNCATE TABLE CursoMaterias;
TRUNCATE TABLE Materias;
TRUNCATE TABLE Professores;
TRUNCATE TABLE Curso;
TRUNCATE TABLE Usuarios;
TRUNCATE TABLE Log;
TRUNCATE TABLE DiasNaoLetivos;

-- Reabilita verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 1;
