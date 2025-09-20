/* eslint-disable react/prop-types */
import { Form } from "react-bootstrap";
import API_CONFIG from "../../constant/apiConstants";
const BASE_URL = API_CONFIG.API_ENDPOINT;

function FormField({
  controlId,
  label,
  type,
  placeholder,
  options,
  value,
  onChange,
  name,
  rows,
  step,
  min,
  max,
  refValue,
  isMultiple,
}) {
  if (type === "select") {
    return (
      <Form.Group className="mb-3" controlId={controlId}>
        <Form.Label>{label}</Form.Label>
        <Form.Select
          aria-label={label}
          name={name}
          value={value}
          onChange={onChange}
        >
          {options.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    );
  }
  if (type === "number") {
    return (
      <Form.Group className="mb-3" controlId={controlId}>
        <Form.Label>{label}</Form.Label>
        <Form.Control type={type} value={value} step={step} min={min} max={max} onChange={onChange} name={name} />
      </Form.Group>
    );
  }

  if (type === "file") {
    return (
      <Form.Group className="mb-3" controlId={controlId}>
        <Form.Label>{label}</Form.Label>

        {/* Show the existing image preview if a URL is provided */}
        {value && (
          <div className="mb-2">
            <img
              src={`${BASE_URL}/api/${value}`}
              alt="Existing"
              style={{ maxWidth: "100px", maxHeight: "100px", objectFit: "cover" }}
            />
          </div>
        )}
        <Form.Control
          type={type}
          name={name}
          onChange={onChange}
          ref={refValue}
          multiple={isMultiple}
        />
      </Form.Group>
    );
  }

  if (type === "textarea") {
    return (
      <Form.Group className="mb-3" controlId={controlId}>
        <Form.Label>{label}</Form.Label>
        <Form.Control
          as="textarea"
          rows={rows}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
        />
      </Form.Group>
    );
  }

  return (
    <Form.Group className="mb-3" controlId={controlId}>
      <Form.Label>{label}</Form.Label>
      <Form.Control type={type} value={value} onChange={onChange} name={name} />
    </Form.Group>
  );
}

export default FormField;
