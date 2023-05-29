
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

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE "public"."actions" (
    "id" bigint NOT NULL,
    "left_field" smallint,
    "action" "text",
    "right_field" smallint,
    "number" integer,
    "left_player" smallint,
    "right_player" smallint,
    "action_type" smallint,
    "operator" "text",
    "left_value" integer,
    "right_value" integer,
    "left" "text",
    "right" "text",
    CONSTRAINT "actions_action_check" CHECK (("length"("action") < 36)),
    CONSTRAINT "actions_left_check" CHECK (("length"("left") < 11)),
    CONSTRAINT "actions_right_check" CHECK (("length"("right") < 11))
);

ALTER TABLE "public"."actions" OWNER TO "postgres";

ALTER TABLE "public"."actions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."actions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."chains" (
    "id" bigint NOT NULL,
    "games_id" bigint NOT NULL,
    "chain_start" bigint NOT NULL,
    "chain_end" bigint NOT NULL,
    "or_bool" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."chains" OWNER TO "postgres";

ALTER TABLE "public"."chains" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."chains_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."games" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "creator" "uuid" DEFAULT "auth"."uid"(),
    "name" "text" DEFAULT 'New Game'::"text" NOT NULL,
    "playercount" smallint DEFAULT '4'::smallint NOT NULL,
    "gamefields" "text"[] DEFAULT '{cardcount}'::"text"[] NOT NULL,
    "playerfields" "text"[] DEFAULT '{cardcount}'::"text"[],
    "official" boolean DEFAULT false NOT NULL,
    "init" "jsonb" NOT NULL,
    "deckcount" smallint DEFAULT '1'::smallint NOT NULL,
    CONSTRAINT "games_deckcount_check" CHECK (("deckcount" > 0)),
    CONSTRAINT "games_name_check" CHECK (("length"("name") < 30)),
    CONSTRAINT "games_playercount_check" CHECK (("playercount" > 1))
);

ALTER TABLE "public"."games" OWNER TO "postgres";

ALTER TABLE "public"."games" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."games_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."games_rules" (
    "id" bigint NOT NULL,
    "game_id" bigint,
    "rule_id" bigint
);

ALTER TABLE "public"."games_rules" OWNER TO "postgres";

ALTER TABLE "public"."games_rules" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."games_rules_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."hands" (
    "id" bigint NOT NULL,
    "session_players_id" bigint NOT NULL,
    "hand" "jsonb"
);

ALTER TABLE "public"."hands" OWNER TO "postgres";

ALTER TABLE "public"."hands" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."hands_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."handview" (
    "id" bigint NOT NULL,
    "session_players_id" bigint NOT NULL,
    "top" "jsonb" NOT NULL
);

ALTER TABLE "public"."handview" OWNER TO "postgres";

ALTER TABLE "public"."handview" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."handview_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."leaderboard" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "name" "text" DEFAULT 'Player'::"text" NOT NULL,
    "wins" integer DEFAULT 1 NOT NULL,
    "game_id" bigint
);

ALTER TABLE "public"."leaderboard" OWNER TO "postgres";

ALTER TABLE "public"."leaderboard" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."leaderboard_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."rules" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "operator" "text" DEFAULT '<'::"text" NOT NULL,
    "left_field" smallint,
    "right_field" smallint,
    "left_player" smallint,
    "right_player" smallint,
    "right_value" integer,
    "name" "text" DEFAULT 'New Rule'::"text" NOT NULL,
    "action_id" bigint,
    "left_value" integer,
    "required" boolean DEFAULT true NOT NULL,
    "or_bool" boolean DEFAULT false NOT NULL,
    "exclusive" smallint,
    "left" "text",
    "right" "text",
    CONSTRAINT "rules_left_check" CHECK (("length"("left") < 11)),
    CONSTRAINT "rules_name_check" CHECK (("length"("name") < 50)),
    CONSTRAINT "rules_operator_check" CHECK (("length"("operator") < 25)),
    CONSTRAINT "rules_right_check" CHECK (("length"("right") < 11))
);

ALTER TABLE "public"."rules" OWNER TO "postgres";

