-- Milestone 2: Inventory Schema Migration
-- 1. Create enum for stock mutation types
DO $$ BEGIN
    CREATE TYPE "public"."stock_mutation_type" AS ENUM('INITIAL', 'IN', 'OUT', 'ADJUSTMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- 2. Add min_stock column to products table
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "min_stock" integer DEFAULT 5 NOT NULL;
--> statement-breakpoint

-- 3. Create stock_mutations table
CREATE TABLE IF NOT EXISTS "stock_mutations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"type" "stock_mutation_type" NOT NULL,
	"quantity" integer NOT NULL,
	"previous_stock" integer NOT NULL,
	"current_stock" integer NOT NULL,
	"reference" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- 4. Add foreign key from stock_mutations to products
DO $$ BEGIN
    ALTER TABLE "stock_mutations" 
    ADD CONSTRAINT "stock_mutations_product_id_products_id_fk" 
    FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") 
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
