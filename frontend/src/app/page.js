"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Card, Col, Container, Row, Spinner} from 'react-bootstrap';
import {useCallback, useEffect, useState} from "react";
import UserCard from "@/app/fragment/UserCard";
import ProductList from "@/app/fragment/ProductList";
import ToastNotification from "@/app/fragment/ToastNotification";


// Custom hook for fetching product data with pagination
const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [offset, setOffset] = useState(0);
    const limit = 20;

    const fetchProducts = useCallback(async (reset = false) => {
        setLoading(true);
        try {
            const url = new URL("/api/product/", window.location.origin);
            url.searchParams.append("limit", limit);
            url.searchParams.append("offset", reset ? 0 : offset);
            const res = await fetch(url, {method: "GET"});
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail);
            }
            if (reset) {
                setProducts(data);
                setOffset(limit);
            } else {
                setProducts(prevProducts => [...prevProducts, ...data]);
                setOffset(prevOffset => prevOffset + limit);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [offset]);

    useEffect(() => {
        fetchProducts(true).then(() => console.log("Initial products loaded"));
    }, []);

    return {products, loading, error, fetchMoreProducts: () => fetchProducts(false)};
};

export default function Home() {
    // const {user, loading: userLoading, fetchUser} = useUser();
    const {products, loading: productsLoading, error: productsError, fetchMoreProducts} = useProducts();

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [title, setTitle] = useState('Error');

    useEffect(() => {
        if (productsError) {
            setTitle("Failed to fetch products")
            setToastMessage(productsError);
            setShowToast(true);
        }
    }, [productsError]);

    return (
        <main>
            <Container>
                <Row>
                    <Col xs={12} md={12} lg={12}>
                        <Row>
                            <Col>
                                <UserCard/>
                            </Col>
                        </Row>
                    </Col>
                    <ToastNotification message={toastMessage} show={showToast} title={title}
                                       onClose={() => setShowToast(false)}/>
                </Row>
                <Row>
                    <Col xs={12} md={12} lg={12}>
                        <Card border={"dark"}>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <span>Products</span>
                            </Card.Header>
                            <Card.Body>
                                {productsLoading ? <Spinner animation="border"/> :
                                    <ProductList products={products}/>}
                                <div className="d-flex justify-content-center mt-3">
                                    <Button onClick={fetchMoreProducts} disabled={productsLoading}>
                                        {productsLoading ? "Loading..." : "Load More Products"}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </main>
    );
}
