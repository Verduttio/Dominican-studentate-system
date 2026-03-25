package org.verduttio.dominicanappbackend.service.pdf.builders;

import be.quodlibet.boxable.BaseTable;
import be.quodlibet.boxable.Cell;
import be.quodlibet.boxable.HorizontalAlignment;
import be.quodlibet.boxable.Row;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.verduttio.dominicanappbackend.domain.obstacle.Obstacle;
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
        createHeaderCell(dayOfWeekRow, params.nameCellWidth, params.fontSize, "", Color.LIGHT_GRAY);

        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            String dayOfWeek = DateUtils.getDayOfWeekPL(date.getDayOfWeek());
            createHeaderCell(dayOfWeekRow, (float) params.taskCellWidth / daysBetween(), params.fontSize, dayOfWeek, COLOR_LIGHT_GRAY);
        }
        table.addHeaderRow(dayOfWeekRow);
    }

    private void addDateHeaderRow(TableParameters params) {
        Row<PDPage> dateRow = table.createRow(params.rowHeight);
        createHeaderCell(dateRow, params.nameCellWidth, params.fontSize, "Brat", Color.LIGHT_GRAY);

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

    // --- ZMODYFIKOWANE METODY DLA MACIERZY Z SEKCJAMI ---

    public void buildTableWithSections(
        List<org.verduttio.dominicanappbackend.dto.user.UserSchedulesOnDaysWithSectionsDTO> userSchedules,
        java.util.Map<LocalDate, List<String>> activeSectionsPerDay,
        List<Obstacle> eventObstacles) throws IOException {

        // Zliczamy całkowitą ilość potrzebnych kolumn TYLKO na przestrzeli dni od 'from' do 'to' (na jednej stronie)
        int totalColumnsForThisPage = 0;
        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            totalColumnsForThisPage += activeSectionsPerDay.getOrDefault(date, Collections.singletonList("")).size();
        }
        if (totalColumnsForThisPage == 0) totalColumnsForThisPage = 1;

        TableParameters params = calculateTableParametersForSections(totalColumnsForThisPage);

        // Wyliczamy precyzyjną szerokość jednej kolumny raz i przekazujemy dalej
        float singleColumnWidth = (float) params.taskCellWidth / totalColumnsForThisPage;

        addDayOfWeekHeaderRowWithSections(params, activeSectionsPerDay, singleColumnWidth);
        addDateHeaderRowWithSections(params, activeSectionsPerDay, singleColumnWidth);
        addSectionHeaderRow(params, activeSectionsPerDay, singleColumnWidth);
        addUserDataRowsWithSections(userSchedules, params, activeSectionsPerDay, singleColumnWidth, eventObstacles);
        table.draw();
    }

    private TableParameters calculateTableParametersForSections(int totalColumns) {
        int fontSize; int nameCellWidth; int rowHeight;
        if (totalColumns < 16) {
            fontSize = 8; nameCellWidth = 14; rowHeight = 10;
        } else if (totalColumns < 40) {
            fontSize = 6; nameCellWidth = 8; rowHeight = 7;
        } else {
            fontSize = 4; nameCellWidth = 6; rowHeight = 6;
        }
        int taskCellWidth = 100 - nameCellWidth;
        return new TableParameters(fontSize, nameCellWidth, taskCellWidth, rowHeight);
    }

    private void addDayOfWeekHeaderRowWithSections(TableParameters params, java.util.Map<LocalDate, List<String>> activeSectionsPerDay, float singleColumnWidth) {
        Row<PDPage> row = table.createRow(params.rowHeight);
        createHeaderCell(row, params.nameCellWidth, params.fontSize, "", Color.LIGHT_GRAY);

        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            List<String> sections = activeSectionsPerDay.getOrDefault(date, Collections.singletonList(""));
            String dayOfWeek = DateUtils.getDayOfWeekPL(date.getDayOfWeek());
            createHeaderCell(row, singleColumnWidth * sections.size(), params.fontSize, dayOfWeek, COLOR_LIGHT_GRAY);
        }
        table.addHeaderRow(row);
    }

    private void addDateHeaderRowWithSections(TableParameters params, java.util.Map<LocalDate, List<String>> activeSectionsPerDay, float singleColumnWidth) {
        Row<PDPage> row = table.createRow(params.rowHeight);
        createHeaderCell(row, params.nameCellWidth, params.fontSize, "Brat", Color.LIGHT_GRAY);

        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            List<String> sections = activeSectionsPerDay.getOrDefault(date, Collections.singletonList(""));
            String dateStr = DateUtils.getDayMonthFormat(date);
            createHeaderCell(row, singleColumnWidth * sections.size(), params.fontSize, dateStr, COLOR_LIGHT_GRAY);
        }
        table.addHeaderRow(row);
    }

    private void addSectionHeaderRow(TableParameters params, java.util.Map<LocalDate, List<String>> activeSectionsPerDay, float singleColumnWidth) {
        Row<PDPage> row = table.createRow(params.rowHeight);
        createHeaderCell(row, params.nameCellWidth, params.fontSize, "Pora dnia", Color.LIGHT_GRAY);

        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            List<String> sections = activeSectionsPerDay.getOrDefault(date, Collections.singletonList(""));
            for (String section : sections) {
                createHeaderCell(row, singleColumnWidth, params.fontSize, section.isEmpty() ? "-" : section, new Color(230, 240, 255));
            }
        }
        table.addHeaderRow(row);
    }

    private boolean hasObstacle(List<Obstacle> obstacles, Long userId, LocalDate date, String section) {
        if (obstacles == null || obstacles.isEmpty()) return false;

        return obstacles.stream()
                .filter(o -> o.getUser() != null && o.getUser().getId().equals(userId))
                // Sprawdzamy czy nasza data znajduje się w przedziale czasowym przeszkody
                .filter(o -> !date.isBefore(o.getFromDate()) && !date.isAfter(o.getToDate()))
                .anyMatch(o -> {
                    // Jeżeli przeszkoda nie ma przypisanych sekcji, oznacza to "Cały dzień"
                    if (o.getTaskSections() == null || o.getTaskSections().isEmpty()) return true;
                    // W przeciwnym razie sprawdzamy, czy przeszkoda obejmuje tę konkretną porę
                    return o.getTaskSections().stream().anyMatch(s -> s.getName().equals(section));
                });
    }

    private void addUserDataRowsWithSections(
            List<org.verduttio.dominicanappbackend.dto.user.UserSchedulesOnDaysWithSectionsDTO> userSchedules,
            TableParameters params,
            java.util.Map<LocalDate, List<String>> activeSectionsPerDay,
            float singleColumnWidth,
            List<Obstacle> eventObstacles) {
        int rowIndex = 0;

        for (org.verduttio.dominicanappbackend.dto.user.UserSchedulesOnDaysWithSectionsDTO userDTO : userSchedules) {
            Row<PDPage> row = table.createRow(params.rowHeight);
            UserShortInfo userInfo = userDTO.getUserShortInfo();
            String fullName = userInfo.getName() + " " + userInfo.getSurname();
            Color rowColor = (rowIndex % 2 == 1) ? COLOR_LIGHT_GRAY : Color.WHITE;

            createDataCell(row, params.nameCellWidth, params.fontSize, fullName, new Color(217, 225, 242));

            for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
                List<String> sections = activeSectionsPerDay.getOrDefault(date, Collections.singletonList(""));
                java.util.Map<String, List<String>> tasksForDate = userDTO.getSchedules().getOrDefault(date, Collections.emptyMap());

                for (String section : sections) {
                    List<String> tasks = tasksForDate.getOrDefault(section, Collections.emptyList());
                    String tasksStr = String.join(", ", tasks);

                    // LOGIKA DODAWANIA 'X' DLA PRZESZKÓD
                    // Jeśli brat nie ma tu zadań, sprawdzamy czy ma zatwierdzoną przeszkodę
                    if (tasksStr.isEmpty() && hasObstacle(eventObstacles, userInfo.getId(), date, section)) {
                        tasksStr = "X";
                    }

                    createDataCell(row, singleColumnWidth, params.fontSize, tasksStr, rowColor);
                }
            }
            rowIndex++;
        }
    }
}