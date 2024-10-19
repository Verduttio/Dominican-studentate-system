package org.verduttio.dominicanappbackend.service.pdf.generators;

import java.io.IOException;

public interface PdfGenerator {
    byte[] generatePdf() throws IOException;
}