CREATE TABLE `checkins` (
	`user_id` text NOT NULL,
	`day` text NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL,
	PRIMARY KEY(`user_id`, `day`)
);
--> statement-breakpoint
CREATE TABLE `friendships` (
	`pair` text PRIMARY KEY NOT NULL,
	`a` text NOT NULL,
	`b` text NOT NULL,
	`requester` text NOT NULL,
	`status` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `habits` (
	`user_id` text NOT NULL,
	`day` text NOT NULL,
	`action` text NOT NULL,
	`points` integer NOT NULL,
	PRIMARY KEY(`user_id`, `day`, `action`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`avatar` text DEFAULT 'fox' NOT NULL,
	`share` integer DEFAULT 0 NOT NULL,
	`timezone` text DEFAULT 'America/Chicago' NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_code_unique` ON `profiles` (`code`);--> statement-breakpoint
CREATE TABLE `quests` (
	`user_id` text NOT NULL,
	`run` text NOT NULL,
	`day` text NOT NULL,
	`points` integer NOT NULL,
	`seconds` integer NOT NULL,
	`outcome` text NOT NULL,
	PRIMARY KEY(`user_id`, `run`)
);
--> statement-breakpoint
CREATE TABLE `saves` (
	`user_id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL
);
