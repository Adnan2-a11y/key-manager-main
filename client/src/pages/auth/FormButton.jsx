/* eslint-disable react/prop-types */
import { Form, Stack, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function FormButton({ buttonText, link, sideText, sideLinkText }) {
  return (
    <Form.Group className="text-center">
      <Stack direction="horizontal" gap={2} className="mb-2">
        <Button variant="success" type="submit" className="w-50">
          {buttonText}
        </Button>
        <Link
          to={link}
          className="ms-auto text-end"
          style={{ textDecoration: "none", lineHeight: 1, color: "#fff" }}
        >
          {sideText}
          <br />
          {sideLinkText}
        </Link>
      </Stack>
    </Form.Group>
  );
}

export default FormButton;
