let state = {
  clipMinutes: 1,
  videoFile: null,
  subtitle: null,
  font: null,
  motionGraphics: null,
  version: null,
  extra1: null,
  extra2: null,
  thumbnail: null,
  discountCode: null,
  note: '',
  link: ''
};

const pricing = {
  clipBase: 400,
  clipPerExtra: 150,
  videoFile: { cut: 0, uncut: 150 },
  subtitle: { none: 0, add: 100 },
  font: { free: 0, paid: 0 },
  motionGraphics: { none: 0, add: 100 },
  extra1: { version: 200, horizontal: 600 },
  extra2: { version: 200, horizontal: 600 },
  thumbnail: { none: 0, add: 50 }
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
const totalSteps = 8;

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

const orderNoteEl = document.getElementById('order-note');
const orderLinkEl = document.getElementById('order-link');

if (orderNoteEl) orderNoteEl.addEventListener('input', (e) => { state.note = e.target.value; render(); });
if (orderLinkEl) orderLinkEl.addEventListener('input', (e) => { state.link = e.target.value; render(); });

const receiptModal = document.getElementById('receipt-modal');
const closeReceiptBtn = document.getElementById('close-receipt-btn');
const receiptListEl = document.getElementById('receipt-list');
const receiptTotalEl = document.getElementById('receipt-total');

// New View & Tab Elements
const tabCalc = document.getElementById('tab-calc');
const tabPortfolio = document.getElementById('tab-portfolio');
const calculatorView = document.getElementById('calculator-view');
const portfolioView = document.getElementById('portfolio-view');
const stickyFooter = document.querySelector('.sticky-footer');

const videoModal = document.getElementById('video-modal');
const closeVideoBtn = document.getElementById('close-video-btn');
const videoModalTitle = document.getElementById('video-modal-title');
const videoContainer = document.querySelector('.video-container');

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

  // Update Progress Bar
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressBar.style.width = progressPercent + '%';
    if (currentStep === totalSteps) {
      progressBar.classList.remove('blinking');
      progressBar.classList.add('rainbow-bar');
    } else {
      progressBar.classList.add('blinking');
      progressBar.classList.remove('rainbow-bar');
    }
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
      motionGraphics: null, version: null, extra1: null, extra2: null, thumbnail: null, discountCode: null
    };
    currentClipTotal = 0;
    currentFooterTotal = 0;
    document.getElementById('discount-input').value = '';
    document.getElementById('discount-message').innerText = '';
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

function getClipPrice(minutes) {
  // เรทราคางาน: เริ่มต้น 1 นาทีแรก 400 บาท, หากเกินกว่านั้น +นาทีละ 150 บาท
  return pricing.clipBase + (Math.max(0, minutes - 1) * pricing.clipPerExtra);
}

function calculateTotal() {
  let total = getClipPrice(state.clipMinutes);
  
  if (state.videoFile) total += pricing.videoFile[state.videoFile];
  if (state.subtitle) total += pricing.subtitle[state.subtitle] * state.clipMinutes;
  
  if (state.subtitle === 'add' && state.font) {
    total += pricing.font[state.font];
  }
  
  if (state.motionGraphics) {
    total += pricing.motionGraphics[state.motionGraphics] * state.clipMinutes;
  }
  
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
  
  let discountCodeIdx = 0;
  if (state.discountCode === 'opcms') discountCodeIdx = 1;
  else if (state.discountCode === 'ybsm100') discountCodeIdx = 2;
  else if (state.discountCode === '15day') discountCodeIdx = 3;
  bits |= (discountCodeIdx << 9);

  // Convert bits to hex
  const hex = bits.toString(16).padStart(3, '0');
  // Pad minutes to 2 chars for consistent look
  const minsStr = String(state.clipMinutes).padStart(2, '0');
  
  let code = `ybcms-${minsStr}-${hex}`;
  
  const extraObj = {};
  if (state.note) extraObj.n = state.note;
  if (state.link) extraObj.l = state.link;
  
  if (Object.keys(extraObj).length > 0) {
    try {
      const extraStr = btoa(encodeURIComponent(JSON.stringify(extraObj)));
      code += `-${extraStr}`;
    } catch (e) {}
  }
  
  return code;
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
  
  const dCode = (bits >> 9) & 3;
  if (dCode === 1) state.discountCode = 'opcms';
  else if (dCode === 2) state.discountCode = 'ybsm100';
  else if (dCode === 3) state.discountCode = '15day';
  else state.discountCode = null;
}

