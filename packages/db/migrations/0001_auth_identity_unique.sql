WITH ranked_methods AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY type, external_id ORDER BY created_at ASC, id ASC) AS row_num
  FROM auth_methods
)
DELETE FROM auth_methods
WHERE id IN (
  SELECT id
  FROM ranked_methods
  WHERE row_num > 1
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "auth_methods_identity_unique"
ON "auth_methods" USING btree ("type","external_id");
