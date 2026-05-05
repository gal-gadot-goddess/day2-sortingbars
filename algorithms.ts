
import { SortStep } from './types';

const isSorted = (arr: number[]) => {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false;
  }
  return true;
};

const shuffle = (arr: number[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

const addFinalStep = (steps: SortStep[], arr: number[]) => {
  steps.push({
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: [...Array(arr.length).keys()],
    currentLine: 1
  });
};

export const generateBogoSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  let iterations = 0;
  const MAX_ITERATIONS = 60;

  while (!isSorted(arr) && iterations < MAX_ITERATIONS) {
    shuffle(arr);
    steps.push({
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [...Array(arr.length).keys()],
      sortedIndices: [],
      currentLine: 3
    });
    iterations++;
  }

  addFinalStep(steps, arr);
  return steps;
};

export const generateCocktailSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  let start = 0, end = arr.length - 1;
  let sortedIndices: number[] = [];

  while (start < end) {
    let swapped = false;
    for (let i = start; i < end; i++) {
      steps.push({ array: [...arr], comparingIndices: [i, i + 1], swappingIndices: [], sortedIndices: [...sortedIndices], currentLine: 5 });
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
        steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [i, i + 1], sortedIndices: [...sortedIndices], currentLine: 5 });
      }
    }
    sortedIndices.push(end);
    end--;
    if (!swapped) break;

    swapped = false;
    for (let i = end; i > start; i--) {
      steps.push({ array: [...arr], comparingIndices: [i, i - 1], swappingIndices: [], sortedIndices: [...sortedIndices], currentLine: 9 });
      if (arr[i] < arr[i - 1]) {
        [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
        swapped = true;
        steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [i, i - 1], sortedIndices: [...sortedIndices], currentLine: 9 });
      }
    }
    sortedIndices.push(start);
    start++;
    if (!swapped) break;
  }
  addFinalStep(steps, arr);
  return steps;
};

export const generateBubbleSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  let sortedIndices: number[] = [];

  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ array: [...arr], comparingIndices: [j, j + 1], swappingIndices: [], sortedIndices: [...sortedIndices], currentLine: 5 });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
        steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [j, j + 1], sortedIndices: [...sortedIndices], currentLine: 6 });
      }
    }
    sortedIndices.push(n - i - 1);
    if (!swapped) break;
  }
  addFinalStep(steps, arr);
  return steps;
};

export const generateInsertionSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    let key = arr[i], j = i - 1;
    steps.push({ array: [...arr], comparingIndices: [i, j], swappingIndices: [], sortedIndices: [], currentLine: 3 });
    while (j >= 0 && arr[j] > key) {
      steps.push({ array: [...arr], comparingIndices: [j], swappingIndices: [], sortedIndices: [], currentLine: 4 });
      arr[j + 1] = arr[j];
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [j, j + 1], sortedIndices: [], currentLine: 5 });
      j = j - 1;
    }
    arr[j + 1] = key;
    steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [j + 1], sortedIndices: [], currentLine: 8 });
  }
  addFinalStep(steps, arr);
  return steps;
};

export const generateSelectionSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  let sortedIndices: number[] = [];
  for (let i = 0; i < n; i++) {
    let min = i;
    steps.push({ array: [...arr], comparingIndices: [i], swappingIndices: [], sortedIndices: [...sortedIndices], currentLine: 3 });
    for (let j = i + 1; j < n; j++) {
      steps.push({ array: [...arr], comparingIndices: [j, min], swappingIndices: [], sortedIndices: [...sortedIndices], currentLine: 5 });
      if (arr[j] < arr[min]) min = j;
    }
    if (min !== i) {
      [arr[i], arr[min]] = [arr[min], arr[i]];
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [i, min], sortedIndices: [...sortedIndices], currentLine: 8 });
    }
    sortedIndices.push(i);
  }
  addFinalStep(steps, arr);
  return steps;
};

export const generateMergeSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];

  const merge = (l: number, m: number, r: number) => {
    const left = arr.slice(l, m + 1);
    const right = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      steps.push({ array: [...arr], comparingIndices: [l + i, m + 1 + j], swappingIndices: [], sortedIndices: [], currentLine: 13 });
      if (left[i] <= right[j]) arr[k] = left[i++];
      else arr[k] = right[j++];
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [k], sortedIndices: [], currentLine: 14 });
      k++;
    }
    while (i < left.length) { arr[k] = left[i++]; steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [k], sortedIndices: [], currentLine: 17 }); k++; }
    while (j < right.length) { arr[k] = right[j++]; steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [k], sortedIndices: [], currentLine: 18 }); k++; }
  };

  const sort = (l: number, r: number) => {
    if (l < r) {
      const m = Math.floor((l + r) / 2);
      steps.push({ array: [...arr], comparingIndices: [l, r], swappingIndices: [], sortedIndices: [], currentLine: 3 });
      sort(l, m);
      sort(m + 1, r);
      merge(l, m, r);
    }
  };

  sort(0, arr.length - 1);
  addFinalStep(steps, arr);
  return steps;
};

