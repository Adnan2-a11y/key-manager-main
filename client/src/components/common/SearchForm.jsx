/* eslint-disable react/prop-types */
import { useState } from "react";
import { Button, Form } from "react-bootstrap";

const SearchForm = ({label = 'Search', value="", variant = 'primary', placeholder = 'Search', onSubmit}) => {
    const [searchQuery, setSearchQuery] = useState(value);
    return (
        <Form onSubmit={onSubmit}>
            <Form.Group className="d-flex gap-2 align-items-center">
                <Form.Control type="text" placeholder={placeholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <Button type="submit" variant={variant}>{label}</Button>
            </Form.Group>
        </Form>
    );
}

export default SearchForm
