CREATE TABLE `members` (
	`room` text NOT NULL,
	`user_id` text NOT NULL,
	`x` integer DEFAULT 144 NOT NULL,
	`y` integer DEFAULT 320 NOT NULL,
	`face` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT 0 NOT NULL,
	`seen` integer NOT NULL,
	`note` integer DEFAULT -1 NOT NULL,
	`note_at` integer DEFAULT 0 NOT NULL,
	`swing` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`room`, `user_id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`host` text NOT NULL,
	`state` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`updated` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `profiles` ADD `sound` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `volume` integer DEFAULT 65 NOT NULL;