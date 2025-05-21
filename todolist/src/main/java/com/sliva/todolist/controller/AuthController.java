package com.sliva.todolist.controller;

import com.sliva.todolist.model.User;
import com.sliva.todolist.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("email", user.getEmail());
                    userMap.put("firstName", user.getFirstName());
                    userMap.put("lastName", user.getLastName());
                    return userMap;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error getting users: ", e);
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to get users: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            logger.info("Attempting to register user with email: {}", user.getEmail());
            
            if (userRepository.existsByEmail(user.getEmail())) {
                logger.warn("Registration failed: Email already exists - {}", user.getEmail());
                return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User savedUser = userRepository.save(user);
            logger.info("User registered successfully with ID: {}", savedUser.getId());

            return ResponseEntity.ok(Map.of("message", "User registered successfully"));
        } catch (Exception e) {
            logger.error("Error during registration: ", e);
            return ResponseEntity.internalServerError().body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            
            logger.info("Login attempt for email: {}", email);

            User user = userRepository.findByEmail(email)
                    .orElse(null);

            if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
                logger.warn("Login failed for email: {}", email);
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid email or password"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("token", "dummy-token-" + user.getId());
            response.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName()
            ));

            logger.info("Login successful for user: {}", user.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error during login: ", e);
            return ResponseEntity.internalServerError().body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    @GetMapping("/check-user/{id}")
    public ResponseEntity<?> checkUser(@PathVariable Long id) {
        try {
            logger.info("Checking user with ID: {}", id);
            User user = userRepository.findById(id)
                    .orElse(null);
            
            if (user == null) {
                logger.warn("User not found with ID: {}", id);
                return ResponseEntity.ok(Map.of(
                    "exists", false,
                    "message", "User not found"
                ));
            }

            return ResponseEntity.ok(Map.of(
                "exists", true,
                "user", Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName()
                )
            ));
        } catch (Exception e) {
            logger.error("Error checking user: ", e);
            return ResponseEntity.internalServerError().body(Map.of("message", "Error checking user: " + e.getMessage()));
        }
    }
} 