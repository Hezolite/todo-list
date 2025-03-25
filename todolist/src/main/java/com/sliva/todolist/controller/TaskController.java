package com.sliva.todolist.controller;

import com.sliva.todolist.model.Task;
import com.sliva.todolist.repository.TaskRepository;
import org.antlr.v4.runtime.misc.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PutMapping
    public Task update(@RequestBody Task task) {
        return taskRepository.save(task);
    }

    @DeleteMapping(value = "/{id}")
    public void delete(@PathVariable Long id) {
        taskRepository.deleteById(id);
    }
}
