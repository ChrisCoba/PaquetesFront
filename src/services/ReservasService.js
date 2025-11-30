import { API_BASE_URL, USE_SOAP } from './config';
import { SoapClient } from './soap/SoapClient';

const ReservasServiceRest = {
    async hold(data) {
        const response = await fetch(`${API_BASE_URL}/hold`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error creating hold');
        return response.json();
    },

    async book(data) {
        const response = await fetch(`${API_BASE_URL}/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error confirming booking');
        }
        return response.json();
    }
};

const ReservasServiceSoap = {
    async hold(data) {
        // Map REST params to SOAP params
        const soapParams = {
            idPaquete: data.IdPaquete,
            bookingUserId: data.BookingUserId,
            fechaInicio: data.FechaInicio.split('T')[0], // SOAP expects yyyy-MM-dd
            personas: data.Personas,
            duracionSegundos: data.DuracionHoldSegundos
        };
        const result = await SoapClient.call('CrearHold', soapParams);

        // Map SOAP result to REST format
        return {
            HoldId: result.HoldId,
            Expira: result.Expira
        };
    },

    async book(data) {
        // Map REST params to SOAP params
        const soapParams = {
            idPaquete: data.IdPaquete,
            holdId: data.HoldId,
            bookingUserId: data.BookingUserId,
            metodoPago: data.MetodoPago,
            turistas: data.Turistas // SoapClient handles array as <TuristaSoap> items
        };

        const result = await SoapClient.call('ReservarPaquete', soapParams);

        // Map SOAP result to REST format
        return {
            IdReserva: result.IdReserva,
            Codigo: result.Codigo,
            Total: parseFloat(result.Total),
            FechaCreacion: result.FechaCreacion
        };
    }
};

export const ReservasService = {
    hold: (data) => USE_SOAP.value ? ReservasServiceSoap.hold(data) : ReservasServiceRest.hold(data),
    book: (data) => USE_SOAP.value ? ReservasServiceSoap.book(data) : ReservasServiceRest.book(data)
};
