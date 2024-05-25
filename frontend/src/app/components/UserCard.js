import React, {useCallback, useEffect, useState} from 'react';
import {Button, ButtonGroup, Card, Spinner} from 'react-bootstrap';
import {useRouter} from 'next/navigation';
import {csrftoken} from "@/utils/csrfCookie";

const useUser = () => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/user/profile/", {
                headers: {"Content-type": "application/json"},
            });
            const data = await res.json();
            setUser(data);
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return {user, loading, fetchUser};
};


const UserCard = () => {
    const router = useRouter();
    const {user, loading: userLoading, fetchUser} = useUser();


    const navigateToLogin = () => {
        router.push('/user/login');
    };
    const navigateToSignup = () => {
        router.push('/user/signup');
    };
    const navigateToEdit = () => {
        router.push('/user/account');
    }

    const logout = async () => {
        try {
            await fetch('/api/user/login/', {
                method: "DELETE",
                headers: {
                    "Content-type": "application/json",
                    "X-CSRFToken": csrftoken(),
                },
            });
            fetchUser(); // Refetch user data to reset state
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    };

    return (
        <Card border="dark">
            <Card.Header>User</Card.Header>
            <Card.Body>
                {userLoading ? (
                    <Spinner animation="border"/>
                ) : user && user.id ? (
                    <>
                        <Card.Text>User: {user.username}</Card.Text>
                        <ButtonGroup size="sm">
                            <Button variant="danger" onClick={logout}>Logout</Button>
                            <Button variant="outline-danger" onClick={navigateToEdit}>Account</Button>
                        </ButtonGroup>
                    </>
                ) : (
                    <ButtonGroup size="sm">
                        <Button variant="outline-success" onClick={navigateToLogin}>Login</Button>
                        <Button variant="success" onClick={navigateToSignup}>Register</Button>
                    </ButtonGroup>
                )}
            </Card.Body>
        </Card>
    );
};

export default UserCard;
