CREATE TABLE `businesses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`website` text,
	`phone` text,
	`description` text,
	`logo_url` text,
	`is_verified` integer DEFAULT 0,
	`role` text DEFAULT 'business',
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `businesses_email_unique` ON `businesses` (`email`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`color` text DEFAULT '#6366f1' NOT NULL,
	`icon_name` text DEFAULT 'calendar'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`short_description` text,
	`start_datetime` text NOT NULL,
	`end_datetime` text,
	`all_day` integer DEFAULT 0,
	`location_name` text,
	`address` text,
	`city` text DEFAULT 'Champaign',
	`latitude` real,
	`longitude` real,
	`url` text,
	`image_url` text,
	`ticket_url` text,
	`price` text,
	`category_id` integer,
	`business_id` integer,
	`source` text DEFAULT 'business' NOT NULL,
	`source_event_id` text,
	`is_approved` integer DEFAULT 1,
	`is_featured` integer DEFAULT 0,
	`featured_until` text,
	`view_count` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_source_sourceEventId_idx` ON `events` (`source`,`source_event_id`);--> statement-breakpoint
CREATE TABLE `scraper_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scraper_name` text NOT NULL,
	`started_at` text NOT NULL,
	`finished_at` text,
	`status` text DEFAULT 'running',
	`events_found` integer DEFAULT 0,
	`events_inserted` integer DEFAULT 0,
	`events_updated` integer DEFAULT 0,
	`error_message` text
);
--> statement-breakpoint
CREATE TABLE `sponsored_listings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`business_id` integer NOT NULL,
	`stripe_session_id` text,
	`stripe_payment_intent_id` text,
	`amount` integer,
	`duration_days` integer,
	`status` text DEFAULT 'pending',
	`starts_at` text,
	`expires_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sponsored_listings_stripe_session_id_unique` ON `sponsored_listings` (`stripe_session_id`);