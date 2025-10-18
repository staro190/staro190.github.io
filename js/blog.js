import {initializeBackground} from "/js/common.js";
// =======================================================================
// 1. 마크다운 파일을 불러와서 HTML로 변환하고 페이지에 삽입하는 부분
// =======================================================================

console.log('running')

// /js/blog.js

// ✅ 1. KaTeX가 준비될 때까지 기다리는 Promise 함수를 추가합니다.
function waitForKatex() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 100; // 약 5초

        const checkKatex = () => {
            if (window.katex && window.katex.renderMathInElement) {
                resolve();
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkKatex, 50);
            } else {
                reject(new Error("KaTeX auto-render script failed to load."));
            }
        };
        checkKatex();
    });
}

async function loadMarkdownPost(markdown) {
    if (!markdown) {
        // ... (오류 처리)
        return;
    }
    try {
        const response = await fetch(markdown);
        if (!response.ok) {
            throw new Error(`마크다운 파일 로드 실패: ${response.statusText}`);
        }
        
        const markdownText = await response.text();
        const postHTML = marked.parse(markdownText);
        const postContentElement = document.getElementById('post-content');
        
        // 1. marked로 변환된 HTML을 페이지에 먼저 삽입합니다.
        postContentElement.innerHTML = postHTML;

        // 2. ✅ 삽입된 HTML 요소 안에서 KaTeX를 실행하여 수식을 렌더링합니다.
        if (window.katex) {
            window.katex.renderMathInElement(postContentElement, {
                // 수식을 감싸는 문자를 지정합니다.
                delimiters: [
                    {left: '$$', right: '$$', display: true},  // 블록 수식 (가운데 정렬)
                    {left: '$', right: '$', display: false}    // 인라인 수식
                ],
                throwOnError: false // 렌더링 오류가 발생해도 중단하지 않음
            });
            console.log("✅ KaTeX 수식 렌더링이 완료되었습니다!");
        }

    } catch (error) {
        console.error(error);
        document.getElementById('post-content').innerText = '글을 불러올 수 없습니다.';
    }
}

// ... (DOMContentLoaded 등 나머지 코드는 기존과 동일)

// =======================================================================
// 3. 전체 코드 실행
// =======================================================================
// 페이지가 로드되면 마크다운을 먼저 불러온 후, 시각화 로직을 설정합니다.
document.addEventListener('DOMContentLoaded', async () => {
    
    // ✅ 2. 다른 모든 로직을 실행하기 전에, KaTeX가 준비될 때까지 기다립니다.
    await waitForKatex();
    
    const params = new URLSearchParams(window.location.search);
    console.log(params)
    // 2. 'markdown' 파라미터의 값을 추출합니다.
    const markdownFilePath = params.get('markdown');

    const filePath = "/blog/algorithm/01.intro/intro.md";

    // 정규식 설명:
    // /blog/ 다음에 나오는 첫 번째 그룹(.*?)과 두 번째 그룹(.*?)을 찾습니다.
    const regex = /\/blog\/(.*?)\/(.*?)\//;

    const match = markdownFilePath.match(regex);

    let title = "";
    if (match && match.length > 2) {
        // 찾은 두 그룹(match[1], match[2])을 '-'로 연결합니다.
        title = `${match[1]}-${match[2]}`;
    }

    console.log(title);

    document.title = title;

    console.log(markdownFilePath)

    // 이후 로직은 동일
    await loadMarkdownPost(markdownFilePath);
    
    // 4. 나머지 초기화 함수를 실행합니다.
    initializeBackground();
    console.log("✅ DOMContentLoaded 이벤트 리스너가 성공적으로 실행되었습니다!");
});