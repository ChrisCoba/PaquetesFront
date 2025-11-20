import { PaquetesService } from '../services/PaquetesService.js';

export const ToursController = {
    init: async () => {
        const toursContainer = document.getElementById('tours-list');
        const featuredContainer = document.getElementById('featured-destinations-list');
        const filterForm = document.querySelector('.tour-filters');
        const destinationSelect = document.getElementById('destination');

        if (toursContainer) {
            await ToursController.loadTours();
        }

        if (featuredContainer) {
            await ToursController.loadFeaturedTours();
        }

        if (destinationSelect) {
            await ToursController.loadDestinations();
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

    loadFeaturedTours: async () => {
        const container = document.getElementById('featured-destinations-list');
        if (!container) return;

        container.innerHTML = '<div class="col-12 text-center"><div class="spinner-border" role="status"></div></div>';

        try {
            const tours = await PaquetesService.search({});
            // Take first 4 items as featured
            const featuredTours = tours.slice(0, 4);
            ToursController.renderFeaturedTours(featuredTours, container);
        } catch (error) {
            console.error('Failed to load featured tours:', error);
            container.innerHTML = '<div class="col-12"><div class="alert alert-danger">Failed to load featured tours.</div></div>';
        }
    },

    renderFeaturedTours: (tours, container) => {
        container.innerHTML = '';
        if (!tours || tours.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p>No featured tours available.</p></div>';
            return;
        }

        tours.forEach(tour => {
            const cardHtml = `
                <div class="col-lg-3 col-md-6 mb-4" data-aos="fade-up">
                    <div class="card h-100 shadow-sm border-0">
                        <div class="position-relative">
                            <img src="${tour.imagenUrl || 'assets/img/travel/tour-1.webp'}" class="card-img-top rounded-top" alt="${tour.nombre}" style="height: 200px; object-fit: cover;">
                            <div class="position-absolute top-0 end-0 m-2 badge bg-primary">$${tour.precioActual}</div>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title fw-bold text-truncate">${tour.nombre}</h5>
                            <p class="card-text small text-muted mb-2"><i class="bi bi-geo-alt-fill text-danger"></i> ${tour.ciudad}, ${tour.pais}</p>
                            <p class="card-text text-truncate small">${tour.descripcion || `Experience ${tour.ciudad}`}</p>
                            <a href="pages/tours.html" class="btn btn-sm btn-outline-primary w-100 mt-2">View Details</a>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });
    },

    loadDestinations: async () => {
        const select = document.getElementById('destination');
        if (!select) return;

        try {
            const tours = await PaquetesService.search({});
            // Extract unique cities
            const cities = [...new Set(tours.map(tour => tour.ciudad))].sort();

            // Clear existing options except the first one
            while (select.options.length > 1) {
                select.remove(1);
            }

            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load destinations:', error);
        }
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
    // Check if we are on a page that needs the controller
    if (document.getElementById('tours-list') || document.getElementById('featured-destinations-list') || document.getElementById('destination')) {
        ToursController.init();
    }
});
