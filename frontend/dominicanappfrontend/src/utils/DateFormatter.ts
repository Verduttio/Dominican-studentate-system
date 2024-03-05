import {format, parse, addDays} from "date-fns";

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
        const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        const start = parse(startDate, this.inputFormat, new Date());
        let dayIndex = daysOfWeek.indexOf(dayOfWeek);
        let startDayIndex = start.getDay() === 0 ? 6 : (start.getDay() - 1);

        // console.log('startDayIndex', startDayIndex);
        // console.log('dayIndex', dayIndex);

        if (dayIndex === -1) {
            throw new Error('Invalid day of the week');
        }

        let daysToAdd = dayIndex + startDayIndex;
        if (daysToAdd < 0) {
            daysToAdd += 7;
        }

        return format(addDays(start, daysToAdd), this.outputFormat);
    }
}