/**
 * ClothZa E-Commerce Core JavaScript
 * Standard Vanilla JS implementation for state management, cart handling, UI toasts, and filters.
 */

// Toast Notification Container Setup
function ensureToastContainer() {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }
    return container;
}

// Global Toast Notification Helper
function showToast(message, type = "success") {
    const container = ensureToastContainer();
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let iconClass = "fas fa-check-circle";
    if (type === "error") iconClass = "fas fa-exclamation-circle";
    if (type === "info") iconClass = "fas fa-info-circle";

    toast.innerHTML = `
        <i class="${iconClass}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add("show");
    }, 10);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 350);
    }, 3000);
}

// Cart Data Helper Functions
function getCart() {
    try {
        return JSON.parse(localStorage.getItem("cart")) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    
    const badges = document.querySelectorAll(".cart-badge");
    badges.forEach(badge => {
        badge.textContent = totalCount;
        badge.style.display = totalCount > 0 ? "flex" : "none";
    });
}

// Add Item to Cart
function addToCart(product) {
    if (!product || !product.name || !product.price) {
        console.error("Invalid product data", product);
        return;
    }

    let cart = getCart();
    const existingIndex = cart.findIndex(
        item => item.name === product.name && (item.size || "M") === (product.size || "M")
    );

    const qtyToAdd = parseInt(product.quantity) || 1;

    if (existingIndex > -1) {
        cart[existingIndex].quantity = (parseInt(cart[existingIndex].quantity) || 1) + qtyToAdd;
    } else {
        cart.push({
            name: product.name,
            price: parseFloat(product.price),
            image: product.image || "s1.jpg",
            size: product.size || "M",
            quantity: qtyToAdd
        });
    }

    saveCart(cart);
    showToast(`Added "${product.name}" to cart!`, "success");
}

// Mobile Navigation Toggle
function initMobileNav() {
    const bar = document.getElementById("bar");
    const close = document.getElementById("close");
    const nav = document.getElementById("navbar");

    if (bar && nav) {
        bar.addEventListener("click", () => {
            nav.classList.add("active");
        });
    }

    if (close && nav) {
        close.addEventListener("click", () => {
            nav.classList.remove("active");
        });
    }
}

// Highlight Current Active Page Nav Link
function setActiveNavLink() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll("#navbar li a");
    
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === path || (path === "" && href === "index.html")) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

// Dynamically Render User Status in Header
function initUserHeader() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");

    // Remove existing user li if any
    const existingUserLi = document.getElementById("user-nav-item");
    if (existingUserLi) existingUserLi.remove();

    const li = document.createElement("li");
    li.id = "user-nav-item";

    if (isLoggedIn && loggedUser.email) {
        const username = loggedUser.email.split("@")[0];
        li.innerHTML = `
            <a href="#" id="logout-link" title="Logout (${username})" style="color: var(--primary); font-weight: 700;">
                <i class="fas fa-user-circle" style="margin-right: 5px;"></i>${username}
            </a>
        `;
        navbar.appendChild(li);

        document.getElementById("logout-link").addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.setItem("isLoggedIn", "false");
            localStorage.removeItem("loggedInUser");
            showToast("Logged out successfully.", "info");
            setTimeout(() => {
                window.location.reload();
            }, 800);
        });
    } else {
        li.innerHTML = `<a href="login.html" style="text-decoration: none;">Login</a>`;
        navbar.appendChild(li);
    }
}

// Shop Page Search & Filter Initialization
function initShopFilter() {
    const searchInput = document.getElementById("shop-search");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const products = document.querySelectorAll("#product1 .pro");

    if (!products.length) return;

    let currentCategory = "all";
    let currentSearch = "";

    function filterProducts() {
        products.forEach(pro => {
            const title = (pro.querySelector("h5")?.textContent || "").toLowerCase();
            const category = (pro.dataset.category || "t-shirts").toLowerCase();

            const matchesSearch = title.includes(currentSearch);
            const matchesCategory = currentCategory === "all" || category === currentCategory;

            if (matchesSearch && matchesCategory) {
                pro.style.display = "block";
            } else {
                pro.style.display = "none";
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            currentSearch = e.target.value.trim().toLowerCase();
            filterProducts();
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = btn.dataset.filter.toLowerCase();
            filterProducts();
        });
    });
}

// Document Ready Initialization
document.addEventListener("DOMContentLoaded", () => {
    initMobileNav();
    setActiveNavLink();
    updateCartBadge();
    initUserHeader();
    initShopFilter();
});
