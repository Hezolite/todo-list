package com.sliva.todolist.controller;

import com.sliva.todolist.model.Task;
import com.sliva.todolist.model.User;
import com.sliva.todolist.repository.TaskRepository;
import com.sliva.todolist.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/todolist")
@CrossOrigin(origins = "*")
public class TaskController {
    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllTasks(@RequestHeader("Authorization") String token) {
        try {
            logger.info("Getting all tasks for user with token: {}", token);
            Long userId = extractUserIdFromToken(token);
            List<Task> tasks = taskRepository.findByUserId(userId);
            logger.info("Found {} tasks for user {}", tasks.size(), userId);

            List<Map<String, Object>> taskDtos = tasks.stream()
                .map(task -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", task.getId());
                    dto.put("title", task.getTitle());
                    dto.put("description", task.getDescription());
                    dto.put("deadline", task.getDeadline());
                    dto.put("completed", task.isCompleted());
                    return dto;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(taskDtos);
        } catch (Exception e) {
            logger.error("Error getting tasks: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get tasks: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Task task, @RequestHeader("Authorization") String token) {
        try {
            logger.info("Creating new task: {}", task.getTitle());
            Long userId = extractUserIdFromToken(token);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            task.setUser(user);
            Task savedTask = taskRepository.save(task);
            logger.info("Task created successfully with ID: {}", savedTask.getId());

            Map<String, Object> taskDto = new HashMap<>();
            taskDto.put("id", savedTask.getId());
            taskDto.put("title", savedTask.getTitle());
            taskDto.put("description", savedTask.getDescription());
            taskDto.put("deadline", savedTask.getDeadline());
            taskDto.put("completed", savedTask.isCompleted());
            
            return ResponseEntity.ok(taskDto);
        } catch (Exception e) {
            logger.error("Error creating task: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create task: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody Map<String, Object> updates,
                                         @RequestHeader("Authorization") String token) {
        try {
            logger.info("Updating task with ID: {}", id);
            Long userId = extractUserIdFromToken(token);
            Task task = taskRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            if (!task.getUser().getId().equals(userId)) {
                logger.warn("User {} attempted to update task {} which belongs to user {}", userId, id, task.getUser().getId());
                Map<String, String> error = new HashMap<>();
                error.put("message", "You don't have permission to update this task");
                return ResponseEntity.badRequest().body(error);
            }

            if (updates.containsKey("completed")) {
                task.setCompleted((Boolean) updates.get("completed"));
            }
            if (updates.containsKey("title")) {
                task.setTitle((String) updates.get("title"));
            }
            if (updates.containsKey("description")) {
                task.setDescription((String) updates.get("description"));
            }
            if (updates.containsKey("deadline")) {
                task.setDeadline(LocalDate.parse((String) updates.get("deadline")));
            }

            Task updatedTask = taskRepository.save(task);
            logger.info("Task {} updated successfully", id);

            Map<String, Object> taskDto = new HashMap<>();
            taskDto.put("id", updatedTask.getId());
            taskDto.put("title", updatedTask.getTitle());
            taskDto.put("description", updatedTask.getDescription());
            taskDto.put("deadline", updatedTask.getDeadline());
            taskDto.put("completed", updatedTask.isCompleted());
            
            return ResponseEntity.ok(taskDto);
        } catch (Exception e) {
            logger.error("Error updating task: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update task: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        try {
            logger.info("Deleting task with ID: {}", id);
            Long userId = extractUserIdFromToken(token);
            Task task = taskRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            if (!task.getUser().getId().equals(userId)) {
                logger.warn("User {} attempted to delete task {} which belongs to user {}", userId, id, task.getUser().getId());
                Map<String, String> error = new HashMap<>();
                error.put("message", "You don't have permission to delete this task");
                return ResponseEntity.badRequest().body(error);
            }

            taskRepository.delete(task);
            logger.info("Task {} deleted successfully", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting task: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete task: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTask(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        try {
            logger.info("Getting task with ID: {}", id);
            Long userId = extractUserIdFromToken(token);
            Task task = taskRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            if (!task.getUser().getId().equals(userId)) {
                logger.warn("User {} attempted to access task {} which belongs to user {}", userId, id, task.getUser().getId());
                Map<String, String> error = new HashMap<>();
                error.put("message", "You don't have permission to access this task");
                return ResponseEntity.badRequest().body(error);
            }

            Map<String, Object> taskDto = new HashMap<>();
            taskDto.put("id", task.getId());
            taskDto.put("title", task.getTitle());
            taskDto.put("description", task.getDescription());
            taskDto.put("deadline", task.getDeadline());
            taskDto.put("completed", task.isCompleted());

            return ResponseEntity.ok(taskDto);
        } catch (Exception e) {
            logger.error("Error getting task: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get task: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    private Long extractUserIdFromToken(String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                logger.error("Token is null or empty");
                throw new RuntimeException("Token is required");
            }

            String cleanToken = token.replace("Bearer ", "");

            String userIdStr = cleanToken.replace("dummy-token-", "");
            logger.info("Extracted user ID from token: {}", userIdStr);
            
            return Long.parseLong(userIdStr);
        } catch (Exception e) {
            logger.error("Error extracting user ID from token: {}", token, e);
            throw new RuntimeException("Invalid token format");
        }
    }
}
