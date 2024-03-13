package org.verduttio.dominicanappbackend.service;

import be.quodlibet.boxable.*;
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

    @Autowired
    public PdfService(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    public byte[] generateSchedulePdfForUsers(LocalDate from, LocalDate to) throws IOException {
        if (!DateValidator.dateStartsMondayEndsSunday(from, to)) {
            throw new IllegalArgumentException("Dates must start on Monday and end on Sunday");
        }

        List<ScheduleShortInfoForUser> schedules = scheduleService.getScheduleShortInfoForEachUserForSpecifiedWeek(from, to);

        // Set margins
        float margin = 30;

        // Initialize Document
        PDDocument doc = new PDDocument();
        PDFont fontCalibri = PDType0Font.load(doc, new File("c:/windows/fonts/calibri.ttf"));
        PDPage page = addNewPage(doc);
        float yStartNewPage = page.getMediaBox().getHeight() - (2 * margin);

        // Calculate title width to center
        String title = "Harmonogram od " + from.toString() + " do " + to.toString();
        float titleWidth = fontCalibri.getStringWidth(title) / 1000 * 18; // 18 is the font size
        float titleHeight = fontCalibri.getFontDescriptor().getFontBoundingBox().getHeight() / 1000 * 18;
        float startX = (page.getMediaBox().getWidth() - titleWidth) / 2;
        float startY = yStartNewPage + margin - 20 - titleHeight;

        // Adding centered title
        try (PDPageContentStream contentStream = new PDPageContentStream(doc, page)) {
            contentStream.beginText();
            contentStream.setFont(fontCalibri, 18); // Use larger font for title
            contentStream.newLineAtOffset(startX, startY); // Adjust title position for centering
            contentStream.showText(title);
            contentStream.endText();
        }

        // Adjust yStartNewPage to account for title space
        yStartNewPage -= 30 + titleHeight; // Adjust based on the size of the title and desired spacing

        // Initialize table below the title
        float tableWidth = page.getMediaBox().getWidth() - (2 * margin);
        boolean drawContent = true;
        float bottomMargin = 70;
        BaseTable table = new BaseTable(yStartNewPage, yStartNewPage, bottomMargin, tableWidth, margin, doc, page, true, drawContent);

        // Create Header row
        Row<PDPage> headerRow = table.createRow(15f);
        Cell<PDPage> cell = headerRow.createCell(50, "Imię i nazwisko");
        cell.setFont(fontCalibri);
        cell.setFontSize(12);
        cell.setFillColor(Color.BLACK);
        cell.setTextColor(Color.WHITE);

        cell = headerRow.createCell(50, "Zadanie");
        cell.setFont(fontCalibri);
        cell.setFontSize(12);
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

    public byte[] generateSchedulePdfForTasksBySupervisorRole(String roleName, LocalDate from, LocalDate to) throws IOException {
        if (!DateValidator.dateStartsMondayEndsSunday(from, to)) {
            throw new IllegalArgumentException("Dates must start on Monday and end on Sunday");
        }

        List<ScheduleShortInfoForTask> schedules = scheduleService.getScheduleShortInfoForTaskByRoleForSpecifiedWeek(roleName, from, to);

        // Set margins
        float margin = 30;

        // Initialize Document
        PDDocument doc = new PDDocument();
        PDFont fontCalibri = PDType0Font.load(doc, new File("c:/windows/fonts/calibri.ttf"));
        PDPage page = addNewPage(doc);
        float yStartNewPage = page.getMediaBox().getHeight() - (2 * margin);

        // Calculate title width to center
        String title = "Harmonogram od " + from.toString() + " do " + to.toString();
        float titleWidth = fontCalibri.getStringWidth(title) / 1000 * 18; // 18 is the font size
        float titleHeight = fontCalibri.getFontDescriptor().getFontBoundingBox().getHeight() / 1000 * 18;
        float startX = (page.getMediaBox().getWidth() - titleWidth) / 2;
        float startY = yStartNewPage + margin - 20 - titleHeight;

        // Adding centered title
        try (PDPageContentStream contentStream = new PDPageContentStream(doc, page)) {
            contentStream.beginText();
            contentStream.setFont(fontCalibri, 18); // Use larger font for title
            contentStream.newLineAtOffset(startX, startY); // Adjust title position for centering
            contentStream.showText(title);
            contentStream.endText();
        }

        // Adjust yStartNewPage to account for title space
        yStartNewPage -= 30 + titleHeight; // Adjust based on the size of the title and desired spacing

        // Initialize table below the title
        float tableWidth = page.getMediaBox().getWidth() - (2 * margin);
        boolean drawContent = true;
        float bottomMargin = 70;
        BaseTable table = new BaseTable(yStartNewPage, yStartNewPage, bottomMargin, tableWidth, margin, doc, page, true, drawContent);

        // Create Header row
        Row<PDPage> headerRow = table.createRow(15f);
        Cell<PDPage> cell = headerRow.createCell(50, "Zadanie");
        cell.setFont(fontCalibri);
        cell.setFontSize(12);
        cell.setAlign(HorizontalAlignment.CENTER);
        cell.setFillColor(Color.BLACK);
        cell.setTextColor(Color.WHITE);

        cell = headerRow.createCell(50, "Wykonujący");
        cell.setFont(fontCalibri);
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

            Row<PDPage> taskRow = table.createRow(12f);
            String text = "";
            if(cellForTaskNameNumber == 0) {
                text = taskName;
            }
            Cell<PDPage> taskCell = taskRow.createCell(50, text);
            taskCell.setFillColor(Color.LIGHT_GRAY);
            taskCell.setAlign(HorizontalAlignment.CENTER);
            taskCell.setFont(fontCalibri);
            taskCell.setFontSize(12);
            taskCell.setTopBorderStyle(new LineStyle(Color.LIGHT_GRAY, 0));
            taskCell.setBottomBorderStyle(new LineStyle(Color.LIGHT_GRAY, 0));

            //Add one row for each user
            for (int i = 0; i < schedule.usersInfoStrings().size(); i++) {
                Cell<PDPage> userCell = taskRow.createCell(50, schedule.usersInfoStrings().get(i));
                userCell.setFont(fontCalibri);
                userCell.setFontSize(12);

                if (i+1 < schedule.usersInfoStrings().size()) {
                    Row<PDPage> newUserRow = table.createRow(12f);
                    text = "";
                    if (i+1 == cellForTaskNameNumber) {
                        text = taskName;
                    }
                    Cell<PDPage> emptyTaskCell = newUserRow.createCell(50, text);
                    emptyTaskCell.setFont(fontCalibri);
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
