export const META_PIXEL_ID = "1118365304509487";

export const META_PIXEL_BOOTSTRAP = `(function () {
  if (window.__hoverMetaPixel) return;
  try {
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window,document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    // Route commits below own SPA views; do not also count SDK history events.
    window.fbq.disablePushState = true;
    window.fbq('init', '${META_PIXEL_ID}');
    window.__hoverMetaPixel = { lastPath: window.location.pathname };
    window.fbq('track', 'PageView');
  } catch (_) {
    // Advertising tools must not interrupt the website.
  }
})();`;

// Raw noscript HTML prevents React from preloading a tracking image while JS is enabled.
export const META_PIXEL_NOSCRIPT = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&amp;ev=PageView&amp;noscript=1" alt="">`;
