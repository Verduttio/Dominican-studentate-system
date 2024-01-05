package org.verduttio.dominicanappbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.dto.ScheduleDTO;
import org.verduttio.dominicanappbackend.entity.Schedule;
import org.verduttio.dominicanappbackend.service.ScheduleService;
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

    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestBody ScheduleDTO scheduleDTO) {
        try {
            scheduleService.saveSchedule(scheduleDTO);
        } catch (IllegalArgumentException | TaskNotFoundException | UserNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY);
        }

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

//    @PutMapping("/{scheduleId}")
//    public ResponseEntity<Schedule> updateSchedule(@PathVariable Long scheduleId, @RequestBody Schedule updatedSchedule) {
//        return scheduleService.getScheduleById(scheduleId)
//                .map(existingSchedule -> {
//                    existingSchedule.setTask(updatedSchedule.getTask());
//                    existingSchedule.setUser(updatedSchedule.getUser());
//                    existingSchedule.setDate(updatedSchedule.getDate());
//
//                    scheduleService.saveSchedule(existingSchedule);
//                    return new ResponseEntity<>(existingSchedule, HttpStatus.OK);
//                })
//                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
//    }

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long scheduleId) {
        scheduleService.deleteSchedule(scheduleId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
