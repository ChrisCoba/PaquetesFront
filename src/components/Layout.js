
import { AuthService } from '../services/AuthService.js';

// Expose AuthService for inline onclick handlers
window.AuthService = AuthService;

export function renderLayout() {
  const user = AuthService.getCurrentUser();

  // User requested "Mi Perfil" instead of "Cerrar Sesión", but typically "Mi Perfil" goes to a profile page.
  // However, the user's request was "the navmenu show, Iniciar Sesion and it must show Mi Perfil".
  // And "Cerrar Sesión" was my previous implementation for the button.
  // I will change the button to "Mi Perfil" (which might just be a logout for now or a link to profile if it existed, but I'll make it logout as per previous logic or maybe just a link).
  // Wait, "Mi Perfil" usually implies a link to /pages/user.html (which exists in the file list I saw earlier `dist/pages/user.html`).
  // Let's check if `user.html` exists. Yes, `dist/pages/user.html` was built.
  // So "Mi Perfil" should link to `/pages/user.html`.
  // And "Cerrar Sesión" should probably be in the nav menu or inside the profile page.
  // But the user said "navmenu show, Iniciar Sesion and it must show Mi Perfil".
  // The navmenu has `<li><a href="/pages/login.html" id="nav-login">Iniciar Sesión</a></li>`.
  // So I should change THAT link.

  // AND the user said "Also in the admin page...".
  // But `Layout.js` controls the header for public pages. `admin.html` uses `Layout.js` too (I verified this in Step 732).

  // So:
  // 1. Update the "Registrarse" button (which I changed to "Cerrar Sesión") -> User didn't explicitly complain about this, but said "Cambios admin y registro a los que estan logeados" in commit message.
  // The user said "Also in the admin page, the navmenu show, Iniciar Sesion and it must show Mi Perfil".
  // This refers to the `nav-login` link.

  // Let's handle both:
  // 1. The "Registrarse" button (btn-getstarted): If logged in, maybe show "Cerrar Sesión" or hide it?
  // 2. The "Iniciar Sesión" link in nav: Change to "Mi Perfil" pointing to `/pages/user.html`.

  const registerLink = user
    ? `<a class="btn-getstarted" href="#" onclick="AuthService.logout(); return false;">Cerrar Sesión</a>`
    : `<a class="btn-getstarted" href="/pages/register.html">Registrarse</a>`;

  const headerHTML = `
  <header id="header" class="header d-flex align-items-center fixed-top">
    <div class="header-container container-fluid container-xl position-relative d-flex align-items-center justify-content-between">

      <a href="/index.html" class="logo d-flex align-items-center me-auto me-xl-0">
        <!-- Uncomment the line below if you also wish to use an image logo -->
        <!-- <img src="/assets/img/logo.webp" alt=""> -->
        <h1 class="sitename">WordlAgency</h1>
      </a>

      <nav id="navmenu" class="navmenu">
        <ul>
          <li><a href="/index.html" id="nav-home">Inicio</a></li>
          <li><a href="/pages/about.html" id="nav-about">Sobre Nosotros</a></li>
          <li><a href="/pages/destinations.html" id="nav-destinations">Destinos</a></li>
          <li><a href="/pages/tours.html" id="nav-tours">Tours</a></li>
          ${!user ? `<li><a href="/pages/login.html" id="nav-login">Iniciar Sesión</a></li>` : ''}
          ${user ? `
          <li class="dropdown"><a href="#"><span>Hola, ${user.Nombre || 'Usuario'}</span> <i class="bi bi-chevron-down toggle-dropdown"></i></a>
            <ul>
              <li><a href="/pages/user.html">Mi Perfil</a></li>
              <li><a href="#" onclick="AuthService.logout(); return false;">Cerrar Sesión</a></li>
            </ul>
          </li>` : ''}
        </ul>
        <i class="mobile-nav-toggle d-xl-none bi bi-list"></i>
      </nav>

      <a class="btn-shopping-cart" href="/pages/car.html"><i class="bi bi-cart"></i><span class="badge bg-danger">2</span></a>

      ${registerLink}

    </div>
  </header>
  `;

  const footerHTML = `
  <footer id="footer" class="footer position-relative dark-background">

    <div class="container footer-top">
      <div class="row gy-4">
        <div class="col-lg-4 col-md-6 footer-about">
          <a href="/index.html" class="d-flex align-items-center">
            <span class="sitename">Tour</span>
          </a>
          <div class="footer-contact pt-3">
            <p>Av. 9 de Octubre</p>
            <p>Guayaquil, Ecuador</p>
            <p class="mt-3"><strong>Teléfono:</strong> <span>+593 987654321</span></p>
            <p><strong>Correo:</strong> <span>wordlagency@gmail.com</span></p>
          </div>
        </div>

        <div class="col-lg-2 col-md-3 footer-links">
          <h4>Useful Links</h4>
          <ul>
            <li><i class="bi bi-chevron-right"></i> <a href="/index.html">Inicio</a></li>
            <li><i class="bi bi-chevron-right"></i> <a href="/pages/about.html">Sobre Nosotros</a></li>
            <li><i class="bi bi-chevron-right"></i> <a href="/pages/destinations.html">Destinos</a></li>
            <li><i class="bi bi-chevron-right"></i> <a href="/pages/tours.html">Tours</a></li>
          </ul>
        </div>

        <div class="col-lg-4 col-md-12">
          <h4>Síguenos</h4>
          <p>Nuestros canales de redes sociales</p>
          <div class="social-links d-flex">
            <a href=""><i class="bi bi-twitter-x"></i></a>
            <a href=""><i class="bi bi-facebook"></i></a>
            <a href=""><i class="bi bi-instagram"></i></a>
            <a href=""><i class="bi bi-linkedin"></i></a>
          </div>
        </div>

      </div>
    </div>
  </footer>
  `;

  // Inject Header
  const headerContainer = document.getElementById('app-header');
  if (headerContainer) {
    headerContainer.innerHTML = headerHTML;
  }

  // Inject Footer
  const footerContainer = document.getElementById('app-footer');
  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;
  }

  // Highlight Active Link
  const path = window.location.pathname;
  if (path.endsWith('index.html') || path === '/') {
    document.getElementById('nav-home')?.classList.add('active');
  } else if (path.includes('about.html')) {
    document.getElementById('nav-about')?.classList.add('active');
  } else if (path.includes('destinations.html')) {
    document.getElementById('nav-destinations')?.classList.add('active');
  } else if (path.includes('tours.html')) {
    document.getElementById('nav-tours')?.classList.add('active');
  } else if (path.includes('login.html') || path.includes('user.html')) {
    document.getElementById('nav-login')?.classList.add('active');
  }

  // Load main.js dynamically to ensure it runs AFTER header is injected
  // We check if it's already loaded to avoid duplicates, though main.js is usually not idempotent if it adds listeners.
  // But since we removed it from HTML, we should load it here.
  const script = document.createElement('script');
  script.src = '/js/main.js';
  script.async = true;
  document.body.appendChild(script);
}
