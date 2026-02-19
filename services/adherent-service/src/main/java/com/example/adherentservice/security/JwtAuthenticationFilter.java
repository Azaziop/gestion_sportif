package com.example.adherentservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String requestUri = request.getRequestURI();
        
        logger.info("JwtAuthenticationFilter processing request: {}", requestUri);
        
        // Skip JWT validation for public endpoints (including Swagger)
        if (requestUri.startsWith("/api/auth/") || 
            requestUri.startsWith("/actuator/") || 
            requestUri.startsWith("/api/internal/") ||
            requestUri.startsWith("/api/subscriptions") ||
            requestUri.startsWith("/swagger-ui") ||
            requestUri.startsWith("/v3/") ||
            requestUri.equals("/api-docs") ||
            requestUri.startsWith("/api-docs/")) {
            logger.info("JwtAuthenticationFilter: {} is public endpoint, skipping JWT validation", requestUri);
            filterChain.doFilter(request, response);
            return;
        }
        
        String authHeader = request.getHeader("Authorization");
        logger.info("Request to {} - Authorization header: {}", requestUri, authHeader != null ? "present" : "missing");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if (requestUri.startsWith("/api/adherents")) {
                logger.debug("No Bearer token for {}", requestUri);
            }
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        String role = jwtService.extractRole(token);
        if (requestUri.startsWith("/api/adherents")) {
            logger.debug("JWT for {} -> username: {}, role: {}", requestUri, username, role);
        }

        if (username != null && !jwtService.isTokenExpired(token)
            && SecurityContextHolder.getContext().getAuthentication() == null) {
            List<SimpleGrantedAuthority> authorities =
                role != null ? List.of(new SimpleGrantedAuthority("ROLE_" + role)) : List.of();

            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(username, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            if (requestUri.startsWith("/api/adherents")) {
                logger.debug("Authentication set with authorities: {}", authorities);
            }
        }

        filterChain.doFilter(request, response);
    }
}
