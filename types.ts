
export type SortStep = {
  array: number[];
  comparingIndices: number[];
  swappingIndices: number[];
  sortedIndices: number[];
  currentLine?: number;
};

export type AlgorithmInfo = {
  id: string;
  name: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  code: string;
};

export enum AlgorithmType {
  BUBBLE_SORT = 'bubble_sort',
  QUICK_SORT = 'quick_sort',
  INSERTION_SORT = 'insertion_sort',
  TIM_SORT = 'tim_sort',
  SELECTION_SORT = 'selection_sort',
  MERGE_SORT = 'merge_sort',
  HEAP_SORT = 'heap_sort',
  BOGO_SORT = 'bogo_sort',
  COCKTAIL_SORT = 'cocktail_sort',
  SHELL_SORT = 'shell_sort',
  RADIX_SORT = 'radix_sort',
  GNOME_SORT = 'gnome_sort',
  BITONIC_SORT = 'bitonic_sort',
  ODD_EVEN_SORT = 'odd_even_sort',
  PANCAKE_SORT = 'pancake_sort',
  STOOGE_SORT = 'stooge_sort',
  COMB_SORT = 'comb_sort',
  CYCLE_SORT = 'cycle_sort',
  BINARY_INSERTION_SORT = 'binary_insertion_sort',
  SLOW_SORT = 'slow_sort'
}
