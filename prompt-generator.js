/* prompt-generator.js
   Full, self-contained script for the Nano Banana JSON Prompt Generator.
   - Cleans long pasted storefront text
   - Extracts size info (e.g., "2T-3T-4T")
   - Builds a structured JSON payload
   - Copy-to-clipboard with secure + fallback paths
*/
(function () {
  "use strict";

  // ---------- tiny DOM helpers ----------
  const $ = (s) => document.querySelector(s);

  const elTitle   = $("#title");
  const elDesc    = $("#desc");
  const elImage   = $("#imageUrl");
  const btnGen    = $("#generateBtn");
  const btnCopy   = $("#copyBtn");
  const outArea   = $("#jsonOutput");
  const copyOk    = $("#copyOk");

  // ---------- text cleaning helpers ----------
  function stripHtml(s = "") {
    const el = document.createElement("div");
    el.innerHTML = s;
    const text = el.textContent || el.innerText || "";
    return text.replace(/\s+/g, " ").trim();
  }

  function pruneBoilerplate(s) {
    // Remove common Shopify/site footer & “you may also like” blocks if present
    const CUT_WORDS = [
      "You may also like",
      "Brands",
      "Customer Service",
      "Main Office",
      "Payment methods",
      "©",
      "Designed by",
      "Share",
      "Pickup available",
      "Add to cart",
      "View store information",
      "Twitter",
      "Facebook",
      "Instagram",
      "FAQ",
      "Blogs",
      "Contact",
    ];
    let out = s;
    for (const w of CUT_WORDS) {
      const i = out.indexOf(w);
      if (i !== -1) {
        out = out.slice(0, i).trim();
      }
    }
    return out;
  }

  function limitChars(s, max = 500) {
    return s.length > max ? s.slice(0, max).trim() + "…" : s;
  }

  function cleanedDescription(raw) {
    let t = stripHtml(raw);
    t = pruneBoilerplate(t);
    // remove noisy SKU/UPC/Product Code lines
    t = t.replace(/\b(UPC|Product\s*Code|SKU)\b[^.]+/gi, "").trim();
    return limitChars(t, 500);
  }

  function extractSizes(s) {
    // Try to pull discrete sizes like: 2T-3T-4T, 2T/3T/4T, or "Size: 2T, 3T, 4T"
    if (!s) return [];
    const candidates = (s.match(/\b([0-9]+[A-Za-z]*T?|[XSML]{1,3}|\d+(?:\/\d+)?)(?=[,\-\s\/]|$)/g) || [])
      .map((t) => t.trim())
      .filter(Boolean);

    // Filter out obvious non-size tokens
    const valid = candidates.filter((t) => {
      if (/^\d{5,}$/.test(t)) return false; // long numbers (e.g., UPC)
      if (/^\d+\/\d+$/.test(t)) return true; // like 12/14
      if (/^[XSML]{1,3}$/.test(t)) return true; // S, M, L, XL, etc.
      return /^[0-9]+[A-Za-z]*T?$/.test(t); // 2T, 3T, 4T, 10, 12, etc.
    });

    // Deduplicate while preserving order
    return Array.from(new Set(valid));
  }

  // ---------- JSON builder ----------
  function buildPrompt() {
    const titleVal = (elTitle?.value || "").trim();
    const descRaw  = (elDesc?.value || "").trim();
    const imgVal   = (elImage?.value || "").trim();

    const desc  = cleanedDescription(descRaw);
    const sizes = extractSizes(descRaw) || extractSizes(titleVal);

    return {
      model: "nano-banana-v1",
      meta: {
        tool: "logiqfish-prompt-ui",
        created_at: new Date().toISOString()
      },
      product: {
        title: titleVal || "Untitled",
        description: desc,
        sizes: sizes,
        category: "kids-apparel>sets>hoodie-jogger",
        // brand: "S1OPE", // optional: fill if available
      },
      media: {
        image_url: imgVal || null
      },
      personas: [
        { age_group: "toddler", ethnicity: "Hispanic" },
        { age_group: "toddler", ethnicity: "African American" }
      ],
      instructions: [
        "Render garment on age-appropriate child models.",
        "Respect diversity, realism, and platform safety policies.",
        "Use provided image_url as the garment reference if present."
      ],
      output: { format: "json" }
    };
  }

  // ---------- UI actions ----------
  function pretty(obj) {
    return JSON.stringify(obj, null, 2);
  }

  function handleGenerate() {
    const data = buildPrompt();
    outArea.value = pretty(data);
  }

  function showCopied() {
    if (!copyOk) return;
    copyOk.classList.add("show");
    setTimeout(() => copyOk.classList.remove("show"), 2000);
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
    } catch (e) {
      // ignore
    }
    document.body.removeChild(ta);
    showCopied();
  }

  async function handleCopy() {
    const text = outArea.value;
    if (!text) return;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        showCopied();
        return;
      } catch (_) {
        // fall through to fallback
      }
    }
    fallbackCopy(text);
  }

  // ---------- wire events ----------
  btnGen?.addEventListener("click", handleGenerate);
  btnCopy?.addEventListener("click", handleCopy);

  // First render
  handleGenerate();
})();

