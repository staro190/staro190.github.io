import { initializeBackground } from "/js/common.js";
import { initializeExplorer } from "/js/explorer.js";
import { setupPlanetSortVisualization} from "/js/vis_solarsort.js";
import { initialize as initializeSlideshow } from '/js/vis_slideshow.js';

async function loadMarkdownPost(markdownPath) {
    if (!markdownPath) {
        // ... (오류 처리)
        return;
    }
    try {
        const response = await fetch(markdownPath);
        if (!response.ok) {
            throw new Error(`마크다운 파일 로드 실패: ${response.statusText}`);
        }
        
        const markdownText = await response.text();

        // ✨ 1. 마크다운 파일의 디렉토리 경로를 추출합니다.
        // 예: /blog/post/a/a.md -> /blog/post/a/
        const postpath = markdownPath.substring(0, markdownPath.lastIndexOf('/')+1);

        // ✨ 2. [핵심] 정규식을 사용해 마크다운 텍스트 안의 모든 상대 이미지 경로를 절대 경로로 직접 변환합니다.
        // http, https, / 로 시작하지 않는 이미지 경로만 찾습니다.
        const relativeImagePathRegex = /!\[(.*?)\]\((?!https?:\/\/|\/)(.*?)\)/g;
        const processedMarkdown = markdownText.replace(
            relativeImagePathRegex,
            `![$1](${postpath}$2)`
        );
        
        // ✨ 2. marked.parse에 baseUrl 옵션을 추가하여 이미지의 기준 경로를 알려줍니다.
        const postHTML = marked.parse(processedMarkdown, { baseUrl: postpath });
        const postContentElement = document.getElementById('post-content');
        
        // 1. marked로 변환된 HTML을 페이지에 먼저 삽입합니다.
        postContentElement.innerHTML = postHTML;

        // 2. ✅ 삽입된 HTML 요소 안에서 KaTeX를 실행하여 수식을 렌더링합니다.
        if (window.katex) {
            window.renderMathInElement(postContentElement, {
                // 수식을 감싸는 문자를 지정합니다.
                delimiters: [
                    {left: '$$', right: '$$', display: true},  // 블록 수식 (가운데 정렬)
                    {left: '$', right: '$', display: false}    // 인라인 수식
                ],
                throwOnError: false // 렌더링 오류가 발생해도 중단하지 않음
            });
            console.log("✅ KaTeX 수식 렌더링이 완료되었습니다!");
        }

        // ✅ 3. Prism.js 실행하여 모든 코드 블록 하이라이팅
        if (window.Prism) {
            window.Prism.highlightAll();
            console.log("✅ Prism.js 코드 하이라이팅 완료!");
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
    
    initializeExplorer();
    initializeBackground();

    // 1. URL에서 '?post=폴더명' 형식의 파라미터를 읽습니다.
    const params = new URLSearchParams(window.location.search);
    const postFolder = params.get('post');

    if (!postFolder) {
        console.error("URL에 '?post=' 파라미터가 없습니다.");
        document.getElementById('post-content').innerText = '포스트를 지정해주세요.';
        return;
    }

    // 2. 포스트 폴더 경로를 기반으로 meta.json 파일의 경로를 만듭니다.
    //    (실제 프로젝트의 폴더 구조에 맞게 경로를 조정해야 할 수 있습니다.)
    const metaPath = `${postFolder}/meta.json`;

    try {
        // 3. meta.json 파일을 fetch 합니다.
        const metaResponse = await fetch(metaPath);
        if (!metaResponse.ok) throw new Error(`${metaPath} 파일을 찾을 수 없습니다.`);
        const meta = await metaResponse.json();

        // 4. meta 정보로 페이지 제목을 설정합니다.
        document.title = meta.title;

        // 5. meta 정보에 있는 마크다운 파일을 로드합니다.
        const markdownPath = `${postFolder}/${meta.markdownFile}`;
        await loadMarkdownPost(markdownPath);

        // 6. meta 정보에 시각화 스크립트 정보가 있다면 동적으로 import 합니다.
        if (meta.visualizationScript) {
            const modulePath = `${postFolder}/${meta.visualizationScript}`;
            const module = await import(modulePath);
            const algorithmGenerator = Object.values(module)[0];

            if (algorithmGenerator) {
                setupPlanetSortVisualization(algorithmGenerator);
            }
        }

        if (meta.slideshow) {
            // 1. 이미지들이 있는 폴더의 전체 경로를 만듭니다.
            const imageFolderPath = `${postFolder}/${meta.slideshow}`;
            
            // 2. import한 초기화 함수에 경로를 전달하여 실행합니다.
            initializeSlideshow(imageFolderPath);
        }

    } catch (error) {
        console.error("포스트를 불러오는 데 실패했습니다:", error);
        document.getElementById('post-content').innerText = '포스트를 불러오는 중 오류가 발생했습니다.';
    }
    console.log("✅ DOMContentLoaded 이벤트 리스너가 성공적으로 실행되었습니다!");
});