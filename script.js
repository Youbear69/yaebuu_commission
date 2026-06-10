let state = {
  clipMinutes: 1,
  videoFile: null,
  subtitle: null,
  font: null,
  motionGraphics: null,
  version: null,
  extra1: null,
  extra2: null,
  thumbnail: null
};

const pricing = {
  clipMinutes: 400,
  videoFile: { cut: 0, uncut: 150 },
  subtitle: { none: 0, add: 150 },
  font: { free: 0, paid: 0 },
  motionGraphics: { none: 0, add: 200 },
  extra1: { version: 200, horizontal: 600 },
  extra2: { version: 200, horizontal: 600 },
  thumbnail: { none: 0, add: 100 }
};

const labels = {
  videoFile: { cut: "ตัด / คัดมาให้แล้ว", uncut: "ยังไม่ได้ตัด / ให้อัดให้" },
  subtitle: { none: "ไม่ใส่ซับไตเติ้ล", add: "ใส่ซับไตเติ้ล" },
  font: { free: "ฟอนต์ฟรี", paid: "ฟอนต์เสียเงิน" },
  motionGraphics: { none: "ไม่ใส่โมชั่นกราฟิก", add: "ใส่โมชั่น กราฟิก" },
  version: { "1": "1 ไฟล์ / เวอร์ชั่น", add1: "เพิ่ม 1 ไฟล์ / เวอร์ชั่น", add2: "เพิ่ม 2 ไฟล์ / เวอร์ชั่น" },
  extra1: { version: "เพิ่มเติม 1: เพิ่มเวอร์ชั่น", horizontal: "เพิ่มเติม 1: เพิ่มคลิปแนวนอน" },
  extra2: { version: "เพิ่มเติม 2: เพิ่มเวอร์ชั่น", horizontal: "เพิ่มเติม 2: เพิ่มคลิปแนวนอน" },
  thumbnail: { none: "ไม่ใส่ปก", add: "ใส่ปก" }
};

// Wizard State
let currentStep = 1;
const totalSteps = 7;

// Elements
const clipMinutesEl = document.getElementById('clip-minutes');
const clipPriceDisplayEl = document.getElementById('clip-price-display');
const summaryListEl = document.getElementById('summary-list');
const footerTotalEl = document.getElementById('footer-total');
const fontSectionEl = document.getElementById('font-section');
const extraVersion1El = document.getElementById('extra-version-1');
const extraVersion2El = document.getElementById('extra-version-2');
const generatedCodeEl = document.getElementById('generated-code');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const wizardNav = document.querySelector('.wizard-nav');

// Modal Elements
const loadModal = document.getElementById('load-modal');
const openModalBtn = document.getElementById('open-load-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const searchCodeEl = document.getElementById('search-code');
const searchBtn = document.getElementById('search-btn');

const receiptModal = document.getElementById('receipt-modal');
const closeReceiptBtn = document.getElementById('close-receipt-btn');
const receiptListEl = document.getElementById('receipt-list');
const receiptTotalEl = document.getElementById('receipt-total');

// --- Animation ---
function animateValueWithSuffix(obj, start, end, duration, suffix = '') {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const current = Math.floor(progress * (end - start) + start);
    obj.innerText = current.toLocaleString() + suffix;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerText = end.toLocaleString() + suffix;
    }
  };
  window.requestAnimationFrame(step);
}

let currentFooterTotal = 0;
let currentClipTotal = 0;

// --- Wizard Navigation ---
function updateWizardNav() {
  if (currentStep === 1) {
    btnPrev.classList.add('hidden');
  } else {
    btnPrev.classList.remove('hidden');
  }

  if (currentStep === totalSteps) {
    wizardNav.classList.add('hidden'); // Hide next/prev on summary page
  } else {
    wizardNav.classList.remove('hidden');
  }
}

function showStep(stepNum) {
  // Hide all steps
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
  // Show target step
  const target = document.getElementById(`step-${stepNum}`);
  if (target) {
    target.classList.add('active');
  }
  currentStep = stepNum;
  updateWizardNav();
  render();
}

