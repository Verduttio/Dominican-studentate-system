package org.verduttio.dominicanappbackend.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.dto.TaskDTO;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.service.TaskService;
import org.verduttio.dominicanappbackend.service.exception.TaskNotFoundException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        return new ResponseEntity<>(tasks, HttpStatus.OK);
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long taskId) {
        Optional<Task> task = taskService.getTaskById(taskId);
        return task.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<Void> createTask(@Valid @RequestBody TaskDTO taskDTO) {
        taskService.saveTask(taskDTO);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<Void> updateTask(@PathVariable Long taskId, @Valid @RequestBody TaskDTO updatedTaskDTO) {
        Optional<Task> existingTask = taskService.getTaskById(taskId);
        if (existingTask.isPresent()) {
            taskService.updateTask(existingTask.get(), updatedTaskDTO);
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        try {
            taskService.deleteTask(taskId);
        } catch (TaskNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
