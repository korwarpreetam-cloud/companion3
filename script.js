/**
 * Global function to handle page navigation across the marketplace
 * This function replaces all instances of window.location.href for consistency.
 * @param {string} page The filename or URL of the page to open.
 */
function openPage(page) {
    window.location.href = page;
}

/**
 * Custom Alert Box function for non-blocking notifications.
 * @param {string} message - The text to display in the alert.
 * @param {string} type - 'success', 'info', or 'error' (determines color).
 */
function alertBox(message, type) {
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
        itemCardsBuySell.forEach(card => {
            card.addEventListener('click', () => {
                const itemName = card.getAttribute('data-name');
                const itemPriceHtml = card.getAttribute('data-price');
                const itemDesc = card.getAttribute('data-desc');
                const itemCondition = card.getAttribute('data-condition');

                // Update the modal content
                modalItemNameBuySell.textContent = itemName;
                modalItemPriceBuySell.innerHTML = itemPriceHtml;
                modalItemDescBuySell.textContent = itemDesc;
                modalItemConditionBuySell.textContent = itemCondition;

                // Show the modal
                modalBuySell.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        closeModalBtnBuySell.addEventListener('click', () => {
            modalBuySell.classList.remove('active');
            document.body.style.overflow = '';
        });

        modalBuySell.addEventListener('click', (e) => {
            if (e.target === modalBuySell) {
                modalBuySell.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // --- Lend/Borrow Marketplace (lend-borrow.html) Logic ---
    const sidebarLendBorrow = document.getElementById('needSidebar');
    const openBtnLendBorrow = document.getElementById('openNeedBtn');
    const itemCardsLendBorrow = document.querySelectorAll('.item-card');
    const modalLendBorrow = document.getElementById('itemDetailModal');
    const closeModalBtnLendBorrow = document.getElementById('closeModalBtn');
    const modalItemNameLendBorrow = document.getElementById('modalItemName');
    const modalItemPriceLendBorrow = document.getElementById('modalItemPrice');

    if (openBtnLendBorrow && sidebarLendBorrow) {
        openBtnLendBorrow.addEventListener('click', () => {
            sidebarLendBorrow.classList.add('open');
            setTimeout(() => {
                openPage('need-request.html');
            }, 400);
        });
    }

    if (modalLendBorrow) {
        itemCardsLendBorrow.forEach(card => {
            card.addEventListener('click', () => {
                const itemName = card.getAttribute('data-name');
                const itemPriceHtml = card.getAttribute('data-price');

                // Update the modal content
                modalItemNameLendBorrow.textContent = itemName;
                modalItemPriceLendBorrow.innerHTML = itemPriceHtml;

                // Show the modal
                modalLendBorrow.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        closeModalBtnLendBorrow.addEventListener('click', () => {
            modalLendBorrow.classList.remove('active');
            document.body.style.overflow = '';
        });

        modalLendBorrow.addEventListener('click', (e) => {
            if (e.target === modalLendBorrow) {
                modalLendBorrow.classList.remove('active');
                document.body.style.overflow = '';
            }
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
});
function openPage(page) {
    window.location.href = page;
}

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. PRELOADER LOGIC ---
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden-loader');
        }, 500);
    });

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
});
function openPage(page) {
    window.location.href = page;
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
    modalItemName.textContent = name;
    modalItemPrice.innerHTML = price;

    // 2. Populate Image Placeholder
    modalImagePlaceholder.innerHTML = `<i class="${iconClass} fa-5x"></i>`;
    modalImagePlaceholder.style.backgroundColor = bgColor;
    modalImagePlaceholder.style.color = color;

    // 3. Display Modal
    modalOverlay.classList.add('active');
}

itemCards.forEach(card => {
    card.addEventListener('click', () => {
        populateAndOpenModal(card);
    });
});

closeModalBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
});

// Close modal when clicking outside
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});

// --- BORROW REQUEST SLIDE OUT LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('needSidebar');
    const openBtn = document.getElementById('openNeedBtn');

    openBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        setTimeout(() => {
            window.location.href = 'need-request.html';
        }, 400); // 400ms delay matches CSS transition duration
    });

    // --- 2. BACKGROUND ANIMATION POSITIONING ---
    const backgroundShapes = document.querySelectorAll('.background-anim li');
    backgroundShapes.forEach(shape => {
        // Apply rotation animation to all list items for a dynamic look
        shape.style.animationName = 'animate-bg';
    });
});
function openPage(page) {
    window.location.href = page;
}

function toggleForm(show) {
    const container = document.getElementById('needFormContainer');
    if (show) {
        container.classList.add('active');
    } else {
        container.classList.remove('active');
    }
}

function openPage(page) {
    window.location.href = page;
}

function toggleFormSell(show) {
    const container = document.getElementById('sellFormContainer');
    const content = container.querySelector('.form-content');
    if (show) {
        container.style.display = 'flex';
        // Trigger transition after display is set
        setTimeout(() => {
            container.classList.add('active');
            content.classList.add('active');
        }, 10);
    } else {
        container.classList.remove('active');
        content.classList.remove('active');
        // Hide container after transition ends
        setTimeout(() => {
            container.style.display = 'none';
        }, 300);
    }
}

// --- HOVER EFFECT LOGIC (Simulates data transfer on hover for dynamic effects) ---
document.addEventListener('DOMContentLoaded', () => {
    const itemCards = document.querySelectorAll('.item-card');

    itemCards.forEach(card => {
        // Initial check to apply smooth entrance animation
        card.style.transform = 'translateY(0)';
        card.style.opacity = 1;
    });

    // --- BACKGROUND ANIMATION POSITIONING ---
    const backgroundShapes = document.querySelectorAll('.background-anim li');
    backgroundShapes.forEach(shape => {
        shape.style.animationName = 'animate-bg';
    });
});
