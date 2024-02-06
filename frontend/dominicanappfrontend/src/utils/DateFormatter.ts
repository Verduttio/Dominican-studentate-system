import {format, parse} from "date-fns";

export class DateFormatter {
    private readonly inputFormat: string;
    private readonly outputFormat: string;

    constructor(inputFormat: string, outputFormat: string) {
        this.inputFormat = inputFormat;
        this.outputFormat = outputFormat;
    }

    formatDate(inputDate: string): string | null {
        try {
            const parsedDate = parse(inputDate, this.inputFormat, new Date());
            return format(parsedDate, this.outputFormat);
        } catch (error) {
            return null;
        }
    }
}