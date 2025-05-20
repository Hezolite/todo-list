package com.sliva.todolist.controller;

import com.sliva.todolist.model.TaskGroup;
import com.sliva.todolist.repository.TaskGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/taskgroups")
public class TaskGroupController {

    @Autowired
    private TaskGroupRepository taskGroupRepository;

    @GetMapping
    public List<TaskGroup> findAll() {
        return taskGroupRepository.findAll();
    }

    @PostMapping
    public TaskGroup create(@RequestBody TaskGroup taskGroup) {
        return taskGroupRepository.save(taskGroup);
    }

    @PutMapping("/{id}")
    public TaskGroup update(@PathVariable Long id, @RequestBody TaskGroup updatedGroup) {
        TaskGroup group = taskGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        group.setTitle(updatedGroup.getTitle());
        return taskGroupRepository.save(group);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        taskGroupRepository.deleteById(id);
    }
}