package com.yum.foodyy.Config;

import com.yum.foodyy.Service.AdminDetailsService;
import com.yum.foodyy.Service.CustomerDetailsService;
import com.yum.foodyy.Service.JwtService;
import com.yum.foodyy.Service.TokenBlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AdminDetailsService adminDetailsService;

    @Autowired
    private CustomerDetailsService customerDetailsService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getServletPath();
        if (
                path.equals("/admin/signin") ||
                path.equals("/customer/signin") ||
                path.equals("/customer/signup")) {

            filterChain.doFilter(request, response);
            return;
        }


        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if(!tokenBlacklistService.isBlacklisted(token)){


        String username = jwtService.extractUsername(token);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails;

            try{
                if (username.contains("@")) {
                    userDetails = customerDetailsService.loadUserByUsername(username);
                } else {
                    userDetails = adminDetailsService.loadUserByUsername(username);
                }
                System.out.println("JwtFilter: User loaded from DB: " + userDetails.getUsername());
            } catch (Exception e) {
                System.out.println("JwtFilter: User loading FAILED: " + e.getMessage());
                filterChain.doFilter(request, response);
                return;
            }


            if (jwtService.validateToken(token, userDetails)) {
//                if the token is genuine, Spring Security needs to create the authentication object and
//                place it into the SecurityContext, so the rest of the app knows the user is logged in.
                System.out.println("JwtFilter: Token Validated. Setting Auth.");
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }else{
                System.out.println("JwtFilter: Token Validation Failed!");
            }
        }
        }else{
            System.out.println("JwtFilter: Token is Blacklisted.");
        }

        filterChain.doFilter(request, response);
    }
}
