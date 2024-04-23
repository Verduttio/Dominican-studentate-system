import React, {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {faChevronDown, faChevronUp, faCircleXmark} from "@fortawesome/free-solid-svg-icons";
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
                    <div className="card-body">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-2 text-center">
                                    <button className="btn btn-dark">2|5</button>
                                </div>
                                <div className="col-10">
                                    <p>Brat <strong>niewyznaczony</strong> do oficjum. <em>Ostatni raz został do niego
                                        przydzielony 2 tygodnie temu. Do tej pory został do niego wyznaczony 5
                                        razy.</em></p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-2 text-center">
                                    <button className="btn btn-success">2|5</button>
                                </div>
                                <div className="col-10">
                                    <p>Brat <strong>wyznaczony</strong> do oficjum. <em>Ostatni raz został do niego
                                        przydzielony 2 tygodnie temu. Do tej pory został do niego wyznaczony 5
                                        razy.</em></p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-2 text-center">
                                    <button className="btn btn-warning">2|5</button>
                                </div>
                                <div className="col-10">
                                    <p>Brat <strong>niewyznaczony</strong> do oficjum, przypisany już do innego oficjum,
                                        które jest <strong>w konflikcie</strong> z aktualnym.</p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-2 text-center">
                                    <button className="btn btn-warning">
                                    <span className={'highlighted-text-conflict'}>
                                        2|5
                                    </span>
                                    </button>
                                </div>
                                <div className="col-10">
                                    <p>Brat <strong>wyznaczony</strong> do oficjum, przypisany też do innego oficjum,
                                        które jest <strong>w konflikcie</strong> z aktualnym.</p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-2 text-center">
                                    <button className="btn btn-info" disabled={true}>
                                        2|5
                                    </button>
                                </div>
                                <div className="col-10">
                                    <p>Brat <strong>niewyznaczony</strong> do oficjum, posiadający
                                        aktualną <strong>przeszkodę</strong> na to oficjum.</p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-2 text-center">
                                    <button className="btn btn-info">
                                        <span className={'highlighted-text-conflict'}>
                                        2|5
                                        </span>
                                    </button>
                                </div>
                                <div className="col-10">
                                    <p><strong>Dotyczy kreatora tygodniowego</strong>. Brat wyznaczony do
                                        oficjum, posiadający
                                        przeszkodę w tym tygodniu na to oficjum. <strong>Wyznaczony w dniu, w którym
                                            przeszkoda jeszcze nie obowiązuje</strong>.
                                        Odznaczenie brata spowoduje usunięcie wszystkich przypisań z tego oficjum do
                                        niego w tym tygodniu.
                                    </p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-2 text-center">
                                    <button className="btn btn-secondary" disabled={true}>
                                        <FontAwesomeIcon icon={faCircleXmark}/>
                                    </button>
                                </div>
                                <div className="col-10">
                                    <p><strong>Dotyczy kreatora dziennego</strong>. Oficjum nie występuje w danym dniu.
                                    </p>
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