ALTER TABLE "public"."rules" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."rules_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."session" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "table" "jsonb",
    "owner" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "game" bigint,
    "started" boolean DEFAULT false NOT NULL,
    "public" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."session" OWNER TO "postgres";

ALTER TABLE "public"."session" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."session_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."session_players" (
    "id" bigint NOT NULL,
    "session_id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "hand" "jsonb",
    "name" "text" DEFAULT 'New Player'::"text" NOT NULL,
    CONSTRAINT "session_players_name_check" CHECK (("length"("name") < 20))
);

ALTER TABLE "public"."session_players" OWNER TO "postgres";

ALTER TABLE "public"."session_players" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."session_players_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."tables" (
    "id" bigint NOT NULL,
    "session_id" bigint NOT NULL,
    "table" "jsonb"
);

ALTER TABLE "public"."tables" OWNER TO "postgres";

ALTER TABLE "public"."tables" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tables_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."tableview" (
    "id" bigint NOT NULL,
    "session_id" bigint NOT NULL,
    "top" "jsonb" NOT NULL,
    "current" bigint NOT NULL,
    "next" bigint NOT NULL,
    "dir" smallint DEFAULT '1'::smallint NOT NULL,
    "sorter" integer DEFAULT 52 NOT NULL
);

ALTER TABLE "public"."tableview" OWNER TO "postgres";

ALTER TABLE "public"."tableview" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tableview_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."actions"
    ADD CONSTRAINT "actions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."chains"
    ADD CONSTRAINT "chains_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."games_rules"
    ADD CONSTRAINT "games_rules_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."hands"
    ADD CONSTRAINT "hands_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."hands"
    ADD CONSTRAINT "hands_session_players_id_key" UNIQUE ("session_players_id");

ALTER TABLE ONLY "public"."handview"
    ADD CONSTRAINT "handview_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."handview"
    ADD CONSTRAINT "handview_session_players_id_key" UNIQUE ("session_players_id");

ALTER TABLE ONLY "public"."leaderboard"
    ADD CONSTRAINT "leaderboard_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."rules"
    ADD CONSTRAINT "rules_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."session_players"
    ADD CONSTRAINT "session_players_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."session_players"
    ADD CONSTRAINT "session_players_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."tables"
    ADD CONSTRAINT "tables_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."tables"
    ADD CONSTRAINT "tables_session_id_key" UNIQUE ("session_id");

ALTER TABLE ONLY "public"."tableview"
    ADD CONSTRAINT "tableview_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."tableview"
    ADD CONSTRAINT "tableview_session_id_key" UNIQUE ("session_id");

ALTER TABLE ONLY "public"."chains"
    ADD CONSTRAINT "chains_chain_end_fkey" FOREIGN KEY ("chain_end") REFERENCES "public"."rules"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."chains"
    ADD CONSTRAINT "chains_chain_start_fkey" FOREIGN KEY ("chain_start") REFERENCES "public"."rules"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."chains"
    ADD CONSTRAINT "chains_games_id_fkey" FOREIGN KEY ("games_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_creator_fkey" FOREIGN KEY ("creator") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."games_rules"
    ADD CONSTRAINT "games_rules_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."games_rules"
    ADD CONSTRAINT "games_rules_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "public"."rules"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."hands"
    ADD CONSTRAINT "hands_session_players_id_fkey" FOREIGN KEY ("session_players_id") REFERENCES "public"."session_players"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."handview"
    ADD CONSTRAINT "handview_session_players_id_fkey" FOREIGN KEY ("session_players_id") REFERENCES "public"."session_players"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."leaderboard"
    ADD CONSTRAINT "leaderboard_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."leaderboard"
    ADD CONSTRAINT "leaderboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."rules"
    ADD CONSTRAINT "rules_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "session_game_fkey" FOREIGN KEY ("game") REFERENCES "public"."games"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "session_owner_fkey" FOREIGN KEY ("owner") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."session_players"
    ADD CONSTRAINT "session_players_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."session_players"
    ADD CONSTRAINT "session_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."tables"
    ADD CONSTRAINT "tables_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."tableview"
    ADD CONSTRAINT "tableview_current_fkey" FOREIGN KEY ("current") REFERENCES "public"."session_players"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."tableview"
    ADD CONSTRAINT "tableview_next_fkey" FOREIGN KEY ("next") REFERENCES "public"."session_players"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."tableview"
    ADD CONSTRAINT "tableview_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE CASCADE;

CREATE POLICY "Delete own" ON "public"."chains" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."games"
  WHERE (("games"."id" = "chains"."games_id") AND ("games"."creator" = "auth"."uid"())))));

