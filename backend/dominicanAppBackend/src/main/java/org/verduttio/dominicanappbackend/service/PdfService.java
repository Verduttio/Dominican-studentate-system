package org.verduttio.dominicanappbackend.service;

import be.quodlibet.boxable.BaseTable;
import be.quodlibet.boxable.Cell;
import be.quodlibet.boxable.HorizontalAlignment;
import be.quodlibet.boxable.Row;
import be.quodlibet.boxable.line.LineStyle;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.dto.schedule.ScheduleShortInfoForTask;
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
    private static final float MARGIN = 30;
    private static final String FONT_PATH = "c:/windows/fonts/calibri.ttf";

    @Autowired
    public PdfService(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    public byte[] generateSchedulePdfForUsers(LocalDate from, LocalDate to) throws IOException {
        validateDateRange(from, to);
        List<ScheduleShortInfoForUser> schedules = scheduleService.getScheduleShortInfoForEachUserForSpecifiedWeek(from, to);

        try (PDDocument doc = new PDDocument()) {
            PDFont font = getFont(doc);
            PDPage page = addNewPage(doc);
            float startY = initializeTitle(doc, page, font, from, to);
            BaseTable table = initializeTable(doc, page, startY);

            populateUserScheduleTable(table, schedules, font);

            return finalizeDocument(doc);
        }
    }

    public byte[] generateSchedulePdfForTasksBySupervisorRole(String roleName, LocalDate from, LocalDate to) throws IOException {
        validateDateRange(from, to);
        List<ScheduleShortInfoForTask> schedules = scheduleService.getScheduleShortInfoForTaskByRoleForSpecifiedWeek(roleName, from, to);

        try (PDDocument doc = new PDDocument()) {
            PDFont font = getFont(doc);
            PDPage page = addNewPage(doc);
            float startY = initializeTitle(doc, page, font, from, to);
            BaseTable table = initializeTable(doc, page, startY);

            populateTaskScheduleTable(table, schedules, font);

            return finalizeDocument(doc);
        }
    }

    public byte[] generateSchedulePdfForTasks(LocalDate from, LocalDate to) throws IOException {
        validateDateRange(from, to);
        List<ScheduleShortInfoForTask> schedules = scheduleService.getScheduleShortInfoForEachTaskForSpecifiedWeek(from, to);

        try (PDDocument doc = new PDDocument()) {
            PDFont font = getFont(doc);
            PDPage page = addNewPage(doc);
            float startY = initializeTitle(doc, page, font, from, to);
            BaseTable table = initializeTable(doc, page, startY);

            populateTaskScheduleTable(table, schedules, font);

            return finalizeDocument(doc);
        }
    }

    private void validateDateRange(LocalDate from, LocalDate to) {
        if (!DateValidator.dateStartsMondayEndsSunday(from, to)) {
            throw new IllegalArgumentException("Dates must start on Monday and end on Sunday");
        }
    }

    private static PDPage addNewPage(PDDocument doc) {
        PDPage page = new PDPage();
        doc.addPage(page);
        return page;
    }

    private float initializeTitle(PDDocument doc, PDPage page, PDFont font, LocalDate from, LocalDate to) throws IOException {
        return addTitle(doc, page, font, "Harmonogram od " + from + " do " + to);
    }

    private static float addTitle(PDDocument doc, PDPage page, PDFont font, String title) throws IOException {
        float titleWidth = font.getStringWidth(title) / 1000 * 18; // Font size 18
        float titleHeight = font.getFontDescriptor().getFontBoundingBox().getHeight() / 1000 * 18;
        float startX = (page.getMediaBox().getWidth() - titleWidth) / 2;
        float startY = page.getMediaBox().getHeight() - 2 * MARGIN - 20 - titleHeight;

        try (PDPageContentStream contentStream = new PDPageContentStream(doc, page)) {
            contentStream.beginText();
            contentStream.setFont(font, 18);
            contentStream.newLineAtOffset(startX, startY);
            contentStream.showText(title);
            contentStream.endText();
        }
        return startY - 30 - titleHeight;
    }

    private BaseTable initializeTable(PDDocument doc, PDPage page, float startY) throws IOException {
        return new BaseTable(startY, startY, MARGIN, page.getMediaBox().getWidth() - 2 * MARGIN, MARGIN, doc, page, true, true);
    }

    private void populateUserScheduleTable(BaseTable table, List<ScheduleShortInfoForUser> schedules, PDFont font) throws IOException {
        // Create Header row
        Row<PDPage> headerRow = table.createRow(15f);
        Cell<PDPage> cell = headerRow.createCell(50, "Imię i nazwisko");
        cell.setFont(font);
        cell.setFontSize(12);
        cell.setFillColor(Color.BLACK);
        cell.setTextColor(Color.WHITE);

        cell = headerRow.createCell(50, "Zadanie");
        cell.setFont(font);
        cell.setFontSize(12);
        cell.setFillColor(Color.BLACK);
        cell.setTextColor(Color.WHITE);

        table.addHeaderRow(headerRow);

        // Iterate over schedules and add rows
        for (ScheduleShortInfoForUser schedule : schedules) {
            String fullName = schedule.userName() + " " + schedule.userSurname();

            Row<PDPage> row = table.createRow(12f);
            cell = row.createCell(50, fullName);
            cell.setFont(font);
            cell.setFontSize(12);

            cell = row.createCell(50, String.join(", ", schedule.tasksInfoStrings()));
            cell.setFont(font);
            cell.setFontSize(12);
        }

        table.draw();
    }

    private void populateTaskScheduleTable(BaseTable table, List<ScheduleShortInfoForTask> schedules, PDFont font) throws IOException {
        // Create Header row
        Row<PDPage> headerRow = table.createRow(15f);
        Cell<PDPage> cell = headerRow.createCell(50, "Zadanie");
        cell.setFont(font);
        cell.setFontSize(12);
        cell.setAlign(HorizontalAlignment.CENTER);
        cell.setFillColor(Color.BLACK);
        cell.setTextColor(Color.WHITE);

        cell = headerRow.createCell(50, "Wykonujący");
        cell.setFont(font);
        cell.setFontSize(12);
        cell.setAlign(HorizontalAlignment.CENTER);
        cell.setFillColor(Color.BLACK);
        cell.setTextColor(Color.WHITE);

        table.addHeaderRow(headerRow);

        boolean firstTask = true;
        // Iterate over schedules and add rows for each task and user
        for (ScheduleShortInfoForTask schedule : schedules) {
            String taskName = schedule.taskName();

            if (!firstTask) {
                // Add empty row as separator
                Row<PDPage> separatorRow = table.createRow(5f);
                Cell<PDPage> separatorCell = separatorRow.createCell(100, "");
                separatorCell.setFillColor(Color.DARK_GRAY);
            } else {
                firstTask = false;
            }

            // Cell for task name
            int cellForTaskNameNumber = schedule.usersInfoStrings().size() / 2;
            if (schedule.usersInfoStrings().size() % 2 == 0) {
                cellForTaskNameNumber -= 1;
            }

            if (schedule.usersInfoStrings().isEmpty()) {
                cellForTaskNameNumber = 0;
            }

            Row<PDPage> taskRow = table.createRow(12f);
            String text = "";
            if(cellForTaskNameNumber == 0) {
                text = taskName;
            }
            Cell<PDPage> taskCell = taskRow.createCell(50, text);
            taskCell.setFillColor(Color.LIGHT_GRAY);
            taskCell.setAlign(HorizontalAlignment.CENTER);
            taskCell.setFont(font);
            taskCell.setFontSize(12);
            taskCell.setTopBorderStyle(new LineStyle(Color.LIGHT_GRAY, 0));
            taskCell.setBottomBorderStyle(new LineStyle(Color.LIGHT_GRAY, 0));

            //Add one row for each user
            for (int i = 0; i < schedule.usersInfoStrings().size(); i++) {
                Cell<PDPage> userCell = taskRow.createCell(50, schedule.usersInfoStrings().get(i));
                userCell.setFont(font);
                userCell.setFontSize(12);

                if (i+1 < schedule.usersInfoStrings().size()) {
                    Row<PDPage> newUserRow = table.createRow(12f);
                    text = "";
                    if (i+1 == cellForTaskNameNumber) {
                        text = taskName;
                    }
                    Cell<PDPage> emptyTaskCell = newUserRow.createCell(50, text);
                    emptyTaskCell.setFont(font);
                    emptyTaskCell.setFontSize(12);
                    emptyTaskCell.setFillColor(Color.LIGHT_GRAY);
                    emptyTaskCell.setAlign(HorizontalAlignment.CENTER);
                    emptyTaskCell.setTopBorderStyle(new LineStyle(Color.LIGHT_GRAY, 0));
                    if(i+1 == schedule.usersInfoStrings().size() - 1) {
                        emptyTaskCell.setBottomBorderStyle(new LineStyle(Color.BLACK, 1));
                    } else {
                        emptyTaskCell.setBottomBorderStyle(new LineStyle(Color.LIGHT_GRAY, 0));
                    }
                    taskRow = newUserRow;
                }
            }
        }

        table.draw();
    }

    private byte[] finalizeDocument(PDDocument doc) throws IOException {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        doc.save(byteArrayOutputStream);
        doc.close();
        return byteArrayOutputStream.toByteArray();
    }

    private PDFont getFont(PDDocument pdDocument) throws IOException {
        return PDType0Font.load(pdDocument, new File(FONT_PATH));
    }
}
