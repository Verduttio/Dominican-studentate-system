package org.verduttio.dominicanappbackend.domain.obstacle;

import org.springframework.stereotype.Component;
import org.verduttio.dominicanappbackend.domain.Role;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.repository.TaskRepository;

import java.time.DayOfWeek;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class ObstacleNormalizer {

    private final TaskRepository taskRepository;

    public ObstacleNormalizer(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Obstacle normalize(Obstacle obstacle) {
        List<Task> allTasks = taskRepository.findAll();
        if (obstacle.getTasks().size() == allTasks.size()) {
            return mapObstacleWithAllTasks(obstacle);
        } else {
            List<String> normalizedTaskNames = getNormalizedTaskNames(obstacle, allTasks);
            return mapObstacleWithTaskNames(obstacle, normalizedTaskNames);
        }
    }

    private List<String> getNormalizedTaskNames(Obstacle obstacle, List<Task> allTasks) {
        List<Role> rolesWithAllTasks = getRolesWithAllTasksInObstacle(obstacle, allTasks);
        List<String> roleNames = rolesWithAllTasks.stream()
                .map(Role::getAssignedTasksGroupName)
                .toList();

        List<String> remainingTaskNames = obstacle.getTasks().stream()
                .filter(task -> !rolesWithAllTasks.contains(task.getSupervisorRole()))
                .map(Task::getNameAbbrev)
                .toList();

        return Stream.concat(roleNames.stream(), remainingTaskNames.stream()).toList();
    }

    private List<Role> getRolesWithAllTasksInObstacle(Obstacle obstacle, List<Task> allTasks) {
        Set<Role> rolesInObstacle = getRolesFromObstacle(obstacle);
        Map<Role, Long> roleTaskCountsInObstacle = countTasksByRole(obstacle);
        Map<Role, Long> totalRoleTaskCounts = countTotalTasksByRole(allTasks);

        return rolesInObstacle.stream()
                .filter(role -> roleTaskCountsInObstacle.get(role).equals(totalRoleTaskCounts.get(role)))
                .toList();
    }

    private Set<Role> getRolesFromObstacle(Obstacle obstacle) {
        return obstacle.getTasks().stream()
                .map(Task::getSupervisorRole)
                .collect(Collectors.toSet());
    }

    private Map<Role, Long> countTasksByRole(Obstacle obstacle) {
        return obstacle.getTasks().stream()
                .collect(Collectors.groupingBy(Task::getSupervisorRole, Collectors.counting()));
    }

    private Map<Role, Long> countTotalTasksByRole(List<Task> tasks) {
        return tasks.stream()
                .collect(Collectors.groupingBy(Task::getSupervisorRole, Collectors.counting()));
    }

    private Obstacle mapObstacleWithTaskNames(Obstacle obstacle, List<String> taskNames) {
        Task specialTask = createSpecialTask(String.join(", ", taskNames), "Specjalny zestaw oficjów");
        obstacle.setTasks(Set.of(specialTask));
        return obstacle;
    }

    private Obstacle mapObstacleWithAllTasks(Obstacle obstacle) {
        Task specialTask = createSpecialTask("Wszystkie oficja", "Wszystkie oficja");
        obstacle.setTasks(Set.of(specialTask));
        return obstacle;
    }

    private Task createSpecialTask(String nameAbbrev, String name) {
        Task specialTask = new Task();
        specialTask.setId(0L); // Indicates a special task
        specialTask.setName(name);
        specialTask.setNameAbbrev(nameAbbrev);
        specialTask.setAllowedRoles(Collections.emptySet());
        specialTask.setSupervisorRole(new Role());
        specialTask.setDaysOfWeek(EnumSet.allOf(DayOfWeek.class));
        specialTask.setParticipantsLimit(1);
        specialTask.setArchived(false);
        return specialTask;
    }
}