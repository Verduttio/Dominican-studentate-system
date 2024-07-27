import React, {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

function Instruction() {
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
            <div className="card mb-4" style={{maxWidth: '600px'}}>
                <div className="card-header text-center">
                    <button className="btn btn-outline-secondary" type="button" data-bs-toggle="collapse"
                            data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                        <FontAwesomeIcon icon={isOpened ? faChevronUp : faChevronDown}/>
                        {isOpened ? " Ukryj instrukcję " : " Pokaż instrukcję "}
                        <FontAwesomeIcon icon={isOpened ? faChevronUp : faChevronDown}/>
                    </button>
                </div>
                <div className="collapse" id="collapseExample">
                    <div className="card-body">
                        <div className="card-body">
                            <div className="row pb-2">
                                <div className="col-6">
                                    <div className="card p-3">
                                        [Ps] Psalmy
                                    </div>
                                </div>
                                <div className="col-6">
                                    Aby zmienić kolejność oficjum, należy przeciągnąć je w odpowiednie miejsce.
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <div className="card p-3 border-black border-2">
                                        [Ps] Psalmy
                                    </div>
                                </div>
                                <div className="col-6">
                                    Kolejność można też zmieniać za pomocą strzełek na klawiaturze. W tym celu należy kliknąć dwa razy na oficjum, a następnie wcisnąć enter. Na oficjum pojawi się wtedy czarna obwódka. Następnie strzałki będą działały.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default Instruction;
