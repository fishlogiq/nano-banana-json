(function () {
  const $ = (s) => document.querySelector(s);
  const title = $("#title");
  const desc = $("#desc");
  const imageUrl = $("#imageUrl");
  const generateBtn = $("#generateBtn");
  const copyBtn = $("#copyBtn");
  const out = $("#jsonOutput");
  const copyOk = $("#copyOk");

  function buildPrompt() {
    return {
      meta: { tool: "nano-banana", version: "draft-1", created_at: new Date().toISOString() },
      item: {
        title: (title.value || "").trim() || "Untitled",
        description: (desc.value || "").trim(),
        image: (imageUrl.value || "").trim() || null
      },
      prompt: [
        "Generate a retail-ready JSON prompt for Google Nano Banana image generation.",
        "Product: girls dress (sizes 12, 18, 24).",
        "Model children: Hispanic and African-American.",
        "Respect safety and fairness.",
        "If an image URL is provided, use it as the garment reference."
      ].join(" ")
    };
  }

  function pretty(x){ return JSON.stringify(x, null, 2); }
  function handleGenerate(){ out.value = pretty(buildPrompt()); }

  function showCopied(){
    copyOk.classList.add("show");
    setTimeout(()=>copyOk.classList.remove("show"), 2000);
  }
  function fallbackCopy(text){
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand("copy"); } catch(e){}
    document.body.removeChild(ta); showCopied();
  }
  async function handleCopy(){
    const text = out.value; if (!text) return;
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); showCopied(); return; } catch(e){}
    }
    fallbackCopy(text);
  }

  generateBtn?.addEventListener("click", handleGenerate);
  copyBtn?.addEventListener("click", handleCopy);
  handleGenerate(); // first render
})();
