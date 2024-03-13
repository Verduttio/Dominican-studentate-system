package org.verduttio.dominicanappbackend.service;

import be.quodlibet.boxable.BaseTable;
import be.quodlibet.boxable.Cell;
import be.quodlibet.boxable.Row;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.dto.schedule.ScheduleShortInfoForUser;
import org.verduttio.dominicanappbackend.validation.DateValidator;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Service
public class PdfService {

    private final ScheduleService scheduleService;

    @Autowired
    public PdfService(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    public byte[] generateSchedulePdfForUsers(LocalDate from, LocalDate to) throws IOException {
        if(!DateValidator.dateStartsMondayEndsSunday(from, to)) {
            throw new IllegalArgumentException("Dates must start on Monday and end on Sunday");
        }

        List<ScheduleShortInfoForUser> schedules = scheduleService.getScheduleShortInfoForEachUserForSpecifiedWeek(from, to);

        // Set margins
        float margin = 10;

        // Initialize Document
        PDDocument doc = new PDDocument();
        PDFont fontCalibri = PDType0Font.load(doc, new File("c:/windows/fonts/calibri.ttf"));
        PDPage page = addNewPage(doc);
        float yStartNewPage = page.getMediaBox().getHeight() - (2 * margin);

        // Initialize table
        float tableWidth = page.getMediaBox().getWidth() - (2 * margin);
        boolean drawContent = true;
        float bottomMargin = 70;
        BaseTable table = new BaseTable(yStartNewPage, yStartNewPage, bottomMargin, tableWidth, margin, doc, page, true, drawContent);

        // Create Header row
        Row<PDPage> headerRow = table.createRow(15f);
        Cell<PDPage> cell = headerRow.createCell(50, "Imię i nazwisko");
        cell.setFont(fontCalibri);
        cell.setFillColor(Color.BLACK);
        cell.setTextColor(Color.WHITE);

        cell = headerRow.createCell(50, "Zadanie");
        cell.setFont(fontCalibri);
        cell.setFillColor(Color.BLACK);
        cell.setTextColor(Color.WHITE);

        table.addHeaderRow(headerRow);

        // Iterate over schedules and add rows
        for (ScheduleShortInfoForUser schedule : schedules) {
            String fullName = schedule.userName() + " " + schedule.userSurname();

            Row<PDPage> row = table.createRow(12f);
            cell = row.createCell(50, fullName);
            cell.setFont(fontCalibri);
            cell.setFontSize(12);

            cell = row.createCell(50, String.join(", ", schedule.tasksInfoStrings()));
            cell.setFont(fontCalibri);
            cell.setFontSize(12);
        }

        table.draw();

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        doc.save(byteArrayOutputStream);
        doc.close();
        return byteArrayOutputStream.toByteArray();
    }

    private static PDPage addNewPage(PDDocument doc) {
        PDPage page = new PDPage();
        doc.addPage(page);
        return page;
    }

}
