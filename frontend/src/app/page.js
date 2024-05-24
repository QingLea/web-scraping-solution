"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Card, Col, Container, Row, Spinner} from 'react-bootstrap';
import {useCallback, useEffect, useState} from "react";
import {csrftoken} from "@/utils/csrfCookie";
import ToastNotification from "@/app/fragment/ToastNotification";
import UserCard from "@/app/fragment/UserCard";
import ProductList from "@/app/fragment/ProductList";

// Custom hook for fetching user data
const useUser = () => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/user/profile/", {
                headers: {"Content-type": "application/json"},
            });
            const data = await res.json();
            setUser(data);
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return {user, loading, fetchUser};
};

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
                throw new Error(`HTTP error! status: ${res.status} detail:` + data.detail);
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
    },[]);

    return {products, loading, error, fetchMoreProducts: () => fetchProducts(false)};
};

export default function Home() {
    const {user, loading: userLoading, fetchUser} = useUser();
    const {products, loading: productsLoading, error: productsError, fetchMoreProducts} = useProducts();

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (productsError) {
            setToastMessage("Failed to fetch products: " + productsError);
            setShowToast(true);
        }
    }, [productsError]);

    const logout = async () => {
        try {
            await fetch('/api/user/login/', {
                method: "DELETE",
                headers: {
                    "Content-type": "application/json",
                    "X-CSRFToken": csrftoken(),
                },
            });
            fetchUser(); // Refetch user data to reset state
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    };

    return (
        <main>
            <Container>
                <Row>
                    <Col xs={12} md={12} lg={12}>
                        <Row>
                            <Col>
                                {userLoading ? <Spinner animation="border"/> : <UserCard user={user} logout={logout}/>}
                            </Col>
                        </Row>
                    </Col>
                    <ToastNotification message={toastMessage} show={showToast} onClose={() => setShowToast(false)}/>
                </Row>
                <Row>
                    <Col xs={12} md={12} lg={12}>
                        <Card border={"dark"}>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <span>Products</span>
                            </Card.Header>
                            <Card.Body>
                                {productsLoading ? <Spinner animation="border"/> : <ProductList products={products}/>}
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
