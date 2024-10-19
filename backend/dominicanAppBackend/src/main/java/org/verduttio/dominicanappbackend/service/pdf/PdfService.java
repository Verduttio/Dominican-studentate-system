package org.verduttio.dominicanappbackend.service.pdf;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.service.ScheduleService;
import org.verduttio.dominicanappbackend.service.pdf.generators.DaySchedulePdfGenerator;
import org.verduttio.dominicanappbackend.service.pdf.generators.PdfGenerator;
import org.verduttio.dominicanappbackend.service.pdf.generators.TaskSchedulePdfGenerator;
import org.verduttio.dominicanappbackend.service.pdf.generators.UserSchedulePdfGenerator;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;


@Service
public class PdfService {

    private final ScheduleService scheduleService;

    @Autowired
    public PdfService(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
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
}

