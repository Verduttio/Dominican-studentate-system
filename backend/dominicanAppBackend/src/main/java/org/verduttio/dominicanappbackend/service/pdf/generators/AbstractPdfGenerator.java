package org.verduttio.dominicanappbackend.service.pdf.generators;

import be.quodlibet.boxable.BaseTable;
import be.quodlibet.boxable.line.LineStyle;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.verduttio.dominicanappbackend.service.schedule.ScheduleService;
import org.verduttio.dominicanappbackend.validation.DateValidator;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.time.LocalDate;

public abstract class AbstractPdfGenerator implements PdfGenerator {

    public static final float MARGIN = 15;
    public static final String FONT_PATH = "Baloo-Regular.ttf";
    public static final Color COLOR_LIGHT_GRAY = new Color(247, 247, 247);  // brighter mode
    public static final LineStyle BORDER_LINE_STYLE = new LineStyle(Color.BLACK, 0.4f);

    protected final ScheduleService scheduleService;
    protected PDFont font;
    protected PDDocument document;

    protected AbstractPdfGenerator(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    protected void initializeDocument() throws IOException {
        document = new PDDocument();
        font = PDType0Font.load(document, new File(FONT_PATH));
    }

    protected PDPage addNewPage(PDRectangle size) {
        PDPage page = new PDPage(size);
        document.addPage(page);
        return page;
    }

    protected float addTitle(PDPage page, String title) throws IOException {
        float titleWidth = font.getStringWidth(title) / 1000 * 16; // Font size 16
        float titleHeight = font.getFontDescriptor().getFontBoundingBox().getHeight() / 1000 * 16;
        float startX = (page.getMediaBox().getWidth()) / 2 - titleWidth / 2;
        float startY = page.getMediaBox().getHeight() - MARGIN - titleHeight;

        try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
            contentStream.beginText();
            contentStream.setFont(font, 16);
            contentStream.newLineAtOffset(startX, startY);
            contentStream.showText(title);
            contentStream.endText();
        }
        return startY - titleHeight;
    }

    protected BaseTable initializeTable(PDPage page, float startY) throws IOException {
        return new BaseTable(
                startY,
                page.getMediaBox().getHeight() - MARGIN,
                MARGIN,
                page.getMediaBox().getWidth() - 2 * MARGIN,
                MARGIN,
                document,
                page,
                true,
                true
        );
    }

    protected byte[] finalizeDocument() throws IOException {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        document.save(byteArrayOutputStream);
        document.close();
        return byteArrayOutputStream.toByteArray();
    }

    protected void validateDateRange(LocalDate from, LocalDate to) {
        if (!DateValidator.isStartDateMax6daysBeforeEndDate(from, to)) {
            throw new IllegalArgumentException(DateValidator.isStartDateMax6daysBeforeEndDateError);
        }
    }
}
