package com.sliva.todolist.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import org.springframework.lang.NonNull;

import java.util.Date;
@Entity
public class Task {
    private Long id;

    private String title;
    private Date deadline;
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

    public Date getDeadline() {
        return deadline;
    }

    public String getTitle() {
        return title;
    }

    @Id
    @GeneratedValue
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDeadline(Date deadline) {
        this.deadline = deadline;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Task() {

    }

    public Task(Long id, String title, Date deadline, String description, boolean completed) {
        this.id = id;
        this.title = title;
        this.deadline = deadline;
        this.description = description;
        this.completed = completed;
    }
}
