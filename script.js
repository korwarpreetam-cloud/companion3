import { auth, onAuthStateChanged, signOut } from './firebase-config.js';

/**
 * Global function to handle page navigation across the marketplace
 * This function replaces all instances of window.location.href for consistency.
 * @param {string} page The filename or URL of the page to open.
 */
window.openPage = function (page) {
    window.location.href = page;
}

/**
 * Custom Alert Box function for non-blocking notifications.
 * @param {string} message - The text to display in the alert.
 * @param {string} type - 'success', 'info', or 'error' (determines color).
 */
window.alertBox = function (message, type) {
    const existingAlert = document.getElementById('customAlert');
    if (existingAlert) existingAlert.remove();

    const alertDiv = document.createElement('div');
    alertDiv.id = 'customAlert';
    alertDiv.textContent = message;

    // Set styles based on type
    let bgColor = '';
    if (type === 'success') bgColor = '#4CAF50';
    else if (type === 'info') bgColor = '#2196F3';
    else bgColor = '#f44336';

    // Check if body is ready to append.
    if (!document.body) {
        console.error("Document body not available for alertBox.");
        return;
    }

    alertDiv.style.cssText = `
        position: fixed;
        top: 130px; /* Below the two navbars on detailed pages */
        right: 20px;
        padding: 15px 30px;
        border-radius: 8px;
        background-color: ${bgColor};
        color: white;
        font-weight: 600;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        z-index: 2000;
        transition: opacity 0.5s ease-in-out;
        opacity: 1;
    `;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    // --- AUTHENTICATION & ACCESS CONTROL ---
    const protectedPages = ['lend-borrow.html', 'sell.item.html', 'buy-sell.html', 'need-request.html'];
    const currentPage = window.location.pathname.split('/').pop();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            console.log("User is signed in:", user.displayName || user.email);
            updateNavbar(user);
        } else {
            // User is signed out
            console.log("User is signed out");
            updateNavbar(null);

            // Check access control
            if (protectedPages.includes(currentPage)) {
                alert("Please login to access this page.");
                window.location.href = 'login.html';
            }
        }
    });

    function updateNavbar(user) {
        const navRight = document.querySelector('.nav-right');
        if (!navRight) return;

        if (user) {
            // Show User Profile and Logout
            const userName = user.displayName || "User";
            navRight.innerHTML = `
                <nav class="nav-links">
                    <a href="#"><i class="fas fa-chart-line"></i> Dashboard</a>
                    <a href="#"><i class="fas fa-user-circle"></i> ${userName}</a>
                    <a href="#"><i class="fas fa-headset"></i> Support</a>
                </nav>
                <button class="signup-btn" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            `;

            // Re-attach event listener for logout
            document.getElementById('logoutBtn').addEventListener('click', () => {
                signOut(auth).then(() => {
                    alertBox("Logged out successfully", "info");
                    window.location.href = 'login.html';
                }).catch((error) => {
                    console.error("Logout error:", error);
                });
            });

        } else {
            // Show Login Button
            navRight.innerHTML = `
                <nav class="nav-links">
                    <a href="#"><i class="fas fa-chart-line"></i> Dashboard</a>
                    <a href="#"><i class="fas fa-user-circle"></i> Profile</a>
                    <a href="#"><i class="fas fa-headset"></i> Support</a>
                </nav>
                <button class="signup-btn" onclick="openPage('login.html')">
                    <i class="fas fa-user-plus"></i> Login
                </button>
            `;
        }
    }


    // --- Buy/Sell Marketplace (buy-sell.html) Logic ---
    const sidebarBuySell = document.getElementById('needSidebar');
    const openBtnBuySell = document.getElementById('openNeedBtn');
    const itemCardsBuySell = document.querySelectorAll('.item-card');
    const modalBuySell = document.getElementById('itemDetailModal');
    const closeModalBtnBuySell = document.getElementById('closeModalBtn');
    const modalItemNameBuySell = document.getElementById('modalItemName');
    const modalItemPriceBuySell = document.getElementById('modalItemPrice');
    const modalItemDescBuySell = document.getElementById('modalItemDesc');
    const modalItemConditionBuySell = document.getElementById('modalItemCondition');

    if (openBtnBuySell && sidebarBuySell) {
        openBtnBuySell.addEventListener('click', () => {
            sidebarBuySell.classList.add('open');
            setTimeout(() => {
                openPage('sell.item.html');
            }, 400);
        });
    }

    if (modalBuySell) {
        // Shared modal logic for buy-sell and lend-borrow if IDs match
        // Note: lend-borrow uses populateAndOpenModal below, this block might be redundant or specific to buy-sell if IDs differ
        // Checking IDs in buy-sell.html would confirm. Assuming standard IDs for now.
    }

    // --- Lend/Borrow Marketplace (lend-borrow.html) Logic ---
    const sidebarLendBorrow = document.getElementById('needSidebar');
    const openBtnLendBorrow = document.getElementById('openNeedBtn');
    // ... (rest of the logic is handled by general selectors below)

    if (openBtnLendBorrow && sidebarLendBorrow) {
        openBtnLendBorrow.addEventListener('click', () => {
            sidebarLendBorrow.classList.add('open');
            setTimeout(() => {
                openPage('need-request.html');
            }, 400);
        });
    }

    // --- Post Borrow Request (need-request.html) Logic ---
    const needForm = document.querySelector('.need-form');
    const needFormContainer = document.getElementById('needFormContainer');

    // Function to toggle the borrow form modal
    window.toggleForm = (show) => {
        if (show) {
            needFormContainer.style.display = 'flex';
            setTimeout(() => {
                needFormContainer.classList.add('active');
            }, 10);
        } else {
            needFormContainer.classList.remove('active');
            setTimeout(() => {
                needFormContainer.style.display = 'none';
            }, 300);
        }
    }

    if (needForm) {
        needForm.addEventListener('submit', (e) => {
            e.preventDefault();

            alertBox('Borrow Request Submitted! Lenders will be notified.', 'success');

            needForm.reset();
            window.toggleForm(false);
        });
    }

    // --- Post Sell Item (sell.item.html) Logic ---
    const sellForm = document.querySelector('.sell-form');
    const sellFormContainer = document.getElementById('sellFormContainer');

    // Function to toggle the sell form modal
    window.toggleFormSell = (show) => {
        if (show) {
            sellFormContainer.style.display = 'flex';
            setTimeout(() => {
                sellFormContainer.classList.add('active');
            }, 10);
        } else {
            sellFormContainer.classList.remove('active');
            setTimeout(() => {
                sellFormContainer.style.display = 'none';
            }, 300);
        }
    }

    // Alias the correct toggle function for the button in sell.item.html
    const postSellBtn = document.querySelector('.post-btn[onclick="toggleForm(true)"]');
    if (postSellBtn) {
        postSellBtn.setAttribute('onclick', 'toggleFormSell(true)');
    }
    const closeSellBtn = document.querySelector('.form-content .close-btn[onclick="toggleForm(false)"]');
    if (closeSellBtn) {
        closeSellBtn.setAttribute('onclick', 'toggleFormSell(false)');
    }


    if (sellForm) {
        sellForm.addEventListener('submit', (e) => {
            e.preventDefault();

            alertBox('Item Listing Submitted! Buyers will be able to see it.', 'success');

            sellForm.reset();
            window.toggleFormSell(false);
        });
    }

    // --- 1. PRELOADER LOGIC ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden-loader');
            }, 500);
        });
    }

    // --- 2. LAZY LOADING LOGIC ---
    const lazyContent = document.querySelector('.lazy-content');

    const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.getAttribute('data-lazy-loaded') === 'false') {
                // Simulate loading the content (e.g., fetching images/data)
                setTimeout(() => {
                    entry.target.innerHTML = '<h3>✨ Featured Deals Loaded!</h3><p>New textbooks and tools available.</p>';
                    entry.target.style.opacity = 1;
                    entry.target.setAttribute('data-lazy-loaded', 'true');

                }, 500); // Simulated delay

                observer.unobserve(entry.target); // Stop observing once loaded
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1
    });

    if (lazyContent) {
        lazyLoadObserver.observe(lazyContent);
    }

    // --- ITEM MODAL LOGIC ---
    const itemCards = document.querySelectorAll('.item-card');
    const modalOverlay = document.getElementById('itemDetailModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalItemName = document.getElementById('modalItemName');
    const modalItemPrice = document.getElementById('modalItemPrice');
    const modalImagePlaceholder = document.getElementById('modalImagePlaceholder');

    function populateAndOpenModal(card) {
        const name = card.getAttribute('data-name');
        const price = card.getAttribute('data-price');
        const iconClass = card.getAttribute('data-icon-class');
        const bgColor = card.getAttribute('data-bg-color');
        const color = card.getAttribute('data-color');

        // 1. Populate Text
        if (modalItemName) modalItemName.textContent = name;
        if (modalItemPrice) modalItemPrice.innerHTML = price;

        // 2. Populate Image Placeholder
        if (modalImagePlaceholder) {
            modalImagePlaceholder.innerHTML = `<i class="${iconClass} fa-5x"></i>`;
            modalImagePlaceholder.style.backgroundColor = bgColor;
            modalImagePlaceholder.style.color = color;
        }

        // 3. Display Modal
        if (modalOverlay) modalOverlay.classList.add('active');
    }

    if (itemCards.length > 0 && modalOverlay) {
        itemCards.forEach(card => {
            card.addEventListener('click', () => {
                populateAndOpenModal(card);
            });
        });

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                modalOverlay.classList.remove('active');
            });
        }

        // Close modal when clicking outside
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }

    // --- BORROW REQUEST SLIDE OUT LOGIC ---
    const sidebar = document.getElementById('needSidebar');
    const openBtn = document.getElementById('openNeedBtn');

    if (openBtn && sidebar) {
        openBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            setTimeout(() => {
                window.location.href = 'need-request.html';
            }, 400); // 400ms delay matches CSS transition duration
        });
    }

    // --- 2. BACKGROUND ANIMATION POSITIONING ---
    const backgroundShapes = document.querySelectorAll('.background-anim li');
    backgroundShapes.forEach(shape => {
        // Apply rotation animation to all list items for a dynamic look
        shape.style.animationName = 'animate-bg';
    });
});

