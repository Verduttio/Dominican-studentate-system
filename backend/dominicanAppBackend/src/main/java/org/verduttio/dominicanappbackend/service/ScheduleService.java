package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.dto.schedule.*;
import org.verduttio.dominicanappbackend.dto.user.UserTaskDependencyDailyDTO;
import org.verduttio.dominicanappbackend.dto.user.UserTaskDependencyWeeklyDTO;
import org.verduttio.dominicanappbackend.dto.user.UserTaskStatisticsDTO;
import org.verduttio.dominicanappbackend.entity.*;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.service.exception.EntityAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.service.exception.RoleNotMeetRequirementsException;
import org.verduttio.dominicanappbackend.service.exception.ScheduleIsInConflictException;
import org.verduttio.dominicanappbackend.validation.DateValidator;

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

    @SuppressWarnings("OptionalGetWithoutIsPresent")
    public void createScheduleForWholePeriodTask(AddScheduleForWholePeriodTaskDTO addScheduleDTO, boolean ignoreConflicts) {
        LocalDate from = addScheduleDTO.getFromDate();
        LocalDate to = addScheduleDTO.getToDate();

        validateAddScheduleForWholePeriodTask(addScheduleDTO, ignoreConflicts, from, to);

        LocalDate date = from;
        while(date.isBefore(to) || date.isEqual(to)) {
            Schedule schedule = new Schedule();
            schedule.setTask(taskService.getTaskById(addScheduleDTO.getTaskId()).get());
            schedule.setUser(userService.getUserById(addScheduleDTO.getUserId()).get());
            schedule.setDate(date);
            scheduleRepository.save(schedule);
            date = date.plusDays(1);
        }

    }

    @SuppressWarnings("OptionalGetWithoutIsPresent")
    public void createScheduleForDailyPeriodTask(AddScheduleForDailyPeriodTaskDTO addScheduleDTO, boolean ignoreConflicts) {
        LocalDate weekStartDate = addScheduleDTO.getWeekStartDate();
        LocalDate weekEndDate = addScheduleDTO.getWeekEndDate();
        LocalDate taskDate = addScheduleDTO.getTaskDate();

        validateAddScheduleForDailyPeriodTask(addScheduleDTO, ignoreConflicts, weekStartDate, weekEndDate, taskDate);

        Schedule schedule = new Schedule();
        schedule.setTask(taskService.getTaskById(addScheduleDTO.getTaskId()).get());
        schedule.setUser(userService.getUserById(addScheduleDTO.getUserId()).get());
        schedule.setDate(taskDate);
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

    public List<Schedule> getAllSchedulesForUserInSpecifiedWeek(Long userId, LocalDate from, LocalDate to) {
        return scheduleRepository.findByUserIdAndDateBetween(userId, from, to);
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
            int requiredOccurrences = task.getParticipantsLimit() * task.getDaysOfWeek().size();
            return occurrences < requiredOccurrences;
        }).collect(Collectors.toList());
    }

    public List<UserTaskDependencyWeeklyDTO> getAllUserDependenciesForTaskWeekly(Long taskId, LocalDate from, LocalDate to) {
        if(!DateValidator.dateStartsMondayEndsSunday(from, to)) {
            throw new IllegalArgumentException("Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week.");
        }

        Task task = taskService.getTaskById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task with given id does not exist"));

        List<User> users = userService.getUsersWhichHaveAnyOfRoles(task.getAllowedRoles().stream().map(Role::getName).collect(Collectors.toList()));
        return users.stream()
                .map(user -> getUserDependenciesForTaskWeekly(taskId, user.getId(), from, to))
                .collect(Collectors.toList());
    }

    public UserTaskDependencyWeeklyDTO getUserDependenciesForTaskWeekly(Long taskId, Long userId, LocalDate from, LocalDate to) {
        validate(!taskService.existsById(taskId), new EntityNotFoundException("Task with given id does not exist"));

        User user = userService.getUserById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        List<Schedule> userSchedulesForWeek = getSchedulesByUserIdAndDateBetween(userId, from, to);
        List<Task> userAssignedTasksForWeek = getTasksFromSchedules(userSchedulesForWeek);

        long numberOfTaskCompletionByUserInLast365days = getTaskCompletionCountForUserInLastNDaysFromDate(userId, taskId, from,365);

        LocalDate userLastCompletionDateForTask = getLastTaskCompletionDateForUser(userId, taskId, from).orElse(null);

        List<String> userAssignedTasksNamesForWeek = createInfoStringsOfTasksOccurrenceFromGivenSchedule(userSchedulesForWeek);

        boolean isConflict = checkIfTaskIsInConflictWithGivenTasks(taskId, userAssignedTasksForWeek);

        boolean hasObstacleForTaskOnWeek = checkIfUserHasValidApprovedObstacleForTaskBetweenDate(from, to, userId, taskId);

        boolean alreadyAssignedToTheTask = userAssignedTasksForWeek.stream().anyMatch(t -> t.getId().equals(taskId));

        return new UserTaskDependencyWeeklyDTO(userId, user.getName()+" "+user.getSurname(), userLastCompletionDateForTask, (int) numberOfTaskCompletionByUserInLast365days,
                userAssignedTasksNamesForWeek, isConflict, hasObstacleForTaskOnWeek, alreadyAssignedToTheTask);
    }

    public List<UserTaskDependencyDailyDTO> getAllUserDependenciesForTaskDaily(Long taskId, LocalDate from, LocalDate to) {
        if(!DateValidator.dateStartsMondayEndsSunday(from, to)) {
            throw new IllegalArgumentException("Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week.");
        }

        Task task = taskService.getTaskById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task with given id does not exist"));

        List<User> users = userService.getUsersWhichHaveAnyOfRoles(task.getAllowedRoles().stream().map(Role::getName).collect(Collectors.toList()));
        return users.stream()
                .map(user -> getUserDependenciesForTaskDaily(taskId, user.getId(), from, to))
                .collect(Collectors.toList());
    }

    public UserTaskDependencyDailyDTO getUserDependenciesForTaskDaily(Long taskId, Long userId, LocalDate from, LocalDate to) {
        validate(!taskService.existsById(taskId), new EntityNotFoundException("Task with given id does not exist"));

        User user = userService.getUserById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        List<Schedule> userSchedulesForWeek = getSchedulesByUserIdAndDateBetween(userId, from, to);

        long numberOfTaskCompletionByUserInLast365days = getTaskCompletionCountForUserInLastNDaysFromDate(userId, taskId, from,365);

        LocalDate userLastCompletionDateForTask = getLastTaskCompletionDateForUser(userId, taskId, from).orElse(null);

        List<String> userAssignedTasksNamesForWeek = createInfoStringsOfTasksOccurrenceFromGivenSchedule(userSchedulesForWeek);

        Set<DayOfWeek> isConflict = getDaysWhenTaskIsInConflictWithOther(taskId, userSchedulesForWeek);

        Set<DayOfWeek> hasObstacle = checkIfUserHasValidApprovedObstacleForTaskForWeek(from, userId, taskId);

        Set<DayOfWeek> alreadyAssignedToTheTask = userSchedulesForWeek.stream()
                .filter(s -> s.getTask().getId().equals(taskId))
                .map(s -> s.getDate().getDayOfWeek())
                .collect(Collectors.toSet());

        return new UserTaskDependencyDailyDTO(userId, user.getName()+" "+user.getSurname(), userLastCompletionDateForTask, (int) numberOfTaskCompletionByUserInLast365days,
                userAssignedTasksNamesForWeek, isConflict, hasObstacle, alreadyAssignedToTheTask);
    }

    private List<Task> getTasksFromSchedulePerformedByUserAndDateBetween(Long userId, LocalDate from, LocalDate to) {
        List<Schedule> schedules = getSchedulesByUserIdAndDateBetween(userId, from, to);
        return getTasksFromSchedules(schedules);
    }

    public List<String> createInfoStringsOfTasksOccurrenceFromGivenSchedule(List<Schedule> schedules) {
        // If task appears in the list n times, where n is the task occurrence in the week,
        // then it will be converted to "task.name" only string.
        // If task appears less than n times, then it will be converted to "task.name (P, W, Ś)" string,
        // where P, W, Ś are the days of the week when the task occurs.

        // Possible days of the week
        // Dictionary of DayOfWeek enum and its abbreviation in polish
        Map<DayOfWeek, String> dayOfWeekAbbreviations = Map.of(
                DayOfWeek.MONDAY, "Pn",
                DayOfWeek.TUESDAY, "Wt",
                DayOfWeek.WEDNESDAY, "Śr",
                DayOfWeek.THURSDAY, "Cz",
                DayOfWeek.FRIDAY, "Pt",
                DayOfWeek.SATURDAY, "So",
                DayOfWeek.SUNDAY, "Nd"
        );

        // Create a map of tasks and their DaysOfWeek assigns from task.date
        // Example: {task: [MONDAY, WEDNESDAY, FRIDAY], task2: [TUESDAY, THURSDAY]}
        Map<Task, Set<DayOfWeek>> taskDaysWhenItIsAssignedInSchedule = schedules.stream()
                .collect(Collectors.groupingBy(Schedule::getTask, Collectors.mapping(
                        schedule -> schedule.getDate().getDayOfWeek(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                list -> {
                                    Collections.sort(list);
                                    return new LinkedHashSet<>(list);
                                })
                )));


        return taskDaysWhenItIsAssignedInSchedule.entrySet().stream()
                .sorted(Map.Entry.comparingByKey(Comparator.comparing(Task::getName)))
                .map(entry -> {
                    Task task = entry.getKey();
                    Set<DayOfWeek> occurrences = entry.getValue();
                    if (occurrences.size() < task.getDaysOfWeek().size()) {
                        String daysOfWeekString = occurrences.stream()
                                .map(dayOfWeekAbbreviations::get)
                                .collect(Collectors.joining(", "));
                        return task.getName() + " (" + daysOfWeekString + ")";
                    } else {
                        return task.getName();
                    }
                })
                .collect(Collectors.toList());
    }

    public long getTaskCompletionCountForUserInLastNDaysFromDate(Long userId, Long taskId, LocalDate date, int days) {
        LocalDate startDate = date.minusDays(days);
        // We start counting from the day before the given date
        date = date.minusDays(1);
        return scheduleRepository.countByUserIdAndTaskIdInLastNDays(userId, taskId, startDate, date);
    }

    public Optional<LocalDate> getLastTaskCompletionDateForUser(Long userId, Long taskId, LocalDate upToDate) {
        return scheduleRepository.findLatestTaskCompletionDateByUserIdAndTaskId(userId, taskId, upToDate);
    }

    public List<Schedule> getSchedulesByUserIdAndDateBetween(Long userId, LocalDate from, LocalDate to) {
        return scheduleRepository.findByUserIdAndDateBetween(userId, from, to);
    }

    private List<Task> getTasksFromSchedules(List<Schedule> schedules) {
        return schedules.stream().map(Schedule::getTask).collect(Collectors.toList());
    }

    public void validateAddScheduleForWholePeriodTask(AddScheduleForWholePeriodTaskDTO addScheduleDTO, boolean ignoreConflicts, LocalDate from, LocalDate to)
        throws IllegalArgumentException, EntityNotFoundException, RoleNotMeetRequirementsException, EntityAlreadyExistsException, ScheduleIsInConflictException {
        validate(!DateValidator.dateStartsMondayEndsSunday(from, to), new IllegalArgumentException("Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week."));

        User user = userService.getUserById(addScheduleDTO.getUserId()).orElseThrow(() ->
                new EntityNotFoundException("User with given id does not exist"));

        Task task = taskService.getTaskById(addScheduleDTO.getTaskId()).orElseThrow(() ->
                new EntityNotFoundException("Task with given id does not exist"));

        List<Schedule> userWeekSchedules = getSchedulesByUserIdAndDateBetween(addScheduleDTO.getUserId(), from, to);
        List<Task> userWeekAssignedTasks = getTasksFromSchedules(userWeekSchedules);

        validate(!task.isParticipantForWholePeriod(), new IllegalArgumentException("Task does not allow assigning participants for whole period"));

        validate(!userHasAllowedRoleForTask(user, task), new RoleNotMeetRequirementsException("User does not have allowed role for task"));

        validate(checkIfUserHasValidApprovedObstacleForTaskAtDate(from, user, task), new EntityAlreadyExistsException("User has an approved obstacle for this task"));

        validate(checkIfTaskIsInTaskList(userWeekAssignedTasks, task), new EntityAlreadyExistsException("User is already assigned to the task"));

        validate(checkIfTaskIsInConflictWithGivenTasks(addScheduleDTO.getTaskId(), userWeekAssignedTasks) && !ignoreConflicts, new ScheduleIsInConflictException("Schedule is in conflict with other schedules"));

    }

    public void validateAddScheduleForDailyPeriodTask(AddScheduleForDailyPeriodTaskDTO addScheduleDTO, boolean ignoreConflicts, LocalDate dateStartWeek, LocalDate dateEndWeek, LocalDate taskDate)
        throws IllegalArgumentException, EntityNotFoundException, RoleNotMeetRequirementsException, EntityAlreadyExistsException, ScheduleIsInConflictException {
        validate(!DateValidator.dateStartsMondayEndsSunday(dateStartWeek, dateEndWeek), new IllegalArgumentException("Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week."));
        validate(!DateValidator.isDateInRange(taskDate, dateStartWeek, dateEndWeek), new IllegalArgumentException("Task date is not in the date range"));

        User user = userService.getUserById(addScheduleDTO.getUserId()).orElseThrow(() ->
                new EntityNotFoundException("User with given id does not exist"));

        Task task = taskService.getTaskById(addScheduleDTO.getTaskId()).orElseThrow(() ->
                new EntityNotFoundException("Task with given id does not exist"));

        List<Schedule> userWeekSchedules = getSchedulesByUserIdAndDateBetween(addScheduleDTO.getUserId(), dateStartWeek, dateEndWeek);

        validate(!task.getDaysOfWeek().contains(taskDate.getDayOfWeek()), new IllegalArgumentException("Task does not occur on given day of week"));

        validate(!userHasAllowedRoleForTask(user, task), new RoleNotMeetRequirementsException("User does not have allowed role for task"));

        validate(checkIfUserHasValidApprovedObstacleForTaskAtDate(taskDate, user, task), new EntityAlreadyExistsException("User has an approved obstacle for this task"));

        validate(checkIfUserIsAlreadyAssignedToDailyTask(user, task, taskDate), new EntityAlreadyExistsException("User is already assigned to the task on given day"));

        validate(checkIfTaskIsInConflictWithOtherTasksFromScheduleOnGivenDay(task, userWeekSchedules, taskDate) && !ignoreConflicts, new ScheduleIsInConflictException("Schedule is in conflict with other schedules"));
    }

    private void validate(boolean condition, RuntimeException exception) {
        if (condition) {
            throw exception;
        }
    }

    private boolean checkIfTaskIsInConflictWithOtherTasksFromScheduleOnGivenDay(Task task, List<Schedule> schedules, LocalDate date) {
        return schedules.stream().anyMatch(s -> conflictService.tasksAreInConflict(task.getId(), s.getTask().getId()) && s.getDate().equals(date));
    }

    private boolean checkIfUserIsAlreadyAssignedToDailyTask(User user, Task task, LocalDate date) {
        List<Schedule> schedules = scheduleRepository.findByUserIdAndDate(user.getId(), date);
        return schedules.stream().anyMatch(s -> s.getTask().getId().equals(task.getId()));
    }

    private boolean checkIfTaskIsInTaskList(List<Task> tasks, Task task) {
        return tasks.stream().anyMatch(t -> t.getId().equals(task.getId()));
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

    public boolean checkIfTaskIsInConflictWithGivenTasks(Long taskId, List<Task> tasks) {
        return tasks.stream().anyMatch(t -> conflictService.tasksAreInConflict(taskId, t.getId()));
    }

    public Set<DayOfWeek> getDaysWhenTaskIsInConflictWithOther(Long taskId, List<Schedule> schedules) {
        Set<DayOfWeek> daysWhenTaskIsInConflict = new HashSet<>();
        for(Schedule schedule : schedules) {
            if(conflictService.tasksAreInConflict(taskId, schedule.getTask().getId())) {
                daysWhenTaskIsInConflict.add(schedule.getDate().getDayOfWeek());
            }
        }
        return daysWhenTaskIsInConflict;
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

    private void checkIfUserHasValidApprovedObstacleForTask(LocalDate date, User user, Task task) {
        if(!obstacleService.findApprovedObstaclesByUserIdAndTaskIdForDate(user.getId(), task.getId(), date).isEmpty()) {
            throw new EntityAlreadyExistsException("User has an approved obstacle for this task");
        }
    }

    private boolean checkIfUserHasValidApprovedObstacleForTaskAtDate(LocalDate date, Long userId, Long taskId) {
        return !obstacleService.findApprovedObstaclesByUserIdAndTaskIdForDate(userId, taskId, date).isEmpty();
    }

    private boolean checkIfUserHasValidApprovedObstacleForTaskBetweenDate(LocalDate dateFrom, LocalDate dateTo, Long userId, Long taskId) {
        return !obstacleService.findApprovedObstaclesByUserIdAndTaskIdBetweenDate(userId, taskId, dateFrom, dateTo).isEmpty();
    }

    private Set<DayOfWeek> checkIfUserHasValidApprovedObstacleForTaskForWeek(LocalDate weekStartDate, Long userId, Long taskId) {
        Set<DayOfWeek> daysWhenUserHasValidApprovedObstacle = new HashSet<>();
        for(DayOfWeek dayOfWeek : DayOfWeek.values()) {
            LocalDate date = weekStartDate.plusDays(dayOfWeek.getValue() - 1);
            if(checkIfUserHasValidApprovedObstacleForTaskAtDate(date, userId, taskId)) {
                daysWhenUserHasValidApprovedObstacle.add(dayOfWeek);
            }
        }
        return daysWhenUserHasValidApprovedObstacle;
    }

    private boolean checkIfUserHasValidApprovedObstacleForTaskAtDate(LocalDate date, User user, Task task) {
        return !obstacleService.findApprovedObstaclesByUserIdAndTaskIdForDate(user.getId(), task.getId(), date).isEmpty();
    }

    private void checkScheduleConflict(ScheduleDTO scheduleDTO, boolean ignoreConflicts) {
        if(!ignoreConflicts && isScheduleInConflictWithOtherSchedules(scheduleDTO.toSchedule())) {
            throw new ScheduleIsInConflictException("Schedule is in conflict with other schedules");
        }
    }

    public void validateSchedule(ScheduleDTO scheduleDTO, boolean ignoreConflicts) {
        User user = userService.getUserById(scheduleDTO.getUserId()).orElseThrow(() ->
                new EntityNotFoundException("User with given id does not exist"));

        Task task = taskService.getTaskById(scheduleDTO.getTaskId()).orElseThrow(() ->
                new EntityNotFoundException("Task with given id does not exist"));

        checkIfTaskOccursOnGivenDayOfWeek(scheduleDTO, task);
        checkIfUserHasAllowedRoleForTask(user, task);
        checkIfUserHasValidApprovedObstacleForTask(scheduleDTO.getDate(), user, task);
        checkScheduleConflict(scheduleDTO, ignoreConflicts);
    }

    public void save(Schedule existingSchedule) {
        scheduleRepository.save(existingSchedule);
    }

    public List<Schedule> getAllSchedulesByUserIdForSpecifiedWeek(Long userId, LocalDate from, LocalDate to) {
        if(!DateValidator.dateStartsMondayEndsSunday(from, to)) {
            throw new IllegalArgumentException("Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week.");
        }

        if(!userService.existsById(userId)) {
            throw new EntityNotFoundException("User with given id does not exist");
        }

        return getAllSchedulesForUserInSpecifiedWeek(userId, from, to);
    }

    public List<ScheduleShortInfoForUser> getScheduleShortInfoForEachUserForSpecifiedWeek(LocalDate from, LocalDate to) {
        if(!DateValidator.dateStartsMondayEndsSunday(from, to)) {
            throw new IllegalArgumentException("Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week.");
        }

        List<User> users = userService.getAllUsers();
        return users.stream()
                .map(user -> createScheduleShortInfoForUser(user.getId(), from, to))
                .collect(Collectors.toList());
    }

    private ScheduleShortInfoForUser createScheduleShortInfoForUser(Long userId, LocalDate from, LocalDate to) {
        User user = userService.getUserById(userId).orElseThrow(() ->
                new EntityNotFoundException("User with given id does not exist"));

        List<Schedule> schedules = getAllSchedulesByUserIdForSpecifiedWeek(userId, from, to);

        List<String> tasksInfoStrings = createInfoStringsOfTasksOccurrenceFromGivenSchedule(schedules);

        return new ScheduleShortInfoForUser(userId, user.getName(), user.getSurname(), tasksInfoStrings);
    }

    //TODO: Optimise this method
    public void deleteScheduleForWholePeriodTask(AddScheduleForWholePeriodTaskDTO addScheduleForWholePeriodTaskDTO) {
        LocalDate from = addScheduleForWholePeriodTaskDTO.getFromDate();
        LocalDate to = addScheduleForWholePeriodTaskDTO.getToDate();

        validate(!DateValidator.dateStartsMondayEndsSunday(from, to), new IllegalArgumentException("Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week."));

        if(!taskService.existsById(addScheduleForWholePeriodTaskDTO.getTaskId())) {
            throw new EntityNotFoundException("Task with given id does not exist");
        }

        if(!userService.existsById(addScheduleForWholePeriodTaskDTO.getUserId())) {
            throw new EntityNotFoundException("User with given id does not exist");
        }

        List<Schedule> schedules = getSchedulesByUserIdAndDateBetween(addScheduleForWholePeriodTaskDTO.getUserId(), from, to);

        validate(schedules.isEmpty(), new EntityNotFoundException("No schedules found for given user and date range"));

        schedules.forEach(schedule -> {
            if(schedule.getTask().getId().equals(addScheduleForWholePeriodTaskDTO.getTaskId())) {
                scheduleRepository.deleteById(schedule.getId());
            }
        });
    }

    //TODO: Optimise this method
    public void deleteScheduleForDailyPeriodTask(AddScheduleForDailyPeriodTaskDTO addScheduleForDailyPeriodTaskDTO) {
        LocalDate weekStartDate = addScheduleForDailyPeriodTaskDTO.getWeekStartDate();
        LocalDate weekEndDate = addScheduleForDailyPeriodTaskDTO.getWeekEndDate();
        LocalDate taskDate = addScheduleForDailyPeriodTaskDTO.getTaskDate();

        validate(!DateValidator.dateStartsMondayEndsSunday(weekStartDate, weekEndDate), new IllegalArgumentException("Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week."));
        validate(!DateValidator.isDateInRange(taskDate, weekStartDate, weekEndDate), new IllegalArgumentException("Task date is not in the date range"));

        if(!taskService.existsById(addScheduleForDailyPeriodTaskDTO.getTaskId())) {
            throw new EntityNotFoundException("Task with given id does not exist");
        }

        if(!userService.existsById(addScheduleForDailyPeriodTaskDTO.getUserId())) {
            throw new EntityNotFoundException("User with given id does not exist");
        }

        List<Schedule> schedules = getSchedulesByUserIdAndDateBetween(addScheduleForDailyPeriodTaskDTO.getUserId(), weekStartDate, weekEndDate);

        validate(schedules.isEmpty(), new EntityNotFoundException("No schedules found for given user and date range"));

        schedules.forEach(schedule -> {
            if(schedule.getDate().equals(taskDate) && schedule.getTask().getId().equals(addScheduleForDailyPeriodTaskDTO.getTaskId())) {
                scheduleRepository.deleteById(schedule.getId());
            }
        });
    }

    public List<Schedule> getAllSchedulesForTaskForSpecifiedWeek(Long taskId, LocalDate from, LocalDate to) {
        if(!DateValidator.dateStartsMondayEndsSunday(from, to)) {
            throw new IllegalArgumentException("Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week.");
        }

        if(!taskService.existsById(taskId)) {
            throw new EntityNotFoundException("Task with given id does not exist");
        }

        return scheduleRepository.findByTaskIdAndDateBetween(taskId, from, to);
    }

    public List<ScheduleShortInfoForTask> getScheduleShortInfoForEachTaskForSpecifiedWeek(LocalDate from, LocalDate to) {
        if(!DateValidator.dateStartsMondayEndsSunday(from, to)) {
            throw new IllegalArgumentException("Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week.");
        }

        List<Task> tasks = taskService.getAllTasks();
        return tasks.stream()
                .map(task -> createScheduleShortInfoForTask(task.getId(), from, to))
                .collect(Collectors.toList());
    }

    private ScheduleShortInfoForTask createScheduleShortInfoForTask(Long taskId, LocalDate from, LocalDate to) {
        Task task = taskService.getTaskById(taskId).orElseThrow(() ->
                new EntityNotFoundException("Task with given id does not exist"));

        List<Schedule> schedules = getAllSchedulesForTaskForSpecifiedWeek(taskId, from, to);

        List<String> usersInfoStrings = createInfoStringsOfUsersOccurrenceFromGivenSchedule(schedules, task.getDaysOfWeek().size());

        return new ScheduleShortInfoForTask(taskId, task.getName(), usersInfoStrings);
    }

    private List<String> createInfoStringsOfUsersOccurrenceFromGivenSchedule(List<Schedule> schedules, int taskDaysOfWeekCount) {
        // If user appears in the list n times, where n is the user occurrence in the week,
        // then it will be converted to "user.name user.surname" only string.
        // If user appears less than n times, then it will be converted to "user.name user.surname (P, W, Ś)" string,
        // where P, W, Ś are the days of the week when the user occurs.

        // Possible days of the week
        // Dictionary of DayOfWeek enum and its abbreviation in polish
        Map<DayOfWeek, String> dayOfWeekAbbreviations = Map.of(
                DayOfWeek.MONDAY, "Pn",
                DayOfWeek.TUESDAY, "Wt",
                DayOfWeek.WEDNESDAY, "Śr",
                DayOfWeek.THURSDAY, "Cz",
                DayOfWeek.FRIDAY, "Pt",
                DayOfWeek.SATURDAY, "So",
                DayOfWeek.SUNDAY, "Nd"
        );

        // Create a map of users and their DaysOfWeek assigns from schedule.date
        // Example: {user: [MONDAY, WEDNESDAY, FRIDAY], user2: [TUESDAY, THURSDAY]}
        Map<User, Set<DayOfWeek>> userDaysWhenItIsAssignedInSchedule = schedules.stream()
                .collect(Collectors.groupingBy(Schedule::getUser, Collectors.mapping(
                        schedule -> schedule.getDate().getDayOfWeek(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                list -> {
                                    Collections.sort(list);
                                    return new LinkedHashSet<>(list);
                                })
                )));

        return userDaysWhenItIsAssignedInSchedule.entrySet().stream()
                .sorted(Map.Entry.comparingByKey(Comparator.comparing(User::getName).thenComparing(User::getSurname)))
                .map(entry -> {
                    User user = entry.getKey();
                    Set<DayOfWeek> occurrences = entry.getValue();
                    if (occurrences.size() < taskDaysOfWeekCount) {
                        String daysOfWeekString = occurrences.stream()
                                .map(dayOfWeekAbbreviations::get)
                                .collect(Collectors.joining(", "));
                        return user.getName() + " " + user.getSurname() + " (" + daysOfWeekString + ")";
                    } else {
                        return user.getName() + " " + user.getSurname();
                    }
                })
                .collect(Collectors.toList());
    }

    public List<ScheduleShortInfoForTask> getScheduleShortInfoForTaskByRoleForSpecifiedWeek(String supervisorRole, LocalDate from, LocalDate to) {
        if(!DateValidator.dateStartsMondayEndsSunday(from, to)) {
            throw new IllegalArgumentException("Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week.");
        }

        Role role = roleService.findByNameAndType(supervisorRole, RoleType.SUPERVISOR)
                .orElseThrow(() -> new EntityNotFoundException("Supervisor role not found or not a supervisor"));

        List<Task> tasks = taskService.findTasksBySupervisorRoleName(role.getName());
        return tasks.stream()
                .map(task -> createScheduleShortInfoForTask(task.getId(), from, to))
                .collect(Collectors.toList());
    }

    public List<UserTaskStatisticsDTO> getStatisticsForUserTasks(Long userId) {
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User with given id does not exist"));

        List<Schedule> schedules = getAllSchedulesByUserId(userId);

        Map<Task, LocalDate> lastAssignmentDateForTask = schedules.stream()
                .collect(Collectors.toMap(Schedule::getTask, Schedule::getDate, (date1, date2) -> date1.isAfter(date2) ? date1 : date2));

        Map<Task, Long> taskOccurrencesInLast30Days = getTaskOccurrencesInLastNDays(schedules, 30);
        Map<Task, Long> taskOccurrencesInLast90Days = getTaskOccurrencesInLastNDays(schedules, 90);
        Map<Task, Long> taskOccurrencesInLast365Days = getTaskOccurrencesInLastNDays(schedules, 365);
        Map<Task, Long> taskOccurrencesInAllTime = schedules.stream()
                .collect(Collectors.groupingBy(Schedule::getTask, Collectors.counting()));

        // Create list of UserTaskStatisticsDTO objects
        List<UserTaskStatisticsDTO> userTaskStatistics = new ArrayList<>();
        for(Task task : taskOccurrencesInAllTime.keySet()) {
            LocalDate lastAssignmentDate = lastAssignmentDateForTask.get(task);
            long occurrencesInLast30Days = taskOccurrencesInLast30Days.getOrDefault(task, 0L);
            long occurrencesInLast90Days = taskOccurrencesInLast90Days.getOrDefault(task, 0L);
            long occurrencesInLast365Days = taskOccurrencesInLast365Days.getOrDefault(task, 0L);
            long occurrencesInAllTime = taskOccurrencesInAllTime.get(task);
            userTaskStatistics.add(new UserTaskStatisticsDTO(task.getName(), lastAssignmentDate, occurrencesInLast30Days, occurrencesInLast90Days, occurrencesInLast365Days, occurrencesInAllTime));
        }

        return userTaskStatistics;
    }

    private Map<Task, Long> getTaskOccurrencesInLastNDays(List<Schedule> schedules, int n) {
        LocalDate startDate = LocalDate.now().minusDays(n);
        LocalDate endDate = LocalDate.now().plusDays(1); // We add 1 day to include the current day
        return schedules.stream()
                .filter(schedule -> schedule.getDate().isAfter(startDate) && schedule.getDate().isBefore(endDate))
                .collect(Collectors.groupingBy(Schedule::getTask, Collectors.counting()));
    }
}
