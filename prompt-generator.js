(function () {
  "use strict";

  // --- Endpoints (image + product) ---
  const API_IMAGE   = 'https://us-central1-gen-lang-client-0859048251.cloudfunctions.net/shopifyGenerate';
  const API_PRODUCT = 'https://shopifyproductgenerator-804118462449.us-central1.run.app';

  // expose so index.html can use them
  window.API_IMAGE = API_IMAGE;
  window.API_PRODUCT = window.API_PRODUCT || API_PRODUCT;

  // --- DOM references for IMAGE tab ---
  const shopifyUrlInput = document.getElementById('shopifyUrl');
  const modelCountSelect = document.getElementById('modelCount');
  const ethnicity1Select = document.getElementById('ethnicity1');
  const ethnicity2Select = document.getElementById('ethnicity2');
  const ageCategorySelect = document.getElementById('ageCategory');
  const showMovementCheckbox = document.getElementById('showMovement');
  const addSneakersCheckbox = document.getElementById('addSneakers');
  const addSocksCheckbox = document.getElementById('addSocks');
  const addShoesCheckbox = document.getElementById('addShoes');
  const addWorkBootsCheckbox = document.getElementById('addWorkBoots');
  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const downloadRefBtn = document.getElementById('downloadRefBtn');
  const jsonOutput = document.getElementById('jsonOutput');
  const loader = document.getElementById('loader');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');
  const outputSection = document.getElementById('outputSection');

  let currentPrompt = null;

  function showError(message) {
    if (!errorMessage) return;
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => errorMessage.classList.remove('show'), 5000);
  }

  function showSuccess(message) {
    if (!successMessage) return;
    successMessage.textContent = message;
    successMessage.classList.add('show');
    setTimeout(() => successMessage.classList.remove('show'), 3000);
  }

  async function generatePrompt() {
    const url = (shopifyUrlInput?.value || '').trim();
    if (!url) { showError('Please enter a Shopify product URL'); return; }
    if (!url.includes('/products/')) { showError('Please enter a valid product URL (must contain /products/)'); return; }

    generateBtn.disabled = true;
    loader?.classList.add('show');
    if (outputSection) outputSection.style.display = 'none';
    errorMessage?.classList.remove('show');

    try {
      const requestBody = {
        product_url: url,
        ethnicity1: ethnicity1Select.value,
        ethnicity2: ethnicity2Select.value,
        model_count: parseInt(modelCountSelect.value)
      };
      if (ageCategorySelect.value) requestBody.age_category = ageCategorySelect.value;
      if (addSneakersCheckbox.checked) requestBody.add_sneakers = true;
      if (addSocksCheckbox.checked)    requestBody.add_socks = true;
      if (addShoesCheckbox.checked)    requestBody.add_shoes = true;
      if (addWorkBootsCheckbox.checked)requestBody.add_work_boots = true;
      if (showMovementCheckbox.checked)requestBody.show_movement = true;

      const response = await fetch(API_IMAGE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (data.ok && data.prompt) {
        currentPrompt = data.prompt;
        jsonOutput.value = JSON.stringify(data.prompt, null, 2);
        outputSection.style.display = 'block';
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        throw new Error(data.message || data.error || 'Failed to generate prompt');
      }
    } catch (error) {
      console.error('Error:', error);
      showError(`Error: ${error.message}`);
    } finally {
      generateBtn.disabled = false;
      loader?.classList.remove('show');
    }
  }

  async function copyToClipboard() {
    const text = jsonOutput?.value || '';
    if (!text) { showError('No prompt to copy'); return; }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text; textarea.style.position = 'fixed'; textarea.style.left = '-9999px';
        document.body.appendChild(textarea); textarea.focus(); textarea.select();
        document.execCommand('copy'); document.body.removeChild(textarea);
      }
      showSuccess('✅ Copied to clipboard! Now paste it into Google AI Studio.');
    } catch {
      showError('Failed to copy. Please select and copy manually.');
    }
  }

  async function downloadReferenceImage() {
    if (!currentPrompt || !currentPrompt.reference_image) { showError('No reference image available'); return; }
    const imageUrl = currentPrompt.reference_image;
    const urlParts = imageUrl.split('/'); const filenameWithParams = urlParts[urlParts.length - 1];
    const filename = filenameWithParams.split('?')[0] || 'reference-image.jpg';

    downloadRefBtn.disabled = true;
    const originalText = downloadRefBtn.textContent;
    downloadRefBtn.textContent = 'Downloading...';

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl; link.download = filename; link.style.display = 'none';
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      showSuccess('✅ Reference image downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      try {
        const link = document.createElement('a');
        link.href = imageUrl; link.download = filename; link.target = '_blank'; link.rel = 'noopener noreferrer';
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        showSuccess('Download initiated. If it opens in browser, right-click and "Save As".');
      } catch {
        window.open(imageUrl, '_blank');
        showError('⚠️ Direct download blocked. Image opened in new tab - right-click to save.');
      }
    } finally {
      downloadRefBtn.disabled = false;
      downloadRefBtn.textContent = originalText;
    }
  }

  // Wire up events (if elements exist)
  if (generateBtn) generateBtn.addEventListener('click', generatePrompt);
  if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);
  if (downloadRefBtn) downloadRefBtn.addEventListener('click', downloadReferenceImage);
  if (shopifyUrlInput) {
    shopifyUrlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') generatePrompt(); });
  }
})();
