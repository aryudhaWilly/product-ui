import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "./features/products/productsSlice";
import { Container, Row, Col, Card, Button, Spinner, Modal, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./App.css"; // Import your CSS file

function App() {
    const dispatch = useDispatch();
    const products = useSelector((state) => state.products.products);
    const productStatus = useSelector((state) => state.products.status);

    const [show, setShow] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        product_name: "",
        category: "",
        price: "",
        discount: "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (productStatus === "idle") {
            dispatch(fetchProducts());
        }
    }, [productStatus, dispatch]);

    const handleClose = () => {
        setShow(false);
        setEditingProduct(null);
        setNewProduct({
            product_name: "",
            category: "",
            price: "",
            discount: "",
        });
        setErrors({});
    };

    const handleShow = () => setShow(true);

    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteProduct(id))
                    .then(() => {
                        Swal.fire("Deleted!", "Your product has been deleted.", "success");
                    })
                    .catch((error) => {
                        Swal.fire("Error!", "There was an error deleting the product.", "error");
                    });
            }
        });
    };

    const handleChange = (e) => {
        setNewProduct({
            ...newProduct,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = () => {
        const { product_name, category, price, discount } = newProduct;

        let errors = {};

        if (!product_name) {
            errors.product_name = "Product name is required.";
        }

        if (!category) {
            errors.category = "Category is required.";
        }

        if (!price) {
            errors.price = "Price is required.";
        } else if (isNaN(price) || price <= 0) {
            errors.price = "Price must be a positive number.";
        }

        if (isNaN(discount) || discount < 0) {
            errors.discount = "Discount cannot be negative.";
        }

        if (Object.keys(errors).length > 0) {
            Swal.fire({
                icon: "error",
                title: "Error",
                html: Object.entries(errors)
                    .map(([field, message]) => `<p><strong>${field}:</strong> ${message}</p>`)
                    .join(""),
            });
            return;
        }

        if (editingProduct) {
            dispatch(updateProduct({ ...newProduct, id: editingProduct.id }))
                .then(() => {
                    Swal.fire("Success", "Product updated successfully.", "success");
                })
                .catch((error) => {
                    Swal.fire("Error", "There was an error updating the product.", "error");
                });
        } else {
            dispatch(createProduct(newProduct))
                .then(() => {
                    Swal.fire("Success", "Product added successfully.", "success");
                })
                .catch((error) => {
                    Swal.fire("Error", "There was an error adding the product.", "error");
                });
        }
        handleClose();
    };

    return (
        <Container className="mt-4">
            <h1 className="mb-4 text-center">Product List</h1>
            {productStatus === "loading" ? (
                <div className="d-flex justify-content-center mt-5">
                    <Spinner animation="border" />
                </div>
            ) : (
                <>
                    <Button className="mb-4 btn-custom" onClick={handleShow}>
                        Add Product
                    </Button>
                    <Row>
                        {products.map((product) => (
                            <Col md={4} lg={3} key={product.id} className="mb-4">
                                <Card className="h-100">
                                    <Card.Body>
                                        <Card.Title>{product.product_name}</Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted">{product.category}</Card.Subtitle>
                                        <Card.Text>
                                            <strong>Price:</strong> ${parseFloat(product.price).toFixed(2)}
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Discount:</strong> {product.discount}%
                                        </Card.Text>
                                    </Card.Body>
                                    <Card.Footer>
                                        <Button
                                            variant="info"
                                            className="btn-custom me-2"
                                            onClick={() => {
                                                setEditingProduct(product);
                                                setNewProduct({
                                                    product_name: product.product_name,
                                                    category: product.category,
                                                    price: product.price,
                                                    discount: product.discount,
                                                });
                                                handleShow();
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button variant="danger" className="btn-custom-danger" onClick={() => handleDelete(product.id)}>
                                            Delete
                                        </Button>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {/* Modal for Add/Edit Product */}
            <Modal show={show} onHide={handleClose} className="modal-animation">
                <Modal.Header closeButton>
                    <Modal.Title>{editingProduct ? "Edit Product" : "Add Product"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formProductName">
                            <Form.Label>Product Name</Form.Label>
                            <Form.Control type="text" name="product_name" value={newProduct.product_name} onChange={handleChange} placeholder="Enter product name" className={errors.product_name ? "input-error" : ""} />
                            {errors.product_name && (
                                <Form.Text className="text-danger">
                                    <FaTimesCircle /> {errors.product_name}
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formCategory">
                            <Form.Label>Category</Form.Label>
                            <Form.Control type="text" name="category" value={newProduct.category} onChange={handleChange} placeholder="Enter category" className={errors.category ? "input-error" : ""} />
                            {errors.category && (
                                <Form.Text className="text-danger">
                                    <FaTimesCircle /> {errors.category}
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPrice">
                            <Form.Label>Price</Form.Label>
                            <Form.Control type="number" step="0.01" name="price" value={newProduct.price} onChange={handleChange} placeholder="Enter price" className={errors.price ? "input-error" : ""} />
                            {errors.price && (
                                <Form.Text className="text-danger">
                                    <FaTimesCircle /> {errors.price}
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formDiscount">
                            <Form.Label>Discount</Form.Label>
                            <Form.Control type="number" step="0.01" name="discount" value={newProduct.discount} onChange={handleChange} placeholder="Enter discount" className={errors.discount ? "input-error" : ""} />
                            {errors.discount && (
                                <Form.Text className="text-danger">
                                    <FaTimesCircle /> {errors.discount}
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSave} className="btn-custom">
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default App;
