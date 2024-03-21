import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    let pagesNumbers: number[] = [];

    // Always show first page
    pagesNumbers.push(1);

    if (totalPages <= 5) {
        // Show all pages if there are less than or equal 5
        for (let i = 2; i < totalPages; i++) {
            pagesNumbers.push(i);
        }
    } else {
        // Show pages around the current page
        if (currentPage > 3) {
            pagesNumbers.push(-1); // Dots before the first page
        }

        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);

        if (currentPage - 1 < 3) {
            endPage = 4; // Show four first pages
        }

        if (totalPages - currentPage < 3) {
            startPage = totalPages - 3; // Show four last pages
        }

        for (let i = startPage; i <= endPage; i++) {
            pagesNumbers.push(i);
        }

        if (currentPage < totalPages - 2) {
            pagesNumbers.push(-2); // Dots before the last page
        }
    }

    // Always show last page if there are more than one page
    if (totalPages > 1) {
        pagesNumbers.push(totalPages);
    }

    if (totalPages === 1) {return null;}
    return (
        <div>
            <ul className="pagination flex-wrap justify-content-center">
                {currentPage !== 0 &&
                    <li className="page-item">
                        <button
                            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                            className="page-link"
                            disabled={currentPage === 0}
                            style={{ color: 'white', backgroundColor: 'black', borderColor: 'black' }}
                        >
                            <FontAwesomeIcon icon={faChevronLeft}/>
                        </button>
                    </li>
                }

                {pagesNumbers.map((number, index) => (
                    <li key={index}
                        className={`page-item ${currentPage + 1 === number ? 'active' : ''} ${number < 0 ? 'disabled' : ''}`}
                    >
                        <button
                            onClick={() => number > 0 && onPageChange(number - 1)}
                            className="page-link"
                            style={ currentPage + 1 === number ? { color: 'white', backgroundColor: 'black', borderColor: 'black' } : {color: 'black'}}
                        >
                            {number > 0 ? number : '...'}
                        </button>
                    </li>
                ))}

                {currentPage + 1 < totalPages &&
                    <li className="page-item">
                        <button
                            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                            className="page-link"
                            disabled={currentPage + 1 >= totalPages}
                            style={{ color: 'white', backgroundColor: 'black', borderColor: 'black' }}
                        >
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </button>
                    </li>
                }
            </ul>
        </div>
    );
};


export default Pagination;
