package org.verduttio.dominicanappbackend.service.pdf.generators;

import be.quodlibet.boxable.BaseTable;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.verduttio.dominicanappbackend.domain.SpecialEvent;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.service.schedule.ScheduleService;
import org.verduttio.dominicanappbackend.service.pdf.builders.SpecialEventTaskDescriptionTableBuilder;

import java.io.IOException;
import java.util.List;

public class SpecialEventTaskDescriptionPdfGenerator extends AbstractPdfGenerator {

    private final SpecialEvent event;
    private final List<Task> specialTasks;

    public SpecialEventTaskDescriptionPdfGenerator(ScheduleService scheduleService, SpecialEvent event, List<Task> specialTasks) {
        super(scheduleService);
        this.event = event;
        this.specialTasks = specialTasks;
    }

    @Override
    public byte[] generatePdf() throws IOException {
        initializeDocument();
        PDPage page = addNewPage(PDRectangle.A4);
        float startY = addTitle(page, "Opisy oficjów: " + event.getName());

        BaseTable table = initializeTable(page, startY);

        // Używamy naszego nowego buildera!
        SpecialEventTaskDescriptionTableBuilder builder = new SpecialEventTaskDescriptionTableBuilder(table, font);
        builder.buildTable(specialTasks);

        return finalizeDocument();
    }
}