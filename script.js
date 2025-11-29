import { auth, onAuthStateChanged, signOut, db, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from './firebase-config.js';

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

// Global toggle functions for forms (needed for onclick attributes in HTML)
window.toggleForm = function (show) {
    const container = document.getElementById('needFormContainer');
    if (!container) return;

    if (show) {
        container.style.display = 'flex';
        setTimeout(() => {
            container.classList.add('active');
        }, 10);
    } else {
        container.classList.remove('active');
        setTimeout(() => {
            container.style.display = 'none';
        }, 300);
    }
}

window.toggleFormSell = function (show) {
    const container = document.getElementById('sellFormContainer');
    if (!container) return;

    const content = container.querySelector('.form-content');
    if (show) {
        container.style.display = 'flex';
        setTimeout(() => {
            container.classList.add('active');
            if (content) content.classList.add('active');
        }, 10);
    } else {
        container.classList.remove('active');
        if (content) content.classList.remove('active');
        setTimeout(() => {
            container.style.display = 'none';
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- AUTHENTICATION & ACCESS CONTROL ---
    const protectedPages = ['lend-borrow.html', 'sell.item.html', 'buy-sell.html', 'need-request.html'];
    const currentPage = window.location.pathname.split('/').pop();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is signed in:", user.displayName || user.email);
            updateNavbar(user);
        } else {
            console.log("User is signed out");
            updateNavbar(null);

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

            document.getElementById('logoutBtn').addEventListener('click', () => {
                signOut(auth).then(() => {
                    alertBox("Logged out successfully", "info");
                    window.location.href = 'login.html';
                }).catch((error) => {
                    console.error("Logout error:", error);
                });
            });

        } else {
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

    // --- FIRESTORE LOGIC ---

    if (currentPage === 'sell.item.html') {
        fetchItems('items_for_sale', 'sellingItemsGrid');
    } else if (currentPage === 'lend-borrow.html') {
        fetchItems('items_for_lending', 'lendingItemsGrid');
    } else if (currentPage === 'need-request.html') {
        fetchRequests();
    }

    async function fetchItems(collectionName, gridId) {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        grid.innerHTML = '<p style="text-align:center; width:100%;">Loading items...</p>';

        try {
            const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            grid.innerHTML = '';

            if (querySnapshot.empty) {
                grid.innerHTML = '<p style="text-align:center; width:100%;">No items listed yet.</p>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const item = doc.data();
                const card = createItemCard(item);
                grid.appendChild(card);
            });

            attachModalListeners();

        } catch (error) {
            console.error("Error fetching items:", error);
            grid.innerHTML = '<p style="text-align:center; width:100%; color:red;">Error loading items.</p>';
        }
    }

    async function fetchRequests() {
        const grid = document.getElementById('requestGrid');
        if (!grid) return;

        grid.innerHTML = '<p style="text-align:center; width:100%;">Loading requests...</p>';

        try {
            const q = query(collection(db, 'borrow_requests'), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            grid.innerHTML = '';

            if (querySnapshot.empty) {
                grid.innerHTML = '<p style="text-align:center; width:100%;">No requests yet.</p>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const req = doc.data();
                const card = createRequestCard(req);
                grid.appendChild(card);
            });

        } catch (error) {
            console.error("Error fetching requests:", error);
            grid.innerHTML = '<p style="text-align:center; width:100%; color:red;">Error loading requests.</p>';
        }
    }

    function createItemCard(item) {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.setAttribute('data-name', item.name);
        div.setAttribute('data-price', `$${item.price} <span>/ ${item.period || 'day'}</span>`);
        div.setAttribute('data-icon-class', getIconClass(item.category));
        div.setAttribute('data-bg-color', getBgColor(item.category));
        div.setAttribute('data-color', getColor(item.category));
        div.setAttribute('data-desc', item.description);
        div.setAttribute('data-condition', item.condition);
        div.setAttribute('data-seller', item.userName);

        div.innerHTML = `
            <div class="item-image-placeholder" style="background-color: ${getBgColor(item.category)}; color: ${getColor(item.category)};">
                <i class="${getIconClass(item.category)}"></i>
            </div>
            <div class="item-details">
                <h3>${item.name}</h3>
                <p>${item.description ? item.description.substring(0, 30) + '...' : 'No description'}</p>
                <div class="item-price">
                    $${item.price} <span>by ${item.userName}</span>
                </div>
            </div>
        `;
        return div;
    }

    function createRequestCard(req) {
        const div = document.createElement('div');
        div.className = 'request-card';
        div.innerHTML = `
            <h3><i class="fas fa-hand-holding"></i> ${req.itemName} Needed</h3>
            <p>${req.description}</p>
            <div class="borrower-info">
                <span>${req.userName}</span>
                <span>For ${req.duration} days | Max: $${req.maxPrice}/day</span>
            </div>
        `;
        return div;
    }

    function getIconClass(category) {
        const map = {
            'electronics': 'fas fa-laptop',
            'books': 'fas fa-book',
            'stationery': 'fas fa-pencil-alt',
            'other': 'fas fa-box',
            'furniture': 'fas fa-chair',
            'vehicle': 'fas fa-bicycle'
        };
        return map[category] || 'fas fa-box';
    }

    function getBgColor(category) {
        const map = {
            'electronics': '#e3f2fd',
            'books': '#e8f5e9',
            'stationery': '#fffde7',
            'other': '#f3e5f5'
        };
        return map[category] || '#f5f5f5';
    }

    function getColor(category) {
        const map = {
            'electronics': '#1976d2',
            'books': '#388e3c',
            'stationery': '#fbc02d',
            'other': '#7b1fa2'
        };
        return map[category] || '#616161';
    }

    // --- MODAL LOGIC ---
    const modalOverlay = document.getElementById('itemDetailModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalItemName = document.getElementById('modalItemName');
    const modalItemPrice = document.getElementById('modalItemPrice');
    const modalImagePlaceholder = document.getElementById('modalImagePlaceholder');
    // Add selectors for description and seller info if they exist in HTML
    const modalItemDesc = document.querySelector('.modal-full-description');
    const modalSellerName = document.querySelector('.lender-name');

    function populateAndOpenModal(card) {
        const name = card.getAttribute('data-name');
        const price = card.getAttribute('data-price');
        const iconClass = card.getAttribute('data-icon-class');
        const bgColor = card.getAttribute('data-bg-color');
        const color = card.getAttribute('data-color');
        const desc = card.getAttribute('data-desc');
        const seller = card.getAttribute('data-seller');

        if (modalItemName) modalItemName.textContent = name;
        if (modalItemPrice) modalItemPrice.innerHTML = price;
        if (modalItemDesc && desc) modalItemDesc.textContent = desc;
        if (modalSellerName && seller) modalSellerName.textContent = seller;

        if (modalImagePlaceholder) {
            modalImagePlaceholder.innerHTML = `<i class="${iconClass} fa-5x"></i>`;
            modalImagePlaceholder.style.backgroundColor = bgColor;
            modalImagePlaceholder.style.color = color;
        }

        if (modalOverlay) modalOverlay.classList.add('active');
    }

    function attachModalListeners() {
        const itemCards = document.querySelectorAll('.item-card');
        itemCards.forEach(card => {
            card.addEventListener('click', () => {
                populateAndOpenModal(card);
            });
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (modalOverlay) modalOverlay.classList.remove('active');
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }

    // --- FORM SUBMISSION LOGIC ---

    // Borrow Request Form
    const needForm = document.querySelector('.need-form');
    if (needForm) {
        needForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            if (!user) {
                alert("You must be logged in to post.");
                return;
            }

            const itemName = document.getElementById('item-name').value;
            const duration = document.getElementById('duration').value;
            const maxPrice = document.getElementById('max-price').value;
            const description = document.getElementById('description').value;

            try {
                await addDoc(collection(db, "borrow_requests"), {
                    itemName,
                    duration,
                    maxPrice,
                    description,
                    userId: user.uid,
                    userName: user.displayName || "Anonymous",
                    createdAt: serverTimestamp()
                });

                alertBox('Borrow Request Submitted!', 'success');
                needForm.reset();
                window.toggleForm(false);
                fetchRequests();

            } catch (error) {
                console.error("Error adding document: ", error);
                alertBox("Error submitting request.", "error");
            }
        });
    }

    // Sell/Lend Form
    const sellForm = document.querySelector('.sell-form');
    if (sellForm) {
        sellForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            if (!user) {
                alert("You must be logged in to post.");
                return;
            }

            const name = document.getElementById('item-name').value;
            const category = document.getElementById('category').value;
            const price = document.getElementById('price').value;
            const condition = document.getElementById('condition').value;
            const description = document.getElementById('description').value;

            let targetCollection = 'items_for_sale';
            if (currentPage === 'lend-borrow.html') {
                targetCollection = 'items_for_lending';
            }

            try {
                await addDoc(collection(db, targetCollection), {
                    name,
                    category,
                    price,
                    condition,
                    description,
                    userId: user.uid,
                    userName: user.displayName || "Anonymous",
                    createdAt: serverTimestamp()
                });

                alertBox('Item Listed Successfully!', 'success');
                sellForm.reset();
                window.toggleFormSell(false);

                if (currentPage === 'sell.item.html') fetchItems('items_for_sale', 'sellingItemsGrid');
                if (currentPage === 'lend-borrow.html') fetchItems('items_for_lending', 'lendingItemsGrid');

            } catch (error) {
                console.error("Error adding item: ", error);
                alertBox("Error listing item.", "error");
            }
        });
    }

    // --- UI HELPERS (Preloader, Sidebar, Animation) ---

    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden-loader');
            }, 500);
        });
    }

    const sidebar = document.getElementById('needSidebar');
    const openBtn = document.getElementById('openNeedBtn');
    if (openBtn && sidebar) {
        openBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            setTimeout(() => {
                window.location.href = 'need-request.html';
            }, 400);
        });
    }

    const backgroundShapes = document.querySelectorAll('.background-anim li');
    backgroundShapes.forEach(shape => {
        shape.style.animationName = 'animate-bg';
    });

    const lazyContent = document.querySelector('.lazy-content');
    if (lazyContent) {
        const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.getAttribute('data-lazy-loaded') === 'false') {
                    setTimeout(() => {
                        entry.target.innerHTML = '<h3>✨ Featured Deals Loaded!</h3><p>New textbooks and tools available.</p>';
                        entry.target.style.opacity = 1;
                        entry.target.setAttribute('data-lazy-loaded', 'true');
                    }, 500);
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px', threshold: 0.1 });
        lazyLoadObserver.observe(lazyContent);
    }
});
