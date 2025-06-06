-- CreateTable
BEGIN;

-- Adiciona as colunas de conteúdo ministrado se não existirem
ALTER TABLE `Aulas` 
ADD COLUMN IF NOT EXISTS `conteudoMinistrado` TEXT,
ADD COLUMN IF NOT EXISTS `metodologiaAplicada` TEXT,
ADD COLUMN IF NOT EXISTS `observacoesAula` TEXT;

-- Remove foreign key constraint temporariamente se existir
SET FOREIGN_KEY_CHECKS = 0;

-- Remove registros órfãos da tabela DocsAulas
DELETE d FROM `DocsAulas` d 
LEFT JOIN `Aulas` a ON d.idAula = a.idAula 
WHERE a.idAula IS NULL;

-- Reativa foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Adiciona a foreign key constraint corretamente
ALTER TABLE `DocsAulas` 
DROP FOREIGN KEY IF EXISTS `fk_docsaula_aula`;

ALTER TABLE `DocsAulas` 
ADD CONSTRAINT `DocsAulas_idAula_fkey` 
FOREIGN KEY (`idAula`) REFERENCES `Aulas`(`idAula`) 
ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
