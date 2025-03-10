package org.verduttio.dominicanappbackend.service.schedule;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.domain.*;
import org.verduttio.dominicanappbackend.dto.schedule.*;
import org.verduttio.dominicanappbackend.dto.user.*;
import org.verduttio.dominicanappbackend.dto.user.scheduleInfo.UserTaskScheduleInfo;
import org.verduttio.dominicanappbackend.dto.user.scheduleInfo.UserTasksScheduleInfoWeekly;
import org.verduttio.dominicanappbackend.dto.user.scheduleInfo.UserTasksScheduleInfoWeeklyByAllDays;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.repository.SpecialDateRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.service.*;
import org.verduttio.dominicanappbackend.service.exception.EntityAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.service.exception.RoleNotMeetRequirementsException;
import org.verduttio.dominicanappbackend.service.exception.ScheduleIsInConflictException;
import org.verduttio.dominicanappbackend.validation.DateValidator;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.BinaryOperator;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserService userService;
    private final TaskService taskService;
    private final RoleService roleService;
    private final ObstacleService obstacleService;
    private final ConflictService conflictService;
    private final SpecialDateRepository specialDateRepository;
    private final TaskRepository taskRepository;
    private final ScheduleGenerator scheduleGenerator;
    private final ScheduleCleaner scheduleCleaner;

    @Autowired
    public ScheduleService(ScheduleRepository scheduleRepository, UserService userService, TaskService taskService, RoleService roleService, ObstacleService obstacleService, ConflictService conflictService, SpecialDateRepository specialDateRepository,
                           TaskRepository taskRepository, ScheduleGenerator scheduleGenerator, ScheduleCleaner scheduleCleaner) {
        this.scheduleRepository = scheduleRepository;
        this.userService = userService;
        this.taskService = taskService;
        this.roleService = roleService;
        this.obstacleService = obstacleService;
        this.conflictService = conflictService;
        this.specialDateRepository = specialDateRepository;
        this.taskRepository = taskRepository;
        this.scheduleGenerator = scheduleGenerator;
        this.scheduleCleaner = scheduleCleaner;
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public Optional<Schedule> getScheduleById(Long scheduleId) {
        return scheduleRepository.findById(scheduleId);
    }

    @SuppressWarnings("OptionalGetWithoutIsPresent")
    public void createScheduleForWholePeriodTask(AddScheduleForWholePeriodTaskDTO addScheduleDTO, boolean ignoreConflicts) {
        LocalDate from = addScheduleDTO.getFromDate();
        LocalDate to = addScheduleDTO.getToDate();

        validateAddScheduleForWholePeriodTask(addScheduleDTO, ignoreConflicts, from, to);

        Task task = taskService.getTaskById(addScheduleDTO.getTaskId()).get();
        User user = userService.getUserById(addScheduleDTO.getUserId()).get();

        LocalDate date = from;
        while(date.isBefore(to) || date.isEqual(to)) {
            if (specialDateRepository.existsByTypeAndDate(SpecialDateType.FEAST, date)) {
                if (task.getDaysOfWeek().contains(DayOfWeek.SUNDAY)) {
                    //If the task for example does not occur on date.getDayOfWeek() but occurs on Sunday
                    // then we can assign the task on the feast day
                    Schedule schedule = new Schedule();
                    schedule.setTask(task);
                    schedule.setUser(user);
                    schedule.setDate(date);
                    scheduleRepository.save(schedule);
                } else if (task.getDaysOfWeek().contains(date.getDayOfWeek())) {
                    // If the task occurs on date.getDayOfWeek() then we can assign the task on the feast day,
                    // even if the task does not occur on Sunday
                    Schedule schedule = new Schedule();
                    schedule.setTask(task);
                    schedule.setUser(user);
                    schedule.setDate(date);
                    scheduleRepository.save(schedule);
                }
            } else {
                if (task.getDaysOfWeek().contains(date.getDayOfWeek())) {
                    Schedule schedule = new Schedule();
                    schedule.setTask(task);
                    schedule.setUser(user);
                    schedule.setDate(date);
                    scheduleRepository.save(schedule);
                }
            }

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

    public boolean existsById(Long scheduleId) {
        return scheduleRepository.existsById(scheduleId);
    }

    public List<Schedule> getAllSchedulesByUserId(Long userId) {
        if (!userService.existsById(userId)) {
            throw new EntityNotFoundException("User with given id does not exist");
        }
        return scheduleRepository.findByUserId(userId);
    }

    public List<Task> getAvailableTasks(LocalDate from, LocalDate to) {
        List<Task> allTasks = taskService.getAllTasks();
        List<Schedule> schedulesInPeriod = scheduleRepository.findByDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(from, to);

        return getNotFullyAssignedTasks(allTasks, schedulesInPeriod);
    }

    public List<Schedule> getAllSchedulesForUserInSpecifiedWeek(Long userId, LocalDate from, LocalDate to) {
        return scheduleRepository.findByUserIdAndDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(userId, from, to);
    }

    public List<Task> getAvailableTasksBySupervisorRole(String supervisor, LocalDate from, LocalDate to) {
        Role supervisorRole = roleService.findByNameAndType(supervisor, RoleType.SUPERVISOR)
                .orElseThrow(() -> new EntityNotFoundException("Supervisor role not found or not a supervisor"));

        List<Task> allTasks = taskService.findTasksBySupervisorRoleName(supervisorRole.getName());
        List<Schedule> schedulesInPeriod = scheduleRepository.findByDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(from, to);

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

    public UserTaskDependencyWeeklyDTO getUserDependenciesForTaskWeekly(Long taskId, Long userId, LocalDate from, LocalDate to, List<Schedule> schedulesForThatWeek, List<Conflict> allConflicts) {
        validate(!taskService.existsById(taskId), new EntityNotFoundException("Task with given id does not exist"));

        User user = userService.getUserById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        List<Schedule> userSchedulesForWeek = schedulesForThatWeek.stream().filter(s -> s.getUser().getId().equals(userId)).toList();
        List<Task> userAssignedTasksForWeek = getTasksFromSchedules(userSchedulesForWeek);

        long numberOfTaskCompletionByUserFromStatsDate = getNumberOfTaskCompletionByUserFromStatsDate(userId, taskId, from.minusDays(1));

        LocalDate userLastCompletionDateForTask = getLastTaskCompletionDateForUserFromStatsDate(userId, taskId, from).orElse(null);

        List<LocalDate> feastDates = specialDateRepository.findByTypeAndDateBetween(SpecialDateType.FEAST, from, to).stream().map(SpecialDate::getDate).toList();
        boolean weekWithFeast = !feastDates.isEmpty();
        List<String> userAssignedTasksNamesForWeek = createInfoStringsOfTasksOccurrenceFromGivenSchedule(userSchedulesForWeek, weekWithFeast);
        boolean isConflict = checkIfTaskIsInConflictWithOtherTasksFromSchedule(taskId, userSchedulesForWeek, feastDates, allConflicts);

        boolean hasObstacleForTaskOnWeek = checkIfUserHasValidApprovedObstacleForTaskBetweenDate(from, to, userId, taskId);

        boolean alreadyAssignedToTheTask = userAssignedTasksForWeek.stream().anyMatch(t -> t.getId().equals(taskId));

        return new UserTaskDependencyWeeklyDTO(userId, user.getName()+" "+user.getSurname(), userLastCompletionDateForTask, (int) numberOfTaskCompletionByUserFromStatsDate,
                userAssignedTasksNamesForWeek, isConflict, hasObstacleForTaskOnWeek, alreadyAssignedToTheTask);
    }

    private long getNumberOfTaskCompletionByUserFromStatsDate(long userId, long taskId, LocalDate to) {
        LocalDate statsDate = specialDateRepository.findByType(SpecialDateType.STATS).getFirst().getDate();
        return scheduleRepository.countByUserIdAndTaskIdInLastNDays(userId, taskId, statsDate, to);
    }

    public List<String> createInfoStringsOfTasksOccurrenceFromGivenSchedule(List<Schedule> schedules, boolean weekWithFeast) {
        schedules = schedules.stream().filter(s -> s.getTask().getSupervisorRole().isAreTasksVisibleInPrints()).toList();

        // If task appears in the list n times, where n is the task occurrence in the week,
        // then it will be converted to "task.name" only string.
        // If task appears less than n times, then it will be converted to "task.name (P, W, Ś)" string,
        // where P, W, Ś are the days of the week when the task occurs.

        // Possible days of the week
        // Dictionary of DayOfWeek enum and its abbreviation in polish
        Map<DayOfWeek, String> dayOfWeekAbbreviations = Map.of(
                DayOfWeek.SUNDAY, "Nd",
                DayOfWeek.MONDAY, "Pn",
                DayOfWeek.TUESDAY, "Wt",
                DayOfWeek.WEDNESDAY, "Śr",
                DayOfWeek.THURSDAY, "Cz",
                DayOfWeek.FRIDAY, "Pt",
                DayOfWeek.SATURDAY, "So"
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
                .sorted(Map.Entry.comparingByKey(
                        Comparator.comparing((Task t) -> t.getSupervisorRole().getSortOrder())
                                .thenComparing(Task::getSortOrder)
                ))
                .map(entry -> {
                    Task task = entry.getKey();
                    Set<DayOfWeek> occurrences = entry.getValue();

                    // SUNDAY, MONDAY, ..., SATURDAY order
                    Comparator<DayOfWeek> customOrderComparator = Comparator
                            .comparingInt(day -> (day.getValue() % DayOfWeek.values().length));

                    // If there is any feast in the week,
                    // then the string should be: task.name (days of week when assign)
                    // even if the task occurs on all days of the week.
                    if (weekWithFeast) {
                        String daysOfWeekString = occurrences.stream().sorted(customOrderComparator)
                                .map(dayOfWeekAbbreviations::get)
                                .collect(Collectors.joining(", "));
                        return task.getNameAbbrev() + " (" + daysOfWeekString + ")";
                    }


                    if (occurrences.size() < task.getDaysOfWeek().size()) {
                        String daysOfWeekString = occurrences.stream().sorted(customOrderComparator)
                                .map(dayOfWeekAbbreviations::get)
                                .collect(Collectors.joining(", "));
                        return task.getNameAbbrev() + " (" + daysOfWeekString + ")";
                    } else {
                        return task.getNameAbbrev();
                    }
                })
                .collect(Collectors.toList());
    }

    public Optional<LocalDate> getLastTaskCompletionDateForUserFromStatsDate(Long userId, Long taskId, LocalDate upToDate) {
        LocalDate statsDate = specialDateRepository.findByType(SpecialDateType.STATS).getFirst().getDate();
        Optional<LocalDate> date = scheduleRepository.findLatestTaskCompletionDateByUserIdAndTaskId(userId, taskId, upToDate);
        if(date.isPresent()) {
            if(date.get().isAfter(statsDate) || date.get().equals(statsDate)) {
                return date;
            } else {
                return Optional.empty();
            }
        } else {
            return Optional.empty();
        }
    }

    public List<Schedule> getSchedulesByUserIdAndDateBetween(Long userId, LocalDate from, LocalDate to) {
        return scheduleRepository.findByUserIdAndDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(userId, from, to);
    }

    private List<Task> getTasksFromSchedules(List<Schedule> schedules) {
        return schedules.stream().map(Schedule::getTask).collect(Collectors.toList());
    }

    public void validateAddScheduleForWholePeriodTask(AddScheduleForWholePeriodTaskDTO addScheduleDTO, boolean ignoreConflicts, LocalDate from, LocalDate to)
        throws IllegalArgumentException, EntityNotFoundException, RoleNotMeetRequirementsException, EntityAlreadyExistsException, ScheduleIsInConflictException {
        validate(!DateValidator.dateStartsSundayEndsSaturday(from, to), new IllegalArgumentException("Invalid date range. The period must start on Sunday and end on Saturday, covering exactly one week."));

        User user = userService.getUserById(addScheduleDTO.getUserId()).orElseThrow(() ->
                new EntityNotFoundException("User with given id does not exist"));

        Task task = taskService.getTaskById(addScheduleDTO.getTaskId()).orElseThrow(() ->
                new EntityNotFoundException("Task with given id does not exist"));

        List<Schedule> userWeekSchedules = getSchedulesByUserIdAndDateBetween(addScheduleDTO.getUserId(), from, to);
        List<Task> userWeekAssignedTasks = getTasksFromSchedules(userWeekSchedules);

        validate(!checkIfTaskSupervisorRoleAllowsForWholeWeekAssignment(task), new RoleNotMeetRequirementsException("Task's supervisor role does not allow for whole week assignment"));

        validate(!userHasAllowedRoleForTask(user, task), new RoleNotMeetRequirementsException("User does not have allowed role for task"));

        validate(checkIfUserHasValidApprovedObstacleForTaskAtDate(from, user, task), new EntityAlreadyExistsException("User has an approved obstacle for this task"));

        validate(checkIfTaskIsInTaskList(userWeekAssignedTasks, task), new EntityAlreadyExistsException("User is already assigned to the task"));

        validate(checkIfTaskIsInConflictWithGivenTasksWeekly(addScheduleDTO.getTaskId(), userWeekAssignedTasks, from, to) && !ignoreConflicts, new ScheduleIsInConflictException("Schedule is in conflict with other schedules"));

    }

    private boolean checkIfTaskSupervisorRoleAllowsForWholeWeekAssignment(Task task) {
        return task.getSupervisorRole().isWeeklyScheduleCreatorDefault();
    }

    public void validateAddScheduleForDailyPeriodTask(AddScheduleForDailyPeriodTaskDTO addScheduleDTO, boolean ignoreConflicts, LocalDate dateStartWeek, LocalDate dateEndWeek, LocalDate taskDate)
        throws IllegalArgumentException, EntityNotFoundException, RoleNotMeetRequirementsException, EntityAlreadyExistsException, ScheduleIsInConflictException {
        validate(!DateValidator.dateStartsSundayEndsSaturday(dateStartWeek, dateEndWeek), new IllegalArgumentException("Invalid date range. The period must start on Sunday and end on Saturday, covering exactly one week."));
        validate(!DateValidator.isDateInRange(taskDate, dateStartWeek, dateEndWeek), new IllegalArgumentException("Task date is not in the date range"));

        User user = userService.getUserById(addScheduleDTO.getUserId()).orElseThrow(() ->
                new EntityNotFoundException("User with given id does not exist"));

        Task task = taskService.getTaskById(addScheduleDTO.getTaskId()).orElseThrow(() ->
                new EntityNotFoundException("Task with given id does not exist"));

        List<Schedule> userWeekSchedules = getSchedulesByUserIdAndDateBetween(addScheduleDTO.getUserId(), dateStartWeek, dateEndWeek);

        if(specialDateRepository.existsByTypeAndDate(SpecialDateType.FEAST, taskDate)) {
            if (!(task.getDaysOfWeek().contains(DayOfWeek.SUNDAY) || task.getDaysOfWeek().contains(taskDate.getDayOfWeek()))) {
                throw new IllegalArgumentException("Task does not occur on given day of week or it does not occur on feast day");
            }
        } else {
            validate(!task.getDaysOfWeek().contains(taskDate.getDayOfWeek()), new IllegalArgumentException("Task does not occur on given day of week"));
        }

        validate(!userHasAllowedRoleForTask(user, task), new RoleNotMeetRequirementsException("User does not have allowed role for task"));

        validate(checkIfUserHasValidApprovedObstacleForTaskAtDate(taskDate, user, task), new EntityAlreadyExistsException("User has an approved obstacle for this task"));

        validate(checkIfUserIsAlreadyAssignedToDailyTask(task, userWeekSchedules, taskDate), new EntityAlreadyExistsException("User is already assigned to the task on given day"));

        validate(checkIfTaskIsInConflictWithOtherTasksFromScheduleOnGivenDay(task, userWeekSchedules, taskDate) && !ignoreConflicts, new ScheduleIsInConflictException("Schedule is in conflict with other schedules"));
    }

    private void validate(boolean condition, RuntimeException exception) {
        if (condition) {
            throw exception;
        }
    }

    private boolean checkIfTaskIsInConflictWithOtherTasksFromScheduleOnGivenDay(Task task, List<Schedule> schedules, LocalDate date) {
        boolean isFeastDate = specialDateRepository.existsByTypeAndDate(SpecialDateType.FEAST, date);
        return schedules.stream().anyMatch(s -> conflictService.tasksAreInConflict(task.getId(), s.getTask().getId(), date.getDayOfWeek(), isFeastDate) && s.getDate().equals(date));
    }

    private boolean checkIfUserIsAlreadyAssignedToDailyTask(Task task, List<Schedule> userWeekSchedules, LocalDate date) {
        List<Schedule> schedules = userWeekSchedules.stream().filter(s -> s.getDate().equals(date)).toList();
        return schedules.stream().anyMatch(s -> s.getTask().getId().equals(task.getId()));
    }

    private boolean checkIfTaskIsInTaskList(List<Task> tasks, Task task) {
        return tasks.stream().anyMatch(t -> t.getId().equals(task.getId()));
    }

    public boolean isScheduleInConflictWithOtherSchedules(Schedule schedule) {
        List<Schedule> schedules = scheduleRepository.findByUserIdAndDateOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(schedule.getUser().getId(), schedule.getDate());
        for(Schedule otherSchedule : schedules) {
            boolean isFeastDate = specialDateRepository.existsByTypeAndDate(SpecialDateType.FEAST, otherSchedule.getDate());
            if(conflictService.tasksAreInConflict(schedule.getTask().getId(), otherSchedule.getTask().getId(), otherSchedule.getDate().getDayOfWeek(), isFeastDate)) {
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

    public boolean checkIfTaskIsInConflictWithGivenTasksWeekly(Long taskId, List<Task> tasks, LocalDate from, LocalDate to) {
        for(Task task : tasks) {
            LocalDate date = from;
            while (!date.isAfter(to)) {
                boolean isFeastDate = specialDateRepository.existsByTypeAndDate(SpecialDateType.FEAST, date);
                if(conflictService.tasksAreInConflict(taskId, task.getId(), date.getDayOfWeek(), isFeastDate)) {
                    return true;
                }
                date = date.plusDays(1);
            }
        }
        return false;
    }

    private boolean checkIfTaskIsInConflictWithOtherTasksFromSchedule(Long taskId, List<Schedule> schedules, List<LocalDate> feastDates, List<Conflict> allConflicts) {
        return !getDaysWhenTaskIsInConflictWithOther(taskId, schedules, feastDates, allConflicts).isEmpty();
    }

    public Set<DayOfWeek> getDaysWhenTaskIsInConflictWithOther(Long taskId, List<Schedule> schedules, List<LocalDate> feastDates, List<Conflict> allConflicts) {
        Set<DayOfWeek> daysWhenTaskIsInConflict = new HashSet<>();
        List<Conflict> taskConflicts = allConflicts.stream().filter(conflict -> conflict.getTask1().getId().equals(taskId) || conflict.getTask2().getId().equals(taskId)).toList();
        for(Schedule schedule : schedules) {
            boolean isFeastDate = feastDates.contains(schedule.getDate());
            if(conflictService.tasksAreInConflict(taskId, schedule.getTask().getId(), taskConflicts, schedule.getDate().getDayOfWeek(), isFeastDate)) {
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

    private Set<LocalDate> getUserApprovedObstacleForTask(LocalDate from, LocalDate to, Long userId, Long taskId) {
        Set<LocalDate> datesWhenUserHasApprovedObstacleForTask = new HashSet<>();

        for(LocalDate date = from; date.isBefore(to) || date.isEqual(to); date = date.plusDays(1)) {
            if(checkIfUserHasValidApprovedObstacleForTaskAtDate(date, userId, taskId)) {
                datesWhenUserHasApprovedObstacleForTask.add(date);
            }
        }

        return datesWhenUserHasApprovedObstacleForTask;
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
        if(!DateValidator.isStartDateMax6daysBeforeEndDate(from, to)) {
            throw new IllegalArgumentException(DateValidator.isStartDateMax6daysBeforeEndDateError);
        }

        if(!userService.existsById(userId)) {
            throw new EntityNotFoundException("User with given id does not exist");
        }

        return getAllSchedulesForUserInSpecifiedWeek(userId, from, to);
    }

    public List<Schedule> getAllSchedulesByUserId(Long userId, LocalDate from, LocalDate to) {
        if(!userService.existsById(userId)) {
            throw new EntityNotFoundException("User with given id does not exist");
        }

        return getAllSchedulesForUserInSpecifiedWeek(userId, from, to);
    }

    public List<ScheduleShortInfoForUser> getScheduleShortInfoForAllowedUsersForSpecifiedWeek(LocalDate from, LocalDate to) {
        if(!DateValidator.isStartDateMax6daysBeforeEndDate(from, to)) {
            throw new IllegalArgumentException(DateValidator.isStartDateMax6daysBeforeEndDateError);
        }

        List<User> users = userService.getAllUsers();
        boolean weekWithFeast = !specialDateRepository.findByTypeAndDateBetween(SpecialDateType.FEAST, from, to).isEmpty();
        return users.stream()
                .filter(user -> userService.checkIfUserHasAnyTaskPerformerRole(user.getId()))
                .map(user -> createScheduleShortInfoForUser(user.getId(), from, to, weekWithFeast))
                .collect(Collectors.toList());
    }

    public List<GroupedTasksByRolesInScheduleInfoForUser> getGroupedTasksByRolesInScheduleInfoForAllowedUsersForSpecifiedWeek(LocalDate from, LocalDate to) {
        if(!DateValidator.isStartDateMax6daysBeforeEndDate(from, to)) {
            throw new IllegalArgumentException(DateValidator.isStartDateMax6daysBeforeEndDateError);
        }

        List<User> users = userService.getAllUsers();
        boolean weekWithFeast = !specialDateRepository.findByTypeAndDateBetween(SpecialDateType.FEAST, from, to).isEmpty();
        return users.stream()
                .filter(user -> userService.checkIfUserHasAnyTaskPerformerRole(user.getId()))
                .map(user -> createGroupedTasksByRolesInScheduleInfoForUser(user.getId(), from, to, weekWithFeast))
                .collect(Collectors.toList());
    }

    private GroupedTasksByRolesInScheduleInfoForUser createGroupedTasksByRolesInScheduleInfoForUser(Long userId, LocalDate from, LocalDate to, boolean weekWithFeast) {
        User user = userService.getUserById(userId).orElseThrow(() ->
                new EntityNotFoundException("User with given id does not exist"));

        List<Schedule> schedules = getAllSchedulesByUserIdForSpecifiedWeek(userId, from, to);

        Map<String, List<String>> groupedTasksInfoStrings = createGroupedTasksInfoStringsOfTasksOccurrenceFromGivenSchedule(schedules, weekWithFeast);

        return new GroupedTasksByRolesInScheduleInfoForUser(userId, user.getName(), user.getSurname(), groupedTasksInfoStrings);
    }

    private ScheduleShortInfoForUser createScheduleShortInfoForUser(Long userId, LocalDate from, LocalDate to, boolean weekWithFeast) {
        User user = userService.getUserById(userId).orElseThrow(() ->
                new EntityNotFoundException("User with given id does not exist"));

        List<Schedule> schedules = getAllSchedulesByUserIdForSpecifiedWeek(userId, from, to);

        List<String> tasksInfoStrings = createInfoStringsOfTasksOccurrenceFromGivenSchedule(schedules, weekWithFeast);

        return new ScheduleShortInfoForUser(userId, user.getName(), user.getSurname(), tasksInfoStrings);
    }

    //TODO: Optimise this method
    public void deleteScheduleForWholePeriodTask(AddScheduleForWholePeriodTaskDTO addScheduleForWholePeriodTaskDTO) {
        LocalDate from = addScheduleForWholePeriodTaskDTO.getFromDate();
        LocalDate to = addScheduleForWholePeriodTaskDTO.getToDate();

        validate(!DateValidator.dateStartsSundayEndsSaturday(from, to), new IllegalArgumentException("Invalid date range. The period must start on Sunday and end on Saturday, covering exactly one week."));

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

        validate(!DateValidator.dateStartsSundayEndsSaturday(weekStartDate, weekEndDate), new IllegalArgumentException("Invalid date range. The period must start on Sunday and end on Saturday, covering exactly one week."));
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
        if(!DateValidator.isStartDateMax6daysBeforeEndDate(from, to)) {
            throw new IllegalArgumentException(DateValidator.isStartDateMax6daysBeforeEndDateError);
        }

        if(!taskService.existsById(taskId)) {
            throw new EntityNotFoundException("Task with given id does not exist");
        }

        return scheduleRepository.findByTaskIdAndDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(taskId, from, to);
    }

    public List<ScheduleShortInfoForTask> getScheduleShortInfoForEachTaskForSpecifiedWeek(LocalDate from, LocalDate to) {
        if(!DateValidator.isStartDateMax6daysBeforeEndDate(from, to)) {
            throw new IllegalArgumentException(DateValidator.isStartDateMax6daysBeforeEndDateError);
        }

        List<Task> tasks = taskService.getAllTasks();
        boolean weekWithFeast = specialDateRepository.existsByTypeAndDateBetween(SpecialDateType.FEAST, from, to);
        return tasks.stream()
                .map(task -> createScheduleShortInfoForTask(task.getId(), from, to, weekWithFeast))
                .collect(Collectors.toList());
    }

    private ScheduleShortInfoForTask createScheduleShortInfoForTask(Long taskId, LocalDate from, LocalDate to, boolean weekWithFeast) {
        Task task = taskService.getTaskById(taskId).orElseThrow(() ->
                new EntityNotFoundException("Task with given id does not exist"));

        List<Schedule> schedules = getAllSchedulesForTaskForSpecifiedWeek(taskId, from, to);

        List<String> usersInfoStrings = createInfoStringsOfUsersOccurrenceFromGivenSchedule(schedules, task.getDaysOfWeek().size(), weekWithFeast);

        return new ScheduleShortInfoForTask(taskId, task.getName(), usersInfoStrings);
    }

    private List<String> createInfoStringsOfUsersOccurrenceFromGivenSchedule(List<Schedule> schedules, int taskDaysOfWeekCount, boolean weekWithFeast) {
        // If user appears in the list n times, where n is the user occurrence in the week,
        // then it will be converted to "user.name user.surname" only string.
        // If user appears less than n times, then it will be converted to "user.name user.surname (P, W, Ś)" string,
        // where P, W, Ś are the days of the week when the user occurs.

        // Possible days of the week
        // Dictionary of DayOfWeek enum and its abbreviation in polish
        Map<DayOfWeek, String> dayOfWeekAbbreviations = Map.of(
                DayOfWeek.SUNDAY, "Nd",
                DayOfWeek.MONDAY, "Pn",
                DayOfWeek.TUESDAY, "Wt",
                DayOfWeek.WEDNESDAY, "Śr",
                DayOfWeek.THURSDAY, "Cz",
                DayOfWeek.FRIDAY, "Pt",
                DayOfWeek.SATURDAY, "So"
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

                    // SUNDAY, MONDAY, ..., SATURDAY order
                    Comparator<DayOfWeek> customOrderComparator = Comparator
                            .comparingInt(day -> (day.getValue() % DayOfWeek.values().length));
                    if (weekWithFeast) {
                        String daysOfWeekString = occurrences.stream().sorted(customOrderComparator)
                                .map(dayOfWeekAbbreviations::get)
                                .collect(Collectors.joining(", "));
                        return user.getName() + " " + user.getSurname() + " (" + daysOfWeekString + ")";
                    }


                    if (occurrences.size() < taskDaysOfWeekCount) {
                        String daysOfWeekString = occurrences.stream().sorted(customOrderComparator)
                                .map(dayOfWeekAbbreviations::get)
                                .collect(Collectors.joining(", "));
                        return user.getName() + " " + user.getSurname() + " (" + daysOfWeekString + ")";
                    } else {
                        return user.getName() + " " + user.getSurname();
                    }
                })
                .collect(Collectors.toList());
    }

    public Map<String, List<String>> createGroupedTasksInfoStringsOfTasksOccurrenceFromGivenSchedule(List<Schedule> schedules, boolean weekWithFeast) {
        schedules = schedules.stream().filter(s -> s.getTask().getSupervisorRole().isAreTasksVisibleInPrints()).toList();
        List<Role> roles = schedules.stream().map(Schedule::getTask).map(Task::getSupervisorRole).distinct().toList();

        Map<String, List<String>> groupedTasksInfoStrings = new HashMap<>();

        for (Role role: roles) {
            List<Schedule> filteredSchedules = schedules.stream().filter(s -> s.getTask().getSupervisorRole().equals(role)).toList();
            // If task appears in the list n times, where n is the task occurrence in the week,
            // then it will be converted to "task.name" only string.
            // If task appears less than n times, then it will be converted to "task.name (P, W, Ś)" string,
            // where P, W, Ś are the days of the week when the task occurs.

            // Possible days of the week
            // Dictionary of DayOfWeek enum and its abbreviation in polish
            Map<DayOfWeek, String> dayOfWeekAbbreviations = Map.of(
                    DayOfWeek.SUNDAY, "Nd",
                    DayOfWeek.MONDAY, "Pn",
                    DayOfWeek.TUESDAY, "Wt",
                    DayOfWeek.WEDNESDAY, "Śr",
                    DayOfWeek.THURSDAY, "Cz",
                    DayOfWeek.FRIDAY, "Pt",
                    DayOfWeek.SATURDAY, "So"
            );

            // Create a map of tasks and their DaysOfWeek assigns from task.date
            // Example: {task: [MONDAY, WEDNESDAY, FRIDAY], task2: [TUESDAY, THURSDAY]}
            Map<Task, Set<DayOfWeek>> taskDaysWhenItIsAssignedInSchedule = filteredSchedules.stream()
                    .collect(Collectors.groupingBy(Schedule::getTask, Collectors.mapping(
                            schedule -> schedule.getDate().getDayOfWeek(),
                            Collectors.collectingAndThen(
                                    Collectors.toList(),
                                    list -> {
                                        Collections.sort(list);
                                        return new LinkedHashSet<>(list);
                                    })
                    )));


            groupedTasksInfoStrings.put(role.getName(), taskDaysWhenItIsAssignedInSchedule.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey(
                            Comparator.comparing((Task t) -> t.getSupervisorRole().getSortOrder())
                                    .thenComparing(Task::getSortOrder)
                    ))
                    .map(entry -> {
                        Task task = entry.getKey();
                        Set<DayOfWeek> occurrences = entry.getValue();

                        // SUNDAY, MONDAY, ..., SATURDAY order
                        Comparator<DayOfWeek> customOrderComparator = Comparator
                                .comparingInt(day -> (day.getValue() % DayOfWeek.values().length));

                        // If there is any feast in the week,
                        // then the string should be: task.name (days of week when assign)
                        // even if the task occurs on all days of the week.
                        if (weekWithFeast) {
                            String daysOfWeekString = occurrences.stream().sorted(customOrderComparator)
                                    .map(dayOfWeekAbbreviations::get)
                                    .collect(Collectors.joining(", "));
                            return task.getNameAbbrev() + " (" + daysOfWeekString + ")";
                        }


                        if (occurrences.size() < task.getDaysOfWeek().size()) {
                            String daysOfWeekString = occurrences.stream().sorted(customOrderComparator)
                                    .map(dayOfWeekAbbreviations::get)
                                    .collect(Collectors.joining(", "));
                            return task.getNameAbbrev() + " (" + daysOfWeekString + ")";
                        } else {
                            return task.getNameAbbrev();
                        }
                    })
                    .collect(Collectors.toList()));
        }
        return groupedTasksInfoStrings;
    }

    public List<ScheduleShortInfoForTask> getScheduleShortInfoForTaskByRoleForSpecifiedWeek(String supervisorRole, LocalDate from, LocalDate to) {
        if(!DateValidator.isStartDateMax6daysBeforeEndDate(from, to)) {
            throw new IllegalArgumentException(DateValidator.isStartDateMax6daysBeforeEndDateError);
        }

        Role role = roleService.findByNameAndType(supervisorRole, RoleType.SUPERVISOR)
                .orElseThrow(() -> new EntityNotFoundException("Supervisor role not found or not a supervisor"));

        List<Task> tasks = taskService.findTasksBySupervisorRoleName(role.getName());
        boolean weekWithFeast = specialDateRepository.existsByTypeAndDateBetween(SpecialDateType.FEAST, from, to);
        return tasks.stream()
                .map(task -> createScheduleShortInfoForTask(task.getId(), from, to, weekWithFeast))
                .collect(Collectors.toList());
    }

    public List<UserTaskStatisticsDTO> getStatisticsForUserTasks(Long userId) {
        // Retrieve user
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User with given id does not exist"));

        // Retrieve all schedules for the user
        List<Schedule> schedules = getAllSchedulesByUserId(userId);

        // Retrieve the special stats date once
        LocalDate statsDate = specialDateRepository.findByType(SpecialDateType.STATS)
                .getFirst()
                .getDate();

        // Filter schedules from stats date
        List<Schedule> schedulesFromStatsDate = schedules.stream()
                .filter(schedule -> !schedule.getDate().isBefore(statsDate))
                .collect(Collectors.toList());

        // Map of last assignment dates
        Map<Task, LocalDate> lastAssignmentDateMap = schedulesFromStatsDate.stream()
                .collect(Collectors.toMap(
                        Schedule::getTask,
                        Schedule::getDate,
                        BinaryOperator.maxBy(LocalDate::compareTo)));

        // Count occurrences
        Map<Task, Long> taskOccurrencesFromStatsDate = countTaskOccurrences(schedulesFromStatsDate);
        Map<Task, Long> taskOccurrencesAllTime = countTaskOccurrences(schedules);

        // Build statistics
        List<UserTaskStatistic> statistics = taskOccurrencesAllTime.keySet().stream()
                .map(task -> new UserTaskStatistic.Builder(task)
                        .lastAssignmentDate(lastAssignmentDateMap.get(task))
                        .occurrencesFromStatsDate(taskOccurrencesFromStatsDate.getOrDefault(task, 0L))
                        .occurrencesAllTime(taskOccurrencesAllTime.get(task))
                        .build())
                .collect(Collectors.toList());

        // Sort statistics
        List<UserTaskStatistic> sortedStatistics = sortStatistics(statistics);

        // Convert to DTOs
        return sortedStatistics.stream()
                .map(UserTaskStatisticsDTO::new)
                .collect(Collectors.toList());
    }

    private Map<Task, Long> countTaskOccurrences(List<Schedule> schedules) {
        return schedules.stream()
                .collect(Collectors.groupingBy(
                        Schedule::getTask,
                        Collectors.counting()));
    }

    private List<UserTaskStatistic> sortStatistics(List<UserTaskStatistic> statistics) {
        List<Task> orderedTasks = taskRepository.findAllTasksOrderBySupervisorRoleSortOrderAndTaskSortOrder();
        Map<String, Integer> taskOrderMap = new HashMap<>();
        for (int i = 0; i < orderedTasks.size(); i++) {
            taskOrderMap.put(orderedTasks.get(i).getName(), i);
        }

        return statistics.stream()
                .sorted(Comparator.comparingInt(s -> taskOrderMap.getOrDefault(s.getTask().getName(), Integer.MAX_VALUE)))
                .collect(Collectors.toList());
    }


    private Map<Task, Long> getTaskOccurrencesFromStatsDate(List<Schedule> schedules) {
        LocalDate startDate = specialDateRepository.findByType(SpecialDateType.STATS).getFirst().getDate();
        LocalDate endDate = LocalDate.now().plusDays(1); // We add 1 day to include the current day
        return schedules.stream()
                .filter(schedule -> schedule.getDate().isAfter(startDate) && schedule.getDate().isBefore(endDate))
                .collect(Collectors.groupingBy(Schedule::getTask, Collectors.counting()));
    }

    public List<UserTasksScheduleInfoWeekly> getUserTasksScheduleInfoWeeklyByRole(String roleName, LocalDate from, LocalDate to) {
        validateDateRange(from, to);

        Role role = validateRoleExistence(roleName);

        List<Task> tasksByRole = taskService.findTasksBySupervisorRoleName(roleName);
        List<User> usersWhichCanPerformTasks = getUsersEligibleForTasks(tasksByRole);
        boolean weekWithFeast = !specialDateRepository.findByTypeAndDateBetween(SpecialDateType.FEAST, from, to).isEmpty();
        List<Schedule> schedulesForThisWeek = scheduleRepository.findByDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(from, to);
        List<Conflict> allConflicts = conflictService.getAllConflicts();

        return usersWhichCanPerformTasks.stream()
                .map(user -> createUserTasksScheduleInfoWeekly(user, tasksByRole, from, to, weekWithFeast, schedulesForThisWeek, allConflicts))
                .collect(Collectors.toList());
    }

    public UserTasksScheduleInfoWeekly getUserTasksScheduleInfoWeeklyByRole(String roleName, Long userId, LocalDate from, LocalDate to) {
        validateDateRange(from, to);

        List<Task> tasksByRole = taskService.findTasksBySupervisorRoleName(roleName);
        User user = userService.getUserById(userId).orElseThrow(() ->
                new EntityNotFoundException("User with given id does not exist"));
        boolean weekWithFeast = specialDateRepository.existsByTypeAndDateBetween(SpecialDateType.FEAST, from, to);
        List<Schedule> schedulesForThisWeek = scheduleRepository.findByDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(from, to);
        List<Conflict> allConflicts = conflictService.getAllConflicts();

        return createUserTasksScheduleInfoWeekly(user, tasksByRole, from, to, weekWithFeast, schedulesForThisWeek, allConflicts);
    }

    public List<UserTasksScheduleInfoWeeklyByAllDays> getUserTasksScheduleInfoWeeklyByAllDaysByRole(String roleName, LocalDate from, LocalDate to) {
        Role role = validateRoleExistence(roleName);

        List<Task> tasksByRole = taskService.findTasksBySupervisorRoleName(roleName);
        List<User> usersWhichCanPerformTasks = getUsersEligibleForTasks(tasksByRole);
        boolean weekWithFeast = specialDateRepository.existsByTypeAndDate(SpecialDateType.FEAST, from);
        List<Conflict> allConflicts = conflictService.getAllConflicts();

        return usersWhichCanPerformTasks.stream()
                .map(user -> createUserTasksScheduleInfoWeeklyForAllDaysOfWeek(user, tasksByRole, from, to, allConflicts, weekWithFeast))
                .collect(Collectors.toList());

    }

    public UserTasksScheduleInfoWeeklyByAllDays getUserTasksScheduleInfoWeeklyByAllDaysByRole(String roleName, Long userId, LocalDate from, LocalDate to) {
        List<Task> tasksByRole = taskService.findTasksBySupervisorRoleName(roleName);
        User user = userService.getUserById(userId).orElseThrow(() ->
                new EntityNotFoundException("User with given id does not exist"));

        List<Conflict> allConflicts = conflictService.getAllConflicts();
        boolean weekWithFeast = specialDateRepository.existsByTypeAndDateBetween(SpecialDateType.FEAST, from, to);

        return createUserTasksScheduleInfoWeeklyForAllDaysOfWeek(user, tasksByRole, from, to, allConflicts, weekWithFeast);

    }

    private void validateDateRange(LocalDate from, LocalDate to) {
        if (!DateValidator.dateStartsSundayEndsSaturday(from, to)) {
            throw new IllegalArgumentException("Invalid date range. The period must start on Sunday and end on Saturday, covering exactly one week.");
        }
    }

    private Role validateRoleExistence(String roleName) {
        Role role = roleService.getRoleByName(roleName);
        if (role == null) {
            throw new EntityNotFoundException("Role with given name does not exist");
        }
        return role;
    }

    private List<User> getUsersEligibleForTasks(List<Task> tasksByRole) {
        List<String> allowedRoles = tasksByRole.stream()
                .map(Task::getAllowedRoles)
                .flatMap(Collection::stream)
                .map(Role::getName)
                .distinct()
                .collect(Collectors.toList());

        return userService.getUsersWhichHaveAnyOfRoles(allowedRoles);
    }

    private UserTasksScheduleInfoWeekly createUserTasksScheduleInfoWeekly(User user, List<Task> tasksByRole, LocalDate from, LocalDate to, boolean weekWithFeast, List<Schedule> schedulesForThisWeek, List<Conflict> allConflicts) {
        UserTasksScheduleInfoWeekly userTasksDependencies = new UserTasksScheduleInfoWeekly();
        userTasksDependencies.setUserId(user.getId());
        userTasksDependencies.setUserName(user.getName() + " " + user.getSurname());

        List<Schedule> userSchedulesForWeek = getAllSchedulesByUserIdForSpecifiedWeek(user.getId(), from, to);
        List<String> userAssignedTasksNamesForWeek = createInfoStringsOfTasksOccurrenceFromGivenSchedule(userSchedulesForWeek, weekWithFeast);
        userTasksDependencies.setAssignedTasks(userAssignedTasksNamesForWeek);
        userTasksDependencies.setUserTasksScheduleInfo(
                tasksByRole.stream()
                        .map(task -> createUserTaskScheduleInfo(user, task, from, to, schedulesForThisWeek, allConflicts))
                        .collect(Collectors.toList())
        );

        return userTasksDependencies;
    }

    private UserTaskScheduleInfo createUserTaskScheduleInfo(User user, Task task, LocalDate from, LocalDate to, List<Schedule> schedulesForThisWeek, List<Conflict> allConflicts) {
        UserTaskDependencyWeeklyDTO userTaskDependencyWeeklyDTO = getUserDependenciesForTaskWeekly(task.getId(), user.getId(), from, to, schedulesForThisWeek, allConflicts);

        UserTaskScheduleInfo userTaskScheduleInfo = new UserTaskScheduleInfo();
        userTaskScheduleInfo.setVisible(true);
        userTaskScheduleInfo.setTaskName(task.getName());
        userTaskScheduleInfo.setTaskId(task.getId());
        userTaskScheduleInfo.setLastAssignedWeeksAgo(getWeeksAgo(userTaskDependencyWeeklyDTO.getLastAssigned(), from));
        userTaskScheduleInfo.setNumberOfWeeklyAssignsFromStatsDate(userTaskDependencyWeeklyDTO.getNumberOfAssignsInLastYear() / task.getDaysOfWeek().size());
        userTaskScheduleInfo.setIsInConflict(userTaskDependencyWeeklyDTO.getIsInConflict());
        userTaskScheduleInfo.setHasObstacle(userTaskDependencyWeeklyDTO.getHasObstacle());
        userTaskScheduleInfo.setAssignedToTheTask(userTaskDependencyWeeklyDTO.isAssignedToTheTask());

        userTaskScheduleInfo.setHasRoleForTheTask(userHasAllowedRoleForTask(user, task));

        return userTaskScheduleInfo;
    }

    private int getWeeksAgo(LocalDate datePast, LocalDate weekSunday) {
        if(datePast == null) {
            return 0;
        }

        long daysAgo = ChronoUnit.DAYS.between(datePast, weekSunday);
        if (daysAgo % 7 == 0) {
            return (int) (daysAgo / 7);
        } else {
            return (int) (daysAgo / 7) + 1;
        }
    }

    public List<UserTasksScheduleInfoWeekly> getUserTasksScheduleInfoWeeklyForOneDayByRole(String roleName, LocalDate date) {
        Role role = validateRoleExistence(roleName);

        List<Task> tasksByRole = taskService.findTasksBySupervisorRoleName(roleName);
        List<User> usersWhichCanPerformTasks = getUsersEligibleForTasks(tasksByRole);
        List<Conflict> allConflicts = conflictService.getAllConflicts();
        boolean weekWithFeast = specialDateRepository.existsByTypeAndDate(SpecialDateType.FEAST, date);

        return usersWhichCanPerformTasks.stream()
                .map(user -> createUserTasksScheduleInfoWeeklyForOneDay(user, tasksByRole, allConflicts, date, weekWithFeast))
                .collect(Collectors.toList());
    }

    public UserTasksScheduleInfoWeekly getUserTasksScheduleInfoWeeklyForOneDayByRole(String roleName, Long userId, LocalDate date) {
        List<Task> tasksByRole = taskService.findTasksBySupervisorRoleName(roleName);
        User user = userService.getUserById(userId).orElseThrow(() ->
                new EntityNotFoundException("User with given id does not exist"));
        List<Conflict> allConflicts = conflictService.getAllConflicts();

        LocalDate fromTmp = date.with(DayOfWeek.SUNDAY);
        if (date.getDayOfWeek() != DayOfWeek.SUNDAY) {
            fromTmp = fromTmp.minusWeeks(1);
        }
        LocalDate from = fromTmp;

        LocalDate to = from.plusDays(6);
        boolean weekWithFeast = specialDateRepository.existsByTypeAndDateBetween(SpecialDateType.FEAST, from, to);

        return createUserTasksScheduleInfoWeeklyForOneDay(user, tasksByRole, allConflicts, date, weekWithFeast);
    }

    private UserTasksScheduleInfoWeekly createUserTasksScheduleInfoWeeklyForOneDay(User user, List<Task> tasksByRole, List<Conflict> allConflicts, LocalDate date, boolean weekWithFeast) {
        // Get from and to date using given date
        // from - start of the week - sunday
        // to - end of the week - saturday
        // SO if date.dayOfWeek == FRIDAY, then from = date - 5 days, to = date + 1 days

        LocalDate fromTmp = date.with(DayOfWeek.SUNDAY);
        if (date.getDayOfWeek() != DayOfWeek.SUNDAY) {
            fromTmp = fromTmp.minusWeeks(1);
        }
        LocalDate from = fromTmp;

        LocalDate to = from.plusDays(6);

        UserTasksScheduleInfoWeekly userTasksDependencies = new UserTasksScheduleInfoWeekly();
        userTasksDependencies.setUserId(user.getId());
        userTasksDependencies.setUserName(user.getName() + " " + user.getSurname());

        List<Schedule> userSchedulesForWeek = getAllSchedulesByUserIdForSpecifiedWeek(user.getId(), from, to);
        List<String> userAssignedTasksNamesForWeek = createInfoStringsOfTasksOccurrenceFromGivenSchedule(userSchedulesForWeek, weekWithFeast);
        List<Schedule> userSchedulesAtDate = userSchedulesForWeek.stream().filter(schedule -> schedule.getDate().isEqual(date)).toList();
        userTasksDependencies.setAssignedTasks(userAssignedTasksNamesForWeek);
        userTasksDependencies.setUserTasksScheduleInfo(
                tasksByRole.stream()
                        .map(task -> createUserTaskScheduleInfo(user, task, userSchedulesAtDate, allConflicts, date, from, to, false))
                        .collect(Collectors.toList())
        );

        return userTasksDependencies;
    }

    private UserTasksScheduleInfoWeeklyByAllDays createUserTasksScheduleInfoWeeklyForAllDaysOfWeek(User user, List<Task> tasksByRole, LocalDate from, LocalDate to, List<Conflict> allConflicts, boolean weekWithFeast) {
        UserTasksScheduleInfoWeeklyByAllDays userTasksDependencies = new UserTasksScheduleInfoWeeklyByAllDays();
        userTasksDependencies.setUserTasksScheduleInfo(new HashMap<>());
        userTasksDependencies.setUserId(user.getId());
        userTasksDependencies.setUserName(user.getName() + " " + user.getSurname());

        List<Schedule> userSchedulesForWeek = getAllSchedulesByUserIdForSpecifiedWeek(user.getId(), from, to);
        List<String> userAssignedTasksNamesForWeek = createInfoStringsOfTasksOccurrenceFromGivenSchedule(userSchedulesForWeek, weekWithFeast);
        userTasksDependencies.setAssignedTasks(userAssignedTasksNamesForWeek);

        for (int i = 0; i < 7; i++) {
            final LocalDate date = from.plusDays(i);
            List<Schedule> userScheduleAtDate = userSchedulesForWeek.stream().filter(schedule -> schedule.getDate().isEqual(date)).toList();
            List<UserTaskScheduleInfo> userTaskScheduleInfos = tasksByRole.stream()
                    .map(task -> createUserTaskScheduleInfo(user, task, userScheduleAtDate, allConflicts, date, from, to, true))
                    .toList();
            userTasksDependencies.getUserTasksScheduleInfo().put(date.getDayOfWeek(), userTaskScheduleInfos);
        }

        return userTasksDependencies;
    }

    private List<Schedule> getAllSchedulesByFromAndToDates(LocalDate from, LocalDate to) {
        return scheduleRepository.findByDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(from, to);
    }


    private UserTaskScheduleInfo createUserTaskScheduleInfo(User user, Task task, List<Schedule> userSchedulesForWeek, List<Conflict> allConflicts, LocalDate date, LocalDate from, LocalDate to, boolean ignoreLastAssignedStats) {
        UserTaskScheduleInfo userTaskScheduleInfo = new UserTaskScheduleInfo();

        boolean isFeastDate = specialDateRepository.existsByTypeAndDate(SpecialDateType.FEAST, date);
        boolean taskAppearsOnDate;

        if (isFeastDate) {
            taskAppearsOnDate = task.getDaysOfWeek().contains(DayOfWeek.SUNDAY) || task.getDaysOfWeek().contains(date.getDayOfWeek());
        } else {
            taskAppearsOnDate = task.getDaysOfWeek().contains(date.getDayOfWeek());
        }


        if (!taskAppearsOnDate) {
            userTaskScheduleInfo.setVisible(false);
        } else {
            userTaskScheduleInfo.setVisible(true);
            UserTaskScheduleInfo userTaskScheduleInfoData = getUserTaskScheduleInfo(task, user, userSchedulesForWeek, date, isFeastDate, from, to, allConflicts, ignoreLastAssignedStats);


            if (task.getSupervisorRole().isWeeklyScheduleCreatorDefault()) {
                userTaskScheduleInfo.setNumberOfWeeklyAssignsFromStatsDate(userTaskScheduleInfoData.getNumberOfWeeklyAssignsFromStatsDate() / task.getDaysOfWeek().size());
            } else {
                userTaskScheduleInfo.setNumberOfWeeklyAssignsFromStatsDate(userTaskScheduleInfoData.getNumberOfWeeklyAssignsFromStatsDate());
            }


            userTaskScheduleInfo.setLastAssignedWeeksAgo(userTaskScheduleInfoData.getLastAssignedWeeksAgo());
            userTaskScheduleInfo.setIsInConflict(userTaskScheduleInfoData.getIsInConflict());
            userTaskScheduleInfo.setHasObstacle(userTaskScheduleInfoData.getHasObstacle());
            userTaskScheduleInfo.setAssignedToTheTask(userTaskScheduleInfoData.getAssignedToTheTask());
            userTaskScheduleInfo.setHasRoleForTheTask(userTaskScheduleInfoData.getHasRoleForTheTask());
            userTaskScheduleInfo.setTaskId(userTaskScheduleInfoData.getTaskId());
            userTaskScheduleInfo.setTaskName(userTaskScheduleInfoData.getTaskName());
        }
        return userTaskScheduleInfo;
    }

    public UserTaskScheduleInfo getUserTaskScheduleInfo(Task task, User user, List<Schedule> userSchedulesForWeek, LocalDate date, boolean isFeastDate, LocalDate from, LocalDate to, List<Conflict> allConflicts, boolean ignoreLastAssignedStats) {
        int numberOfTaskCompletionByUserFromStatsDate;
        LocalDate userLastCompletionDateForTask;
        if(!ignoreLastAssignedStats) {
            numberOfTaskCompletionByUserFromStatsDate = (int) getNumberOfTaskCompletionByUserFromStatsDate(user.getId(), task.getId(), from.minusDays(1));
            userLastCompletionDateForTask = getLastTaskCompletionDateForUserFromStatsDate(user.getId(), task.getId(), from).orElse(null);
        } else {
            numberOfTaskCompletionByUserFromStatsDate = 0;
            userLastCompletionDateForTask = null;
        }

        List<Conflict> taskConflicts = allConflicts.stream().filter(conflict -> conflict.getTask1().getId().equals(task.getId()) || conflict.getTask2().getId().equals(task.getId())).toList();

        boolean isInConflict = userSchedulesForWeek.stream()
                .anyMatch(s -> conflictService.tasksAreInConflict(task.getId(), s.getTask().getId(), taskConflicts, date.getDayOfWeek(), isFeastDate));

        boolean hasObstacle = !obstacleService.findApprovedObstaclesByUserIdAndTaskIdForDate(user.getId(), task.getId(), date).isEmpty();

        boolean isAlreadyAssignedToTheTask = checkIfUserIsAlreadyAssignedToDailyTask(task, userSchedulesForWeek, date);

        boolean hasAllowedRoleForTask = userHasAllowedRoleForTask(user, task);

        UserTaskScheduleInfo userTaskScheduleInfo = new UserTaskScheduleInfo();
        userTaskScheduleInfo.setTaskName(task.getNameAbbrev());
        userTaskScheduleInfo.setTaskId(task.getId());
        userTaskScheduleInfo.setLastAssignedWeeksAgo(getWeeksAgo(userLastCompletionDateForTask, from));
        userTaskScheduleInfo.setNumberOfWeeklyAssignsFromStatsDate(numberOfTaskCompletionByUserFromStatsDate);
        userTaskScheduleInfo.setIsInConflict(isInConflict);
        userTaskScheduleInfo.setHasObstacle(hasObstacle);
        userTaskScheduleInfo.setAssignedToTheTask(isAlreadyAssignedToTheTask);
        userTaskScheduleInfo.setHasRoleForTheTask(hasAllowedRoleForTask);

        return userTaskScheduleInfo;
    }

    public Map<Integer, List<String>> getScheduleHistoryForUser(Long userId, LocalDate date, int numberOfWeeksToDisplay) {
        if(date.getDayOfWeek() != DayOfWeek.SUNDAY) {
            throw new IllegalArgumentException("Invalid date. The date must be a Sunday (beginning of the week).");
        }

        Map<Integer, List<String>> userScheduleHistory = new HashMap<>();

        LocalDate weekStartDate = date.minusWeeks(1);
        LocalDate weekEndDate = date.minusDays(1);
        boolean weekWithFeast = specialDateRepository.existsByTypeAndDateBetween(SpecialDateType.FEAST, weekStartDate, weekEndDate);
        for(int i = 0; i < numberOfWeeksToDisplay; i++) {
            List<Schedule> schedules = getAllSchedulesByUserIdForSpecifiedWeek(userId, weekStartDate, weekEndDate);
            List<String> tasksInfoStrings = createInfoStringsOfTasksOccurrenceFromGivenSchedule(schedules, weekWithFeast);
            userScheduleHistory.put(i+1, tasksInfoStrings);

            weekStartDate = weekStartDate.minusWeeks(1);
            weekEndDate = weekEndDate.minusWeeks(1);
        }

        return userScheduleHistory;
    }

    public Map<User, List<Schedule>> getScheduleForUsers(List<User> users, LocalDate from, LocalDate to) {
        Map<User, List<Schedule>> userSchedules = new HashMap<>();
        for(User user : users) {
            List<Schedule> schedules = getAllSchedulesByUserId(user.getId(), from, to);
            userSchedules.put(user, schedules);
        }
        return userSchedules;
    }

    public Map<User, List<Schedule>> getScheduleForUsers(List<User> users, LocalDate from, LocalDate to, String taskSupervisorRoleName) {
        Map<User, List<Schedule>> userSchedules = new HashMap<>();
        for(User user : users) {
            List<Schedule> schedules = getAllSchedulesByUserId(user.getId(), from, to);
            schedules = schedules.stream()
                    .filter(schedule -> schedule.getTask().getSupervisorRole().getName().equals(taskSupervisorRoleName))
                    .collect(Collectors.toList());
            userSchedules.put(user, schedules);
        }
        return userSchedules;
    }

    public Map<User, List<Schedule>> getScheduleForAllUsers(LocalDate from, LocalDate to) {
        List<User> users = userService.getAllUsers();
        return getScheduleForUsers(users, from, to);
    }

    public Map<User, List<Schedule>> getScheduleForAllUsers(LocalDate from, LocalDate to, String taskSupervisorRoleName) {
        List<User> users = userService.getAllUsers();
        return getScheduleForUsers(users, from, to, taskSupervisorRoleName);
    }

    public List<UserSchedulesOnDaysDTO> getListOfUserSchedulesByDaysDTO(LocalDate from, LocalDate to) {
        List<User> users = userService.getAllUsers();
        users = users.stream()
                .filter(user -> userService.checkIfUserHasAnyTaskPerformerRole(user.getId()))
                .toList();

        List<UserSchedulesOnDaysDTO> userSchedulesOnDaysDTO = new ArrayList<>();

        for(User user : users) {
            UserSchedulesOnDaysDTO userSchedulesOnDays = new UserSchedulesOnDaysDTO();
            UserShortInfo userShortInfo = new UserShortInfo(user.getId(), user.getName(), user.getSurname());
            userSchedulesOnDays.setUserShortInfo(userShortInfo);

            Map<LocalDate, List<String>> userSchedules = new HashMap<>();
            LocalDate date = from;
            while (!date.isAfter(to)) {
                List<Schedule> schedules = scheduleRepository.findByUserIdAndDateOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(user.getId(), date);
                List<String> assignedTasksNamesAbbrevs = schedules.stream()
                        .map(schedule -> schedule.getTask().getNameAbbrev())
                        .toList();
                userSchedules.put(date, assignedTasksNamesAbbrevs);
                date = date.plusDays(1);
            }
            userSchedulesOnDays.setSchedules(userSchedules);

            userSchedulesOnDaysDTO.add(userSchedulesOnDays);
        }
        return userSchedulesOnDaysDTO;

    }

    public List<UserSchedulesOnDaysDTO> getListOfUserSchedulesByDaysDTO(LocalDate from, LocalDate to, String taskSupervisorRoleName) {
        List<User> users = userService.getUsersWhichAreEligibleToPerformTasksAssignedToSupervisorRole(taskSupervisorRoleName);

        List<UserSchedulesOnDaysDTO> userSchedulesOnDaysDTO = new ArrayList<>();

        for(User user : users) {
            UserSchedulesOnDaysDTO userSchedulesOnDays = new UserSchedulesOnDaysDTO();
            UserShortInfo userShortInfo = new UserShortInfo(user.getId(), user.getName(), user.getSurname());
            userSchedulesOnDays.setUserShortInfo(userShortInfo);

            Map<LocalDate, List<String>> userSchedules = new HashMap<>();
            LocalDate date = from;
            while (!date.isAfter(to)) {
                List<Schedule> schedules = scheduleRepository.findByUserIdAndDateOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(user.getId(), date);
                schedules = schedules.stream()
                        .filter(schedule -> schedule.getTask().getSupervisorRole().getName().equals(taskSupervisorRoleName))
                        .toList();
                List<String> assignedTasksNamesAbbrevs = schedules.stream()
                        .map(schedule -> schedule.getTask().getNameAbbrev())
                        .toList();
                userSchedules.put(date, assignedTasksNamesAbbrevs);
                date = date.plusDays(1);
            }
            userSchedulesOnDays.setSchedules(userSchedules);

            userSchedulesOnDaysDTO.add(userSchedulesOnDays);
        }
        return userSchedulesOnDaysDTO;
    }

    public void generateSchedule(Long roleId, Long startingFromUserId, LocalDate from, LocalDate to) {
        scheduleGenerator.generateSchedule(roleId, startingFromUserId, from, to);
    }

    public void cleanSchedule(Long roleId, LocalDate from, LocalDate to) {
        scheduleCleaner.cleanSchedule(roleId, from, to);
    }
}
