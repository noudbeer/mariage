CREATE TABLE `login_audit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip` text NOT NULL,
	`email_tried` text NOT NULL,
	`success` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rsvp_responses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`household_id` text NOT NULL,
	`member_id` text NOT NULL,
	`event_key` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`comment` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rsvp_responses_member_event_idx` ON `rsvp_responses` (`member_id`,`event_key`);