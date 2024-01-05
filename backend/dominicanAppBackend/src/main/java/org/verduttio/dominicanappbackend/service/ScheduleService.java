package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.dto.ScheduleDTO;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.Schedule;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.service.exception.ObstacleExistsException;
import org.verduttio.dominicanappbackend.service.exception.TaskNotFoundException;
import org.verduttio.dominicanappbackend.service.exception.UserNotFoundException;

import java.time.DayOfWeek;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final TaskService taskService;
    private final UserService userService;
    private final ObstacleService obstacleService;

    @Autowired
    public ScheduleService(ScheduleRepository scheduleRepository, TaskService taskService, UserService userService, ObstacleService obstacleService) {
        this.scheduleRepository = scheduleRepository;
        this.taskService = taskService;
        this.userService = userService;
        this.obstacleService = obstacleService;
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public Optional<Schedule> getScheduleById(Long scheduleId) {
        return scheduleRepository.findById(scheduleId);
    }

    public void saveSchedule(ScheduleDTO scheduleDTO) {
        validateSchedule(scheduleDTO);

        Schedule schedule = scheduleDTO.toSchedule();
        scheduleRepository.save(schedule);
    }

    public void updateSchedule(Long scheduleId, ScheduleDTO updatedScheduleDTO) {
        validateSchedule(updatedScheduleDTO);

        Schedule schedule = updatedScheduleDTO.toSchedule();
        schedule.setId(scheduleId);
        scheduleRepository.save(schedule);
    }

    private void validateSchedule(ScheduleDTO scheduleDTO) {
        User user = userService.getUserById(scheduleDTO.getUserId()).orElse(null);
        if(user == null) {
            throw new UserNotFoundException("User with given id does not exist");
        }

        Task task = taskService.getTaskById(scheduleDTO.getTaskId()).orElse(null);
        if(task == null) {
            throw new TaskNotFoundException("Task with given id does not exist");
        }

        DayOfWeek scheduleDayOfWeek = scheduleDTO.getDate().getDayOfWeek();
        Set<DayOfWeek> taskDaysOfWeek = task.getDaysOfWeek();
        if(!taskDaysOfWeek.contains(scheduleDayOfWeek)) {
            throw new IllegalArgumentException("Task does not occur on given day of week: " + scheduleDayOfWeek.toString());
        }

        if(!userHasAllowedRoleForTask(user, task)) {
            throw new IllegalArgumentException("User does not have allowed role for task");
        }

        if(!obstacleService.findApprovedObstaclesByUserIdAndTaskIdForDate(user.getId(), task.getId(), scheduleDTO.getDate()).isEmpty()) {
            throw new ObstacleExistsException("User has an approved obstacle for this task");
        }
    }

    public void deleteSchedule(Long scheduleId) {
        scheduleRepository.deleteById(scheduleId);
    }

    public boolean existsById(Long scheduleId) {
        return scheduleRepository.existsById(scheduleId);
    }

    protected boolean userHasAllowedRoleForTask(User user, Task task) {
        Set<String> userRoleNames = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        Set<String> allowedRoleNames = task.getAllowedRoles().stream().map(Role::getName).collect(Collectors.toSet());

        return !Collections.disjoint(userRoleNames, allowedRoleNames);
    }


}
