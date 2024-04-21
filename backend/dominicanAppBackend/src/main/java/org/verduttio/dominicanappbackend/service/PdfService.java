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
    private final UserService userService;
    private static final float MARGIN = 20;
    private static final String FONT_PATH = "Capsuula.ttf";

    @Autowired
    public PdfService(ScheduleService scheduleService, UserService userService) {
        this.scheduleService = scheduleService;
        this.userService = userService;
    }

    public byte[] generateSchedulePdfForUsers(LocalDate from, LocalDate to) throws IOException {
        validateDateRange(from, to);
        List<ScheduleShortInfoForUser> schedules = scheduleService.getScheduleShortInfoForAllowedUsersForSpecifiedWeek(from, to);

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
        if (!DateValidator.dateStartsSundayEndsSaturday(from, to)) {
            throw new IllegalArgumentException("Dates must start on Sunday and end on Saturday");
        }
    }

    private static PDPage addNewPage(PDDocument doc) {
        PDPage page = new PDPage();
        doc.addPage(page);
        return page;
    }

    private float initializeTitle(PDDocument doc, PDPage page, PDFont font, LocalDate from, LocalDate to) throws IOException {
        return addTitle(doc, page, font, "Oficja od " + from + " do " + to);
    }

    private static float addTitle(PDDocument doc, PDPage page, PDFont font, String title) throws IOException {
        float titleWidth = font.getStringWidth(title) / 1000 *18; // Font size 18
        float titleHeight = font.getFontDescriptor().getFontBoundingBox().getHeight() / 1000 * 18;
        float startX = (page.getMediaBox().getWidth()) / 2 - titleWidth / 2;
        float startY = page.getMediaBox().getHeight() - MARGIN - titleHeight;

        try (PDPageContentStream contentStream = new PDPageContentStream(doc, page)) {
            contentStream.beginText();
            contentStream.setFont(font, 18);
            contentStream.newLineAtOffset(startX, startY);
            contentStream.showText(title);
            contentStream.endText();
        }
        return startY - titleHeight;
    }

    private BaseTable initializeTable(PDDocument doc, PDPage page, float startY) throws IOException {
        return new BaseTable(startY, page.getMediaBox().getHeight() - MARGIN, MARGIN, page.getMediaBox().getWidth() - 2 * MARGIN, MARGIN, doc, page, true, true);
    }

    private void populateUserScheduleTable(BaseTable table, List<ScheduleShortInfoForUser> schedules, PDFont font) throws IOException {
        // Create Header row
        Row<PDPage> headerRow = table.createRow(15f);
        Cell<PDPage> cell = headerRow.createCell(50, "Imię i nazwisko");
        cell.setFont(font);
        cell.setFontSize(12);
        cell.setFillColor(Color.BLACK);
        cell.setTextColor(Color.WHITE);

        cell = headerRow.createCell(50, "Oficjum");
        cell.setFont(font);
        cell.setFontSize(12);
        cell.setFillColor(Color.BLACK);
        cell.setTextColor(Color.WHITE);

        table.addHeaderRow(headerRow);

        // Iterate over schedules and add rows
        for (ScheduleShortInfoForUser schedule : schedules) {
            if (userService.checkIfUserHasAnyTaskPerformerRole(schedule.userId())) {
                String fullName = schedule.userName() + " " + schedule.userSurname();

                Row<PDPage> row = table.createRow(12f);
                cell = row.createCell(50, fullName);
                cell.setFont(font);
                cell.setFontSize(12);

                cell = row.createCell(50, String.join(", ", schedule.tasksInfoStrings()));
                cell.setFont(font);
                cell.setFontSize(12);
            }
        }

        table.draw();
    }

    private void populateTaskScheduleTable(BaseTable table, List<ScheduleShortInfoForTask> schedules, PDFont font) throws IOException {
        // Create Header row
        Row<PDPage> headerRow = table.createRow(15f);
        Cell<PDPage> cell = headerRow.createCell(50, "Oficjum");
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


        for (ScheduleShortInfoForTask schedule : schedules) {
            String taskName = schedule.taskName();
            int cellNumberForTaskName = getCellNumberForTaskName(schedule);

            if (schedule.usersInfoStrings().isEmpty()) {
                createRowWithTaskNameButWithoutUserName(table, taskName, font);
            } else {
                for (int i = 0; i < schedule.usersInfoStrings().size(); i++) {
                    if (i == cellNumberForTaskName) {
                        createRowWithTaskNameAndUserName(table, taskName, font, schedule.usersInfoStrings().get(i));
                    } else {
                        createRowWithNoTaskNameButWithUserName(table, schedule.usersInfoStrings().get(i), font);
                    }
                }
            }

            createSeparatorBetweenTasks(table);
        }

        table.draw();
    }

    private static void createRowWithTaskNameAndUserName(BaseTable table, String taskName, PDFont font, String userName) {
        Row<PDPage> taskRow = table.createRow(12f);
        Cell<PDPage> taskCell = taskRow.createCell(50, taskName);
        taskCell.setFillColor(Color.LIGHT_GRAY);
        taskCell.setAlign(HorizontalAlignment.CENTER);
        taskCell.setFont(font);
        taskCell.setFontSize(12);
        taskCell.setTopBorderStyle(new LineStyle(Color.LIGHT_GRAY, 0));
        taskCell.setBottomBorderStyle(new LineStyle(Color.LIGHT_GRAY, 0));

        Cell<PDPage> userCell = taskRow.createCell(50, userName);
        userCell.setFont(font);
        userCell.setFontSize(12);
    }

    private static void createRowWithTaskNameButWithoutUserName(BaseTable table, String taskName, PDFont font) {
        Row<PDPage> taskRow = table.createRow(12f);
        Cell<PDPage> taskCell = taskRow.createCell(50, taskName);
        taskCell.setFillColor(Color.LIGHT_GRAY);
        taskCell.setAlign(HorizontalAlignment.CENTER);
        taskCell.setFont(font);
        taskCell.setFontSize(12);
        taskCell.setTopBorderStyle(new LineStyle(Color.LIGHT_GRAY, 0));
        taskCell.setBottomBorderStyle(new LineStyle(Color.LIGHT_GRAY, 0));

        Cell<PDPage> userCell = taskRow.createCell(50, "");
        userCell.setFillColor(Color.LIGHT_GRAY);
        userCell.setBottomBorderStyle(new LineStyle(Color.LIGHT_GRAY, 0));
    }

    private static void createRowWithNoTaskNameButWithUserName(BaseTable table, String userName, PDFont font) {
        // Empty cell
        Row<PDPage> newUserRow = table.createRow(12f);
        Cell<PDPage> emptyTaskCell = newUserRow.createCell(50, "");
        emptyTaskCell.setFont(font);
        emptyTaskCell.setFontSize(12);
        emptyTaskCell.setFillColor(Color.LIGHT_GRAY);
        emptyTaskCell.setAlign(HorizontalAlignment.CENTER);
        emptyTaskCell.setTopBorderStyle(new LineStyle(Color.LIGHT_GRAY, 0));
        emptyTaskCell.setBottomBorderStyle(new LineStyle(Color.LIGHT_GRAY, 0));

        // User cell
        Cell<PDPage> userCell = newUserRow.createCell(50, userName);
        userCell.setFont(font);
        userCell.setFontSize(12);
    }

    private static void createSeparatorBetweenTasks(BaseTable table) {
        Row<PDPage> separatorRow = table.createRow(5f);
        Cell<PDPage> separatorCell = separatorRow.createCell(100, "");
        separatorCell.setFillColor(Color.DARK_GRAY);
    }

    private static int getCellNumberForTaskName(ScheduleShortInfoForTask schedule) {
        int cellForTaskNameNumber = schedule.usersInfoStrings().size() / 2;
        if (schedule.usersInfoStrings().size() % 2 == 0) {
            cellForTaskNameNumber -= 1;
        }

        if (schedule.usersInfoStrings().isEmpty()) {
            cellForTaskNameNumber = 0;
        }
        return cellForTaskNameNumber;
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
