import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    clear: vi.fn(() => { store = {}; }),
    removeItem: vi.fn(key => { delete store[key]; }),
  };
})();

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(() => mockSupabase),
  data: [],
  error: null,
};

vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('supabase', mockSupabase);

// Helper to create a DOM for testing
function createDOM() {
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="app">
          <input id="search-input" />
          <div id="product-grid"></div>
          <div id="cart-items"></div>
          <span id="cart-count-badge">0</span>
          <span id="subtotal">$0.00</span>
          <span id="total">$0.00</span>
          <input id="discount-code" />
          <button id="apply-discount"></button>
          <div id="discount-message"></div>
        </div>
      </body>
    </html>
  `);
  global.document = dom.window.document;
  global.window = dom.window;
}

describe('Gradient Cart Frontend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createDOM();
  });

  describe('Cart Functionality', () => {
    it('should add item to cart and update localStorage', () => {
      // Simulate adding a product
      const cart = JSON.parse(localStorage.getItem('gradient_cart_cart') || '[]');
      const newItem = { id: '1', name: 'Test Product', price: 99.99, quantity: 1 };
      cart.push(newItem);
      localStorage.setItem('gradient_cart_cart', JSON.stringify(cart));

      expect(localStorage.setItem).toHaveBeenCalledWith('gradient_cart_cart', JSON.stringify(cart));
      expect(cart).toHaveLength(1);
      expect(cart[0].name).toBe('Test Product');
    });

    it('should remove item from cart', () => {
      const cart = [{ id: '1', name: 'Test', price: 10, quantity: 1 }];
      localStorage.setItem('gradient_cart_cart', JSON.stringify(cart));

      const updatedCart = cart.filter(item => item.id !== '1');
      localStorage.setItem('gradient_cart_cart', JSON.stringify(updatedCart));

      expect(localStorage.setItem).toHaveBeenCalledWith('gradient_cart_cart', JSON.stringify([]));
      expect(updatedCart).toHaveLength(0);
    });

    it('should update item quantity in cart', () => {
      const cart = [{ id: '1', name: 'Test', price: 10, quantity: 1 }];
      cart[0].quantity = 3;
      localStorage.setItem('gradient_cart_cart', JSON.stringify(cart));

      expect(cart[0].quantity).toBe(3);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should calculate cart subtotal correctly', () => {
      const cart = [
        { id: '1', name: 'A', price: 20, quantity: 2 },
        { id: '2', name: 'B', price: 5, quantity: 4 },
      ];
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      expect(subtotal).toBe(60); // (20*2) + (5*4) = 40 + 20 = 60
    });
  });

  describe('Discount Code Validation', () => {
    it('should apply discount percentage to total', () => {
      const subtotal = 100;
      const discountPercent = 20;
      const discountAmount = subtotal * (discountPercent / 100);
      const total = subtotal - discountAmount;
      expect(total).toBe(80);
    });

    it('should store discount in localStorage', () => {
      const discount = { code: 'SAVE20', discount_percent: 20 };
      localStorage.setItem('gradient_cart_discount', JSON.stringify(discount));
      expect(localStorage.setItem).toHaveBeenCalledWith('gradient_cart_discount', JSON.stringify(discount));
    });
  });

  describe('Filter Logic', () => {
    const sampleProducts = [
      { id: '1', name: 'Wireless Headphones', category: 'Electronics', price: 199.99 },
      { id: '2', name: 'Organic Coffee', category: 'Food', price: 24.99 },
      { id: '3', name: 'Yoga Mat', category: 'Fitness', price: 34.50 },
    ];

    it('should filter by category', () => {
      const selectedCategories = new Set(['Electronics']);
      const filtered = sampleProducts.filter(p => selectedCategories.has(p.category));
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Wireless Headphones');
    });

    it('should filter by price range', () => {
      const maxPrice = 30;
      const filtered = sampleProducts.filter(p => p.price <= maxPrice);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Organic Coffee');
    });

    it('should filter by search term', () => {
      const search = 'Coffee';
      const filtered = sampleProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Organic Coffee');
    });

    it('should combine all filters', () => {
      const filters = {
        search: 'Wireless',
        selectedCategories: new Set(['Electronics']),
        maxPrice: 250,
      };
      const filtered = sampleProducts.filter(p =>
        p.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        filters.selectedCategories.has(p.category) &&
        p.price <= filters.maxPrice
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Wireless Headphones');
    });
  });

  describe('UI Updates', () => {
    it('should update cart badge count', () => {
      const cart = [{ id: '1', quantity: 2 }, { id: '2', quantity: 1 }];
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      document.getElementById('cart-count-badge').textContent = totalItems.toString();
      expect(document.getElementById('cart-count-badge').textContent).toBe('3');
    });

    it('should update subtotal and total displays', () => {
      const subtotal = 150.75;
      const discount = 15.08;
      const total = subtotal - discount;
      document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
      document.getElementById('total').textContent = `$${total.toFixed(2)}`;
      expect(document.getElementById('subtotal').textContent).toBe('$150.75');
      expect(document.getElementById('total').textContent).toBe('$135.67');
    });
  });
});