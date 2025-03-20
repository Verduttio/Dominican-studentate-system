package org.verduttio.dominicanappbackend.service.pdf.generators;


import be.quodlibet.boxable.BaseTable;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.verduttio.dominicanappbackend.dto.schedule.ScheduleShortInfoForTask;
import org.verduttio.dominicanappbackend.service.schedule.ScheduleService;
import org.verduttio.dominicanappbackend.service.pdf.builders.TaskTableBuilder;
import org.verduttio.dominicanappbackend.util.DateUtils;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TaskSchedulePdfGenerator extends AbstractPdfGenerator {

    private final LocalDate from;
    private final LocalDate to;
    private final List<String> roleNames;

    public TaskSchedulePdfGenerator(ScheduleService scheduleService, LocalDate from, LocalDate to, List<String> roleNames) {
        super(scheduleService);
        this.from = from;
        this.to = to;
        this.roleNames = roleNames;
    }

    @Override
    public byte[] generatePdf() throws IOException {
        validateDateRange(from, to);
        List<ScheduleShortInfoForTask> schedules;

        if (roleNames == null || roleNames.isEmpty()) {
            // Get schedule for all tasks
            schedules = scheduleService.getScheduleShortInfoForEachTaskForSpecifiedWeek(from, to);
        } else {
            // Get schedule for tasks assigned to specified roles
            schedules = new ArrayList<>();
            for (String roleName : roleNames) {
                schedules.addAll(scheduleService.getScheduleShortInfoForTaskByRoleForSpecifiedWeek(roleName, from, to));
            }
        }

        initializeDocument();
        PDPage page = addNewPage(PDRectangle.A4);
        float startY = addTitle(page, getTitle());
        BaseTable table = initializeTable(page, startY);

        populateTable(table, schedules);

        return finalizeDocument();
    }

    private String getTitle() {
        String prefix;
        if (roleNames != null && roleNames.size() == 1) {
            prefix = roleNames.getFirst();
        } else {
            prefix = "Oficja";
        }

        return prefix + " od  " +
                from.format(DateUtils.getPlDateFormatter()) +
                " do " +
                to.format(DateUtils.getPlDateFormatter());
    }

    private void populateTable(BaseTable table, List<ScheduleShortInfoForTask> schedules) throws IOException {
        TaskTableBuilder tableBuilder = new TaskTableBuilder(table, font);
        tableBuilder.buildTable(schedules);
    }
}

