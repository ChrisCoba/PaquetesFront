/**
 * Service for handling bank transactions
 */
import { USE_SOAP } from './config';
import { SoapClient } from './soap/SoapClient';

const BancaServiceRest = {
    // URL del Backend Proxy (HTTPS)
    API_BASE_URL: 'https://worldagency.runasp.net/api/v1/integracion/paquetes',

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

const BancaServiceSoap = {
    async crearTransaccion(cuentaOrigen, cuentaDestino, monto) {
        try {
            const soapParams = {
                cuentaOrigen: parseInt(cuentaOrigen),
                cuentaDestino: parseInt(cuentaDestino),
                total: parseFloat(monto)
            };

            const result = await SoapClient.call('Pagar', soapParams);

            // Result is { Exito: "true", Mensaje: "...", TransaccionId: "123" }
            return {
                exito: result.Exito === 'true',
                mensaje: result.Mensaje,
                transaccion_id: result.TransaccionId ? parseInt(result.TransaccionId) : null
            };
        } catch (error) {
            return {
                exito: false,
                mensaje: `Error SOAP: ${error.message}`
            };
        }
    }
};

export const BancaService = {
    crearTransaccion: (cuentaOrigen, cuentaDestino, monto) =>
        USE_SOAP.value ? BancaServiceSoap.crearTransaccion(cuentaOrigen, cuentaDestino, monto) : BancaServiceRest.crearTransaccion(cuentaOrigen, cuentaDestino, monto)
};
