
import { AlgorithmInfo, AlgorithmType } from './types';

export const ALGORITHMS: Record<string, AlgorithmInfo> = {
  [AlgorithmType.BUBBLE_SORT]: {
    id: AlgorithmType.BUBBLE_SORT,
    name: 'Bubble Sort',
    description: 'Repeatedly swaps adjacent elements. Simple but slow.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n-i-1; j++) {
      if (arr[j] > arr[j+1]) {
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
}`
  },
  [AlgorithmType.INSERTION_SORT]: {
    id: AlgorithmType.INSERTION_SORT,
    name: 'Insertion Sort',
    description: 'Builds sorted array one element at a time.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i], j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
  }
}`
  },
  [AlgorithmType.COCKTAIL_SORT]: {
    id: AlgorithmType.COCKTAIL_SORT,
    name: 'Cocktail Sort',
    description: 'A variation of bubble sort that sorts in both directions.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: `function cocktailSort(arr) {
  let start = 0, end = arr.length - 1;
  while (start < end) {
    for (let i = start; i < end; i++) {
      if (arr[i] > arr[i+1]) [arr[i], arr[i+1]] = [arr[i+1], arr[i]];
    }
    end--;
    for (let i = end; i > start; i--) {
      if (arr[i] < arr[i-1]) [arr[i], arr[i-1]] = [arr[i-1], arr[i]];
    }
    start++;
  }
}`
  },
  [AlgorithmType.SELECTION_SORT]: {
    id: AlgorithmType.SELECTION_SORT,
    name: 'Selection Sort',
    description: 'Picks the minimum from unsorted part repeatedly.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: `function selectionSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let min = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[min]) min = j;
    }
    if (min !== i) {
      [arr[i], arr[min]] = [arr[min], arr[i]];
    }
  }
}`
  },
  [AlgorithmType.MERGE_SORT]: {
    id: AlgorithmType.MERGE_SORT,
    name: 'Merge Sort',
    description: 'Divide and conquer algorithm that splits and merges.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    code: `function mergeSort(arr, l, r) {
  if (l >= r) return;
  const m = Math.floor((l + r) / 2);
  mergeSort(arr, l, m);
  mergeSort(arr, m + 1, r);
  merge(arr, l, m, r);
}

function merge(arr, l, m, r) {
  const left = arr.slice(l, m + 1);
  const right = arr.slice(m + 1, r + 1);
  let i = 0, j = 0, k = l;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) arr[k++] = left[i++];
    else arr[k++] = right[j++];
  }
  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];
}`
  },
  [AlgorithmType.QUICK_SORT]: {
    id: AlgorithmType.QUICK_SORT,
    name: 'Quick Sort',
    description: 'Efficient partitioning around a pivot element.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    code: `function quickSort(arr, low, high) {
  if (low < high) {
    let pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(pi + 1, high);
  }
}

