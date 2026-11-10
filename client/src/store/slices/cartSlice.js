import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const storedCart = localStorage.getItem('gg_cart')
  ? JSON.parse(localStorage.getItem('gg_cart'))
  : [];

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cart');
      return response.data.cart;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const syncItemToCart = createAsyncThunk(
  'cart/syncItem',
  async ({ productId, weightInGrams }, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart', { productId, weightInGrams });
      return response.data.cart;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateServerCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, weightInGrams }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/cart/${itemId}`, { weightInGrams });
      return response.data.cart;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update item');
    }
  }
);

export const removeServerCartItem = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/${itemId}`);
      return response.data.cart;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove item');
    }
  }
);

export const clearServerCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/cart');
      return { items: [], subtotal: 0 };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
    }
  }
);

const calculateLocalSubtotal = (items) => {
  return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: storedCart,
    subtotal: calculateLocalSubtotal(storedCart),
    loading: false,
    error: null
  },
  reducers: {
    addLocalItem: (state, action) => {
      const { product, weightInGrams } = action.payload;
      const pricePerKg = product.pricePerKg;
      const amount = parseFloat(((pricePerKg * weightInGrams) / 1000).toFixed(2));

      const existingIndex = state.items.findIndex(
        (i) => (i.product?._id || i.product) === (product._id || product)
      );

      if (existingIndex > -1) {
        state.items[existingIndex].weightInGrams += weightInGrams;
        const newWeight = state.items[existingIndex].weightInGrams;
        state.items[existingIndex].totalPrice = parseFloat(
          ((pricePerKg * newWeight) / 1000).toFixed(2)
        );
      } else {
        state.items.push({
          product,
          name: product.name,
          image: product.image,
          pricePerKg,
          weightInGrams,
          totalPrice: amount
        });
      }

      state.subtotal = calculateLocalSubtotal(state.items);
      localStorage.setItem('gg_cart', JSON.stringify(state.items));
    },
    updateLocalItemWeight: (state, action) => {
      const { productId, weightInGrams } = action.payload;
      const index = state.items.findIndex(
        (i) => (i.product?._id || i.product) === productId
      );

      if (index > -1 && weightInGrams > 0) {
        state.items[index].weightInGrams = weightInGrams;
        const pricePerKg = state.items[index].pricePerKg;
        state.items[index].totalPrice = parseFloat(
          ((pricePerKg * weightInGrams) / 1000).toFixed(2)
        );
        state.subtotal = calculateLocalSubtotal(state.items);
        localStorage.setItem('gg_cart', JSON.stringify(state.items));
      }
    },
    removeLocalItem: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(
        (i) => (i.product?._id || i.product) !== productId
      );
      state.subtotal = calculateLocalSubtotal(state.items);
      localStorage.setItem('gg_cart', JSON.stringify(state.items));
    },
    clearLocalCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      localStorage.removeItem('gg_cart');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload.items || [];
          state.subtotal = action.payload.subtotal || 0;
          localStorage.setItem('gg_cart', JSON.stringify(state.items));
        }
      })
      .addCase(syncItemToCart.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload.items || [];
          state.subtotal = action.payload.subtotal || 0;
          localStorage.setItem('gg_cart', JSON.stringify(state.items));
        }
      })
      .addCase(updateServerCartItem.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload.items || [];
          state.subtotal = action.payload.subtotal || 0;
          localStorage.setItem('gg_cart', JSON.stringify(state.items));
        }
      })
      .addCase(removeServerCartItem.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload.items || [];
          state.subtotal = action.payload.subtotal || 0;
          localStorage.setItem('gg_cart', JSON.stringify(state.items));
        }
      })
      .addCase(clearServerCart.fulfilled, (state) => {
        state.items = [];
        state.subtotal = 0;
        localStorage.removeItem('gg_cart');
      });
  }
});

export const {
  addLocalItem,
  updateLocalItemWeight,
  removeLocalItem,
  clearLocalCart
} = cartSlice.actions;

export default cartSlice.reducer;