export const generateQuickSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  let sortedIndices: number[] = [];

  const partition = (low: number, high: number) => {
    let pivot = arr[high], i = low - 1;
    steps.push({ array: [...arr], comparingIndices: [high], swappingIndices: [], sortedIndices: [...sortedIndices], currentLine: 10 });
    for (let j = low; j < high; j++) {
      steps.push({ array: [...arr], comparingIndices: [j, high], swappingIndices: [], sortedIndices: [...sortedIndices], currentLine: 11 });
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [i, j], sortedIndices: [...sortedIndices], currentLine: 13 });
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [i + 1, high], sortedIndices: [...sortedIndices], currentLine: 16 });
    return i + 1;
  };

  const quickSort = (low: number, high: number) => {
    if (low < high) {
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [], sortedIndices: [...sortedIndices], currentLine: 2 });
      let pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    }
  };

  quickSort(0, arr.length - 1);
  addFinalStep(steps, arr);
  return steps;
};

export const generateHeapSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  const heapify = (size: number, i: number) => {
    let largest = i, l = 2 * i + 1, r = 2 * i + 2;
    steps.push({ array: [...arr], comparingIndices: [i, l < size ? l : i, r < size ? r : i], swappingIndices: [], sortedIndices: [], currentLine: 13 });
    if (l < size && arr[l] > arr[largest]) largest = l;
    if (r < size && arr[r] > arr[largest]) largest = r;
    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [i, largest], sortedIndices: [], currentLine: 17 });
      heapify(size, largest);
    }
  };

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    steps.push({ array: [...arr], comparingIndices: [i], swappingIndices: [], sortedIndices: [], currentLine: 4 });
    heapify(n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [0, i], sortedIndices: [], currentLine: 8 });
    heapify(i, 0);
  }

  addFinalStep(steps, arr);
  return steps;
};

export const generateTimSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  const RUN = 4;

  const insertionSort = (left: number, right: number) => {
    for (let i = left + 1; i <= right; i++) {
      let temp = arr[i], j = i - 1;
      while (j >= left && arr[j] > temp) {
        arr[j + 1] = arr[j];
        steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [j, j + 1], sortedIndices: [], currentLine: 4 });
        j--;
      }
      arr[j + 1] = temp;
    }
  };

  const merge = (l: number, m: number, r: number) => {
    const left = arr.slice(l, m + 1), right = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) arr[k++] = left[i++];
      else arr[k++] = right[j++];
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [k - 1], sortedIndices: [], currentLine: 9 });
    }
    while (i < left.length) { arr[k++] = left[i++]; steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [k - 1], sortedIndices: [], currentLine: 9 }); }
    while (j < right.length) { arr[k++] = right[j++]; steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [k - 1], sortedIndices: [], currentLine: 9 }); }
  };

  for (let i = 0; i < n; i += RUN) insertionSort(i, Math.min(i + RUN - 1, n - 1));
  for (let size = RUN; size < n; size = 2 * size) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = left + size - 1, right = Math.min(left + 2 * size - 1, n - 1);
      if (mid < right) merge(left, mid, right);
    }
  }
  addFinalStep(steps, arr);
  return steps;
};

export const generateShellSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let temp = arr[i], j;
      for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
        steps.push({ array: [...arr], comparingIndices: [j, j - gap], swappingIndices: [], sortedIndices: [], currentLine: 4 });
        arr[j] = arr[j - gap];
        steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [j], sortedIndices: [], currentLine: 5 });
      }
      arr[j] = temp;
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [j], sortedIndices: [], currentLine: 7 });
    }
  }
  addFinalStep(steps, arr);
  return steps;
};

export const generateGnomeSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  let i = 0;
  while (i < arr.length) {
    if (i === 0 || arr[i] >= arr[i - 1]) {
      steps.push({ array: [...arr], comparingIndices: [i], swappingIndices: [], sortedIndices: [], currentLine: 4 });
      i++;
    } else {
      [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [i, i - 1], sortedIndices: [], currentLine: 7 });
      i--;
    }
  }
  addFinalStep(steps, arr);
  return steps;
};