function render() {
  // Update counter
  clipMinutesEl.innerText = state.clipMinutes;
  
  const clipTotal = getClipPrice(state.clipMinutes);
  if (currentClipTotal !== clipTotal) {
    if (currentClipTotal === 0) {
      clipPriceDisplayEl.innerText = clipTotal.toLocaleString() + ' ฿';
    } else {
      animateValueWithSuffix(clipPriceDisplayEl, currentClipTotal, clipTotal, 300, ' ฿');
    }
    currentClipTotal = clipTotal;
  }

  // Dynamic Motion Graphics Price UI
  const motionPriceEl = document.getElementById('motion-price-display');
  motionPriceEl.innerHTML = `+100/นาที`;

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

  // Calculate base price
  let total = calculateTotal();

  // Update Summary List
  summaryListEl.innerHTML = '';
  
  const addSummaryItem = (label, price) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${label}</span><span>+${price.toLocaleString()} ฿</span>`;
    summaryListEl.appendChild(li);
  };

  addSummaryItem(`ความยาวคลิป: ${state.clipMinutes} นาที`, getClipPrice(state.clipMinutes));
  
  if (state.videoFile) addSummaryItem(labels.videoFile[state.videoFile], pricing.videoFile[state.videoFile]);
  
  if (state.subtitle) {
    addSummaryItem(labels.subtitle[state.subtitle], pricing.subtitle[state.subtitle] * state.clipMinutes);
    if (state.subtitle === 'add' && state.font) {
      addSummaryItem(`- ${labels.font[state.font]}`, pricing.font[state.font]);
    }
  }
  
  if (state.motionGraphics) {
    addSummaryItem(labels.motionGraphics[state.motionGraphics], pricing.motionGraphics[state.motionGraphics] * state.clipMinutes);
  }
  
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

  // Apply Discount
  let discountAmount = 0;
  if (state.discountCode === 'opcms') discountAmount = Math.floor(total * 0.10);
  else if (state.discountCode === 'ybsm100') discountAmount = total;
  else if (state.discountCode === '15day') discountAmount = 100;
  
  if (discountAmount > 0) {
    if (discountAmount > total) discountAmount = total;
    const li = document.createElement('li');
    li.innerHTML = `<span>ส่วนลด (โค้ด: ${state.discountCode})</span><span style="color: var(--success-color);">- ${discountAmount.toLocaleString()} ฿</span>`;
    summaryListEl.appendChild(li);
    total -= discountAmount;
  }

  // Update Footer Total
  if (currentFooterTotal !== total) {
    if (currentFooterTotal === 0) {
      footerTotalEl.innerText = total.toLocaleString();
    } else {
      animateValueWithSuffix(footerTotalEl, currentFooterTotal, total, 400, '');
    }
    currentFooterTotal = total;
  }

  // Update generated code if we are at the last step (or just always generate)
  // We should enforce generation works even partially, but since we encode to 0 if null, it's fine.
  if (currentStep === totalSteps) {
    generatedCodeEl.innerText = encodeState();
  }
}

// Copy button
document.getElementById('copy-btn').addEventListener('click', () => {
  const code = generatedCodeEl.textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.innerText = 'ก็อปปี้แล้ว!';
    setTimeout(() => btn.innerText = 'ก็อปปี้', 2000);
  });
});

// Discount functionality
const applyDiscountBtn = document.getElementById('apply-discount-btn');
const discountInputEl = document.getElementById('discount-input');
const msgEl = document.getElementById('discount-message');

function handleDiscount() {
  const code = discountInputEl.value.trim().toLowerCase();
  
  if (code === 'opcms' || code === 'ybsm100' || code === '15day') {
    state.discountCode = code;
    msgEl.innerText = 'ใช้โค้ดส่วนลดสำเร็จ!';
    msgEl.style.color = 'var(--success-color)';
    render();
  } else {
    state.discountCode = null;
    if (code === '') {
       msgEl.innerText = '';
    } else {
       msgEl.innerText = 'โค้ดส่วนลดไม่ถูกต้อง';
       msgEl.style.color = '#ff453a';
    }
    render();
  }
}

applyDiscountBtn.addEventListener('click', handleDiscount);
discountInputEl.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') handleDiscount();
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
    const match = code.match(/^ybcms-(\d+)-([0-9a-f]+)(?:-([a-zA-Z0-9+/=]+))?$/i);
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
    
    const dCode = (bits >> 9) & 3;
    if (dCode === 1) pState.discountCode = 'opcms';
    else if (dCode === 2) pState.discountCode = 'ybsm100';
    else if (dCode === 3) pState.discountCode = '15day';
    else pState.discountCode = null;
    
    // Populate receipt modal
    receiptListEl.innerHTML = '';
    const addItem = (label, price) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="receipt-label">${label}</span><span class="receipt-price">+${price.toLocaleString()} ฿</span>`;
      receiptListEl.appendChild(li);
    };

    const clipPrice = getClipPrice(pState.clipMinutes);
    addItem(`ความยาวคลิป: ${pState.clipMinutes} นาที`, clipPrice);
    let total = clipPrice;

    if (pState.videoFile) { addItem(labels.videoFile[pState.videoFile], pricing.videoFile[pState.videoFile]); total += pricing.videoFile[pState.videoFile]; }
    if (pState.subtitle) {
      const subPrice = pricing.subtitle[pState.subtitle] * pState.clipMinutes;
      addItem(labels.subtitle[pState.subtitle], subPrice); total += subPrice;
      if (pState.subtitle === 'add' && pState.font) {
        addItem(`- ${labels.font[pState.font]}`, pricing.font[pState.font]); total += pricing.font[pState.font];
      }
    }
    if (pState.motionGraphics) { 
      const mPrice = pricing.motionGraphics[pState.motionGraphics] * pState.clipMinutes;
      addItem(labels.motionGraphics[pState.motionGraphics], mPrice); 
      total += mPrice; 
    }
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

    let extraObj = {};
    if (match[3]) {
      try {
         extraObj = JSON.parse(decodeURIComponent(atob(match[3])));
      } catch (e) {}
    }
    
    if (extraObj.n) {
      const noteLi = document.createElement('li');
      noteLi.innerHTML = `<span class="receipt-label" style="display:flex; flex-direction:column; align-items:flex-start; width:100%;">หมายเหตุ: <span style="font-size:0.85rem; color:var(--text-secondary); white-space:pre-wrap; margin-top:5px;">${extraObj.n}</span></span>`;
      receiptListEl.appendChild(noteLi);
    }
    if (extraObj.l) {
      const linkLi = document.createElement('li');
      linkLi.innerHTML = `<span class="receipt-label" style="display:flex; flex-direction:column; align-items:flex-start; width:100%;">ลิงก์งาน: <a href="${extraObj.l}" target="_blank" style="font-size:0.85rem; color:var(--accent-color); word-break:break-all; margin-top:5px;">${extraObj.l}</a></span>`;
      receiptListEl.appendChild(linkLi);
    }

    let discountAmount = 0;
    if (pState.discountCode === 'opcms') discountAmount = Math.floor(total * 0.10);
    else if (pState.discountCode === 'ybsm100') discountAmount = total;
    else if (pState.discountCode === '15day') discountAmount = 100;
    
    if (discountAmount > 0) {
      if (discountAmount > total) discountAmount = total;
      const li = document.createElement('li');
      li.innerHTML = `<span class="receipt-label">ส่วนลด (โค้ด: ${pState.discountCode})</span><span class="receipt-price" style="color: var(--success-color);">- ${discountAmount.toLocaleString()} ฿</span>`;
      receiptListEl.appendChild(li);
      total -= discountAmount;
    }

    receiptTotalEl.innerText = total.toLocaleString();

    loadModal.classList.add('hidden');
    receiptModal.classList.remove('hidden');
    searchCodeEl.value = ''; // clear
    
  } catch (e) {
    alert('โค้ดไม่ถูกต้อง กรุณาตรวจสอบให้แน่ใจว่าเป็นรูปแบบ ybcms-...');
  }
}

