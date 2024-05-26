import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Col, Container, Row} from "react-bootstrap";
import React from "react";
import {metadata} from "@/metadata";


const Header = () => (
    <header>
        <Container>
            <Row>
                <Col>
                    <h1>{metadata.title}</h1>
                </Col>
            </Row>
        </Container>
    </header>
);

const Footer = () => (
    <footer>
        <Container>
            <Row>
                <Col>
                    <p>{metadata.description}</p>
                </Col>
            </Row>
        </Container>
    </footer>
);


export default function RootLayout({children}) {
    return (
        <html>
        <body>
        <Header/>
        <main>{children}</main>
        <Footer/>
        </body>
        </html>
    );
}
