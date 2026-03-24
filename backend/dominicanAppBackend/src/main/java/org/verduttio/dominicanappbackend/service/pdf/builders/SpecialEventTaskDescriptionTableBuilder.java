package org.verduttio.dominicanappbackend.service.pdf.builders;

import be.quodlibet.boxable.BaseTable;
import be.quodlibet.boxable.Cell;
import be.quodlibet.boxable.HorizontalAlignment;
import be.quodlibet.boxable.Row;
import be.quodlibet.boxable.VerticalAlignment;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.verduttio.dominicanappbackend.domain.Task;

import java.awt.Color;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class SpecialEventTaskDescriptionTableBuilder {

    private final BaseTable table;
    private final PDFont font;

    public SpecialEventTaskDescriptionTableBuilder(BaseTable table, PDFont font) {
        this.table = table;
        this.font = font;
    }

    public void buildTable(List<Task> specialTasks) throws IOException {
        if (specialTasks == null || specialTasks.isEmpty()) {
            Row<PDPage> row = table.createRow(20f);
            Cell<PDPage> cell = row.createCell(100f, "Brak oficjów specjalnych dla tego wydarzenia.");
            cell.setFont(font);
            cell.setAlign(HorizontalAlignment.CENTER);
            table.draw();
            return;
        }

        // Grupowanie z zachowaniem kolejności bazy danych (LinkedHashMap)
        Map<String, List<Task>> tasksByRole = specialTasks.stream()
                .collect(Collectors.groupingBy(
                        task -> task.getSupervisorRole().getName(),
                        java.util.LinkedHashMap::new,
                        Collectors.toList()
                ));

        for (Map.Entry<String, List<Task>> entry : tasksByRole.entrySet()) {
            String roleName = entry.getKey();
            List<Task> tasks = entry.getValue();

            // --- 1. Wiersz Nagłówka Kategorii ---
            Row<PDPage> headerRow = table.createRow(20f);
            Cell<PDPage> headerCell = headerRow.createCell(100f, roleName.toUpperCase());
            headerCell.setFont(font);
            headerCell.setFontSize(12);
            headerCell.setFillColor(new Color(220, 220, 220)); // Jasnoszare tło
            headerCell.setAlign(HorizontalAlignment.CENTER);
            headerCell.setValign(VerticalAlignment.MIDDLE);

            // --- 2. Wiersze zadań ---
            for (Task task : tasks) {
                Row<PDPage> taskRow = table.createRow(15f);

                String nameText = task.getName() + "<br>(" + task.getNameAbbrev() + ")";
                Cell<PDPage> nameCell = taskRow.createCell(20f, nameText);
                nameCell.setFont(font);
                nameCell.setFontSize(10);
                nameCell.setAlign(HorizontalAlignment.CENTER);
                nameCell.setValign(VerticalAlignment.MIDDLE);

                String description = (task.getDescription() != null && !task.getDescription().trim().isEmpty())
                        ? task.getDescription().replaceAll("\r?\n", "<br>")
                        : "Brak opisu.";
                Cell<PDPage> descCell = taskRow.createCell(80f, description);
                descCell.setFont(font);
                descCell.setFontSize(10);
                descCell.setAlign(HorizontalAlignment.LEFT);
                descCell.setValign(VerticalAlignment.MIDDLE);
            }
        }

        // Na sam koniec rysujemy tabelę!
        table.draw();
    }
}