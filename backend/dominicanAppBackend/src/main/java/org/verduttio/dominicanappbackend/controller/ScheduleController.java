package org.verduttio.dominicanappbackend.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.dto.schedule.*;
import org.verduttio.dominicanappbackend.dto.user.UserSchedulesOnDaysDTO;
import org.verduttio.dominicanappbackend.dto.user.UserTaskStatisticsDTO;
import org.verduttio.dominicanappbackend.dto.user.scheduleInfo.UserTasksScheduleInfoWeekly;
import org.verduttio.dominicanappbackend.dto.user.scheduleInfo.UserTasksScheduleInfoWeeklyByAllDays;
import org.verduttio.dominicanappbackend.domain.Schedule;
import org.verduttio.dominicanappbackend.service.schedule.ScheduleService;
import org.verduttio.dominicanappbackend.service.exception.EntityAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.service.exception.RoleNotMeetRequirementsException;
import org.verduttio.dominicanappbackend.service.exception.ScheduleIsInConflictException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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

    @GetMapping("/users/{userId}/history")
    public ResponseEntity<?> getScheduleHistoryForUser(@PathVariable Long userId,
                                                       @RequestParam("date") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate date,
                                                       @RequestParam("weeks") int numberOfWeeksToDisplay){
        Map<Integer, List<String>> userScheduleHistory;
        try {
            userScheduleHistory = scheduleService.getScheduleHistoryForUser(userId, date, numberOfWeeksToDisplay);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(userScheduleHistory, HttpStatus.OK);
    }

    @GetMapping("/users/scheduleShortInfo/week")
    public ResponseEntity<?> getShortScheduleInfoForSpecifiedWeek(
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        List<ScheduleShortInfoForUser> userSchedulesForSpecifiedWeek;
        try {
            userSchedulesForSpecifiedWeek = scheduleService.getScheduleShortInfoForAllowedUsersForSpecifiedWeek(from, to);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(userSchedulesForSpecifiedWeek, HttpStatus.OK);
    }

    @GetMapping("/users/groupedScheduleShortInfo/week")
    public ResponseEntity<?> getGroupedShortScheduleInfoForSpecifiedWeek(
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        List<GroupedTasksByRolesInScheduleInfoForUser> userSchedulesForSpecifiedWeek;
        try {
            userSchedulesForSpecifiedWeek = scheduleService.getGroupedTasksByRolesInScheduleInfoForAllowedUsersForSpecifiedWeek(from, to);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(userSchedulesForSpecifiedWeek, HttpStatus.OK);
    }

    @GetMapping("/tasks/scheduleShortInfo/week")
    public ResponseEntity<?> getShortScheduleInfoForSpecifiedWeekForTasks(
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        List<ScheduleShortInfoForTask> taskSchedulesForSpecifiedWeek;
        try {
            taskSchedulesForSpecifiedWeek = scheduleService.getScheduleShortInfoForEachTaskForSpecifiedWeek(from, to);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(taskSchedulesForSpecifiedWeek, HttpStatus.OK);
    }

    @GetMapping("/tasks/byRole/{supervisorRole}/scheduleShortInfo/week")
    public ResponseEntity<?> getShortScheduleInfoForSpecifiedWeekForTasksBySupervisorRole(
            @PathVariable String supervisorRole,
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        List<ScheduleShortInfoForTask> taskSchedulesForSpecifiedWeek;
        try {
            taskSchedulesForSpecifiedWeek = scheduleService.getScheduleShortInfoForTaskByRoleForSpecifiedWeek(supervisorRole, from, to);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(taskSchedulesForSpecifiedWeek, HttpStatus.OK);
    }

    @GetMapping("/users/days")
    public ResponseEntity<?> getSchedulePdfForUsersByDays(
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            List<UserSchedulesOnDaysDTO> schedules = scheduleService.getListOfUserSchedulesByDaysDTO(from, to);
            return new ResponseEntity<>(schedules, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/byRole/{supervisorRoleName}/users/days")
    public ResponseEntity<?> getSchedulePdfForUsersBySupervisorRoleByDays(
            @PathVariable String supervisorRoleName,
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            List<UserSchedulesOnDaysDTO> schedules = scheduleService.getListOfUserSchedulesByDaysDTO(from, to, supervisorRoleName);
            return new ResponseEntity<>(schedules, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("task/{roleName}/all/schedule-info/weekly")
    public ResponseEntity<?> getUserTasksScheduleInfoWeeklyByRole(
                                                            @PathVariable String roleName,
                                                            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
                                                           @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            List<UserTasksScheduleInfoWeekly> dependencies = scheduleService.getUserTasksScheduleInfoWeeklyByRole(roleName, from, to);
            return ResponseEntity.ok(dependencies);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("task/{roleName}/{userId}/schedule-info/weekly")
    public ResponseEntity<?> getUserTasksScheduleInfoWeeklyByRoleForOneUser(
            @PathVariable String roleName,
            @PathVariable Long userId,
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            UserTasksScheduleInfoWeekly userDependency = scheduleService.getUserTasksScheduleInfoWeeklyByRole(roleName, userId, from, to);
            return ResponseEntity.ok(userDependency);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("task/{roleName}/all/schedule-info/weekly/by-all-days")
    public ResponseEntity<?> getUserTasksScheduleInfoWeeklyByRoleByAllDays(
            @PathVariable String roleName,
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            List<UserTasksScheduleInfoWeeklyByAllDays> dependencies = scheduleService.getUserTasksScheduleInfoWeeklyByAllDaysByRole(roleName, from, to);
            return ResponseEntity.ok(dependencies);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("task/{roleName}/{userId}/schedule-info/weekly/by-all-days")
    public ResponseEntity<?> getUserTasksScheduleInfoWeeklyByRoleByAllDaysForOneUser(
            @PathVariable String roleName,
            @PathVariable Long userId,
            @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
            @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            UserTasksScheduleInfoWeeklyByAllDays userDependency = scheduleService.getUserTasksScheduleInfoWeeklyByAllDaysByRole(roleName, userId, from, to);
            return ResponseEntity.ok(userDependency);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("task/{roleName}/{userId}/schedule-info/daily")
    public ResponseEntity<?> getUserTasksScheduleInfoWeeklyForOneDayByRoleForOneUser(
            @PathVariable String roleName,
            @PathVariable Long userId,
            @RequestParam("date") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate date) {
        try {
            UserTasksScheduleInfoWeekly dependencies = scheduleService.getUserTasksScheduleInfoWeeklyForOneDayByRole(roleName, userId, date);
            return ResponseEntity.ok(dependencies);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("task/{roleName}/all/schedule-info/daily")
    public ResponseEntity<?> getUserTasksScheduleInfoWeeklyForOneDayByRole(
            @PathVariable String roleName,
            @RequestParam("date") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate date) {
        try {
            List<UserTasksScheduleInfoWeekly> dependencies = scheduleService.getUserTasksScheduleInfoWeeklyForOneDayByRole(roleName, date);
            return ResponseEntity.ok(dependencies);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/users/{userId}/statistics/tasks")
    public ResponseEntity<?> getStatisticsForUserTasks(@PathVariable Long userId) {
        try {
            List<UserTaskStatisticsDTO> userTaskStatistics = scheduleService.getStatisticsForUserTasks(userId);
            return new ResponseEntity<>(userTaskStatistics, HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/generator/kitchen-style/{roleId}")
    public ResponseEntity<?> generateSchedule(@PathVariable Long roleId,
                                              @RequestParam("startingFromUserId") Long startingFromUserId,
                                              @RequestParam("from") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate from,
                                              @RequestParam("to") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate to) {
        try {
            scheduleService.generateSchedule(roleId, startingFromUserId, from, to);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
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

    @DeleteMapping("/forWholePeriod")
    public ResponseEntity<?> deleteScheduleForWholePeriod(@Valid @RequestBody AddScheduleForWholePeriodTaskDTO addScheduleForWholePeriodTaskDTO) {
        try {
            scheduleService.deleteScheduleForWholePeriodTask(addScheduleForWholePeriodTaskDTO);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/forDailyPeriod")
    public ResponseEntity<?> deleteScheduleForDailyPeriod(@Valid @RequestBody AddScheduleForDailyPeriodTaskDTO addScheduleForDailyPeriodTaskDTO) {
        try {
            scheduleService.deleteScheduleForDailyPeriodTask(addScheduleForDailyPeriodTaskDTO);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
