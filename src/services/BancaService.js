/**
 * Service for handling bank transactions
 */
export const BancaService = {
    // Use the main backend as a proxy to avoid Mixed Content (HTTPS -> HTTP)
    API_BASE_URL: 'https://worldagency.runasp.net/api/v1/integracion/banca',

    /**
     * Create a transaction
     * @param {number} cuentaOrigen - Source account number
     * @param {number} cuentaDestino - Destination account number
     * @param {number} monto - Transaction amount
     * @returns {Promise<{exito: boolean, mensaje: string, transaccion_id?: number}>}
     */
    async crearTransaccion(cuentaOrigen, cuentaDestino, monto) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/transaccion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cuenta_origen: cuentaOrigen,
                    cuenta_destino: cuentaDestino,
                    monto: monto
                })
            });

            const data = await response.json();

            if (response.ok) {
                return data || { exito: true, mensaje: 'Transacción procesada' };
            } else {
                return {
                    exito: false,
                    mensaje: `Error al procesar transacción: ${response.status} - ${JSON.stringify(data)}`
                };
            }
        } catch (error) {
            return {
                exito: false,
                mensaje: `Error al comunicarse con la API de banca: ${error.message}`
            };
        }
    }
};
