package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.comparator.TaskComparator;
import org.verduttio.dominicanappbackend.domain.obstacle.Obstacle;
import org.verduttio.dominicanappbackend.dto.obstacle.ObstaclePatchDTO;
import org.verduttio.dominicanappbackend.dto.obstacle.ObstacleRequestDTO;
import org.verduttio.dominicanappbackend.domain.*;
import org.verduttio.dominicanappbackend.repository.ObstacleRepository;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.security.SecurityUtils;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.validation.ObstacleValidator;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ObstacleService {

    private final ObstacleRepository obstacleRepository;
    private final ObstacleValidator obstacleValidator;
    private final ScheduleRepository scheduleRepository;
    private final TaskRepository taskRepository;
    private final TaskComparator taskComparator = new TaskComparator();

    @Autowired
    public ObstacleService(ObstacleRepository obstacleRepository,
                           ObstacleValidator obstacleValidator, ScheduleRepository scheduleRepository, TaskRepository taskRepository) {
        this.obstacleRepository = obstacleRepository;
        this.obstacleValidator = obstacleValidator;
        this.scheduleRepository = scheduleRepository;
        this.taskRepository = taskRepository;
    }

    public List<Obstacle> getAllObstacles() {
        List<Obstacle> obstacles = obstacleRepository.findAllSorted();
        obstacles.forEach(this::sortTasksInObstacle);
        return obstacles.stream().map(this::normalizeObstacleTaskListToRoleNamesOrOneTask).toList();
    }

    public Page<Obstacle> getAllObstacles(Pageable pageable) {
        Page<Obstacle> obstacles = obstacleRepository.findAllSorted(pageable);
        obstacles.forEach(this::sortTasksInObstacle);
        List<Obstacle> modifiedList = obstacles.getContent().stream().map(this::normalizeObstacleTaskListToRoleNamesOrOneTask).toList();
        return new PageImpl<>(modifiedList, pageable, obstacles.getTotalElements());
    }


    private Obstacle normalizeObstacleTaskListToRoleNamesOrOneTask(Obstacle obstacle) {
        List<Task> allTasks = taskRepository.findAll();
        if (obstacle.getTasks().size() == allTasks.size()) {
            return mapObstacleWithAllTasksToContainOneSpecialTaskForAll(obstacle);
        } else {
            return mapObstacleWithListOfTaskNames(obstacle, getNormalizedTaskNamesForObstacle(obstacle, allTasks));
        }
    }

    private List<String> getNormalizedTaskNamesForObstacle(Obstacle obstacle, List<Task> allTasks) {
        List<Role> supervisorRolesWhichHaveAllTasksInObstacle = getSupervisorRolesWhichHaveAllTasksInObstacle(obstacle, allTasks);
        List<String> supervisorRolesNames = supervisorRolesWhichHaveAllTasksInObstacle.stream()
                .map(Role::getAssignedTasksGroupName)
                .toList();
        List<String> restTasksNames = obstacle.getTasks().stream().filter(task -> !supervisorRolesWhichHaveAllTasksInObstacle.contains(task.getSupervisorRole()))
                .map(Task::getNameAbbrev)
                .toList();
        return Stream.concat(supervisorRolesNames.stream(), restTasksNames.stream())
                .toList();
    }

    private List<Role> getSupervisorRolesWhichHaveAllTasksInObstacle(Obstacle obstacle, List<Task> allTasks) {
        Set<Role> supervisorRolesFromObstacleTasks = getSupervisorRolesOfAllTasksFromObstacle(obstacle);
        Map<Role, Long> supervisorRolesWithTaskCount = supervisorRolesFromObstacleTasks.stream()
                .collect(Collectors.toMap(role -> role, role -> countNumberOfTasksBySupervisorRole(obstacle, role)));
        Map<Role, Long> supervisorRolesWithAllTaskCount = allTasks.stream()
                .map(Task::getSupervisorRole)
                .collect(Collectors.groupingBy(role -> role, Collectors.counting()));
        return supervisorRolesWithTaskCount.entrySet().stream()
                .filter(entry -> entry.getValue().equals(supervisorRolesWithAllTaskCount.get(entry.getKey())))
                .map(Map.Entry::getKey)
                .toList();
    }


    private long countNumberOfTasksBySupervisorRole(Obstacle obstacle, Role supervisorRole) {
        return obstacle.getTasks().stream()
                .filter(task -> task.getSupervisorRole().equals(supervisorRole))
                .count();
    }


    private Set<Role> getSupervisorRolesOfAllTasksFromObstacle(Obstacle obstacle) {
        return obstacle.getTasks().stream()
                .map(Task::getSupervisorRole)
                .collect(Collectors.toSet());
    }

    private Obstacle mapObstacleWithListOfTaskNames(Obstacle obstacle, List<String> namesForTasks) {
        Task specialTask = new Task();
        specialTask.setId(0L);
        specialTask.setName("Special form of obstacle");
        specialTask.setNameAbbrev(String.join(", ", namesForTasks));
        specialTask.setAllowedRoles(new HashSet<>());
        specialTask.setSupervisorRole(new Role());
        specialTask.setDaysOfWeek(EnumSet.allOf(DayOfWeek.class));
        specialTask.setParticipantsLimit(1);
        specialTask.setArchived(false);

        Set<Task> tasks = new HashSet<>();
        tasks.add(specialTask);

        obstacle.setTasks(tasks);
        return obstacle;
    }

    private Obstacle mapObstacleWithAllTasksToContainOneSpecialTaskForAll(Obstacle obstacle) {
        Task specialTask = new Task();
        specialTask.setId(0L);
        specialTask.setName("Wszystkie oficja");
        specialTask.setNameAbbrev("Wszystko");
        specialTask.setAllowedRoles(new HashSet<>());
        specialTask.setSupervisorRole(new Role());
        specialTask.setDaysOfWeek(EnumSet.allOf(DayOfWeek.class));
        specialTask.setParticipantsLimit(1);
        specialTask.setArchived(false);

        Set<Task> tasks = new HashSet<>();
        tasks.add(specialTask);

        obstacle.setTasks(tasks);
        return obstacle;
    }

    public Obstacle getObstacleById(Long obstacleId) {
        Obstacle obstacle = obstacleRepository.findById(obstacleId).orElseThrow(() -> new EntityNotFoundException("Obstacle not found with id: " + obstacleId));
        sortTasksInObstacle(obstacle);

        if (SecurityUtils.isUserOwnerOrAdmin(obstacle.getUser().getId())) {
            return normalizeObstacleTaskListToRoleNamesOrOneTask(obstacle);
        } else {
            throw new AccessDeniedException(SecurityUtils.ACCESS_DENIED_MESSAGE);
        }
    }

    public void saveObstacle(ObstacleRequestDTO obstacleRequestDTO) {
        obstacleValidator.validateObstacleRequestDTO(obstacleRequestDTO);
        obstacleValidator.ensureFromDateNotAfterToDate(obstacleRequestDTO.getFromDate(), obstacleRequestDTO.getToDate());

        Obstacle obstacle = obstacleRequestDTO.toObstacle();
        obstacleRepository.save(obstacle);
    }

    public void patchObstacle(Long obstacleId, ObstaclePatchDTO obstaclePatchDTO) {
        Obstacle obstacle = obstacleRepository.findById(obstacleId)
                .orElseThrow(() -> new EntityNotFoundException("Obstacle not found with id: " + obstacleId));

        obstacleValidator.validateObstaclePatchDTO(obstaclePatchDTO);
        updateObstacleFromPatchDTO(obstacle, obstaclePatchDTO);

        // Remove all schedules for user and tasks in the given range
        if(obstacle.getStatus() == ObstacleStatus.APPROVED) {
            for (Task task : obstacle.getTasks()) {
                scheduleRepository.deleteAllByUserIdAndTaskIdAndDateBetween(obstacle.getUser().getId(), task.getId(), obstacle.getFromDate(), obstacle.getToDate());
            }
        }

        obstacleRepository.save(obstacle);
    }


    public void deleteObstacle(Long obstacleId) {
        Obstacle obstacle = obstacleRepository.findById(obstacleId).orElseThrow(() -> new EntityNotFoundException("Obstacle not found with id: " + obstacleId));

        if (SecurityUtils.isUserOwnerOrAdmin(obstacle.getUser().getId())) {
            obstacleRepository.deleteById(obstacleId);
        } else {
            throw new AccessDeniedException(SecurityUtils.ACCESS_DENIED_MESSAGE);
        }

        obstacleRepository.deleteById(obstacleId);
    }

    public List<Obstacle> findApprovedObstaclesByUserIdAndTaskIdForDate(Long userId, Long taskId, LocalDate date) {
        List<Obstacle> userObstaclesForGivenTask = obstacleRepository.findObstaclesByUserIdAndTaskId(userId, taskId);
        List<Obstacle> currentUserObstaclesForGivenTask = userObstaclesForGivenTask.stream().filter(obstacle -> obstacleValidator.isDateInRange(date, obstacle.getFromDate(), obstacle.getToDate())).toList();
        return currentUserObstaclesForGivenTask.stream().filter(obstacle -> obstacle.getStatus() == ObstacleStatus.APPROVED).toList();
    }

    public List<Obstacle> findApprovedObstaclesByUserIdAndTaskIdBetweenDate(Long userId, Long taskId, LocalDate fromDate, LocalDate toDate) {
        List<Obstacle> userObstaclesForGivenTask = obstacleRepository.findObstaclesByUserIdAndTaskId(userId, taskId);
        List<Obstacle> currentUserObstaclesForGivenTask = userObstaclesForGivenTask.stream().filter(obstacle -> (obstacle.getFromDate().isBefore(toDate) || obstacle.getFromDate().isEqual(toDate)) &&
                                                                                                                (obstacle.getToDate().isEqual(fromDate) || obstacle.getToDate().isAfter(fromDate))).toList();
        return currentUserObstaclesForGivenTask.stream().filter(obstacle -> obstacle.getStatus() == ObstacleStatus.APPROVED).toList();
    }

    public List<Obstacle> getAllObstaclesByUserId(Long userId) {
        List<Obstacle> obstacles = obstacleRepository.findObstaclesByUserIdSortedCustom(userId);
        obstacles.forEach(this::sortTasksInObstacle);

        return obstacles.stream()
                .map(this::normalizeObstacleTaskListToRoleNamesOrOneTask)
                .collect(Collectors.toList());
    }

    private void sortTasksInObstacle(Obstacle obstacle) {
        Set<Task> sortedTasks = obstacle.getTasks().stream()
                .sorted(taskComparator)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        obstacle.setTasks(sortedTasks);
    }

    public Page<Obstacle> getAllObstaclesByUserId(Long userId, Pageable pageable) {
        Page<Obstacle> obstacles = obstacleRepository.findObstaclesByUserIdSortedCustom(userId, pageable);
        obstacles.forEach(this::sortTasksInObstacle);

        List<Obstacle> modifiedList = obstacles.stream()
                .map(this::normalizeObstacleTaskListToRoleNamesOrOneTask)
                .collect(Collectors.toList());
        return new PageImpl<>(modifiedList, pageable, obstacles.getTotalElements());
    }

    private void updateObstacleFromPatchDTO(Obstacle obstacle, ObstaclePatchDTO obstaclePatchDTO) {
        obstacle.setStatus(ObstacleStatus.valueOf(obstaclePatchDTO.getStatus()));

        if (obstaclePatchDTO.getRecipientAnswer() != null) {
            obstacle.setRecipientAnswer(obstaclePatchDTO.getRecipientAnswer());
        }

        if (obstaclePatchDTO.getRecipientUserId() != null) {
            User recipientUser = new User();
            recipientUser.setId(obstaclePatchDTO.getRecipientUserId());
            obstacle.setRecipientUser(recipientUser);
        }
    }

    public List<Obstacle> getAllObstaclesByTaskId(Long taskId) {
        obstacleValidator.validateTaskExistence(taskId);
        List<Obstacle> obstaclesByTask = obstacleRepository.findAllByTaskId(taskId);
        return obstaclesByTask.stream().map(this::normalizeObstacleTaskListToRoleNamesOrOneTask).toList();
    }

    public Long getNumberOfObstaclesByStatus(ObstacleStatus status) {
        return obstacleRepository.countAllByStatus(status);
    }
}
