// /js/vis_slideshow.js

// Slideshow 클래스 (슬라이드 쇼의 엔진 역할)
class Slideshow {
    // 이전과 동일한 Slideshow 클래스 코드를 여기에 둡니다.
    #container; #images; #duration; #transitionSpeed; #currentIndex=0; #intervalId=null; #dom={};
    constructor(c,o){this.#container=c;this.#images=o.images;this.#duration=o.duration||3e3;this.#transitionSpeed=o.transitionSpeed||1e3;this.#setupDOM();this.#attachEventListeners()}
    #setupDOM(){this.#container.innerHTML=`<div class=slideshow-wrapper><img class=slideshow-image alt="Slideshow Image"><button class="slideshow-control prev">&lt;</button><button class="slideshow-control next">&gt;</button></div>`;const s=document.createElement("style");s.textContent=`.slideshow-wrapper{position:relative;width:100%;height:100%;overflow:hidden}.slideshow-image{width:100%;height:100%;object-fit:cover;opacity:1;transition:opacity ${this.#transitionSpeed}ms ease-in-out}.slideshow-image.fade-out{opacity:0}.slideshow-control{position:absolute;top:50%;transform:translateY(-50%);background-color:rgba(0,0,0,.5);color:#fff;border:none;font-size:24px;padding:10px 15px;cursor:pointer;opacity:.7;transition:opacity .2s}.slideshow-control:hover{opacity:1}.slideshow-control.prev{left:10px}.slideshow-control.next{right:10px}`;this.#container.appendChild(s);this.#dom.image=this.#container.querySelector(".slideshow-image");this.#dom.prevBtn=this.#container.querySelector(".slideshow-control.prev");this.#dom.nextBtn=this.#container.querySelector(".slideshow-control.next");this.#dom.image.src=this.#images[this.#currentIndex]}
    #attachEventListeners(){this.#dom.prevBtn.addEventListener("click",()=>this.prev());this.#dom.nextBtn.addEventListener("click",()=>this.next())}
    #changeImage(){this.#dom.image.classList.add("fade-out");setTimeout(()=>{this.#currentIndex=(this.#currentIndex+1)%this.#images.length;this.#dom.image.src=this.#images[this.#currentIndex];this.#dom.image.classList.remove("fade-out")},this.#transitionSpeed/2)}
    start(){if(this.#intervalId)this.stop();this.#intervalId=setInterval(()=>this.#changeImage(),this.#duration)}
    stop(){clearInterval(this.#intervalId);this.#intervalId=null}
    next(){this.stop();this.#changeImage();this.start()}
    prev(){this.stop();this.#dom.image.classList.add("fade-out");setTimeout(()=>{this.#currentIndex=(this.#currentIndex-1+this.#images.length)%this.#images.length;this.#dom.image.src=this.#images[this.#currentIndex];this.#dom.image.classList.remove("fade-out")},this.#transitionSpeed/2);this.start()}
}


/**
 * blog.js가 호출하는 초기화 함수
 * @param {string} folderPath - 'frame#.png' 이미지들이 들어있는 폴더 경로
 */
export async function initialize(folderPath) {
    const container = document.querySelector('.slideshow-container');
    if (!container) return;

    // 1. 'frame#.png' 규칙에 따라 이미지 목록을 동적으로 생성합니다.
    const imageList = [];
    let index = 1;
    while (true) {
        const imageUrl = `${folderPath}/frame${index}.png`;
        try {
            // HEAD 요청으로 파일 존재 여부만 빠르게 확인합니다.
            const response = await fetch(imageUrl, { method: 'HEAD' });
            if (response.ok) {
                imageList.push(imageUrl);
                index++;
            } else {
                // 파일이 없으면 (404 등) 반복을 중단합니다.
                break;
            }
        } catch (error) {
            // 네트워크 오류 등이 발생하면 중단합니다.
            break;
        }
    }

    if (imageList.length === 0) {
        console.error(`'${folderPath}' 폴더에서 'frame#.png' 형식의 이미지를 찾을 수 없습니다.`);
        return;
    }

    // 2. 찾아낸 이미지 목록으로 슬라이드 쇼를 생성하고 시작합니다.
    new Slideshow(container, {
        images: imageList,
        duration: parseInt(container.dataset.duration) || 3000
    }).start();
}