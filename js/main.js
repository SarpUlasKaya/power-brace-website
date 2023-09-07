const url = '{{site.baseurl}}/docs/noveldraft.pdf';

let pdfDoc = null,
    pageNum= 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 2.4,
    wrapper = document.querySelector('#canvas-wrapper'),
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

// Render the page
const renderPage = num => {
    pageIsRendering = true;

    //Get page
    pdfDoc.getPage(num).then(page => {
        //Set scale
        const viewport = page.getViewport({scale});
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        wrapper.style.width = Math.floor(viewport.width/scale) + 'pt';
        wrapper.style.height = Math.floor(viewport.height/scale) + 'pt';

        const renderCtx = {
            canvasContext: ctx,
            viewport
        };

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;
            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        //Output current page
        document.querySelector('#page-num').textContent = num;
    });
};

//Check for pages rendering
const queueRenderPage = num => {
    if (pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
}

//Show previous page
const showPrevPage = () => {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

//Show next page
const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

//Jump back 10 pages
const jumpBackTenPages = () => {
    if (pageNum <= 10) {
        return;
    }
    pageNum = pageNum - 10;
    queueRenderPage(pageNum);
}

//Jump forward 10 pages
const jumpForwardTenPages = () => {
    if (pageNum >= (pdfDoc.numPages - 9)) {
        return;
    }
    pageNum = pageNum + 10;
    queueRenderPage(pageNum);
}

//Jump to selected page

const jumpToPage = () => {
    const inputNum = document.getElementById("page-select-field").valueAsNumber;
    if (isNaN(inputNum) || (inputNum < 1) || (inputNum > pdfDoc.numPages)) {
        return;
    }
    pageNum = inputNum;
    queueRenderPage(pageNum);
}

//Get document
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;

    document.querySelector('#page-count').textContent = pdfDoc.numPages;

    renderPage(pageNum);
}).catch(err => {
    //Display error
    const div = document.createElement('div');
    div.className = 'error';
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, wrapper);
});

//Button Events
document.querySelector('#prev-page-ten').addEventListener('click', jumpBackTenPages);
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);
document.querySelector('#next-page-ten').addEventListener('click', jumpForwardTenPages);
document.querySelector('#jump-to-page').addEventListener('click', jumpToPage);
