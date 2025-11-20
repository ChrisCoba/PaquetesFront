import { API_BASE_URL } from './config';

export const DisponibilidadService = {
    /**
     * Check availability
     * @param {Object} data - { idPaquete, fechaInicio, personas }
     */
    async check(data) {
        const response = await fetch(`${API_BASE_URL}/availability`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error checking availability');
        return response.json();
    }
};
