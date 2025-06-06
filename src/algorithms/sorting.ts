export interface Step {
    array: number[];
    comparingIndices: number[];
    swappedIndices: number[];
}

const swap = (arr: number[], i: number, j: number) => {
    [arr[i], arr[j]] = [arr[j], arr[i]];
};

export const bubbleSort = (array: number[]): Step[] => {
    const steps: Step[] = [];
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            steps.push({
                array: [...arr],
                comparingIndices: [j, j + 1],
                swappedIndices: [],
            });

            if (arr[j] > arr[j + 1]) {
                swap(arr, j, j + 1);
                steps.push({
                    array: [...arr],
                    comparingIndices: [],
                    swappedIndices: [j, j + 1],
                });
            }
        }
    }

    return steps;
};

export const quickSort = (array: number[]): Step[] => {
    const steps: Step[] = [];
    const arr = [...array];

    const partition = (low: number, high: number): number => {
        const pivot = arr[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            steps.push({
                array: [...arr],
                comparingIndices: [j, high],
                swappedIndices: [],
            });

            if (arr[j] < pivot) {
                i++;
                swap(arr, i, j);
                steps.push({
                    array: [...arr],
                    comparingIndices: [],
                    swappedIndices: [i, j],
                });
            }
        }

        swap(arr, i + 1, high);
        steps.push({
            array: [...arr],
            comparingIndices: [],
            swappedIndices: [i + 1, high],
        });

        return i + 1;
    };

    const quickSortHelper = (low: number, high: number) => {
        if (low < high) {
            const pi = partition(low, high);
            quickSortHelper(low, pi - 1);
            quickSortHelper(pi + 1, high);
        }
    };

    quickSortHelper(0, arr.length - 1);
    return steps;
};

export const mergeSort = (array: number[]): Step[] => {
    const steps: Step[] = [];
    const arr = [...array];

    const merge = (left: number, mid: number, right: number) => {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        let i = 0;
        let j = 0;
        let k = left;

        while (i < leftArr.length && j < rightArr.length) {
            steps.push({
                array: [...arr],
                comparingIndices: [left + i, mid + 1 + j],
                swappedIndices: [],
            });

            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
            }

            steps.push({
                array: [...arr],
                comparingIndices: [],
                swappedIndices: [k],
            });
            k++;
        }

        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            steps.push({
                array: [...arr],
                comparingIndices: [],
                swappedIndices: [k],
            });
            i++;
            k++;
        }

        while (j < rightArr.length) {
            arr[k] = rightArr[j];
            steps.push({
                array: [...arr],
                comparingIndices: [],
                swappedIndices: [k],
            });
            j++;
            k++;
        }
    };

    const mergeSortHelper = (left: number, right: number) => {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            mergeSortHelper(left, mid);
            mergeSortHelper(mid + 1, right);
            merge(left, mid, right);
        }
    };

    mergeSortHelper(0, arr.length - 1);
    return steps;
};

export const heapSort = (array: number[]): Step[] => {
    const steps: Step[] = [];
    const arr = [...array];

    const heapify = (n: number, i: number) => {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        steps.push({
            array: [...arr],
            comparingIndices: [i, left, right].filter(x => x < n),
            swappedIndices: [],
        });

        if (left < n && arr[left] > arr[largest]) {
            largest = left;
        }

        if (right < n && arr[right] > arr[largest]) {
            largest = right;
        }

        if (largest !== i) {
            swap(arr, i, largest);
            steps.push({
                array: [...arr],
                comparingIndices: [],
                swappedIndices: [i, largest],
            });
            heapify(n, largest);
        }
    };

    // Build max heap
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
        heapify(arr.length, i);
    }

    // Extract elements from heap one by one
    for (let i = arr.length - 1; i > 0; i--) {
        swap(arr, 0, i);
        steps.push({
            array: [...arr],
            comparingIndices: [],
            swappedIndices: [0, i],
        });
        heapify(i, 0);
    }

    return steps;
};