function partition(arr, low, high) {
  let pivot = arr[high], i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
  return i + 1;
}`
  },
  [AlgorithmType.TIM_SORT]: {
    id: AlgorithmType.TIM_SORT,
    name: 'Tim Sort',
    description: 'Hybrid of Insertion and Merge sort used in many languages.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    code: `function timSort(arr) {
  const RUN = 32, n = arr.length;
  for (let i = 0; i < n; i += RUN) {
    insertionSort(arr, i, Math.min(i + RUN - 1, n - 1));
  }
  for (let s = RUN; s < n; s = 2 * s) {
    for (let l = 0; l < n; l += 2 * s) {
      let mid = l + s - 1, r = Math.min(l + 2 * s - 1, n - 1);
      if (mid < r) merge(arr, l, mid, r);
    }
  }
}`
  },
  [AlgorithmType.HEAP_SORT]: {
    id: AlgorithmType.HEAP_SORT,
    name: 'Heap Sort',
    description: 'Visualizes the array as a tree to build a max heap.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    code: `function heapSort(arr) {
  const n = arr.length;
  for (let i = Math.floor(n/2)-1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
}

function heapify(arr, n, i) {
  let largest = i, l = 2*i + 1, r = 2*i + 2;
  if (l < n && arr[l] > arr[largest]) largest = l;
  if (r < n && arr[r] > arr[largest]) largest = r;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`
  },
  [AlgorithmType.BOGO_SORT]: {
    id: AlgorithmType.BOGO_SORT,
    name: 'Bogo Sort',
    description: 'Repeatedly shuffles until sorted. High probability of heat death.',
    timeComplexity: 'O((n+1)!)',
    spaceComplexity: 'O(1)',
    code: `function bogoSort(arr) {
  while (!isSorted(arr)) {
    shuffle(arr);
  }
}

function shuffle(arr) {
  for (let i = arr.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}`
  },
  [AlgorithmType.SHELL_SORT]: {
    id: AlgorithmType.SHELL_SORT,
    name: 'Shell Sort',
    description: 'A massive improvement on Insertion Sort using shrinking gaps.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    code: `function shellSort(arr) {
  let n = arr.length;
  for (let gap = n/2; gap > 0; gap /= 2) {
    for (let i = gap; i < n; i++) {
      let temp = arr[i], j;
      for (j = i; j>=gap && arr[j-gap]>temp; j-=gap) {
        arr[j] = arr[j-gap];
      }
      arr[j] = temp;
    }
  }
}`
  },
  [AlgorithmType.GNOME_SORT]: {
    id: AlgorithmType.GNOME_SORT,
    name: 'Gnome Sort',
    description: 'A rhythmic algorithm that moves like a garden gnome.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: `function gnomeSort(arr) {
  let i = 0;
  while (i < arr.length) {
    if (i == 0 || arr[i] >= arr[i-1]) i++;
    else {
      [arr[i], arr[i-1]] = [arr[i-1], arr[i]];
      i--;
    }
  }
}`
  },
  [AlgorithmType.RADIX_SORT]: {
    id: AlgorithmType.RADIX_SORT,
    name: 'Radix Sort',
    description: 'Non-comparison sort that organizes data by individual digits.',
    timeComplexity: 'O(nk)',
    spaceComplexity: 'O(n+k)',
    code: `function radixSort(arr) {
  let max = Math.max(...arr);
  for (let exp = 1; max/exp > 0; exp *= 10) {
    countSort(arr, exp);
  }
}`
  },
  [AlgorithmType.BITONIC_SORT]: {
    id: AlgorithmType.BITONIC_SORT,
    name: 'Bitonic Sort',
    description: 'A parallel sorting algorithm that creates symmetrical patterns.',
    timeComplexity: 'O(log² n)',
    spaceComplexity: 'O(n log² n)',
    code: `function bitonicSort(low, cnt, dir) {
  if (cnt > 1) {
    let k = cnt/2;
    bitonicSort(low, k, 1);
    bitonicSort(low+k, k, 0);
    bitonicMerge(low, cnt, dir);
  }
}`
  },
  [AlgorithmType.ODD_EVEN_SORT]: {
    id: AlgorithmType.ODD_EVEN_SORT,
    name: 'Odd-Even Sort',
    description: 'A pulsing "brick" sort that compares alternating pairs.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: `function oddEvenSort(arr) {
  let sorted = false;
  while (!sorted) {
    sorted = true;
    for (let i=1; i<arr.length-1; i+=2) {
      if (arr[i] > arr[i+1]) swap(i, i+1);
    }
    for (let i=0; i<arr.length-1; i+=2) {
      if (arr[i] > arr[i+1]) swap(i, i+1);
    }
  }
}`
  },
  [AlgorithmType.PANCAKE_SORT]: {
    id: AlgorithmType.PANCAKE_SORT,
    name: 'Pancake Sort',
    description: 'Sorts by repeatedly flipping the array from the top.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: `function pancakeSort(arr) {
  for (let curr = arr.length; curr > 1; --curr) {
    let mi = findMax(arr, curr);
    if (mi != curr-1) {
      flip(arr, mi);
      flip(arr, curr-1);
    }
  }
}`
  },
  [AlgorithmType.STOOGE_SORT]: {
    id: AlgorithmType.STOOGE_SORT,
    name: 'Stooge Sort',
    description: 'A recursive 2/3 sort that is brutally inefficient and funny.',
    timeComplexity: 'O(n^2.7)',
    spaceComplexity: 'O(n)',
    code: `function stoogeSort(arr, l, h) {
  if (arr[l] > arr[h]) swap(l, h);
  if (h - l + 1 > 2) {
    let t = Math.floor((h - l + 1) / 3);
    stoogeSort(arr, l, h-t);
    stoogeSort(arr, l+t, h);
    stoogeSort(arr, l, h-t);
  }
}`
  },
  [AlgorithmType.COMB_SORT]: {
    id: AlgorithmType.COMB_SORT,
    name: 'Comb Sort',
    description: 'A Bubble Sort variation that uses gaps to kill "turtles".',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: `function combSort(arr) {
  let gap = arr.length;
  while (gap > 1 || !sorted) {
    gap = Math.floor(gap / 1.3);
    for (let i=0; i+gap < arr.length; i++) {
      if (arr[i] > arr[i+gap]) swap(i, i+gap);
    }
  }
}`
  },
  [AlgorithmType.CYCLE_SORT]: {
    id: AlgorithmType.CYCLE_SORT,
    name: 'Cycle Sort',
    description: 'An in-place sorting algorithm with the minimum number of writes to the memory.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: `function cycleSort(arr) {
  for (let start=0; start <= n-2; start++) {
    let item = arr[start], pos = start;
    for (let i=start+1; i<n; i++)
      if (arr[i] < item) pos++;
    // ... move item to correct position using cycles
  }
}`
  },
  [AlgorithmType.BINARY_INSERTION_SORT]: {
    id: AlgorithmType.BINARY_INSERTION_SORT,
    name: 'Binary Insertion Sort',
    description: 'A variation of Insertion Sort that uses binary search to find the correct location.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    code: `function binaryInsertionSort(arr) {
  for (let i=1; i<n; i++) {
    let key = arr[i];
    let pos = binarySearch(arr, key, 0, i-1);
    // ... shift and insert
  }
}`
  },
  [AlgorithmType.SLOW_SORT]: {
    id: AlgorithmType.SLOW_SORT,
    name: 'Slow Sort',
    description: 'A "multiply and surrender" joke algorithm that is comically inefficient.',
    timeComplexity: 'O(n^(log n))',
    spaceComplexity: 'O(n)',
    code: `function slowSort(i, j) {
  if (i >= j) return;
  let m = Math.floor((i+j)/2);
  slowSort(i, m);
  slowSort(m+1, j);
  if (arr[j] < arr[m]) swap(j, m);
  slowSort(i, j-1);
}`
  }
};

export const ARRAY_SIZE = 12;
export const MAX_VALUE = 100;
export const SPEEDS = [600, 200, 50, 5];
