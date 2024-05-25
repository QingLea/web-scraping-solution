import React from 'react';
import {Toast} from 'react-bootstrap';

const ToastNotification = ({show, title, message, onClose}) => (
    <Toast
        className="text-bg-danger toast-top-center"
        onClose={onClose}
        show={show}
        delay={3000}
        autohide
    >
        <Toast.Header className={"text-bg-danger"}>
            <strong className="me-auto">{title}</strong>
        </Toast.Header>
        <Toast.Body>{message}</Toast.Body>
    </Toast>
);


export default ToastNotification;
