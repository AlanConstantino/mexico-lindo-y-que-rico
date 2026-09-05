-- Sandbox-only schema snapshot from production; no customer rows.
-- Payment handle default replaced with synthetic test data.



SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "event_date" "date" NOT NULL,
    "service_type" "text" NOT NULL,
    "guest_count" integer NOT NULL,
    "meats" "jsonb" NOT NULL,
    "extras" "jsonb" DEFAULT '[]'::"jsonb",
    "customer_name" "text" NOT NULL,
    "customer_email" "text" NOT NULL,
    "customer_phone" "text" NOT NULL,
    "total_price" integer NOT NULL,
    "stripe_session_id" "text",
    "stripe_payment_status" "text" DEFAULT 'unpaid'::"text",
    "status" "text" DEFAULT 'pending'::"text",
    "event_address" "text",
    "reminder_sent" boolean DEFAULT false,
    "payment_type" "text" DEFAULT 'card'::"text",
    "deposit_amount" integer DEFAULT 0,
    "balance_due" integer DEFAULT 0,
    "day_before_reminder_sent" boolean DEFAULT false,
    "cancelled_at" timestamp with time zone,
    "cancellation_fee_charged" integer DEFAULT 0,
    "refund_amount" integer DEFAULT 0,
    "cancel_token" "text",
    "reschedule_token" "text",
    "stripe_customer_id" "text",
    "stripe_payment_method_id" "text",
    "noshow_fee_charged" integer DEFAULT 0,
    "locale" "text" DEFAULT 'en'::"text" NOT NULL,
    "event_time" "text",
    "booking_number" "text",
    "cash_payment_method" "text",
    "cash_payment_option" "text",
    "deposit_confirmed" boolean DEFAULT false,
    "deposit_deadline" timestamp with time zone,
    "event_status" "text" DEFAULT 'unconfirmed'::"text",
    "payment_status" "text" DEFAULT 'unpaid'::"text",
    "confirm_event_token" "text",
    "auto_confirm_sent_at" timestamp with time zone,
    CONSTRAINT "bookings_cash_payment_method_check" CHECK (("cash_payment_method" = ANY (ARRAY['zelle'::"text", 'paypal'::"text", 'cashapp'::"text", 'venmo'::"text", 'cash_in_person'::"text"]))),
    CONSTRAINT "bookings_cash_payment_option_check" CHECK (("cash_payment_option" = ANY (ARRAY['deposit'::"text", 'full'::"text"]))),
    CONSTRAINT "bookings_payment_type_check" CHECK (("payment_type" = ANY (ARRAY['card'::"text", 'cash'::"text"]))),
    CONSTRAINT "bookings_service_type_check" CHECK (("service_type" = ANY (ARRAY['2hr'::"text", '3hr'::"text"]))),
    CONSTRAINT "bookings_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."settings" (
    "id" integer DEFAULT 1 NOT NULL,
    "max_events_per_day" integer DEFAULT 3,
    "min_notice_days" integer DEFAULT 3,
    "notification_email" "text",
    "notification_phone" "text",
    "reminder_days" integer DEFAULT 5,
    "cc_surcharge_percent" integer DEFAULT 10,
    "cash_deposit_percent" integer DEFAULT 50,
    "cancellation_fee_type" "text" DEFAULT 'flat'::"text",
    "cancellation_fee_flat" integer DEFAULT 50,
    "cancellation_fee_percent" integer DEFAULT 25,
    "free_cancellation_days" integer DEFAULT 3,
    "noshow_fee_type" "text" DEFAULT 'flat'::"text",
    "noshow_fee_flat" integer DEFAULT 100,
    "noshow_fee_percent" integer DEFAULT 50,
    "stripe_fee_percent" numeric(4,2) DEFAULT 2.9,
    "stripe_fee_flat" integer DEFAULT 30,
    "zelle_handle" "text" DEFAULT 'sandbox@example.test'::"text",
    "venmo_handle" "text" DEFAULT ''::"text",
    "cashapp_handle" "text" DEFAULT ''::"text",
    "paypal_email" "text" DEFAULT ''::"text",
    "cash_auto_cancel_hours" integer DEFAULT 48,
    "zelle_enabled" boolean DEFAULT true,
    "paypal_enabled" boolean DEFAULT true,
    "cashapp_enabled" boolean DEFAULT true,
    "venmo_enabled" boolean DEFAULT true,
    CONSTRAINT "settings_cancellation_fee_type_check" CHECK (("cancellation_fee_type" = ANY (ARRAY['flat'::"text", 'percentage'::"text"]))),
    CONSTRAINT "settings_noshow_fee_type_check" CHECK (("noshow_fee_type" = ANY (ARRAY['flat'::"text", 'percentage'::"text"])))
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_booking_number_key" UNIQUE ("booking_number");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_bookings_booking_number" ON "public"."bookings" USING "btree" ("booking_number");



CREATE INDEX "idx_bookings_cancel_token" ON "public"."bookings" USING "btree" ("cancel_token") WHERE ("cancel_token" IS NOT NULL);



CREATE INDEX "idx_bookings_event_date" ON "public"."bookings" USING "btree" ("event_date");



CREATE INDEX "idx_bookings_reminder" ON "public"."bookings" USING "btree" ("event_date", "reminder_sent") WHERE (("status" = 'confirmed'::"text") AND ("stripe_payment_status" = 'paid'::"text") AND ("reminder_sent" = false));



CREATE INDEX "idx_bookings_reschedule_token" ON "public"."bookings" USING "btree" ("reschedule_token") WHERE ("reschedule_token" IS NOT NULL);



CREATE INDEX "idx_bookings_stripe_session" ON "public"."bookings" USING "btree" ("stripe_session_id");



ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT ALL ON TABLE "public"."settings" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
