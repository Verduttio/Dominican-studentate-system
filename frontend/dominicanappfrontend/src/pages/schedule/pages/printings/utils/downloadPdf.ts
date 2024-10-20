import axios, { AxiosError } from 'axios';

export const downloadPdf = async (
    url: string,
    filename: string,
    setError: (error: string | null) => void,
    setLoading: (loading: boolean) => void
) => {
    setLoading(true);
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'blob',
            withCredentials: true,
        });
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const serverError = err as AxiosError<{ message?: string }>;
            if (serverError.response) {
                setError('Błąd podczas pobierania PDF:' + serverError.response.data);
            } else {
                setError('Problem z połączeniem sieciowym');
            }
        } else {
            setError('Nieoczekiwany błąd:' + err);
        }
    } finally {
        setLoading(false);
    }
};
