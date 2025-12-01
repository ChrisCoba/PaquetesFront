import { API_BASE_URL } from './config';

export const FacturasService = {
    /**
     * Emit an invoice
     * @param {Object} data - { reservaId, subtotal, iva, total }
     */
    async emit(data) {
        const response = await fetch(`${API_BASE_URL}/invoices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error emitting invoice');
        return response.json();
    },

    /**
     * Get all invoices
     */
    async getInvoices() {
        const response = await fetch(`${API_BASE_URL}/invoices/list`);
        if (!response.ok) throw new Error('Error fetching invoices');
        return response.json();
    }
};
