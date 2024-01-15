package org.verduttio.dominicanappbackend.validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.verduttio.dominicanappbackend.dto.ScheduleDTO;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.Schedule;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.service.TaskService;
import org.verduttio.dominicanappbackend.service.UserService;
import org.verduttio.dominicanappbackend.service.ObstacleService;
import org.verduttio.dominicanappbackend.service.ConflictService;
import org.verduttio.dominicanappbackend.service.exception.*;

import java.time.DayOfWeek;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ScheduleValidator {

    private final ScheduleRepository scheduleRepository;
    private final UserService userService;
    private final TaskService taskService;
    private final ObstacleService obstacleService;
    private final ConflictService conflictService;

    @Autowired
    public ScheduleValidator(ScheduleRepository scheduleRepository, UserService userService, TaskService taskService,
                             ObstacleService obstacleService, ConflictService conflictService) {
        this.scheduleRepository = scheduleRepository;
        this.userService = userService;
        this.taskService = taskService;
        this.obstacleService = obstacleService;
        this.conflictService = conflictService;
    }

    public void validateSchedule(ScheduleDTO scheduleDTO, boolean ignoreConflicts) {
        User user = userService.getUserById(scheduleDTO.getUserId()).orElseThrow(() ->
                new EntityNotFoundException("User with given id does not exist"));

        Task task = taskService.getTaskById(scheduleDTO.getTaskId()).orElseThrow(() ->
                new EntityNotFoundException("Task with given id does not exist"));

        checkIfTaskOccursOnGivenDayOfWeek(scheduleDTO, task);
        checkIfUserHasAllowedRoleForTask(user, task);
        checkIfUserHasValidApprovedObstacleForTask(scheduleDTO, user, task);
        checkScheduleConflict(scheduleDTO, ignoreConflicts);
    }

    public boolean isScheduleInConflictWithOtherSchedules(Schedule schedule) {
        List<Schedule> schedules = scheduleRepository.findByUserIdAndDate(schedule.getUser().getId(), schedule.getDate());
        for(Schedule otherSchedule : schedules) {
            if(conflictService.tasksAreInConflict(schedule.getTask().getId(), otherSchedule.getTask().getId())) {
                return true;
            }
        }
        return false;
    }


    public boolean userHasAllowedRoleForTask(User user, Task task) {
        Set<String> userRoleNames = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        Set<String> allowedRoleNames = task.getAllowedRoles().stream().map(Role::getName).collect(Collectors.toSet());

        return !Collections.disjoint(userRoleNames, allowedRoleNames);
    }

    public void checkIfScheduleExists(Long scheduleId) {
        if(!scheduleRepository.existsById(scheduleId)) {
            throw new EntityNotFoundException("Schedule with given id does not exist");
        }
    }

    private void checkIfTaskOccursOnGivenDayOfWeek(ScheduleDTO scheduleDTO, Task task) {
        DayOfWeek scheduleDayOfWeek = scheduleDTO.getDate().getDayOfWeek();
        Set<DayOfWeek> taskDaysOfWeek = task.getDaysOfWeek();
        if(!taskDaysOfWeek.contains(scheduleDayOfWeek)) {
            throw new IllegalArgumentException("Task does not occur on given day of week: " + scheduleDayOfWeek);
        }
    }

    private void checkIfUserHasAllowedRoleForTask(User user, Task task) {
        if(!userHasAllowedRoleForTask(user, task)) {
            throw new RoleNotMeetRequirementsException("User does not have allowed role for task");
        }
    }

    private void checkIfUserHasValidApprovedObstacleForTask(ScheduleDTO scheduleDTO, User user, Task task) {
        if(!obstacleService.findApprovedObstaclesByUserIdAndTaskIdForDate(user.getId(), task.getId(), scheduleDTO.getDate()).isEmpty()) {
            throw new EntityAlreadyExistsException("User has an approved obstacle for this task");
        }
    }

    private void checkScheduleConflict(ScheduleDTO scheduleDTO, boolean ignoreConflicts) {
        if(!ignoreConflicts && isScheduleInConflictWithOtherSchedules(scheduleDTO.toSchedule())) {
            throw new ScheduleIsInConflictException("Schedule is in conflict with other schedules");
        }
    }
}
