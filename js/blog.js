import {initializeBackground} from "/js/common.js";
// =======================================================================
// 1. 마크다운 파일을 불러와서 HTML로 변환하고 페이지에 삽입하는 부분
// =======================================================================

console.log('running')

async function loadMarkdownPost(markdown) {
    try {
        console.log(markdown)
        const response = await fetch(markdown);
        if (!response.ok) throw new Error('마크다운 파일을 불러오는 데 실패했습니다.');
        
        const markdownText = await response.text();
        const postHTML = marked.parse(markdownText);
        document.getElementById('post-content').innerHTML = postHTML;

    } catch (error) {
        console.error(error);
        document.getElementById('post-content').innerText = '글을 불러올 수 없습니다.';
    }
}

// =======================================================================
// 3. 전체 코드 실행
// =======================================================================
// 페이지가 로드되면 마크다운을 먼저 불러온 후, 시각화 로직을 설정합니다.
document.addEventListener('DOMContentLoaded', async () => {
    
    const params = new URLSearchParams(window.location.search);
    console.log(params)
    // 2. 'markdown' 파라미터의 값을 추출합니다.
    const markdownFilePath = params.get('markdown');
    console.log(markdownFilePath)

    // 이후 로직은 동일
    await loadMarkdownPost(markdownFilePath);
    
    // 4. 나머지 초기화 함수를 실행합니다.
    initializeBackground();
    console.log("✅ DOMContentLoaded 이벤트 리스너가 성공적으로 실행되었습니다!");
});