/* Sidebar: mobile toggle + desktop collapse/expand */
(function () {
  'use strict';

  var toggler    = document.querySelector('.sidebar-toggler');
  var sidebar    = document.getElementById('sidebar');
  var collapseBtn = document.getElementById('sidebarCollapseBtn');

  /* ── Mobile hamburger toggle ───────────────────────────── */
  if (toggler && sidebar) {
    toggler.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      sidebar.classList.toggle('sidebar-open');
      document.body.classList.toggle('sidebar-mini');
    });
  }

  /* ── Desktop collapse / expand ─────────────────────────── */
  if (collapseBtn) {
    /* Restore persisted state */
    var isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
      collapseBtn.setAttribute('aria-label', 'Expand sidebar');
    }

    collapseBtn.addEventListener('click', function () {
      var collapsed = document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('sidebarCollapsed', collapsed);
      this.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
    });
  }

  /* ── Close sidebar on nav-link click (mobile) ──────────── */
  var navLinks = document.querySelectorAll('.sidebar .nav-link');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth < 992) {
        if (sidebar)  sidebar.classList.remove('sidebar-open');
        document.body.classList.remove('sidebar-mini');
        if (toggler)  toggler.setAttribute('aria-expanded', 'false');
      }
    });
  });
}());
