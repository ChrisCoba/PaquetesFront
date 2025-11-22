import { CartService } from '../services/CartService.js';
import { API_BASE_URL } from '../services/config.js';

export const CartController = {
    init: () => {
        const cartContainer = document.getElementById('cart-items-container');
        if (cartContainer) {
            CartController.renderCart();
        }

        const checkoutBtn = document.getElementById('btn-checkout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', CartController.handleCheckout);
        }
    },

    renderCart: () => {
        const container = document.getElementById('cart-items-container');
        const cart = CartService.getCart();

        if (!container) return;

        container.innerHTML = '';

        if (cart.length === 0) {
            container.innerHTML = '<div class="text-center py-5"><p>Tu carrito está vacío.</p><a href="tours.html" class="btn btn-primary">Ver Tours</a></div>';
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
                            <small class="text-muted">${item.duration} Días</small>
                            <div class="small">
                                <span>Adultos: ${item.adults}</span> | 
                                <span>Niños: ${item.children}</span>
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
        if (confirm('¿Estás seguro de eliminar este ítem?')) {
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
    },

    handleCheckout: async () => {
        const userId = document.getElementById('nro-cliente').value;
        const accountNum = document.getElementById('nro-cuenta').value;

        if (!userId || !accountNum) {
            alert('Por favor ingrese el Nro. Cliente y Nro. Cuenta');
            return;
        }

        const cart = CartService.getCart();
        if (cart.length === 0) {
            alert('El carrito está vacío');
            return;
        }

        const btn = document.getElementById('btn-checkout');
        btn.disabled = true;
        btn.textContent = 'Procesando...';

        let successCount = 0;
        let errors = [];

        for (const item of cart) {
            try {
                // 1. Check Availability
                const today = new Date().toISOString();
                const totalPersonas = parseInt(item.adults) + parseInt(item.children);

                const availRes = await fetch(`${API_BASE_URL}/availability`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        IdPaquete: item.tourId,
                        FechaInicio: today,
                        Personas: totalPersonas
                    })
                });

                if (!availRes.ok) {
                    const errText = await availRes.text();
                    throw new Error(`No hay disponibilidad: ${errText}`);
                }

                // 2. Create Hold
                const holdRes = await fetch(`${API_BASE_URL}/hold`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        IdPaquete: item.tourId,
                        BookingUserId: userId,
                        FechaInicio: today,
                        Personas: totalPersonas
                    })
                });

                if (!holdRes.ok) throw new Error('Error al crear reserva temporal');
                const holdData = await holdRes.json();

                // 3. Book (Create Reservation & Invoice)
                const bookRes = await fetch(`${API_BASE_URL}/book`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        IdPaquete: item.tourId,
                        HoldId: holdData.HoldId,
                        BookingUserId: userId,
                        MetodoPago: "CreditCard", // Placeholder
                        Turistas: [{
                            Nombre: "Cliente",
                            Apellido: userId,
                            Identificacion: userId,
                            TipoIdentificacion: "DNI"
                        }]
                    })
                });

                if (!bookRes.ok) throw new Error('Error al confirmar reserva');
                const bookData = await bookRes.json();

                successCount++;

            } catch (error) {
                console.error(error);
                errors.push(`Tour ${item.name}: ${error.message}`);
            }
        }

        btn.disabled = false;
        btn.textContent = 'Proceder al Pago';

        if (successCount > 0) {
            let msg = `¡Pago exitoso! Se procesaron ${successCount} reservas.`;
            if (errors.length > 0) msg += `\n\nHubo algunos errores:\n${errors.join('\n')}`;

            alert(msg);
            CartService.clearCart();
            CartController.renderCart();

            // Optional: Redirect to a success page or show invoice details
        } else {
            alert('Error al procesar el pago:\n' + errors.join('\n'));
        }
    }
};

// Expose to window for inline handlers
window.CartController = CartController;

document.addEventListener('DOMContentLoaded', () => {
    CartController.init();
});
