interface DateTimeParts {
    date: string;
    time: string;
}

export const extractDateTimeParts = (localDateTime: string): DateTimeParts => {
    const [datePart, timePart] = localDateTime.split('T');
    const [year, month, day] = datePart.split('-');
    const formattedDate = `${day}.${month}.${year}`;
    const time = timePart.substring(0, 5); // extract HH:mm

    return {
        date: formattedDate,
        time: time
    };
};

export function formatEntryDate(entryDate: string) {
    const { date, time } = extractDateTimeParts(entryDate);
    return `${date} ${time}`;
}