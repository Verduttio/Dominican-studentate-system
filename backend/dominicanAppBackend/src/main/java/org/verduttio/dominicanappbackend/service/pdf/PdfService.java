package org.verduttio.dominicanappbackend.service.pdf;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.domain.Role;
import org.verduttio.dominicanappbackend.repository.SpecialEventRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.service.RoleService;
import org.verduttio.dominicanappbackend.service.TaskService;
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

    @Autowired
    public PdfService(ScheduleService scheduleService, RoleService roleService, SpecialEventRepository specialEventRepository, TaskService taskService, TaskRepository taskRepository) {
        this.scheduleService = scheduleService;
        this.roleService = roleService;
        this.specialEventRepository = specialEventRepository;
        this.taskService = taskService;
        this.taskRepository = taskRepository;
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
        org.verduttio.dominicanappbackend.domain.SpecialEvent event = specialEventRepository.findById(eventId)
                .orElseThrow(() -> new org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException("Special Event not found"));

        // Zrobimy nowy generator: SpecialEventMatrixPdfGenerator, który pod spodem zadziała jak DaySchedulePdfGenerator
        PdfGenerator generator = new SpecialEventMatrixPdfGenerator(scheduleService, event, roleName);
        return generator.generatePdf();
    }

    public byte[] generateSchedulePdfForSpecialEventDaily(Long eventId, String roleName, LocalDate date) throws IOException {
        // Zrobimy nowy generator: SpecialEventDailyPdfGenerator, który pod spodem zadziała jak TaskSchedulePdfGenerator
        PdfGenerator generator = new SpecialEventDailyPdfGenerator(scheduleService, eventId, roleName, date);
        return generator.generatePdf();
    }

    public byte[] generateSchedulePdfForSpecialEventTaskDescriptions(Long eventId) throws IOException {
        org.verduttio.dominicanappbackend.domain.SpecialEvent event = specialEventRepository.findById(eventId)
                .orElseThrow(() -> new org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException("Special Event not found"));

        // Pobieramy WSZYSTKIE zadania i filtrujemy tylko te z naszego Special Eventu
        List<org.verduttio.dominicanappbackend.domain.Task> specialTasks = taskRepository.findAllBySpecialEventId(eventId);

        PdfGenerator generator = new SpecialEventTaskDescriptionPdfGenerator(scheduleService, event, specialTasks);
        return generator.generatePdf();
    }
}

