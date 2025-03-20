package org.verduttio.dominicanappbackend.service.pdf.generators;


import be.quodlibet.boxable.BaseTable;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.verduttio.dominicanappbackend.dto.user.UserSchedulesOnDaysDTO;
import org.verduttio.dominicanappbackend.service.schedule.ScheduleService;
import org.verduttio.dominicanappbackend.service.pdf.builders.DayTableBuilder;
import org.verduttio.dominicanappbackend.util.DateUtils;
import org.verduttio.dominicanappbackend.validation.DateValidator;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public class DaySchedulePdfGenerator extends AbstractPdfGenerator {

    private final LocalDate from;
    private final LocalDate to;
    private final Optional<String> supervisorRoleName;

    public DaySchedulePdfGenerator(ScheduleService scheduleService, LocalDate from, LocalDate to, String supervisorRoleName) {
        super(scheduleService);
        this.from = from;
        this.to = to;
        this.supervisorRoleName = Optional.ofNullable(supervisorRoleName);
    }

    @Override
    public byte[] generatePdf() throws IOException {
        DateValidator.ensureFromDateNotAfterToDate(from, to);
        List<UserSchedulesOnDaysDTO> userSchedules;

        if (supervisorRoleName.isPresent()) {
            userSchedules = scheduleService.getListOfUserSchedulesByDaysDTO(from, to, supervisorRoleName.get());
        } else {
            userSchedules = scheduleService.getListOfUserSchedulesByDaysDTO(from, to);
        }

        initializeDocument();
        PDPage page = addNewPage(new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth()));
        float startY = addTitle(page, getTitle());
        BaseTable table = initializeTable(page, startY);

        populateTable(table, userSchedules);

        return finalizeDocument();
    }

    private String getTitle() {
        String prefix = supervisorRoleName.orElse("Oficja");
        return prefix + " od  " +
                from.format(DateUtils.getPlDateFormatter()) +
                " do " +
                to.format(DateUtils.getPlDateFormatter());
    }

    private void populateTable(BaseTable table, List<UserSchedulesOnDaysDTO> userSchedules) throws IOException {
        DayTableBuilder tableBuilder = new DayTableBuilder(table, font, from, to);
        tableBuilder.buildTable(userSchedules);
    }
}