CREATE POLICY "Delete own" ON "public"."games_rules" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."games"
  WHERE (("games"."id" = "games_rules"."game_id") AND ("games"."creator" = "auth"."uid"())))));

CREATE POLICY "Delete own" ON "public"."session" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."session" "session_1"
  WHERE ("session_1"."owner" = "auth"."uid"()))));

CREATE POLICY "Delete own if not owner" ON "public"."session_players" FOR DELETE USING ((NOT (EXISTS ( SELECT 1
   FROM ("public"."session_players" "session_players_1"
     JOIN "public"."session" "s" ON (("s"."id" = "session_players_1"."session_id")))
  WHERE (("session_players_1"."user_id" = "auth"."uid"()) AND ("s"."owner" = "auth"."uid"()))))));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."actions" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."games" FOR INSERT TO "authenticated" WITH CHECK (("official" = false));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."rules" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."session" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."actions" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."chains" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."games_rules" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."leaderboard" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."rules" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."session" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."session_players" FOR SELECT USING (true);

CREATE POLICY "Insert if own game and rule is on game" ON "public"."chains" FOR INSERT TO "authenticated" WITH CHECK (((( SELECT 1
   FROM (("public"."rules"
     JOIN "public"."games_rules" "gr" ON (("rules"."id" = "gr"."rule_id")))
     JOIN "public"."games" ON (("gr"."game_id" = "games"."id")))
  WHERE (("rules"."id" = "chains"."chain_start") AND ("games"."creator" = "auth"."uid"()))) + ( SELECT 1
   FROM (("public"."rules"
     JOIN "public"."games_rules" "gr" ON (("rules"."id" = "gr"."rule_id")))
     JOIN "public"."games" ON (("gr"."game_id" = "games"."id")))
  WHERE (("rules"."id" = "chains"."chain_end") AND ("games"."creator" = "auth"."uid"())))) IS NOT NULL));

CREATE POLICY "Only if ID exists and not started" ON "public"."session_players" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."session"
  WHERE (("session"."started" = false) AND ("session"."id" = "session_players"."session_id") AND ("session_players"."user_id" = "auth"."uid"())))));

CREATE POLICY "Read access for everyone" ON "public"."games" FOR SELECT USING (true);

CREATE POLICY "Read own hand" ON "public"."handview" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."session_players"
  WHERE (("session_players"."id" = "handview"."session_players_id") AND ("session_players"."user_id" = "auth"."uid"())))));

CREATE POLICY "Read table they are at" ON "public"."tableview" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."session_players"
  WHERE (("session_players"."session_id" = "tableview"."session_id") AND ("session_players"."user_id" = "auth"."uid"())))));

CREATE POLICY "Update own" ON "public"."actions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM (("public"."rules"
     JOIN "public"."games_rules" "gr" ON (("rules"."id" = "gr"."rule_id")))
     JOIN "public"."games" ON (("gr"."game_id" = "games"."id")))
  WHERE (("rules"."action_id" = "actions"."id") AND ("games"."creator" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (("public"."rules"
     JOIN "public"."games_rules" "gr" ON (("rules"."id" = "gr"."rule_id")))
     JOIN "public"."games" ON (("gr"."game_id" = "games"."id")))
  WHERE (("rules"."action_id" = "actions"."id") AND ("games"."creator" = "auth"."uid"())))));

CREATE POLICY "Update own" ON "public"."rules" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM (("public"."rules" "rules_1"
     JOIN "public"."games_rules" "gr" ON (("rules_1"."id" = "gr"."rule_id")))
     JOIN "public"."games" ON (("gr"."game_id" = "games"."id")))
  WHERE ("games"."creator" = "auth"."uid"())))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (("public"."rules" "rules_1"
     JOIN "public"."games_rules" "gr" ON (("rules_1"."id" = "gr"."rule_id")))
     JOIN "public"."games" ON (("gr"."game_id" = "games"."id")))
  WHERE ("games"."creator" = "auth"."uid"()))));

