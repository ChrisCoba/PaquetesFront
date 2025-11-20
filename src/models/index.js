
/**
 * Represents a Tour Package.
 */
export class Paquete {
    /**
     * @param {string} idPaquete
     * @param {string} nombre
     * @param {string} ciudad
     * @param {string} pais
     * @param {string} tipoActividad
     * @param {number} capacidad
     * @param {number} precioNormal
     * @param {number} precioActual
     * @param {string} imagenUrl
     * @param {number} duracion - Duration in days or hours
     */
    constructor(idPaquete, nombre, ciudad, pais, tipoActividad, capacidad, precioNormal, precioActual, imagenUrl, duracion) {
        this.idPaquete = idPaquete;
        this.nombre = nombre;
        this.ciudad = ciudad;
        this.pais = pais;
        this.tipoActividad = tipoActividad;
        this.capacidad = capacidad;
        this.precioNormal = precioNormal;
        this.precioActual = precioActual;
        this.imagenUrl = imagenUrl;
        this.duracion = duracion;
    }
}

/**
 * Request object for checking availability.
 */
export class DisponibilidadRequest {
    /**
     * @param {string} idPaquete
     * @param {string} fechaInicio - ISO Date string
     * @param {number} personas
     */
    constructor(idPaquete, fechaInicio, personas) {
        this.idPaquete = idPaquete;
        this.fechaInicio = fechaInicio;
        this.personas = personas;
    }
}

/**
 * Request object for creating a Pre-booking (Hold).
 */
export class PreReservaRequest {
    /**
     * @param {string} idPaquete
     * @param {string} bookingUserId
     * @param {string} fechaInicio - ISO Date string
     * @param {number} personas
     * @param {number} duracionHoldSegundos
     */
    constructor(idPaquete, bookingUserId, fechaInicio, personas, duracionHoldSegundos) {
        this.idPaquete = idPaquete;
        this.bookingUserId = bookingUserId;
        this.fechaInicio = fechaInicio;
        this.personas = personas;
        this.duracionHoldSegundos = duracionHoldSegundos;
    }
}

/**
 * Represents a Tourist/Passenger.
 */
export class Turista {
    /**
     * @param {string} nombre
     * @param {string} apellido
     * @param {string} fechaNacimiento - ISO Date string
     * @param {string} tipoIdentificacion
     * @param {string} identificacion
     */
    constructor(nombre, apellido, fechaNacimiento, tipoIdentificacion, identificacion) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.fechaNacimiento = fechaNacimiento;
        this.tipoIdentificacion = tipoIdentificacion;
        this.identificacion = identificacion;
    }
}

/**
 * Request object for confirming a Reservation (Book).
 */
export class ReservaRequest {
    /**
     * @param {string} idPaquete
     * @param {string} holdId
     * @param {string} bookingUserId
     * @param {string} metodoPago
     * @param {Turista[]} turistas
     */
    constructor(idPaquete, holdId, bookingUserId, metodoPago, turistas) {
        this.idPaquete = idPaquete;
        this.holdId = holdId;
        this.bookingUserId = bookingUserId;
        this.metodoPago = metodoPago;
        this.turistas = turistas;
    }
}

/**
 * Request object for generating an Invoice.
 */
export class FacturaRequest {
    /**
     * @param {string} reservaId
     * @param {number} subtotal
     * @param {number} iva
     * @param {number} total
     */
    constructor(reservaId, subtotal, iva, total) {
        this.reservaId = reservaId;
        this.subtotal = subtotal;
        this.iva = iva;
        this.total = total;
    }
}

/**
 * Represents a User.
 */
export class Usuario {
    /**
     * @param {string} email
     * @param {string} password
     * @param {string} nombre
     * @param {string} apellido
     * @param {string} [claveAdmin] - Optional admin key
     */
    constructor(email, password, nombre, apellido, claveAdmin = null) {
        this.email = email;
        this.password = password;
        this.nombre = nombre;
        this.apellido = apellido;
        this.claveAdmin = claveAdmin;
    }
}

/**
 * Login credentials.
 */
export class Login {
    /**
     * @param {string} email
     * @param {string} password
     */
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}
