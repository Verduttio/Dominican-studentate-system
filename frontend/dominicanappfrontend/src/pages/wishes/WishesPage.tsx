import React, { useCallback, useEffect, useState } from "react";
import { WishesPageDTO } from "../../models/Interfaces";
import useHttp from "../../services/UseHttp";
import { getCurrentUser } from "../../services/CurrentUserCookieService";
import { backendUrl } from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";
import ConfirmDeletionPopup from "../../components/ConfirmDeletionPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPencilAlt,
    faTrash,
    faCheck,
    faXmark,
    faRotateLeft
} from "@fortawesome/free-solid-svg-icons";

type AdminWishChanges = {
    recipient?: string;
    letter?: boolean;
    userId?: number | null;
};

const WishesPage: React.FC = () => {
    const [data, setData] = useState<WishesPageDTO | null>(null);

    const [editingEmailId, setEditingEmailId] = useState<number | null>(null);
    const [emailDraft, setEmailDraft] = useState("");

    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [messageDraft, setMessageDraft] = useState("");

    const [recipientDrafts, setRecipientDrafts] = useState<Record<number, string>>({});
    const [assignmentDrafts, setAssignmentDrafts] = useState<Record<number, string>>({});

    const [titleDraft, setTitleDraft] = useState("");
    const [notice, setNotice] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    const [wishToDelete, setWishToDelete] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState(false);

    const {
        error,
        loading,
        request
    } = useHttp(`${backendUrl}/api/wishes`, "GET");

    const {
        error: claimError,
        loading: claimLoading,
        request: claimWishRequest
    } = useHttp<null>(`${backendUrl}/api/wishes`, "POST");

    const {
        error: releaseError,
        loading: releaseLoading,
        request: releaseWishRequest
    } = useHttp<null>(`${backendUrl}/api/wishes`, "DELETE");

    const {
        error: emailError,
        loading: emailLoading,
        request: updateEmailRequest
    } = useHttp<{ email: string }>(`${backendUrl}/api/wishes`, "PATCH");

    const {
        error: messageError,
        loading: messageLoading,
        request: updateMessageRequest
    } = useHttp<{ message: string }>(`${backendUrl}/api/wishes`, "PATCH");

    const {
        error: adminWishError,
        loading: adminWishLoading,
        request: updateAdminWishRequest
    } = useHttp<{
        recipient: string;
        letter: boolean;
        userId: number | null;
    }>(`${backendUrl}/api/wishes`, "PATCH");

    const {
        error: settingsError,
        loading: settingsLoading,
        request: updateSettingsRequest
    } = useHttp<{
        title: string;
        visible: boolean;
    }>(`${backendUrl}/api/wishes/settings`, "PATCH");

    const {
        error: resetError,
        loading: resetLoading,
        request: resetWishesRequest
    } = useHttp<null>(`${backendUrl}/api/wishes/reset`, "POST");

    const loadData = useCallback(() => {
        request(null, (response: WishesPageDTO) => {
            setData(response);
            setTitleDraft(response.title);
        });
    }, [request]);

    const {
        error: deleteError,
        loading: deleteLoading,
        request: deleteWishRequest
    } = useHttp<null>(`${backendUrl}/api/wishes`, "DELETE");

    useEffect(() => {
        loadData();
    }, [loadData]);

    const currentUserId = getCurrentUser()?.id;

    const claimWish = (wishId: number) => {
        setNotice(null);

        claimWishRequest(
            null,
            loadData,
            false,
            `${backendUrl}/api/wishes/${wishId}/claim`,
            "POST"
        );
    };

    const releaseWish = (wishId: number) => {
        setNotice(null);

        releaseWishRequest(
            null,
            loadData,
            false,
            `${backendUrl}/api/wishes/${wishId}/claim`,
            "DELETE"
        );
    };

    const startEmailEditing = (wishId: number, currentEmail: string | null) => {
        setEditingEmailId(wishId);
        setEmailDraft(currentEmail ?? "");
    };

    const cancelEmailEditing = () => {
        setEditingEmailId(null);
        setEmailDraft("");
    };

    const saveEmail = (wishId: number) => {
        const email = emailDraft.trim();

        if (!email) {
            return;
        }

        setNotice(null);

        updateEmailRequest(
            { email },
            () => {
                setEditingEmailId(null);
                setEmailDraft("");
                loadData();
            },
            false,
            `${backendUrl}/api/wishes/${wishId}/email`,
            "PATCH"
        );
    };

    const startMessageEditing = (wishId: number, currentMessage: string | null) => {
        setEditingMessageId(wishId);
        setMessageDraft(currentMessage ?? "");
    };

    const cancelMessageEditing = () => {
        setEditingMessageId(null);
        setMessageDraft("");
    };

    const saveMessage = (wishId: number) => {
        setNotice(null);

        updateMessageRequest(
            { message: messageDraft },
            () => {
                setEditingMessageId(null);
                setMessageDraft("");
                loadData();
            },
            false,
            `${backendUrl}/api/wishes/${wishId}/message`,
            "PATCH"
        );
    };

    const saveAdminWish = (wishId: number, changes: AdminWishChanges = {}) => {
        const wish = data?.wishes.find(item => item.id === wishId);

        if (!wish) {
            return;
        }

        const recipient =
            changes.recipient ??
            recipientDrafts[wishId] ??
            wish.recipient;

        if (!recipient.trim()) {
            setLocalError("Nazwa adresata nie może być pusta.");
            return;
        }

        const rawUserId =
            assignmentDrafts[wishId] ??
            (wish.userId === null ? "" : String(wish.userId));

        const userId = Object.prototype.hasOwnProperty.call(changes, "userId")
            ? (changes.userId ?? null)
            : (rawUserId === "" ? null : Number(rawUserId));

        setLocalError(null);
        setNotice(null);

        updateAdminWishRequest(
            {
                recipient: recipient.trim(),
                letter: changes.letter ?? wish.letter,
                userId
            },
            () => {
                setRecipientDrafts(previous => {
                    const updated = { ...previous };
                    delete updated[wishId];
                    return updated;
                });

                setAssignmentDrafts(previous => {
                    const updated = { ...previous };
                    delete updated[wishId];
                    return updated;
                });

                setNotice("Zapisano zmiany wpisu.");
                loadData();
            },
            false,
            `${backendUrl}/api/wishes/${wishId}/admin`,
            "PATCH"
        );
    };

    const saveTitle = () => {
        if (!data || !titleDraft.trim()) {
            setLocalError("Nagłówek nie może być pusty.");
            return;
        }

        setLocalError(null);
        setNotice(null);

        updateSettingsRequest(
            {
                title: titleDraft.trim(),
                visible: data.visible
            },
            () => {
                setEditingTitle(false);
                setNotice("Zapisano temat wiadomości e-mail.");
                loadData();
            },
            false,
            `${backendUrl}/api/wishes/settings`,
            "PATCH"
        );
    };

    const handleDeleteWish = () => {
        if (wishToDelete === null) {
            return;
        }

        deleteWishRequest(
            null,
            () => {
                setWishToDelete(null);
                setNotice("Wpis został usunięty.");
                loadData();
            },
            false,
            `${backendUrl}/api/wishes/${wishToDelete}`,
            "DELETE"
        );
    };

    const resetAllWishes = () => {
        const confirmed = window.confirm(
            "Czy na pewno chcesz zresetować wszystkie życzenia?\n\n" +
            "Zostaną usunięte treści wiadomości, statusy wysłania zostaną ustawione na „Nie”, " +
            "a wszystkie przypisania braci zostaną usunięte.\n\n" +
            "Adresaci, adresy oraz forma (e-mail/list) pozostaną bez zmian."
        );

        if (!confirmed) {
            return;
        }

        setLocalError(null);
        setNotice(null);

        resetWishesRequest(
            null,
            (resetCount: number) => {
                setRecipientDrafts({});
                setAssignmentDrafts({});
                setEditingEmailId(null);
                setEditingMessageId(null);
                setNotice(`Reset zakończony. Zresetowano wpisów: ${resetCount}.`);
                loadData();
            },
            false,
            `${backendUrl}/api/wishes/reset`,
            "POST"
        );
    };

    if (!data && loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <AlertBox text={error} type="danger" width="500px" />;
    }

    if (!data) {
        return (
            <AlertBox
                text="Nie udało się pobrać danych życzeń."
                type="danger"
                width="500px"
            />
        );
    }

    const mutationErrors = [
        claimError,
        releaseError,
        emailError,
        messageError,
        adminWishError,
        settingsError,
        resetError,
        deleteError,
        localError
    ].filter((message): message is string => Boolean(message));

    return (
        <div className="fade-in mt-4">
            {wishToDelete !== null && (
                <ConfirmDeletionPopup
                    onHandle={handleDeleteWish}
                    onClose={() => setWishToDelete(null)}
                />
            )}

            {mutationErrors.map((message, index) => (
                <AlertBox
                    key={index}
                    text={message}
                    type="danger"
                    width="100%"
                />
            ))}

            {notice && (
                <div className="alert alert-success" role="status">
                    {notice}
                </div>
            )}

            <div className="mb-4">
                <div className="d-flex justify-content-center align-items-center gap-2">
                    {data.admin && editingTitle ? (
                        <>
                            <input
                                type="text"
                                className="form-control"
                                style={{ maxWidth: "500px" }}
                                value={titleDraft}
                                onChange={(event) => setTitleDraft(event.target.value)}
                                aria-label="Temat wiadomości e-mail"
                                autoFocus
                            />

                            <button
                                type="button"
                                className="btn btn-sm btn-success"
                                disabled={settingsLoading || !titleDraft.trim()}
                                onClick={saveTitle}
                                title="Zapisz temat"
                                aria-label="Zapisz temat"
                            >
                                <FontAwesomeIcon icon={faCheck} />
                            </button>

                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                disabled={settingsLoading}
                                onClick={() => {
                                    setTitleDraft(data.title);
                                    setEditingTitle(false);
                                }}
                                title="Anuluj"
                                aria-label="Anuluj edycję tematu"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 className="entity-header-dynamic-size text-center mb-0">
                                {data.title}
                            </h2>

                            {data.admin && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-dark"
                                    onClick={() => {
                                        setTitleDraft(data.title);
                                        setEditingTitle(true);
                                    }}
                                    title="Edytuj temat wiadomości e-mail"
                                    aria-label="Edytuj temat wiadomości e-mail"
                                >
                                    <FontAwesomeIcon icon={faPencilAlt} />
                                </button>
                            )}
                        </>
                    )}
                </div>

                <div className="text-center">
                    <small className="text-muted">
                        Temat wiadomości e-mail
                    </small>
                </div>

                {data.admin && (
                    <div className="d-flex justify-content-end mt-2">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={resetLoading}
                            onClick={resetAllWishes}
                            title="Zresetuj wszystkie życzenia"
                        >
                            <FontAwesomeIcon icon={faRotateLeft} className="me-1" />
                            {resetLoading ? "Resetowanie..." : "Resetuj dane"}
                        </button>
                    </div>
                )}
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
                                        <th>Adres</th>
                                        <th>Forma</th>
                                        <th>Brat</th>
                                        <th>Wiadomość</th>

                                        {data.admin && (
                                            <>
                                                <th>Czy wysłane</th>
                                                <th className="text-center">Akcje</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {data.wishes.map((wish) => {
                                        const canEditWish =
                                            data.admin || wish.userId === currentUserId;

                                        const selectedUserId =
                                            assignmentDrafts[wish.id] ??
                                            (wish.userId === null ? "" : String(wish.userId));

                                        return (
                                            <tr key={wish.id}>
                                                <td style={{ minWidth: "180px" }}>
                                                    {data.admin ? (
                                                        <div className="d-flex flex-column gap-2">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    recipientDrafts[wish.id] ??
                                                                    wish.recipient
                                                                }
                                                                onChange={(event) =>
                                                                    setRecipientDrafts(previous => ({
                                                                        ...previous,
                                                                        [wish.id]: event.target.value
                                                                    }))
                                                                }
                                                                aria-label="Adresat"
                                                            />

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-primary align-self-start"
                                                                disabled={adminWishLoading}
                                                                onClick={() => saveAdminWish(wish.id)}
                                                            >
                                                                Zapisz nazwę
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="fw-semibold">
                                                            {wish.recipient}
                                                        </span>
                                                    )}
                                                </td>

                                                <td style={{ minWidth: "220px" }}>
                                                    {editingEmailId === wish.id ? (
                                                        <div className="d-flex flex-column gap-2">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={emailDraft}
                                                                onChange={(event) =>
                                                                    setEmailDraft(event.target.value)
                                                                }
                                                                placeholder={
                                                                    wish.letter
                                                                        ? "Adres pocztowy"
                                                                        : "Adres e-mail"
                                                                }
                                                                aria-label="Adres"
                                                            />

                                                            <div className="d-flex gap-1">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-success"
                                                                    disabled={emailLoading || !emailDraft.trim()}
                                                                    onClick={() => saveEmail(wish.id)}
                                                                >
                                                                    {emailLoading ? "Zapisywanie..." : "Zapisz"}
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    disabled={emailLoading}
                                                                    onClick={cancelEmailEditing}
                                                                >
                                                                    Anuluj
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex flex-column gap-1">
                                                            <span>
                                                                {wish.email || (
                                                                    <span className="text-muted fst-italic">
                                                                        Brak adresu
                                                                    </span>
                                                                )}
                                                            </span>

                                                            {canEditWish && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-dark align-self-start"
                                                                    style={{ width: "32px", height: "32px" }}
                                                                    onClick={() => startEmailEditing(wish.id, wish.email)}
                                                                    title="Edytuj adres"
                                                                    aria-label="Edytuj adres"
                                                                >
                                                                    <FontAwesomeIcon icon={faPencilAlt} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="text-center" style={{ minWidth: "130px" }}>
                                                    {data.admin ? (
                                                        <button
                                                            type="button"
                                                            className={`btn btn-sm ${
                                                                wish.letter
                                                                    ? "btn-outline-secondary"
                                                                    : "btn-outline-primary"
                                                            }`}
                                                            disabled={adminWishLoading}
                                                            onClick={() =>
                                                                saveAdminWish(wish.id, {
                                                                    letter: !wish.letter
                                                                })
                                                            }
                                                            title="Kliknij, aby zmienić formę"
                                                        >
                                                            {wish.letter
                                                                ? "Listownie · Zmień"
                                                                : "E-mail · Zmień"}
                                                        </button>
                                                    ) : (
                                                        wish.letter ? (
                                                            <span className="badge bg-secondary">
                                                                Listownie
                                                            </span>
                                                        ) : (
                                                            <span className="badge bg-primary">
                                                                E-mail
                                                            </span>
                                                        )
                                                    )}
                                                </td>

                                                <td style={{ minWidth: "200px" }}>
                                                    {data.admin ? (
                                                        <div className="d-flex flex-column gap-2">
                                                            <select
                                                                className="form-select form-select-sm"
                                                                value={selectedUserId}
                                                                onChange={(event) =>
                                                                    setAssignmentDrafts(previous => ({
                                                                        ...previous,
                                                                        [wish.id]: event.target.value
                                                                    }))
                                                                }
                                                                aria-label="Przypisany brat"
                                                            >
                                                                <option value="">
                                                                    Nieprzypisane
                                                                </option>

                                                                {data.users.map(user => (
                                                                    <option
                                                                        key={user.id}
                                                                        value={String(user.id)}
                                                                    >
                                                                        {user.name} {user.surname}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-primary align-self-start"
                                                                disabled={adminWishLoading}
                                                                onClick={() => saveAdminWish(wish.id)}
                                                            >
                                                                Zapisz przypisanie
                                                            </button>
                                                        </div>
                                                    ) : wish.userId === null ? (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary"
                                                            disabled={claimLoading}
                                                            onClick={() => claimWish(wish.id)}
                                                        >
                                                            {claimLoading ? "Przypisywanie..." : "+ Przypisz"}
                                                        </button>
                                                    ) : (
                                                        <div className="d-flex flex-column gap-1">
                                                            <span>{wish.userName}</span>

                                                            {wish.userId === currentUserId && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-danger align-self-start"
                                                                    disabled={releaseLoading}
                                                                    onClick={() => releaseWish(wish.id)}
                                                                >
                                                                    {releaseLoading
                                                                        ? "Wypisywanie..."
                                                                        : "Wypisz się"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>

                                                <td style={{ minWidth: "260px" }}>
                                                    {editingMessageId === wish.id ? (
                                                        <div className="d-flex flex-column gap-2">
                                                            <textarea
                                                                className="form-control form-control-sm"
                                                                rows={4}
                                                                value={messageDraft}
                                                                onChange={(event) =>
                                                                    setMessageDraft(event.target.value)
                                                                }
                                                                placeholder="Treść życzeń"
                                                                aria-label="Treść życzeń"
                                                            />

                                                            <div className="d-flex gap-1">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-success"
                                                                    disabled={messageLoading}
                                                                    onClick={() => saveMessage(wish.id)}
                                                                >
                                                                    {messageLoading ? "Zapisywanie..." : "Zapisz"}
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    disabled={messageLoading}
                                                                    onClick={cancelMessageEditing}
                                                                >
                                                                    Anuluj
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex flex-column gap-1">
                                                            <div style={{ whiteSpace: "pre-wrap" }}>
                                                                {wish.message || (
                                                                    <span className="text-muted fst-italic">
                                                                        Brak wiadomości
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {canEditWish && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-dark align-self-start"
                                                                    style={{ width: "32px", height: "32px" }}
                                                                    onClick={() => startMessageEditing(wish.id, wish.message)}
                                                                    title="Edytuj wiadomość"
                                                                    aria-label="Edytuj wiadomość"
                                                                >
                                                                    <FontAwesomeIcon icon={faPencilAlt} />
                                                                </button>
                                                            )}
                                                        </div>
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

                                                {data.admin && (
                                                    <td className="text-center">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            style={{ width: "32px", height: "32px" }}
                                                            disabled={deleteLoading}
                                                            onClick={() => setWishToDelete(wish.id)}
                                                            title="Usuń cały wpis"
                                                            aria-label={`Usuń wpis: ${wish.recipient}`}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

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
        </div>
    );
};

export default WishesPage;