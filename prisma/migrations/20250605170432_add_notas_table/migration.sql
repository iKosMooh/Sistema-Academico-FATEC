-- CreateTable
CREATE TABLE `Notas` (
    `idNota` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `idAluno` INTEGER NOT NULL,
    `idMateria` INTEGER NOT NULL,
    `idTurma` INTEGER NOT NULL,
    `idProfessor` VARCHAR(14) NOT NULL,
    `valorNota` DECIMAL(5, 2) NOT NULL,
    `dataLancamento` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `tipoAvaliacao` VARCHAR(50) NOT NULL,
    `observacoes` TEXT NULL,

    INDEX `fk_notas_professor`(`idProfessor`),
    UNIQUE INDEX `Notas_idAluno_idMateria_idTurma_tipoAvaliacao_key`(`idAluno`, `idMateria`, `idTurma`, `tipoAvaliacao`),
    PRIMARY KEY (`idNota`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notas` ADD CONSTRAINT `Notas_idAluno_fkey` FOREIGN KEY (`idAluno`) REFERENCES `Alunos`(`idAluno`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notas` ADD CONSTRAINT `Notas_idMateria_fkey` FOREIGN KEY (`idMateria`) REFERENCES `Materias`(`idMateria`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notas` ADD CONSTRAINT `Notas_idTurma_fkey` FOREIGN KEY (`idTurma`) REFERENCES `Turmas`(`idTurma`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notas` ADD CONSTRAINT `Notas_idProfessor_fkey` FOREIGN KEY (`idProfessor`) REFERENCES `Professores`(`idProfessor`) ON DELETE CASCADE ON UPDATE CASCADE;
