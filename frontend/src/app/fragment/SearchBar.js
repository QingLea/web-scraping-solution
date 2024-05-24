import React, {useState} from 'react';
import {Button, Col, Container, Form, Row} from 'react-bootstrap';

const SearchBar = ({onSearch}) => {
    const [searchParams, setSearchParams] = useState({
        item_id: '',
        name: '',
        category: '',
        sub_category: '',
        store_id: '',
        min_price: '',
        max_price: '',
        min_comparison_price: '',
        max_comparison_price: '',
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setSearchParams((prevParams) => ({
            ...prevParams,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchParams);
    };

    return (
        <Container>
            <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridItemId">
                        <Form.Label>Item ID</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter item ID"
                            name="item_id"
                            value={searchParams.item_id}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter name"
                            name="name"
                            value={searchParams.name}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridCategory">
                        <Form.Label>Category</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter category"
                            name="category"
                            value={searchParams.category}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridSubCategory">
                        <Form.Label>Sub Category</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter sub category"
                            name="sub_category"
                            value={searchParams.sub_category}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridStoreId">
                        <Form.Label>Store ID</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter store ID"
                            name="store_id"
                            value={searchParams.store_id}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Row>

                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridMinPrice">
                        <Form.Label>Min Price</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter minimum price"
                            name="min_price"
                            value={searchParams.min_price}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridMaxPrice">
                        <Form.Label>Max Price</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter maximum price"
                            name="max_price"
                            value={searchParams.max_price}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridMinComparisonPrice">
                        <Form.Label>Min Comparison Price</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter minimum comparison price"
                            name="min_comparison_price"
                            value={searchParams.min_comparison_price}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridMaxComparisonPrice">
                        <Form.Label>Max Comparison Price</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter maximum comparison price"
                            name="max_comparison_price"
                            value={searchParams.max_comparison_price}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Row>

                <Button variant="primary" type="submit">
                    Search
                </Button>
            </Form>
        </Container>
    );
};

export default SearchBar;
