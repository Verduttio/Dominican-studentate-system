package org.verduttio.dominicanappbackend.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.dto.obstacle.ObstaclePatchDTO;
import org.verduttio.dominicanappbackend.dto.obstacle.ObstacleRequestDTO;
import org.verduttio.dominicanappbackend.domain.obstacle.Obstacle;
import org.verduttio.dominicanappbackend.domain.ObstacleStatus;
import org.verduttio.dominicanappbackend.security.UserDetailsImpl;
import org.verduttio.dominicanappbackend.service.ObstacleService;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api/obstacles")
public class ObstacleController {

    private final ObstacleService obstacleService;

    @Autowired
    public ObstacleController(ObstacleService obstacleService) {
        this.obstacleService = obstacleService;
    }

    @GetMapping("/pageable")
    public ResponseEntity<Page<Obstacle>> getAllObstacles(Pageable pageable) {
        Page<Obstacle> obstacles = obstacleService.getAllObstacles(pageable);
        return new ResponseEntity<>(obstacles, HttpStatus.OK);
    }

    @GetMapping("/{obstacleId}")
    public ResponseEntity<Obstacle> getObstacleById(@PathVariable Long obstacleId) {
        try {
            return new ResponseEntity<>(obstacleService.getObstacleById(obstacleId), HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAllObstaclesByUserId(@PathVariable Long userId) {
        List<Obstacle> obstacles;
        try {
            obstacles = obstacleService.getAllObstaclesByUserId(userId);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(obstacles, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}/pageable")
    public ResponseEntity<?> getAllObstaclesByUserId(
            @PathVariable Long userId,
            Pageable pageable) {
        Page<Obstacle> obstacles;
        try {
            obstacles = obstacleService.getAllObstaclesByUserId(userId, pageable);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(obstacles, HttpStatus.OK);
    }

    @GetMapping("/users/current")
    public ResponseEntity<?> getAllObstaclesByCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getUser().getId();

        List<Obstacle> obstacles;
        try {
            obstacles = obstacleService.getAllObstaclesByUserId(userId);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(obstacles, HttpStatus.OK);
    }

    @GetMapping("/users/current/pageable")
    public ResponseEntity<?> getAllObstaclesByCurrentUser(Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getUser().getId();

        Page<Obstacle> obstacles;
        try {
            obstacles = obstacleService.getAllObstaclesByUserId(userId, pageable);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(obstacles, HttpStatus.OK);
    }

    @GetMapping("/{status}/count")
    public ResponseEntity<?> getNumberOfObstaclesByStatus(@PathVariable ObstacleStatus status) {
        Long numberOfNotAnsweredObstacles = obstacleService.getNumberOfObstaclesByStatus(status);
        return new ResponseEntity<>(numberOfNotAnsweredObstacles, HttpStatus.OK);
    }

    @PostMapping("/users/current")
    public ResponseEntity<?> createObstacleForCurrentUser(@Valid @RequestBody ObstacleRequestDTO obstacleRequestDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getUser().getId();
        obstacleRequestDTO.setUserId(userId);

        try {
            obstacleService.saveObstacle(obstacleRequestDTO);
        } catch (EntityNotFoundException e ) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PostMapping
    public ResponseEntity<?> createObstacle(@Valid @RequestBody ObstacleRequestDTO obstacleRequestDTO) {
        try {
            obstacleService.saveObstacle(obstacleRequestDTO);
        } catch (EntityNotFoundException e ) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PatchMapping("/{obstacleId}")
    public ResponseEntity<?> updateObstacle(
            @PathVariable Long obstacleId,
            @Valid @RequestBody ObstaclePatchDTO obstaclePatchDTO) {
        try {
            obstacleService.patchObstacle(obstacleId, obstaclePatchDTO);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/{obstacleId}")
    public ResponseEntity<Void> deleteObstacle(@PathVariable Long obstacleId) {
        try{
            obstacleService.deleteObstacle(obstacleId);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (AccessDeniedException e) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
