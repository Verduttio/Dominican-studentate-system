package org.verduttio.dominicanappbackend.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.dto.schedule.AddScheduleForDailyPeriodTaskDTO;
import org.verduttio.dominicanappbackend.dto.schedule.AddScheduleForWholePeriodTaskDTO;
import org.verduttio.dominicanappbackend.dto.schedule.ScheduleDTO;
import org.verduttio.dominicanappbackend.dto.user.UserTaskDependencyDTO;
import org.verduttio.dominicanappbackend.entity.Schedule;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.service.PdfService;
import org.verduttio.dominicanappbackend.service.ScheduleService;
import org.verduttio.dominicanappbackend.service.exception.*;

import java.io.IOException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final PdfService pdfService;

    @Autowired
    public ScheduleController(ScheduleService scheduleService, PdfService pdfService) {
        this.scheduleService = scheduleService;
        this.pdfService = pdfService;
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> downloadPdf() {
        try {
            List<Schedule> schedules = scheduleService.getAllSchedules();
            byte[] pdfContent = pdfService.generateSchedulePdf(schedules);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=schedules.pdf");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfContent);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
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
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(schedules, HttpStatus.OK);
    }

    @GetMapping("/current")
    public ResponseEntity<List<Schedule>> getCurrentSchedules() {
        List<Schedule> schedules = scheduleService.getCurrentSchedules();
        return new ResponseEntity<>(schedules, HttpStatus.OK);
    }

    @GetMapping("/available-tasks")
    public ResponseEntity<?> getAvailableTasks(@RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
                                               @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            if (!from.getDayOfWeek().equals(DayOfWeek.MONDAY) || !to.getDayOfWeek().equals(DayOfWeek.SUNDAY)
                    || ChronoUnit.DAYS.between(from, to) != 6) {
                throw new IllegalArgumentException("Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week.");
            }

            List<Task> availableTasks = scheduleService.getAvailableTasks(from, to);
            return new ResponseEntity<>(availableTasks, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/users/{userId}/week")
    public ResponseEntity<?> getAllSchedulesByUserIdForSpecifiedWeek(@PathVariable Long userId,
                                                                     @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
                                                                     @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        List<Schedule> userSchedulesForSpecifiedWeek;
        try {
            userSchedulesForSpecifiedWeek = scheduleService.getAllSchedulesByUserIdForSpecifiedWeek(userId, from, to);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(userSchedulesForSpecifiedWeek, HttpStatus.OK);
    }

    @GetMapping("/available-tasks/by-supervisor/{supervisor}")
    public ResponseEntity<?> getAvailableTasksBySupervisorRole(
            @PathVariable String supervisor,
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            if (!from.getDayOfWeek().equals(DayOfWeek.MONDAY) || !to.getDayOfWeek().equals(DayOfWeek.SUNDAY)
                    || ChronoUnit.DAYS.between(from, to) != 6) {
                throw new IllegalArgumentException("Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week.");
            }

            List<Task> availableTasks = scheduleService.getAvailableTasksBySupervisorRole(supervisor, from, to);
            return new ResponseEntity<>(availableTasks, HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/task/{taskId}/user-dependencies")
    public ResponseEntity<List<UserTaskDependencyDTO>> getUserDependenciesForTask(
            @PathVariable Long taskId,
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            if (!from.getDayOfWeek().equals(DayOfWeek.MONDAY) || !to.getDayOfWeek().equals(DayOfWeek.SUNDAY)
                    || ChronoUnit.DAYS.between(from, to) != 6) {
                throw new IllegalArgumentException("Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week.");
            }

            List<UserTaskDependencyDTO> dependencies = scheduleService.getAllUserDependenciesForTask(taskId, from, to);
            return ResponseEntity.ok(dependencies);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }



    @PostMapping
    public ResponseEntity<?> createSchedule(@Valid @RequestBody ScheduleDTO scheduleDTO,
                                            @RequestParam(required = false, defaultValue = "false") boolean ignoreConflicts) {
        try {
            scheduleService.saveSchedule(scheduleDTO, ignoreConflicts);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (EntityAlreadyExistsException | RoleNotMeetRequirementsException | ScheduleIsInConflictException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PostMapping("/forWholePeriod")
    public ResponseEntity<?> createScheduleForWholePeriod(@Valid @RequestBody AddScheduleForWholePeriodTaskDTO addScheduleForWholePeriodTaskDTO,
                                                          @RequestParam(required = false, defaultValue = "false") boolean ignoreConflicts) {
        try {
            scheduleService.createScheduleForWholePeriodTask(addScheduleForWholePeriodTaskDTO, ignoreConflicts);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (EntityAlreadyExistsException | RoleNotMeetRequirementsException | ScheduleIsInConflictException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PostMapping("/forDailyPeriod")
    public ResponseEntity<?> createScheduleForDailyPeriod(@Valid @RequestBody AddScheduleForDailyPeriodTaskDTO addScheduleForDailyPeriodTaskDTO,
                                                          @RequestParam(required = false, defaultValue = "false") boolean ignoreConflicts) {
        try {
            scheduleService.createScheduleForDailyPeriodTask(addScheduleForDailyPeriodTaskDTO, ignoreConflicts);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (EntityAlreadyExistsException | RoleNotMeetRequirementsException | ScheduleIsInConflictException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{scheduleId}")
    public ResponseEntity<?> updateSchedule(@PathVariable Long scheduleId,
                                               @Valid @RequestBody ScheduleDTO updatedScheduleDTO,
                                               @RequestParam(required = false, defaultValue = "false") boolean ignoreConflicts) {
        try {
            scheduleService.updateSchedule(scheduleId, updatedScheduleDTO, ignoreConflicts);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (ScheduleIsInConflictException | EntityAlreadyExistsException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long scheduleId) {
        try {
            scheduleService.deleteSchedule(scheduleId);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
