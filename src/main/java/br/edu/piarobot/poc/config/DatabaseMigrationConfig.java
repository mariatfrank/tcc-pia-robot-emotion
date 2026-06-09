package br.edu.piarobot.poc.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseMigrationConfig {

    @Bean
    ApplicationRunner databaseCompatibilityMigrations(JdbcTemplate jdbcTemplate) {
        return args -> {
            jdbcTemplate.execute("alter table if exists robot_sessions add column if not exists play_started boolean default false");
            jdbcTemplate.execute("update robot_sessions set play_started = false where play_started is null");
            jdbcTemplate.execute("alter table if exists robot_sessions alter column play_started set default false");
            jdbcTemplate.execute("alter table if exists robot_sessions alter column play_started set not null");
            jdbcTemplate.execute("alter table if exists robot_sessions add column if not exists owner_email varchar(320)");

            jdbcTemplate.execute("alter table if exists devices add column if not exists owner_email varchar(320)");
            jdbcTemplate.execute("alter table if exists devices add column if not exists session_id uuid");
        };
    }
}
