package org.verduttio.dominicanappbackend.service.pdf.generators;

import be.quodlibet.boxable.BaseTable;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.verduttio.dominicanappbackend.domain.SpecialEvent;
import org.verduttio.dominicanappbackend.dto.user.UserSchedulesOnDaysDTO;
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

    public SpecialEventMatrixPdfGenerator(ScheduleService scheduleService, SpecialEvent event, String supervisorRoleName) {
        super(scheduleService);
        this.event = event;
        this.supervisorRoleName = Optional.ofNullable(supervisorRoleName);
    }

    @Override
    public byte[] generatePdf() throws IOException {
        // Używamy nowej metody z serwisu (zwraca DTO z podziałem na sekcje)
        List<org.verduttio.dominicanappbackend.dto.user.UserSchedulesOnDaysWithSectionsDTO> userSchedules =
                scheduleService.getMatrixSchedulesWithSections(event.getId(), supervisorRoleName.orElse(null));

        // Skanujemy dane, aby wiedzieć ile kolumn narysować w każdym dniu
        java.util.Map<LocalDate, List<String>> activeSectionsMap = extractActiveSections(userSchedules, event.getStartDate(), event.getEndDate());

        initializeDocument();
        PDPage page = addNewPage(new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth()));
        float startY = addTitle(page, getTitle());
        BaseTable table = initializeTable(page, startY);

        populateTable(table, userSchedules, activeSectionsMap);

        return finalizeDocument();
    }

    private void populateTable(BaseTable table,
                               List<org.verduttio.dominicanappbackend.dto.user.UserSchedulesOnDaysWithSectionsDTO> userSchedules,
                               java.util.Map<LocalDate, List<String>> activeSectionsMap) throws IOException {
        DayTableBuilder tableBuilder = new DayTableBuilder(table, font, event.getStartDate(), event.getEndDate());
        // Wywołujemy naszą NOWĄ metodę z Builder'a!
        tableBuilder.buildTableWithSections(userSchedules, activeSectionsMap);
    }

    // --- METODA POMOCNICZA ---
    private java.util.Map<LocalDate, List<String>> extractActiveSections(
            List<org.verduttio.dominicanappbackend.dto.user.UserSchedulesOnDaysWithSectionsDTO> dtos,
            LocalDate from, LocalDate to) {

        // 1. Pobieramy posortowaną listę pór dnia prosto z bazy (przez ScheduleService)
        List<String> orderedSectionNames = scheduleService.getAllTaskSections().stream()
                .map(org.verduttio.dominicanappbackend.domain.TaskSection::getName)
                .toList();

        java.util.Map<LocalDate, java.util.Set<String>> active = new java.util.HashMap<>();
        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            active.put(date, new java.util.HashSet<>());
        }

        // Zbieramy unikalne sekcje dla każdego dnia
        for (org.verduttio.dominicanappbackend.dto.user.UserSchedulesOnDaysWithSectionsDTO dto : dtos) {
            for (java.util.Map.Entry<LocalDate, java.util.Map<String, List<String>>> entry : dto.getSchedules().entrySet()) {
                if (active.containsKey(entry.getKey())) {
                    active.get(entry.getKey()).addAll(entry.getValue().keySet());
                }
            }
        }

        // Konwertujemy sety na posortowane listy
        java.util.Map<LocalDate, List<String>> result = new java.util.HashMap<>();
        for (java.util.Map.Entry<LocalDate, java.util.Set<String>> entry : active.entrySet()) {
            List<String> list = new java.util.ArrayList<>(entry.getValue());

            // Sortujemy używając indeksów z bazy danych!
            list.sort((a, b) -> {
                if(a.isEmpty()) return -1;
                if(b.isEmpty()) return 1;

                int indexA = orderedSectionNames.indexOf(a);
                int indexB = orderedSectionNames.indexOf(b);

                // Zabezpieczenie: jeśli czegoś cudem nie ma na liście, wrzucamy to na sam koniec
                if (indexA == -1) indexA = 999;
                if (indexB == -1) indexB = 999;

                return Integer.compare(indexA, indexB);
            });

            // Jeśli dzień jest w ogóle pusty, dodajemy jedną pustą kolumnę by macierz się nie złamała
            if (list.isEmpty()) list.add("");
            result.put(entry.getKey(), list);
        }
        return result;
    }

    private String getTitle() {
        String roleStr = supervisorRoleName.map(role -> " (" + role + ")").orElse("");
        return "Harmonogram: " + event.getName() + roleStr + " (" +
                event.getStartDate().format(DateUtils.getPlDateFormatter()) +
                " - " +
                event.getEndDate().format(DateUtils.getPlDateFormatter()) + ")";
    }
}