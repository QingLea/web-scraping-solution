import React from 'react';
import {Col, Row} from 'react-bootstrap';
import ProductCard from "@/app/fragment/ProductCard";

const ProductList = ({products}) => {
    return (
        <Row>
            {products.map((p) => (
                <Col key={p.id} xs={3} md={3} lg={3}>
                    <ProductCard {...p}/>
                </Col>
            ))}
        </Row>
    );
};

export default ProductList;
