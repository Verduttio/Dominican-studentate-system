package org.verduttio.dominicanappbackend.service.pdf.builders;

import be.quodlibet.boxable.BaseTable;
import be.quodlibet.boxable.Cell;
import be.quodlibet.boxable.HorizontalAlignment;
import be.quodlibet.boxable.Row;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.verduttio.dominicanappbackend.dto.user.UserSchedulesOnDaysDTO;
import org.verduttio.dominicanappbackend.dto.user.UserShortInfo;
import org.verduttio.dominicanappbackend.util.DateUtils;

import java.awt.*;
import java.io.IOException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;

import static org.verduttio.dominicanappbackend.service.pdf.generators.AbstractPdfGenerator.BORDER_LINE_STYLE;
import static org.verduttio.dominicanappbackend.service.pdf.generators.AbstractPdfGenerator.COLOR_LIGHT_GRAY;


public class DayTableBuilder {

    private final BaseTable table;
    private final PDFont font;
    private final LocalDate from;
    private final LocalDate to;

    public DayTableBuilder(BaseTable table, PDFont font, LocalDate from, LocalDate to) {
        this.table = table;
        this.font = font;
        this.from = from;
        this.to = to;
    }

    public void buildTable(List<UserSchedulesOnDaysDTO> userSchedules) throws IOException {
        TableParameters params = calculateTableParameters();
        addDayOfWeekHeaderRow(params);
        addDateHeaderRow(params);
        addUserDataRows(userSchedules, params);
        table.draw();
    }

    private TableParameters calculateTableParameters() {
        long daysBetween = ChronoUnit.DAYS.between(from, to) + 1;
        int fontSize;
        int nameCellWidth;
        int rowHeight;

        if (daysBetween < 16) {
            fontSize = 8;
            nameCellWidth = 14;
            rowHeight = 10;
        } else if (daysBetween < 40) {
            fontSize = 6;
            nameCellWidth = 8;
            rowHeight = 7;
        } else {
            fontSize = 4;
            nameCellWidth = 6;
            rowHeight = 6;
        }
        int taskCellWidth = 100 - nameCellWidth;
        return new TableParameters(fontSize, nameCellWidth, taskCellWidth, rowHeight);
    }

    private void addDayOfWeekHeaderRow(TableParameters params) {
        Row<PDPage> dayOfWeekRow = table.createRow(params.rowHeight);
        createHeaderCell(dayOfWeekRow, params.nameCellWidth, params.fontSize, "", Color.LIGHT_GRAY);  // Brighter color

        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            String dayOfWeek = DateUtils.getDayOfWeekPL(date.getDayOfWeek());
            createHeaderCell(dayOfWeekRow, (float) params.taskCellWidth / daysBetween(), params.fontSize, dayOfWeek, COLOR_LIGHT_GRAY);
        }
        table.addHeaderRow(dayOfWeekRow);
    }

    private void addDateHeaderRow(TableParameters params) {
        Row<PDPage> dateRow = table.createRow(params.rowHeight);
        createHeaderCell(dateRow, params.nameCellWidth, params.fontSize, "Brat", Color.LIGHT_GRAY);  // Brighter color

        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            String dateStr = DateUtils.getDayMonthFormat(date);
            createHeaderCell(dateRow, (float) params.taskCellWidth / daysBetween(), params.fontSize, dateStr, COLOR_LIGHT_GRAY);
        }
        table.addHeaderRow(dateRow);
    }

    private void addUserDataRows(List<UserSchedulesOnDaysDTO> userSchedules, TableParameters params) {
        int rowIndex = 0;
        for (UserSchedulesOnDaysDTO userDTO : userSchedules) {
            Row<PDPage> row = table.createRow(params.rowHeight);
            UserShortInfo userInfo = userDTO.getUserShortInfo();
            String fullName = userInfo.getName() + " " + userInfo.getSurname();
            Color rowColor = (rowIndex % 2 == 1) ? COLOR_LIGHT_GRAY : Color.WHITE;

            createDataCell(row, params.nameCellWidth, params.fontSize, fullName, new Color(217, 225, 242));

            for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
                List<String> tasks = userDTO.getSchedules().getOrDefault(date, Collections.emptyList());
                String tasksStr = String.join(", ", tasks);
                createDataCell(row, (float) params.taskCellWidth / daysBetween(), params.fontSize, tasksStr, rowColor);
            }
            rowIndex++;
        }
    }

    private void createHeaderCell(Row<PDPage> row, float width, float fontSize, String text, Color fillColor) {
        Cell<PDPage> cell = row.createCell(width, text);
        cell.setFont(font);
        cell.setFontSize(fontSize);
        cell.setAlign(HorizontalAlignment.CENTER);
        cell.setFillColor(fillColor);
        cell.setBorderStyle(BORDER_LINE_STYLE);
        setCellPadding(cell, 0);
    }

    private void createDataCell(Row<PDPage> row, float width, float fontSize, String text, Color fillColor) {
        Cell<PDPage> cell = row.createCell(width, text);
        cell.setFont(font);
        cell.setFontSize(fontSize);
        cell.setAlign(HorizontalAlignment.CENTER);
        cell.setFillColor(fillColor);
        cell.setBorderStyle(BORDER_LINE_STYLE);
        setCellPadding(cell, 0);
    }

    private void setCellPadding(Cell<PDPage> cell, float padding) {
        cell.setTopPadding(padding);
        cell.setBottomPadding(padding);
        cell.setLeftPadding(padding);
        cell.setRightPadding(padding);
    }

    private long daysBetween() {
        return ChronoUnit.DAYS.between(from, to) + 1;
    }

    private static class TableParameters {
        int fontSize;
        int nameCellWidth;
        int taskCellWidth;
        int rowHeight;

        TableParameters(int fontSize, int nameCellWidth, int taskCellWidth, int rowHeight) {
            this.fontSize = fontSize;
            this.nameCellWidth = nameCellWidth;
            this.taskCellWidth = taskCellWidth;
            this.rowHeight = rowHeight;
        }
    }
}

