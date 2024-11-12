package org.verduttio.dominicanappbackend.service.schedule;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.verduttio.dominicanappbackend.domain.Schedule;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.domain.User;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.service.TaskService;
import org.verduttio.dominicanappbackend.service.UserService;

import java.time.LocalDate;
import java.util.List;

@Component
public class KitchenStyleScheduleGenerator implements ScheduleGenerator {
    private final ScheduleRepository scheduleRepository;
    private final UserService userService;
    private final TaskService taskService;

    public KitchenStyleScheduleGenerator(ScheduleRepository scheduleRepository, UserService userService, TaskService taskService) {
        this.scheduleRepository = scheduleRepository;
        this.userService = userService;
        this.taskService = taskService;
    }

    @Override
    public void generateSchedule(Long roleId, Long startingFromUserId, LocalDate startDate, LocalDate endDate) {
        System.out.println("Generating schedule for role: " + roleId + " starting from user: " + startingFromUserId + " from: " + startDate + " to: " + endDate);
        List<Task> roleTasks = taskService.findTasksBySupervisorRoleId(roleId);
        List<User> eligibleUsers = userService.getUsersWhichAreEligibleToPerformTasksAssignedToSupervisorRole(roleId);

        int userIndex = eligibleUsers.stream().filter(user -> user.getId().equals(startingFromUserId)).findFirst().map(eligibleUsers::indexOf).orElseThrow(EntityNotFoundException::new);
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDate taskDate = date;
            for (Task roleTask : roleTasks) {
                Schedule schedule = new Schedule();
                schedule.setDate(taskDate);
                schedule.setTask(roleTask);
                schedule.setUser(eligibleUsers.get(userIndex));
                System.out.println("Generated schedule: " + schedule);
                scheduleRepository.save(schedule);

                taskDate = taskDate.plusDays(1);
            }
            userIndex = (userIndex + 1) % eligibleUsers.size();
        }
    }
}
