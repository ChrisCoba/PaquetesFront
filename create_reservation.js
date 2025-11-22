const API_URL = "https://worldagency.runasp.net/api/v1/integracion/paquetes";

async function main() {
    try {
        // 1. Get Users
        console.log("Fetching users...");
        let users = [];
        try {
            const res = await fetch(`${API_URL}/usuarios/list`);
            if (res.ok) users = await res.json();
        } catch (e) { console.log("Error fetching users", e); }

        let userId;
        if (users.length > 0) {
            userId = users[0].IdUsuario || users[0].Id;
            console.log("Using existing user:", userId);
        } else {
            console.log("No users found. Creating one...");
            const newUser = {
                Email: `testuser${Date.now()}@example.com`,
                Password: "Password123!",
                Nombre: "Test",
                Apellido: "User"
            };
            const res = await fetch(`${API_URL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            const data = await res.json();
            if (!res.ok) throw new Error("Failed to create user: " + JSON.stringify(data));
            userId = data.IdUsuario || data.Id;
            console.log("User created:", userId);
        }

        // 2. Get Tours
        console.log("Fetching tours...");
        let tours = [];
        try {
            const res = await fetch(`${API_URL}/search`);
            if (res.ok) tours = await res.json();
        } catch (e) { console.log("Error fetching tours", e); }

        let tourId;
        if (tours.length > 0) {
            tourId = tours[0].IdPaquete;
            console.log("Using existing tour:", tourId);
        } else {
            console.log("No tours found. Creating one...");
            const newTour = {
                Nombre: "Test Tour " + Date.now(),
                Codigo: "TEST-" + Date.now(),
                CiudadId: 1,
                TipoActividad: "General",
                PrecioBase: 100,
                CupoMaximo: 10,
                DuracionDias: 3,
                ImagenUrl: "https://via.placeholder.com/150"
            };
            const res = await fetch(`${API_URL}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTour)
            });
            const data = await res.json();
            if (!res.ok) throw new Error("Failed to create tour: " + JSON.stringify(data));
            tourId = data.IdPaquete;
            console.log("Tour created:", tourId);
        }

        // 3. Availability
        console.log("Checking availability...");
        const today = new Date().toISOString();
        const availRes = await fetch(`${API_URL}/availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ IdPaquete: tourId, FechaInicio: today, Personas: 1 })
        });
        if (!availRes.ok) {
            const err = await availRes.text();
            throw new Error("Availability check failed: " + err);
        }
        console.log("Availability OK");

        // 4. Hold
        console.log("Creating hold...");
        const holdRes = await fetch(`${API_URL}/hold`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ IdPaquete: tourId, BookingUserId: userId, FechaInicio: today, Personas: 1 })
        });
        const holdData = await holdRes.json();
        if (!holdRes.ok) throw new Error("Hold failed: " + JSON.stringify(holdData));
        console.log("Hold created:", holdData.HoldId);

        // 5. Book
        console.log("Booking...");
        const bookRes = await fetch(`${API_URL}/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                IdPaquete: tourId,
                HoldId: holdData.HoldId,
                BookingUserId: userId,
                MetodoPago: "CreditCard",
                Turistas: [{ Nombre: "Test", Apellido: "Tourist", Identificacion: "1234567890", TipoIdentificacion: "DNI" }]
            })
        });
        const bookData = await bookRes.json();
        if (!bookRes.ok) throw new Error("Booking failed: " + JSON.stringify(bookData));
        console.log("Reservation created successfully!", bookData);

    } catch (error) {
        console.error("Error:", error);
    }
}

main();
