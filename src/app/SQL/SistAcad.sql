-- -----------------------------------------------------
-- Sistema Acadêmico – Versão Final Corrigida
-- -----------------------------------------------------

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE,
    SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,
              NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Cria e seleciona o schema único
CREATE SCHEMA IF NOT EXISTS `sistacad`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `sistacad`;

-- -----------------------------------------------------
-- Tabela de Alunos
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Alunos`;
CREATE TABLE `Alunos` (
  `idAluno` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `sobrenome` VARCHAR(150) NOT NULL,
  `cpf` VARCHAR(14) NOT NULL UNIQUE,
  `rg` VARCHAR(12) NOT NULL UNIQUE,
  `nomeMae` VARCHAR(160) NOT NULL,
  `nomePai` VARCHAR(160),
  `dataNasc` DATE NOT NULL,
  `fotoPath` VARCHAR(255),
  `descricao` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL 
    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idAluno`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela de Endereços (1:1 com Alunos)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Enderecos`;
CREATE TABLE `Enderecos` (
  `idEndereco` INT NOT NULL AUTO_INCREMENT,
  `idAluno` INT NOT NULL,
  `cep` VARCHAR(9) NOT NULL,
  `rua` VARCHAR(255) NOT NULL,
  `cidade` VARCHAR(100) NOT NULL,
  `uf` CHAR(2) NOT NULL,
  `numero` VARCHAR(10) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL 
    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idEndereco`),
  UNIQUE KEY `uq_endereco_aluno` (`idAluno`),
  CONSTRAINT `fk_enderecos_aluno`
    FOREIGN KEY (`idAluno`) REFERENCES `Alunos` (`idAluno`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela de Contatos de Aluno (1:1)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ContatoAluno`;
CREATE TABLE `ContatoAluno` (
  `idContato` INT NOT NULL AUTO_INCREMENT,
  `idAluno` INT NOT NULL,
  `nomeTel1` VARCHAR(45) NOT NULL,
  `tel1` VARCHAR(20) NOT NULL,
  `nomeTel2` VARCHAR(45),
  `tel2` VARCHAR(20),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL 
    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idContato`),
  UNIQUE KEY `uq_contato_aluno` (`idAluno`),
  CONSTRAINT `fk_contatoaluno_aluno`
    FOREIGN KEY (`idAluno`) REFERENCES `Alunos` (`idAluno`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela de Cursos
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Curso`;
CREATE TABLE `Curso` (
  `idCurso` INT NOT NULL AUTO_INCREMENT,
  `nomeCurso` VARCHAR(255) NOT NULL,
  `cargaHorariaTotal` INT NOT NULL,
  `descricao` TEXT,
  `docsPath` VARCHAR(255),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL 
    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idCurso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela de Matérias
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Materias`;
CREATE TABLE `Materias` (
  `idMateria` INT NOT NULL AUTO_INCREMENT,
  `nomeMateria` VARCHAR(180) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL 
    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idMateria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela N:M Curso ↔ Materias
-- -----------------------------------------------------
DROP TABLE IF EXISTS `CursoMaterias`;
CREATE TABLE `CursoMaterias` (
  `idCurso` INT NOT NULL,
  `idMateria` INT NOT NULL,
  `cargaHoraria` INT NOT NULL,
  PRIMARY KEY (`idCurso`,`idMateria`),
  CONSTRAINT `fk_cm_curso`
    FOREIGN KEY (`idCurso`) REFERENCES `Curso` (`idCurso`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cm_materia`
    FOREIGN KEY (`idMateria`) REFERENCES `Materias` (`idMateria`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela de Professores
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Professores`;
CREATE TABLE `Professores` (
  `idProfessor` VARCHAR(14) NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `sobrenome` VARCHAR(150) NOT NULL,
  `rg` VARCHAR(12) NOT NULL UNIQUE,
  `dataNasc` DATE NOT NULL,
  `cargo` VARCHAR(100) NOT NULL COMMENT 'Prof./Coord./Diretor etc',
  `fotoPath` VARCHAR(255),
  `docsPath` VARCHAR(255),
  `descricao` TEXT,
  `tel` VARCHAR(20),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL 
    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idProfessor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela de Turmas
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Turmas`;
CREATE TABLE `Turmas` (
  `idTurma` INT NOT NULL AUTO_INCREMENT,
  `idCurso` INT NOT NULL,
  `nomeTurma` VARCHAR(100) NOT NULL,
  `anoLetivo` YEAR NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL 
    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idTurma`),
  CONSTRAINT `fk_turmas_curso`
    FOREIGN KEY (`idCurso`) REFERENCES `Curso` (`idCurso`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Associação Aluno ↔ Turma (N:M) com status
-- -----------------------------------------------------
DROP TABLE IF EXISTS `TurmaAluno`;
CREATE TABLE `TurmaAluno` (
  `idTurma` INT NOT NULL,
  `idAluno` INT NOT NULL,
  `statusMatricula` ENUM('Ativa','Trancada','Cancelada') NOT NULL DEFAULT 'Ativa',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idTurma`,`idAluno`),
  CONSTRAINT `fk_turmaaluno_turma`
    FOREIGN KEY (`idTurma`) REFERENCES `Turmas` (`idTurma`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_turmaaluno_aluno`
    FOREIGN KEY (`idAluno`) REFERENCES `Alunos` (`idAluno`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela de Aulas (Sessões)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Aula`;
CREATE TABLE `Aula` (
  `idAula` INT NOT NULL AUTO_INCREMENT,
  `idTurma` INT NOT NULL,
  `idMateria` INT NOT NULL,
  `presencasAplicadas` TINYINT(1) NOT NULL DEFAULT 0,
  `aulaConcluida` TINYINT(1) NOT NULL DEFAULT 0,
  `descricao` TEXT,
  `observacoes` TEXT,
  `dataAula` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL 
    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idAula`),
  CONSTRAINT `fk_aula_turmas`
    FOREIGN KEY (`idTurma`) REFERENCES `Turmas` (`idTurma`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_aula_materias`
    FOREIGN KEY (`idMateria`) REFERENCES `Materias` (`idMateria`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Documentos da Aula (vários por aula)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `DocsAula`;
CREATE TABLE `DocsAula` (
  `idDocAula` INT NOT NULL AUTO_INCREMENT,
  `idAula` INT NOT NULL,
  `src` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`idDocAula`),
  CONSTRAINT `fk_docsaula_aula`
    FOREIGN KEY (`idAula`) REFERENCES `Aula` (`idAula`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Registro de Presenças
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Presencas`;
CREATE TABLE `Presencas` (
  `idPresenca` INT NOT NULL AUTO_INCREMENT,
  `idAula` INT NOT NULL,
  `idAluno` INT NOT NULL,
  `idProfessor` VARCHAR(14) NOT NULL,
  `presente` TINYINT(1) NOT NULL,
  `justificativa` TEXT,
  `dataRegistro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idPresenca`),
  CONSTRAINT `fk_presencas_aula`
    FOREIGN KEY (`idAula`) REFERENCES `Aula` (`idAula`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_presencas_aluno`
    FOREIGN KEY (`idAluno`) REFERENCES `Alunos` (`idAluno`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_presencas_professor`
    FOREIGN KEY (`idProfessor`) REFERENCES `Professores` (`idProfessor`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Histórico Escolar
-- -----------------------------------------------------
DROP TABLE IF EXISTS `HistoricoEscolar`;
CREATE TABLE `HistoricoEscolar` (
  `idHistorico` INT NOT NULL AUTO_INCREMENT,
  `idAluno` INT NOT NULL,
  `idCurso` INT NOT NULL,
  `idMateria` INT NOT NULL,
  `nota` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `frequencia` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idHistorico`),
  CONSTRAINT `fk_historico_aluno`
    FOREIGN KEY (`idAluno`) REFERENCES `Alunos` (`idAluno`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_historico_curso`
    FOREIGN KEY (`idCurso`) REFERENCES `Curso` (`idCurso`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_historico_materia`
    FOREIGN KEY (`idMateria`) REFERENCES `Materias` (`idMateria`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela de Usuários / Login
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Usuarios`;
CREATE TABLE `Usuarios` (
  `cpf` VARCHAR(14) NOT NULL,
  `senhaHash` VARCHAR(255) NOT NULL,
  `tipo` ENUM('Admin','Professor','Aluno') NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cpf`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela de Log de Ações
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Log`;
CREATE TABLE `Log` (
  `idLog` INT NOT NULL AUTO_INCREMENT,
  `action` TEXT NOT NULL,
  `dateTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idLog`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restaurar configurações originais
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
