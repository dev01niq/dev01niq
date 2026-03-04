/**
 * Spider Web Hero Canvas Animation
 * – Radial web (spokes + rings) that weaves in from centre on load
 * – Floating network nodes that repel from the mouse
 * – Slow organic rotation + breathing
 */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-animation-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, raf;
    const mouse = { x: -9999, y: -9999 };
    let buildProgress = 0; // 0 → 1 build-in
    let webAngle = 0;      // slow rotation
    let nodes = [];

    const C = '0, 255, 255';   // CYAN rgb channels
    const CFG = {
        spokes:      12,
        rings:        8,
        nodeCount:   58,
        connectDist: 155,
        mouseRepel:  120,
    };

    /* ── Resize ──────────────────────────────────── */
    function resize() {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
        spawnNodes();
    }

    function spawnNodes() {
        nodes = Array.from({ length: CFG.nodeCount }, () => ({
            x:     Math.random() * W,
            y:     Math.random() * H,
            vx:    (Math.random() - 0.5) * 0.5,
            vy:    (Math.random() - 0.5) * 0.5,
            r:     1.2 + Math.random() * 1.8,
            phase: Math.random() * Math.PI * 2,
        }));
    }

    /* ── Spider Web ──────────────────────────────── */
    function drawWeb() {
        const cx   = W * 0.5;
        const cy   = H * 0.44;
        const maxR = Math.min(W, H) * 0.47;
        const bp   = buildProgress;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(webAngle);

        /* Spokes */
        for (let s = 0; s < CFG.spokes; s++) {
            const a = (s / CFG.spokes) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * maxR, Math.sin(a) * maxR);
            ctx.strokeStyle = `rgba(${C}, ${0.1 * bp})`;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
        }

        /* Rings – build outward progressively */
        for (let ring = 1; ring <= CFG.rings; ring++) {
            const rp = Math.max(0, Math.min(1,
                bp * (CFG.rings + 1) - (ring - 1)
            ));
            if (rp <= 0) continue;

            const rr    = (ring / CFG.rings) * maxR;
            const alpha = (0.06 + (1 - ring / CFG.rings) * 0.1) * bp;

            ctx.beginPath();
            for (let s = 0; s <= CFG.spokes; s++) {
                const a      = (s / CFG.spokes) * Math.PI * 2;
                const wobble = 1 + Math.sin(a * 2.5 + ring * 1.3) * 0.04;
                const x      = Math.cos(a) * rr * wobble;
                const y      = Math.sin(a) * rr * wobble;
                s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.strokeStyle = `rgba(${C}, ${alpha})`;
            ctx.lineWidth   = 0.4 + (1 - ring / CFG.rings) * 0.5;
            ctx.stroke();
        }

        /* Centre orb */
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 50);
        grd.addColorStop(0, `rgba(${C}, ${0.28 * bp})`);
        grd.addColorStop(1, `rgba(${C}, 0)`);
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.restore();
    }

    /* ── Floating Network ────────────────────────── */
    function drawNetwork() {
        const t = Date.now() * 0.001;

        /* Connections */
        for (let i = 0; i < nodes.length - 1; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a  = nodes[i], b = nodes[j];
                const dx = a.x - b.x,  dy = a.y - b.y;
                const d  = Math.hypot(dx, dy);
                if (d >= CFG.connectDist) continue;

                const midX  = (a.x + b.x) / 2 - mouse.x;
                const midY  = (a.y + b.y) / 2 - mouse.y;
                const md    = Math.hypot(midX, midY);
                const boost = md < CFG.mouseRepel
                    ? (1 - md / CFG.mouseRepel) * 0.55 : 0;

                const base = 1 - d / CFG.connectDist;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = `rgba(${C}, ${(base * 0.28 + boost) * buildProgress})`;
                ctx.lineWidth   = base;
                ctx.stroke();
            }
        }

        /* Nodes */
        nodes.forEach(n => {
            const dx   = n.x - mouse.x,  dy = n.y - mouse.y;
            const md   = Math.hypot(dx, dy);
            const prox = md < CFG.mouseRepel ? 1 - md / CFG.mouseRepel : 0;
            const pulse = 0.5 + 0.5 * Math.sin(t * 1.8 + n.phase);

            if (prox > 0.05) {
                const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 9 * prox);
                g.addColorStop(0, `rgba(${C}, ${0.35 * prox})`);
                g.addColorStop(1, `rgba(${C}, 0)`);
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * 9 * prox, 0, Math.PI * 2);
                ctx.fillStyle = g;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r + pulse * 0.5 + prox * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${C}, ${(0.25 + pulse * 0.25 + prox * 0.5) * buildProgress})`;
            ctx.fill();
        });
    }

    /* ── Physics ─────────────────────────────────── */
    function tick() {
        nodes.forEach(n => {
            const dx = n.x - mouse.x, dy = n.y - mouse.y;
            const d  = Math.hypot(dx, dy);
            if (d < CFG.mouseRepel && d > 1) {
                const f = (CFG.mouseRepel - d) / CFG.mouseRepel;
                n.vx += (dx / d) * f * 1.4;
                n.vy += (dy / d) * f * 1.4;
            }
            n.vx *= 0.976; n.vy *= 0.976;
            const spd = Math.hypot(n.vx, n.vy);
            if (spd > 2) { n.vx = (n.vx / spd) * 2; n.vy = (n.vy / spd) * 2; }
            n.x += n.vx; n.y += n.vy;

            /* Toroidal wrap */
            if (n.x < -10)  n.x = W + 10;
            if (n.x > W+10) n.x = -10;
            if (n.y < -10)  n.y = H + 10;
            if (n.y > H+10) n.y = -10;
        });
    }

    /* ── Main Loop ───────────────────────────────── */
    function loop() {
        ctx.clearRect(0, 0, W, H);
        buildProgress = Math.min(1, buildProgress + 0.007);
        webAngle     += 0.00022;
        drawWeb();
        tick();
        drawNetwork();
        raf = requestAnimationFrame(loop);
    }

    /* ── Events ──────────────────────────────────── */
    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = -9999; mouse.y = -9999;
    });

    window.addEventListener('resize', () => {
        cancelAnimationFrame(raf);
        resize();
        buildProgress = 0;
        loop();
    });

    resize();
    loop();
});
