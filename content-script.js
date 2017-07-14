let isRepository = () => {
	let numbersSummary = document.querySelector('ul.numbers-summary');
	return !!numbersSummary;
};

let getCurrentBranch = () => {
    let branchDropDown = document.querySelector('.branch-select-menu > button > span');
    return branchDropDown.innerText;
};

let getCommitsPath = () => {
    return window.location.pathname + '/commits/' + getCurrentBranch();
};

let getAjax = (url, callback) => {
    const DONE = 4;
    const OK = 200;
    let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('GET', url);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
                callback(null, xhr.responseText);
            } else {
                callback(new Error(xhr.status));
            }
        }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();

    return xhr;
};

let onFirstCommitBtnClick = (event) => {
    event.preventDefault();

    let button = event.currentTarget;
    button.innerText = 'Redirecting...';

    const COMMITS_PER_PAGE = 35;
    let path = getCommitsPath(),
        commitsCountText = document.querySelector('a[href="' + path +'"] > span.num').innerText,
        commitsCount = parseInt(commitsCountText.replace(/,/g, '')), // remove thousand separator
        pageNum = Math.ceil(commitsCount / COMMITS_PER_PAGE),
        lastPage = path + '?page=' + pageNum;

    getAjax(lastPage, (err, responseText) => {
        if (err) {
            button.innerText = 'Error :(';
        } else {
            let parser = new DOMParser(),
                content = parser.parseFromString(responseText, 'text/html'),
                commitListItems = content.querySelectorAll('li.commits-list-item'),
                firstCommitItem = commitListItems[commitListItems.length - 1],
                pathForFirstCommit = firstCommitItem.querySelector('.commit-title a').getAttribute('href');

            window.location.href = pathForFirstCommit;
        }
    });
};

let addFirstCommitButton = () => {
    let firstCommitLink = document.createElement('a');
    firstCommitLink.setAttribute('href', '#');
    firstCommitLink.innerText = 'First Commit';

    firstCommitLink.addEventListener('click', onFirstCommitBtnClick);

    let newMenuItem = document.createElement('li');
    newMenuItem.appendChild(firstCommitLink);

    let commitsPath = getCommitsPath(),
        commitsButton = document.querySelector('a[href="' + commitsPath +'"]');

    // insert new item right after commits button
    commitsButton.parentNode.parentNode.insertBefore(newMenuItem, commitsButton.parentNode.nextSibling);
};

document.addEventListener('pjax:end', () => {
    if (isRepository()) {
        addFirstCommitButton();
    }
}, false);

if (isRepository()) {
    addFirstCommitButton();
}
