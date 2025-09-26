CREATE TABLE `clips` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`project_id` text NOT NULL,
	`position` integer NOT NULL,
	`original_file_name` text NOT NULL,
	`file_url` text NOT NULL,
	`file_size` integer NOT NULL,
	`duration` integer,
	`thumbnail_url` text,
	`title` text,
	`description` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`created_by_user_id` text NOT NULL,
	`company_id` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`template_id` text NOT NULL,
	`output_video_url` text,
	`processing_job_id` text
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`user_id` text NOT NULL,
	`project_id` text NOT NULL,
	`template_id` text NOT NULL,
	`receipt_id` text NOT NULL,
	`paid_amount` real NOT NULL,
	`received_amount` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`preview_image_url` text,
	`template_config` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`price` real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`user_id` text NOT NULL,
	`company_id` text NOT NULL,
	`credits_remaining` integer DEFAULT 5 NOT NULL,
	`projects_created_this_month` integer DEFAULT 0 NOT NULL,
	`last_reset_date` text NOT NULL,
	`subscription_tier` text DEFAULT 'free' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_user_company` ON `user_usage` (`user_id`,`company_id`);