import React, {useEffect, useRef, useState} from 'react';
import {Button, Card, Spinner} from 'react-bootstrap';
import ToastNotification from "@/app/components/ToastNotification";
import {csrftoken} from "@/utils/csrfCookie";

const ScraperCard = () => {
    const [data, setData] = useState({
        is_running: false,
        from: 0,
        scraped_records: 0,
        timestamp: 0
    });
    const [toast, setToast] = useState({
        show: false,
        message: '',
        title: '',
        status: false
    });
    const [loading, setLoading] = useState({
        scrape: false,
        stop: false,
        forceStop: false,
        reset: false
    });

    const statusFailTimes = useRef(0);

    const showErrorToast = (title, message) => {
        setToast({
            show: true,
            title,
            message,
            status: false
        });
    };

    const showSuccessToast = (title, message) => {
        setToast({
            show: true,
            title,
            message,
            status: true
        });
    };

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch('/api/scraper/status/', {
                    headers: {
                        "Content-type": "application/json",
                        "X-CSRFToken": csrftoken(),
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    statusFailTimes.current += 1;
                    throw new Error(errorData.detail);
                }
                setData(await response.json());
            } catch (error) {
                if (statusFailTimes.current <= 1) {
                    showErrorToast("Error", `Error fetching scraper status: ${error.message}`);
                }
            }
        };

        fetchStatus();

        const interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleScrape = async () => {
        setLoading(prev => ({...prev, scrape: true}));
        try {
            const response = await fetch('/api/scraper/start/', {
                method: 'POST', headers: {
                    "Content-type": "application/json",
                    "X-CSRFToken": csrftoken(),
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail);
            }
            const data = await response.json();
            showSuccessToast("Success", data.detail);
            setData(prev => ({...prev, is_running: true}));
        } catch (error) {
            showErrorToast("Error", `Error starting scraper: ${error.message}`);
        } finally {
            setLoading(prev => ({...prev, scrape: false}));
        }
    };

    const handleStop = async () => {
        setLoading(prev => ({...prev, stop: true}));
        try {
            const response = await fetch('/api/scraper/stop/', {
                method: 'POST', headers: {
                    "Content-type": "application/json",
                    "X-CSRFToken": csrftoken(),
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail);
            }
            const data = await response.json();
            showSuccessToast("Success", data.detail);
        } catch (error) {
            showErrorToast("Error", `Error stopping scraper: ${error.message}`);
        } finally {
            setLoading(prev => ({...prev, stop: false}));
        }
    };

    const handleForceStop = async () => {
        setLoading(prev => ({...prev, forceStop: true}));
        try {
            const response = await fetch('/api/scraper/force_stop/', {
                method: 'POST', headers: {
                    "Content-type": "application/json",
                    "X-CSRFToken": csrftoken(),
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail);
            }
            const data = await response.json();
            showSuccessToast("Success", data.detail);
        } catch (error) {
            showErrorToast("Error", `Error force stopping scraper: ${error.message}`);
        } finally {
            setLoading(prev => ({...prev, forceStop: false}));
        }
    };

    const handleReset = async () => {
        setLoading(prev => ({...prev, reset: true}));
        try {
            const response = await fetch('/api/scraper/reset/', {
                method: 'POST', headers: {
                    "Content-type": "application/json",
                    "X-CSRFToken": csrftoken(),
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail);
            }
            const data = await response.json();
            showSuccessToast("Success", data.detail);
        } catch (error) {
            showErrorToast("Error", `Error resetting scraper: ${error.message}`);
        } finally {
            setLoading(prev => ({...prev, reset: false}));
        }
    };

    const timeSinceLastUpdate = (timestamp) => {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        const interval = seconds / 60;

        if (interval > 1) {
            if (interval > 10000) {
                return "Long time ago";
            }
            return `${Math.floor(interval)} mins ago`;
        } else {
            return `${Math.floor(seconds)} secs ago`;
        }
    };

    const {is_running, from, scraped_records, timestamp} = data;

    return (
        <Card border="dark">
            <Card.Header>
                <h4>Scraper</h4>
            </Card.Header>
            <Card.Body>
                <Card.Title>Scrape Data</Card.Title>
                <Card.Text>
                    Click the button to scrape data from the website.
                </Card.Text>
                <Card.Text>
                    <small className="text-muted">Last updated {timeSinceLastUpdate(timestamp)}</small>
                </Card.Text>
                <div className="mt-3">
                    <Button variant="success" className="mx-1" disabled={is_running || loading.scrape}
                            onClick={handleScrape}>
                        {loading.scrape || is_running ? (
                            <>
                                <span>Scraping </span>
                                <Spinner as="span" variant={"light"} animation="border" size="sm" role="status"
                                         aria-hidden="true"/>
                            </>
                        ) : (
                            <span>Scrape</span>
                        )}
                    </Button>
                    <Button variant="primary" className="mx-1" disabled={is_running || loading.reset}
                            onClick={handleReset}>
                        {loading.reset ? (
                            <>
                                <span>Resetting </span>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                            </>
                        ) : (
                            <span>Reset</span>
                        )}
                    </Button>
                    <Button variant="warning" className="mx-1" disabled={!is_running || loading.stop}
                            onClick={handleStop}>
                        {loading.stop ? (
                            <>
                                <span>Stopping </span>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                            </>
                        ) : (
                            <span>Stop</span>
                        )}
                    </Button>
                    <Button variant="danger" className="mx-1" disabled={!is_running || loading.forceStop}
                            onClick={handleForceStop}>
                        {loading.forceStop ? (
                            <>
                                <span>Force Stopping </span>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                            </>
                        ) : (
                            <span>Force Stop</span>
                        )}
                    </Button>
                </div>
                <hr/>
                <div className="text-left">
                    <Card.Text><strong>Status Information:</strong></Card.Text>
                    <Card.Text style={{color: is_running ? 'green' : 'red'}}>
                        <strong>Status:</strong> {is_running ? "Running" : "Stopped"}
                    </Card.Text>
                    <Card.Text>
                        <strong>From:</strong> {from}
                    </Card.Text>
                    <Card.Text>
                        <strong>Scraped Records:</strong> {scraped_records}
                    </Card.Text>
                </div>
            </Card.Body>
            <ToastNotification
                status={toast.status}
                title={toast.title}
                message={toast.message}
                show={toast.show}
                onClose={() => setToast({...toast, show: false})}
            />
        </Card>
    );
};

export default ScraperCard;
