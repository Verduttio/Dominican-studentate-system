package org.verduttio.dominicanappbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.dto.ObstaclePatchDTO;
import org.verduttio.dominicanappbackend.dto.ObstacleRequestDTO;
import org.verduttio.dominicanappbackend.entity.Obstacle;
import org.verduttio.dominicanappbackend.service.ObstacleService;
import org.verduttio.dominicanappbackend.service.exception.ObstacleNotFoundException;
import org.verduttio.dominicanappbackend.service.exception.TaskNotFoundException;
import org.verduttio.dominicanappbackend.service.exception.UserNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api/obstacles")
public class ObstacleController {

    private final ObstacleService obstacleService;

    @Autowired
    public ObstacleController(ObstacleService obstacleService) {
        this.obstacleService = obstacleService;
    }

    @GetMapping
    public ResponseEntity<List<Obstacle>> getAllObstacles() {
        List<Obstacle> obstacles = obstacleService.getAllObstacles();
        return new ResponseEntity<>(obstacles, HttpStatus.OK);
    }

    @GetMapping("/{obstacleId}")
    public ResponseEntity<Obstacle> getObstacleById(@PathVariable Long obstacleId) {
        return obstacleService.getObstacleById(obstacleId)
                .map(obstacle -> new ResponseEntity<>(obstacle, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<?> createObstacle(@RequestBody ObstacleRequestDTO obstacleRequestDTO) {
        try {
            obstacleService.saveObstacle(obstacleRequestDTO);
        } catch (TaskNotFoundException | UserNotFoundException | IllegalArgumentException e ) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY);
        }

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PatchMapping("/{obstacleId}")
    public ResponseEntity<?> updateObstacle(
            @PathVariable Long obstacleId,
            @RequestBody ObstaclePatchDTO obstaclePatchDTO) {
        try {
            obstacleService.patchObstacle(obstacleId, obstaclePatchDTO);
        } catch (ObstacleNotFoundException | UserNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/{obstacleId}")
    public ResponseEntity<Void> deleteObstacle(@PathVariable Long obstacleId) {
        obstacleService.deleteObstacle(obstacleId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}