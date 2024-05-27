"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Col, Container, Row} from 'react-bootstrap';
import UserCard from "@/app/components/UserCard";
import ProductWaterfall from "@/app/components/Product/ProductWaterfall";
import ScraperCard from "@/app/components/ScraperCard";


// Custom hook for fetching product data with pagination
export default function Home() {
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
                </Row>
                <Row>
                    <Col xs={12} md={12} lg={12}>
                        <Row>
                            <h1>Scrapping</h1>
                            <Col>
                                <ScraperCard/>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <h1>Search & Products</h1>
                    <ProductWaterfall apiEndpoint={"/api/product"} limit={20}/>
                </Row>
            </Container>
        </main>
    );
}
