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
import java.util.List;

public class SpecialEventDailyPdfGenerator extends AbstractPdfGenerator {

    private final Long eventId;
    private final String roleName;
    private final LocalDate date;

    public SpecialEventDailyPdfGenerator(ScheduleService scheduleService, Long eventId, String roleName, LocalDate date) {
        super(scheduleService);
        this.eventId = eventId;
        this.roleName = roleName;
        this.date = date;
    }

    private String getTitle() {
        // Przykładowy format: "Liturgista - 14.04.2026"
        return roleName + " - " + date.format(DateUtils.getPlDateFormatter());
    }

    @Override
    public byte[] generatePdf() throws IOException {
        // Pobieramy pogrupowaną mapę z naszego nowego serwisu
        java.util.LinkedHashMap<String, List<ScheduleShortInfoForTask>> sectionedSchedules =
                scheduleService.getScheduleShortInfoForTaskForSpecialEventDayWithSections(eventId, roleName, date);

        initializeDocument();
        PDPage page = addNewPage(PDRectangle.A4);

        float startY = addTitle(page, getTitle());
        BaseTable table = initializeTable(page, startY);

        populateTable(table, sectionedSchedules);

        return finalizeDocument();
    }

    private void populateTable(BaseTable table, java.util.LinkedHashMap<String, List<ScheduleShortInfoForTask>> sectionedSchedules) throws IOException {
        TaskTableBuilder tableBuilder = new TaskTableBuilder(table, font);
        // Wywołujemy naszą NOWĄ metodę z Builder'a!
        tableBuilder.buildTableWithSections(sectionedSchedules);
    }
}