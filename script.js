const currentYear = `${new Date().getFullYear()}`;
const currentMonth = `0${new Date().getMonth() + 1}`.slice(-2);

const yearInput = document.querySelector('.yearInput');
const monthInput = document.querySelector('.monthInput');
const totalDiv = document.querySelector('.total');
const logDiv = document.querySelector('.log');
const getDataButton = document.querySelector('.getData');
const downloadButton = document.querySelector('.download');

yearInput.placeholder = currentYear;
monthInput.placeholder = currentMonth;
yearInput.value = currentYear;
monthInput.value = currentMonth;

let urls = [];

let year = currentYear;
let month = currentMonth;

let controller = new AbortController();

const getData = async () => {
  try {
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    const { signal } = controller;
    urls = [];
    downloadButton.disabled = true;
    totalDiv.textContent = `Total: ${urls.length}`;
    logDiv.textContent = '';

    year = yearInput.value === '' ? currentYear : yearInput.value;
    month = monthInput.value === '' ? currentMonth : monthInput.value;

    const baseUrl = 'https://romanialibera.ro/wp-json/wp/v2/posts';
    const authorId = 3250;
    const perPage = '100';
    let offset = '0';

    const url = new URL(baseUrl);
    const date = new Date(Date.UTC(+year, +month - 1));

    const after = new Date(date);
    const before = new Date(date);

    after.setUTCHours(23, 59, 59, 999);
    after.setDate(after.getDate() - 1);
    before.setMonth(+month);

    const afterString = after.toISOString().slice(0, -1);
    const beforeString = before.toISOString().slice(0, -1);

    url.searchParams.set('per_page', perPage);
    url.searchParams.set('offset', offset);
    url.searchParams.set('before', beforeString);
    url.searchParams.set('after', afterString);

    let lastPage = false;

    const unfilteredPosts = [];

    while (!lastPage) {
      const response = await fetch(url, { signal });
      const data = await response.json();

      const div = document.createElement('div');
      div.textContent = `offset: ${offset}, items: ${data.length}`;
      logDiv.appendChild(div);

      unfilteredPosts.push(...data);
      offset = `${+offset + +perPage}`;
      url.searchParams.set('offset', offset);
      if (!data.length) lastPage = true;
    }

    const filteredPosts = unfilteredPosts.filter(
      (post) => post.author === authorId
    );
    urls = filteredPosts.map((post) => post.link).reverse();
    totalDiv.textContent = `Total: ${urls.length}`;
    downloadButton.disabled = false;
  } catch (err) {}
};

function download() {
  let content = 'Index,Link\n';

  urls.forEach((url, index) => {
    content += `${index + 1},${url}\n`;
  });

  var blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);

  var pom = document.createElement('a');
  pom.href = url;
  pom.setAttribute('download', `articole_${year}_${month}.csv`);
  pom.click();
}

getDataButton.addEventListener('click', getData);
downloadButton.addEventListener('click', download);
