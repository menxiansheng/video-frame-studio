/* VideoFrame Studio - Gallery Module */
class GalleryManager {
  constructor() {
    this.items = [];
    this.container = document.getElementById('galleryContainer');
    this.emptyState = document.getElementById('galleryEmpty');
    this.countBadge = document.getElementById('galleryCount');
    this.exportBtn = document.getElementById('btnExportZip');
    this.clearBtn = document.getElementById('btnClearGallery');

    this.initEvents();
  }

  initEvents() {
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        if (this.items.length === 0) return;
        if (confirm('确定要清空画廊中的所有截图吗？')) {
          this.clearAll();
        }
      });
    }

    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', () => {
        this.exportZip();
      });
    }
  }

  addItem(dataUrl, timestampStr, width, height, filename = 'snapshot') {
    const id = 'snap_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const item = {
      id,
      dataUrl,
      timestampStr,
      width,
      height,
      filename: `${filename}_${timestampStr.replace(/:/g, '-').replace(/\./g, '_')}.png`,
      created: new Date()
    };

    this.items.unshift(item);
    this.render();
    return item;
  }

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.render();
  }

  clearAll() {
    this.items = [];
    this.render();
    if (window.showToast) window.showToast('已清空截图画廊', 'info');
  }

  render() {
    if (!this.container) return;

    if (this.items.length === 0) {
      this.emptyState.style.display = 'flex';
      this.container.querySelectorAll('.gallery-card').forEach(el => el.remove());
      this.countBadge.textContent = '0';
      return;
    }

    this.emptyState.style.display = 'none';
    this.countBadge.textContent = this.items.length;

    // Clear previous cards
    this.container.querySelectorAll('.gallery-card').forEach(el => el.remove());

    // Create cards
    this.items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.dataset.id = item.id;

      card.innerHTML = `
        <div class="gallery-card-thumb">
          <img src="${item.dataUrl}" alt="Snapshot at ${item.timestampStr}" loading="lazy">
          <span class="thumb-tag">${item.timestampStr}</span>
          <span class="thumb-res">${item.width}x${item.height}</span>
        </div>
        <div class="gallery-card-actions">
          <button class="card-action-btn copy-btn" title="复制图片到剪贴板">
            <i data-lucide="copy" size="14"></i> 复制
          </button>
          <button class="card-action-btn edit-btn" title="标注与编辑">
            <i data-lucide="edit-3" size="14"></i> 编辑
          </button>
          <button class="card-action-btn download-btn" title="下载图片">
            <i data-lucide="download" size="14"></i>
          </button>
          <button class="card-action-btn delete delete-btn" title="删除">
            <i data-lucide="trash-2" size="14"></i>
          </button>
        </div>
      `;

      // Thumb click -> preview
      card.querySelector('.gallery-card-thumb').addEventListener('click', () => {
        if (window.openPreviewModal) window.openPreviewModal(item);
      });

      // Copy click
      card.querySelector('.copy-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.copyToClipboard(item.dataUrl);
      });

      // Edit click
      card.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.openAnnotatorWithImage) window.openAnnotatorWithImage(item.dataUrl, item.timestampStr);
      });

      // Download click
      card.querySelector('.download-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.downloadImage(item.dataUrl, item.filename);
      });

      // Delete click
      card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeItem(item.id);
      });

      this.container.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  async copyToClipboard(dataUrl) {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      if (window.showToast) window.showToast('已成功复制图片至剪贴板！', 'success');
    } catch (err) {
      console.error('Clipboard write error:', err);
      if (window.showToast) window.showToast('复制到剪贴板失败（可能权限限制）', 'error');
    }
  }

  downloadImage(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (window.showToast) window.showToast(`已开始下载: ${filename}`, 'info');
  }

  async exportZip() {
    if (this.items.length === 0) {
      if (window.showToast) window.showToast('画廊为空，无法打包导出', 'error');
      return;
    }

    if (typeof JSZip === 'undefined') {
      if (window.showToast) window.showToast('未加载 JSZip 库，无法导出 ZIP', 'error');
      return;
    }

    if (window.showToast) window.showToast('正在生成 ZIP 压缩包，请稍候...', 'info');

    const zip = new JSZip();
    const folder = zip.folder('video_snapshots');

    this.items.forEach((item, index) => {
      // Base64 to binary
      const base64Data = item.dataUrl.replace(/^data:image\/(png|jpeg|webp);base64,/, '');
      folder.file(`${String(index + 1).padStart(3, '0')}_${item.filename}`, base64Data, { base64: true });
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video_snapshots_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (window.showToast) window.showToast('ZIP 打包下载完成！', 'success');
    } catch (err) {
      console.error('ZIP generation error:', err);
      if (window.showToast) window.showToast('打包 ZIP 时发生错误', 'error');
    }
  }
}

window.GalleryManager = GalleryManager;
