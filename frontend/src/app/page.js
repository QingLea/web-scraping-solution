"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Card, Col, Container, Row} from 'react-bootstrap';
import {useEffect, useState} from "react";
import {csrftoken} from "@/utils/csrfCookie";
import ToastNotification from "@/app/fragment/ToastNotification";
import UserCard from "@/app/fragment/UserCard";
import {useRouter} from "next/navigation";
import ProductList from "@/app/fragment/ProductList";

export default function Home() {
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [user, setUser] = useState({});

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [search, setSearch] = useState('');


    const currentUser = async () => {
        const res = await fetch("/api/user/profile/", {
            headers: {"Content-type": "application/json"},
        });
        return await res.json(); // Return user data directly
    };

    useEffect(() => {
        const initializeData = async () => {
            await loadProducts(); // Load products first
            setUser(await currentUser()); // Set user state
        };
        initializeData();
    }, []); // Empty dependency array ensures this runs once on component mount


    //  logout the user
    const logout = async () => {
        await fetch('api/user/login/', {
            method: "DELETE",
            headers: {
                "Content-type": "application/json",
                "X-CSRFToken": csrftoken(),
            },
        });
        setUser({}); // Clear the user state
    };

    const loadProducts = async () => {
        try {
            const url = new URL("/api/product/", window.location.origin);
            url.searchParams.append("limit", "20");
            url.searchParams.append("offset", "0");
            const res = await fetch(url, {
                method: "GET"
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status} detail:` + data.detail);
            }
            setProducts(data);

        } catch (error) {
            setToastMessage("Failed to fetch products:" + error.message);
            setShowToast(true);
        }
    };


    return (
        <main>
            <Container>
                <Row>
                    <Col xs={12} md={12} lg={12}>
                        <Row>
                            <Col>
                                <UserCard user={user} logout={logout}/>
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
                                <ProductList products={products}/>
                            </Card.Body>
                        </Card>
                    </Col>

                </Row>
            </Container>
        </main>
    );
}
