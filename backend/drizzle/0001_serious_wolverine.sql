ALTER TABLE `buckets` ADD `is_archived` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` ADD `is_archived` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `recurring_transfers` ADD `is_archived` integer DEFAULT false NOT NULL;