import { CartService } from '../services/CartService.js';
import { API_BASE_URL } from '../services/config.js';
import { BancaService } from '../services/BancaService.js';
import { FacturasService } from '../services/FacturasService.js';
import { ReservasService } from '../services/ReservasService.js';

export const CartController = {
    // Agency Account
    CUENTA_DESTINO: 1787654321,

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
        // 1. Check Auth
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert('Debes iniciar sesión para realizar el pago.');
            window.location.href = 'login.html';
            return;
        }
        const user = JSON.parse(userStr);
        // Assuming user object has 'id' or 'email'. The API needs 'BookingUserId'.
        // Check for various case styles
        const bookingUserId = user.id || user.Id || user.idUsuario || user.IdUsuario || user.email || user.Email;

        // 2. Get Payment Details
        const nroCliente = document.getElementById('nro-cliente')?.value;
        const nroCuenta = document.getElementById('nro-cuenta')?.value;

        if (!nroCliente || !nroCuenta) {
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
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';

        try {
            const totals = CartService.calculateTotal();
            const today = new Date().toISOString();

            // 3. Create Holds for all items
            const holds = [];
            for (const item of cart) {
                const totalPersonas = parseInt(item.adults) + parseInt(item.children);

                const holdPayload = {
                    IdPaquete: item.tourId,
                    BookingUserId: bookingUserId,
                    FechaInicio: today,
                    Personas: totalPersonas,
                    DuracionHoldSegundos: 600
                };
                console.log('Sending Hold Request:', holdPayload);

                // Call Hold API
                const holdData = await ReservasService.hold(holdPayload);

                if (!holdData || !holdData.HoldId) {
                    throw new Error(`No se pudo reservar el tour: ${item.name}`);
                }

                holds.push({ item, holdId: holdData.HoldId });
            }

            // 4. Process Payment
            const paymentResponse = await BancaService.crearTransaccion(
                parseInt(nroCuenta),
                CartController.CUENTA_DESTINO,
                totals.total
            );

            if (!paymentResponse.exito) {
                throw new Error(`Pago fallido: ${paymentResponse.mensaje}`);
            }

            // 5. Confirm Bookings (Create Reservations)
            const reservations = [];
            for (const { item, holdId } of holds) {
                const bookData = await ReservasService.book({
                    IdPaquete: item.tourId,
                    HoldId: holdId,
                    BookingUserId: bookingUserId,
                    MetodoPago: "Transferencia Bancaria",
                    Turistas: [{
                        Nombre: user.nombre || "Cliente",
                        Apellido: user.apellido || bookingUserId,
                        Identificacion: nroCliente,
                        TipoIdentificacion: "CEDULA"
                    }]
                });
                reservations.push(bookData);
            }

            // 6. Generate Invoice
            // Use the first reservation ID for the invoice, or a combined reference
            const mainReservaId = reservations[0]?.idReserva || paymentResponse.transaccion_id;

            let invoiceMsg = "";
            try {
                const invoice = await FacturasService.emit({
                    reservaId: mainReservaId.toString(),
                    subtotal: totals.subtotal,
                    iva: totals.taxes,
                    total: totals.total
                });
                invoiceMsg = `\nFactura #${invoice.numero} generada.`;
            } catch (invErr) {
                console.error("Invoice error:", invErr);
                invoiceMsg = "\n(Error generando factura)";
            }

            // Success
            alert(`¡Reserva confirmada!\nID Transacción: ${paymentResponse.transaccion_id}${invoiceMsg}`);

            CartService.clearCart();
            window.location.href = '../index.html';

        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Proceder al Pago';
        }
    }
};

// Expose to window for inline handlers
window.CartController = CartController;

document.addEventListener('DOMContentLoaded', () => {
    CartController.init();
});
