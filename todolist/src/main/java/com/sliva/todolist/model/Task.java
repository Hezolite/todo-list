package com.sliva.todolist.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Task {
    @Id
    @GeneratedValue
    private Long id;
    private String title;
    private LocalDate deadline;
    private String description;

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public boolean isCompleted() {
        return completed;
    }

    private boolean completed;


    public String getDescription() {
        return description;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public String getTitle() {
        return title;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Task() {

    }

    public Task(Long id, String title, LocalDate deadline, String description, boolean completed) {
        this.id = id;
        this.title = title;
        this.deadline = deadline;
        this.description = description;
        this.completed = completed;
    }
}
