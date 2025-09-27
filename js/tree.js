// 리스너를 제거하고, initializeTree 함수를 바로 호출합니다.
initializeTree();

// JSON 데이터를 가져와서 트리를 생성하는 메인 함수
async function initializeTree() {
    try {
        // voyage.html 기준 경로입니다.
        const response = await fetch('../data/contents.json'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const treeContainer = document.getElementById('planet-list');
        
        if (treeContainer && data) {
            createTree(data, treeContainer);
            console.log("🌳 tree.js: 트리 생성을 완료했습니다!");
        } else {
            console.error("tree.js: 'planet-list' 컨테이너를 찾지 못했거나 데이터가 없습니다.");
        }
    } catch (error) {
        console.error("tree.js: 트리 데이터를 불러오거나 생성하는 데 실패했습니다:", error);
    }
}

/**
 * JSON 데이터로 트리를 생성하는 재귀 함수
 * @param {Array} nodes - 메뉴 항목 객체의 배열
 * @param {HTMLElement} parentElement - 이 노드들이 추가될 부모 요소 (ul)
 */
function createTree(nodes, parentElement) {
    nodes.forEach(node => {
        const listItem = document.createElement('li');

        if (node.href) {
            const link = document.createElement('a');
            link.href = node.href;
            link.textContent = node.title;
            listItem.appendChild(link);
        } 
        else if (node.isCategory) {
            const categorySpan = document.createElement('span');
            categorySpan.className = 'category';
            categorySpan.textContent = node.title;
            listItem.appendChild(categorySpan);
        }

        if (node.children && node.children.length > 0) {
            const subList = document.createElement('ul');
            createTree(node.children, subList);
            listItem.appendChild(subList);
        }

        parentElement.appendChild(listItem);
    });
}