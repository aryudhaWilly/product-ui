import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "./apiClient";

export const fetchProducts = createAsyncThunk("products/fetchProducts", async () => {
    const response = await apiClient.get("/products");
    return response.data.data;
});

// Create a new product
export const createProduct = createAsyncThunk("products/createProduct", async (newProduct) => {
    const response = await apiClient.post("/products", newProduct);
    return response.data;
});

// Update an existing product
export const updateProduct = createAsyncThunk("products/updateProduct", async (product) => {
    const response = await apiClient.put(`/products/${product.id}`, product);
    return response.data;
});

// Delete a product
export const deleteProduct = createAsyncThunk("products/deleteProduct", async (id) => {
    await apiClient.delete(`/products/${id}`);
    return id;
});

const productsSlice = createSlice({
    name: "products",
    initialState: {
        products: [],
        status: "idle",
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.products = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.products.push(action.payload);
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.products.findIndex((product) => product.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter((product) => product.id !== action.payload);
            });
    },
});

export default productsSlice.reducer;
