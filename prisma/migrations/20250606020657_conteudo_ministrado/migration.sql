/*
  Warnings:

  - You are about to drop the `Aula` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Aula` DROP FOREIGN KEY `fk_aula_materias`;

-- DropForeignKey
ALTER TABLE `Aula` DROP FOREIGN KEY `fk_aula_turmas`;

-- DropForeignKey
ALTER TABLE `DocsAula` DROP FOREIGN KEY `fk_docsaula_aula`;

-- DropForeignKey
ALTER TABLE `Presencas` DROP FOREIGN KEY `fk_presencas_aula`;

-- DropTable
DROP TABLE `Aula`;

-- CreateTable
CREATE TABLE `Aulas` (
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

-- AddForeignKey
ALTER TABLE `Aulas` ADD CONSTRAINT `Aulas_idTurma_fkey` FOREIGN KEY (`idTurma`) REFERENCES `Turmas`(`idTurma`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Aulas` ADD CONSTRAINT `Aulas_idMateria_fkey` FOREIGN KEY (`idMateria`) REFERENCES `Materias`(`idMateria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocsAula` ADD CONSTRAINT `fk_docsaula_aula` FOREIGN KEY (`idAula`) REFERENCES `Aulas`(`idAula`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presencas` ADD CONSTRAINT `fk_presencas_aula` FOREIGN KEY (`idAula`) REFERENCES `Aulas`(`idAula`) ON DELETE CASCADE ON UPDATE CASCADE;
