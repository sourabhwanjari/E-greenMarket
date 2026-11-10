import { createSlice } from '@reduxjs/toolkit';

const calculateAmount = (pricePerKg, weightInGrams) => {
  const pricePaise = Math.round(Number(pricePerKg) * 100);
  const amountPaise = Math.round((pricePaise * Number(weightInGrams)) / 1000);
  return parseFloat((amountPaise / 100).toFixed(2));
};

const calculatorSlice = createSlice({
  name: 'calculator',
  initialState: {
    items: [],
    discountPercent: 0,
    editingIndex: null
  },
  reducers: {
    addCalculatorItem: (state, action) => {
      const { product, kg = 0, g = 0 } = action.payload;
      const weightInGrams = Math.round(Number(kg) * 1000) + Math.round(Number(g));
      if (weightInGrams <= 0) return;

      const ratePerKg = Number(product.pricePerKg);
      const amount = calculateAmount(ratePerKg, weightInGrams);

      state.items.push({
        id: `${product._id || product.id}_${Date.now()}`,
        productId: product._id || product.id,
        name: product.name,
        ratePerKg,
        kg: Number(kg) || 0,
        g: Number(g) || 0,
        weightInGrams,
        amount
      });
    },
    updateCalculatorItem: (state, action) => {
      const { index, kg, g } = action.payload;
      if (state.items[index]) {
        const item = state.items[index];
        const weightInGrams = Math.round(Number(kg) * 1000) + Math.round(Number(g));
        if (weightInGrams <= 0) return;

        item.kg = Number(kg) || 0;
        item.g = Number(g) || 0;
        item.weightInGrams = weightInGrams;
        item.amount = calculateAmount(item.ratePerKg, weightInGrams);
      }
    },
    removeCalculatorItem: (state, action) => {
      const index = action.payload;
      state.items.splice(index, 1);
    },
    setDiscountPercent: (state, action) => {
      state.discountPercent = Math.max(0, Math.min(100, Number(action.payload) || 0));
    },
    resetCalculator: (state) => {
      state.items = [];
      state.discountPercent = 0;
      state.editingIndex = null;
    }
  }
});

export const {
  addCalculatorItem,
  updateCalculatorItem,
  removeCalculatorItem,
  setDiscountPercent,
  resetCalculator
} = calculatorSlice.actions;

export default calculatorSlice.reducer;
