import { BancaService } from '../services/BancaService.js';
import { FacturasService } from '../../src/services/FacturasService.js';

export const CartController = {
    // Hardcoded destination account (agency account)
    CUENTA_DESTINO: 123456789, // Replace with actual agency account number

    init: () => {
        CartController.loadCartItems();
        CartController.setupPaymentButton();
    },

    loadCartItems: () => {
        // Load cart items from localStorage or session
        const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        const container = document.getElementById('cart-items-container');

        if (!container) return;

        if (cartItems.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-cart-x" style="font-size: 3rem; color: #ccc;"></i>
                    <p class="mt-3">Tu carrito está vacío</p>
                    <a href="tours.html" class="btn btn-primary">Explorar Tours</a>
                </div>
            `;
            CartController.updateSummary(0, 0, 0);
            return;
        }

        container.innerHTML = '';
        let subtotal = 0;

        cartItems.forEach((item, index) => {
            const itemTotal = item.precio * (item.cantidad || 1);
            subtotal += itemTotal;

            const itemHtml = `
                <div class="cart-item border rounded p-3 mb-3">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${item.imagen || '../assets/img/travel/tour-1.webp'}" 
                                 alt="${item.nombre}" 
                                 class="img-fluid rounded">
                        </div>
                        <div class="col-md-4">
                            <h5>${item.nombre}</h5>
                            <p class="text-muted mb-0">${item.ciudad || 'Destino'}</p>
                        </div>
                        <div class="col-md-2">
                            <label>Cantidad:</label>
                            <input type="number" 
                                   class="form-control form-control-sm" 
                                   value="${item.cantidad || 1}" 
                                   min="1" 
                                   data-index="${index}"
                                   onchange="CartController.updateQuantity(${index}, this.value)">
                        </div>
                        <div class="col-md-2 text-center">
                            <strong>$${itemTotal.toFixed(2)}</strong>
                        </div>
                        <div class="col-md-2 text-end">
                            <button class="btn btn-sm btn-danger" 
                                    onclick="CartController.removeItem(${index})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', itemHtml);
        });

        // Calculate taxes (12% IVA)
        const taxes = subtotal * 0.12;
        const total = subtotal + taxes;

        CartController.updateSummary(subtotal, taxes, total);
    },

    updateSummary: (subtotal, taxes, total) => {
        document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('cart-taxes').textContent = `$${taxes.toFixed(2)}`;
        document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
    },

    updateQuantity: (index, quantity) => {
        const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cartItems[index]) {
            cartItems[index].cantidad = parseInt(quantity);
            localStorage.setItem('cart', JSON.stringify(cartItems));
            CartController.loadCartItems();
        }
    },

    removeItem: (index) => {
        if (confirm('¿Estás seguro de eliminar este item?')) {
            const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
            cartItems.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cartItems));
            CartController.loadCartItems();

            // Update cart badge
            const badge = document.querySelector('.btn-shopping-cart .badge');
            if (badge) badge.textContent = cartItems.length;
        }
    },

    setupPaymentButton: () => {
        const btnCheckout = document.getElementById('btn-checkout');
        if (btnCheckout) {
            btnCheckout.addEventListener('click', CartController.handlePayment);
        }
    },

    handlePayment: async () => {
        // Check if user is logged in
        const user = localStorage.getItem('user');
        if (!user) {
            alert('Debes iniciar sesión para realizar el pago.');
            window.location.href = 'login.html';
            return;
        }

        const nroCliente = document.getElementById('nro-cliente')?.value;
        const nroCuenta = document.getElementById('nro-cuenta')?.value;
        const totalElement = document.getElementById('cart-total');
        const subtotalElement = document.getElementById('cart-subtotal');
        const taxesElement = document.getElementById('cart-taxes');
        const btnCheckout = document.getElementById('btn-checkout');

        // Validation
        if (!nroCliente || !nroCuenta) {
            alert('Por favor, ingresa tu número de cliente y cuenta.');
            return;
        }

        if (!totalElement || !subtotalElement || !taxesElement) return;

        const totalText = totalElement.textContent.replace('$', '').replace(',', '');
        const subtotalText = subtotalElement.textContent.replace('$', '').replace(',', '');
        const taxesText = taxesElement.textContent.replace('$', '').replace(',', '');

        const monto = parseFloat(totalText);
        const subtotal = parseFloat(subtotalText);
        const iva = parseFloat(taxesText);

        if (isNaN(monto) || monto <= 0) {
            alert('El monto del carrito no es válido.');
            return;
        }

        const cuentaOrigen = parseInt(nroCuenta);
        if (isNaN(cuentaOrigen)) {
            alert('Número de cuenta inválido.');
            return;
        }

        // Disable button and show loading
        btnCheckout.disabled = true;
        btnCheckout.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';

        try {
            // Call BancaService
            const paymentResponse = await BancaService.crearTransaccion(
                cuentaOrigen,
                CartController.CUENTA_DESTINO,
                monto
            );

            if (paymentResponse.exito) {
                // Payment successful, now create invoice
                let invoiceMessage = '';
                try {
                    // We need a reservaId - for now we'll use the transaction_id or generate one
                    const reservaId = paymentResponse.transaccion_id || `RES-${Date.now()}`;

                    const invoiceData = {
                        reservaId: reservaId.toString(),
                        subtotal: subtotal,
                        iva: iva,
                        total: monto
                    };

                    const invoiceResponse = await FacturasService.emit(invoiceData);
                    invoiceMessage = `\n\nFactura generada:\nNúmero: ${invoiceResponse.numero || 'N/A'}\nID: ${invoiceResponse.idFactura || 'N/A'}`;

                    if (invoiceResponse.uriFactura) {
                        invoiceMessage += `\nPuedes descargar tu factura en: ${invoiceResponse.uriFactura}`;
                    }
                } catch (invoiceError) {
                    console.error('Error generating invoice:', invoiceError);
                    invoiceMessage = '\n\nNota: Hubo un problema al generar la factura. Por favor contacta a soporte.';
                }

                alert(`¡Pago exitoso! ID de transacción: ${paymentResponse.transaccion_id || 'N/A'}\n${paymentResponse.mensaje}${invoiceMessage}`);

                // Clear cart
                localStorage.removeItem('cart');

                // Redirect to confirmation page or reload
                window.location.href = '../index.html';
            } else {
                alert(`Error en el pago: ${paymentResponse.mensaje}`);
            }
        } catch (error) {
            alert(`Error al procesar el pago: ${error.message}`);
        } finally {
            btnCheckout.disabled = false;
            btnCheckout.innerHTML = 'Proceder al Pago';
        }
    }
};

// Expose to window for onclick handlers
window.CartController = CartController;

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cart-items-container')) {
        CartController.init();
    }
});
