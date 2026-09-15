package org.verduttio.dominicanappbackend.service.pdf;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.domain.Role;
import org.verduttio.dominicanappbackend.domain.SpecialEvent;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.repository.SpecialEventRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.service.ObstacleService;
import org.verduttio.dominicanappbackend.service.RoleService;
import org.verduttio.dominicanappbackend.service.TaskService;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.service.schedule.ScheduleService;
import org.verduttio.dominicanappbackend.service.pdf.generators.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;


@Service
public class PdfService {

    private final ScheduleService scheduleService;
    private final RoleService roleService;
    private final SpecialEventRepository specialEventRepository;
    private final TaskService taskService;
    private final TaskRepository taskRepository;
    private final ObstacleService obstacleService;

    @Autowired
    public PdfService(ScheduleService scheduleService, RoleService roleService, SpecialEventRepository specialEventRepository, TaskService taskService, TaskRepository taskRepository, ObstacleService obstacleService) {
        this.scheduleService = scheduleService;
        this.roleService = roleService;
        this.specialEventRepository = specialEventRepository;
        this.taskService = taskService;
        this.taskRepository = taskRepository;
        this.obstacleService = obstacleService;
    }

    public byte[] generateSchedulePdfForUsers(LocalDate from, LocalDate to) throws IOException {
        PdfGenerator generator = new UserSchedulePdfGenerator(scheduleService, from, to);
        return generator.generatePdf();
    }

    public byte[] generateSchedulePdfForTasksBySupervisorRole(String roleName, LocalDate from, LocalDate to) throws IOException {
        PdfGenerator generator = new TaskSchedulePdfGenerator(scheduleService, from, to, Collections.singletonList(roleName));
        return generator.generatePdf();
    }

    public byte[] generateSchedulePdfForTasksBySupervisorRoles(List<String> roleNames, LocalDate from, LocalDate to) throws IOException {
        PdfGenerator generator = new TaskSchedulePdfGenerator(scheduleService, from, to, roleNames);
        return generator.generatePdf();
    }

    public byte[] generateSchedulePdfForTasks(LocalDate from, LocalDate to) throws IOException {
        // Because we generate schedule for all tasks, we pass null as roleNames
        PdfGenerator generator = new TaskSchedulePdfGenerator(scheduleService, from, to, null);
        return generator.generatePdf();
    }

    public byte[] generateSchedulePdfForUsersByDays(LocalDate from, LocalDate to) throws IOException {
        PdfGenerator generator = new DaySchedulePdfGenerator(scheduleService, from, to, null);
        return generator.generatePdf();
    }

    public byte[] generateSchedulePdfForUsersBySupervisorRoleByDays(String supervisorRoleName, LocalDate from, LocalDate to) throws IOException {
        PdfGenerator generator = new DaySchedulePdfGenerator(scheduleService, from, to, supervisorRoleName);
        return generator.generatePdf();
    }

    public byte[] generateSchedulePdfForUsersGroupedTasksByRoles(LocalDate from, LocalDate to) throws IOException {
        List<Role> visibleRoles = roleService.getRolesByAreTasksVisibleInPrints(true);

        PdfGenerator generator = new UserScheduleGroupedTasksByRolesPdfGenerator(scheduleService, from, to, visibleRoles);
        return generator.generatePdf();
    }

    // --- SPECIAL EVENTS PDF METHODS ---

    public byte[] generateSchedulePdfForSpecialEventMatrix(Long eventId, String roleName) throws IOException {
        SpecialEvent event = specialEventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Special Event not found"));

        // 1. Pobieramy listę ZATWIERDZONYCH przeszkód dla dat trwania tego wydarzenia
        // Zwróć uwagę na import z domeny obstacle, jeśli IDE o niego poprosi!
        List<org.verduttio.dominicanappbackend.domain.obstacle.Obstacle> eventObstacles =
                obstacleService.getApprovedObstaclesForDateRange(event.getStartDate(), event.getEndDate());

        // 2. Tworzymy nasz nowy generator, przekazując mu na końcu pobraną listę przeszkód
        PdfGenerator generator = new SpecialEventMatrixPdfGenerator(scheduleService, event, roleName, eventObstacles);

        return generator.generatePdf();
    }

    public byte[] generateSchedulePdfForSpecialEventDaily(Long eventId, String roleName, LocalDate date) throws IOException {
        // Zrobimy nowy generator: SpecialEventDailyPdfGenerator, który pod spodem zadziała jak TaskSchedulePdfGenerator
        PdfGenerator generator = new SpecialEventDailyPdfGenerator(scheduleService, eventId, roleName, date);
        return generator.generatePdf();
    }

    public byte[] generateSchedulePdfForSpecialEventTaskDescriptions(Long eventId, String roleName) throws IOException {
        SpecialEvent event = specialEventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Special Event not found"));

        // Pobieramy WSZYSTKIE zadania i filtrujemy tylko te z naszego Special Eventu
        List<Task> specialTasks = taskRepository.findAllBySpecialEventId(eventId);

        // Jeśli roleName zostało przekazane w URL, filtrujemy listę
        if (roleName != null && !roleName.trim().isEmpty()) {
            specialTasks = specialTasks.stream()
                    .filter(task -> task.getSupervisorRole() != null &&
                            task.getSupervisorRole().getName().equals(roleName))
                    .toList();
        }

        PdfGenerator generator = new SpecialEventTaskDescriptionPdfGenerator(scheduleService, event, specialTasks);
        return generator.generatePdf();
    }
}

