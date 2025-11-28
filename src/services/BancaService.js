/**
 * Service for handling bank transactions
 */
export const BancaService = {
    // URL del Backend Proxy (HTTPS)
    API_BASE_URL: 'https://worldagency.runasp.net/api/v1/integracion/paquetes',

    /**
     * Create a transaction
     * @param {number} cuentaOrigen - Source account number
     * @param {number} cuentaDestino - Destination account number
     * @param {number} monto - Transaction amount
     * @returns {Promise<{exito: boolean, mensaje: string, transaccion_id?: number}>}
     */
    async crearTransaccion(cuentaOrigen, cuentaDestino, monto) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/pagar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    cuentaOrigen: parseInt(cuentaOrigen),
                    cuentaDestino: parseInt(cuentaDestino),
                    total: parseFloat(monto)
                })
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    exito: true,
                    mensaje: data.Mensaje || 'Transacción procesada',
                    transaccion_id: data.TransaccionId
                };
            } else {
                return {
                    exito: false,
                    mensaje: data.message || `Error al procesar transacción: ${response.status}`
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
