import AuthLayout from "../../components/layout/AuthLayout";
import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

function Success() {
  return (
    <AuthLayout>
      <Container className="p-5">
        <div className="form-wrapper pt-3">
          <header>
            <h1 style={{ fontSize: "30px" }}>Success</h1>
          </header>

          <div className="success-msg p-5">
            <Row>
              <Col className="text-center">
                {true && (
                  <p
                    className="text-white text-center p-3"
                    style={{ fontSize: "20px" }}
                  >
                    Your account has been created successfully
                  </p>
                )}
                <Link
                  to="/login"
                  variant="success"
                  className="btn btn-success ms-auto w-50"
                >
                  Login
                </Link>
              </Col>
            </Row>
          </div>
        </div>
      </Container>
    </AuthLayout>
  );
}

export default Success;
