package org.verduttio.dominicanappbackend.service.pdf.generators;

import be.quodlibet.boxable.BaseTable;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.verduttio.dominicanappbackend.domain.SpecialEvent;
import org.verduttio.dominicanappbackend.domain.obstacle.Obstacle;
import org.verduttio.dominicanappbackend.service.ObstacleService;
import org.verduttio.dominicanappbackend.service.schedule.ScheduleService;
import org.verduttio.dominicanappbackend.service.pdf.builders.DayTableBuilder;
import org.verduttio.dominicanappbackend.util.DateUtils;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public class SpecialEventMatrixPdfGenerator extends AbstractPdfGenerator {

    private final SpecialEvent event;
    private final Optional<String> supervisorRoleName;
    private final List<Obstacle> eventObstacles;
    private static final int DAYS_PER_PAGE = 3;

    public SpecialEventMatrixPdfGenerator(
            ScheduleService scheduleService,
            SpecialEvent event,
            String supervisorRoleName,
            List<Obstacle> eventObstacles) {
        super(scheduleService);
        this.event = event;
        this.supervisorRoleName = Optional.ofNullable(supervisorRoleName);
        this.eventObstacles = eventObstacles != null ? eventObstacles : java.util.Collections.emptyList();
    }

    @Override
    public byte[] generatePdf() throws IOException {
        List<org.verduttio.dominicanappbackend.dto.user.UserSchedulesOnDaysWithSectionsDTO> userSchedules =
                scheduleService.getMatrixSchedulesWithSections(event.getId(), supervisorRoleName.orElse(null));

        java.util.Map<LocalDate, List<String>> activeSectionsMap = extractActiveSections(userSchedules, event.getStartDate(), event.getEndDate());

        initializeDocument();

        LocalDate currentStart = event.getStartDate();
        LocalDate eventEnd = event.getEndDate();

        while (!currentStart.isAfter(eventEnd)) {
            LocalDate currentEnd = currentStart.plusDays(DAYS_PER_PAGE - 1);
            if (currentEnd.isAfter(eventEnd)) {
                currentEnd = eventEnd;
            }

            PDPage page = addNewPage(new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth()));
            float startY = addTitle(page, getPageTitle(currentStart, currentEnd));
            BaseTable table = initializeTable(page, startY);

            // Wywołujemy populateTable, przekazując listę przeszkód, którą mamy w pamięci klasy
            populateTable(table, userSchedules, activeSectionsMap, currentStart, currentEnd);

            currentStart = currentStart.plusDays(DAYS_PER_PAGE);
        }

        return finalizeDocument();
    }

    private void populateTable(BaseTable table,
                               List<org.verduttio.dominicanappbackend.dto.user.UserSchedulesOnDaysWithSectionsDTO> userSchedules,
                               java.util.Map<LocalDate, List<String>> activeSectionsMap,
                               LocalDate chunkStart,
                               LocalDate chunkEnd) throws IOException {
        DayTableBuilder tableBuilder = new DayTableBuilder(table, font, chunkStart, chunkEnd);
        // Przekazujemy naszą listę eventObstacles do buildera!
        tableBuilder.buildTableWithSections(userSchedules, activeSectionsMap, this.eventObstacles);
    }

    // --- METODA POMOCNICZA ---
    private java.util.Map<LocalDate, List<String>> extractActiveSections(
            List<org.verduttio.dominicanappbackend.dto.user.UserSchedulesOnDaysWithSectionsDTO> dtos,
            LocalDate from, LocalDate to) {

        List<String> orderedSectionNames = scheduleService.getAllTaskSections().stream()
                .map(org.verduttio.dominicanappbackend.domain.TaskSection::getName)
                .toList();

        java.util.Map<LocalDate, java.util.Set<String>> active = new java.util.HashMap<>();
        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            active.put(date, new java.util.HashSet<>());
        }

        for (org.verduttio.dominicanappbackend.dto.user.UserSchedulesOnDaysWithSectionsDTO dto : dtos) {
            for (java.util.Map.Entry<LocalDate, java.util.Map<String, List<String>>> entry : dto.getSchedules().entrySet()) {
                if (active.containsKey(entry.getKey())) {
                    active.get(entry.getKey()).addAll(entry.getValue().keySet());
                }
            }
        }

        java.util.Map<LocalDate, List<String>> result = new java.util.HashMap<>();
        for (java.util.Map.Entry<LocalDate, java.util.Set<String>> entry : active.entrySet()) {
            List<String> list = new java.util.ArrayList<>(entry.getValue());

            list.sort((a, b) -> {
                if(a.isEmpty()) return -1;
                if(b.isEmpty()) return 1;

                int indexA = orderedSectionNames.indexOf(a);
                int indexB = orderedSectionNames.indexOf(b);

                if (indexA == -1) indexA = 999;
                if (indexB == -1) indexB = 999;

                return Integer.compare(indexA, indexB);
            });

            if (list.isEmpty()) list.add("");
            result.put(entry.getKey(), list);
        }
        return result;
    }

    // Zmodyfikowany tytuł – zamiast brać daty z `event`, bierze daty przekazane dla danej strony
    private String getPageTitle(LocalDate pageStart, LocalDate pageEnd) {
        String roleStr = supervisorRoleName.map(role -> " (" + role + ")").orElse("");
        return "Harmonogram: " + event.getName() + roleStr + " (" +
                pageStart.format(DateUtils.getPlDateFormatter()) +
                " - " +
                pageEnd.format(DateUtils.getPlDateFormatter()) + ")";
    }
}