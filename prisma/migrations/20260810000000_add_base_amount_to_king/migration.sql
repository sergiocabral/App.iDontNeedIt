-- AlterTable
ALTER TABLE "King" ADD COLUMN     "baseAmount" INTEGER;

-- Recalcula a escada: a gorjeta deixa de empurrar o degrau.
-- Cada King recebe 100, 200, 300... (centavos) na ordem cronologica de criacao.
-- "amount" fica intacto: continua sendo o total efetivamente pago (degrau + gorjeta).
UPDATE "King" AS k
SET "baseAmount" = (s."step" * 100)::INTEGER
FROM (
    SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS "step"
    FROM "King"
) AS s
WHERE k."id" = s."id";

ALTER TABLE "King" ALTER COLUMN "baseAmount" SET NOT NULL;
