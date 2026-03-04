document.addEventListener('DOMContentLoaded', () => {

    /* ── Smooth scroll ────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    /* ── Fade-in on scroll ────────────────────────── */
    const fadeObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('fade-in-visible');
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('section').forEach(s => {
        s.classList.add('fade-in');
        fadeObserver.observe(s);
    });

    /* ── Scroll Progress (silk thread) ───────────── */
    const progressFill   = document.getElementById('scroll-progress-fill');
    const progressSpider = document.getElementById('scroll-progress-spider');

    function updateScrollProgress() {
        const scrolled  = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const pct       = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;

        if (progressFill)   progressFill.style.height = pct + '%';
        if (progressSpider) progressSpider.style.top  = pct + 'vh';
    }

    /* ── Scroll-Spy nav active state ──────────────── */
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const spySections = ['about', 'tech-stack', 'projects', 'experience', 'contact']
        .map(id => document.getElementById(id))
        .filter(Boolean);

    function updateActiveNav() {
        const mid = window.scrollY + window.innerHeight * 0.45;
        let current = null;
        spySections.forEach(sec => {
            if (sec.offsetTop <= mid) current = sec.id;
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === current);
        });
    }

    window.addEventListener('scroll', () => {
        updateScrollProgress();
        updateActiveNav();
    }, { passive: true });

    updateScrollProgress();
    updateActiveNav();

    /* ── Custom Cursor ────────────────────────────── */
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    let mouseX = -200, mouseY = -200;
    let ringX  = -200, ringY  = -200;

    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (dot) { dot.style.left = mouseX + 'px'; dot.style.top = mouseY + 'px'; }
    });

    /* Ring lags behind with smooth lerp */
    (function animateRing() {
        ringX += (mouseX - ringX) * 0.13;
        ringY += (mouseY - ringY) * 0.13;
        if (ring) { ring.style.left = ringX + 'px'; ring.style.top = ringY + 'px'; }
        requestAnimationFrame(animateRing);
    })();

    /* Expand on interactive elements */
    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => { dot?.classList.add('cursor-hover');  ring?.classList.add('cursor-hover'); });
        el.addEventListener('mouseleave', () => { dot?.classList.remove('cursor-hover'); ring?.classList.remove('cursor-hover'); });
    });

    /* ── Mobile Menu ──────────────────────────────── */
    const menuBtn   = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-menu');
    const closeBtn  = document.getElementById('mobile-menu-close');

    const openMenu  = () => { mobileNav?.classList.add('open');  document.body.style.overflow = 'hidden'; };
    const closeMenu = () => { mobileNav?.classList.remove('open'); document.body.style.overflow = ''; };

    menuBtn?.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);
    mobileNav?.querySelectorAll('.mobile-nav-link').forEach(l => l.addEventListener('click', closeMenu));

    /* ── Hero typing effect ───────────────────────── */
    const subtitleEl = document.getElementById('hero-subtitle');
    if (subtitleEl) {
        const text = subtitleEl.textContent.trim();
        subtitleEl.textContent = '';
        let i = 0;
        const TYPE_DELAY = 1200; // ms before typing starts
        setTimeout(() => {
            const timer = setInterval(() => {
                subtitleEl.textContent = text.slice(0, ++i);
                if (i >= text.length) clearInterval(timer);
            }, 45);
        }, TYPE_DELAY);
    }

});
