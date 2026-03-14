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
        // Zamiast standardowych metod, używamy naszej nowej, stworzonej dla Special Events
        List<UserSchedulesOnDaysDTO> userSchedules = scheduleService.getListOfUserSchedulesByDaysDTOForSpecialEvent(
                event.getId(),
                supervisorRoleName.orElse(null)
        );

        initializeDocument();
        // Generujemy stronę poziomą (A4 Landscape)
        PDPage page = addNewPage(new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth()));
        float startY = addTitle(page, getTitle());
        BaseTable table = initializeTable(page, startY);

        populateTable(table, userSchedules);

        return finalizeDocument();
    }

    private String getTitle() {
        String roleStr = supervisorRoleName.map(role -> " (" + role + ")").orElse("");
        return "Harmonogram: " + event.getName() + roleStr + " (" +
                event.getStartDate().format(DateUtils.getPlDateFormatter()) +
                " - " +
                event.getEndDate().format(DateUtils.getPlDateFormatter()) + ")";
    }

    private void populateTable(BaseTable table, List<UserSchedulesOnDaysDTO> userSchedules) throws IOException {
        // Używamy Twojego istniejącego DayTableBuilder - wygląd tabeli będzie identyczny!
        DayTableBuilder tableBuilder = new DayTableBuilder(table, font, event.getStartDate(), event.getEndDate());
        tableBuilder.buildTable(userSchedules);
    }
}