const state = {
  array:       [],
  isSorting:   false,
  sortedCount: 0,
  comparisons: 0,
  swaps:       0,
  startTime:   null,
  timerHandle: null,
};

const visualizer  = document.getElementById('visualizer');
const generateBtn = document.getElementById('generateBtn');
const sortBtn     = document.getElementById('sortBtn');
const sortIcon    = document.getElementById('sortIcon');
const sortLabel   = document.getElementById('sortLabel');
const algoSelect  = document.getElementById('algoSelect');
const sizeRange   = document.getElementById('sizeRange');
const sizeVal     = document.getElementById('sizeVal');
const speedRange  = document.getElementById('speedRange');
const speedVal    = document.getElementById('speedVal');
const statusDot   = document.getElementById('statusDot');
const statusText  = document.getElementById('statusText');
const infoAlgo    = document.getElementById('infoAlgo');
const infoSize    = document.getElementById('infoSize');
const infoComps   = document.getElementById('infoComps');
const infoSwaps   = document.getElementById('infoSwaps');
const infoTime    = document.getElementById('infoTime');
const vizWrap     = document.querySelector('.visualizer-wrap');

function getDelay() {
  const speed = parseInt(speedRange.value);
  const size  = state.array.length;
  const base = Math.max(4, 200 - size * 1.5);
  return Math.round(base / speed);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateArray() {
  if (state.isSorting) return;

  const size = parseInt(sizeRange.value);
  state.array = Array.from({ length: size }, () => randInt(8, 100));

  resetStats();
  renderBars();
  setStatus('READY', 'idle');
}

function renderBars(highlightIndices = [], pivotIndex = -1, sortedIndices = new Set()) {
  visualizer.innerHTML = '';

  state.array.forEach((val, i) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${val}%`;
    bar.setAttribute('aria-valuenow', val);

    if (sortedIndices.has(i)) {
      bar.classList.add('sorted');
    } else if (i === pivotIndex) {
      bar.classList.add('pivot');
    } else if (highlightIndices.includes(i)) {
      bar.classList.add('comparing');
    }

    visualizer.appendChild(bar);
  });
}

function updateBar(index, classes = []) {
  const bars = visualizer.querySelectorAll('.bar');
  const bar  = bars[index];
  if (!bar) return;

  bar.style.height = `${state.array[index]}%`;
  bar.className = 'bar';
  classes.forEach(c => bar.classList.add(c));
}

function markSorted(from, to) {
  const bars = visualizer.querySelectorAll('.bar');
  for (let i = from; i <= to; i++) {
    if (bars[i]) {
      bars[i].className = 'bar sorted';
    }
  }
}

function markOneSorted(index) {
  const bars = visualizer.querySelectorAll('.bar');
  if (bars[index]) bars[index].className = 'bar sorted';
}

function resetBarClasses() {
  visualizer.querySelectorAll('.bar').forEach(b => b.className = 'bar');
}

function resetStats() {
  state.comparisons = 0;
  state.swaps       = 0;
  state.startTime   = null;
  clearInterval(state.timerHandle);
  infoComps.textContent = '0';
  infoSwaps.textContent = '0';
  infoTime.textContent  = '0.00s';
  infoSize.textContent  = state.array.length;

  const algoNames = { bubble: 'Bubble Sort', selection: 'Selection Sort', insertion: 'Insertion Sort', merge: 'Merge Sort', quick: 'Quick Sort' };
  infoAlgo.textContent = algoNames[algoSelect.value];

  document.querySelectorAll('.complexity-table tr[data-algo]').forEach(row => {
    row.classList.toggle('active-row', row.dataset.algo === algoSelect.value);
  });
}

function incComparisons(n = 1) {
  state.comparisons += n;
  infoComps.textContent = state.comparisons;
}

function incSwaps(n = 1) {
  state.swaps += n;
  infoSwaps.textContent = state.swaps;
}

function startTimer() {
  state.startTime = performance.now();
  clearInterval(state.timerHandle);
  state.timerHandle = setInterval(() => {
    const elapsed = ((performance.now() - state.startTime) / 1000).toFixed(2);
    infoTime.textContent = elapsed + 's';
  }, 50);
}

function stopTimer() {
  clearInterval(state.timerHandle);
  const elapsed = ((performance.now() - state.startTime) / 1000).toFixed(2);
  infoTime.textContent = elapsed + 's';
}

function setStatus(text, mode) {
  statusText.textContent = text;
  statusDot.className = 'status-dot';
  if (mode === 'busy') statusDot.classList.add('busy');
  if (mode === 'done') statusDot.classList.add('done');
}

function setSortingUI(sorting) {
  state.isSorting     = sorting;
  generateBtn.disabled = sorting;
  algoSelect.disabled  = sorting;
  sizeRange.disabled   = sorting;

  if (sorting) {
    sortBtn.classList.add('sorting');
    sortIcon.textContent  = '■';
    sortLabel.textContent = 'Sorting…';
  } else {
    sortBtn.classList.remove('sorting');
    sortIcon.textContent  = '▶';
    sortLabel.textContent = 'Start Sorting';
  }
}

function swap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]];
  incSwaps();
}

async function bubbleSort() {
  const arr = state.array;
  const n   = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      if (!state.isSorting) return;

      updateBar(j,     ['comparing']);
      updateBar(j + 1, ['comparing']);
      incComparisons();
      await sleep(getDelay());

      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1);
        swapped = true;
        updateBar(j,     ['pivot']);
        updateBar(j + 1, ['pivot']);
        await sleep(getDelay());
      }

      updateBar(j,     []);
      updateBar(j + 1, []);
    }

    markOneSorted(n - i - 1);

    if (!swapped) break;
  }

  markSorted(0, n - 1);
}

async function selectionSort() {
  const arr = state.array;
  const n   = arr.length;

  for (let i = 0; i < n - 1; i++) {
    if (!state.isSorting) return;

    let minIdx = i;

    updateBar(i, ['pivot']);

    for (let j = i + 1; j < n; j++) {
      if (!state.isSorting) return;

      updateBar(j, ['comparing']);
      incComparisons();
      await sleep(getDelay());

      if (arr[j] < arr[minIdx]) {
        if (minIdx !== i) updateBar(minIdx, []);
        minIdx = j;
        updateBar(minIdx, ['pivot']);
      } else {
        updateBar(j, []);
      }
    }

    if (minIdx !== i) {
      swap(arr, i, minIdx);
      updateBar(minIdx, []);
      updateBar(i, ['comparing']);
      await sleep(getDelay());
    }

    markOneSorted(i);
  }

  markSorted(0, n - 1);
}

async function insertionSort() {
  const arr = state.array;
  const n   = arr.length;

  markOneSorted(0);

  for (let i = 1; i < n; i++) {
    if (!state.isSorting) return;

    const key = arr[i];
    let j = i - 1;

    updateBar(i, ['pivot']);
    await sleep(getDelay());

    while (j >= 0 && arr[j] > key) {
      if (!state.isSorting) return;

      incComparisons();
      updateBar(j,     ['comparing']);
      updateBar(j + 1, ['comparing']);
      await sleep(getDelay());

      arr[j + 1] = arr[j];
      incSwaps();
      updateBar(j + 1, ['pivot']);
      updateBar(j,     []);
      j--;
    }

    arr[j + 1] = key;
    updateBar(j + 1, []);

    for (let k = 0; k <= i; k++) markOneSorted(k);

    await sleep(getDelay());
  }
}

async function startSort() {
  if (state.isSorting) return;
  if (state.array.length === 0) return;

  resetStats();
  resetBarClasses();
  setSortingUI(true);
  setStatus('SORTING', 'busy');
  startTimer();

  const algo = algoSelect.value;

  try {
    if (algo === 'bubble')    await bubbleSort();
    if (algo === 'selection') await selectionSort();
    if (algo === 'insertion') await insertionSort();
    if (algo === 'merge')     await mergeSortStart();
    if (algo === 'quick')     await quickSortStart();
  } finally {
    stopTimer();
    setSortingUI(false);

    if (state.isSorting !== false) {
      setStatus('DONE', 'done');
      vizWrap.classList.add('flash-done');
      setTimeout(() => vizWrap.classList.remove('flash-done'), 1000);
    }

    state.isSorting = false;
  }
}

generateBtn.addEventListener('click', generateArray);
sortBtn.addEventListener('click', startSort);

sizeRange.addEventListener('input', () => {
  sizeVal.textContent = sizeRange.value;
  if (!state.isSorting) generateArray();
});

speedRange.addEventListener('input', () => {
  speedVal.textContent = speedRange.value;
});

algoSelect.addEventListener('change', () => {
  resetStats();
});

generateArray();

async function mergeSortStart() {
  await mergeSort(0, state.array.length - 1);
  if (state.isSorting) markSorted(0, state.array.length - 1);
}

async function mergeSort(left, right) {
  if (!state.isSorting) return;
  if (left >= right) return;

  const mid = Math.floor((left + right) / 2);

  for (let i = left; i <= right; i++) updateBar(i, ['pivot']);
  await sleep(getDelay() * 1.5);
  for (let i = left; i <= right; i++) updateBar(i, []);

  await mergeSort(left, mid);
  await mergeSort(mid + 1, right);
  await merge(left, mid, right);
}

async function merge(left, mid, right) {
  if (!state.isSorting) return;

  const arr    = state.array;
  const leftA  = arr.slice(left, mid + 1);
  const rightA = arr.slice(mid + 1, right + 1);

  let i = 0, j = 0, k = left;

  while (i < leftA.length && j < rightA.length) {
    if (!state.isSorting) return;

    updateBar(k, ['comparing']);
    incComparisons();
    await sleep(getDelay());

    if (leftA[i] <= rightA[j]) {
      arr[k] = leftA[i++];
    } else {
      arr[k] = rightA[j++];
      incSwaps();
    }

    updateBar(k, ['pivot']);
    await sleep(getDelay());
    k++;
  }

  while (i < leftA.length) {
    if (!state.isSorting) return;
    arr[k] = leftA[i++];
    updateBar(k, ['pivot']);
    await sleep(getDelay());
    k++;
  }

  while (j < rightA.length) {
    if (!state.isSorting) return;
    arr[k] = rightA[j++];
    updateBar(k, ['pivot']);
    await sleep(getDelay());
    k++;
  }

  for (let x = left; x <= right; x++) markOneSorted(x);
}

async function quickSortStart() {
  await quickSort(0, state.array.length - 1);
  if (state.isSorting) markSorted(0, state.array.length - 1);
}

async function quickSort(low, high) {
  if (!state.isSorting) return;
  if (low >= high) {
    if (low >= 0 && low === high) markOneSorted(low);
    return;
  }

  const pivotIdx = await partition(low, high);
  if (!state.isSorting) return;

  markOneSorted(pivotIdx);
  await quickSort(low, pivotIdx - 1);
  await quickSort(pivotIdx + 1, high);
}

async function partition(low, high) {
  const arr      = state.array;
  const pivotVal = arr[high];

  updateBar(high, ['pivot']);

  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (!state.isSorting) return low;

    updateBar(j, ['comparing']);
    incComparisons();
    await sleep(getDelay());

    if (arr[j] <= pivotVal) {
      i++;
      swap(arr, i, j);
      updateBar(i, ['pivot']);
      updateBar(j, []);
      await sleep(getDelay());
    } else {
      updateBar(j, []);
    }
  }

  swap(arr, i + 1, high);
  updateBar(high, []);
  updateBar(i + 1, ['comparing']);
  await sleep(getDelay());

  return i + 1;
}
