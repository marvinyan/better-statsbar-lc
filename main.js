// ==UserScript==
// @name            Better Statsbar (LeetCode)
// @description     Show the total number of questions per difficulty in LeetCode's statsbar.
// @namespace       https://greasyfork.org/en/users/128831-marvinyan
// @match           https://leetcode.com/problemset/algorithms/
// @grant           GM.getValue
// @grant           GM.setValue
// @grant           GM_getValue
// @grant           GM_setValue
// @require         https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require         https://greasyfork.org/scripts/374849-library-onelementready-es6/code/Library%20%7C%20onElementReady%20ES6.js?version=649483
// ==/UserScript==

(() => {
  const LC_ALGO_API = 'https://leetcode.com/api/problems/algorithms/';
  const CACHE_DURATION_MS = 10 * 1000; // Optional rate limit (default: 10s)
  const CURRENT_TIME_MS = new Date().getTime();

  const getData = async url => {
    const lastCheck = await GM.getValue('lastCheck', Number.MAX_VALUE);
    const cachedJsonStr = await GM.getValue('cachedJsonStr', null);
    const timeSinceCheck = CURRENT_TIME_MS - lastCheck;

    return new Promise(resolve => {
      if (timeSinceCheck < CACHE_DURATION_MS && cachedJsonStr !== null) {
        resolve(cachedJsonStr);
      } else {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            GM.setValue('lastCheck', CURRENT_TIME_MS);
            GM.setValue('cachedJsonStr', xhr.responseText);
            resolve(xhr.responseText);
          }
        };
        xhr.send();
      }
    });
  };

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
