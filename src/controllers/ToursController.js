import { PaquetesService } from '../services/PaquetesService.js';

export const ToursController = {
    init: async () => {
        const toursContainer = document.getElementById('tours-list');
        const filterForm = document.querySelector('.tour-filters');

        if (toursContainer) {
            await ToursController.loadTours();
        }

        if (filterForm) {
            // Attach event listeners to select inputs for auto-filtering
            const selects = filterForm.querySelectorAll('select');
            selects.forEach(select => {
                select.addEventListener('change', () => ToursController.handleFilterChange());
            });
        }
    },

    loadTours: async (filters = {}) => {
        const container = document.getElementById('tours-list');
        if (!container) return;

        container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

        try {
            const tours = await PaquetesService.search(filters);
            ToursController.renderTours(tours, container);
        } catch (error) {
            console.error('Failed to load tours:', error);
            container.innerHTML = '<div class="alert alert-danger">Failed to load tours. Please try again later.</div>';
        }
    },

    renderTours: (tours, container) => {
        container.innerHTML = '';

        if (!tours || tours.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p>No tours found matching your criteria.</p></div>';
            return;
        }

        tours.forEach(tour => {
            const cardHtml = `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="tour-card">
                        <div class="tour-image">
                            <img src="${tour.imagenUrl || '../assets/img/travel/tour-1.webp'}" alt="${tour.nombre}" class="img-fluid" style="height: 250px; object-fit: cover; width: 100%;">
                            <div class="tour-price">$${tour.precioActual}</div>
                        </div>
                        <div class="tour-content">
                            <h4>${tour.nombre}</h4>
                            <p>${tour.descripcion || `Experience ${tour.ciudad}, ${tour.pais}`}</p>
                            <div class="tour-details">
                                <span><i class="bi bi-clock"></i> ${tour.duracion} Days</span>
                                <span><i class="bi bi-geo-alt"></i> ${tour.ciudad}</span>
                            </div>
                            <a href="#" class="btn btn-outline-primary w-100 mt-3" onclick="window.location.href='tour-details.html?id=${tour.idPaquete}'">View Details</a>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });
    },

    handleFilterChange: () => {
        // Collect values from filters
        // Note: You'll need to ensure your HTML select IDs match these or update the selector logic
        const destination = document.querySelector('select[aria-label="Select Destination"]')?.value || '';
        const type = document.querySelector('select[aria-label="Tour Type"]')?.value || '';
        const priceRange = document.querySelector('select[aria-label="Price Range"]')?.value || '';

        // Parse price range if needed, e.g., "0-500"
        let precioMax = null;
        if (priceRange) {
            const parts = priceRange.split('-');
            if (parts.length > 1) precioMax = parts[1];
        }

        const filters = {
            city: destination,
            tipoActividad: type,
            precioMax: precioMax
        };

        // Remove empty keys
        Object.keys(filters).forEach(key => filters[key] === '' && delete filters[key]);

        ToursController.loadTours(filters);
    }
};

// Auto-initialize if we are on the page
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the tours page by looking for the container
    if (document.getElementById('tours-list')) {
        ToursController.init();
    }
});
