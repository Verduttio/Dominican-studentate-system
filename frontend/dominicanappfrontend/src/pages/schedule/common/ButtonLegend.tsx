import React, {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {faChevronDown, faChevronUp, faCircleXmark, faXmark} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

function ButtonLegend() {
    const [isOpened, setIsOpened] = useState(false);

    useEffect(() => {
        const handleShow = () => setIsOpened(true);
        const handleHide = () => setIsOpened(false);

        const collapseElement = document.getElementById('collapseExample');
        if (!collapseElement) return;

        collapseElement.addEventListener('shown.bs.collapse', handleShow);
        collapseElement.addEventListener('hidden.bs.collapse', handleHide);

        return () => {
            collapseElement.removeEventListener('shown.bs.collapse', handleShow);
            collapseElement.removeEventListener('hidden.bs.collapse', handleHide);
        };
    }, []);

    return (
        <div className="d-flex">
            <div className="card mt-4" style={{maxWidth: '600px'}}>
                <div className="card-header text-center">
                    <button className="btn btn-outline-secondary" type="button" data-bs-toggle="collapse"
                            data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                        <FontAwesomeIcon icon={isOpened ? faChevronUp : faChevronDown}/>
                        {isOpened ? " Ukryj legendę " : " Pokaż legendę "}
                        <FontAwesomeIcon icon={isOpened ? faChevronUp : faChevronDown}/>
                    </button>
                </div>
                <div className="collapse" id="collapseExample">
                    <div className="card card-body mt-2">

                        {/* Wyjaśnienie liczb - wyciągnięte na górę */}
                        <div className="alert alert-light border mb-3">
                            <h6 className="alert-heading fw-bold mb-1">Co oznaczają liczby?</h6>
                            <div className="d-flex flex-column align-items-center">
                                <span className="badge bg-secondary me-2" style={{fontSize: '1.4em'}}>2 | 5</span><br/>
                                <span>
                                    <strong>2:</strong> Liczba tygodni od ostatniego wyznaczenia.
                                </span>
                                <span>
                                    <strong>5:</strong> Ile razy brat był wycznaczony.
                                </span>
                            </div>
                        </div>

                        <div className="container-fluid p-0">

                            {/* Dostępny */}
                            <div className="row mb-2 align-items-center">
                                <div className="col-2 text-center">
                                    <button className="btn btn-dark" >2|5</button>
                                </div>
                                <div className="col-10">
                                    <p className="mb-0">Brat <strong>niewyznaczony</strong> (jest dostępny).</p>
                                </div>
                            </div>

                            {/* Wyznaczony */}
                            <div className="row mb-2 align-items-center">
                                <div className="col-2 text-center">
                                    <button className="btn btn-success" >2|5</button>
                                </div>
                                <div className="col-10">
                                    <p className="mb-0">Brat <strong>wyznaczony</strong> do tego oficjum.</p>
                                </div>
                            </div>

                            {/* Konflikt (niewyznaczony) */}
                            <div className="row mb-2 align-items-center">
                                <div className="col-2 text-center">
                                    <button className="btn btn-warning" >2|5</button>
                                </div>
                                <div className="col-10">
                                    <p className="mb-0">
                                        Brat <strong>niewyznaczony</strong>. Ma w tym czasie <strong>konflikt</strong> z innym oficjum.
                                    </p>
                                </div>
                            </div>

                            {/* Konflikt (wyznaczony) */}
                            <div className="row mb-2 align-items-center">
                                <div className="col-2 text-center">
                                    <button className="btn btn-warning">
                                        <span className={'highlighted-text-conflict'}>2|5</span>
                                    </button>
                                </div>
                                <div className="col-10">
                                    <p className="mb-0">
                                        Brat <strong>wyznaczony</strong> pomimo <strong>konfliktu</strong> z innym oficjum.
                                    </p>
                                </div>
                            </div>

                            {/* Przeszkoda */}
                            <div className="row mb-2 align-items-center">
                                <div className="col-2 text-center">
                                    <button className="btn btn-danger" >2|5</button>
                                </div>
                                <div className="col-10">
                                    <p className="mb-0">
                                        Brat <strong>niewyznaczony</strong>. Posiada zgłoszoną <strong>przeszkodę</strong> w danym tygodniu.
                                    </p>
                                </div>
                            </div>

                            {/* Przeszkoda (częściowa/tygodniowa) */}
                            <div className="row mb-2 align-items-center">
                                <div className="col-2 text-center">
                                    <button className="btn btn-danger">
                                        <span className={'highlighted-text-conflict'}>2|5</span>
                                    </button>
                                </div>
                                <div className="col-10">
                                    <p className="mb-0">
                                        Brat <strong>wyznaczony</strong> pomimo przeszkody.
                                    </p>
                                </div>
                            </div>

                            {/* Oficjum nie występuje */}
                            <div className="row mb-2 align-items-center">
                                <div className="col-2 text-center">
                                    <button className="btn btn-secondary">
                                        <FontAwesomeIcon icon={faCircleXmark}/>
                                    </button>
                                </div>
                                <div className="col-10">
                                    <p className="mb-0">Oficjum <strong>nie występuje</strong> w tym dniu (dotyczy kreatora dziennego).</p>
                                </div>
                            </div>

                            {/* Brak uprawnień */}
                            <div className="row mb-2 align-items-center">
                                <div className="col-2 text-center">
                                    <button className="btn btn-secondary">
                                        <FontAwesomeIcon icon={faXmark}/>
                                    </button>
                                </div>
                                <div className="col-10">
                                    <p className="mb-0">Brat nie posiada odpowiedniej roli (uprawnień) do tego zadania.</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default ButtonLegend;
