-- CreateTable
CREATE TABLE `Alunos` (
    `idAluno` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `sobrenome` VARCHAR(150) NOT NULL,
    `cpf` VARCHAR(14) NOT NULL,
    `rg` VARCHAR(12) NOT NULL,
    `nomeMae` VARCHAR(160) NOT NULL,
    `nomePai` VARCHAR(160) NULL,
    `dataNasc` DATE NOT NULL,
    `fotoPath` VARCHAR(255) NULL,
    `descricao` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `cpf`(`cpf`),
    UNIQUE INDEX `rg`(`rg`),
    PRIMARY KEY (`idAluno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Enderecos` (
    `idEndereco` INTEGER NOT NULL AUTO_INCREMENT,
    `idAluno` INTEGER NOT NULL,
    `cep` VARCHAR(9) NOT NULL,
    `rua` VARCHAR(255) NOT NULL,
    `cidade` VARCHAR(100) NOT NULL,
    `uf` CHAR(2) NOT NULL,
    `numero` VARCHAR(10) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_endereco_aluno`(`idAluno`),
    PRIMARY KEY (`idEndereco`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContatoAluno` (
    `idContato` INTEGER NOT NULL AUTO_INCREMENT,
    `idAluno` INTEGER NOT NULL,
    `nomeTel1` VARCHAR(45) NOT NULL,
    `tel1` VARCHAR(20) NOT NULL,
    `nomeTel2` VARCHAR(45) NULL,
    `tel2` VARCHAR(20) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_contato_aluno`(`idAluno`),
    PRIMARY KEY (`idContato`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Curso` (
    `idCurso` INTEGER NOT NULL AUTO_INCREMENT,
    `nomeCurso` VARCHAR(255) NOT NULL,
    `cargaHorariaTotal` INTEGER NOT NULL,
    `descricao` TEXT NULL,
    `docsPath` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`idCurso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Materias` (
    `idMateria` INTEGER NOT NULL AUTO_INCREMENT,
    `nomeMateria` VARCHAR(180) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`idMateria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CursoMaterias` (
    `idCurso` INTEGER NOT NULL,
    `idMateria` INTEGER NOT NULL,
    `cargaHoraria` INTEGER NOT NULL,

    INDEX `fk_cm_materia`(`idMateria`),
    PRIMARY KEY (`idCurso`, `idMateria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Professores` (
    `idProfessor` VARCHAR(14) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `sobrenome` VARCHAR(150) NOT NULL,
    `rg` VARCHAR(12) NOT NULL,
    `dataNasc` DATE NOT NULL,
    `cargo` VARCHAR(100) NOT NULL,
    `fotoPath` VARCHAR(255) NULL,
    `docsPath` VARCHAR(255) NULL,
    `descricao` TEXT NULL,
    `tel` VARCHAR(20) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `rg`(`rg`),
    PRIMARY KEY (`idProfessor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Turmas` (
    `idTurma` INTEGER NOT NULL AUTO_INCREMENT,
    `idCurso` INTEGER NOT NULL,
    `nomeTurma` VARCHAR(100) NOT NULL,
    `anoLetivo` YEAR NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_turmas_curso`(`idCurso`),
    PRIMARY KEY (`idTurma`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TurmaAluno` (
    `idTurma` INTEGER NOT NULL,
    `idAluno` INTEGER NOT NULL,
    `statusMatricula` ENUM('Ativa', 'Trancada', 'Cancelada') NOT NULL DEFAULT 'Ativa',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_turmaaluno_aluno`(`idAluno`),
    PRIMARY KEY (`idTurma`, `idAluno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Aula` (
    `idAula` INTEGER NOT NULL AUTO_INCREMENT,
    `idTurma` INTEGER NOT NULL,
    `idMateria` INTEGER NOT NULL,
    `dataAula` DATE NOT NULL,
    `horario` VARCHAR(10) NOT NULL,
    `presencasAplicadas` BOOLEAN NOT NULL DEFAULT false,
    `aulaConcluida` BOOLEAN NOT NULL DEFAULT false,
    `descricao` TEXT NULL,
    `observacoes` TEXT NULL,
    `duracaoMinutos` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_aula_materias`(`idMateria`),
    INDEX `fk_aula_turmas`(`idTurma`),
    PRIMARY KEY (`idAula`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocsAula` (
    `idDocAula` INTEGER NOT NULL AUTO_INCREMENT,
    `idAula` INTEGER NOT NULL,
    `src` VARCHAR(255) NOT NULL,

    INDEX `fk_docsaula_aula`(`idAula`),
    PRIMARY KEY (`idDocAula`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Presencas` (
    `idPresenca` INTEGER NOT NULL AUTO_INCREMENT,
    `idAula` INTEGER NOT NULL,
    `idAluno` INTEGER NOT NULL,
    `idProfessor` VARCHAR(14) NOT NULL,
    `presente` BOOLEAN NOT NULL,
    `justificativa` TEXT NULL,
    `dataRegistro` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_presencas_aluno`(`idAluno`),
    INDEX `fk_presencas_aula`(`idAula`),
    INDEX `fk_presencas_professor`(`idProfessor`),
    PRIMARY KEY (`idPresenca`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistoricoEscolar` (
    `idHistorico` INTEGER NOT NULL AUTO_INCREMENT,
    `idAluno` INTEGER NOT NULL,
    `idCurso` INTEGER NOT NULL,
    `idMateria` INTEGER NOT NULL,
    `nota` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `frequencia` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_historico_aluno`(`idAluno`),
    INDEX `fk_historico_curso`(`idCurso`),
    INDEX `fk_historico_materia`(`idMateria`),
    PRIMARY KEY (`idHistorico`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuarios` (
    `cpf` VARCHAR(14) NOT NULL,
    `senhaHash` VARCHAR(255) NOT NULL,
    `tipo` ENUM('Admin', 'Professor', 'Aluno') NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`cpf`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Log` (
    `idLog` INTEGER NOT NULL AUTO_INCREMENT,
    `action` TEXT NOT NULL,
    `dateTime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`idLog`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiasNaoLetivos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATE NOT NULL,
    `descricao` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Enderecos` ADD CONSTRAINT `fk_enderecos_aluno` FOREIGN KEY (`idAluno`) REFERENCES `Alunos`(`idAluno`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContatoAluno` ADD CONSTRAINT `fk_contatoaluno_aluno` FOREIGN KEY (`idAluno`) REFERENCES `Alunos`(`idAluno`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CursoMaterias` ADD CONSTRAINT `fk_cm_curso` FOREIGN KEY (`idCurso`) REFERENCES `Curso`(`idCurso`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CursoMaterias` ADD CONSTRAINT `fk_cm_materia` FOREIGN KEY (`idMateria`) REFERENCES `Materias`(`idMateria`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Turmas` ADD CONSTRAINT `fk_turmas_curso` FOREIGN KEY (`idCurso`) REFERENCES `Curso`(`idCurso`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TurmaAluno` ADD CONSTRAINT `fk_turmaaluno_aluno` FOREIGN KEY (`idAluno`) REFERENCES `Alunos`(`idAluno`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TurmaAluno` ADD CONSTRAINT `fk_turmaaluno_turma` FOREIGN KEY (`idTurma`) REFERENCES `Turmas`(`idTurma`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Aula` ADD CONSTRAINT `fk_aula_materias` FOREIGN KEY (`idMateria`) REFERENCES `Materias`(`idMateria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Aula` ADD CONSTRAINT `fk_aula_turmas` FOREIGN KEY (`idTurma`) REFERENCES `Turmas`(`idTurma`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocsAula` ADD CONSTRAINT `fk_docsaula_aula` FOREIGN KEY (`idAula`) REFERENCES `Aula`(`idAula`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presencas` ADD CONSTRAINT `fk_presencas_aluno` FOREIGN KEY (`idAluno`) REFERENCES `Alunos`(`idAluno`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presencas` ADD CONSTRAINT `fk_presencas_aula` FOREIGN KEY (`idAula`) REFERENCES `Aula`(`idAula`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presencas` ADD CONSTRAINT `fk_presencas_professor` FOREIGN KEY (`idProfessor`) REFERENCES `Professores`(`idProfessor`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoEscolar` ADD CONSTRAINT `fk_historico_aluno` FOREIGN KEY (`idAluno`) REFERENCES `Alunos`(`idAluno`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoEscolar` ADD CONSTRAINT `fk_historico_curso` FOREIGN KEY (`idCurso`) REFERENCES `Curso`(`idCurso`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoEscolar` ADD CONSTRAINT `fk_historico_materia` FOREIGN KEY (`idMateria`) REFERENCES `Materias`(`idMateria`) ON DELETE CASCADE ON UPDATE CASCADE;
