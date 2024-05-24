"use client";

import React, {useEffect, useRef, useState} from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import ProductCard from "@/app/fragment/ProductCard";

const Waterfall = ({apiEndpoint, limit, params}) => {
    const containerRef = useRef(null);
    const sentinelRef = useRef(null);
    const [items, setItems] = useState([]);
    const [columns, setColumns] = useState([]);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchData = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            params = params || {};
            const response = await fetch(`${apiEndpoint}?offset=${offset}&limit=${limit}&${new URLSearchParams(params)}`);
            const data = await response.json();
            if (data.length === 0) {
                setHasMore(false);
            } else {
                setItems(prevItems => [...prevItems, ...data]);
                setOffset(prevOffset => prevOffset + limit);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

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
    }, [sentinelRef.current, loading, hasMore]);

    return (
        <Container>
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
            <div ref={sentinelRef}>
                {loading && <p>Loading more...</p>}
                {!hasMore && <p>No more items to load.</p>}
            </div>
        </Container>
    );


};

export default Waterfall;
