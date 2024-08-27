import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    products: [],
    status: "idle",
    error: null,
};

// Thunks
export const fetchProducts = createAsyncThunk("products/fetchProducts", async () => {
    const response = await axios.get("http://localhost:8000/api/products");
    return response.data;
});

export const createProduct = createAsyncThunk("products/createProduct", async (newProduct) => {
    const response = await axios.post("http://localhost:8000/api/products", newProduct);
    return response.data;
});

export const updateProduct = createAsyncThunk("products/updateProduct", async (updatedProduct) => {
    const response = await axios.put(`http://localhost:8000/api/products/${updatedProduct.id}`, updatedProduct);
    return response.data;
});

export const deleteProduct = createAsyncThunk("products/deleteProduct", async (id) => {
    await axios.delete(`http://localhost:8000/api/products/${id}`);
    return id;
});

const productsSlice = createSlice({
    name: "products",
    initialState,
    reducers: {},
    extraReducers(builder) {
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
