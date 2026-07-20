(() => {
  'use strict';

  const images = {
    'shin-black': {
      image:'https://images.openfoodfacts.org/images/products/880/104/306/0226/front_en.26.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/8801043060226'
    },
    'demae-sesame': {
      image:'https://images.openfoodfacts.org/images/products/871/242/935/0407/front_en.87.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/8712429350407'
    },
    'chapagetti': {
      image:'https://images.openfoodfacts.org/images/products/880/104/304/8064/front_en.3.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/8801043048064'
    },
    'shin-green': {
      image:'https://images.openfoodfacts.org/images/products/003/114/606/3567/front_en.3.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/0031146063567'
    },
    'demae-miso': {
      image:'https://images.openfoodfacts.org/images/products/599/752/333/5410/front_fr.3.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/5997523335410'
    },
    'paldo-bibim': {
      image:'https://images.openfoodfacts.org/images/products/880/112/850/3051/front_en.3.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/8801128503051'
    },
    'soon-kimchi': {
      image:'https://images.openfoodfacts.org/images/products/003/114/603/3515/front_en.11.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/0031146033515'
    },
    'top-ramen-chili': {
      image:'https://images.openfoodfacts.org/images/products/007/066/201/0174/front_en.24.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/0070662010174'
    },
    'demae-spicy': {
      image:'https://images.openfoodfacts.org/images/products/599/752/336/3130/front_fr.3.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/5997523363130'
    },
    'mama-creamy-tomyum': {
      image:'https://images.openfoodfacts.org/images/products/885/098/713/1776/front_en.17.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/8850987131776'
    },
    'indomie-chicken-curry': {
      image:'https://images.openfoodfacts.org/images/products/008/968/612/0134/front_en.6.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/0089686120134'
    },
    'tangle-tomato': {
      image:'https://mao-mao.de/cdn/shop/files/samyang-instant-nudeln-tangle-stuckige-tomate-105g-153400.png?v=1750420918',
      imageSource:'https://mao-mao.de/en/products/samyang-instant-nudeln-tangle-stuckige-tomate-105g'
    },
    'prima-laksa': {
      image:'https://images.openfoodfacts.org/images/products/888/635/006/7854/front_en.7.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/8886350067854'
    },
    'maruchan-chicken': {
      image:'https://cdn.sanity.io/images/5hhe19bn/production/66b059834afec0c1844a0ef29acbadd512565b58-760x760.webp',
      imageSource:'https://www.maruchan.com/products/ramen/chicken-flavor/'
    }
  };

  window.RAMEN_DATA = (Array.isArray(window.RAMEN_DATA) ? window.RAMEN_DATA : []).map(item => ({
    ...item,
    ...(images[item.id] || {})
  }));
})();