function canProceed() {
  // Validate current step
  if (currentStep === 2 && !state.videoFile) return false;
  if (currentStep === 3) {
    if (!state.subtitle) return false;
    if (state.subtitle === 'add' && !state.font) return false;
  }
  if (currentStep === 4 && !state.motionGraphics) return false;
  if (currentStep === 5) {
    if (!state.version) return false;
    if ((state.version === 'add1' || state.version === 'add2') && !state.extra1) return false;
    if (state.version === 'add2' && !state.extra2) return false;
  }
  if (currentStep === 6 && !state.thumbnail) return false;
  
  return true;
}

btnNext.addEventListener('click', () => {
  if (!canProceed()) {
    alert('กรุณาเลือกตัวเลือกก่อนไปต่อครับ');
    return;
  }
  if (currentStep < totalSteps) {
    showStep(currentStep + 1);
  }
});

btnPrev.addEventListener('click', () => {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
});

// --- Modal Logic ---
openModalBtn.addEventListener('click', () => loadModal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => loadModal.classList.add('hidden'));
closeReceiptBtn.addEventListener('click', () => receiptModal.classList.add('hidden'));

// --- App Logic ---
document.getElementById('reset-btn').addEventListener('click', () => {
  if (confirm('คุณต้องการรีเซ็ตการเลือกทั้งหมดใช่หรือไม่?')) {
    state = {
      clipMinutes: 1, videoFile: null, subtitle: null, font: null,
      motionGraphics: null, version: null, extra1: null, extra2: null, thumbnail: null
    };
    currentClipTotal = 0;
    currentFooterTotal = 0;
    showStep(1);
  }
});

document.getElementById('btn-minus').addEventListener('click', () => {
  if (state.clipMinutes > 1) {
    state.clipMinutes--;
    render();
  }
});

document.getElementById('btn-plus').addEventListener('click', () => {
  state.clipMinutes++;
  render();
});

// Option Selection
window.selectOption = function(group, value) {
  state[group] = value;
  
  // Auto-proceed logic (optional): if you want them to auto-advance, you could call btnNext.click() here for some groups
  // But let's just let them review and click "ไปต่อ" to be safe and clear.
  
  render();
}

function calculateTotal() {
  let total = state.clipMinutes * pricing.clipMinutes;
  
  if (state.videoFile) total += pricing.videoFile[state.videoFile];
  if (state.subtitle) total += pricing.subtitle[state.subtitle];
  
  if (state.subtitle === 'add' && state.font) {
    total += pricing.font[state.font];
  }
  
  if (state.motionGraphics) total += pricing.motionGraphics[state.motionGraphics];
  
  if ((state.version === 'add1' || state.version === 'add2') && state.extra1) {
    total += pricing.extra1[state.extra1];
  }
  if (state.version === 'add2' && state.extra2) {
    total += pricing.extra2[state.extra2];
  }
  
  if (state.thumbnail) total += pricing.thumbnail[state.thumbnail];
  return total;
}

function encodeState() {
  let bits = 0;
  if (state.videoFile === 'uncut') bits |= (1 << 0);
  if (state.subtitle === 'add') bits |= (1 << 1);
  if (state.font === 'paid') bits |= (1 << 2);
  if (state.motionGraphics === 'add') bits |= (1 << 3);
  
  if (state.version === 'add1') bits |= (1 << 4);
  else if (state.version === 'add2') bits |= (2 << 4);
  
  if (state.extra1 === 'horizontal') bits |= (1 << 6);
  if (state.extra2 === 'horizontal') bits |= (1 << 7);
  if (state.thumbnail === 'add') bits |= (1 << 8);

  // Convert bits to hex
  const hex = bits.toString(16).padStart(3, '0');
  // Pad minutes to 2 chars for consistent look
  const minsStr = String(state.clipMinutes).padStart(2, '0');
  
  return `ybcms-${minsStr}-${hex}`;
}

