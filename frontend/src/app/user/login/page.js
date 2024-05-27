"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useState} from 'react';
import {Button, ButtonGroup, Col, Container, Form, Row} from 'react-bootstrap';
import {csrftoken} from "@/utils/csrfCookie";
import ToastNotification from "@/app/components/ToastNotification";
import {useRouter} from "next/navigation";

function LoginPage() {

    const router = useRouter();

    const navigateToHome = () => {
        router.push('/');
    };

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastTitle, setToastTitle] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent the default form submit action
        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRFToken": csrftoken(),
                },
                body: JSON.stringify({username, password}),
            });
            const data = await response.json();
            if (response.ok) {
                navigateToHome();
            } else {
                throw new Error(data.detail);
            }
        } catch (error) {
            setToastTitle("Error");
            setToastMessage(error.message); // Set the error message for the toast
            setShowToast(true); // Show the toast
        }
    };

    return (
        <Container>
            <Row>
                <Col>
                    <h1>Login</h1>
                </Col>
            </Row>
            <Row>
                <Form> {/* Bind form submission to handleLogin */}
                    <Form.Group className="mb-3 row">
                        <Form.Label column sm={2}>
                            Username
                        </Form.Label>
                        <Col sm={10}>
                            <Form.Control
                                type="username"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)} // Update state on change
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group className="mb-3 row">
                        <Form.Label column sm={2}>
                            Password
                        </Form.Label>
                        <Col sm={10}>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} // Update state on change
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <ButtonGroup>
                            <Button variant={"success"} type="button" onClick={handleLogin}>Login</Button>
                        </ButtonGroup>
                    </Form.Group>
                </Form>
            </Row>
            <ToastNotification title={toastTitle} is_success={false} message={toastMessage} show={showToast}
                               onClose={() => {
                                   setShowToast(false);
                               }}/>
        </Container>
    );
}

export default LoginPage;
