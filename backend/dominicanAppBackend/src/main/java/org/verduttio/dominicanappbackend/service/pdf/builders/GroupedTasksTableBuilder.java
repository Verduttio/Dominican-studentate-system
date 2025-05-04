package org.verduttio.dominicanappbackend.service.pdf.builders;

import be.quodlibet.boxable.BaseTable;
import be.quodlibet.boxable.Cell;
import be.quodlibet.boxable.HorizontalAlignment;
import be.quodlibet.boxable.Row;
import be.quodlibet.boxable.line.LineStyle;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.font.PDFont;

import java.awt.*;
import java.util.List;

public class GroupedTasksTableBuilder {

    private final BaseTable table;
    private final PDFont font;
    private final float FONT_SIZE =9f;
    private final float NAME_CELL_WIDTH = 20f;
    private final float ROW_HEIGHT = 10f;
    private final float CELL_PADDING = 0.5f;
    private final LineStyle BORDER_LINE_STYLE = new LineStyle(Color.BLACK, 0.4f);

    public GroupedTasksTableBuilder(BaseTable table, PDFont font) {
        this.table = table;
        this.font = font;
    }

    public void addHeaderRow(String... headers) {
        Row<PDPage> headerRow = table.createRow(ROW_HEIGHT);
        String name = headers[0];
        List<String> tasksByRoles = List.of(headers).subList(1, headers.length);

        createHeaderNameCell(headerRow, name);
        createHeaderRoleCells(headerRow, tasksByRoles);
        table.addHeaderRow(headerRow);
    }

    public void addRow(String... values) {
        Row<PDPage> row = table.createRow(ROW_HEIGHT);
        String name = values[0];
        List<String> tasksByRoles = List.of(values).subList(1, values.length);

        createNameCell(row, name);
        createRoleCells(row, tasksByRoles);
    }

    private void createHeaderNameCell(Row<PDPage> row, String name) {
        Cell<PDPage> cell = row.createCell(NAME_CELL_WIDTH, name);
        styleHeaderCell(cell);
    }

    private void createHeaderRoleCells(Row<PDPage> row, List<String> tasksByRoles) {
        for (String roleTasks : tasksByRoles) {
            Cell<PDPage> cell = row.createCell(calculateRoleCellWidth(tasksByRoles.size()), roleTasks);
            styleHeaderCell(cell);
        }
    }

    private void createNameCell(Row<PDPage> row, String name) {
        Cell<PDPage> cell = row.createCell(NAME_CELL_WIDTH, name);
        styleCell(cell);
    }

    private void createRoleCells(Row<PDPage> row, List<String> tasksByRoles) {
        for (String roleTasks : tasksByRoles) {
            Cell<PDPage> cell = row.createCell(calculateRoleCellWidth(tasksByRoles.size()), roleTasks);
            styleCell(cell);
        }
    }

    private float calculateRoleCellWidth(int numberOfRoles) {
        return (100 - NAME_CELL_WIDTH) / numberOfRoles;
    }

    private void styleHeaderCell(Cell<PDPage> cell) {
        cell.setFont(font);
        cell.setFontSize(FONT_SIZE);
        cell.setFillColor(Color.LIGHT_GRAY);
        cell.setTextColor(Color.BLACK);
        cell.setAlign(HorizontalAlignment.CENTER);
        cell.setBorderStyle(BORDER_LINE_STYLE);
        setCellPadding(cell);
    }

    private void styleCell(Cell<PDPage> cell) {
        cell.setFont(font);
        cell.setFontSize(FONT_SIZE);
        cell.setAlign(HorizontalAlignment.CENTER);
        cell.setBorderStyle(BORDER_LINE_STYLE);
        setCellPadding(cell);
    }

    private void setCellPadding(Cell<PDPage> cell) {
        cell.setTopPadding(CELL_PADDING);
        cell.setBottomPadding(CELL_PADDING);
        cell.setLeftPadding(CELL_PADDING);
        cell.setRightPadding(CELL_PADDING);
    }
}
