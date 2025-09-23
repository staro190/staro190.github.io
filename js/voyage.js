document.addEventListener('DOMContentLoaded', () => {
    // 1. 공유 익스플로러를 불러오고, 기능(토글, 활성 링크)을 설정
    loadExplorer().then(() => {
        setupExplorerToggle();
        highlightCurrentPageLink();
    });

    // 2. index.html에만 있는 행성 선택 인터랙션 기능을 실행
    if (document.getElementById('planet-image')) {
        initializePlanetSelector();
    }
    
    // 3. 배경 별 애니메이션은 모든 페이지에서 실행
    initializeBackground();
});

// 공유 익스플로러(explorer.html)를 불러와 페이지에 삽입하는 함수
async function loadExplorer() {
    const placeholder = document.getElementById('explorer-placeholder');
    if (!placeholder) return;

    try {
        const response = await fetch('../page/explorer.html');
        const explorerHTML = await response.text();
        placeholder.innerHTML = explorerHTML;
    } catch (error) {
        console.error('Explorer를 불러오는 데 실패했습니다:', error);
    }
}

// 익스플로러 토글 버튼 기능 설정
function setupExplorerToggle() {
    const panel = document.getElementById('explorer-panel');
    const toggleButton = document.getElementById('explorer-toggle');
    if (!panel || !toggleButton) return;

    toggleButton.addEventListener('click', () => {
        panel.classList.toggle('collapsed');
        toggleButton.classList.toggle('collapsed');
    });
}

// 현재 페이지 URL을 기반으로 익스플로러의 해당 링크를 활성화
function highlightCurrentPageLink() {
    const links = document.querySelectorAll('#planet-list a');
    const currentPagePath = window.location.pathname;

    links.forEach(link => {
        if (link.pathname === currentPagePath || (currentPagePath === '/' && link.pathname === '/index.html')) {
            link.classList.add('active');
        }
    });
}

// 🚨🚨🚨 오류가 발생했던 부분 수정 🚨🚨🚨
// 행성 선택 관련 기능 (익스플로러 관련 코드 완전 제거)
function initializePlanetSelector() {
    const planetImageEl = document.getElementById('planet-image');
    const planetNameEl = document.getElementById('selected-planet-name');
    const warpButton = document.getElementById('warp-button');

    let planets = [];
    let selectedIndex = 0;

    fetch('../data/planets.json')
        .then(response => response.json())
        .then(data => {
            planets = data;
            updateSelection(true); 
        });

    function updateSelection(isInitial = false) {
        if (planets.length === 0) return;
        const selectedPlanet = planets[selectedIndex];

        if (!isInitial) {
             planetImageEl.style.opacity = 0;
        }
       
        setTimeout(() => {
            planetImageEl.src = selectedPlanet.imgSrc;
            planetNameEl.textContent = selectedPlanet.name;
            warpButton.onclick = () => { window.location.href = selectedPlanet.link; };
            planetImageEl.style.opacity = 1;
        }, isInitial ? 0 : 300);

        // ❌ 익스플로러와 연동하는 코드가 여기서 완전히 삭제되었습니다.
    }

    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY > 0) {
            selectedIndex = (selectedIndex + 1) % planets.length;
        } else {
            selectedIndex = (selectedIndex - 1 + planets.length) % planets.length;
        }
        updateSelection();
    }, { passive: false });
}

// 배경 별 애니메이션 기능 (기존과 동일)
function initializeBackground() {
    const bgCanvas = document.getElementById('bg');
    if(!bgCanvas) return;
    const bgCtx = bgCanvas.getContext('2d');
    let particles = [];
    function initBgCanvas(){ bgCanvas.width = window.innerWidth; bgCanvas.height = window.innerHeight; initParticles(); }
    function initParticles(){
        particles = []; const particleCount = 100;
        for(let i=0; i<particleCount; i++){ particles.push({ x: Math.random()*bgCanvas.width, y: Math.random()*bgCanvas.height, vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3, size: Math.random()*1.5+0.5 }); }
    }
    function drawParticles(){
        bgCtx.clearRect(0,0,bgCanvas.width,bgCanvas.height); 
        bgCtx.fillStyle = "#00d4ff";
        particles.forEach(p=>{
            p.x+=p.vx; p.y+=p.vy;
            if(p.x<0)p.x=bgCanvas.width; if(p.x>bgCanvas.width)p.x=0; if(p.y<0)p.y=bgCanvas.height; if(p.y>bgCanvas.height)p.y=0;
            bgCtx.beginPath(); bgCtx.arc(p.x, p.y, p.size, 0, Math.PI*2); bgCtx.fill();
        }); requestAnimationFrame(drawParticles);
    }
    window.addEventListener('resize', initBgCanvas); initBgCanvas(); drawParticles();
}