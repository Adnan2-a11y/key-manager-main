import { Form } from "react-bootstrap";

/* eslint-disable react/prop-types */
const ProductDropdownFilter = ({data, value, defaultOption = 'Select', label = '', onChange }) => {
    return (
        <Form.Select aria-label={label} onChange={onChange} value={value}>
            <option value="">{defaultOption}</option>
            {data.map((category) => (
            <option key={category._id} value={category._id}>
                {category.level ? Array.from({ length: category.level }).map(() => "—").join("") : ""}
                {" "}
                {category ? category.name : ""}
            </option>
            ))}
        </Form.Select>
    )
};

export default ProductDropdownFilter