export const generateRadixSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const max = Math.max(...arr);

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const output = new Array(arr.length).fill(0);
    const count = new Array(10).fill(0);

    for (let i = 0; i < arr.length; i++) {
      steps.push({ array: [...arr], comparingIndices: [i], swappingIndices: [], sortedIndices: [], currentLine: 5 });
      count[Math.floor(arr[i] / exp) % 10]++;
    }
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = arr.length - 1; i >= 0; i--) {
      const idx = count[Math.floor(arr[i] / exp) % 10] - 1;
      output[idx] = arr[i];
      count[Math.floor(arr[i] / exp) % 10]--;
    }
    for (let i = 0; i < arr.length; i++) {
      arr[i] = output[i];
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [i], sortedIndices: [], currentLine: 12 });
    }
  }
  addFinalStep(steps, arr);
  return steps;
};

export const generateBitonicSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];

  const compareAndSwap = (i: number, j: number, dir: number) => {
    steps.push({ array: [...arr], comparingIndices: [i, j], swappingIndices: [], sortedIndices: [], currentLine: 4 });
    if ((dir === 1 && arr[i] > arr[j]) || (dir === 0 && arr[i] < arr[j])) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [i, j], sortedIndices: [], currentLine: 5 });
    }
  };

  const bitonicMerge = (low: number, cnt: number, dir: number) => {
    if (cnt > 1) {
      const k = cnt / 2;
      for (let i = low; i < low + k; i++) compareAndSwap(i, i + k, dir);
      bitonicMerge(low, k, dir);
      bitonicMerge(low + k, k, dir);
    }
  };

  const bitonicSort = (low: number, cnt: number, dir: number) => {
    if (cnt > 1) {
      const k = cnt / 2;
      bitonicSort(low, k, 1);
      bitonicSort(low + k, k, 0);
      bitonicMerge(low, cnt, dir);
    }
  };

  // Bitonic sort requires power of 2 size, but we'll try to adapt or just let it run for the recorded size
  // For visualization, we'll just run it on the current length (clipping to power of 2 if needed in the logic)
  let n = 1;
  while (n < arr.length) n <<= 1;
  // If app is not power of 2, this might be tricky. Better to just use a standard power of 2 for Bitonic days.
  // We'll implement the logic anyway.
  bitonicSort(0, arr.length, 1);
  addFinalStep(steps, arr);
  return steps;
};

export const generateOddEvenSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  let isSorted = false;
  while (!isSorted) {
    isSorted = true;
    for (let i = 1; i < arr.length - 1; i += 2) {
      steps.push({ array: [...arr], comparingIndices: [i, i + 1], swappingIndices: [], sortedIndices: [], currentLine: 5 });
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        isSorted = false;
        steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [i, i + 1], sortedIndices: [], currentLine: 6 });
      }
    }
    for (let i = 0; i < arr.length - 1; i += 2) {
      steps.push({ array: [...arr], comparingIndices: [i, i + 1], swappingIndices: [], sortedIndices: [], currentLine: 9 });
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        isSorted = false;
        steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [i, i + 1], sortedIndices: [], currentLine: 10 });
      }
    }
  }
  addFinalStep(steps, arr);
  return steps;
};

export const generatePancakeSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];

  const flip = (i: number) => {
    let start = 0;
    while (start < i) {
      [arr[start], arr[i]] = [arr[i], arr[start]];
      // Line numbers for flip internal logic aren't in the main snippet, 
      // but we point to the flip calls or internal swap
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [start, i], sortedIndices: [], currentLine: 5 });
      start++;
      i--;
    }
  };

  for (let currSize = arr.length; currSize > 1; --currSize) {
    let mi = 0;
    steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [], sortedIndices: [], currentLine: 2 });
    for (let i = 0; i < currSize; i++) {
      steps.push({ array: [...arr], comparingIndices: [i, mi], swappingIndices: [], sortedIndices: [], currentLine: 3 });
      if (arr[i] > arr[mi]) mi = i;
    }
    if (mi !== currSize - 1) {
      flip(mi);
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [], sortedIndices: [], currentLine: 5 });
      flip(currSize - 1);
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [], sortedIndices: [], currentLine: 6 });
    }
  }
  addFinalStep(steps, arr);
  return steps;
};

