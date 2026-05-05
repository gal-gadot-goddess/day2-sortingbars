
import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import ffmpeg from 'ffmpeg-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Extract algorithm, theme, and size from command line arguments or use defaults
const args = process.argv.slice(2);
const SELECTED_ALGO = args[0] || 'bubble_sort';
const SELECTED_THEME = args[1] || 'vampire';
const SELECTED_SIZE = args[2] || '12';

const VIDEO_ONLY = path.join(__dirname, 'temp_video.mp4');
const AUDIO_ONLY = path.join(__dirname, 'temp_audio.webm');
const FINAL_OUTPUT = path.join(__dirname, `output_${SELECTED_ALGO}_${SELECTED_THEME}.mp4`);

(async () => {
    console.log(`🚀 Launching Capture Engine: [${SELECTED_ALGO}] with [${SELECTED_THEME}] theme and [${SELECTED_SIZE}] elements...`);
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--window-size=1080,1920',
            '--no-sandbox',
            '--autoplay-policy=no-user-gesture-required',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });

    page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
    page.on('pageerror', err => console.error(`[BROWSER ERR] ${err.message}`));

    const audioChunks = [];
    await page.exposeFunction('sendAudioChunk', (base64) => {
        audioChunks.push(Buffer.from(base64, 'base64'));
    });

    console.log('📡 Navigating to Application...');
    const url = `http://localhost:3002/?recording=true&algo=${SELECTED_ALGO}&theme=${SELECTED_THEME}&size=${SELECTED_SIZE}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log('🎙️ Injecting Audio & Video Sync Logic...');
    await page.evaluate(() => {
        window.startAudioCapture = () => {
            const audioService = window.audioService;
            if (!audioService) return console.error('audioService not found');

            audioService.init();
            const audioCtx = audioService.ctx;
            const masterGain = audioService.masterGain;

            const dest = audioCtx.createMediaStreamDestination();
            masterGain.connect(dest);

            const recorder = new MediaRecorder(dest.stream, { mimeType: 'audio/webm' });
            recorder.ondataavailable = async (e) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result.split(',')[1];
                    window.sendAudioChunk(base64);
                };
                reader.readAsDataURL(e.data);
            };
            recorder.start(1000);
            window._audioRecorder = recorder;
            console.log('Browser audio recording active');
        };
    });

    console.log('🖱️ Activating and Starting Sort...');
    await page.click('body');

    const videoRecorder = new PuppeteerScreenRecorder(page, {
        fps: 60,
        videoFrame: { width: 1080, height: 1920 },
        videoBitrate: 8000,
        audio: false
    });

    console.log('🎬 Starting Capture...');
    await videoRecorder.start(VIDEO_ONLY);
    await new Promise(r => setTimeout(r, 150));

    await page.evaluate(() => {
        if (typeof window.startEverything === 'function') {
            window.startEverything();
        } else {
            console.error('window.startEverything not found, falling back');
            if (window.startSorting) window.startSorting();
            if (window.startAudioCapture) window.startAudioCapture();
        }
    });

    console.log('⏳ Recording in progress...');
    
    // Safety Race: Wait for sorting signal OR a hard 75-second timeout
    await Promise.race([
        page.waitForFunction(() => window.isSortingCompleted === true, { timeout: 300000 }),
        new Promise(r => setTimeout(r, 75000)) // Force stop after 75s
    ]).catch(e => console.log('⚠️ Signal wait timed out or failed, proceeding to stop.'));

    console.log('✨ Sort finished. Capturing finale...');
    await new Promise(r => setTimeout(r, 2000));

    console.log('🛑 Stopping...');
    await videoRecorder.stop();
    await page.evaluate(() => {
        if (window._audioRecorder && window._audioRecorder.state !== 'inactive') {
            window._audioRecorder.stop();
        }
    });

    // Give some time for chunks to finalize
    await new Promise(r => setTimeout(r, 1000));

    if (audioChunks.length > 0) {
        fs.writeFileSync(AUDIO_ONLY, Buffer.concat(audioChunks));
        console.log('🎬 Merging with FFmpeg (Ultra-Sync)...');
        try {
            execSync(`"${ffmpeg}" -y -i "${VIDEO_ONLY}" -i "${AUDIO_ONLY}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k "${FINAL_OUTPUT}"`);
            console.log(`✅ COMPLETE! Saved to: ${FINAL_OUTPUT}`);
        } catch (e) {
            console.error('Merge failed:', e.message);
        }
    } else {
        console.error('❌ No audio captured!');
        fs.renameSync(VIDEO_ONLY, FINAL_OUTPUT);
    }

    await browser.close();
    if (fs.existsSync(VIDEO_ONLY)) fs.unlinkSync(VIDEO_ONLY);
    if (fs.existsSync(AUDIO_ONLY)) fs.unlinkSync(AUDIO_ONLY);
    process.exit(0);
})().catch(err => {
    console.error('💥 Error:', err);
    process.exit(1);
});
