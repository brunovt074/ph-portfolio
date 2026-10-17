CREATE TYPE "public"."booking_status" AS ENUM('awaiting_payment', 'confirmed', 'needs_rescheduling', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_kind" AS ENUM('deposit', 'full', 'balance');--> statement-breakpoint
CREATE TYPE "public"."payment_plan" AS ENUM('deposit', 'full');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."schedule_kind" AS ENUM('slot', 'request');--> statement-breakpoint
CREATE TYPE "public"."time_slot" AS ENUM('morning', 'afternoon', 'any');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"offer_slug" text NOT NULL,
	"offer_title" text NOT NULL,
	"total_cents" integer NOT NULL,
	"deposit_cents" integer NOT NULL,
	"currency" text NOT NULL,
	"payment_plan" "payment_plan" NOT NULL,
	"schedule_kind" "schedule_kind" NOT NULL,
	"slot_start" timestamp with time zone,
	"slot_end" timestamp with time zone,
	"preferred_date" date,
	"time_slot" time_slot,
	"calendar_event_id" text,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"notes" text NOT NULL,
	"status" "booking_status" NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"booking_id" uuid NOT NULL,
	"kind" "payment_kind" NOT NULL,
	"provider" text NOT NULL,
	"checkout_id" text NOT NULL,
	"checkout_url" text NOT NULL,
	"external_payment_id" text,
	"status" "payment_status" NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text NOT NULL,
	"raw" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_slot_idx" ON "bookings" USING btree ("slot_start","slot_end");--> statement-breakpoint
CREATE INDEX "payments_booking_idx" ON "payments" USING btree ("booking_id","kind","created_at");