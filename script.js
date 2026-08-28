/**
 * Code-a-Pookalam: Traditional Kerala Floral Carpet
 * HTML5 Canvas Procedural Rendering Engine
 */

(function () {
    const canvas = document.getElementById('pookalamCanvas');
    const ctx = canvas.getContext('2d');

    // Deterministic PRNG for reproducible organic petal scatter
    function createPRNG(seed = 4289) {
        let s = seed;
        return function () {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    }

    let rng = createPRNG(1008);

    // Color Palettes derived from traditional flowers
    const PALETTES = {
        yellow: ['#FFD500', '#FFC107', '#FFB300', '#FFA000', '#FFE082'],
        orange: ['#FF6F00', '#FF8F00', '#F57C00', '#E65100', '#FFAB40'],
        darkRed: ['#800000', '#8E0000', '#9B0000', '#B71C1C', '#660000'],
        brightRed: ['#D32F2F', '#C62828', '#E53935', '#B71C1C', '#FF5252'],
        purple: ['#5B0E2D', '#7B1FA2', '#6A1B9A', '#4A0E35', '#8E24AA', '#380026'],
        white: ['#FFFFFF', '#F5F5F5', '#FAFAFA', '#EEEEEE', '#E0E0E0'],
        green: ['#1B431C', '#113312', '#235625', '#0C240D', '#2E7D32'],
        brass: ['#D4AF37', '#AA7C11', '#FFD700', '#8B6508']
    };

    /**
     * Resize canvas to viewport keeping square aspect ratio & high resolution
     */
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const minDim = Math.min(window.innerWidth * 0.94, window.innerHeight * 0.94);
        
        canvas.width = minDim * dpr;
        canvas.height = minDim * dpr;
        canvas.style.width = `${minDim}px`;
        canvas.style.height = `${minDim}px`;

        ctx.resetTransform();
        ctx.scale(dpr, dpr);
        
        // Reset PRNG on redraw for consistent output
        rng = createPRNG(1008);
        renderPookalam(minDim / 2, minDim / 2, minDim * 0.48);
    }

    /**
     * Helper: Draw an organic teardrop flower petal
     */
    function drawOrganicPetal(cx, cy, length, width, angle, color, alpha = 0.95) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.globalAlpha = alpha;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(width * 0.6, length * 0.4, 0, length);
        ctx.quadraticCurveTo(-width * 0.6, length * 0.4, 0, 0);
        
        ctx.fillStyle = color;
        ctx.fill();

        // Subtle petal vein highlight
        ctx.beginPath();
        ctx.moveTo(0, length * 0.15);
        ctx.lineTo(0, length * 0.75);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = width * 0.12;
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Draw a dense scattered flower petal ring (e.g. Marigold/Jasmine bands)
     */
    function drawTexturedRing(cx, cy, rInner, rOuter, palette, density = 1.0) {
        const ringWidth = rOuter - rInner;
        const midR = (rInner + rOuter) / 2;
        const circumference = 2 * Math.PI * midR;
        const petalCount = Math.floor((circumference * ringWidth * 0.08) * density);

        // Draw solid background band first for rich base color
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
        ctx.arc(cx, cy, rInner, Math.PI * 2, 0, true);
        ctx.fillStyle = palette[0];
        ctx.fill();
        ctx.restore();

        // Overlay thousands of micro-petals
        const petalLen = Math.max(4, ringWidth * 0.45);
        const petalWd = petalLen * 0.55;

        for (let i = 0; i < petalCount; i++) {
            const radius = rInner + rng() * ringWidth;
            const angle = rng() * Math.PI * 2;
            const px = cx + radius * Math.cos(angle);
            const py = cy + radius * Math.sin(angle);
            
            const color = palette[Math.floor(rng() * palette.length)];
            const petalAngle = angle + (rng() - 0.5) * 1.2;

            drawOrganicPetal(px, py, petalLen, petalWd, petalAngle, color, 0.9);
        }
    }

    /**
     * Draw a flower rosette with multiple overlapping petal layers
     */
    function drawFlowerRosette(cx, cy, maxRadius, numPetals, palette) {
        const layers = 5;
        for (let l = layers; l >= 1; l--) {
            const layerRadius = (maxRadius / layers) * l;
            const petalsInLayer = numPetals + (l % 2 === 0 ? 0 : 2);
            const angleStep = (Math.PI * 2) / petalsInLayer;
            const offsetAngle = (l * Math.PI) / numPetals;

            for (let i = 0; i < petalsInLayer; i++) {
                const angle = i * angleStep + offsetAngle;
                const petalLen = layerRadius * 0.95;
                const petalWd = layerRadius * 0.45;
                const color = palette[i % palette.length];

                const px = cx + Math.cos(angle) * (layerRadius * 0.1);
                const py = cy + Math.sin(angle) * (layerRadius * 0.1);

                drawOrganicPetal(px, py, petalLen, petalWd, angle - Math.PI / 2, color, 0.95);
            }
        }
    }

    /**
     * Draw 12-point inner star layer (Yellow + Orange accent fill)
     */
    function drawInnerStarLayer(cx, cy, rInner, rOuter, numPoints) {
        const angleStep = (Math.PI * 2) / numPoints;

        // Base orange fill behind yellow points
        drawTexturedRing(cx, cy, rInner * 0.9, rOuter * 0.85, PALETTES.orange, 1.2);

        // Draw individual yellow star points with dense petals
        for (let i = 0; i < numPoints; i++) {
            const mainAngle = i * angleStep;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(mainAngle);

            // Shape of each star petal tip
            const p1 = { x: rInner * 0.9, y: -rInner * 0.25 };
            const p2 = { x: rOuter, y: 0 };
            const p3 = { x: rInner * 0.9, y: rInner * 0.25 };

            // Fill with yellow petal texture
            for (let t = 0; t <= 1; t += 0.05) {
                const currentR = rInner * 0.9 + t * (rOuter - rInner * 0.9);
                const currentW = (1 - t) * (rInner * 0.25);
                const numScatter = Math.floor(12 * (1 - t * 0.5));

                for (let k = 0; k < numScatter; k++) {
                    const offsetW = (rng() - 0.5) * 2 * currentW;
                    const px = currentR;
                    const py = offsetW;
                    const color = PALETTES.yellow[Math.floor(rng() * PALETTES.yellow.length)];
                    drawOrganicPetal(px, py, rOuter * 0.12, rOuter * 0.06, rng() * Math.PI, color, 0.9);
                }
            }

            ctx.restore();
        }
    }

    /**
     * Draw 12 triangular dark green leaf tips pointing outwards
     */
    function drawLeafTriangles(cx, cy, rBase, rTip, numPoints) {
        const angleStep = (Math.PI * 2) / numPoints;

        for (let i = 0; i < numPoints; i++) {
            const angle = i * angleStep + angleStep / 2;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            // Draw crisp dark green leaf triangle
            ctx.beginPath();
            ctx.moveTo(rBase, -rBase * 0.12);
            ctx.lineTo(rTip, 0);
            ctx.lineTo(rBase, rBase * 0.12);
            ctx.closePath();
            ctx.fillStyle = PALETTES.green[0];
            ctx.fill();

            // Scatter crushed leaf micro-textures inside triangle
            const count = 25;
            for (let j = 0; j < count; j++) {
                const t = rng();
                const rx = rBase + t * (rTip - rBase);
                const ry = (1 - t) * (rng() - 0.5) * rBase * 0.22;
                const color = PALETTES.green[Math.floor(rng() * PALETTES.green.length)];
                
                ctx.beginPath();
                ctx.arc(rx, ry, rBase * 0.025, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            }

            ctx.restore();
        }
    }

    /**
     * Draw White Jasmine Ring with inner red accent dots
     */
    function drawWhiteJasmineRing(cx, cy, rInner, rOuter) {
        drawTexturedRing(cx, cy, rInner, rOuter, PALETTES.white, 1.4);

        // Inner rim red/dark accent dots (12 dots around inner white boundary)
        const count = 12;
        const angleStep = (Math.PI * 2) / count;
        const dotRadius = (rOuter - rInner) * 0.18;

        for (let i = 0; i < count; i++) {
            const angle = i * angleStep;
            const dx = cx + Math.cos(angle) * (rInner + dotRadius * 1.8);
            const dy = cy + Math.sin(angle) * (rInner + dotRadius * 1.8);

            // Red flower dot
            drawFlowerRosette(dx, dy, dotRadius * 1.5, 6, PALETTES.darkRed);
        }
    }

    /**
     * Draw Middle Sector Pattern Layer:
     * Radiating 12 yellow rays & inward dark red/magenta triangular pockets
     */
    function drawMiddleSectorPattern(cx, cy, rInner, rOuter, numSectors) {
        const sectorAngle = (Math.PI * 2) / numSectors;

        for (let i = 0; i < numSectors; i++) {
            const angle = i * sectorAngle;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            // 1. Draw Inward Red/Purple Triangular Motif (between yellow rays)
            const triTipR = rInner * 1.05;
            const triBaseR = rOuter * 0.98;
            const halfSpread = sectorAngle * 0.45;

            // Outer crimson border fill for triangle pocket
            ctx.beginPath();
            ctx.moveTo(triTipR * Math.cos(halfSpread * 0.5), 0);
            ctx.lineTo(triBaseR * Math.cos(halfSpread), triBaseR * Math.sin(halfSpread));
            ctx.lineTo(triBaseR * Math.cos(halfSpread), -triBaseR * Math.sin(halfSpread));
            ctx.closePath();
            ctx.fillStyle = PALETTES.darkRed[0];
            ctx.fill();

            // Scatter dark red petals inside triangle
            const triPetalCount = 60;
            for (let k = 0; k < triPetalCount; k++) {
                const u = rng();
                const v = (rng() - 0.5) * 2 * u * halfSpread;
                const px = triTipR + u * (triBaseR - triTipR);
                const py = px * Math.sin(v);
                const color = PALETTES.darkRed[Math.floor(rng() * PALETTES.darkRed.length)];

                drawOrganicPetal(px, py, (rOuter - rInner) * 0.08, (rOuter - rInner) * 0.04, v, color, 0.9);
            }

            // Purple/Magenta central accent cluster inside the red triangle
            const purpleCenterR = triTipR + (triBaseR - triTipR) * 0.58;
            drawFlowerRosette(purpleCenterR * Math.cos(0), 0, (rOuter - rInner) * 0.16, 8, PALETTES.purple);

            // 2. Draw Yellow/Orange Radiating Rays
            const rayAngleOffset = sectorAngle / 2;
            ctx.rotate(rayAngleOffset);

            // Radiating Yellow Ray
            const rayBaseWidth = (rOuter - rInner) * 0.28;
            const steps = 25;

            for (let s = 0; s < steps; s++) {
                const progress = s / steps;
                const currR = rInner + progress * (rOuter - rInner);
                const widthAtR = (1 - Math.abs(progress - 0.5) * 1.2) * rayBaseWidth;
                const count = Math.floor(10 * (1 - progress * 0.3));

                for (let p = 0; p < count; p++) {
                    const offsetY = (rng() - 0.5) * widthAtR;
                    const color = PALETTES.yellow[Math.floor(rng() * PALETTES.yellow.length)];
                    drawOrganicPetal(currR, offsetY, (rOuter - rInner) * 0.09, (rOuter - rInner) * 0.04, rng() * Math.PI, color, 0.95);
                }
            }

            ctx.restore();
        }
    }

    /**
     * Draw 8 Outer Decorative Flower Mounds (buds attached to perimeter rim)
     */
    function drawOuterFlowerMounds(cx, cy, radius, numMounds) {
        const angleStep = (Math.PI * 2) / numMounds;
        const moundRadius = radius * 0.045;

        for (let i = 0; i < numMounds; i++) {
            const angle = i * angleStep;
            const mx = cx + Math.cos(angle) * radius;
            const my = cy + Math.sin(angle) * radius;

            // Mound base shadow
            ctx.beginPath();
            ctx.arc(mx, my, moundRadius * 1.15, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fill();

            // Green leaf calyx base
            drawFlowerRosette(mx, my, moundRadius * 1.1, 8, PALETTES.green);

            // Layered dark red / maroon flower mound dome
            drawFlowerRosette(mx, my, moundRadius, 10, PALETTES.darkRed);
            drawFlowerRosette(mx, my, moundRadius * 0.65, 8, PALETTES.brightRed);
            drawFlowerRosette(mx, my, moundRadius * 0.35, 6, PALETTES.orange);
        }
    }

    /**
     * Main Render Assembly function
     */
    function renderPookalam(cx, cy, R) {
        // Clear background canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Soft drop shadow beneath whole Pookalam carpet
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 15;
        ctx.fill();
        ctx.restore();

        // Layer 1: Outermost Green Leaf Rim
        drawTexturedRing(cx, cy, R * 0.95, R * 0.98, PALETTES.green, 1.3);

        // Layer 2: Outer Dark Red Flower Ring
        drawTexturedRing(cx, cy, R * 0.90, R * 0.95, PALETTES.darkRed, 1.3);

        // Layer 3: Outer Orange Flower Ring
        drawTexturedRing(cx, cy, R * 0.86, R * 0.90, PALETTES.orange, 1.2);

        // Layer 4: Outer Yellow Flower Ring
        drawTexturedRing(cx, cy, R * 0.82, R * 0.86, PALETTES.yellow, 1.2);

        // Layer 5: Middle Sector Pattern (12 Radial Rays & Inward Red/Purple Triangles)
        drawMiddleSectorPattern(cx, cy, R * 0.52, R * 0.82, 12);

        // Layer 6: White Jasmine Ring
        drawWhiteJasmineRing(cx, cy, R * 0.40, R * 0.52);

        // Layer 7: Dark Green Leaf Triangles (pointing outwards)
        drawLeafTriangles(cx, cy, R * 0.36, R * 0.41, 12);

        // Layer 8: Inner Yellow & Orange Petal Star Layer
        drawInnerStarLayer(cx, cy, R * 0.20, R * 0.38, 12);

        // Layer 9: Purple / Magenta Central Rosette
        drawTexturedRing(cx, cy, R * 0.05, R * 0.20, PALETTES.purple, 1.5);
        drawFlowerRosette(cx, cy, R * 0.22, 12, PALETTES.purple);
        drawFlowerRosette(cx, cy, R * 0.14, 10, PALETTES.magenta || PALETTES.purple);

        // Layer 10: Center Polished Brass Accent Node
        const brassR = R * 0.035;
        const grad = ctx.createRadialGradient(cx - brassR * 0.3, cy - brassR * 0.3, brassR * 0.1, cx, cy, brassR);
        grad.addColorStop(0, '#FFE57F');
        grad.addColorStop(0.5, '#D4AF37');
        grad.addColorStop(1, '#6D4C41');

        ctx.beginPath();
        ctx.arc(cx, cy, brassR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, brassR * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#3E2723';
        ctx.fill();

        // Layer 11: 8 Outer Decorative Flower Mounds on Perimeter Rim
        drawOuterFlowerMounds(cx, cy, R * 0.965, 8);
    }

    // Initialize and listen for window resizing
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
})();
