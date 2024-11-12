package org.verduttio.dominicanappbackend.service.schedule;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.verduttio.dominicanappbackend.domain.Schedule;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.service.TaskService;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class KitchenStyleScheduleCleaner implements ScheduleCleaner{
    private final ScheduleRepository scheduleRepository;
    private final TaskService taskService;
    private static final Logger logger = LoggerFactory.getLogger(KitchenStyleScheduleCleaner.class);

    public KitchenStyleScheduleCleaner(ScheduleRepository scheduleRepository, TaskService taskService) {
        this.scheduleRepository = scheduleRepository;
        this.taskService = taskService;
    }

    @Override
    public void cleanSchedule(Long roleId, LocalDate startDate, LocalDate endDate) {
        logger.info("Cleaning schedule for supervisor role ID: {}, from: {} to: {}",
                roleId, startDate, endDate);
        List<Task> roleTasks = taskService.findTasksBySupervisorRoleId(roleId);

        List<Schedule> schedules = new ArrayList<>();
        for (int i = 0; i < roleTasks.size(); i++) {
            schedules.addAll(scheduleRepository.findByTaskIdAndDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(roleTasks.get(i).getId(), startDate.plusDays(i), endDate.plusDays(i)));
        }

        logger.debug("Removing schedules: {}", schedules);
        scheduleRepository.deleteAll(schedules);
    }
}
