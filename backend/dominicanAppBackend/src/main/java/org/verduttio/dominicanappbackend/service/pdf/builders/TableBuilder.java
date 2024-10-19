package org.verduttio.dominicanappbackend.service.pdf.builders;

import be.quodlibet.boxable.BaseTable;
import be.quodlibet.boxable.Cell;
import be.quodlibet.boxable.HorizontalAlignment;
import be.quodlibet.boxable.Row;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.font.PDFont;

import java.awt.*;

// TableBuilder.java
public class TableBuilder {

    private final BaseTable table;
    private final PDFont font;

    public TableBuilder(BaseTable table, PDFont font) {
        this.table = table;
        this.font = font;
    }

    public void addHeaderRow(String... headers) {
        Row<PDPage> headerRow = table.createRow(15f);
        for (String header : headers) {
            Cell<PDPage> cell = headerRow.createCell(100f / headers.length, header);
            styleHeaderCell(cell);
        }
        table.addHeaderRow(headerRow);
    }

    public void addRow(String... values) {
        Row<PDPage> row = table.createRow(12f);
        for (String value : values) {
            Cell<PDPage> cell = row.createCell(100f / values.length, value);
            styleCell(cell);
        }
    }

    private void styleHeaderCell(Cell<PDPage> cell) {
        cell.setFont(font);
        cell.setFontSize(12);
        cell.setFillColor(Color.BLACK);
        cell.setTextColor(Color.WHITE);
        cell.setAlign(HorizontalAlignment.CENTER);
    }

    private void styleCell(Cell<PDPage> cell) {
        cell.setFont(font);
        cell.setFontSize(12);
        cell.setAlign(HorizontalAlignment.CENTER);
    }
}

