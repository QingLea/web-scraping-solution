"use client";
import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Col, Container, Form, Row} from 'react-bootstrap';
import {csrftoken} from "@/utils/csrfCookie";
import ToastNotification from "@/app/components/ToastNotification";
import {useRouter} from "next/navigation";


// change the password to the new password page

export default function Account() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRepeatPassword, setNewRepeatPassword] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastTitle, setToastTitle] = useState('');
    const router = useRouter();

    const navigateToHome = () => {
        router.push('/');
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault(); // Prevent the default form submit action
        if (newPassword !== newRepeatPassword) {
            setToastTitle("Error");
            setToastMessage("New passwords do not match"); // Set the error message for the toast
            setShowToast(true); // Show the toast
            return;
        }
        try {
            const response = await fetch('/api/user/account/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken(),
                },
                body: JSON.stringify({
                    "oldPassword": oldPassword,
                    "newPassword": newPassword
                }),
            });
            const data = await response.json();
            if (response.ok) {
                navigateToHome();
            } else {
                throw new Error(data.detail);
            }
        } catch (error) {
            setToastTitle("Error");
            setToastMessage(error.message);
            setShowToast(true);
        }
    };

    return (
        <Container>
            <Row>
                <Col>
                    <h1>Update Password</h1>
                </Col>
            </Row>
            <Row>
                <Form>
                    <Form.Group className="mb-3 row" controlId="formHorizontalEmail">
                        <Form.Label column sm={2}>
                            Old Password
                        </Form.Label>
                        <Col sm={10}>
                            <Form.Control
                                type="password"
                                placeholder="Old Password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)} // Update state on change
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group className="mb-3 row" controlId="formHorizontalPassword">
                        <Form.Label column sm={2}>
                            New Password
                        </Form.Label>
                        <Col sm={10}>
                            <Form.Control
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)} // Update state on change
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group className="mb-3 row" controlId="formHorizontalPassword">
                        <Form.Label column sm={2}>
                            Repeat New Password
                        </Form.Label>
                        <Col sm={10}>
                            <Form.Control
                                type="password"
                                placeholder="Repeat New Password"
                                value={newRepeatPassword}
                                onChange={(e) => setNewRepeatPassword(e.target.value)} // Update state on change
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group className="mb-3 row">
                        <Col sm={{span: 10, offset: 2}}>
                            <Button variant={"danger"} className="me-2" type="button"
                                    onClick={handleUpdatePassword}>Update</Button>
                            <Button variant={"outline-success"} type="button" onClick={navigateToHome}>Back</Button>
                        </Col>
                    </Form.Group>
                </Form>
            </Row>
            <ToastNotification title={toastTitle} show={showToast} message={toastMessage}
                               onClose={() => setShowToast(false)}/>
        </Container>
    );
}
