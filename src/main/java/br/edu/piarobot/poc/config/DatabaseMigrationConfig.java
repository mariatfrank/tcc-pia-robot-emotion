package br.edu.piarobot.poc.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseMigrationConfig {

    @Bean
    ApplicationRunner databaseCompatibilityMigrations(JdbcTemplate jdbcTemplate) {
        return args -> jdbcTemplate.execute("""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.tables
                        WHERE table_schema = 'public'
                          AND table_name = 'robot_sessions'
                    ) THEN
                        ALTER TABLE robot_sessions
                            ADD COLUMN IF NOT EXISTS play_started boolean DEFAULT false;
                        UPDATE robot_sessions
                            SET play_started = false
                            WHERE play_started IS NULL;
                        ALTER TABLE robot_sessions
                            ALTER COLUMN play_started SET DEFAULT false;
                        ALTER TABLE robot_sessions
                            ALTER COLUMN play_started SET NOT NULL;
                        ALTER TABLE robot_sessions
                            ADD COLUMN IF NOT EXISTS owner_email varchar(320);
                    END IF;

                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.tables
                        WHERE table_schema = 'public'
                          AND table_name = 'devices'
                    ) THEN
                        ALTER TABLE devices
                            ADD COLUMN IF NOT EXISTS owner_email varchar(320);
                        ALTER TABLE devices
                            ADD COLUMN IF NOT EXISTS session_id uuid;
                    END IF;
                END $$;
                """);
    }
}
