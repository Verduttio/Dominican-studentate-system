import React from 'react';
import {Link} from 'react-router-dom';


const OtherEntities = () => {

    return (
        <div className="fade-in w-25">
            {/*<h2 className="entity-header-dynamic-size">Wybierz rolę, aby przejść do przypisanych jej zadań</h2>*/}
            <div className="card mb-4" id="button-scale">
                <div className="card-body text-center">
                    <Link to={'/tasks'}
                          className={"stretched-link text-decoration-none text-black"}
                    >
                        Zadania
                    </Link>
                </div>
            </div>
            <div className="card mb-4" id="button-scale">
                <div className="card-body text-center">
                    <Link to={'/conflicts'}
                          className={"stretched-link text-decoration-none text-black"}
                    >
                        Konflikty
                    </Link>
                </div>
            </div>
            <div className="card mb-4" id="button-scale">
                <div className="card-body text-center">
                    <Link to={'/roles'}
                          className={"stretched-link text-decoration-none text-black"}
                    >
                        Role
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OtherEntities;
