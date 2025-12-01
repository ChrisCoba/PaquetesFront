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
        // Send null for empty values so backend doesn't treat them as filters
        const soapParams = {
            ciudad: params.city || null,
            fechaInicio: params.fechainicio || null,
            tipoActividad: params.tipoActividad || null,
            precioMax: (params.precioMax && params.precioMax > 0) ? params.precioMax : null
        };

        console.log('Sending SOAP params:', soapParams);

        const result = await SoapClient.call('BuscarPaquetes', soapParams);
        console.log('SOAP BuscarPaquetes raw result:', result);

        // SOAP XML parser returns different structure than REST JSON
        // SOAP: { PaqueteDto: [{},{},..] }
        // REST: [{},{},...]

        if (!result) {
            console.log('SOAP returned null/undefined');
            return [];
        }

        // Extract the tours array - check for PaqueteDto first
        let packages = result.PaqueteDto || result.PaqueteSoap || result.ArrayOfPaqueteSoap || result;

        // If it's wrapped in another object, try to extract array
        if (packages && typeof packages === 'object' && !Array.isArray(packages)) {
            // Check for common XML array wrapper patterns
            packages = packages.PaqueteDto || packages.PaqueteSoap || packages.item || packages;
        }

        // Ensure it's an array
        if (!Array.isArray(packages)) {
            packages = packages ? [packages] : [];
        }

        console.log('SOAP normalized packages (array):', packages);
        return packages;
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
