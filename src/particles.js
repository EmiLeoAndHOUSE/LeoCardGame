/* ==========================================================================
   L.L. CARD GAME - SISTEMA PARTICELLARE (CANVAS FX A PROVA DI ERRORE)
   ========================================================================== */

class ParticleSystem {
    constructor(canvasTarget) {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];

        try {
            if (typeof canvasTarget === 'string') {
                this.canvas = document.getElementById(canvasTarget);
            } else {
                this.canvas = canvasTarget;
            }

            if (!this.canvas) {
                this.canvas = document.getElementById('fx-canvas');
            }

            if (this.canvas) {
                this.ctx = this.canvas.getContext('2d');
                this.resize();
                window.addEventListener('resize', () => this.resize());
                this.animate();
            }
        } catch (e) {
            console.warn("ParticleSystem non attivo su questa piattaforma:", e);
        }
    }

    resize() {
        if (!this.canvas) return;
        try {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        } catch (e) {}
    }

    emit(x, y, color = '#ffb800', count = 20, speedMultiplier = 1) {
        if (!this.canvas || !this.ctx) return;
        try {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = (Math.random() * 4 + 1) * speedMultiplier;
                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: Math.random() * 4 + 2,
                    color: color,
                    alpha: 1,
                    decay: Math.random() * 0.03 + 0.015
                });
            }
        } catch (e) {}
    }

    createBurst(x, y, color = '#ff4757') {
        this.emit(x, y, color, 30, 1.5);
    }

    emitConfetti() {
        if (!this.canvas || !this.ctx) return;
        try {
            const colors = ['#ffb800', '#00d2ff', '#ff4757', '#2ed573', '#aa00ff'];
            for (let i = 0; i < 60; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: -10,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * 4 + 2,
                    size: Math.random() * 6 + 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 1,
                    decay: Math.random() * 0.008 + 0.004
                });
            }
        } catch (e) {}
    }

    startConfetti() {
        this.emitConfetti();
    }

    animate() {
        if (this.ctx && this.canvas) {
            try {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const p = this.particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.alpha -= p.decay;

                    if (p.alpha <= 0) {
                        this.particles.splice(i, 1);
                        continue;
                    }

                    this.ctx.save();
                    this.ctx.globalAlpha = p.alpha;
                    this.ctx.fillStyle = p.color;
                    this.ctx.shadowColor = p.color;
                    this.ctx.shadowBlur = 10;
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.restore();
                }
            } catch (e) {}
        }

        requestAnimationFrame(() => this.animate());
    }
}
