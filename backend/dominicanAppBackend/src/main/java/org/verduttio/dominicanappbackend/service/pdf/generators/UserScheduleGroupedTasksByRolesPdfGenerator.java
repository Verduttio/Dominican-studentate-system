package org.verduttio.dominicanappbackend.service.pdf.generators;

import be.quodlibet.boxable.BaseTable;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.verduttio.dominicanappbackend.dto.schedule.GroupedTasksByRolesInScheduleInfoForUser;
import org.verduttio.dominicanappbackend.domain.Role;
import org.verduttio.dominicanappbackend.service.schedule.ScheduleService;
import org.verduttio.dominicanappbackend.service.pdf.builders.GroupedTasksTableBuilder;
import org.verduttio.dominicanappbackend.util.DateUtils;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Stream;

public class UserScheduleGroupedTasksByRolesPdfGenerator extends AbstractPdfGenerator{
    private final LocalDate from;
    private final LocalDate to;
    private final List<Role> rolesVisibleInPrints;

    public UserScheduleGroupedTasksByRolesPdfGenerator(ScheduleService scheduleService, LocalDate from, LocalDate to, List<Role> rolesVisibleInPrints) {
        super(scheduleService);
        this.from = from;
        this.to = to;
        this.rolesVisibleInPrints = rolesVisibleInPrints;
    }

    @Override
    public byte[] generatePdf() throws IOException {
        validateDateRange(from, to);
        List<GroupedTasksByRolesInScheduleInfoForUser> schedules =
                scheduleService.getGroupedTasksByRolesInScheduleInfoForAllowedUsersForSpecifiedWeek(from, to);

        initializeDocument();
        PDPage page = addNewPage(PDRectangle.A4);
        float startY = addTitle(page, getTitle());
        BaseTable table = initializeTable(page, startY);

        populateTable(table, schedules);

        return finalizeDocument();
    }

    private String getTitle() {
        return "Oficja od " +
                from.format(DateUtils.getPlDateFormatter()) +
                " do " +
                to.format(DateUtils.getPlDateFormatter());
    }

    private void populateTable(BaseTable table, List<GroupedTasksByRolesInScheduleInfoForUser> groupedByTasksSchedules) throws IOException {
        GroupedTasksTableBuilder tableBuilder = new GroupedTasksTableBuilder(table, font);
        String[] headers = createHeaderRow();
        tableBuilder.addHeaderRow(headers);

        groupedByTasksSchedules.forEach(groupedSchedule -> {
            String fullName = groupedSchedule.userName() + " " + groupedSchedule.userSurname();
            String[] row = createDataRow(fullName, groupedSchedule);
            tableBuilder.addRow(row);
        });

        table.draw();
    }


    private String createTasksString(List<String> tasks) {
        if (tasks != null) {
            return String.join(", ", tasks);
        } else {
            return "";
        }
    }

    private String[] createHeaderRow() {
        return Stream.concat(
                Stream.of("Brat"),
                rolesVisibleInPrints.stream()
                        .map(Role::getAssignedTasksGroupName)
        ).toArray(String[]::new);
    }

    private String[] createDataRow(String fullName, GroupedTasksByRolesInScheduleInfoForUser groupedSchedule) {
        List<String> taskGroups = rolesVisibleInPrints.stream()
                .map(role -> createTasksString(groupedSchedule.groupedTasksInfoStrings().get(role.getName())))
                .toList();

        return Stream.concat(
                Stream.of(fullName),
                taskGroups.stream()
        ).toArray(String[]::new);
    }


}