function decodeState(codeStr) {
  const match = codeStr.match(/^ybcms-(\d+)-([0-9a-f]+)$/i);
  if (!match) throw new Error("Invalid Format");
  
  const mins = parseInt(match[1]);
  const bits = parseInt(match[2], 16);
  
  state.clipMinutes = mins;
  state.videoFile = (bits & (1 << 0)) ? 'uncut' : 'cut';
  state.subtitle = (bits & (1 << 1)) ? 'add' : 'none';
  state.font = (bits & (1 << 2)) ? 'paid' : 'free';
  state.motionGraphics = (bits & (1 << 3)) ? 'add' : 'none';
  
  const v = (bits >> 4) & 3; 
  state.version = v === 2 ? 'add2' : (v === 1 ? 'add1' : '1');
  
  state.extra1 = (bits & (1 << 6)) ? 'horizontal' : 'version';
  state.extra2 = (bits & (1 << 7)) ? 'horizontal' : 'version';
  state.thumbnail = (bits & (1 << 8)) ? 'add' : 'none';
}

function render() {
  // Update counter
  clipMinutesEl.innerText = state.clipMinutes;
  
  const clipTotal = state.clipMinutes * pricing.clipMinutes;
  if (currentClipTotal !== clipTotal) {
    if (currentClipTotal === 0) {
      clipPriceDisplayEl.innerText = clipTotal.toLocaleString() + ' ฿';
    } else {
      animateValueWithSuffix(clipPriceDisplayEl, currentClipTotal, clipTotal, 300, ' ฿');
    }
    currentClipTotal = clipTotal;
  }

  // Update active cards
  document.querySelectorAll('.option-card').forEach(card => {
    const group = card.getAttribute('data-group');
    const value = card.getAttribute('data-value');
    if (group) {
      if (state[group] === value) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    }
  });

  // Conditional Sections visibility
  fontSectionEl.style.display = state.subtitle === 'add' ? 'block' : 'none';
  
  extraVersion1El.style.display = (state.version === 'add1' || state.version === 'add2') ? 'block' : 'none';
  extraVersion2El.style.display = state.version === 'add2' ? 'block' : 'none';

  // Calculate price
  const total = calculateTotal();
  if (currentFooterTotal !== total) {
    if (currentFooterTotal === 0) {
      footerTotalEl.innerText = total.toLocaleString();
    } else {
      animateValueWithSuffix(footerTotalEl, currentFooterTotal, total, 400, '');
    }
    currentFooterTotal = total;
  }

  // Update Summary List
  summaryListEl.innerHTML = '';
  
  const addSummaryItem = (label, price) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${label}</span><span>+${price.toLocaleString()} ฿</span>`;
    summaryListEl.appendChild(li);
  };

  addSummaryItem(`ความยาวคลิป: ${state.clipMinutes} นาที`, state.clipMinutes * pricing.clipMinutes);
  
  if (state.videoFile) addSummaryItem(labels.videoFile[state.videoFile], pricing.videoFile[state.videoFile]);
  
  if (state.subtitle) {
    addSummaryItem(labels.subtitle[state.subtitle], pricing.subtitle[state.subtitle]);
    if (state.subtitle === 'add' && state.font) {
      addSummaryItem(`- ${labels.font[state.font]}`, pricing.font[state.font]);
    }
  }
  
  if (state.motionGraphics) addSummaryItem(labels.motionGraphics[state.motionGraphics], pricing.motionGraphics[state.motionGraphics]);
  
  if (state.version) {
    addSummaryItem(`เวอร์ชั่น: ${labels.version[state.version]}`, 0);
    if ((state.version === 'add1' || state.version === 'add2') && state.extra1) {
      addSummaryItem(`- ${labels.extra1[state.extra1]}`, pricing.extra1[state.extra1]);
    }
    if (state.version === 'add2' && state.extra2) {
      addSummaryItem(`- ${labels.extra2[state.extra2]}`, pricing.extra2[state.extra2]);
    }
  }
  
  if (state.thumbnail) addSummaryItem(labels.thumbnail[state.thumbnail], pricing.thumbnail[state.thumbnail]);

  // Update generated code if we are at the last step (or just always generate)
  // We should enforce generation works even partially, but since we encode to 0 if null, it's fine.
  if (currentStep === totalSteps) {
    generatedCodeEl.innerText = encodeState();
  }
}

// Copy button
document.getElementById('copy-btn').addEventListener('click', () => {
  const code = generatedCodeEl.innerText;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.innerText = 'ก็อปปี้แล้ว!';
    setTimeout(() => btn.innerText = 'ก็อปปี้', 2000);
  });
});

// Search functionality
searchBtn.addEventListener('click', handleSearch);
searchCodeEl.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
});

function handleSearch() {
  const code = searchCodeEl.value.trim();
  if (!code) return;
  
  try {
    const pState = {};
    const match = code.match(/^ybcms-(\d+)-([0-9a-f]+)$/i);
    if (!match) throw new Error("Invalid Format");
    
    pState.clipMinutes = parseInt(match[1]);
    const bits = parseInt(match[2], 16);
    pState.videoFile = (bits & (1 << 0)) ? 'uncut' : 'cut';
    pState.subtitle = (bits & (1 << 1)) ? 'add' : 'none';
    pState.font = (bits & (1 << 2)) ? 'paid' : 'free';
    pState.motionGraphics = (bits & (1 << 3)) ? 'add' : 'none';
    const v = (bits >> 4) & 3; 
    pState.version = v === 2 ? 'add2' : (v === 1 ? 'add1' : '1');
    pState.extra1 = (bits & (1 << 6)) ? 'horizontal' : 'version';
    pState.extra2 = (bits & (1 << 7)) ? 'horizontal' : 'version';
    pState.thumbnail = (bits & (1 << 8)) ? 'add' : 'none';
    
    // Populate receipt modal
    receiptListEl.innerHTML = '';
    const addItem = (label, price) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="receipt-label">${label}</span><span class="receipt-price">+${price.toLocaleString()} ฿</span>`;
      receiptListEl.appendChild(li);
    };

    addItem(`ความยาวคลิป: ${pState.clipMinutes} นาที`, pState.clipMinutes * pricing.clipMinutes);
    let total = pState.clipMinutes * pricing.clipMinutes;

    if (pState.videoFile) { addItem(labels.videoFile[pState.videoFile], pricing.videoFile[pState.videoFile]); total += pricing.videoFile[pState.videoFile]; }
    if (pState.subtitle) {
      addItem(labels.subtitle[pState.subtitle], pricing.subtitle[pState.subtitle]); total += pricing.subtitle[pState.subtitle];
      if (pState.subtitle === 'add' && pState.font) {
        addItem(`- ${labels.font[pState.font]}`, pricing.font[pState.font]); total += pricing.font[pState.font];
      }
    }
    if (pState.motionGraphics) { addItem(labels.motionGraphics[pState.motionGraphics], pricing.motionGraphics[pState.motionGraphics]); total += pricing.motionGraphics[pState.motionGraphics]; }
    if (pState.version) {
      addItem(`เวอร์ชั่น: ${labels.version[pState.version]}`, 0);
      if ((pState.version === 'add1' || pState.version === 'add2') && pState.extra1) {
        addItem(`- ${labels.extra1[pState.extra1]}`, pricing.extra1[pState.extra1]); total += pricing.extra1[pState.extra1];
      }
      if (pState.version === 'add2' && pState.extra2) {
        addItem(`- ${labels.extra2[pState.extra2]}`, pricing.extra2[pState.extra2]); total += pricing.extra2[pState.extra2];
      }
    }
    if (pState.thumbnail) { addItem(labels.thumbnail[pState.thumbnail], pricing.thumbnail[pState.thumbnail]); total += pricing.thumbnail[pState.thumbnail]; }

    receiptTotalEl.innerText = total.toLocaleString();

    loadModal.classList.add('hidden');
    receiptModal.classList.remove('hidden');
    searchCodeEl.value = ''; // clear
    
  } catch (e) {
    alert('โค้ดไม่ถูกต้อง กรุณาตรวจสอบให้แน่ใจว่าเป็นรูปแบบ ybcms-...');
  }
}

updateWizardNav();
render();