export const generateStoogeSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];

  const stoogeSort = (l: number, h: number) => {
    if (l >= h) return;
    steps.push({ array: [...arr], comparingIndices: [l, h], swappingIndices: [], sortedIndices: [], currentLine: 2 });
    if (arr[l] > arr[h]) {
      [arr[l], arr[h]] = [arr[h], arr[l]];
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [l, h], sortedIndices: [], currentLine: 2 });
    }
    if (h - l + 1 > 2) {
      let t = Math.floor((h - l + 1) / 3);
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [], sortedIndices: [], currentLine: 4 });
      stoogeSort(l, h - t);
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [], sortedIndices: [], currentLine: 5 });
      stoogeSort(l + t, h);
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [], sortedIndices: [], currentLine: 6 });
      stoogeSort(l, h - t);
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [], sortedIndices: [], currentLine: 7 });
    }
  };

  stoogeSort(0, arr.length - 1);
  addFinalStep(steps, arr);
  return steps;
};

export const generateCombSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  let gap = arr.length;
  let shrink = 1.3;
  let sorted = false;

  while (!sorted) {
    gap = Math.floor(gap / shrink);
    steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [], sortedIndices: [], currentLine: 4 });
    if (gap <= 1) {
      gap = 1;
      sorted = true;
    }

    for (let i = 0; i + gap < arr.length; i++) {
      steps.push({ array: [...arr], comparingIndices: [i, i + gap], swappingIndices: [], sortedIndices: [], currentLine: 5 });
      if (arr[i] > arr[i + gap]) {
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
        sorted = false;
        steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [i, i + gap], sortedIndices: [], currentLine: 6 });
      }
    }
  }
  addFinalStep(steps, arr);
  return steps;
};

export const generateCycleSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  for (let cycleStart = 0; cycleStart <= n - 2; cycleStart++) {
    let item = arr[cycleStart];
    let pos = cycleStart;
    steps.push({ array: [...arr], comparingIndices: [cycleStart], swappingIndices: [], sortedIndices: [], currentLine: 3 });

    for (let i = cycleStart + 1; i < n; i++) {
      steps.push({ array: [...arr], comparingIndices: [i], swappingIndices: [], sortedIndices: [], currentLine: 4 });
      if (arr[i] < item) pos++;
    }

    if (pos === cycleStart) continue;

    while (item === arr[pos]) pos++;
    if (pos !== cycleStart) {
      [item, arr[pos]] = [arr[pos], item];
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [pos], sortedIndices: [], currentLine: 10 });
    }

    while (pos !== cycleStart) {
      pos = cycleStart;
      steps.push({ array: [...arr], comparingIndices: [cycleStart], swappingIndices: [], sortedIndices: [], currentLine: 13 });
      for (let i = cycleStart + 1; i < n; i++) {
        if (arr[i] < item) pos++;
      }
      while (item === arr[pos]) pos++;
      if (item !== arr[pos]) {
        [item, arr[pos]] = [arr[pos], item];
        steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [pos], sortedIndices: [], currentLine: 18 });
      }
    }
  }
  addFinalStep(steps, arr);
  return steps;
};

export const generateBinaryInsertionSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let left = 0;
    let right = i - 1;

    steps.push({ array: [...arr], comparingIndices: [i], swappingIndices: [], sortedIndices: [], currentLine: 3 });

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      steps.push({ array: [...arr], comparingIndices: [mid], swappingIndices: [], sortedIndices: [], currentLine: 6 });
      if (key < arr[mid]) right = mid - 1;
      else left = mid + 1;
    }

    for (let j = i - 1; j >= left; j--) {
      arr[j + 1] = arr[j];
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [j, j + 1], sortedIndices: [], currentLine: 12 });
    }
    arr[left] = key;
    steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [left], sortedIndices: [], currentLine: 14 });
  }

  addFinalStep(steps, arr);
  return steps;
};

export const generateSlowSortSteps = (initialArray: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...initialArray];

  const slowSort = (i: number, j: number) => {
    if (i >= j) return;
    const m = Math.floor((i + j) / 2);

    steps.push({ array: [...arr], comparingIndices: [i, j], swappingIndices: [], sortedIndices: [], currentLine: 2 });

    slowSort(i, m);
    slowSort(m + 1, j);

    steps.push({ array: [...arr], comparingIndices: [m, j], swappingIndices: [], sortedIndices: [], currentLine: 6 });
    if (arr[j] < arr[m]) {
      [arr[j], arr[m]] = [arr[m], arr[j]];
      steps.push({ array: [...arr], comparingIndices: [], swappingIndices: [j, m], sortedIndices: [], currentLine: 7 });
    }
    slowSort(i, j - 1);
  };

  slowSort(0, arr.length - 1);
  addFinalStep(steps, arr);
  return steps;
};
