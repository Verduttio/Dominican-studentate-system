import React, { useCallback, useEffect, useState } from "react";
import { WishesPageDTO } from "../../models/Interfaces";
import useHttp from "../../services/UseHttp";
import { backendUrl } from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";

const WishesPage: React.FC = () => {
    const [data, setData] = useState<WishesPageDTO | null>(null);

    const {
        error,
        loading,
        request
    } = useHttp(`${backendUrl}/api/wishes`, "GET");

    const loadData = useCallback(() => {
        request(null, (response: WishesPageDTO) => {
            setData(response);
        });
    }, [request]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading || (!data && !error)) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <AlertBox text={error} type="danger" width="500px" />;
    }

    if (!data) {
        return <AlertBox
            text="Nie udało się pobrać danych życzeń."
            type="danger"
            width="500px"
        />;
    }

    return (
        <div className="fade-in mt-4">
            <h2 className="entity-header-dynamic-size text-center mb-4">
                {data.title}
            </h2>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0">Statystyki przypisań</h5>
                </div>

                <div className="card-body">
                    {data.statistics.length === 0 ? (
                        <p className="text-muted mb-0">
                            Żaden Brat nie ma jeszcze przypisanych życzeń.
                        </p>
                    ) : (
                        <div className="d-flex flex-wrap gap-2">
                            {data.statistics.map((stat) => (
                                <span
                                    key={stat.userId}
                                    className="badge bg-light text-dark border p-2"
                                    style={{ fontSize: "0.95rem" }}
                                >
                                    {stat.name} {stat.surname}: {stat.count}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="card shadow-sm mb-5">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Lista życzeń</h5>

                    <span className="badge bg-light text-dark">
                        {data.wishes.length} wpisów
                    </span>
                </div>

                <div className="card-body p-0">
                    {data.wishes.length === 0 ? (
                        <p className="text-muted text-center p-4 mb-0">
                            Nie dodano jeszcze żadnych życzeń.
                        </p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover align-middle mb-0">
                                <thead className="table-light text-center">
                                    <tr>
                                        <th>Adresat</th>
                                        <th>Adres e-mail</th>
                                        <th>Forma</th>
                                        <th>Brat</th>
                                        <th>Wiadomość</th>

                                        {data.admin && (
                                            <th>Czy wysłane</th>
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {data.wishes.map((wish) => (
                                        <tr key={wish.id}>
                                            <td className="fw-semibold">
                                                {wish.recipient}
                                            </td>

                                            <td>
                                                {wish.email || (
                                                    <span className="text-muted fst-italic">
                                                        Brak adresu
                                                    </span>
                                                )}
                                            </td>

                                            <td className="text-center">
                                                {wish.letter ? (
                                                    <span className="badge bg-secondary">
                                                        Listownie
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-primary">
                                                        E-mail
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                {wish.userName ? (
                                                    wish.userName
                                                ) : (
                                                    <span className="text-muted fst-italic">
                                                        Nieprzypisane
                                                    </span>
                                                )}
                                            </td>

                                            <td style={{ minWidth: "220px", whiteSpace: "pre-wrap" }}>
                                                {wish.message || (
                                                    <span className="text-muted fst-italic">
                                                        Brak wiadomości
                                                    </span>
                                                )}
                                            </td>

                                            {data.admin && (
                                                <td className="text-center">
                                                    {wish.sent ? (
                                                        <span className="badge bg-success">
                                                            Tak
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-warning text-dark">
                                                            Nie
                                                        </span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WishesPage;