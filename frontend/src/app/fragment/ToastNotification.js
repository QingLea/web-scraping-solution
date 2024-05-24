import React from 'react';
import {Toast} from 'react-bootstrap';

const ToastNotification = ({show, message, onClose}) => {
    return (
        <Toast className={"text-bg-danger toast-top-center"} role={"alert"}
               onClose={onClose} show={show} delay={3000} autohide>
            <Toast.Body>{message}</Toast.Body>
        </Toast>
    );
};

export default ToastNotification;
