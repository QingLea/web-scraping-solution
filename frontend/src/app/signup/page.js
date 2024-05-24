"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Col, Container, Form, Row} from 'react-bootstrap';
import React, {useState} from "react";
import {useRouter} from "next/navigation";
import ToastNotification from "@/app/fragment/ToastNotification";
import {csrftoken} from "@/utils/csrfCookie";

function SignupPage() {
    const router = useRouter();

    const navigateToHome = () => {
        router.push('/');
    };

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const handleSignup = async (e) => {
            e.preventDefault(); // Prevent the default form submit action
            try {
                const response = await fetch('/api/user/signup/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "X-CSRFToken": csrftoken(),
                    },
                    body: JSON.stringify({email: email, username: username, password: password}),
                });

                const data = await response.json();
                if (response.ok) {
                    navigateToHome();
                } else {
                    throw new Error(data.detail);
                }
            } catch (error) {
                setToastMessage(error.message); // Set the error message for the toast
                setShowToast(true); // Show the toast
            }
        }
    ;

    return (
        <Container>
            <Row>
                <Col>
                    <h1>Signup</h1>
                </Col>
            </Row>
            <Row>
                <Form>
                    {/*username*/}
                    <Form.Group className="mb-3 row" controlId="formHorizontalUsername">
                        <Form.Label column sm={2}>
                            Username
                        </Form.Label>
                        <Col sm={10}>
                            <Form.Control
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)} // Update state on change
                            />
                        </Col>
                    </Form.Group>

                    {/*email*/}
                    <Form.Group className="mb-3 row" controlId="formHorizontalEmail">
                        <Form.Label column sm={2}>
                            Email
                        </Form.Label>
                        <Col sm={10}>
                            <Form.Control
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} // Update state on change
                            />
                        </Col>
                    </Form.Group>

                    {/*password*/}
                    <Form.Group className="mb-3 row" controlId="formHorizontalPassword">
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
                        <Col sm={{span: 10, offset: 2}}>
                            <Button type="button" variant={"success"} onClick={handleSignup}>Sign Up</Button>
                        </Col>
                    </Form.Group>
                </Form>
            </Row>
            <ToastNotification message={toastMessage} show={showToast} onClose={() => {
                setShowToast(false);
            }}/>
        </Container>
    );
}

export default SignupPage;
