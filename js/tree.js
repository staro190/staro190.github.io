/**
 * @file tree.js
 * @description contents.json 데이터를 기반으로 중첩 가능한 트리 메뉴를 생성하고,
 * 모든 카테고리의 토글(열기/닫기) 기능을 관리합니다.
 */

/**
 * JSON 데이터를 가져와 트리를 생성하고 이벤트 리스너를 설정하는 메인 함수.
 * 이 함수는 explorer.js에서 import하여 호출합니다.
 */
export async function initializeTree() {
    try {
        // 1. JSON 데이터 불러오기
        const response = await fetch('../data/contents.json'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const treeContainer = document.getElementById('planet-list');
        
        if (treeContainer && data) {
            // 2. JSON 데이터로 HTML 트리 구조 생성하기
            createTree(data, treeContainer);
            
            // 3. 생성된 모든 카테고리에 토글(열기/닫기) 기능 추가하기
            addCategoryToggleListeners();

            console.log("🌳 tree.js: 모든 중첩 트리를 성공적으로 생성했습니다!");
        } else {
            console.error("tree.js: '#planet-list' 컨테이너를 찾지 못했거나 데이터가 없습니다.");
        }
    } catch (error) {
        console.error("tree.js: 트리 데이터를 불러오거나 생성하는 데 실패했습니다:", error);
    }
}

/**
 * JSON 데이터(nodes)를 기반으로 HTML 리스트(ul, li)를 재귀적으로 생성하는 함수.
 * @param {Array} nodes - 메뉴 항목 객체의 배열
 * @param {HTMLElement} parentElement - 생성된 항목들이 추가될 부모 HTML 요소 (ul)
 */
function createTree(nodes, parentElement) {
    nodes.forEach(node => {
        const listItem = document.createElement('li');

        // node.isCategory가 true이면 <span> 태그를, href가 있으면 <a> 태그를 생성
        if (node.isCategory) {
            const categorySpan = document.createElement('span');
            categorySpan.textContent = node.title;
            listItem.appendChild(categorySpan);
        } else if (node.href) {
            const link = document.createElement('a');
            link.href = node.href;
            link.textContent = node.title;
            listItem.appendChild(link);
        }

        // node.children 배열이 있으면 하위 리스트(<ul>)를 만들고, 재귀적으로 createTree 함수 호출
        if (node.children && node.children.length > 0) {
            const subList = document.createElement('ul');
            createTree(node.children, subList); // 재귀 호출
            listItem.appendChild(subList);
        }

        parentElement.appendChild(listItem);
    });
}

/**
 * 생성된 트리 안의 모든 카테고리 제목(<span>)에 클릭 이벤트를 추가하는 함수.
 * 이 함수는 깊이에 상관없이 모든 카테고리에 적용됩니다.
 */
function addCategoryToggleListeners() {
    // '#planet-list' 안의 모든 <li> 자식인 <span>을 찾습니다. (모든 카테고리 제목)
    const categoryTitles = document.querySelectorAll('#planet-list li > span');
    
    categoryTitles.forEach(title => {
        const parentLi = title.parentElement;
        
        // 해당 카테고리가 하위 목록(<ul>)을 가지고 있는지 확인
        if (parentLi.querySelector('ul')) {
            // 기본 상태를 '닫힘'으로 설정
            parentLi.classList.add('collapsed');
            
            // 클릭 시 'collapsed' 클래스를 토글하여 열고 닫음
            title.addEventListener('click', () => {
                parentLi.classList.toggle('collapsed');
            });
        }
    });
}