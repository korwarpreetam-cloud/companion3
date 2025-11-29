
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupModals();
    setupAddItem();
    setupSidebar();
});

function setupNavigation() {
    // Inject Login Button if not present
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && !document.querySelector('.login-btn')) {
        const loginBtn = document.createElement('a');
        loginBtn.href = '#';
        loginBtn.className = 'login-btn';
        loginBtn.textContent = 'Login';
        loginBtn.onclick = (e) => {
            e.preventDefault();
            alert('Login functionality coming soon!');
        };
        navLinks.appendChild(loginBtn);
    }
}

function setupModals() {
    const modal = document.getElementById('itemDetailModal');
    const closeBtn = document.getElementById('closeModalBtn');

    if (closeBtn && modal) {
        closeBtn.onclick = () => modal.classList.remove('active');
        window.onclick = (e) => {
            if (e.target === modal) modal.classList.remove('active');
        };
    }

    // Delegate click for item cards
    document.body.addEventListener('click', (e) => {
        const card = e.target.closest('.item-card');
        if (card) {
            const name = card.dataset.name;
            const price = card.dataset.price;
            openItemModal(name, price);
        }
    });
}

function openItemModal(name, price) {
    const modal = document.getElementById('itemDetailModal');
    if (!modal) return;

    const nameEl = document.getElementById('modalItemName');
    const priceEl = document.getElementById('modalItemPrice');

    if (nameEl) nameEl.textContent = name;
    if (priceEl) priceEl.innerHTML = price;

    modal.classList.add('active');
}

function setupAddItem() {
    const addItemBtn = document.getElementById('addItemBtn');
    const addItemModal = document.getElementById('addItemModal');
    const closeAddItemBtn = document.getElementById('closeAddItemBtn');
    const addItemForm = document.getElementById('addItemForm');

    if (addItemBtn && addItemModal) {
        addItemBtn.onclick = () => addItemModal.classList.add('active');

        if (closeAddItemBtn) {
            closeAddItemBtn.onclick = () => addItemModal.classList.remove('active');
        }

        window.addEventListener('click', (e) => {
            if (e.target === addItemModal) addItemModal.classList.remove('active');
        });

        if (addItemForm) {
            addItemForm.onsubmit = (e) => {
                e.preventDefault();
                const name = document.getElementById('newItemName').value;
                const price = document.getElementById('newItemPrice').value;

                addNewItemCard(name, price);

                addItemModal.classList.remove('active');
                addItemForm.reset();
                alert('Item listed successfully!');
            };
        }
    }
}

function addNewItemCard(name, price) {
    const grid = document.querySelector('.item-grid');
    if (!grid) return;

    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.name = name;
    card.dataset.price = `$${price}`;

    // Determine icon based on page theme (simple heuristic)
    const isBuyPage = document.body.classList.contains('theme-buy');
    const iconClass = isBuyPage ? 'fa-tag' : 'fa-box';

    card.innerHTML = `
        <div class="item-image-placeholder">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="item-details">
            <h3>${name}</h3>
            <p>New Item</p>
            <div class="item-price">$${price}</div>
        </div>
    `;

    // Insert at beginning
    grid.insertBefore(card, grid.firstChild);
}

function setupSidebar() {
    const sidebar = document.getElementById('needSidebar');
    const openBtn = document.getElementById('openNeedBtn');

    if (sidebar && openBtn) {
        openBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            setTimeout(() => {
                // In a real app, this would navigate. 
                // For this demo, we'll just show an alert and close it to simulate the transition.
                alert('Navigating to Borrow Request Form...');
                sidebar.classList.remove('open');
            }, 800);
        });
    }
}

// Global navigation helper
window.openPage = function (page) {
    window.location.href = page;
};