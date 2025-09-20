/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Pagination, Form, InputGroup, Button } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";

const MainPagination = ({ totalPages, currentPage = 1 }) => {
    const [page, setPage] = useState(parseInt(currentPage));
    const [jumpPage, setJumpPage] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        setPage(parseInt(currentPage));
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setPage(newPage);
        const updatedParams = new URLSearchParams(searchParams);
        updatedParams.set("page", newPage);
        navigate(`?${updatedParams.toString()}`);
    };

    const handleJumpSubmit = (e) => {
        e.preventDefault();
        const pageNum = parseInt(jumpPage);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            handlePageChange(pageNum);
            setJumpPage('');
        }
    };

    const renderPaginationItems = () => {
        const pages = [];
        const pageRange = 2;
        const startPage = Math.max(2, page - pageRange);
        const endPage = Math.min(totalPages - 1, page + pageRange);

        pages.push(
            <Pagination.Item key={1} active={page === 1} onClick={() => handlePageChange(1)}>
                1
            </Pagination.Item>
        );

        if (startPage > 2) {
            pages.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Pagination.Item key={i} active={i === page} onClick={() => handlePageChange(i)}>
                    {i}
                </Pagination.Item>
            );
        }

        if (endPage < totalPages - 1) {
            pages.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
        }

        if (totalPages > 1) {
            pages.push(
                <Pagination.Item key={totalPages} active={page === totalPages} onClick={() => handlePageChange(totalPages)}>
                    {totalPages}
                </Pagination.Item>
            );
        }

        return pages;
    };

    return (
        <div className="d-flex align-items-center gap-3 flex-wrap">
            {totalPages > 1 && (
                <Pagination className="m-0">
                    <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
                    <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
                    {renderPaginationItems()}
                    <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />
                </Pagination>
            )}

            {/* Jump to Page Form */}
            <Form onSubmit={handleJumpSubmit} className="d-flex align-items-center">
                <InputGroup>
                    <Form.Control
                        type="number"
                        min="1"
                        max={totalPages}
                        placeholder="Go to page..."
                        value={jumpPage}
                        style={{ width: "120px" }}
                        onChange={(e) => setJumpPage(e.target.value)}
                    />
                    <Button type="submit" variant="primary">Go</Button>
                </InputGroup>
            </Form>
        </div>
    );
};

export default MainPagination;
