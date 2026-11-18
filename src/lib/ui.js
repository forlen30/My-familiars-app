export function getRoot() {
  return document.getElementById('spa-root');
}

export function playSlideTransition(cb) {
  const slide = document.getElementById('slide-screen');
  if (slide) {
    slide.classList.add('active');
    setTimeout(() => { cb && cb(); slide.classList.remove('active'); }, 500);
  } else {
    cb && cb();
  }
}

// ส่งข้อมูลการดูหน้าให้ Google Analytics (ถ้ามีติดตั้งไว้)
export function trackPageView(pagePath, pageTitle) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', { page_title: pageTitle, page_path: pagePath });
  }
}
