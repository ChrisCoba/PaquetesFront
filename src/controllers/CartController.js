import { CartService } from '../services/CartService.js';

export const CartController = {
    init: () => {
        const cartContainer = document.getElementById('cart-items-container');
        if (cartContainer) {
            CartController.renderCart();
        }
    },

    renderCart: () => {
        const container = document.getElementById('cart-items-container');
        const cart = CartService.getCart();

        if (!container) return;

        container.innerHTML = '';

        if (cart.length === 0) {
            container.innerHTML = '<div class="text-center py-5"><p>Your cart is empty.</p><a href="tours.html" class="btn btn-primary">Browse Tours</a></div>';
            CartController.updateSummary();
            return;
        }

        cart.forEach((item, index) => {
            const itemTotal = (item.price * item.adults) + (item.price * 0.5 * item.children);

            const html = `
                <div class="cart-item d-flex align-items-center justify-content-between mb-3 p-3 border rounded">
                    <div class="item-details d-flex align-items-center" style="flex: 2;">
                        <img src="${item.image || '../assets/img/travel/tour-1.webp'}" alt="${item.name}" class="item-image rounded" style="width: 80px; height: 60px; object-fit: cover; margin-right: 15px;">
                        <div>
                            <h5 class="mb-0">${item.name}</h5>
                            <small class="text-muted">${item.duration} Days</small>
                            <div class="small">
                                <span>Adults: ${item.adults}</span> | 
                                <span>Children: ${item.children}</span>
                            </div>
                        </div>
                    </div>
                    <div class="item-price fw-bold" style="flex: 1; text-align: right;">$${itemTotal.toFixed(2)}</div>
                    <div style="flex: 0 0 50px; text-align: right;">
                        <button class="btn btn-danger btn-sm" onclick="CartController.removeItem(${index})"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });

        CartController.updateSummary();
    },

    removeItem: (index) => {
        if (confirm('Are you sure you want to remove this item?')) {
            CartService.removeFromCart(index);
            CartController.renderCart();
        }
    },

    updateSummary: () => {
        const totals = CartService.calculateTotal();

        const subtotalEl = document.getElementById('cart-subtotal');
        const taxesEl = document.getElementById('cart-taxes');
        const totalEl = document.getElementById('cart-total');

        if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal}`;
        if (taxesEl) taxesEl.textContent = `$${totals.taxes}`;
        if (totalEl) totalEl.textContent = `$${totals.total}`;
    }
};

// Expose to window for inline handlers
window.CartController = CartController;

document.addEventListener('DOMContentLoaded', () => {
    CartController.init();
});
