import {Card, CardText, Col, Container, Row} from "react-bootstrap";
import React from "react";

const ProductPreview = ({
                            id,
                            name,
                            category,
                            sub_category,
                            price,
                            comparison_price,
                            comparison_unit,
                            currency,
                            image,
                            created,
                            updated,
                            store,
                        }) => {
    return (
        <Card border="dark" className="mb-3">
            <Card.Img
                variant="top"
                src={image ? image : "pi.png"}
                style={{objectFit: "contain", height: "200px"}}
            />
            <Card.Header>
                <Container>
                    <Row>
                        <Col>
                            <h5>{name}</h5>
                        </Col>

                    </Row>
                    <Row>
                        <Col className="text-end">
                            <CardText><strong>ID:</strong> {id}</CardText>
                        </Col>
                    </Row>
                </Container>
            </Card.Header>
            <Card.Body>
                <Card.Text>
                    <strong>Category:</strong> {category}
                </Card.Text>
                <Card.Text>
                    <strong>Sub Category:</strong> {sub_category}
                </Card.Text>
                <Card.Text>
                    <strong>Price:</strong> {price} {currency}
                </Card.Text>
                <Card.Text>
                    <strong>Comparison:</strong> {comparison_price} {currency} /{" "}
                    {comparison_unit}
                </Card.Text>
                <Card.Text>
                    <strong>Created:</strong> {new Date(created).toLocaleString()}
                </Card.Text>
                <Card.Text>
                    <strong>Updated:</strong> {new Date(updated).toLocaleString()}
                </Card.Text>
            </Card.Body>
            <Card.Footer className="text-end">
                <CardText><strong>Store:</strong> {store}</CardText>
            </Card.Footer>
        </Card>
    );
};

export default ProductPreview;
