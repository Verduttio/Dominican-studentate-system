package org.verduttio.dominicanappbackend.service.pdf.builders;

import be.quodlibet.boxable.BaseTable;
import be.quodlibet.boxable.Cell;
import be.quodlibet.boxable.HorizontalAlignment;
import be.quodlibet.boxable.Row;
import be.quodlibet.boxable.VerticalAlignment;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.verduttio.dominicanappbackend.dto.schedule.ScheduleShortInfoForTask;
import org.verduttio.dominicanappbackend.service.pdf.generators.AbstractPdfGenerator;

import java.awt.*;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class TaskTableBuilder {

    private final BaseTable table;
    private final PDFont font;
    private final Color myGray;
    private final float fontSize;

    public TaskTableBuilder(BaseTable table, PDFont font) {
        this.table = table;
        this.font = font;
        this.myGray = new Color(230, 230, 230);
        this.fontSize = 11;
    }

    public void buildTable(List<ScheduleShortInfoForTask> schedules, String globalComment) throws IOException {
        addHeaderRow();
        if (globalComment != null && !globalComment.trim().isEmpty()) {
            addCommentRow(globalComment);
        }
        renderSmartTasks(schedules);
        table.draw();
    }

    public void buildTableWithSections(java.util.LinkedHashMap<String, List<ScheduleShortInfoForTask>> sectionedSchedules, java.util.Map<String, String> comments) throws IOException {
        addHeaderRow();

        // 1. Drukujemy komentarz GLOBALNY (dla całego dnia), jeśli istnieje w mapie pod pustym kluczem ""
        if (comments != null && comments.containsKey("")) {
            addCommentRow(comments.get(""));
        }

        for (java.util.Map.Entry<String, List<ScheduleShortInfoForTask>> entry : sectionedSchedules.entrySet()) {
            String sectionName = entry.getKey();
            List<ScheduleShortInfoForTask> tasks = entry.getValue();

            // 2. Drukujemy nagłówek sekcji (tylko jeśli ma zadania LUB ma komentarz)
            boolean hasTasks = !tasks.isEmpty();
            boolean hasComment = comments != null && comments.containsKey(sectionName);

            if (sectionName != null && !sectionName.isEmpty() && (hasTasks || hasComment)) {
                addSectionHeaderRow(sectionName);

                // 3. Drukujemy komentarz dla tej konkretnej SEKCJ (jeśli istnieje)
                if (hasComment) {
                    addCommentRow(comments.get(sectionName));
                }
            }

            // 4. Drukujemy oficja dla tej sekcji
            if (hasTasks) {
                renderSmartTasks(tasks);
            }
        }
        table.draw();
    }

    // --- GŁÓWNA METODA ŁĄCZĄCA ZMIANY ---
    private void renderSmartTasks(List<ScheduleShortInfoForTask> tasks) {
        Set<Long> processedTaskIds = new HashSet<>();

        // 1. Wyłapujemy wszystkie zadania BAZOWE (nie kończące się na "-2")
        List<ScheduleShortInfoForTask> baseTasks = tasks.stream()
                .filter(t -> t.taskAbbrev() == null || !t.taskAbbrev().trim().endsWith("-2"))
                .toList();

        // 2. Iterujemy po bazowych i szukamy dla nich "Drugiej Zmiany"
        for (ScheduleShortInfoForTask baseTask : baseTasks) {
            String targetAbbrev = baseTask.taskAbbrev() != null ? baseTask.taskAbbrev().trim() + "-2" : "UNMATCHABLE";

            ScheduleShortInfoForTask shift2Task = tasks.stream()
                    .filter(t -> t.taskAbbrev() != null && t.taskAbbrev().trim().equals(targetAbbrev))
                    .findFirst().orElse(null);

            addShiftRow(baseTask, shift2Task);

            processedTaskIds.add(baseTask.taskId());
            if (shift2Task != null) {
                processedTaskIds.add(shift2Task.taskId());
            }
        }

        // 3. Zabezpieczenie: Jeśli w bazie jest jakieś "-2", ale nie ma dla niego bazy (sierota), też je wypiszemy
        for (ScheduleShortInfoForTask task : tasks) {
            if (!processedTaskIds.contains(task.taskId())) {
                addShiftRow(task, null);
            }
        }
    }

    private void addCommentRow(String content) {
        if (content == null || content.trim().isEmpty()) return;

        // 1. Zamieniamy entery na tagi <br>, żeby Boxable przeniósł tekst do nowej linii
        String processedContent = content.replace("\n", "<br>");

        // 2. Szukamy tagów <b>...</b> oraz <i>...</i> (case-insensitive, wieloliniowo)
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("<([biBI])>(.*?)</\\1>", java.util.regex.Pattern.DOTALL);
        java.util.regex.Matcher matcher = pattern.matcher(processedContent);

        StringBuilder cleanContentBuilder = new StringBuilder();

        while (matcher.find()) {
            String tagName = matcher.group(1); // "b" lub "i"
            String innerText = matcher.group(2); // tekst w środku

            // "Odpolszczamy" tylko środek tagu
            String sanitizedText = removePolishDiacritics(innerText);

            // Składamy z powrotem w całość (używamy quoteReplacement na wypadek znaków specjalnych)
            matcher.appendReplacement(cleanContentBuilder, "<" + tagName + ">" + java.util.regex.Matcher.quoteReplacement(sanitizedText) + "</" + tagName + ">");
        }
        matcher.appendTail(cleanContentBuilder);

        String cleanContent = cleanContentBuilder.toString();

        // 3. Rysujemy komórkę
        Row<PDPage> row = table.createRow(8f);
        Cell<PDPage> cell = row.createCell(100, cleanContent);

        cell.setFont(font);
        cell.setFontSize(this.fontSize - 1);
        cell.setFillColor(new Color(255, 253, 231));
        cell.setTextColor(new Color(70, 70, 70));
        cell.setAlign(HorizontalAlignment.CENTER);
        cell.setValign(VerticalAlignment.MIDDLE);
        cell.setTopPadding(6f);
        cell.setBottomPadding(6f);
        cell.setLineSpacing(1.2f);
    }

    private void addHeaderRow() {
        Row<PDPage> headerRow = table.createRow(10f);

        // Zmienione proporcje: Oficjum 40%, Wykonujący 60%
        Cell<PDPage> taskCell = headerRow.createCell(40, "Oficjum");
        styleHeaderCell(taskCell);

        Cell<PDPage> userCell = headerRow.createCell(60, "Wykonujący");
        styleHeaderCell(userCell);

        table.addHeaderRow(headerRow);
    }

    private void addShiftRow(ScheduleShortInfoForTask baseTask, ScheduleShortInfoForTask shift2Task) {
        Row<PDPage> row = table.createRow(5f);

        // Komórka nazwy oficjum (zajmuje 40% szerokości)
        String taskName = AbstractPdfGenerator.sanitizeTextForPdf(baseTask.taskName());
        Cell<PDPage> taskCell = row.createCell(40, taskName);
        styleTaskCell(taskCell);

        // Wykonawcy I Zmiany (lub Całości)
        String users1 = baseTask.usersInfoStrings().isEmpty() ? "" : String.join("<br>", baseTask.usersInfoStrings());
        users1 = AbstractPdfGenerator.sanitizeTextForPdf(users1);

        if (shift2Task != null) {
            // WYKRYTO 2 ZMIANY - Rozbijamy prawe 60% na dwie komórki po 30%
            String users2 = shift2Task.usersInfoStrings().isEmpty() ? "" : String.join("<br>", shift2Task.usersInfoStrings());
            users2 = AbstractPdfGenerator.sanitizeTextForPdf(users2);

            Cell<PDPage> cell1 = row.createCell(30, users1);
            styleCell(cell1);

            Cell<PDPage> cell2 = row.createCell(30, users2);
            styleCell(cell2);
        } else {
            // BRAK 2 ZMIANY - Brat wypełnia całe 60% wolnej przestrzeni
            Cell<PDPage> cell1 = row.createCell(60, users1);
            styleCell(cell1);
        }
    }

    private void addSectionHeaderRow(String sectionName) {
        Row<PDPage> row = table.createRow(10f);
        Cell<PDPage> cell = row.createCell(100, sectionName.toUpperCase());
        cell.setFont(font);
        cell.setFontSize(this.fontSize + 1);
        cell.setFillColor(new Color(210, 230, 245));
        cell.setTextColor(Color.BLACK);
        cell.setAlign(HorizontalAlignment.CENTER);
        cell.setValign(VerticalAlignment.MIDDLE);
        cell.setTopPadding(3f);
        cell.setBottomPadding(3f);
    }

    private void styleHeaderCell(Cell<PDPage> cell) {
        cell.setFont(font);
        cell.setFontSize(this.fontSize);
        cell.setFillColor(this.myGray);
        cell.setTextColor(Color.BLACK);
        cell.setAlign(HorizontalAlignment.CENTER);
        cell.setValign(VerticalAlignment.MIDDLE);
    }

    private void styleTaskCell(Cell<PDPage> cell) {
        cell.setFont(font);
        cell.setFontSize(this.fontSize);
        cell.setAlign(HorizontalAlignment.CENTER);
        cell.setValign(VerticalAlignment.MIDDLE);
        cell.setLineSpacing(1.2f);
    }

    private void styleCell(Cell<PDPage> cell) {
        cell.setFont(font);
        cell.setFontSize(this.fontSize);
        cell.setAlign(HorizontalAlignment.CENTER);
        cell.setValign(VerticalAlignment.MIDDLE);
        cell.setLineSpacing(1.2f);
    }

    private String removePolishDiacritics(String text) {
        if (text == null) return "";
        return text.replace("ą", "a").replace("Ą", "A")
                .replace("ć", "c").replace("Ć", "C")
                .replace("ę", "e").replace("Ę", "E")
                .replace("ł", "l").replace("Ł", "L")
                .replace("ń", "n").replace("Ń", "N")
                .replace("ś", "s").replace("Ś", "S")
                .replace("ź", "z").replace("Ź", "Z")
                .replace("ż", "z").replace("Ż", "Z");
        // "ó" i "Ó" zostają nienaruszone, bo WinAnsiEncoding je obsługuje
    }
}