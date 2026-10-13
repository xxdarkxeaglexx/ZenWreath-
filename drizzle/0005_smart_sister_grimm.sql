CREATE TABLE `beta_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`tester_id` text NOT NULL,
	`rating` integer NOT NULL,
	`category` text NOT NULL,
	`message` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `beta_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`tester_id` text NOT NULL,
	`started` integer NOT NULL,
	`last_seen` integer NOT NULL,
	`active_seconds` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `beta_testers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`terms_version` text NOT NULL,
	`accepted_at` integer NOT NULL,
	`first_seen` integer NOT NULL,
	`last_seen` integer NOT NULL
);
