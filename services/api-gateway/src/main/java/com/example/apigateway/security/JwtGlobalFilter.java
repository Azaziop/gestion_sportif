package com.example.apigateway.security;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
//import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

//@Component  // Désactivé pour les tests
public class JwtGlobalFilter implements GlobalFilter, Ordered {

    private final JwtService jwtService;

    public JwtGlobalFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // Laisser passer les requêtes OPTIONS (CORS preflight)
        if (exchange.getRequest().getMethod() != null && exchange.getRequest().getMethod().matches("OPTIONS")) {
            return chain.filter(exchange);
        }

        // Laisser passer les chemins publics sans validation JWT
        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        // Valider le token JWT pour les chemins protégés
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }

        String token = authHeader.substring(7);
        try {
            if (jwtService.isTokenExpired(token)) {
                return unauthorized(exchange);
            }
            String username = jwtService.extractUsername(token);
            
            // Transmettre le token et les infos utilisateur aux services en aval
            ServerWebExchange modifiedExchange = exchange.mutate()
                .request(r -> r
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .header("X-User-Username", username))
                .build();
            
            return chain.filter(modifiedExchange);
        } catch (Exception ex) {
            return unauthorized(exchange);
        }
    }

    private boolean isPublicPath(String path) {
        return path.startsWith("/api/auth")
            || path.startsWith("/api/cours")
            || path.startsWith("/api/sports")
            || path.startsWith("/api/reservations")
            || path.startsWith("/api/subscriptions")
            || path.startsWith("/actuator/");
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
