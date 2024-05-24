import React from 'react';
import {Col, Row} from 'react-bootstrap';
import {useRouter} from "next/navigation";
import ProductCard from "@/app/fragment/ProductCard";

const ProductList = ({products, addToCart, user}) => {
    const router = useRouter();
    const navigateToProductManagement = (productId) => {
        router.push('/edit_product?productId=' + productId);
    }
    return (
        <Row>
            {products.map((p, idx) => (
                <Col key={p.id} xs={3} md={3} lg={3}>
                    <ProductCard imageUrl={p.imageUrl}
                                 name={p.name}
                                 description={p.description}
                                 price={p.price}
                                 created={p.created}
                                 updated={p.updated}
                                 userId={user.id}
                                 owner={p.owner}
                                 status={p.status}
                                 productId={p.id}
                                 addToCartAction={() => addToCart(idx)}
                                 editAction={() => navigateToProductManagement(p.id)}/>
                </Col>
            ))}
        </Row>
    );
};

export default ProductList;
