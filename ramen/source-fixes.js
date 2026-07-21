(() => {
  'use strict';
  const fixes = {
    'buldak-original': {
      imageSource:'https://www.samyangfoods.com/eng/brand/view.do?searchMainUseYn=Y&seq=245'
    }
  };
  window.RAMEN_DATA = (Array.isArray(window.RAMEN_DATA) ? window.RAMEN_DATA : []).map(item => ({
    ...item,
    ...(fixes[item.id] || {})
  }));
})();
