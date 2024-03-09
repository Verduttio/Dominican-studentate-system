package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.dto.obstacle.ObstaclePatchDTO;
import org.verduttio.dominicanappbackend.dto.obstacle.ObstacleRequestDTO;
import org.verduttio.dominicanappbackend.entity.Obstacle;
import org.verduttio.dominicanappbackend.entity.ObstacleStatus;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.repository.ObstacleRepository;
import org.verduttio.dominicanappbackend.security.UserDetailsImpl;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.validation.ObstacleValidator;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ObstacleService {

    private final ObstacleRepository obstacleRepository;
    private final UserService userService;
    private final ObstacleValidator obstacleValidator;

    @Autowired
    public ObstacleService(ObstacleRepository obstacleRepository, UserService userService,
                           ObstacleValidator obstacleValidator) {
        this.obstacleRepository = obstacleRepository;
        this.userService = userService;
        this.obstacleValidator = obstacleValidator;
    }

    public List<Obstacle> getAllObstacles() {
        List<Obstacle> allObstacles = obstacleRepository.findAll();

        List<Obstacle> futureObstacles = allObstacles.stream()
                .filter(obstacle -> obstacle.getFromDate().isAfter(LocalDate.now()))
                .sorted(Comparator.comparing(Obstacle::getFromDate).thenComparing(Obstacle::getToDate).reversed())
                .collect(Collectors.toList());
        List<Obstacle> pastObstacles = allObstacles.stream()
                .filter(obstacle -> obstacle.getFromDate().isBefore(LocalDate.now()) || obstacle.getFromDate().isEqual(LocalDate.now()))
                .sorted(Comparator.comparing(Obstacle::getToDate).reversed())
                .toList();
        futureObstacles.addAll(pastObstacles);

        return futureObstacles;
    }

    public Optional<Obstacle> getObstacleById(Long obstacleId) {
        return obstacleRepository.findById(obstacleId);
    }

    public void saveObstacle(ObstacleRequestDTO obstacleRequestDTO) {
        obstacleValidator.validateObstacleRequestDTO(obstacleRequestDTO);
        obstacleValidator.ensureFromDateNotAfterToDate(obstacleRequestDTO.getFromDate(), obstacleRequestDTO.getToDate());

        Obstacle obstacle = obstacleRequestDTO.toObstacle();
        obstacleRepository.save(obstacle);
    }

    public void saveObstacle(Obstacle obstacle) {
        obstacleRepository.save(obstacle);
    }

    public void patchObstacle(Long obstacleId, ObstaclePatchDTO obstaclePatchDTO) {
        Obstacle obstacle = obstacleRepository.findById(obstacleId)
                .orElseThrow(() -> new EntityNotFoundException("Obstacle not found with id: " + obstacleId));

        obstacleValidator.validateObstaclePatchDTO(obstaclePatchDTO);
        updateObstacleFromPatchDTO(obstacle, obstaclePatchDTO);

        obstacleRepository.save(obstacle);
    }


    public void deleteObstacle(Long obstacleId) {
        if(!obstacleRepository.existsById(obstacleId)) {
            throw new EntityNotFoundException("Obstacle not found with id: " + obstacleId);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User currentUser = userDetails.getUser();

        Obstacle obstacle = obstacleRepository.findById(obstacleId).orElseThrow(() -> new EntityNotFoundException("Obstacle not found with id: " + obstacleId));

        if (currentUser.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_FUNKCYJNY"))
            || currentUser.getId().equals(obstacle.getUser().getId())) {
            obstacleRepository.deleteById(obstacleId);
        } else {
            throw new AccessDeniedException("You are not allowed to delete this obstacle");
        }

        obstacleRepository.deleteById(obstacleId);
    }

    public List<Obstacle> findObstaclesByUserIdAndTaskId(Long userId, Long taskId) {
        return obstacleRepository.findObstaclesByUserIdAndTaskId(userId, taskId);
    }

    public List<Obstacle> findApprovedObstaclesByUserIdAndTaskIdForDate(Long userId, Long taskId, LocalDate date) {
        List<Obstacle> userObstaclesForGivenTask = obstacleRepository.findObstaclesByUserIdAndTaskId(userId, taskId);
        List<Obstacle> currentUserObstaclesForGivenTask = userObstaclesForGivenTask.stream().filter(obstacle -> obstacleValidator.isDateInRange(date, obstacle.getFromDate(), obstacle.getToDate())).toList();
        return currentUserObstaclesForGivenTask.stream().filter(obstacle -> obstacle.getStatus() == ObstacleStatus.APPROVED).toList();
    }

    public List<Obstacle> getAllObstaclesByUserId(Long userId) {
        if (!userService.existsById(userId)) {
            throw new EntityNotFoundException("User with id " + userId + " does not exist");
        }
        List<Obstacle> allObstacles = obstacleRepository.findAllByUserId(userId);
        List<Obstacle> futureObstacles = allObstacles.stream()
                .filter(obstacle -> obstacle.getFromDate().isAfter(LocalDate.now()))
                .sorted(Comparator.comparing(Obstacle::getFromDate).thenComparing(Obstacle::getToDate).reversed())
                .collect(Collectors.toList());
        List<Obstacle> pastObstacles = allObstacles.stream()
                .filter(obstacle -> obstacle.getFromDate().isBefore(LocalDate.now()) || obstacle.getFromDate().isEqual(LocalDate.now()))
                .sorted(Comparator.comparing(Obstacle::getToDate).reversed())
                .toList();
        futureObstacles.addAll(pastObstacles);
        return futureObstacles;
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
        return obstacleRepository.findAllByTaskId(taskId);
    }

    public void deleteAllObstaclesByTaskId(Long taskId) {
        obstacleRepository.deleteAllByTaskId(taskId);
    }

    public List<Obstacle> findAllByTaskId(Long taskId) {
        return obstacleRepository.findAllByTaskId(taskId);
    }

    public Long getNumberOfObstaclesByStatus(ObstacleStatus status) {
        return obstacleRepository.countAllByStatus(status);
    }
}
