(() => {
  'use strict';

  const images = {
    'soon-veggie': {
      image:'https://villagefoods.de/cdn/shop/products/SoonVeggieRamyunNoodle-Nongshim-112g_1_VF.jpg?v=1737225674',
      imageSource:'https://villagefoods.de/products/soon-veggie-ramyun-nongshim'
    },
    'demae-sesame': {
      image:'https://cdn.prod.website-files.com/66de9787f00d0586abc780c4/67068838f3b93cb100909a04_Demae-Ramen-Sesame.png',
      imageSource:'https://de.nissin-foods.eu/products/nissin-demae-ramen-sesame'
    },
    'neoguri': {
      image:'https://images.openfoodfacts.org/images/products/880/104/315/7711/front_en.47.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/8801043157711'
    },
    'soba-chili': {
      image:'https://cdn.prod.website-files.com/66de9787f00d0586abc780c4/670695d3a6f0b6cc99518a6f_Soba-Bag-Chili.png',
      imageSource:'https://de.nissin-foods.eu/en/products/nissin-soba-bag-chilli'
    },
    'nongshim-potato': {
      image:'https://images.openfoodfacts.org/images/products/003/114/603/2013/front_fr.3.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/0031146032013'
    },
    'ottogi-sesame': {
      image:'https://static.y-mart.de/media/9a563f444a0761d60d6e85ed731c2b03/8801045526201-800.webp',
      imageSource:'https://www.y-mart.de/en/category/ramen-noodles/ramen-instant-noodles/ottogi-chamggae-ramen-bundle.8801045526201-1127294603.html'
    },
    'mama-tomyum': {
      image:'https://cdn.sanity.io/images/jdiyrv6o/production/b7272b4ce882aa5b052cff992ecd969c326d9b77-372x372.png',
      imageSource:'https://www.momogo.de/produkt/mama-instant-nudeln-garnelen-tom-yum-60g'
    },
    'mama-creamy-tomyum': {
      image:'https://cdn.sanity.io/images/jdiyrv6o/production/75c093dd1d9838e52e0beba0b9c78c0ff71e139b-744x744.png?auto=format&w=1600',
      imageSource:'https://www.momogo.de/produkt/mama-instantnudeln-creamy-tom-yum-geschmack-55g'
    },
    'soba-teriyaki': {
      image:'https://images.openfoodfacts.org/images/products/599/752/331/3159/front_en.90.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/5997523313159'
    },
    'indomie-bbq': {
      image:'https://mam-shop.de/cdn/shop/files/2100000060733_fc53553f-09a1-4776-81f0-21bfdd094a4c.webp?v=1749233016',
      imageSource:'https://mam-shop.de/products/indomie-noodles-mi-goreng-barbeque-chicken-80g'
    },
    'indomie-chicken-curry': {
      image:'https://www.indomie.com/uploads/product/indomie-chicken-curry-extra-curry-sprinkles_detail_171556997.png',
      imageSource:'https://www.indomie.com/product/soup-based-noodles'
    },
    'asha-sesame': {
      image:'https://ashadrynoodle.com/cdn/shop/files/Amazon_Chili_Crisp_Noodle_Listing_1_1200x.png?v=1763510108',
      imageSource:'https://ashadrynoodle.com/products/a-sha-chili-crisp-squiggly-noodle'
    },
    'mykuali-curry': {
      image:'https://static.wixstatic.com/media/2c528d_388a38f7b0e3471fb6670f170f7e383b~mv2.png/v1/fill/w_3375,h_3375,al_c/3.png',
      imageSource:'https://www.mykuali.com.my/bundle-noodle/mykuali-penang-white-curry-noodle-bundle'
    },
    'vifon-pho-chay': {
      image:'https://images.openfoodfacts.org/images/products/590/188/201/8761/front_fi.24.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/5901882018761'
    },
    'haohao-shrimp': {
      image:'https://www.nagofa.de/cdn/shop/files/Hao-Hao-Instantnudeln-Hot-Sour-Shrimp-Chua-cay.jpg?v=1749326164&width=1200',
      imageSource:'https://www.nagofa.de/products/hao-hao-chua-cay-instantnudeln-hot-sour'
    },
    'waiwai-oriental': {
      image:'https://asia-foodstore.de/media/image/product/21067/lg/wai-wai-instantnudel-nach-orientalischer-art30x-60g.jpg',
      imageSource:'https://asia-foodstore.de/wai-wai-instantnudel-nach-orientalischer-art30x-60g'
    },
    'sapporo-original': {
      image:'https://images.openfoodfacts.org/images/products/007/618/601/0003/front_en.16.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/0076186010003'
    },
    'top-ramen-soy': {
      image:'https://www.nissinfoods.com/wp-content/uploads/2024/10/23_NISSIN_Website_Product_Transparent_TR-_Original_SoySauce_V1_1x1_3000x3000-1.webp',
      imageSource:'https://www.nissinfoods.com/product/top-ramen/top-ramen-soy-sauce/'
    },
    'tangle-garlic': {
      image:'https://static.y-mart.de/media/34b9280530a602c5dd9f74884eee5fcc/8801073116849_-800.webp',
      imageSource:'https://www.y-mart.de/en/category/ramen-noodles/ramen-instant-noodles/samyang-tangle-garlic-oil-pasta.8801073116849-1111982950.html'
    },
    'soba-protein-chili': {
      image:'https://cdn.prod.website-files.com/66de9787f00d0586abc780c4/68a6da980bcf24c2d50ed96b_NSC%20Protein%20Chili%20%281%29.png',
      imageSource:'https://de.nissin-foods.eu/en/products/nissin-soba-cup-protein-chili'
    }
  };

  window.RAMEN_DATA = (Array.isArray(window.RAMEN_DATA) ? window.RAMEN_DATA : []).map(item => ({
    ...item,
    ...(images[item.id] || {})
  }));
})();