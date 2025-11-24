import { API_BASE_URL } from './config';

export const ReservasService = {
    /**
     * Create a temporary hold
     * @param {Object} data - { idPaquete, bookingUserId, fechaInicio, personas, duracionHoldSegundos }
     */
    async hold(data) {
        const response = await fetch(`${API_BASE_URL}/hold`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error creating hold');
        return response.json();
    },

    /**
     * Confirm the booking
     * @param {Object} data - { idPaquete, holdId, bookingUserId, metodoPago, turistas }
     */
    async book(data) {
        const response = await fetch(`${API_BASE_URL}/reservas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error confirming booking');
        return response.json();
    }
};
