import React, { useCallback, useEffect, useRef, useState } from "react";
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
    faUserPlus,
    faCircleCheck,
    faClock,
    faFloppyDisk,
    faEye,
    faEyeSlash,
    faMinus
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

const iconButtonStyle: React.CSSProperties = {
    width: "25px",
    height: "25px",
    minWidth: "25px",
    minHeight: "25px",
    padding: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "12px"
};

const WishesPage: React.FC = () => {
    const [data, setData] = useState<WishesPageDTO | null>(null);

    const [emailDrafts, setEmailDrafts] = useState<Record<number, string>>({});
    const [messageDrafts, setMessageDrafts] = useState<Record<number, string>>({});
    const [activeMessageId, setActiveMessageId] = useState<number | null>(null);

    const [recipientDrafts, setRecipientDrafts] = useState<Record<number, string>>({});
    const [assignmentDrafts, setAssignmentDrafts] = useState<Record<number, string>>({});

    const [titleDraft, setTitleDraft] = useState("");
    const [notice, setNotice] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    const [wishToDelete, setWishToDelete] = useState<number | null>(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newWishRecipient, setNewWishRecipient] = useState("");
    const [newWishEmail, setNewWishEmail] = useState("");
    const [newWishLetter, setNewWishLetter] = useState(false);
    const [sendResult, setSendResult] = useState<WishSendResult | null>(null);

    const [savedFields, setSavedFields] = useState<Record<string, boolean>>({});
    const savedTimers = useRef<Record<string, number>>({});

    const showSavedIndicator = (key: string) => {
        setSavedFields(previous => ({
            ...previous,
            [key]: true
        }));

        const previousTimer = savedTimers.current[key];

        if (previousTimer) {
            window.clearTimeout(previousTimer);
        }

        savedTimers.current[key] = window.setTimeout(() => {
            setSavedFields(previous => ({
                ...previous,
                [key]: false
            }));

            delete savedTimers.current[key];
        }, 2500);
    };

    const clearSavedIndicator = (key: string) => {
        const timer = savedTimers.current[key];

        if (timer) {
            window.clearTimeout(timer);
            delete savedTimers.current[key];
        }

        setSavedFields(previous => ({
            ...previous,
            [key]: false
        }));
    };

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

    const {
        error: resetWishStatusError,
        loading: resetWishStatusLoading,
        request: resetWishStatusRequest
    } = useHttp<null>(`${backendUrl}/api/wishes`, "POST");

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

    useEffect(() => {
        return () => {
            Object.values(savedTimers.current).forEach(timer => {
                window.clearTimeout(timer);
            });
        };
    }, []);

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

    const saveEmail = (wishId: number, currentEmail: string | null) => {
        const email = (emailDrafts[wishId] ?? currentEmail ?? "").trim();

        if (!email) {
            return;
        }

        clearSavedIndicator(`email-${wishId}`);
        setNotice(null);

        updateEmailRequest(
            { email },
            () => {
                setEmailDrafts(previous => {
                    const updated = { ...previous };
                    delete updated[wishId];
                    return updated;
                });

                showSavedIndicator(`email-${wishId}`);
                loadData();
            },
            false,
            `${backendUrl}/api/wishes/${wishId}/email`,
            "PATCH"
        );
    };

    const saveMessage = (wishId: number, currentMessage: string | null) => {
        const message = messageDrafts[wishId] ?? currentMessage ?? "";

        clearSavedIndicator(`message-${wishId}`);
        setNotice(null);

        updateMessageRequest(
            { message },
            () => {
                setMessageDrafts(previous => {
                    const updated = { ...previous };
                    delete updated[wishId];
                    return updated;
                });

                showSavedIndicator(`message-${wishId}`);
                loadData();
            },
            false,
            `${backendUrl}/api/wishes/${wishId}/message`,
            "PATCH"
        );
    };

    const saveAdminWish = (
        wishId: number,
        changes: AdminWishChanges = {},
        savedField?: string
    ) => {
        const wish = data?.wishes.find(item => item.id === wishId);

        if (!wish) {
            return;
        }

        if (savedField) {
            clearSavedIndicator(savedField);
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

                if (savedField) {
                    showSavedIndicator(savedField);
                }

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

        clearSavedIndicator("title");
        setLocalError(null);
        setNotice(null);

        updateSettingsRequest(
            {
                title: titleDraft.trim(),
                visible: data.visible
            },
            () => {
                showSavedIndicator("title");
                setNotice("Zapisano temat wiadomości e-mail.");
                loadData();
            },
            false,
            `${backendUrl}/api/wishes/settings`,
            "PATCH"
        );
    };

    const toggleWishesVisibility = () => {
        if (!data) {
            return;
        }

        const nextVisible = !data.visible;

        setLocalError(null);
        setNotice(null);

        updateSettingsRequest(
            {
                title: data.title,
                visible: nextVisible
            },
            () => {
                setData(previous =>
                    previous
                        ? { ...previous, visible: nextVisible }
                        : previous
                );

                setNotice(
                    nextVisible
                        ? "Życzenia zostały udostępnione użytkownikom."
                        : "Życzenia zostały ukryte przed użytkownikami."
                );

                window.dispatchEvent(new Event("wishes-visibility-changed"));
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
        const confirmed = window.confirm(
            "Tryb testowy wysyła prawdziwe wiadomości testowe na adres dziekana. " +
            "Oryginalny adres odbiorcy jest umieszony w temacie.\n\n" +
            "Czy kontynuować?"
        );

        if (!confirmed) {
            return;
        }

        setSendResult(null);
        setNotice(null);
        setLocalError(null);

        testSendRequest(
            null,
            (result: WishSendResult) => {
                setSendResult(result);
                setNotice("Zakończono wysyłanie wiadomości testowych.");
            }
        );
    };

    const handleRealSend = () => {
        const confirmed = window.confirm(
            "Czy na pewno chcesz utworzyć drafty dla wszystkich zapisanych adresów e-mail?\n\n" +
            "Wiadomości NIE zostaną wysłane. Zostaną utworzone jako wersje robocze w Gmailu."
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
                setNotice("Zakończono tworzenie wersji roboczych.");
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
                setEmailDrafts({});
                setMessageDrafts({});
                setNotice(`Reset zakończony. Zresetowano wpisów: ${resetCount}.`);
                loadData();
            },
            false,
            `${backendUrl}/api/wishes/reset`,
            "POST"
        );
    };

    const resetWishStatus = (wishId: number) => {
        setLocalError(null);
        setNotice(null);

        resetWishStatusRequest(
            null,
            () => {
                setNotice("Zresetowano status utworzenia draftu.");
                loadData();
            },
            false,
            `${backendUrl}/api/wishes/${wishId}/reset-status`,
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
        resetWishStatusError
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
                                {sendResult.testMode ? "Wynik testu" : "Wynik tworzenia draftów"}
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
                            style={iconButtonStyle}
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
                    {data.admin ? (
                        <>
                            <input
                                type="text"
                                className="form-control text-center"
                                style={{ maxWidth: "500px" }}
                                value={titleDraft}
                                onChange={(event) => {
                                    clearSavedIndicator("title");
                                    setTitleDraft(event.target.value);
                                }}
                                aria-label="Temat wiadomości e-mail"
                            />

                            <button
                                type="button"
                                className={`btn d-inline-flex align-items-center justify-content-center p-0 flex-shrink-0 ${
                                    savedFields["title"] ? 'btn-success' : 'btn-primary'
                                }`}
                                style={iconButtonStyle}
                                disabled={settingsLoading || !titleDraft.trim()}
                                onClick={saveTitle}
                                title={savedFields["title"] ? "Zapisano temat" : "Zapisz temat"}
                                aria-label="Zapisz temat"
                            >
                                <FontAwesomeIcon icon={savedFields["title"] ? faCheck : faFloppyDisk} />
                            </button>
                        </>
                    ) : (
                        <h1 className="entity-header-dynamic-size text-center mb-0">
                            {data.title}
                        </h1>
                    )}
                </div>

                <div className="text-center mb-4">
                    <small className="text-white">
                        Temat wiadomości e-mail
                    </small>
                </div>

                {data.admin && (
                    <div className="d-flex justify-content-center flex-wrap gap-2 mt-4 mb-4">
                        <button
                            type="button"
                            className={`btn ${data.visible ? "btn-secondary" : "btn-primary"}`}
                            disabled={settingsLoading}
                            onClick={toggleWishesVisibility}
                            title={data.visible ? "Ukryj życzenia przed użytkownikami" : "Pokaż życzenia użytkownikom"}
                        >
                            <FontAwesomeIcon
                                icon={data.visible ? faEyeSlash : faEye}
                                className="me-2"
                            />
                            {data.visible ? "Ukryj" : "Pokaż"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-warning"
                            disabled={testSending || sending}
                            onClick={handleTestSend}
                            title="Wyślij testowe wiadomości na adres dziekana"
                        >
                            <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                            {testSending ? "Testowanie..." : "Testuj"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-success"
                            disabled={testSending || sending}
                            onClick={handleRealSend}
                            title="Utwórz wersje robocze zaadresowane do właściwych odbiorców"
                        >
                            <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                            {sending ? "Tworzenie draftów..." : "Utwórz drafty"}
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

                {data.admin && (
                    <div
                        className="card border-0 shadow-sm mx-auto mt-3 mb-4"
                        style={{
                            width: "fit-content",
                            maxWidth: "min(720px, 95vw)"
                        }}
                    >
                        <div className="card-body py-3 px-3">
                            <div className="small d-flex flex-column gap-3">
                                <div className="d-flex align-items-start gap-2">
                                    <span className={`btn btn-sm ${data.visible ? "btn-secondary" : "btn-primary"} py-1 px-2 flex-shrink-0`}>
                                        <FontAwesomeIcon icon={data.visible ? faEyeSlash : faEye} />
                                    </span>
                                    <div>
                                        <strong>{data.visible ? "Ukryj" : "Pokaż"}</strong>
                                        <div className="text-muted">
                                            Ukrywa/pokazuje użytkownikom przycisk do strony z życzeniami na pasku nawigacyjnym.
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start gap-2">
                                    <span className="btn btn-sm btn-warning py-1 px-2 flex-shrink-0">
                                        <FontAwesomeIcon icon={faEnvelope} />
                                    </span>
                                    <div>
                                        <strong>Testuj</strong>
                                        <div className="text-muted">
                                            Wysyła prawdziwe wiadomości testowe na adres dziekana.
                                            Oryginalny adres odbiorcy jest umieszony w temacie.
                                            Dotyczy wyłącznie wiadomości, które NIE MAJĄ statusu "Utworzono".
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start gap-2">
                                    <span className="btn btn-sm btn-success py-1 px-2 flex-shrink-0">
                                        <FontAwesomeIcon icon={faPaperPlane} />
                                    </span>
                                    <div>
                                        <strong>Utwórz drafty</strong>
                                        <div className="text-muted">
                                            Tworzy wersje robocze w Gmailu, zaadresowane do właściwych odbiorców.
                                            Wiadomości nie są wysyłane automatycznie — można je sprawdzić i wysłać z poziomu Gmaila.
                                            Dotyczy wyłącznie wiadomości, które NIE MAJĄ statusu "Utworzono".
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start gap-2">
                                    <span className="btn btn-sm btn-danger py-1 px-2 flex-shrink-0">
                                        <FontAwesomeIcon icon={faRotateLeft} />
                                    </span>
                                    <div>
                                        <strong>Resetuj dane</strong>
                                        <div className="text-muted">
                                            Resetuje wszystkie życzenia: usuwa ich treść, zeruje statusy
                                            i usuwa przypisania braci. Nie usuwa adresatów ani adresów.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div
                className="card border-0 shadow-sm mb-5"
                style={{
                    width: "95vw",
                    maxWidth: "96vw",
                    position: "relative",
                    left: "50%",
                    transform: "translateX(-50%)"
                }}
            >
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Lista życzeń</h5>

                    <div className="d-flex align-items-center gap-2">
                        {data.admin && (
                            <button
                                type="button"
                                style={iconButtonStyle}
                                className={`btn btn-sm btn-warning ${showAddForm ? "d-none" : ""}`}

                                onClick={() => setShowAddForm(previous => !previous)}
                            >
                                <FontAwesomeIcon icon={showAddForm ? faXmark : faPlus} />
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

                                <div className="col-md-5">
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

                                <div className="col-md-1 d-flex gap-1">
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
                                        className="btn btn-secondary flex-grow-1"
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
                                                <th>Utworzono</th>
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
                                                                onChange={(event) => {
                                                                    clearSavedIndicator(`recipient-${wish.id}`);

                                                                    setRecipientDrafts(previous => ({
                                                                        ...previous,
                                                                        [wish.id]: event.target.value
                                                                    }));
                                                                }}
                                                                aria-label="Adresat"
                                                            />

                                                            <button
                                                                type="button"
                                                                className={`btn d-inline-flex align-items-center justify-content-center p-0 flex-shrink-0 ${
                                                                    savedFields[`recipient-${wish.id}`] ? 'btn-success' : 'btn-primary'
                                                                }`}
                                                                style={iconButtonStyle}
                                                                disabled={adminWishLoading}
                                                                onClick={() => saveAdminWish(wish.id, {}, `recipient-${wish.id}`)}
                                                                title={savedFields[`recipient-${wish.id}`] ? "Zapisano adresata" : "Zapisz adresata"}
                                                                aria-label="Zapisz adresata"
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={savedFields[`recipient-${wish.id}`] ? faCheck : faFloppyDisk}
                                                                />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="fw-semibold">
                                                            {wish.recipient}
                                                        </span>
                                                    )}
                                                </td>

                                                <td style={{ minWidth: "220px" }}>
                                                    {canEditWish ? (
                                                        <div className="d-flex align-items-center gap-1">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                style={{ minWidth: 0 }}
                                                                value={emailDrafts[wish.id] ?? wish.email ?? ""}
                                                                onChange={(event) => {
                                                                    clearSavedIndicator(`email-${wish.id}`);

                                                                    setEmailDrafts(previous => ({
                                                                        ...previous,
                                                                        [wish.id]: event.target.value
                                                                    }));
                                                                }}
                                                                placeholder={wish.letter ? "Adres pocztowy" : "Adres e-mail"}
                                                                aria-label="Adres"
                                                            />

                                                            <button
                                                                type="button"
                                                                className={`btn d-inline-flex align-items-center justify-content-center p-0 flex-shrink-0 ${
                                                                    savedFields[`email-${wish.id}`] ? 'btn-success' : 'btn-primary'
                                                                }`}
                                                                style={iconButtonStyle}
                                                                disabled={emailLoading || !(emailDrafts[wish.id] ?? wish.email ?? "").trim()}
                                                                onClick={() => saveEmail(wish.id, wish.email)}
                                                                title={savedFields[`email-${wish.id}`] ? "Zapisano adres" : "Zapisz adres"}
                                                                aria-label="Zapisz adres"
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={savedFields[`email-${wish.id}`] ? faCheck : faFloppyDisk}
                                                                />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ overflowWrap: "anywhere" }}>
                                                            {wish.email || (
                                                                <span className="text-muted fst-italic">
                                                                    Brak adresu
                                                                </span>
                                                            )}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="text-center" style={{ minWidth: "50px" }}>
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        <span className={`badge ${wish.letter ? "bg-secondary" : "bg-success"}`}>
                                                            {wish.letter ? "Listownie" : "E-mail"}
                                                        </span>

                                                        {data.admin && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-primary"
                                                                style={iconButtonStyle}
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

                                                <td className="text-center align-middle" style={{ minWidth: "120px" }}>
                                                    {data.admin ? (
                                                        <div className="d-flex align-items-center justify-content-center gap-1">
                                                            <select
                                                                className="form-select form-select-sm"
                                                                style={{ minWidth: 0, maxWidth: "220px" }}
                                                                value={selectedUserId}
                                                                onChange={(event) => {
                                                                    clearSavedIndicator(`assignment-${wish.id}`);

                                                                    setAssignmentDrafts(previous => ({
                                                                        ...previous,
                                                                        [wish.id]: event.target.value
                                                                    }));
                                                                }}
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
                                                                className={`btn d-inline-flex align-items-center justify-content-center p-0 flex-shrink-0 ${
                                                                            savedFields[`assignment-${wish.id}`] ? 'btn-success' : 'btn-primary'
                                                                          }`}
                                                                style={iconButtonStyle}
                                                                disabled={adminWishLoading}
                                                                onClick={() => saveAdminWish(wish.id, {}, `assignment-${wish.id}`)}
                                                                title="Zapisz przypisanie"
                                                                aria-label="Zapisz przypisanie"
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={savedFields[`assignment-${wish.id}`] ? faCheck : faFloppyDisk}
                                                                />
                                                            </button>
                                                        </div>
                                                    ) : wish.userId === null ? (
                                                        // Nikt nie jest przypisany — wyśrodkowany przycisk przypisania
                                                        <div className="d-flex justify-content-center">
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary d-inline-flex align-items-center justify-content-center p-0"
                                                                style={iconButtonStyle}
                                                                disabled={claimLoading}
                                                                onClick={() => claimWish(wish.id)}
                                                                title="Przypisz się do życzeń"
                                                                aria-label="Przypisz się do życzeń"
                                                            >
                                                                <FontAwesomeIcon icon={faUserPlus} />
                                                            </button>
                                                        </div>
                                                    ) : wish.userId === currentUserId ? (
                                                        // Ja jestem przypisany — tylko czerwona ikonka wypisania
                                                        <div className="d-flex justify-content-center">
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger d-inline-flex align-items-center justify-content-center p-0"
                                                                style={iconButtonStyle}
                                                                disabled={releaseLoading}
                                                                onClick={() => releaseWish(wish.id)}
                                                                title="Wypisz się z życzeń"
                                                                aria-label="Wypisz się z życzeń"
                                                            >
                                                                <FontAwesomeIcon icon={faUserMinus} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        // Przypisany jest ktoś inny — samo wyśrodkowane imię i nazwisko
                                                        <div className="text-center">
                                                            {wish.userName}
                                                        </div>
                                                    )}
                                                </td>

                                                <td style={{ minWidth: "400px" }}>
                                                    {canEditWish ? (
                                                        <div className="d-flex align-items-start gap-1">
                                                            <textarea
                                                                className="form-control form-control-sm flex-grow-1"
                                                                style={{ minWidth: 0, resize: "vertical" }}
                                                                rows={activeMessageId === wish.id ? 4 : 1}
                                                                onFocus={() => setActiveMessageId(wish.id)}
                                                                onBlur={() => setActiveMessageId(null)}
                                                                value={messageDrafts[wish.id] ?? wish.message ?? ""}
                                                                onChange={(event) => {
                                                                    clearSavedIndicator(`message-${wish.id}`);

                                                                    setMessageDrafts(previous => ({
                                                                        ...previous,
                                                                        [wish.id]: event.target.value
                                                                    }));
                                                                }}
                                                                placeholder="Treść życzeń"
                                                                aria-label="Treść życzeń"
                                                            />

                                                            <button
                                                                type="button"
                                                                className={`btn d-inline-flex align-items-center justify-content-center p-0 flex-shrink-0 ${
                                                                    savedFields[`message-${wish.id}`] ? 'btn-success' : 'btn-primary'
                                                                  }`}
                                                                style={iconButtonStyle}
                                                                disabled={messageLoading}
                                                                onClick={() => saveMessage(wish.id, wish.message)}
                                                                title={savedFields[`message-${wish.id}`] ? "Zapisano wiadomość" : "Zapisz wiadomość"}
                                                                aria-label="Zapisz wiadomość"
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={savedFields[`message-${wish.id}`] ? faCheck : faFloppyDisk}
                                                                />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            style={{
                                                                minWidth: 0,
                                                                whiteSpace: "pre-wrap",
                                                                overflowWrap: "anywhere"
                                                            }}
                                                        >
                                                            {wish.message || (
                                                                <span className="text-muted fst-italic">
                                                                    Brak wiadomości
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>

                                                {data.admin && (
                                                    <td className="text-center align-middle">
                                                        <div className="d-inline-flex align-items-center justify-content-center gap-2">
                                                            {wish.letter ? (
                                                                <FontAwesomeIcon
                                                                    icon={faEnvelope}
                                                                    className="text-warning"
                                                                    size="lg"
                                                                    title="Nie dotyczy — wpis listowny"
                                                                    aria-label="Nie dotyczy — wpis listowny"
                                                                />
                                                            ) : (
                                                                <>
                                                                    {wish.sent ? (
                                                                        <FontAwesomeIcon
                                                                            icon={faCircleCheck}
                                                                            className="text-success"
                                                                            size="lg"
                                                                            title="Draft utworzony"
                                                                            aria-label="Draft utworzony"
                                                                        />
                                                                    ) : (
                                                                        <FontAwesomeIcon
                                                                            icon={faClock}
                                                                            className="text-secondary"
                                                                            size="lg"
                                                                            title="Draft nieutworzony"
                                                                            aria-label="Draft nieutworzony"
                                                                        />
                                                                    )}

                                                                    {wish.sent && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center p-0"
                                                                            style={iconButtonStyle}
                                                                            disabled={resetWishStatusLoading}
                                                                            onClick={() => resetWishStatus(wish.id)}
                                                                            title="Zresetuj status utworzenia draftu"
                                                                            aria-label={`Zresetuj status utworzenia draftu: ${wish.recipient}`}
                                                                        >
                                                                            <FontAwesomeIcon icon={faRotateLeft} />
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}

                                                {data.admin && (
                                                    <td className="text-center">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-danger"
                                                            style={iconButtonStyle}
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

            {data.statistics.length === 0 ? (
                <p className="text-muted text-center mt-4">
                    Brak aktywnych Braci do wyświetlenia.
                </p>
            ) : (
                <div className="d-flex justify-content-center mt-4">
                    <div
                        className="table-responsive"
                        style={{
                            width: "fit-content",
                            maxWidth: "100%"
                        }}
                    >
                        <table
                            className="table table-hover table-striped table-rounded table-shadow table-bordered mb-0"
                            style={{
                                width: "auto",
                                tableLayout: "auto"
                            }}
                        >
                            <thead className="table-dark">
                                <tr>
                                    <th className="text-nowrap">
                                        Brat
                                    </th>
                                    <th
                                        className="text-center text-nowrap"
                                        style={{ width: "1%" }}
                                    >
                                        Życzenia
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.statistics.map((stat) => (
                                    <tr key={stat.userId}>
                                        <td className="text-nowrap">
                                            {stat.name} {stat.surname}
                                        </td>

                                        <td className="text-center text-nowrap">
                                            <span
                                                className={
                                                    stat.count === 0
                                                        ? "badge bg-danger bg-opacity-10 text-danger"
                                                        : "badge bg-light text-dark border"
                                                }
                                                style={{
                                                    minWidth: "5rem",
                                                    display: "inline-block",
                                                    fontSize: "0.9rem"
                                                }}
                                            >
                                                {stat.count}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WishesPage;