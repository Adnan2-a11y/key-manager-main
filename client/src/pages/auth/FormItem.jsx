/* eslint-disable react/prop-types */
import { Form } from "react-bootstrap";
function FormItem({
  className,
  controlId,
  label,
  type,
  name,
  placeholder,
  value,
  onChange,
}) {
  return (
    <Form.Group className={className} controlId={controlId}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </Form.Group>
  );
}

export default FormItem;
