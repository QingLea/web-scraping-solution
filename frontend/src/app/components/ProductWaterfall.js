"use client";
import React, {useEffect, useRef, useState} from 'react';
import {Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import ProductCard from "@/app/fragment/ProductCard";
import ToastNotification from "@/app/fragment/ToastNotification";

const ProductWaterfall = ({apiEndpoint, limit}) => {
    const containerRef = useRef(null);
    const sentinelRef = useRef(null);
    const [switcher, setSwitcher] = useState(false);
    const [items, setItems] = useState([]);
    const [columns, setColumns] = useState([]);
    const offsetRef = useRef(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchParams, setSearchParams] = useState({
        item_id: '',
        name: '',
        category: '',
        sub_category: '',
        store_id: '',
        min_price: '',
        max_price: '',
        min_comparison_price: '',
        max_comparison_price: '',
    });

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastTitle, setToastTitle] = useState('');


    const buildQueryString = (params) => {
        return Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    };
    const fetchData = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        const offset = offsetRef.current;
        const queryString = buildQueryString({...searchParams, offset, limit});

        try {
            const response = await fetch(`${apiEndpoint}?${queryString}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail);
            }

            const data = await response.json();
            if (data.length < limit) {
                setHasMore(false);
            }
            setItems(prevItems => [...prevItems, ...data]);
            offsetRef.current += data.length;
        } catch (error) {
            setToastTitle("Error");
            setToastMessage(error.message);
            setShowToast(true);
            setHasMore(false);  // Stop further fetch attempts on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const columnCount = Math.floor(containerWidth / 300); // Change 300 to desired column width
                const newColumns = Array.from({length: columnCount}, () => []);

                items.forEach((item, index) => {
                    newColumns[index % columnCount].push(item);
                });

                setColumns(newColumns);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial layout

        return () => window.removeEventListener('resize', handleResize);
    }, [items]);

    useEffect(() => {
        if (switcher) {
            const observer = new IntersectionObserver(
                entries => {
                    if (entries[0].isIntersecting) {
                        fetchData();
                    }
                },
                {threshold: 1.0}
            );

            if (sentinelRef.current) {
                observer.observe(sentinelRef.current);
            }

            return () => {
                if (sentinelRef.current) {
                    observer.unobserve(sentinelRef.current);
                }
            };
        }
    }, [sentinelRef.current, loading, hasMore, switcher]);


    const handleChange = (e) => {
        const {name, value} = e.target;
        setSearchParams((prevParams) => ({
            ...prevParams,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSwitcher(false);
        setItems([]);
        setHasMore(true);
        offsetRef.current = 0;

        await fetchData();
        setSwitcher(true);
    };

    return (
        <Container>
            <Row>
                <Col xs={12} md={12} lg={12}>
                    <Row>
                        <Col>
                            <Card border={"dark"}>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <span>Search</span>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col>
                                            <Form onSubmit={handleSubmit}>
                                                <Row className="mb-3">
                                                    <Form.Group as={Col} controlId="formGridItemId">
                                                        <Form.Label>Item ID</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Enter item ID"
                                                            name="item_id"
                                                            value={searchParams.item_id}
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group as={Col} controlId="formGridName">
                                                        <Form.Label>Name</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Enter name"
                                                            name="name"
                                                            value={searchParams.name}
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group as={Col} controlId="formGridCategory">
                                                        <Form.Label>Category</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Enter category"
                                                            name="category"
                                                            value={searchParams.category}
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group as={Col} controlId="formGridSubCategory">
                                                        <Form.Label>Sub Category</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Enter sub category"
                                                            name="sub_category"
                                                            value={searchParams.sub_category}
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group as={Col} controlId="formGridStoreId">
                                                        <Form.Label>Store ID</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Enter store ID"
                                                            name="store_id"
                                                            value={searchParams.store_id}
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>
                                                </Row>

                                                <Row className="mb-3">
                                                    <Form.Group as={Col} controlId="formGridMinPrice">
                                                        <Form.Label>Min Price</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="Enter minimum price"
                                                            name="min_price"
                                                            value={searchParams.min_price}
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group as={Col} controlId="formGridMaxPrice">
                                                        <Form.Label>Max Price</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="Enter maximum price"
                                                            name="max_price"
                                                            value={searchParams.max_price}
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group as={Col} controlId="formGridMinComparisonPrice">
                                                        <Form.Label>Min Comparison Price</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="Enter minimum comparison price"
                                                            name="min_comparison_price"
                                                            value={searchParams.min_comparison_price}
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group as={Col} controlId="formGridMaxComparisonPrice">
                                                        <Form.Label>Max Comparison Price</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="Enter maximum comparison price"
                                                            name="max_comparison_price"
                                                            value={searchParams.max_comparison_price}
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>
                                                </Row>
                                                <Button variant="primary" type="submit">
                                                    Search
                                                </Button>
                                            </Form>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card border={"dark"}>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <span>Products</span>
                                </Card.Header>
                                <Card.Body>
                                    <Row ref={containerRef}>
                                        {columns.map((column, columnIndex) => (
                                            <Col key={columnIndex}>
                                                {column.map((item, itemIndex) => (
                                                    <div key={itemIndex}>
                                                        <ProductCard {...item} />
                                                    </div>
                                                ))}
                                            </Col>
                                        ))}
                                    </Row>
                                    <Row>
                                        <div ref={sentinelRef}>
                                            {loading && <p>Loading more...</p>}
                                            {!hasMore && <p>No more items to load.</p>}
                                        </div>
                                    </Row>

                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <ToastNotification title={toastTitle} message={toastMessage} show={showToast} onClose={() => {
                setShowToast(false);
            }}/>
        </Container>
    );
};

export default ProductWaterfall;
