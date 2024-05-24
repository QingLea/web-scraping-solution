import React, {useState} from 'react';
import {Button, Col, Container, Form, FormControl, InputGroup, Navbar, Row} from "react-bootstrap";
import {metadata} from "@/metadata";

const SearchBar = ({inputAction, searchAction, resetAction, populateAction}) => {
    const [search, setSearch] = useState(''); // Assuming this state is lifted up if necessary

    return (<Navbar expanded={false} variant={"light"} as={"nav"}>
        <Navbar.Brand>{metadata.brand}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Container>
            <Form className={"g-3 d-flex"}>
                <Row className="align-items-center">
                    <Col xs={"auto"}>
                        <Form.Label htmlFor="searchTitle" visuallyHidden>
                            Title
                        </Form.Label>
                        <InputGroup>
                            <FormControl type={"text"} placeholder={"Search Title"} id={"title"} value={search}
                                         onChange={(e) => {
                                             inputAction(e.target.value);
                                             setSearch(e.target.value);
                                         }}/>
                        </InputGroup>
                    </Col>
                    <Col xs={"auto"}>
                        <Button type={"button"} variant={"primary"} onClick={searchAction}>
                            Search
                        </Button>
                    </Col>
                    <Col xs={"auto"}>
                        <Button type={"button"} variant={"outline-secondary"} onClick={() => {
                            // set the input to empty string
                            setSearch(''); // Clear the input field by setting the state to an empty string
                            if (resetAction) resetAction(); // Call resetAction if it exists
                        }}>
                            Reset
                        </Button>
                    </Col>
                    <Col xs={{span: "auto"}}>
                        <Button variant={"danger"} onClick={populateAction}>REPOPULATE ALL DATA</Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    </Navbar>);
};

export default SearchBar;
