import { API_BASE_URL, USE_SOAP } from './config';
import { SoapClient } from './soap/SoapClient';

const PaquetesServiceRest = {
    async search(params) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/search?${query}`);
        if (!response.ok) throw new Error('Error fetching packages');
        return response.json();
    },

    async create(data) {
        const response = await fetch(`${API_BASE_URL}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error creating package');
        return response.json();
    },

    async update(id, data) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error updating package');
        return response.json();
    },

    async delete(id) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error deleting package');
        return response.json();
    }
};

const PaquetesServiceSoap = {
    async search(params) {
        // Map REST params to SOAP params
        const soapParams = {
            ciudad: params.city || '',
            fechaInicio: params.fechainicio || '',
            tipoActividad: params.tipoActividad || '',
            precioMax: params.precioMax || 0
        };
        return await SoapClient.call('BuscarPaquetes', soapParams);
    },

    async create(data) {
        // TODO: Implement CrearPaquete in Backend SOAP
        throw new Error("SOAP implementation for Create Package not available yet");
    },

    async update(id, data) {
        // TODO: Implement ModificarPaquete in Backend SOAP
        throw new Error("SOAP implementation for Update Package not available yet");
    },

    async delete(id) {
        // TODO: Implement EliminarPaquete in Backend SOAP
        throw new Error("SOAP implementation for Delete Package not available yet");
    }
};

export const PaquetesService = {
    search: (params) => USE_SOAP.value ? PaquetesServiceSoap.search(params) : PaquetesServiceRest.search(params),
    create: (data) => USE_SOAP.value ? PaquetesServiceSoap.create(data) : PaquetesServiceRest.create(data),
    update: (id, data) => USE_SOAP.value ? PaquetesServiceSoap.update(id, data) : PaquetesServiceRest.update(id, data),
    delete: (id) => USE_SOAP.value ? PaquetesServiceSoap.delete(id) : PaquetesServiceRest.delete(id)
};
