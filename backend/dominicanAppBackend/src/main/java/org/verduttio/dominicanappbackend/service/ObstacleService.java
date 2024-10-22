package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.comparator.TaskComparator;
import org.verduttio.dominicanappbackend.domain.ObstacleStatus;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.domain.User;
import org.verduttio.dominicanappbackend.domain.obstacle.Obstacle;
import org.verduttio.dominicanappbackend.domain.obstacle.ObstacleNormalizer;
import org.verduttio.dominicanappbackend.dto.obstacle.ObstaclePatchDTO;
import org.verduttio.dominicanappbackend.dto.obstacle.ObstacleRequestDTO;
import org.verduttio.dominicanappbackend.repository.ObstacleRepository;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.security.SecurityUtils;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.validation.ObstacleValidator;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ObstacleService {

    private final ObstacleRepository obstacleRepository;
    private final ObstacleValidator obstacleValidator;
    private final ScheduleRepository scheduleRepository;
    private final TaskComparator taskComparator = new TaskComparator();
    private final ObstacleNormalizer obstacleNormalizer;

    @Autowired
    public ObstacleService(ObstacleRepository obstacleRepository,
                           ObstacleValidator obstacleValidator, ScheduleRepository scheduleRepository, ObstacleNormalizer obstacleNormalizer) {
        this.obstacleRepository = obstacleRepository;
        this.obstacleValidator = obstacleValidator;
        this.scheduleRepository = scheduleRepository;
        this.obstacleNormalizer = obstacleNormalizer;
    }

    public List<Obstacle> getAllObstacles() {
        List<Obstacle> obstacles = obstacleRepository.findAllSorted();
        obstacles.forEach(this::sortTasksInObstacle);
        return obstacles.stream().map(obstacleNormalizer::normalize).toList();
    }

    public Page<Obstacle> getAllObstacles(Pageable pageable) {
        Page<Obstacle> obstacles = obstacleRepository.findAllSorted(pageable);
        obstacles.forEach(this::sortTasksInObstacle);
        List<Obstacle> modifiedList = obstacles.getContent().stream().map(obstacleNormalizer::normalize).toList();
        return new PageImpl<>(modifiedList, pageable, obstacles.getTotalElements());
    }

    public Obstacle getObstacleById(Long obstacleId) {
        Obstacle obstacle = obstacleRepository.findById(obstacleId).orElseThrow(() -> new EntityNotFoundException("Obstacle not found with id: " + obstacleId));
        sortTasksInObstacle(obstacle);

        if (SecurityUtils.isUserOwnerOrAdmin(obstacle.getUser().getId())) {
            return obstacleNormalizer.normalize(obstacle);
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
                .map(obstacleNormalizer::normalize)
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
                .map(obstacleNormalizer::normalize)
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
        return obstaclesByTask.stream().map(obstacleNormalizer::normalize).toList();
    }

    public Long getNumberOfObstaclesByStatus(ObstacleStatus status) {
        return obstacleRepository.countAllByStatus(status);
    }
}
