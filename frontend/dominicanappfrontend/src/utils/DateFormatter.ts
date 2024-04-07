import {format, parse, addDays} from "date-fns";
import {daysOrder as daysOfWeek} from "../models/DayOfWeek";

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

    getNextDateForDayOfWeek(startDate:string, dayOfWeek:string):string {
        const start = parse(startDate, this.inputFormat, new Date());
        return format(addDays(start, daysOfWeek.indexOf(dayOfWeek)), this.outputFormat);
    }
}