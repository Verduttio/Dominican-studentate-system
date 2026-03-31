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
import java.util.Map;

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
        return roleName + " - " + date.format(DateUtils.getPlDateFormatter());
    }

    @Override
    public byte[] generatePdf() throws IOException {
        // 1. Pobieramy zadania z podziałem na sekcje
        java.util.LinkedHashMap<String, List<ScheduleShortInfoForTask>> sectionedSchedules =
                scheduleService.getScheduleShortInfoForTaskForSpecialEventDayWithSections(eventId, roleName, date);

        // 2. NOWOŚĆ: Pobieramy mapę komentarzy (klucz: nazwa pory dnia, lub "" dla całego dnia)
        Map<String, String> comments = scheduleService.getCommentsForSpecialEventDay(eventId, roleName, date);

        initializeDocument();
        PDPage page = addNewPage(PDRectangle.A4);

        float startY = addTitle(page, getTitle());
        BaseTable table = initializeTable(page, startY);

        // Przekazujemy zadania i komentarze do renderowania
        populateTable(table, sectionedSchedules, comments);

        return finalizeDocument();
    }

    private void populateTable(BaseTable table, java.util.LinkedHashMap<String, List<ScheduleShortInfoForTask>> sectionedSchedules, Map<String, String> comments) throws IOException {
        TaskTableBuilder tableBuilder = new TaskTableBuilder(table, font);

        // Wywołujemy naszą wczorajszą zaktualizowaną metodę, która umie rysować "żółte karteczki"
        tableBuilder.buildTableWithSections(sectionedSchedules, comments);
    }
}