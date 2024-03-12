package org.verduttio.dominicanappbackend.service;

import be.quodlibet.boxable.BaseTable;
import be.quodlibet.boxable.Cell;
import be.quodlibet.boxable.Row;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.dto.schedule.ScheduleShortInfoForUser;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class PdfService {

    private final ScheduleService scheduleService;

    @Autowired
    public PdfService(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

//    public byte[] generateSchedulePdf(List<Schedule> schedules) throws IOException {
//        try (PDDocument document = new PDDocument()) {
//            PDPage page = new PDPage();
//            document.addPage(page);
//
//            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
//                contentStream.beginText();
//                PDFont font = PDType0Font.load(document, new File("c:/windows/fonts/calibri.ttf"));
//                contentStream.setFont(font, 12);
//                contentStream.setLeading(14.5f);
//                contentStream.newLineAtOffset(25, 700);
//
//                for (Schedule schedule : schedules) {
//                    String line = schedule.getUser().getName() + " " + schedule.getUser().getSurname() +
//                            " | " + schedule.getTask().getName() + " | " + schedule.getDate();
//                    System.out.println("line: " + line);
//                    contentStream.showText(line);
//                    contentStream.newLine();
//                }
//
//                contentStream.endText();
//            }
//
//            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
//            document.save(byteArrayOutputStream);
//            return byteArrayOutputStream.toByteArray();
//        }
//    }
//
//    public byte[] generateScheduleUsersTasksPdf() throws IOException {
//        List<ScheduleShortInfoForUser> schedules = scheduleService.getScheduleShortInfoForEachUserForSpecifiedWeek(LocalDate.now().minusDays(8), LocalDate.now().minusDays(2));
//
//
//        try (PDDocument document = new PDDocument()) {
//            PDPage page = new PDPage();
//            document.addPage(page);
//
//            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
//                contentStream.beginText();
//                PDFont font = PDType0Font.load(document, new File("c:/windows/fonts/calibri.ttf"));
//                contentStream.setFont(PDType1Font.TIMES_ROMAN, 14);
////                contentStream.setFont(font, 12);
//                contentStream.setLeading(14.5f);
//                contentStream.newLineAtOffset(25, 700);
//
//                BaseTable table = new BaseTable(10, 10000, 20, 9000, 15, document, page, true,
//                        true);
//
////Create Header row
//                Row<PDPage> headerRow = table.createRow(15f);
//                Cell<PDPage> cell = headerRow.createCell(100, "Awesome Facts About Belgium");
//                cell.setFont(PDType1Font.TIMES_ROMAN);
//                cell.setFillColor(Color.BLACK);
//                table.addHeaderRow(headerRow);
//
//                String[] array = {"Leopard lives in Sudan South", "South Africa", "Rock rock back for", "We will rock you"};
//                List<String[]> facts = new ArrayList<>();
//                facts.add(array);
//                for (String[] fact : facts) {
//                    Row<PDPage> row = table.createRow(10f);
//                    cell = row.createCell((100 / 3.0f) * 2, fact[0] );
//                    for (int i = 1; i < fact.length; i++) {
//                        cell = row.createCell((100 / 9f), fact[i]);
//                    }
//                }
//                table.draw();
//
//                contentStream.endText();
//            }
//
//            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
//            document.save(byteArrayOutputStream);
//            return byteArrayOutputStream.toByteArray();
//        }
//
//    }
//
//    public byte[] generateScheduleUsersTasksPdf2() throws IOException {
//        PDDocument doc = new PDDocument();
//        PDPage page = new PDPage();
//        //Create a landscape page
//        page.setMediaBox(new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth()));
//        doc.addPage(page);
//        //Initialize table
//        float margin = 10;
//        float tableWidth = page.getMediaBox().getWidth() - (2 * margin);
//        float yStartNewPage = page.getMediaBox().getHeight() - (2 * margin);
//        float yStart = yStartNewPage;
//        float bottomMargin = 0;
//
//        List<ScheduleShortInfoForUser> schedules = scheduleService.getScheduleShortInfoForEachUserForSpecifiedWeek(LocalDate.now().minusDays(8), LocalDate.now().minusDays(2));
//
//        //Create the data
//        List<List> data = new ArrayList<>();
//        data.add(new ArrayList<>(
//                Arrays.asList("Imię i nazwisko", "Zadania")));
//        for (ScheduleShortInfoForUser schedule : schedules) {
//            data.add(new ArrayList<>(
//                    Arrays.asList(schedule.userName() + " " + schedule.userSurname(), String.join(", ", schedule.tasksInfoStrings()))));
//        }
//
//        BaseTable dataTable = new BaseTable(yStart, yStartNewPage, bottomMargin, tableWidth, margin, doc, page, true,
//                true);
//        DataTable t = new DataTable(dataTable, page);
//        t.addListToTable(data, DataTable.HASHEADER);
//        dataTable.draw();
//
//        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
//        doc.save(byteArrayOutputStream);
//        doc.close();
//        return byteArrayOutputStream.toByteArray();
//    }

    public byte[] generateScheduleUsersTasksPdfTEST() throws IOException {
        // Set margins
        float margin = 10;

        String[] array = {"ABCSEDFSFDFSDF", "ONE", "TWO", "THREE"};
        List<String[]> facts = new ArrayList<>();
        facts.add(array);

        // Initialize Document
        PDDocument doc = new PDDocument();
        PDFont fontCalibri = PDType0Font.load(doc, new File("c:/windows/fonts/calibri.ttf"));
        PDPage page = addNewPage(doc);
        float yStartNewPage = page.getMediaBox().getHeight() - (2 * margin);

        // Initialize table
        float tableWidth = page.getMediaBox().getWidth() - (2 * margin);
        boolean drawContent = true;
        float yStart = yStartNewPage;
        float bottomMargin = 70;
        BaseTable table = new BaseTable(yStart, yStartNewPage, bottomMargin, tableWidth, margin, doc, page, true,
                drawContent);

        // Create Header row
        Row<PDPage> headerRow = table.createRow(15f);
        Cell<PDPage> cell = headerRow.createCell(100, "Awesome Facts About ...");
        cell.setFont(fontCalibri);
        cell.setFillColor(Color.BLACK);
        cell.setTextColor(Color.WHITE);

        table.addHeaderRow(headerRow);

        // Create 2 column row
        Row<PDPage> row = table.createRow(15f);
        cell = row.createCell(30, "Source:");
        cell.setFont(fontCalibri);

        cell = row.createCell(70, "..............");
        cell.setFont(fontCalibri);

        // Create Fact header row
        Row<PDPage> factHeaderrow = table.createRow(15f);

        cell = factHeaderrow.createCell((100 / 3f) * 2, "Fact");
        cell.setFont(fontCalibri);
        cell.setFontSize(6);
        cell.setFillColor(Color.LIGHT_GRAY);

        cell = factHeaderrow.createCell((100 / 3f), "Tags");
        cell.setFillColor(Color.LIGHT_GRAY);
        cell.setFont(PDType1Font.HELVETICA);
        cell.setFontSize(6);

        // Add multiple rows with random facts about Belgium
        for (String[] fact : facts) {

            row = table.createRow(10f);
            cell = row.createCell((100 / 3f) * 2, fact[0]);
            cell.setFont(fontCalibri);
            cell.setFontSize(6);

            for (int i = 1; i < fact.length; i++) {
                    cell = row.createCell((100 / 9f), fact[i]);
                    cell.setFont(fontCalibri);
                    cell.setFontSize(6);
                    // Set colors
                    if (fact[i].contains("aaa"))
                        cell.setFillColor(Color.yellow);
                    if (fact[i].contains("bbb"))
                        cell.setTextColor(Color.GREEN);
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

    public byte[] generateSchedulePdfForUsers() throws IOException {
        List<ScheduleShortInfoForUser> schedules = scheduleService.getScheduleShortInfoForEachUserForSpecifiedWeek(LocalDate.now().minusDays(8), LocalDate.now().minusDays(2));

        // Set margins
        float margin = 10;

        // Initialize Document
        PDDocument doc = new PDDocument();
        PDFont fontCalibri = PDType0Font.load(doc, new File("c:/windows/fonts/calibri.ttf"));
        PDPage page = addNewPage(doc);
        float yStartNewPage = page.getMediaBox().getHeight() - (2 * margin);

        // Initialize table
        float tableWidth = page.getMediaBox().getWidth() - (2 * margin);
        boolean drawContent = true;
        float bottomMargin = 70;
        BaseTable table = new BaseTable(yStartNewPage, yStartNewPage, bottomMargin, tableWidth, margin, doc, page, true, drawContent);

        // Create Header row
        Row<PDPage> headerRow = table.createRow(15f);
        Cell<PDPage> cell = headerRow.createCell(50, "Imię i nazwisko");
        cell.setFont(fontCalibri);
        cell.setFillColor(Color.BLACK);
        cell.setTextColor(Color.WHITE);

        cell = headerRow.createCell(50, "Zadanie");
        cell.setFont(fontCalibri);
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

}
