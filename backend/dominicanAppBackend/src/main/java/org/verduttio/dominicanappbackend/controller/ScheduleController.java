package org.verduttio.dominicanappbackend.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.dto.ScheduleDTO;
import org.verduttio.dominicanappbackend.entity.Schedule;
import org.verduttio.dominicanappbackend.service.ScheduleService;
import org.verduttio.dominicanappbackend.service.exception.ObstacleExistsException;
import org.verduttio.dominicanappbackend.service.exception.TaskNotFoundException;
import org.verduttio.dominicanappbackend.service.exception.UserNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @Autowired
    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public ResponseEntity<List<Schedule>> getAllSchedules() {
        List<Schedule> schedules = scheduleService.getAllSchedules();
        return new ResponseEntity<>(schedules, HttpStatus.OK);
    }

    @GetMapping("/{scheduleId}")
    public ResponseEntity<Schedule> getScheduleById(@PathVariable Long scheduleId) {
        return scheduleService.getScheduleById(scheduleId)
                .map(schedule -> new ResponseEntity<>(schedule, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAllSchedulesByUserId(@PathVariable Long userId) {
        List<Schedule> schedules;
        try {
            schedules = scheduleService.getAllSchedulesByUserId(userId);
        } catch (UserNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(schedules, HttpStatus.OK);
    }

    @GetMapping("/current")
    public ResponseEntity<List<Schedule>> getCurrentSchedules() {
        List<Schedule> schedules = scheduleService.getCurrentSchedules();
        return new ResponseEntity<>(schedules, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> createSchedule(@Valid @RequestBody ScheduleDTO scheduleDTO,
                                            @RequestParam(required = false, defaultValue = "false") boolean ignoreConflicts) {
        try {
            scheduleService.saveSchedule(scheduleDTO, ignoreConflicts);
        } catch (IllegalArgumentException | TaskNotFoundException | UserNotFoundException | ObstacleExistsException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY);
        }

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{scheduleId}")
    public ResponseEntity<Void> updateSchedule(@PathVariable Long scheduleId,
                                               @Valid @RequestBody ScheduleDTO updatedScheduleDTO,
                                               @RequestParam(required = false, defaultValue = "false") boolean ignoreConflicts) {
        if (scheduleService.existsById(scheduleId)) {
            scheduleService.updateSchedule(scheduleId, updatedScheduleDTO, ignoreConflicts);
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long scheduleId) {
        scheduleService.deleteSchedule(scheduleId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