CREATE POLICY "Update own" ON "public"."session" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."session" "session_1"
  WHERE ("session_1"."owner" = "auth"."uid"())))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."session" "session_1"
  WHERE ("session_1"."owner" = "auth"."uid"()))));

CREATE POLICY "Update own when not started" ON "public"."session_players" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."session"
  WHERE (("session"."started" = false) AND ("session"."id" = "session_players"."session_id") AND ("session_players"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."session"
  WHERE (("session"."started" = false) AND ("session"."id" = "session_players"."session_id") AND ("session_players"."user_id" = "auth"."uid"())))));

ALTER TABLE "public"."actions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."chains" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."games" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."games_rules" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."hands" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."handview" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."leaderboard" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."rules" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."session" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."session_players" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."tables" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."tableview" ENABLE ROW LEVEL SECURITY;

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON TABLE "public"."actions" TO "anon";
GRANT ALL ON TABLE "public"."actions" TO "authenticated";
GRANT ALL ON TABLE "public"."actions" TO "service_role";

GRANT ALL ON SEQUENCE "public"."actions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."actions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."actions_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."chains" TO "anon";
GRANT ALL ON TABLE "public"."chains" TO "authenticated";
GRANT ALL ON TABLE "public"."chains" TO "service_role";

GRANT ALL ON SEQUENCE "public"."chains_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."chains_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."chains_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."games" TO "anon";
GRANT ALL ON TABLE "public"."games" TO "authenticated";
GRANT ALL ON TABLE "public"."games" TO "service_role";

GRANT ALL ON SEQUENCE "public"."games_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."games_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."games_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."games_rules" TO "anon";
GRANT ALL ON TABLE "public"."games_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."games_rules" TO "service_role";

GRANT ALL ON SEQUENCE "public"."games_rules_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."games_rules_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."games_rules_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."hands" TO "anon";
GRANT ALL ON TABLE "public"."hands" TO "authenticated";
GRANT ALL ON TABLE "public"."hands" TO "service_role";

GRANT ALL ON SEQUENCE "public"."hands_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."hands_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."hands_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."handview" TO "anon";
GRANT ALL ON TABLE "public"."handview" TO "authenticated";
GRANT ALL ON TABLE "public"."handview" TO "service_role";

GRANT ALL ON SEQUENCE "public"."handview_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."handview_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."handview_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."leaderboard" TO "anon";
GRANT ALL ON TABLE "public"."leaderboard" TO "authenticated";
GRANT ALL ON TABLE "public"."leaderboard" TO "service_role";

GRANT ALL ON SEQUENCE "public"."leaderboard_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."leaderboard_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."leaderboard_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."rules" TO "anon";
GRANT ALL ON TABLE "public"."rules" TO "authenticated";
GRANT ALL ON TABLE "public"."rules" TO "service_role";

GRANT ALL ON SEQUENCE "public"."rules_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rules_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rules_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."session" TO "anon";
GRANT ALL ON TABLE "public"."session" TO "authenticated";
GRANT ALL ON TABLE "public"."session" TO "service_role";

GRANT ALL ON SEQUENCE "public"."session_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."session_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."session_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."session_players" TO "anon";
GRANT ALL ON TABLE "public"."session_players" TO "authenticated";
GRANT ALL ON TABLE "public"."session_players" TO "service_role";

GRANT ALL ON SEQUENCE "public"."session_players_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."session_players_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."session_players_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."tables" TO "anon";
GRANT ALL ON TABLE "public"."tables" TO "authenticated";
GRANT ALL ON TABLE "public"."tables" TO "service_role";

GRANT ALL ON SEQUENCE "public"."tables_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tables_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tables_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."tableview" TO "anon";
GRANT ALL ON TABLE "public"."tableview" TO "authenticated";
GRANT ALL ON TABLE "public"."tableview" TO "service_role";

GRANT ALL ON SEQUENCE "public"."tableview_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tableview_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tableview_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;