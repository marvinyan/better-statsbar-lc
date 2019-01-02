// ==UserScript==
// @name Better Stats Bar (LeetCode)
// @namespace https://greasyfork.org/en/users/128831-marvinyan
// @match https://leetcode.com/problemset/algorithms/
// @grant none
// @require https://greasyfork.org/scripts/374849-library-onelementready-es6/code/Library%20%7C%20onElementReady%20ES6.js?version=649483
// ==/UserScript==
(() => {
  const LC_ALGO_API = 'https://leetcode.com/api/problems/algorithms/';

  const getData = url =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('GET', url, true);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = () => {
        reject({
          status: xhr.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });

  const parseData = response => {
    const counts = [0, 0, 0];
    const questions = JSON.parse(response).stat_status_pairs;

    questions.forEach(q => {
      counts[q.difficulty.level - 1]++;
    });

    return counts;
  };

  const updateStatsBar = counts => {
    const statsBar = $('#welcome > span > span');

    let $totalSolvedSpan = $(statsBar[0]).closest('span');
    const newText = $totalSolvedSpan.text().replace('/', ' / ');
    $totalSolvedSpan.text(newText);

    for (let i = 1; i < statsBar.length; i++) {
      statsBar[i].append(` / ${counts[i - 1]}`);
    }
  };

  const run = async () => {
    const data = await getData(LC_ALGO_API);
    const counts = parseData(data);
    updateStatsBar(counts);
  };

  waitForKeyElements('#welcome', run);
})();
