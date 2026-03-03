/* Sidebar toggle for mobile */
(function () {
  'use strict';

  var toggler = document.querySelector('.sidebar-toggler');
  var sidebar = document.getElementById('sidebar');

  if (toggler && sidebar) {
    toggler.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      sidebar.classList.toggle('sidebar-open');
      document.body.classList.toggle('sidebar-mini');
    });
  }

  /* Close sidebar when a nav link is clicked on mobile */
  var navLinks = document.querySelectorAll('.sidebar .nav-link');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth < 992) {
        sidebar.classList.remove('sidebar-open');
        document.body.classList.remove('sidebar-mini');
        if (toggler) toggler.setAttribute('aria-expanded', 'false');
      }
    });
  });
}());