// --- Portfolio Logic ---

const clientImages = [
  "Ningwen.jpg",
  "Theo.jpg",
  "Thertis.jpg",
  "aru.jpg",
  "fakfang.jpg",
  "kerori.png",
  "leta.jpg",
  "mirss.jpg",
  "ngentong.jpg",
  "pingpun.jpg",
  "puma.jpg"
];

let titleAnimated = false;
let portfolioRendered = false;

function renderPortfolio() {
  const marqueeContent = document.getElementById('marquee-content');
  const marqueeClone = document.getElementById('marquee-content-clone');
  if (!marqueeContent || !marqueeClone) return;
  
  if (!portfolioRendered) {
    marqueeContent.innerHTML = '';
    marqueeClone.innerHTML = '';
    portfolioRendered = true;
    
    const titleEl = document.querySelector('.portfolio-title');
    if (titleEl && !titleAnimated) {
      const text = titleEl.innerText;
      titleEl.innerHTML = '';
      text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.innerText = char === ' ' ? '\u00A0' : char;
        span.style.animationDelay = `${i * 0.05}s`;
        titleEl.appendChild(span);
      });
      titleAnimated = true;
    }

    let displayImages = [...clientImages];
    // Duplicate images if there are too few to fill an ultrawide screen
    while (displayImages.length < 25) {
      displayImages = displayImages.concat(clientImages);
    }

    displayImages.forEach((src, index) => {
      const delay = index * 0.1;
      
      const wrapper1 = document.createElement('div');
      wrapper1.className = 'client-item-wrapper';
      wrapper1.style.animationDelay = `${0.5 + delay}s`;
      wrapper1.innerHTML = `<div class="client-circle"><img src="${src}" alt="Client"></div>`;
      marqueeContent.appendChild(wrapper1);
      
      const wrapper2 = document.createElement('div');
      wrapper2.className = 'client-item-wrapper';
      wrapper2.style.animationDelay = `${0.5 + (displayImages.length + index) * 0.1}s`;
      wrapper2.innerHTML = `<div class="client-circle"><img src="${src}" alt="Client"></div>`;
      marqueeClone.appendChild(wrapper2);
    });
  }
}

// Switch Views
function showView(viewName) {
  if (viewName === 'calc') {
    tabCalc.classList.add('active');
    tabPortfolio.classList.remove('active');
    calculatorView.classList.remove('hidden-view');
    portfolioView.classList.add('hidden-view');
    stickyFooter.style.display = 'block';
  } else if (viewName === 'portfolio') {
    tabCalc.classList.remove('active');
    tabPortfolio.classList.add('active');
    calculatorView.classList.add('hidden-view');
    portfolioView.classList.remove('hidden-view');
    stickyFooter.style.display = 'none';
    renderPortfolio();
  }
}

tabCalc.addEventListener('click', () => showView('calc'));
tabPortfolio.addEventListener('click', () => showView('portfolio'));

// Initial render
updateWizardNav();
render();
showView('portfolio');
