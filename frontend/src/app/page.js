"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Col, Container, Row} from 'react-bootstrap';
import UserCard from "@/app/fragment/UserCard";
import Waterfall from "@/app/components/Waterfall";


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
                    <Waterfall apiEndpoint={"/api/product/"} limit={20}/>
                </Row>
            </Container>
        </main>
    );
}
