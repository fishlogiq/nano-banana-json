(function () {
  "use strict";

  const API_URL = 'https://us-central1-gen-lang-client-0859048251.cloudfunctions.net/shopifyGenerate';

  // DOM elements
  const shopifyUrlInput = document.getElementById('shopifyUrl');
  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const jsonOutput = document.getElementById('jsonOutput');
  const loader = document.getElementById('loader');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');
  const outputSection = document.getElementById('outputSection');

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => errorMessage.classList.remove('show'), 5000);
  }

  function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.add('show');
    setTimeout(() => successMessage.classList.remove('show'), 3000);
  }

  async function generatePrompt() {
    const url = shopifyUrlInput.value.trim();
    
    if (!url) {
      showError('Please enter a Shopify product URL');
      return;
    }

    // More flexible URL validation - just check for /products/ path
    if (!url.includes('/products/')) {
      showError('Please enter a valid product URL (must contain /products/)');
      return;
    }

    // Show loading state
    generateBtn.disabled = true;
    loader.classList.add('show');
    outputSection.style.display = 'none';
    errorMessage.classList.remove('show');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_url: url
        })
      });

      const data = await response.json();

      if (data.ok && data.prompt) {
        // Display the generated prompt
        jsonOutput.value = JSON.stringify(data.prompt, null, 2);
        outputSection.style.display = 'block';
        
        // Scroll to output
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        throw new Error(data.message || data.error || 'Failed to generate prompt');
      }
    } catch (error) {
      console.error('Error:', error);
      showError(`Error: ${error.message}`);
    } finally {
      generateBtn.disabled = false;
      loader.classList.remove('show');
    }
  }

  async function copyToClipboard() {
    const text = jsonOutput.value;
    
    if (!text) {
      showError('No prompt to copy');
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      
      showSuccess('Copied to clipboard! Now paste it into Google AI Studio.');
    } catch (error) {
      showError('Failed to copy. Please select and copy manually.');
    }
  }

  // Event listeners
  generateBtn.addEventListener('click', generatePrompt);
  copyBtn.addEventListener('click', copyToClipboard);
  
  // Allow Enter key to generate
  shopifyUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      generatePrompt();
    }
  });
})();
