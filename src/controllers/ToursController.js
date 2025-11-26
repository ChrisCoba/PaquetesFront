import { PaquetesService } from '../services/PaquetesService.js';
import { CartService } from '../services/CartService.js';

export const ToursController = {
    tours: [], // Store loaded tours locally

    init: async () => {
        const toursContainer = document.getElementById('tours-list');
        const featuredContainer = document.getElementById('featured-destinations-list');
        const filterForm = document.querySelector('.tour-filters');
        const destinationSelect = document.getElementById('destination');

        // Check for URL parameters (search from home page)
        const urlParams = new URLSearchParams(window.location.search);
        const destination = urlParams.get('destination');
        const filters = {};
        if (destination) {
            filters.city = destination;
        }

        if (toursContainer) {
            await ToursController.loadTours(filters);
        }

        if (featuredContainer) {
            await ToursController.loadFeaturedTours();
        }

        if (destinationSelect || document.getElementById('filter-destination')) {
            await ToursController.loadDestinations();

            // Pre-select destination if present in URL
            if (destination) {
                const filterDest = document.getElementById('filter-destination');
                if (filterDest) {
                    filterDest.value = destination;
                }
            }
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

        console.log('Loading tours with filters:', filters);

        container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

        try {
            // Prepare API params
            const apiParams = {};

            if (filters.city) apiParams.city = filters.city;
            if (filters.tipoActividad) apiParams.tipoActividad = filters.tipoActividad;
            if (filters.precioMax) apiParams.precioMax = filters.precioMax;

            // Fetch filtered tours from API
            let tours = await PaquetesService.search(apiParams);
            ToursController.tours = tours; // Save to local property
            console.log('Total tours fetched:', tours.length);

            // Client-side filtering for duration (not supported by API yet)
            if (filters.duration) {
                console.log('Filtering by duration:', filters.duration);
                const [min, max] = filters.duration.split('-').map(Number);
                if (!isNaN(min) && !isNaN(max)) {
                    tours = tours.filter(tour => {
                        const duration = parseInt(tour.Duracion);
                        return !isNaN(duration) && duration >= min && duration <= max;
                    });
                }
            }

            console.log('Filtered tours count:', tours.length);

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
                            <img src="${tour.ImagenUrl || '../assets/img/travel/tour-1.webp'}" alt="${tour.Nombre}" class="img-fluid" style="height: 250px; object-fit: cover; width: 100%;" loading="lazy">
                            <div class="tour-price">$${tour.PrecioActual}</div>
                        </div>
                        <div class="tour-content">
                            <h4>${tour.Nombre}</h4>
                            <p>${tour.Descripcion || `Experience ${tour.Ciudad}, ${tour.Pais}`}</p>
                            <div class="tour-details mb-3">
                                <span><i class="bi bi-clock"></i> ${tour.Duracion} Days</span>
                                <span><i class="bi bi-geo-alt"></i> ${tour.Ciudad}</span>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-6">
                                    <div class="form-group">
                                        <label class="form-label small mb-1">Adultos</label>
                                        <select class="form-select form-select-sm" id="adults-${tour.IdPaquete}">
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4+</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="form-group">
                                        <label class="form-label small mb-1">Niños</label>
                                        <select class="form-select form-select-sm" id="children-${tour.IdPaquete}">
                                            <option value="0">0</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3+</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button class="btn btn-primary w-100" onclick="ToursController.addToCart('${tour.IdPaquete}')">
                                <i class="bi bi-cart-plus"></i> Reservar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });
    },

    addToCart: (tourId) => {
        const adults = document.getElementById(`adults-${tourId}`).value;
        const children = document.getElementById(`children-${tourId}`).value;

        // Find the tour object
        const tour = ToursController.tours.find(t => t.IdPaquete == tourId);

        if (tour) {
            CartService.addToCart(tour, adults, children);
            if (confirm(`Added to cart: ${tour.Nombre}\nDo you want to view your cart?`)) {
                window.location.href = 'car.html';
            }
        } else {
            console.error('Tour not found:', tourId);
            alert('Error adding to cart. Please try again.');
        }
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
                            <img src="${tour.ImagenUrl || 'assets/img/travel/tour-1.webp'}" class="card-img-top rounded-top" alt="${tour.Nombre}" style="height: 200px; object-fit: cover;" loading="lazy">
                            <div class="position-absolute top-0 end-0 m-2 badge bg-primary">$${tour.PrecioActual}</div>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title fw-bold text-truncate">${tour.Nombre}</h5>
                            <p class="card-text small text-muted mb-2"><i class="bi bi-geo-alt-fill text-danger"></i> ${tour.Ciudad}, ${tour.Pais}</p>
                            <p class="card-text text-truncate small">${tour.Descripcion || `Experience ${tour.Ciudad}`}</p>
                            <a href="pages/tours.html" class="btn btn-sm btn-outline-primary w-100 mt-2">View Details</a>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });
    },

    loadDestinations: async () => {
        const selects = [
            document.getElementById('destination'),
            document.getElementById('filter-destination')
        ].filter(el => el !== null);

        if (selects.length === 0) return;

        try {
            const tours = await PaquetesService.search({});
            // Extract unique cities
            const cities = [...new Set(tours.map(tour => tour.Ciudad))].sort();

            selects.forEach(select => {
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
            });
        } catch (error) {
            console.error('Failed to load destinations:', error);
        }
    },

    handleFilterChange: () => {
        // Collect values from filters
        const destination = document.getElementById('filter-destination')?.value ||
            document.querySelector('select[aria-label="Select Destination"]')?.value || '';

        const type = document.getElementById('filter-type')?.value ||
            document.querySelector('select[aria-label="Tour Type"]')?.value || '';

        const priceRange = document.getElementById('filter-price')?.value ||
            document.querySelector('select[aria-label="Price Range"]')?.value || '';

        const duration = document.getElementById('filter-duration')?.value ||
            document.querySelector('select[aria-label="Duration"]')?.value || '';

        console.log('Raw filter values:', { destination, type, priceRange, duration });

        // Parse price range if needed
        let precioMax = null;
        if (priceRange) {
            // If value is just a number (e.g. "50"), use it directly
            // If it's a range (e.g. "0-50"), take the upper bound
            if (priceRange.includes('-')) {
                const parts = priceRange.split('-');
                if (parts.length > 1) precioMax = parts[1];
            } else {
                precioMax = priceRange;
            }
        }

        const filters = {
            city: destination,
            tipoActividad: type,
            precioMax: precioMax,
            duration: duration
        };

        // Remove empty keys
        Object.keys(filters).forEach(key => filters[key] === '' && delete filters[key]);

        console.log('Active filters:', filters);

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

// Expose controller to window for inline event handlers
window.ToursController = ToursController;
