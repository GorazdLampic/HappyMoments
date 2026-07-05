/**
 * storyVideo.js — PROTOTYPE animated 9:16 (1080×1920) milestone video for
 * Instagram/TikTok Stories & Reels. Renders an animated card to a canvas and
 * records it with MediaRecorder + captureStream.
 *
 * HONEST format caveat: Safari/iOS records MP4 (Instagram-ready ✅). Chrome/Edge/
 * Android record WebM — many apps accept it, but Instagram's uploader may not, so
 * on those a follow-up MP4 path (ffmpeg.wasm or a server render) is the
 * production step. This prototype ships the best format each browser supports.
 */

function _svTheme(opts) {
    const key = (opts && opts.theme) || (typeof getCardTheme === 'function' ? getCardTheme() : 'dark');
    if (typeof CARD_CONFIG !== 'undefined' && CARD_CONFIG.themes && CARD_CONFIG.themes[key]) return CARD_CONFIG.themes[key];
    return { bgGradient: ['#141414', '#241f17'], accent: '#d4b876', text: '#e8e4dc', muted: '#8a8a8a', highlight: '#a8c0a8' };
}

// Returns a Promise<{ blob, mime, ext }>.
function generateStoryVideo(milestone, opts) {
    opts = opts || {};
    return new Promise((resolve, reject) => {
        if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
            reject(new Error('recording-unsupported'));
            return;
        }
        const W = 1080, H = 1920, FPS = 30;
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');
        const theme = _svTheme(opts);

        const value = Number(milestone.value) || 0;
        const finalVal = (typeof formatMilestoneValue === 'function') ? formatMilestoneValue(value) : value.toLocaleString();
        const unit = (typeof localizedUnit === 'function') ? localizedUnit(value, milestone.unitName) : (milestone.unitName || '');
        const name = (milestone.eventName && milestone.eventName !== 'Me') ? String(milestone.eventName) : '';
        const dateStr = milestone.date ? (milestone.date instanceof Date ? milestone.date : new Date(milestone.date)).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';

        // Confetti seeded deterministically (no Math.random dependence for look).
        const confetti = [];
        for (let i = 0; i < 90; i++) {
            confetti.push({ x: (i * 137.5) % W, y: -((i * 53) % H) - 40, r: 6 + (i % 5) * 3, vy: 6 + (i % 7), sway: (i % 2 ? 1 : -1) * (1 + (i % 3)), c: [theme.accent, theme.highlight, '#ffffff', theme.text][i % 4] });
        }

        const stream = canvas.captureStream(FPS);
        const prefer = ['video/mp4;codecs=h264', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
        const mime = prefer.find(t => { try { return MediaRecorder.isTypeSupported(t); } catch (e) { return false; } }) || '';
        let rec;
        try { rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 8000000 } : undefined); }
        catch (e) { reject(e); return; }
        const chunks = [];
        rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = () => {
            const type = (mime.split(';')[0]) || 'video/webm';
            resolve({ blob: new Blob(chunks, { type }), mime: type, ext: type.indexOf('mp4') >= 0 ? 'mp4' : 'webm' });
        };
        rec.onerror = () => reject(new Error('record-error'));

        const DUR = 4600;            // total ms
        const clamp = (x) => Math.max(0, Math.min(1, x));
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);
        let start = null;

        function frame(now) {
            if (start === null) start = now;
            const el = now - start;
            const t = clamp(el / DUR);

            // Background
            const g = ctx.createLinearGradient(0, 0, W, H);
            g.addColorStop(0, theme.bgGradient[0]); g.addColorStop(1, theme.bgGradient[1]);
            ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

            // Subtle frame
            ctx.save(); ctx.globalAlpha = 0.18; ctx.strokeStyle = theme.accent; ctx.lineWidth = 3;
            if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(48, 48, W - 96, H - 96, 28); ctx.stroke(); }
            ctx.restore();

            ctx.textAlign = 'center';
            const cY = H * 0.44;

            // Name
            if (name) {
                ctx.globalAlpha = clamp((el - 200) / 500);
                ctx.fillStyle = theme.highlight;
                let nf = 132; ctx.font = `italic ${nf}px "EB Garamond", Georgia, serif`;
                while (ctx.measureText(name).width > W - 140 && nf > 60) { nf -= 6; ctx.font = `italic ${nf}px "EB Garamond", Georgia, serif`; }
                ctx.fillText(name, W / 2, H * 0.31);
                ctx.globalAlpha = 1;
            }

            // Count-up number (0.3s → 2.5s), then snap to the app's formatted value
            const countT = clamp((el - 300) / 2200);
            const showVal = countT >= 1 ? finalVal : Math.floor(easeOut(countT) * value).toLocaleString();
            const pop = 1 + 0.06 * Math.sin(clamp((el - 2400) / 260) * Math.PI); // little pop when it lands
            ctx.save();
            ctx.translate(W / 2, cY);
            ctx.scale(pop, pop);
            ctx.fillStyle = theme.accent;
            let fs = 210; ctx.font = `300 ${fs}px "Helvetica Neue", Arial, sans-serif`;
            while (ctx.measureText(showVal).width > W - 150 && fs > 70) { fs -= 8; ctx.font = `300 ${fs}px "Helvetica Neue", Arial, sans-serif`; }
            ctx.fillText(showVal, 0, 0);
            ctx.restore();

            // Unit
            if (unit) {
                ctx.globalAlpha = clamp((el - 2450) / 500);
                ctx.fillStyle = theme.text;
                ctx.font = 'italic 156px "EB Garamond", Georgia, serif';
                ctx.fillText(unit, W / 2, cY + 175);
                ctx.globalAlpha = 1;
            }

            // Date + brand
            if (dateStr) {
                ctx.globalAlpha = clamp((el - 3000) / 600);
                ctx.fillStyle = theme.muted;
                ctx.font = '84px "EB Garamond", Georgia, serif';
                ctx.fillText(dateStr, W / 2, H * 0.73);
                ctx.globalAlpha = 1;
            }
            ctx.globalAlpha = clamp((el - 3400) / 600) * 0.85;
            ctx.fillStyle = theme.muted;
            ctx.font = '72px "EB Garamond", Georgia, serif';
            ctx.fillText('nicenumbers.app', W / 2, H - 130);
            ctx.globalAlpha = 1;

            // Confetti burst once the number lands
            if (el > 2400) {
                confetti.forEach(p => {
                    p.y += p.vy; p.x += Math.sin((el / 300) + p.y / 120) * p.sway;
                    ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = p.c;
                    ctx.beginPath(); ctx.rect(p.x, p.y, p.r, p.r * 1.6); ctx.fill(); ctx.restore();
                });
            }

            if (opts.onProgress) { try { opts.onProgress(t); } catch (e) {} }

            if (t < 1) requestAnimationFrame(frame);
            else setTimeout(() => { try { rec.stop(); } catch (e) {} }, 150);
        }

        try { rec.start(); } catch (e) { reject(e); return; }
        requestAnimationFrame(frame);
    });
}

if (typeof window !== 'undefined') window.generateStoryVideo = generateStoryVideo;
if (typeof module !== 'undefined' && module.exports) module.exports = { generateStoryVideo };
