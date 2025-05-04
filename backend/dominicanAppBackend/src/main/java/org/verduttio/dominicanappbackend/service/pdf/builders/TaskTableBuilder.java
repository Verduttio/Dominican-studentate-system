package org.verduttio.dominicanappbackend.service.pdf.builders;

import be.quodlibet.boxable.BaseTable;
import be.quodlibet.boxable.Cell;
import be.quodlibet.boxable.HorizontalAlignment;
import be.quodlibet.boxable.Row;
import be.quodlibet.boxable.line.LineStyle;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.verduttio.dominicanappbackend.dto.schedule.ScheduleShortInfoForTask;

import java.awt.*;
import java.io.IOException;
import java.util.List;

// TaskTableBuilder.java
public class TaskTableBuilder {

    private final BaseTable table;
    private final PDFont font;

    public TaskTableBuilder(BaseTable table, PDFont font) {
        this.table = table;
        this.font = font;
    }

    public void buildTable(List<ScheduleShortInfoForTask> schedules) throws IOException {
        addHeaderRow();
        for (ScheduleShortInfoForTask schedule : schedules) {
            addTaskRows(schedule);
            addSeparatorRow();
        }
        table.draw();
    }

    private void addHeaderRow() {
        Row<PDPage> headerRow = table.createRow(10f);  // smaller to fit in one page
        Cell<PDPage> taskCell = headerRow.createCell(50, "Oficjum");
        styleHeaderCell(taskCell);

        Cell<PDPage> userCell = headerRow.createCell(50, "Wykonujący");
        styleHeaderCell(userCell);

        table.addHeaderRow(headerRow);
    }

    private void addTaskRows(ScheduleShortInfoForTask schedule) {
        String taskName = schedule.taskName();
        List<String> userNames = schedule.usersInfoStrings();

        if (userNames.isEmpty()) {
            addRow(taskName, "");
        } else {
            for (int i = 0; i < userNames.size(); i++) {
                String userName = userNames.get(i);
                if (i == 0) {
                    addRow(taskName, userName);
                } else {
                    addRow("", userName);
                }
            }
        }
    }

    private void addRow(String taskName, String userName) {
        Row<PDPage> row = table.createRow(8f); // smaller to fit in one page

        Cell<PDPage> taskCell = row.createCell(50, taskName);
        styleTaskCell(taskCell, !taskName.isEmpty());

        Cell<PDPage> userCell = row.createCell(50, userName);
        styleCell(userCell);
    }

    private void addSeparatorRow() {
        Row<PDPage> separatorRow = table.createRow(0.5f);
        Cell<PDPage> separatorCell = separatorRow.createCell(100, "");
        separatorCell.setFillColor(Color.WHITE);
    }

    private void styleHeaderCell(Cell<PDPage> cell) {
        cell.setFont(font);
        cell.setFontSize(12);
        cell.setFillColor(Color.LIGHT_GRAY);  // brighter mode
        cell.setTextColor(Color.BLACK);
        cell.setAlign(HorizontalAlignment.CENTER);
    }

    private void styleTaskCell(Cell<PDPage> cell, boolean hasTaskName) {
        cell.setFont(font);
        cell.setFontSize(12);
        cell.setFillColor(Color.LIGHT_GRAY);
        cell.setAlign(HorizontalAlignment.CENTER);
        if (!hasTaskName) {
            cell.setBorderStyle(new LineStyle(Color.LIGHT_GRAY, 0));
        }
    }

    private void styleCell(Cell<PDPage> cell) {
        cell.setFont(font);
        cell.setFontSize(12);
        cell.setAlign(HorizontalAlignment.CENTER);
    }
}

