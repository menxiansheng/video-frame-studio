/* VideoFrame Studio - Main Application Logic */
document.addEventListener('DOMContentLoaded', () => {
  
  // Elements Reference
  const videoPlayer = document.getElementById('videoPlayer');
  const videoStage = document.getElementById('videoStage');
  const dropzone = document.getElementById('dropzone');
  const videoFileInput = document.getElementById('videoFileInput');
  const btnChooseVideo = document.getElementById('btnChooseVideo');
  const btnLoadSample = document.getElementById('btnLoadSample');
  const btnShortcuts = document.getElementById('btnShortcuts');

  // Controls Elements
  const btnPlayPause = document.getElementById('btnPlayPause');
  const iconPlayPause = document.getElementById('iconPlayPause');
  const timelineSlider = document.getElementById('timelineSlider');
  const timeDisplay = document.getElementById('timeDisplay');
  const selectSpeed = document.getElementById('selectSpeed');
  const selectFps = document.getElementById('selectFps');

  // Steppers
  const btnStepBack10 = document.getElementById('btnStepBack10');
  const btnStepBack1 = document.getElementById('btnStepBack1');
  const btnStepFramePrev = document.getElementById('btnStepFramePrev');
  const btnStepFrameNext = document.getElementById('btnStepFrameNext');
  const btnStepFwd1 = document.getElementById('btnStepFwd1');
  const btnStepFwd10 = document.getElementById('btnStepFwd10');

  // Action Buttons
  const btnCaptureCurrent = document.getElementById('btnCaptureCurrent');
  const btnOpenAnnotator = document.getElementById('btnOpenAnnotator');
  const btnOpenBatchModal = document.getElementById('btnOpenBatchModal');
  const btnOpenFilmstripModal = document.getElementById('btnOpenFilmstripModal');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  // Initialize Sub-systems
  const gallery = new GalleryManager();
  const annotator = new Annotator('annotationCanvas');

  let currentFps = 30;
  let videoFileName = 'sample_video';
  let filmstripDataUrl = null;

  // Toast Function
  window.showToast = function(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-circle';

    toast.innerHTML = `<i data-lucide="${iconName}" size="18"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // Video Load Handlers
  function loadVideoFile(file) {
    if (!file) return;
    videoFileName = file.name.replace(/\.[^/.]+$/, "");
    const url = URL.createObjectURL(file);
    videoPlayer.src = url;
    dropzone.style.display = 'none';
    showToast(`成功加载视频: ${file.name}`, 'success');
  }

  if (btnChooseVideo) {
    btnChooseVideo.addEventListener('click', () => videoFileInput.click());
  }

  if (videoFileInput) {
    videoFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        loadVideoFile(e.target.files[0]);
      }
    });
  }

  // Drag & Drop Handlers
  videoStage.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  videoStage.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  videoStage.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadVideoFile(e.dataTransfer.files[0]);
    }
  });

  // Synthetic Sample Video Generator (for instant zero-file demo testing!)
  function createSampleCanvasVideo() {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      videoFileName = 'Sample_Cyberpunk_Motion';
      videoPlayer.src = URL.createObjectURL(blob);
      dropzone.style.display = 'none';
      showToast('范例 Demo 视频已生成并成功加载！', 'success');
    };

    mediaRecorder.start();

    // Render 10 seconds of animated neon graphics
    let frame = 0;
    const totalFrames = 300; // 10 sec @ 30fps

    function drawNextFrame() {
      if (frame >= totalFrames) {
        mediaRecorder.stop();
        return;
      }

      // Background
      const time = frame / 30;
      const grad = ctx.createLinearGradient(0, 0, 1280, 720);
      grad.addColorStop(0, '#0b0d14');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      for (let x = 0; x < 1280; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 720);
        ctx.stroke();
      }

      // Animated Circle Orbit
      const cx = 640 + Math.cos(time * 2) * 300;
      const cy = 360 + Math.sin(time * 2) * 150;
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fill();

      // Title & Counter Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px Outfit, sans-serif';
      ctx.fillText('VIDEOFRAME STUDIO DEMO', 280, 320);

      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 36px "Fira Code", monospace';
      ctx.fillText(`FRAME #${String(frame + 1).padStart(3, '0')} | TIME: ${time.toFixed(3)}s`, 360, 400);

      frame++;
      requestAnimationFrame(drawNextFrame);
    }

    drawNextFrame();
  }

  if (btnLoadSample) {
    btnLoadSample.addEventListener('click', () => {
      showToast('正在生成范例视频，请稍候...', 'info');
      createSampleCanvasVideo();
    });
  }

  // Video Events & Timeline Sync
  videoPlayer.addEventListener('loadedmetadata', () => {
    timelineSlider.max = videoPlayer.duration;
    updateTimeDisplay();
  });

  videoPlayer.addEventListener('timeupdate', () => {
    if (!timelineSlider.isDragging) {
      timelineSlider.value = videoPlayer.currentTime;
    }
    updateTimeDisplay();
  });

  videoPlayer.addEventListener('play', () => {
    if (iconPlayPause) iconPlayPause.setAttribute('data-lucide', 'pause');
    if (window.lucide) window.lucide.createIcons();
  });

  videoPlayer.addEventListener('pause', () => {
    if (iconPlayPause) iconPlayPause.setAttribute('data-lucide', 'play');
    if (window.lucide) window.lucide.createIcons();
  });

  function updateTimeDisplay() {
    const cur = FrameCaptureEngine.formatTime(videoPlayer.currentTime || 0);
    const dur = FrameCaptureEngine.formatTime(videoPlayer.duration || 0);
    timeDisplay.textContent = `${cur} / ${dur}`;
  }

  // Playback Controls
  btnPlayPause.addEventListener('click', togglePlay);
  function togglePlay() {
    if (!videoPlayer.src) return;
    if (videoPlayer.paused) {
      videoPlayer.play();
    } else {
      videoPlayer.pause();
    }
  }

  timelineSlider.addEventListener('input', () => {
    timelineSlider.isDragging = true;
    updateTimeDisplay();
  });

  timelineSlider.addEventListener('change', () => {
    videoPlayer.currentTime = parseFloat(timelineSlider.value);
    timelineSlider.isDragging = false;
  });

  selectSpeed.addEventListener('change', (e) => {
    videoPlayer.playbackRate = parseFloat(e.target.value);
  });

  selectFps.addEventListener('change', (e) => {
    currentFps = parseInt(e.target.value);
  });

  // Step Controls Logic
  function stepTime(seconds) {
    if (!videoPlayer.src) return;
    videoPlayer.pause();
    videoPlayer.currentTime = Math.min(Math.max(0, videoPlayer.currentTime + seconds), videoPlayer.duration || 0);
  }

  function stepFrame(framesCount) {
    if (!videoPlayer.src) return;
    const frameTime = 1 / currentFps;
    stepTime(framesCount * frameTime);
  }

  btnStepBack10.addEventListener('click', () => stepTime(-10));
  btnStepBack1.addEventListener('click', () => stepTime(-1));
  btnStepFramePrev.addEventListener('click', () => stepFrame(-1));
  btnStepFrameNext.addEventListener('click', () => stepFrame(1));
  btnStepFwd1.addEventListener('click', () => stepTime(1));
  btnStepFwd10.addEventListener('click', () => stepTime(10));

  // Single Frame Capture Action
  btnCaptureCurrent.addEventListener('click', captureCurrent);
  function captureCurrent() {
    if (!videoPlayer.src || videoPlayer.readyState < 2) {
      showToast('请先加载视频文件', 'error');
      return;
    }
    const snap = FrameCaptureEngine.captureFrame(videoPlayer, false);
    if (snap) {
      gallery.addItem(snap.dataUrl, snap.timestampStr, snap.width, snap.height, videoFileName);
      showToast(`已成功截取帧: ${snap.timestampStr}`, 'success');
    }
  }

  // Modals Controller
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.dataset.close);
    });
  });

  // Modal Overlays click outside to close
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal.id);
    });
  });

  if (btnShortcuts) {
    btnShortcuts.addEventListener('click', () => openModal('modalShortcuts'));
  }

  // Batch Modal Logic
  if (btnOpenBatchModal) {
    btnOpenBatchModal.addEventListener('click', () => {
      if (!videoPlayer.src) {
        showToast('请先加载视频文件', 'error');
        return;
      }
      openModal('modalBatch');
    });
  }

  const batchModeSelect = document.getElementById('batchModeSelect');
  const groupBatchInterval = document.getElementById('groupBatchInterval');
  const groupBatchCount = document.getElementById('groupBatchCount');

  if (batchModeSelect) {
    batchModeSelect.addEventListener('change', (e) => {
      if (e.target.value === 'interval') {
        groupBatchInterval.style.display = 'flex';
        groupBatchCount.style.display = 'none';
      } else {
        groupBatchInterval.style.display = 'none';
        groupBatchCount.style.display = 'flex';
      }
    });
  }

  const btnStartBatch = document.getElementById('btnStartBatch');
  const batchProgressBox = document.getElementById('batchProgressBox');
  const batchProgressBar = document.getElementById('batchProgressBar');
  const batchProgressPercent = document.getElementById('batchProgressPercent');
  const batchProgressStatus = document.getElementById('batchProgressStatus');

  if (btnStartBatch) {
    btnStartBatch.addEventListener('click', async () => {
      if (!videoPlayer.src) return;

      const mode = batchModeSelect.value;
      const interval = parseFloat(document.getElementById('batchIntervalInput').value);
      const count = parseInt(document.getElementById('batchCountInput').value);
      const startTime = parseFloat(document.getElementById('batchStartTime').value) || 0;
      const endTime = parseFloat(document.getElementById('batchEndTime').value) || videoPlayer.duration;
      const addTimestamp = document.getElementById('batchTimestampCheck').checked;

      batchProgressBox.style.display = 'block';
      btnStartBatch.disabled = true;

      const results = await FrameCaptureEngine.batchCapture(videoPlayer, {
        mode,
        interval,
        count,
        startTime,
        endTime,
        addTimestamp
      }, (pct, current, total) => {
        batchProgressBar.style.width = pct + '%';
        batchProgressPercent.textContent = pct + '%';
        batchProgressStatus.textContent = `提取进度: ${current} / ${total} 帧`;
      });

      results.forEach(snap => {
        gallery.addItem(snap.dataUrl, snap.timestampStr, snap.width, snap.height, videoFileName);
      });

      batchProgressBox.style.display = 'none';
      btnStartBatch.disabled = false;
      closeModal('modalBatch');
      showToast(`批量提取完成！共生成 ${results.length} 张截图`, 'success');
    });
  }

  // Filmstrip Modal Logic
  if (btnOpenFilmstripModal) {
    btnOpenFilmstripModal.addEventListener('click', () => {
      if (!videoPlayer.src) {
        showToast('请先加载视频文件', 'error');
        return;
      }
      openModal('modalFilmstrip');
    });
  }

  const btnGenerateFilmstrip = document.getElementById('btnGenerateFilmstrip');
  const filmstripPreviewContainer = document.getElementById('filmstripPreviewContainer');
  const btnDownloadFilmstrip = document.getElementById('btnDownloadFilmstrip');

  if (btnGenerateFilmstrip) {
    btnGenerateFilmstrip.addEventListener('click', async () => {
      if (!videoPlayer.src) return;

      const cols = parseInt(document.getElementById('filmCols').value);
      const rows = parseInt(document.getElementById('filmRows').value);
      const showTime = document.getElementById('filmTimeCheck').checked;
      const showHeader = document.getElementById('filmHeaderCheck').checked;

      btnGenerateFilmstrip.disabled = true;
      filmstripPreviewContainer.innerHTML = '<span class="text-muted">正在渲染电影胶片，请稍候...</span>';

      filmstripDataUrl = await FrameCaptureEngine.generateFilmstrip(videoPlayer, cols, rows, showTime, showHeader);

      if (filmstripDataUrl) {
        filmstripPreviewContainer.innerHTML = `<img src="${filmstripDataUrl}" style="max-width:100%; max-height:100%; object-fit:contain; border-radius: var(--radius-md);">`;
        btnDownloadFilmstrip.disabled = false;
        showToast('电影胶片拼图生成成功！', 'success');
      } else {
        filmstripPreviewContainer.innerHTML = '<span class="text-danger">生成失败</span>';
      }

      btnGenerateFilmstrip.disabled = false;
    });
  }

  if (btnDownloadFilmstrip) {
    btnDownloadFilmstrip.addEventListener('click', () => {
      if (filmstripDataUrl) {
        const a = document.createElement('a');
        a.href = filmstripDataUrl;
        a.download = `filmstrip_${videoFileName}_${Date.now()}.png`;
        a.click();
      }
    });
  }

  // Annotator Modal Logic
  if (btnOpenAnnotator) {
    btnOpenAnnotator.addEventListener('click', () => {
      if (!videoPlayer.src) {
        showToast('请先加载视频文件', 'error');
        return;
      }
      const snap = FrameCaptureEngine.captureFrame(videoPlayer, false);
      if (snap) {
        window.openAnnotatorWithImage(snap.dataUrl, snap.timestampStr);
      }
    });
  }

  window.openAnnotatorWithImage = function(dataUrl, timestampStr) {
    annotator.loadImage(dataUrl, timestampStr);
    openModal('modalAnnotator');
  };

  // Editor Tool Switching
  document.querySelectorAll('.editor-tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.editor-tool-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      annotator.currentTool = btn.dataset.tool;
    });
  });

  document.querySelectorAll('.color-picker-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.color-picker-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      annotator.currentColor = dot.dataset.color;
    });
  });

  const editorLineWidth = document.getElementById('editorLineWidth');
  if (editorLineWidth) {
    editorLineWidth.addEventListener('input', (e) => {
      annotator.lineWidth = parseInt(e.target.value);
    });
  }

  document.getElementById('btnEditorUndo')?.addEventListener('click', () => annotator.undo());
  document.getElementById('btnEditorClear')?.addEventListener('click', () => annotator.clear());

  document.getElementById('btnEditorCopy')?.addEventListener('click', () => {
    const dataUrl = annotator.toDataURL();
    gallery.copyToClipboard(dataUrl);
  });

  document.getElementById('btnEditorSaveGallery')?.addEventListener('click', () => {
    const dataUrl = annotator.toDataURL();
    const snap = gallery.addItem(dataUrl, annotator.timestampStr || 'edited', annotator.canvas.width, annotator.canvas.height, videoFileName);
    gallery.downloadImage(dataUrl, snap.filename);
    closeModal('modalAnnotator');
    showToast('已保存标注截图至画廊！', 'success');
  });

  // Preview Modal Setup
  let currentPreviewItem = null;
  window.openPreviewModal = function(item) {
    currentPreviewItem = item;
    const img = document.getElementById('previewImage');
    const meta = document.getElementById('previewMetaText');
    img.src = item.dataUrl;
    meta.textContent = `分辨率: ${item.width}x${item.height} | 时间戳: ${item.timestampStr}`;
    openModal('modalPreview');
  };

  document.getElementById('btnPreviewCopy')?.addEventListener('click', () => {
    if (currentPreviewItem) gallery.copyToClipboard(currentPreviewItem.dataUrl);
  });

  document.getElementById('btnPreviewDownload')?.addEventListener('click', () => {
    if (currentPreviewItem) gallery.downloadImage(currentPreviewItem.dataUrl, currentPreviewItem.filename);
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Ignore key shortcuts if focused on input/select elements
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.code === 'KeyS' || e.code === 'KeyC') {
      e.preventDefault();
      captureCurrent();
    } else if (e.code === 'KeyB') {
      e.preventDefault();
      if (videoPlayer.src) openModal('modalBatch');
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      if (e.shiftKey) stepTime(-1);
      else stepFrame(-1);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      if (e.shiftKey) stepTime(1);
      else stepFrame(1);
    }
  });

});
