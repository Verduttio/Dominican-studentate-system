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
    faRotateLeft,
    faPlus,
    faPaperPlane,
    faEnvelope,
    faArrowRightArrowLeft,
    faUserMinus,
    faUserPlus
} from "@fortawesome/free-solid-svg-icons";

type AdminWishChanges = {
    recipient?: string;
    letter?: boolean;
    userId?: number | null;
};

type WishSendResult = {
    testMode: boolean;
    total: number;
    succeeded: number;
    errors: {
        wishId: number;
        recipient: string;
        error: string;
    }[];
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

    const [showAddForm, setShowAddForm] = useState(false);
    const [newWishRecipient, setNewWishRecipient] = useState("");
    const [newWishEmail, setNewWishEmail] = useState("");
    const [newWishLetter, setNewWishLetter] = useState(false);
    const [sendResult, setSendResult] = useState<WishSendResult | null>(null);

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

    const {
        error: createError,
        loading: createLoading,
        request: createWishRequest
    } = useHttp<{
        recipient: string;
        email: string | null;
        letter: boolean;
    }>(`${backendUrl}/api/wishes`, "POST");

    const {
        error: testSendError,
        loading: testSending,
        request: testSendRequest
    } = useHttp<null>(`${backendUrl}/api/wishes/send/test`, "POST");

    const {
        error: sendError,
        loading: sending,
        request: sendWishesRequest
    } = useHttp<null>(`${backendUrl}/api/wishes/send`, "POST");

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

    const handleCreateWish = () => {
        const recipient = newWishRecipient.trim();

        if (!recipient) {
            setLocalError("Wpisz nazwę adresata.");
            return;
        }

        setLocalError(null);
        setNotice(null);

        createWishRequest(
            {
                recipient,
                email: newWishEmail.trim() || null,
                letter: newWishLetter
            },
            () => {
                setNewWishRecipient("");
                setNewWishEmail("");
                setNewWishLetter(false);
                setShowAddForm(false);
                setNotice("Dodano nowy wpis.");
                loadData();
            }
        );
    };

    const handleTestSend = () => {
        setSendResult(null);
        setNotice(null);
        setLocalError(null);

        testSendRequest(
            null,
            (result: WishSendResult) => {
                setSendResult(result);
            }
        );
    };

    const handleRealSend = () => {
        const confirmed = window.confirm(
            "Czy na pewno chcesz wysłać życzenia na wszystkie zapisane adresy e-mail?\n\n" +
            "Ta operacja może wysłać prawdziwe wiadomości."
        );

        if (!confirmed) {
            return;
        }

        setSendResult(null);
        setNotice(null);
        setLocalError(null);

        sendWishesRequest(
            null,
            (result: WishSendResult) => {
                setSendResult(result);
                setNotice("Zakończono proces wysyłki.");
                loadData();
            }
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
        localError,
        createError,
        testSendError,
        sendError,
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

            {sendResult && (
                <div className={`alert ${sendResult.errors.length > 0 ? "alert-warning" : "alert-success"}`}>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>
                                {sendResult.testMode ? "Wynik testu" : "Wynik wysyłki"}
                            </strong>

                            <div className="mt-1">
                                Powodzenie: {sendResult.succeeded} / {sendResult.total}
                            </div>

                            {sendResult.errors.length > 0 && (
                                <ul className="mb-0 mt-2">
                                    {sendResult.errors.map((item) => (
                                        <li key={item.wishId}>
                                            <strong>{item.recipient}:</strong> {item.error}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setSendResult(null)}
                            aria-label="Zamknij raport"
                        />
                    </div>
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
                                    className="btn btn-sm btn-primary d-inline-flex align-items-center justify-content-center p-0"
                                    style={{
                                        width: "34px",
                                        height: "34px",
                                        flexShrink: 0,
                                        transform: "translateY(7px)"
                                    }}
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
                    <div className="d-flex justify-content-center flex-wrap gap-2 mt-3">
                        <button
                            type="button"
                            className="btn btn-warning"
                            disabled={testSending || sending}
                            onClick={handleTestSend}
                            title="Wyślij testowe wiadomości na adres zalogowanego administratora"
                        >
                            <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                            {testSending ? "Testowanie..." : "Test"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-success"
                            disabled={testSending || sending}
                            onClick={handleRealSend}
                            title="Wyślij życzenia na właściwe adresy e-mail"
                        >
                            <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                            {sending ? "Wysyłanie..." : "Wyślij"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-danger"
                            disabled={resetLoading || testSending || sending}
                            onClick={resetAllWishes}
                            title="Zresetuj wszystkie życzenia"
                        >
                            <FontAwesomeIcon icon={faRotateLeft} className="me-2" />
                            {resetLoading ? "Resetowanie..." : "Resetuj dane"}
                        </button>
                    </div>
                )}
            </div>

            <div className="card shadow-sm mb-5">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Lista życzeń</h5>

                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-light text-dark">
                            {data.wishes.length} wpisów
                        </span>

                        {data.admin && (
                            <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => setShowAddForm(previous => !previous)}
                            >
                                <FontAwesomeIcon icon={showAddForm ? faXmark : faPlus} className="me-1" />
                                {showAddForm ? "Zamknij" : "Dodaj wpis"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="card-body p-0">
                    {data.admin && showAddForm && (
                        <div className="p-3 border-bottom bg-light">
                            <div className="row g-2 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label">Adresat</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newWishRecipient}
                                        onChange={(event) => setNewWishRecipient(event.target.value)}
                                        placeholder="Imię i nazwisko / nazwa adresata"
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">Adres</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newWishEmail}
                                        onChange={(event) => setNewWishEmail(event.target.value)}
                                        placeholder={newWishLetter ? "Adres pocztowy" : "Adres e-mail"}
                                    />
                                </div>

                                <div className="col-md-2">
                                    <label className="form-label">Forma</label>
                                    <select
                                        className="form-select"
                                        value={newWishLetter ? "letter" : "email"}
                                        onChange={(event) => setNewWishLetter(event.target.value === "letter")}
                                    >
                                        <option value="email">E-mail</option>
                                        <option value="letter">Listownie</option>
                                    </select>
                                </div>

                                <div className="col-md-2 d-flex gap-1">
                                    <button
                                        type="button"
                                        className="btn btn-success flex-grow-1"
                                        disabled={createLoading || !newWishRecipient.trim()}
                                        onClick={handleCreateWish}
                                        title="Dodaj wpis"
                                    >
                                        <FontAwesomeIcon icon={faCheck} />
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        disabled={createLoading}
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setNewWishRecipient("");
                                            setNewWishEmail("");
                                            setNewWishLetter(false);
                                        }}
                                        title="Anuluj"
                                    >
                                        <FontAwesomeIcon icon={faXmark} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

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
                                                        <div className="d-flex align-items-center gap-1">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                style={{ minWidth: 0 }}
                                                                value={recipientDrafts[wish.id] ?? wish.recipient}
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
                                                                className="btn btn-sm btn-success flex-shrink-0"
                                                                style={{ width: "34px", height: "34px" }}
                                                                disabled={adminWishLoading}
                                                                onClick={() => saveAdminWish(wish.id)}
                                                                title="Zapisz adresata"
                                                                aria-label="Zapisz adresata"
                                                            >
                                                                <FontAwesomeIcon icon={faCheck} />
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
                                                        <div className="d-flex align-items-center gap-1">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                style={{ minWidth: 0 }}
                                                                value={emailDraft}
                                                                onChange={(event) => setEmailDraft(event.target.value)}
                                                                placeholder={wish.letter ? "Adres pocztowy" : "Adres e-mail"}
                                                                aria-label="Adres"
                                                            />

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-success flex-shrink-0"
                                                                style={{ width: "34px", height: "34px" }}
                                                                disabled={emailLoading || !emailDraft.trim()}
                                                                onClick={() => saveEmail(wish.id)}
                                                                title="Zapisz adres"
                                                                aria-label="Zapisz adres"
                                                            >
                                                                <FontAwesomeIcon icon={faCheck} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-secondary flex-shrink-0"
                                                                style={{ width: "34px", height: "34px" }}
                                                                disabled={emailLoading}
                                                                onClick={cancelEmailEditing}
                                                                title="Anuluj"
                                                                aria-label="Anuluj"
                                                            >
                                                                <FontAwesomeIcon icon={faXmark} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex align-items-center justify-content-between gap-2">
                                                            <span
                                                                className="flex-grow-1"
                                                                style={{ minWidth: 0, overflowWrap: "anywhere" }}
                                                            >
                                                                {wish.email || (
                                                                    <span className="text-muted fst-italic">
                                                                        Brak adresu
                                                                    </span>
                                                                )}
                                                            </span>

                                                            {canEditWish && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-primary flex-shrink-0"
                                                                    style={{ width: "34px", height: "34px" }}
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
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        <span className={`badge ${wish.letter ? "bg-secondary" : "bg-primary"}`}>
                                                            {wish.letter ? "Listownie" : "E-mail"}
                                                        </span>

                                                        {data.admin && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-warning"
                                                                style={{ width: "34px", height: "34px" }}
                                                                disabled={adminWishLoading}
                                                                onClick={() =>
                                                                    saveAdminWish(wish.id, { letter: !wish.letter })
                                                                }
                                                                title="Zmień formę wysyłki"
                                                                aria-label="Zmień formę wysyłki"
                                                            >
                                                                <FontAwesomeIcon icon={faArrowRightArrowLeft} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>

                                                <td style={{ minWidth: "200px" }}>
                                                    {data.admin ? (
                                                        <div className="d-flex align-items-center gap-1">
                                                            <select
                                                                className="form-select form-select-sm"
                                                                style={{ minWidth: 0 }}
                                                                value={selectedUserId}
                                                                onChange={(event) =>
                                                                    setAssignmentDrafts(previous => ({
                                                                        ...previous,
                                                                        [wish.id]: event.target.value
                                                                    }))
                                                                }
                                                                aria-label="Przypisany brat"
                                                            >
                                                                <option value="">Nieprzypisane</option>

                                                                {data.users.map(user => (
                                                                    <option key={user.id} value={String(user.id)}>
                                                                        {user.name} {user.surname}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-success flex-shrink-0"
                                                                style={{ width: "34px", height: "34px" }}
                                                                disabled={adminWishLoading}
                                                                onClick={() => saveAdminWish(wish.id)}
                                                                title="Zapisz przypisanie"
                                                                aria-label="Zapisz przypisanie"
                                                            >
                                                                <FontAwesomeIcon icon={faCheck} />
                                                            </button>
                                                        </div>
                                                    ) : wish.userId === null ? (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2"
                                                            disabled={claimLoading}
                                                            onClick={() => claimWish(wish.id)}
                                                        >
                                                            <FontAwesomeIcon icon={faUserPlus} />
                                                            <span>
                                                                {claimLoading ? "Przypisywanie..." : ""}
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <div className="d-flex align-items-center flex-wrap gap-2">
                                                            <span>{wish.userName}</span>

                                                            {wish.userId === currentUserId && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-secondary d-inline-flex align-items-center gap-2"
                                                                    disabled={releaseLoading}
                                                                    onClick={() => releaseWish(wish.id)}
                                                                >
                                                                    <FontAwesomeIcon icon={faUserMinus} />
                                                                    <span>
                                                                        {releaseLoading ? "Wypisywanie..." : ""}
                                                                    </span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>

                                                <td style={{ minWidth: "260px" }}>
                                                    {editingMessageId === wish.id ? (
                                                        <div className="d-flex align-items-start gap-1">
                                                            <textarea
                                                                className="form-control form-control-sm flex-grow-1"
                                                                style={{ minWidth: 0 }}
                                                                rows={4}
                                                                value={messageDraft}
                                                                onChange={(event) => setMessageDraft(event.target.value)}
                                                                placeholder="Treść życzeń"
                                                                aria-label="Treść życzeń"
                                                            />

                                                            <div className="d-flex flex-column gap-1 flex-shrink-0">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-success"
                                                                    style={{ width: "34px", height: "34px" }}
                                                                    disabled={messageLoading}
                                                                    onClick={() => saveMessage(wish.id)}
                                                                    title="Zapisz wiadomość"
                                                                    aria-label="Zapisz wiadomość"
                                                                >
                                                                    <FontAwesomeIcon icon={faCheck} />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-secondary"
                                                                    style={{ width: "34px", height: "34px" }}
                                                                    disabled={messageLoading}
                                                                    onClick={cancelMessageEditing}
                                                                    title="Anuluj"
                                                                    aria-label="Anuluj"
                                                                >
                                                                    <FontAwesomeIcon icon={faXmark} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex align-items-start justify-content-between gap-2">
                                                            <div
                                                                className="flex-grow-1"
                                                                style={{ minWidth: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                                                            >
                                                                {wish.message || (
                                                                    <span className="text-muted fst-italic">
                                                                        Brak wiadomości
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {canEditWish && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-primary flex-shrink-0"
                                                                    style={{ width: "34px", height: "34px" }}
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
                                                            className="btn btn-sm btn-danger"
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