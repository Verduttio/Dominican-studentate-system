package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.dto.ScheduleDTO;
import org.verduttio.dominicanappbackend.dto.UserTaskDependencyDTO;
import org.verduttio.dominicanappbackend.entity.*;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.service.exception.EntityAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.service.exception.RoleNotMeetRequirementsException;
import org.verduttio.dominicanappbackend.service.exception.ScheduleIsInConflictException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserService userService;
    private final TaskService taskService;
    private final RoleService roleService;
    private final ObstacleService obstacleService;
    private final ConflictService conflictService;

    @Autowired
    public ScheduleService(ScheduleRepository scheduleRepository, UserService userService, TaskService taskService, RoleService roleService, ObstacleService obstacleService, ConflictService conflictService) {
        this.scheduleRepository = scheduleRepository;
        this.userService = userService;
        this.taskService = taskService;
        this.roleService = roleService;
        this.obstacleService = obstacleService;
        this.conflictService = conflictService;
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public Optional<Schedule> getScheduleById(Long scheduleId) {
        return scheduleRepository.findById(scheduleId);
    }

    public void saveSchedule(ScheduleDTO scheduleDTO, boolean ignoreConflicts) {
        validateSchedule(scheduleDTO, ignoreConflicts);

        Schedule schedule = scheduleDTO.toSchedule();
        scheduleRepository.save(schedule);
    }

    public void updateSchedule(Long scheduleId, ScheduleDTO updatedScheduleDTO, boolean ignoreConflicts) {
        checkIfScheduleExists(scheduleId);
        validateSchedule(updatedScheduleDTO, ignoreConflicts);

        Schedule schedule = updatedScheduleDTO.toSchedule();
        schedule.setId(scheduleId);
        scheduleRepository.save(schedule);
    }

    public List<Schedule> getSchedulesByUserIdAndDate(Long userId, LocalDate date) {
        return scheduleRepository.findByUserIdAndDate(userId, date);
    }

    public void deleteSchedule(Long scheduleId) {
        checkIfScheduleExists(scheduleId);
        scheduleRepository.deleteById(scheduleId);
    }

    public boolean existsById(Long scheduleId) {
        return scheduleRepository.existsById(scheduleId);
    }

    public List<Schedule> getAllSchedulesByUserId(Long userId) {
        if (!userService.existsById(userId)) {
            throw new EntityNotFoundException("User with given id does not exist");
        }
        return scheduleRepository.findByUserId(userId);
    }

    public List<Schedule> getCurrentSchedules() {
        return scheduleRepository.findSchedulesLaterOrInDay(LocalDate.now());
    }

    public void deleteAllSchedulesByTaskId(Long taskId) {
        scheduleRepository.deleteAllByTaskId(taskId);
    }

    public List<Task> getAvailableTasks(LocalDate from, LocalDate to) {
        List<Task> allTasks = taskService.getAllTasks();
        List<Schedule> schedulesInPeriod = scheduleRepository.findByDateBetween(from, to);

        return getNotFullyAssignedTasks(allTasks, schedulesInPeriod);
    }

    public List<Task> getAvailableTasksBySupervisorRole(String supervisor, LocalDate from, LocalDate to) {
        Role supervisorRole = roleService.findByNameAndType(supervisor, RoleType.SUPERVISOR)
                .orElseThrow(() -> new EntityNotFoundException("Supervisor role not found or not a supervisor"));

        List<Task> allTasks = taskService.findTasksBySupervisorRoleName(supervisorRole.getName());
        List<Schedule> schedulesInPeriod = scheduleRepository.findByDateBetween(from, to);

        return getNotFullyAssignedTasks(allTasks, schedulesInPeriod);
    }

    private List<Task> getNotFullyAssignedTasks(List<Task> allTasks, List<Schedule> schedulesInPeriod) {
        Map<Long, Long> taskOccurrences = schedulesInPeriod.stream()
                .collect(Collectors.groupingBy(schedule -> schedule.getTask().getId(), Collectors.counting()));

        return allTasks.stream().filter(task -> {
            Long occurrences = taskOccurrences.getOrDefault(task.getId(), 0L);
            if (task.isParticipantForWholePeriod()) {
                return occurrences < task.getParticipantsLimit();
            } else {
                int requiredOccurrences = task.getParticipantsLimit() * task.getDaysOfWeek().size();
                return occurrences < requiredOccurrences;
            }
        }).collect(Collectors.toList());
    }

    public List<UserTaskDependencyDTO> getAllUserDependenciesForTask(Long taskId, LocalDate from, LocalDate to) {
        List<User> users = userService.getAllUsers();
        return users.stream()
                .map(user -> getUserDependenciesForTask(taskId, user.getId(), from, to))
                .collect(Collectors.toList());
    }

    public UserTaskDependencyDTO getUserDependenciesForTask(Long taskId, Long userId, LocalDate from, LocalDate to) {
        // Sprawdz czy zadanie istnieje
        Task task = taskService.getTaskById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));

        // Sprawdz czy użytkownik istnieje
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));


        long count = getTaskCompletionCountForUserInLastNDays(userId, taskId, 365);
        LocalDate lastDate = getLastTaskCompletionDateForUser(userId, taskId).orElse(null);

        // Pobierz inne taski wykonywane przez danego użytkownika w danym czasie
        List<Schedule> schedules = getSchedulesByUserIdAndDateBetween(userId, from, to);
        List<Task> tasks = getTasksFromSchedules(schedules);
        // Utwórz listę stringów z nazwami tasków
        List<String> taskNames = tasks.stream().map(Task::getName).toList();

        // Czy zadany task jest w konflikcie z którymś z tasków pobranych
        boolean isConflict = tasks.stream().anyMatch(t -> conflictService.tasksAreInConflict(taskId, t.getId()));

        // Czy użytkownik posiada aktualną przeszkodę dla zadanego taska
        List<Obstacle> validObstacles = obstacleService.findApprovedObstaclesByUserIdAndTaskIdForDate(userId, taskId, from);
        boolean hasObstacle = !validObstacles.isEmpty();


        return new UserTaskDependencyDTO(user.getName()+" "+user.getSurname(), lastDate, (int) count, taskNames, isConflict, hasObstacle);
    }

    public long getTaskCompletionCountForUserInLastNDays(Long userId, Long taskId, int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);

        return scheduleRepository.countByUserIdAndTaskIdInLastNDays(userId, taskId, startDate, endDate);
    }

    public Optional<LocalDate> getLastTaskCompletionDateForUser(Long userId, Long taskId) {
        return scheduleRepository.findLatestTaskCompletionDateByUserIdAndTaskId(userId, taskId);
    }

    public List<Schedule> getSchedulesByUserIdAndDateBetween(Long userId, LocalDate from, LocalDate to) {
        return scheduleRepository.findByUserIdAndDateBetween(userId, from, to);
    }

    private List<Task> getTasksFromSchedules(List<Schedule> schedules) {
        return schedules.stream().map(Schedule::getTask).collect(Collectors.toList());
    }

    ////////////////////WALIDACJA
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
