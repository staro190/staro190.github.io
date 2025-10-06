// 배경 별 애니메이션 기능
export function initializeBackground() {
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