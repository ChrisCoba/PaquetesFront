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
    },

    async getReservations() {
        const response = await fetch(`${API_BASE_URL}/reservas`);
        if (!response.ok) throw new Error('Error fetching reservations');
        return response.json();
    },

    async getReservationsByUser(userId) {
        const response = await fetch(`${API_BASE_URL}/reservas/usuario/${userId}`);
        if (!response.ok) throw new Error('Error fetching user reservations');
        return response.json();
    },

    async cancelReservation(reservaId) {
        const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}/cancelar`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al cancelar reserva');
        }

        return response.json();
    },

    async getReservationDetails(id) {
        // Construct Admin URL manually since API_BASE_URL points to integracion
        const adminUrl = API_BASE_URL.replace('integracion', 'admin');
        const response = await fetch(`${adminUrl}/reservas/${id}/detalles`);
        if (!response.ok) throw new Error('Error fetching reservation details');
        return response.json();
    },

    async updateReservationStatus(reservationId, newStatus) {
        const response = await fetch(`${API_BASE_URL}/reservas/${reservationId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: newStatus }),
        });
        if (!response.ok) throw new Error('Error updating reservation status');
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
    },

    async getReservations() {
        // SOAP implementation for getting reservations
        // Assuming there is a WebMethod 'ObtenerReservas' or similar
        // If not, we might need to fallback to REST or throw error
        // For now, let's try to call a SOAP method if it exists, or return empty array
        try {
            // This might need adjustment based on actual SOAP service capabilities
            const result = await SoapClient.call('ObtenerReservas', {});
            // Result might be an array or a single object wrapped
            return Array.isArray(result) ? result : (result ? [result] : []);
        } catch (e) {
            console.warn('SOAP getReservations not implemented or failed', e);
            return [];
        }
    }
};

export const ReservasService = {
    hold: (data) => USE_SOAP.value ? ReservasServiceSoap.hold(data) : ReservasServiceRest.hold(data),
    book: (data) => USE_SOAP.value ? ReservasServiceSoap.book(data) : ReservasServiceRest.book(data),
    getReservations: () => USE_SOAP.value ? ReservasServiceSoap.getReservations() : ReservasServiceRest.getReservations(),
    getReservationsByUser: (userId) => ReservasServiceRest.getReservationsByUser(userId), // Always use REST for user-specific reservations
    getReservationDetails: (id) => ReservasServiceRest.getReservationDetails(id), // Always use REST for admin details for now
    cancelReservation: (reservaId) => ReservasServiceRest.cancelReservation(reservaId), // Always use REST for cancellation
    updateReservationStatus: (reservationId, newStatus) => ReservasServiceRest.updateReservationStatus(reservationId, newStatus)
};
