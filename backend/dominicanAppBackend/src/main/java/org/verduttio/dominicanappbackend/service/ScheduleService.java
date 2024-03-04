package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.dto.schedule.AddScheduleForDailyPeriodTaskDTO;
import org.verduttio.dominicanappbackend.dto.schedule.AddScheduleForWholePeriodTaskDTO;
import org.verduttio.dominicanappbackend.dto.schedule.ScheduleDTO;
import org.verduttio.dominicanappbackend.dto.schedule.ScheduleShortInfo;
import org.verduttio.dominicanappbackend.dto.user.UserTaskDependencyDTO;
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

    public List<UserTaskDependencyDTO> getAllUserDependenciesForTask(Long taskId, LocalDate from, LocalDate to) {
        List<User> users = userService.getAllUsers();
        return users.stream()
                .map(user -> getUserDependenciesForTask(taskId, user.getId(), from, to))
                .collect(Collectors.toList());
    }

    public UserTaskDependencyDTO getUserDependenciesForTask(Long taskId, Long userId, LocalDate from, LocalDate to) {
        validate(!taskService.existsById(taskId), new EntityNotFoundException("Task with given id does not exist"));

        User user = userService.getUserById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        List<Schedule> userSchedulesForWeek = getSchedulesByUserIdAndDateBetween(userId, from, to);
        List<Task> userAssignedTasksForWeek = getTasksFromSchedules(userSchedulesForWeek);

        long numberOfTaskCompletionByUserInLast365days = getTaskCompletionCountForUserInLastNDaysFromDate(userId, taskId, from,365);

        LocalDate userLastCompletionDateForTask = getLastTaskCompletionDateForUser(userId, taskId, from).orElse(null);

        List<String> userAssignedTasksNamesForWeek = createInfoStringsOfTasksOccurrenceFromGivenSchedule(userSchedulesForWeek);

        boolean isConflict = checkIfTaskIsInConflictWithGivenTasks(taskId, userAssignedTasksForWeek);

        boolean hasObstacleForTaskOnDate = checkIfUserHasValidApprovedObstacleForTaskAtDate(from, userId, taskId);

        boolean alreadyAssignedToTheTask = userAssignedTasksForWeek.stream().anyMatch(t -> t.getId().equals(taskId));

        return new UserTaskDependencyDTO(userId, user.getName()+" "+user.getSurname(), userLastCompletionDateForTask, (int) numberOfTaskCompletionByUserInLast365days,
                userAssignedTasksNamesForWeek, isConflict, hasObstacleForTaskOnDate, alreadyAssignedToTheTask);
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

        validate(task.isParticipantForWholePeriod(), new IllegalArgumentException("Task does not allow assigning participants for daily period"));

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

    public List<ScheduleShortInfo> getScheduleShortInfoForEachUserForSpecifiedWeek(LocalDate from, LocalDate to) {
        if(!DateValidator.dateStartsMondayEndsSunday(from, to)) {
            throw new IllegalArgumentException("Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week.");
        }

        List<User> users = userService.getAllUsers();
        return users.stream()
                .map(user -> createScheduleShortInfoForUser(user.getId(), from, to))
                .collect(Collectors.toList());
    }

    private ScheduleShortInfo createScheduleShortInfoForUser(Long userId, LocalDate from, LocalDate to) {
        User user = userService.getUserById(userId).orElseThrow(() ->
                new EntityNotFoundException("User with given id does not exist"));

        List<Schedule> schedules = getAllSchedulesByUserIdForSpecifiedWeek(userId, from, to);

        List<String> tasksInfoStrings = createInfoStringsOfTasksOccurrenceFromGivenSchedule(schedules);

        return new ScheduleShortInfo(userId, user.getName(), user.getSurname(), tasksInfoStrings);
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
}
