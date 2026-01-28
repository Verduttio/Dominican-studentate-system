package org.verduttio.dominicanappbackend.service.pdf.builders;

import be.quodlibet.boxable.BaseTable;
import be.quodlibet.boxable.Cell;
import be.quodlibet.boxable.HorizontalAlignment;
import be.quodlibet.boxable.Row;
import be.quodlibet.boxable.line.LineStyle;
import be.quodlibet.boxable.VerticalAlignment;
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
    private Color myGray;
    private float fontSize;

    public TaskTableBuilder(BaseTable table, PDFont font) {
        this.table = table;
        this.font = font;
        this.myGray = new Color(230, 230, 230);
        this.fontSize = 11;
    }

    public void buildTable(List<ScheduleShortInfoForTask> schedules) throws IOException {
        addHeaderRow();
        for (ScheduleShortInfoForTask schedule : schedules) {
//            addSeparatorRow();
            addTaskRows(schedule);
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

        String usersText = userNames.isEmpty() ? "" : String.join("<br>", userNames);

        // Tworzymy TYLKO JEDEN wiersz dla całego zadania
        addRow(taskName, usersText);
    }

    private void addRow(String taskName, String usersText) { // Zmiana nazwy drugiego parametru dla jasności
        Row<PDPage> row = table.createRow(5f); // 5f to minimalna wysokość, rozszerzy się automatycznie

        Cell<PDPage> taskCell = row.createCell(50, taskName);
        styleTaskCell(taskCell); // Usunięty drugi parametr

        Cell<PDPage> userCell = row.createCell(50, usersText);
        styleCell(userCell);

        // Opcjonalnie: zwiększ lekko odstępy między imionami w prawej kolumnie
        userCell.setLineSpacing(1.2f);
    }

    private void addSeparatorRow() {
        Row<PDPage> separatorRow = table.createRow(2f);
        Cell<PDPage> separatorCell = separatorRow.createCell(100, "");
        separatorCell.setFillColor(Color.WHITE);
        separatorCell.setRightBorderStyle(null);
        separatorCell.setLeftBorderStyle(null);
        separatorCell.setTopPadding(0f);
        separatorCell.setBottomPadding(0f);
    }

    private void styleHeaderCell(Cell<PDPage> cell) {
        cell.setFont(font);
        cell.setFontSize(this.fontSize);
        cell.setFillColor(Color.LIGHT_GRAY);  // brighter mode
        cell.setTextColor(Color.BLACK);
        cell.setAlign(HorizontalAlignment.CENTER);
    }

    private void styleTaskCell(Cell<PDPage> cell) {
        cell.setFont(font);
        cell.setFontSize(this.fontSize);
        cell.setFillColor(this.myGray);
        cell.setAlign(HorizontalAlignment.CENTER);
        cell.setValign(VerticalAlignment.MIDDLE);
    }

    private void styleCell(Cell<PDPage> cell) {
        cell.setFont(font);
        cell.setFontSize(this.fontSize);
        cell.setFillColor(this.myGray);
        cell.setAlign(HorizontalAlignment.CENTER);
    }
}

