package org.verduttio.dominicanappbackend.service.pdf.generators;


import be.quodlibet.boxable.BaseTable;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.verduttio.dominicanappbackend.dto.schedule.ScheduleShortInfoForUser;
import org.verduttio.dominicanappbackend.service.schedule.ScheduleService;
import org.verduttio.dominicanappbackend.service.pdf.builders.TableBuilder;
import org.verduttio.dominicanappbackend.util.DateUtils;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

public class UserSchedulePdfGenerator extends AbstractPdfGenerator {

    private final LocalDate from;
    private final LocalDate to;

    public UserSchedulePdfGenerator(ScheduleService scheduleService, LocalDate from, LocalDate to) {
        super(scheduleService);
        this.from = from;
        this.to = to;
    }

    @Override
    public byte[] generatePdf() throws IOException {
        validateDateRange(from, to);
        List<ScheduleShortInfoForUser> schedules =
                scheduleService.getScheduleShortInfoForAllowedUsersForSpecifiedWeek(from, to);

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

    private void populateTable(BaseTable table, List<ScheduleShortInfoForUser> schedules) throws IOException {
        TableBuilder tableBuilder = new TableBuilder(table, font);
        tableBuilder.addHeaderRow("Imię i nazwisko", "Oficjum");

        for (ScheduleShortInfoForUser schedule : schedules) {
            String fullName = schedule.userName() + " " + schedule.userSurname();
            String tasks = String.join(", ", schedule.tasksInfoStrings());
            tableBuilder.addRow(fullName, tasks);
        }

        table.draw();
    }
}

