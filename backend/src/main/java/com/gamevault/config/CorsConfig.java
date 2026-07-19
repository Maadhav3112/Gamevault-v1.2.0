package com.gamevault.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CorsConfig
 * -----------
 * The frontend (index.html/app.js) is served as static files, typically
 * opened directly in the browser or served from a different port than the
 * Spring Boot API (8080). This configuration enables Cross-Origin Resource
 * Sharing so the browser doesn't block the Fetch API calls made from app.js.
 *
 * In a real production deployment, restrict allowedOrigins to your actual
 * frontend domain instead of using a wildcard.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}
