
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const HISTORY_FILE = path.join(__dirname, 'history.json');

const ALGORITHMS = [
    { id: 'bubble_sort', name: 'Bubble Sort', desc: 'Simple comparison-based sorting that bubbles up the largest element.' },
    { id: 'insertion_sort', name: 'Insertion Sort', desc: 'Builds the sorted array one element at a time by inserting in the correct spot.' },
    { id: 'cocktail_sort', name: 'Cocktail Sort', desc: 'A bidirectional variation of bubble sort that moves in both directions.' },
    { id: 'selection_sort', name: 'Selection Sort', desc: 'Repeatedly finds the minimum element and places it at the beginning.' },
    { id: 'merge_sort', name: 'Merge Sort', desc: 'Efficient divide-and-conquer algorithm that splits and merges arrays.' },
    { id: 'quick_sort', name: 'Quick Sort', desc: 'High-speed sorting using partitioning around a pivot element.' },
    { id: 'tim_sort', name: 'Tim Sort', desc: 'Advanced hybrid algorithm used in Python and Java for real-world data.' },
    { id: 'heap_sort', name: 'Heap Sort', desc: 'Uses a binary heap data structure to find the max/min elements efficiently.' },
    { id: 'bogo_sort', name: 'Bogo Sort', desc: 'Randomly shuffles the array until it happens to be sorted (Mostly for comedy).' },
    { id: 'shell_sort', name: 'Shell Sort', desc: 'Efficient variation of insertion sort that uses shrinking gaps.' },
    { id: 'gnome_sort', name: 'Gnome Sort', desc: 'Rhythmic sorting algorithm that moves like a garden gnome.' },
    { id: 'radix_sort', name: 'Radix Sort', desc: 'Non-comparison sort that organizes data by individual digits.' },
    { id: 'bitonic_sort', name: 'Bitonic Sort', desc: 'Parallel sorting algorithm creating beautiful symmetrical patterns.' },
    { id: 'odd_even_sort', name: 'Odd-Even Sort', desc: 'A pulsing "brick" sort comparing alternating pairs.' },
    { id: 'pancake_sort', name: 'Pancake Sort', desc: 'Sorts by repeatedly flipping the array from the top.' },
    { id: 'stooge_sort', name: 'Stooge Sort', desc: 'Recursive 2/3 sort that is brutally inefficient and funny.' },
    { id: 'comb_sort', name: 'Comb Sort', desc: 'Bubble sort variation using gaps to move elements faster.' },
    { id: 'cycle_sort', name: 'Cycle Sort', desc: 'Minimal write algorithm that sorts in discrete cycles.' },
    { id: 'binary_insertion_sort', name: 'Binary Insertion Sort', desc: 'Intelligent version of insertion sort using binary search.' },
    { id: 'slow_sort', name: 'Slow Sort', desc: 'A "multiply and surrender" joke algorithm that is comically slow.' }
];

const THEMES = ['vampire', 'cyberpunk', 'sunset', 'frost'];

function loadHistory() {
    if (!fs.existsSync(HISTORY_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}

function saveHistory(item) {
    const history = loadHistory();
    history.push({ ...item, date: new Date().toISOString() });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        console.log(`[EXEC] ${command} ${args.join(' ')}`);
        const proc = spawn(command, args, {
            env: { ...process.env, ...options.env },
            ...options,
            shell: true
        });

        let output = "";
        proc.stdout.on('data', d => {
            output += d.toString();
            console.log(d.toString());
        });
        proc.stderr.on('data', d => {
            output += d.toString();
            console.error(d.toString());
        });

        proc.on('close', code => {
            if (code === 0) resolve();
            else {
                console.error(`❌ FAILED: ${command} ${args.join(' ')} with code ${code}`);
                reject(new Error(`${command} failed. Output: ${output.slice(-500)}`));
            }
        });
    });
}

async function automateDay2() {
    const history = loadHistory();
    const usedCombos = new Set(history.map(h => `${h.algo}:${h.theme}`));

    let selectedAlgo = null;
    let selectedTheme = null;

    // Shuffle and pick a new combo
    const algos = [...ALGORITHMS].sort(() => Math.random() - 0.5);
    const themes = [...THEMES].sort(() => Math.random() - 0.5);

    for (const algo of algos) {
        for (const theme of themes) {
            if (!usedCombos.has(`${algo.id}:${theme}`)) {
                selectedAlgo = algo;
                selectedTheme = theme;
                break;
            }
        }
        if (selectedAlgo) break;
    }

    if (!selectedAlgo) {
        console.log("⚠️ All combinations used! Resetting history to start fresh.");
        fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));
        return automateDay2();
    }

    console.log(`\n🌟 TUESDAY AUTOMATION (GENERATION ONLY): [${selectedAlgo.name}] with [${selectedTheme}] theme 🌟\n`);

    const videoName = `output_${selectedAlgo.id}_${selectedTheme}.mp4`;
    const videoPath = path.join(__dirname, videoName);

    // Variation: Random Array Size between 10 and 25
    const selectedSize = Math.floor(Math.random() * (25 - 10 + 1)) + 10;

    try {
        // 1. Generate Video
        console.log(`🎥 [1/2] Generating Video (Size: ${selectedSize})...`);
        await runCommand('node', ['capture_demo.js', selectedAlgo.id, selectedTheme, selectedSize], { cwd: __dirname });

        // 2. Generate AI Metadata
        console.log("🤖 [2/2] Generating AI Metadata...");
        const metaScript = 'scripts/generate_ai_metadata.mjs';
        await runCommand('node', ["\"" + metaScript + "\"", `"${selectedAlgo.name}"`, `"${selectedAlgo.desc}"`], { cwd: __dirname });

        // 3. Upload
        console.log("🚀 [3/3] Uploading Video to Social Media...");
        const uploadScript = 'scripts/unified_uploader.py';
        await runCommand('python', ["\"" + uploadScript + "\"", videoPath], { cwd: __dirname });

        // 4. Update History
        saveHistory({
            algo: selectedAlgo.id,
            theme: selectedTheme,
            size: selectedSize
        });
        console.log("\n✅ Tuesday (Day 2) Generation Success!");
        console.log(`📂 Video: ${videoPath}`);
        console.log(`📂 Metadata: metadata.json`);

    } catch (error) {
        console.error("💥 Automation failed:", error);
        process.exit(1);
    }
}

if (require.main === module) {
    automateDay2();
}
