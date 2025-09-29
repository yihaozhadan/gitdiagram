ALTER TABLE "gitdiagram_diagram_cache" ALTER COLUMN "diagram" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "gitdiagram_diagram_cache" ALTER COLUMN "explanation" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "gitdiagram_diagram_cache" ALTER COLUMN "explanation" SET DEFAULT 'No explanation provided';