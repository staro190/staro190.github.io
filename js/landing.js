// DOM이 모두 로드되면 스크립트를 실행합니다.
document.addEventListener('DOMContentLoaded', () => {
    initializeBackgroundParticles();
    initializeOrbitAnimation();
});

// 1. 배경 파티클 애니메이션 초기화 함수
function initializeBackgroundParticles() {
    const bgCanvas = document.getElementById('bg');
    if (!bgCanvas) return;

    const bgCtx = bgCanvas.getContext('2d');
    let particles = [];

    function initCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
        initParticles();
    }

    function initParticles() {
        particles = [];
        const particleCount = 80;
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * bgCanvas.width,
                y: Math.random() * bgCanvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            });
        }
    }

    function drawParticles() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        bgCtx.fillStyle = "#00d4ff";
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = bgCanvas.width;
            if (p.x > bgCanvas.width) p.x = 0;
            if (p.y < 0) p.y = bgCanvas.height;
            if (p.y > bgCanvas.height) p.y = 0;

            bgCtx.beginPath();
            bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            bgCtx.fill();
        });
        requestAnimationFrame(drawParticles);
    }

    window.addEventListener('resize', initCanvas);
    initCanvas();
    drawParticles();
}

// 2. 하단 궤도 애니메이션 초기화 함수
function initializeOrbitAnimation() {
    const orbitCanvas = document.getElementById('orbitCanvas');
    if (!orbitCanvas) return;

    const oCtx = orbitCanvas.getContext('2d');
    let centerX, centerY;
    let mouseX = -1000, mouseY = -1000;
    let isPaused = false;
    const colors = ['rgba(0, 100, 150, 0.7)', 'rgba(150, 50, 150, 0.7)', 'rgba(180, 140, 0, 0.7)'];

    // JSON 파일에서 궤도 데이터를 비동기로 불러옵니다.
    fetch('./data/orbits.json')
        .then(response => response.json())
        .then(orbitsData => {
            // 이미지 객체 로딩 및 초기 설정
            orbitsData.forEach(o => {
                const img = new Image();
                img.src = o.icon;
                o.imageObj = img;
            });
            
            setupEventListeners(orbitsData);
            resizeOrbitCanvas(); // 리사이즈 함수 호출 위치 변경
            drawOrbit(orbitsData);
        });

    function drawOrbit(orbits) {
        oCtx.clearRect(0, 0, orbitCanvas.width, orbitCanvas.height);

        orbits.forEach((o, i) => {
            // 궤도 원
            oCtx.beginPath();
            oCtx.strokeStyle = 'rgba(255,255,255,0.2)';
            oCtx.arc(centerX, centerY, o.radius, 0, Math.PI * 2);
            oCtx.stroke();

            const x = centerX + o.radius * Math.cos(o.angle);
            const y = centerY + o.radius * Math.sin(o.angle);

            // 행성(점)
            oCtx.shadowColor = colors[i % colors.length];
            oCtx.shadowBlur = 15;
            oCtx.beginPath();
            oCtx.arc(x, y, 20, 0, Math.PI * 2);
            oCtx.fillStyle = colors[i % colors.length];
            oCtx.fill();
            oCtx.shadowColor = 'transparent';
            oCtx.shadowBlur = 0;

            // 아이콘
            let iconSize = 25;
            const distance = Math.hypot(mouseX - x, mouseY - y);
            if (distance < 32) {
                iconSize = 38;
                oCtx.shadowColor = '#fff';
                oCtx.shadowBlur = 10;
            }
            oCtx.drawImage(o.imageObj, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
            oCtx.shadowColor = 'transparent';
            oCtx.shadowBlur = 0;

            if (!isPaused) o.angle += o.speed;
        });

        requestAnimationFrame(() => drawOrbit(orbits));
    }

    function setupEventListeners(orbits) {
        orbitCanvas.addEventListener('mousemove', e => {
            const rect = orbitCanvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        orbitCanvas.addEventListener('mouseenter', () => { isPaused = true; });
        orbitCanvas.addEventListener('mouseleave', () => {
            isPaused = false;
            mouseX = -1000;
            mouseY = -1000;
        });

        orbitCanvas.addEventListener('click', e => {
            const rect = orbitCanvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            orbits.forEach(o => {
                const x = centerX + o.radius * Math.cos(o.angle);
                const y = centerY + o.radius * Math.sin(o.angle);
                if (Math.hypot(clickX - x, clickY - y) < 24) {
                    window.location.href = o.link;
                }
            });
        });

        window.addEventListener('resize', resizeOrbitCanvas);
    }
    
    function resizeOrbitCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = 450;
        const canvasHeight = 450;
        const canvasBottom = 100;

        orbitCanvas.width = canvasWidth * dpr;
        orbitCanvas.height = canvasHeight * dpr;
        orbitCanvas.style.width = canvasWidth + 'px';
        orbitCanvas.style.height = canvasHeight + 'px';
        orbitCanvas.style.bottom = canvasBottom + 'px';
        orbitCanvas.style.left = '50%';
        orbitCanvas.style.transform = 'translateX(-50%)';

        oCtx.setTransform(1, 0, 0, 1, 0, 0);
        oCtx.scale(dpr, dpr);

        centerX = canvasWidth / 2;
        centerY = canvasHeight / 2;
    }
}