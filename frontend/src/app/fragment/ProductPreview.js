import {Card, Row} from "react-bootstrap";
import React from "react";

const ProductPreview = ({title, description, price, imageUrl, status, created, updated, child}) => {
    return (<Card border={"dark"}>
        <Card.Img variant="top" src={imageUrl ? imageUrl : "pi.png"}/>
        <Card.Header>
            <Row>
                <h5>{title}</h5>
            </Row>
            <Row>
                {
                    (() => {
                        switch (status) {
                            case "AV":
                                return <span className="badge bg-success">Available</span>;
                            case "SO":
                                return <span className="badge bg-danger">Sold</span>;
                            default:
                                return <span className="badge bg-secondary">Unknown</span>;
                        }
                    })()
                }
            </Row>
        </Card.Header>
        <Card.Body>
            <Card.Text>{description}</Card.Text>
            <Card.Text>Created: {created}</Card.Text>
            <Card.Text>Updated: {updated}</Card.Text>
            <Card.Text>{price} EUR</Card.Text>
        </Card.Body>
        <Card.Footer>
            {child}
        </Card.Footer>
    </Card>);
}
export default ProductPreview;