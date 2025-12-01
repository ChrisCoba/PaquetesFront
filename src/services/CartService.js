export const CartService = {
    STORAGE_KEY: 'agencia_cart',

    getCart: () => {
        const cart = localStorage.getItem(CartService.STORAGE_KEY);
        return cart ? JSON.parse(cart) : [];
    },

    addToCart: (tour, adults, children, date) => {
        const cart = CartService.getCart();
        const newItem = {
            tourId: tour.IdPaquete,
            name: tour.Nombre,
            image: tour.ImagenUrl,
            price: parseFloat(tour.PrecioActual),
            duration: tour.Duracion,
            adults: parseInt(adults),
            children: parseInt(children),
            date: date,
            addedAt: new Date().toISOString()
        };

        cart.push(newItem);
        localStorage.setItem(CartService.STORAGE_KEY, JSON.stringify(cart));
        if (window.updateCartBadge) window.updateCartBadge();
        return cart;
    },

    removeFromCart: (index) => {
        const cart = CartService.getCart();
        if (index >= 0 && index < cart.length) {
            cart.splice(index, 1);
            localStorage.setItem(CartService.STORAGE_KEY, JSON.stringify(cart));
            if (window.updateCartBadge) window.updateCartBadge();
        }
        return cart;
    },

    clearCart: () => {
        localStorage.removeItem(CartService.STORAGE_KEY);
        if (window.updateCartBadge) window.updateCartBadge();
    },

    calculateTotal: () => {
        const cart = CartService.getCart();
        let subtotal = 0;

        cart.forEach(item => {
            // Assuming price is per person (adult) and maybe half for children? 
            // For now, let's assume price is per person regardless, or just for adults.
            // Let's implement a simple logic: Price * (Adults + Children)
            // Or maybe Children are 50%? Let's stick to simple for now: Price * Adults. 
            // Children might be free or full price. Let's assume full price for simplicity unless specified.
            // Actually, usually children have a discount. Let's assume 50% for children.

            const adultTotal = item.price * item.adults;
            const childTotal = (item.price * 0.5) * item.children;
            subtotal += adultTotal + childTotal;
        });

        const taxes = subtotal * 0.12; // 12% tax
        const total = subtotal + taxes;

        return {
            subtotal: subtotal.toFixed(2),
            taxes: taxes.toFixed(2),
            total: total.toFixed(2)
        };
    }
};
