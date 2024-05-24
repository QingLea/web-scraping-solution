import React from 'react';
import {Button, ButtonGroup, Card} from 'react-bootstrap';
import {useRouter} from 'next/navigation';

const UserCard = ({user, logout}) => {
    const router = useRouter();

    const navigateToLogin = () => {
        router.push('/login');
    };
    const navigateToSignup = () => {
        router.push('/signup');
    };
    const navigateToEdit = () => {
        router.push('/account');
    }
    return (
        <Card border={"dark"}>
            <Card.Header>User</Card.Header>
            <Card.Body>
                {user && user.id ? (
                    <>
                        <Card.Text>User: {user.username}</Card.Text>
                        <ButtonGroup size={"sm"}>
                            <Button variant="danger" onClick={logout}>Logout</Button>
                            <Button variant="outline-danger" onClick={navigateToEdit}>Account</Button>
                        </ButtonGroup>
                    </>
                ) : (
                    <ButtonGroup size={"sm"}>
                        <Button variant="outline-success" onClick={navigateToLogin}>Login</Button>
                        <Button variant="success" onClick={navigateToSignup}>Register</Button>
                    </ButtonGroup>
                )}
            </Card.Body>
        </Card>
    );
};

export default UserCard;
