import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts, deleteProduct, updateProduct, createProduct } from "./features/products/productsSlice";
import { Container, Row, Col, Card, Button, Spinner, Modal, Form } from "react-bootstrap";
import Swal from "sweetalert2";

function App() {
    const dispatch = useDispatch();
    const productsResponse = useSelector((state) => state.products.products);
    const productStatus = useSelector((state) => state.products.status);

    const [show, setShow] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        product_name: "",
        category: "",
        price: "",
        discount: "",
    });

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

    const handleSave = async () => {
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

        try {
            let resultAction;
            if (editingProduct) {
                resultAction = await dispatch(updateProduct({ ...newProduct, id: editingProduct.id }));
            } else {
                resultAction = await dispatch(createProduct(newProduct));
            }

            if (resultAction.meta.requestStatus === "fulfilled") {
                Swal.fire("Success", editingProduct ? "Product updated successfully." : "Product added successfully.", "success");
            } else {
                const errorMessage = resultAction.error.message || "An error occurred while processing the request.";
                Swal.fire("Error", errorMessage, "error");
                console.log(errorMessage);
            }
        } catch (error) {
            Swal.fire("Error", "An unexpected error occurred.", "error");
        } finally {
            handleClose();
        }
    };

    // Ensure products is always an array
    const products = Array.isArray(productsResponse) ? productsResponse : [];

    return (
        <Container className="mt-4">
            <h1 className="mb-4 text-center">Product List</h1>
            {productStatus === "loading" ? (
                <div className="d-flex justify-content-center mt-5">
                    <Spinner animation="border" />
                </div>
            ) : (
                <>
                    <Button className="mb-4 btn-custom" variant="primary" onClick={handleShow}>
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
                                            className="me-2"
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
                                        <Button variant="danger" onClick={() => handleDelete(product.id)}>
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
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingProduct ? "Edit Product" : "Add Product"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formProductName">
                            <Form.Label>Product Name</Form.Label>
                            <Form.Control type="text" name="product_name" value={newProduct.product_name} onChange={handleChange} placeholder="Enter product name" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formCategory">
                            <Form.Label>Category</Form.Label>
                            <Form.Control type="text" name="category" value={newProduct.category} onChange={handleChange} placeholder="Enter category" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPrice">
                            <Form.Label>Price</Form.Label>
                            <Form.Control type="number" step="0.01" name="price" value={newProduct.price} onChange={handleChange} placeholder="Enter price" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formDiscount">
                            <Form.Label>Discount</Form.Label>
                            <Form.Control type="number" step="0.01" name="discount" value={newProduct.discount} onChange={handleChange} placeholder="Enter discount" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default App;
