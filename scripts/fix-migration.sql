-- Script para resolver problemas de foreign key constraints

-- Primeiro, vamos verificar se existem registros órfãos na tabela DocsAulas
-- que referenciam aulas que não existem
SELECT d.idDocAula, d.idAula 
FROM DocsAulas d 
LEFT JOIN Aulas a ON d.idAula = a.idAula 
WHERE a.idAula IS NULL;

-- Remove registros órfãos se existirem
DELETE d FROM DocsAulas d 
LEFT JOIN Aulas a ON d.idAula = a.idAula 
WHERE a.idAula IS NULL;

-- Verifica integridade após limpeza
SELECT COUNT(*) as registros_orfaos
FROM DocsAulas d 
LEFT JOIN Aulas a ON d.idAula = a.idAula 
WHERE a.idAula IS NULL;
