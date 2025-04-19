package com.sliva.todolist.controller;

import com.sliva.todolist.model.Task;
import com.sliva.todolist.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping(value = "/todolist")
@RestController
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @GetMapping
    public List<Task> findAll() {
        return taskRepository.findAll();
    }

    @PostMapping
    public Task save(@RequestBody Task task) {
        return taskRepository.save(task);
    }

    @PutMapping(value = "/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (updates.containsKey("completed")) {
            task.setCompleted((Boolean) updates.get("completed"));
        }

        return taskRepository.save(task);
    }

    @DeleteMapping(value = "/{id}")
    public void delete(@PathVariable Long id) {
        taskRepository.deleteById(id);
    }
}
