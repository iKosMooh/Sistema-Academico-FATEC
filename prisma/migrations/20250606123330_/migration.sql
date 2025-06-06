/*
  Warnings:

  - You are about to drop the `Aulas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocsAula` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Aulas` DROP FOREIGN KEY `Aulas_idMateria_fkey`;

-- DropForeignKey
ALTER TABLE `Aulas` DROP FOREIGN KEY `Aulas_idTurma_fkey`;

-- DropForeignKey
ALTER TABLE `DocsAula` DROP FOREIGN KEY `fk_docsaula_aula`;

-- DropForeignKey
ALTER TABLE `Presencas` DROP FOREIGN KEY `fk_presencas_aula`;

-- DropTable
DROP TABLE `Aulas`;

-- DropTable
DROP TABLE `DocsAula`;

-- CreateTable
CREATE TABLE `Aula` (
    `idAula` INTEGER NOT NULL AUTO_INCREMENT,
    `idTurma` INTEGER NOT NULL,
    `idMateria` INTEGER NOT NULL,
    `dataAula` DATETIME(3) NOT NULL,
    `horario` VARCHAR(191) NULL,
    `duracaoMinutos` INTEGER NULL,
    `aulaConcluida` BOOLEAN NOT NULL DEFAULT false,
    `presencasAplicadas` BOOLEAN NOT NULL DEFAULT false,
    `observacoes` TEXT NULL,
    `descricao` VARCHAR(191) NULL,
    `planejamento` TEXT NULL,
    `metodologia` TEXT NULL,
    `conteudoMinistrado` TEXT NULL,
    `metodologiaAplicada` TEXT NULL,
    `observacoesAula` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idAula`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocsAulas` (
    `idDocAula` INTEGER NOT NULL AUTO_INCREMENT,
    `idAula` INTEGER NOT NULL,
    `src` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idDocAula`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Aula` ADD CONSTRAINT `Aula_idTurma_fkey` FOREIGN KEY (`idTurma`) REFERENCES `Turmas`(`idTurma`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Aula` ADD CONSTRAINT `Aula_idMateria_fkey` FOREIGN KEY (`idMateria`) REFERENCES `Materias`(`idMateria`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocsAulas` ADD CONSTRAINT `DocsAulas_idAula_fkey` FOREIGN KEY (`idAula`) REFERENCES `Aula`(`idAula`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presencas` ADD CONSTRAINT `fk_presencas_aula` FOREIGN KEY (`idAula`) REFERENCES `Aula`(`idAula`) ON DELETE CASCADE ON UPDATE CASCADE;
