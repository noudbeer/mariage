CREATE TABLE `gite_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`household_id` text NOT NULL,
	`submitted_by_member_id` text NOT NULL,
	`member_ids` text NOT NULL,
	`nombre_personnes` integer NOT NULL,
	`nombre_nuits` integer NOT NULL,
	`created_at` text NOT NULL
);
