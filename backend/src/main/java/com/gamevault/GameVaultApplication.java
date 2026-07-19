package com.gamevault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

/**
 * GameVaultApplication
 * ---------------------
 * Entry point for the GameVault backend service.
 *
 * This Spring Boot application exposes a REST API that serves gaming
 * console, controller, and accessory product data to the GameVault
 * vanilla JS frontend.
 *
 * The project packages as a WAR (see pom.xml) for deployment to an
 * external Tomcat, so this class extends SpringBootServletInitializer
 * and overrides configure() — that's what lets Tomcat's own web.xml/
 * servlet container bootstrap the Spring application context when the
 * WAR is dropped into webapps/. Running directly via `mvn spring-boot:run`
 * or `java -jar` still works exactly the same, using the embedded
 * Tomcat from spring-boot-starter-tomcat (scope=provided) at dev time.
 */
@SpringBootApplication
public class GameVaultApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(GameVaultApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(GameVaultApplication.class);
    }
}
