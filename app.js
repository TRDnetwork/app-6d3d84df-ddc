import { setupRealtime, teardownRealtime } from './realtime.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Global state
let supabase = null;
let currentUser = null;
let products = [];
let categories = [];
let cart = [];
let currentDiscount = null;
let activeFilters = {
    search: '',
    selectedCategories: new Set(),
    maxPrice: 250
};
let debounceTimer = null;

// DOM Elements
const elements = {
    // Credentials
    credentialError: null,
    // Auth
    authGate: null,
    authEmail: null,
    authPassword: null,
    signUpBtn: null,
    signInBtn: null,
    authError: null,
    // Main app
    mainApp: null,
    signOutBtn: null,
    // Sidebar & filters
    sidebarToggle: null,
    sidebar: null,
    closeSidebar: null,
    categoryFilters: null,
    priceSlider: null,
    priceMax: null,
    clearFiltersBtn: null,
    searchInput: null,
    // Product grid
    productGrid: null,
    productCount: null,
    // Cart
    viewCartBtn: null,
    cartCountBadge: null,
    cartView: null,
    closeCartBtn: null,
    cartItems: null,
    discountCode: null,
    applyDiscountBtn: null,
    discountMessage: null,
    subtotal: null,
    discountAmount: null,
    total: null,
    checkoutBtn: null,
    // Checkout
    checkoutView: null,
    backToCartBtn: null,
    checkoutForm: null,
    checkoutEmail: null,
    checkoutItems: null,
    checkoutSubtotal: null,
    checkoutDiscount: null,
    checkoutTotal: null,
    // Confirmation
    confirmationView: null,
    confirmationMessage: null,
    orderId: null,
    continueShoppingBtn: null,
    // Footer
    footerTotal: null,
    footerCartCount: null,
    footerCartToggle: null
};

// Initialize app
async function init() {
    try {
        // Check credentials
        if (!window.__SUPABASE_URL__ || !window.__SUPABASE_ANON_KEY__) {
            showCredentialError();
            return;
        }

        // Initialize Supabase
        supabase = createClient(window.__SUPABASE_URL__, window.__SUPABASE_ANON_KEY__);

        // Get DOM elements
        cacheElements();

        // Load cart from localStorage
        loadCart();

        // Check auth session
        await checkAuth();

        // Load initial data
        await loadProducts();
        await loadCategories();

        // Setup event listeners
        setupEventListeners();

        // Render initial UI
        renderUI();

    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize app. Please refresh.');
    } finally {
        // Always show app (hide loading)
        document.body.classList.add('app-loaded');
    }
}

function cacheElements() {
    elements.credentialError = document.getElementById('credential-error');
    elements.authGate = document.getElementById('auth-gate');
    elements.authEmail = document.getElementById('auth-email');
    elements.authPassword = document.getElementById('auth-password');
    elements.signUpBtn = document.getElementById('sign-up-btn');
    elements.signInBtn = document.getElementById('sign-in-btn');
    elements.authError = document.getElementById('auth-error');
    elements.mainApp = document.getElementById('main-app');
    elements.signOutBtn = document.getElementById('sign-out-btn');
    elements.sidebarToggle = document.getElementById('sidebar-toggle');
    elements.sidebar = document.getElementById('sidebar');
    elements.closeSidebar =