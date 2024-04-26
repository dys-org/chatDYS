-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `Users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`sub` text NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` numeric DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `Conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`sub` text NOT NULL,
	`model` text NOT NULL,
	`temperature` integer NOT NULL,
	`max_tokens` integer NOT NULL,
	`system_message` text NOT NULL,
	`messages` text NOT NULL,
	`title` text NOT NULL,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` numeric DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`sub`) REFERENCES `Users`(`sub`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `System_Presets` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`sub` text NOT NULL,
	`name` text NOT NULL,
	`text` text NOT NULL,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` numeric DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`sub`) REFERENCES `Users`(`sub`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_users_sub` ON `Users` (`sub`);
*/