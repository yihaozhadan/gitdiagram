CREATE TABLE IF NOT EXISTS "gitdiagram_diagram_cache" (
	"username" varchar(256) NOT NULL,
	"repo" varchar(256) NOT NULL,
	"diagram" varchar(10000) NOT NULL,
	"explanation" varchar(10000) DEFAULT 'No explanation provided' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"used_own_key" boolean DEFAULT false,
	CONSTRAINT "gitdiagram_diagram_cache_username_repo_pk" PRIMARY KEY("username","repo")
);
