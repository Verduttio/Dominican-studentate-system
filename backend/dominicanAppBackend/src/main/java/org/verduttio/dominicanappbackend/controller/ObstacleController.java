package org.verduttio.dominicanappbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.dto.ObstacleRequestDTO;
import org.verduttio.dominicanappbackend.entity.Obstacle;
import org.verduttio.dominicanappbackend.service.ObstacleService;
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
        } catch (TaskNotFoundException | UserNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY);
        }

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

//    @PutMapping("/{obstacleId}")
//    public ResponseEntity<Obstacle> updateObstacle(@PathVariable Long obstacleId, @RequestBody Obstacle updatedObstacle) {
//        return obstacleService.getObstacleById(obstacleId)
//                .map(existingObstacle -> {
//                    existingObstacle.setUser(updatedObstacle.getUser());
//                    existingObstacle.setTask(updatedObstacle.getTask());
//                    existingObstacle.setFromDate(updatedObstacle.getFromDate());
//                    existingObstacle.setToDate(updatedObstacle.getToDate());
//                    existingObstacle.setApplicantDescription(updatedObstacle.getApplicantDescription());
//                    existingObstacle.setStatus(updatedObstacle.getStatus());
//                    existingObstacle.setRecipientAnswer(updatedObstacle.getRecipientAnswer());
//                    existingObstacle.setRecipientUser(updatedObstacle.getRecipientUser());
//
////                    obstacleService.saveObstacle(existingObstacle);
//                    return new ResponseEntity<>(existingObstacle, HttpStatus.OK);
//                })
//                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
//    }

    @DeleteMapping("/{obstacleId}")
    public ResponseEntity<Void> deleteObstacle(@PathVariable Long obstacleId) {
        obstacleService.deleteObstacle(obstacleId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
