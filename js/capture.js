/* VideoFrame Studio - Frame Extraction & Filmstrip Generator */
class FrameCaptureEngine {

  static formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00:00.000';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    const pad = (n, len = 2) => String(n).padStart(len, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`;
  }

  static captureFrame(video, addTimestamp = false, customText = '') {
    if (!video || !video.videoWidth || !video.videoHeight) return null;

    const width = video.videoWidth;
    const height = video.videoHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    if (addTimestamp) {
      const timeStr = FrameCaptureEngine.formatTime(video.currentTime);
      const fontSize = Math.max(14, Math.floor(height / 36));
      ctx.font = `600 ${fontSize}px "Fira Code", monospace`;
      
      const padding = fontSize * 0.6;
      const textWidth = ctx.measureText(timeStr).width;
      const x = width - textWidth - padding * 2 - 20;
      const y = height - padding * 2 - 20;

      // Backdrop pill
      ctx.fillStyle = 'rgba(11, 13, 20, 0.8)';
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, textWidth + padding * 2, fontSize + padding, 6);
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.fillStyle = '#06b6d4';
      ctx.fillText(timeStr, x + padding, y + fontSize);
    }

    return {
      dataUrl: canvas.toDataURL('image/png'),
      width,
      height,
      timestampStr: FrameCaptureEngine.formatTime(video.currentTime),
      timeSeconds: video.currentTime
    };
  }

  static async seekToTime(video, timeSec) {
    return new Promise((resolve) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        // Small delay to ensure canvas frame is rendered cleanly
        setTimeout(resolve, 50);
      };
      video.addEventListener('seeked', onSeeked);
      video.currentTime = Math.min(Math.max(0, timeSec), video.duration || 0);
    });
  }

  static async batchCapture(video, options, onProgress) {
    if (!video || !video.duration) return [];

    const duration = video.duration;
    const startTime = Math.max(0, parseFloat(options.startTime) || 0);
    const endTime = options.endTime ? Math.min(duration, parseFloat(options.endTime)) : duration;
    
    let timestamps = [];

    if (options.mode === 'interval') {
      const interval = Math.max(0.1, parseFloat(options.interval) || 2);
      for (let t = startTime; t <= endTime; t += interval) {
        timestamps.push(t);
      }
    } else if (options.mode === 'count') {
      const count = Math.max(2, parseInt(options.count) || 10);
      const step = (endTime - startTime) / (count - 1 || 1);
      for (let i = 0; i < count; i++) {
        timestamps.push(startTime + i * step);
      }
    }

    const wasPaused = video.paused;
    video.pause();
    const originalTime = video.currentTime;

    const results = [];
    for (let i = 0; i < timestamps.length; i++) {
      const t = timestamps[i];
      await FrameCaptureEngine.seekToTime(video, t);
      const frame = FrameCaptureEngine.captureFrame(video, options.addTimestamp);
      if (frame) results.push(frame);

      if (onProgress) {
        onProgress(Math.round(((i + 1) / timestamps.length) * 100), i + 1, timestamps.length);
      }
    }

    // Restore original video state
    await FrameCaptureEngine.seekToTime(video, originalTime);
    if (!wasPaused) video.play();

    return results;
  }

  static async generateFilmstrip(video, cols = 3, rows = 3, showTime = true, showHeader = true) {
    if (!video || !video.duration) return null;

    const totalFrames = cols * rows;
    const duration = video.duration;
    const step = duration / (totalFrames + 1);

    const timestamps = [];
    for (let i = 1; i <= totalFrames; i++) {
      timestamps.push(i * step);
    }

    const wasPaused = video.paused;
    video.pause();
    const originalTime = video.currentTime;

    // Frame Dimensions
    const frameW = 480;
    const frameH = Math.round((video.videoHeight / video.videoWidth) * frameW) || 270;
    const gap = 16;
    const headerHeight = showHeader ? 80 : 20;
    const padding = 24;

    const canvasW = cols * frameW + (cols - 1) * gap + padding * 2;
    const canvasH = rows * frameH + (rows - 1) * gap + padding * 2 + headerHeight;

    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');

    // Background Gradient (Soft Slate Theme)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasH);
    bgGrad.addColorStop(0, '#e2e8f0');
    bgGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Render Header
    if (showHeader) {
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 24px "Outfit", sans-serif';
      ctx.fillText('VIDEO FILMSTRIP SUMMARY', padding, padding + 30);

      ctx.fillStyle = '#475569';
      ctx.font = '500 13px "Inter", sans-serif';
      const meta = `时长: ${FrameCaptureEngine.formatTime(duration)} | 分辨率: ${video.videoWidth}x${video.videoHeight} | 帧数: ${totalFrames} 帧快照`;
      ctx.fillText(meta, padding, padding + 54);

      // Line
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, padding + 68);
      ctx.lineTo(canvasW - padding, padding + 68);
      ctx.stroke();
    }

    // Render Frames Grid
    for (let idx = 0; idx < timestamps.length; idx++) {
      const t = timestamps[idx];
      await FrameCaptureEngine.seekToTime(video, t);

      const r = Math.floor(idx / cols);
      const c = idx % cols;

      const x = padding + c * (frameW + gap);
      const y = padding + headerHeight + r * (frameH + gap);

      // Draw Frame Image
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 12;
      ctx.drawImage(video, x, y, frameW, frameH);
      ctx.restore();

      // Border around frame
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, frameW, frameH);

      // Timestamp Tag
      if (showTime) {
        const timeStr = FrameCaptureEngine.formatTime(t);
        ctx.font = '600 12px "Fira Code", monospace';
        const tw = ctx.measureText(timeStr).width;
        
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(x + 8, y + frameH - 28, tw + 12, 20);
        
        ctx.fillStyle = '#06b6d4';
        ctx.fillText(timeStr, x + 14, y + frameH - 14);
      }
    }

    // Restore original video state
    await FrameCaptureEngine.seekToTime(video, originalTime);
    if (!wasPaused) video.play();

    return canvas.toDataURL('image/png');
  }

}

window.FrameCaptureEngine = FrameCaptureEngine;
