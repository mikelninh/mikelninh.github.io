(() => {
  'use strict';

  const VERIFIED_AT = '2026-07-20';
  const reviewed = {
    'soon-veggie': {
      source:'https://villagefoods.de/products/soon-veggie-ramyun-nongshim',
      buy:'https://villagefoods.de/products/soon-veggie-ramyun-nongshim',
      market:'DE',
      country:'South Korea · sold in Germany',
      vegan:'verified',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'Village Foods Germany explicitly describes this 112 g Nongshim pack as fully vegan, publishes a plant-based ingredient list and sells it in Germany.',
        de:'Village Foods Deutschland beschreibt diese 112-g-Packung von Nongshim ausdrücklich als vollständig vegan, veröffentlicht eine pflanzliche Zutatenliste und verkauft sie in Deutschland.'
      }
    },
    'neoguri': {
      source:'https://asia-foodstore.de/neoguri-ramyun_1',
      buy:'https://asia-foodstore.de/neoguri-ramyun_1',
      market:'DE',
      country:'South Korea · sold in Germany',
      gtin:'8801043157711',
      vegan:'not',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'The German listing for GTIN 8801043157711 is the hot seafood version. The product is sold as seafood ramen and is not treated as vegan.',
        de:'Die deutsche Händlerseite für GTIN 8801043157711 führt die scharfe Meeresfrüchte-Version. Das Produkt wird als Seafood-Ramen verkauft und gilt nicht als vegan.'
      }
    },
    'nongshim-potato': {
      source:'https://www.tavato.de/p/8801043032049',
      buy:'https://www.tavato.de/p/8801043032049',
      market:'DE',
      country:'South Korea · sold in Germany',
      gtin:'8801043032049',
      vegan:'check',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'The German retailer publishes an ingredient list without an obvious animal ingredient for GTIN 8801043032049, but does not explicitly verify the pack as vegan. Check the physical package.',
        de:'Der deutsche Händler veröffentlicht für GTIN 8801043032049 eine Zutatenliste ohne offensichtliche tierische Zutat, bestätigt die Packung aber nicht ausdrücklich als vegan. Physische Packung prüfen.'
      }
    },
    'soba-chili': {
      source:'https://de.nissin-foods.eu/en/products/nissin-soba-bag-chilli',
      market:'EU / DE',
      country:'Japan-inspired · official EU product',
      vegan:'verified',
      verificationLevel:'official-eu',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'Nissin Europe’s official catalogue and vegan recipe content identify Soba Bag Chili as a vegan EU product.',
        de:'Der offizielle Nissin-Europe-Katalog und die veganen Rezeptinhalte führen Soba Bag Chili als veganes EU-Produkt.'
      }
    },
    'soba-protein-chili': {
      source:'https://de.nissin-foods.eu/en/products/nissin-soba-cup-protein-chili',
      market:'EU / DE',
      country:'Japan-inspired · official EU product',
      vegan:'verified',
      verificationLevel:'official-eu',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'Nissin Europe explicitly describes Soba Protein Chili as vegan and states 18 g protein per cup.',
        de:'Nissin Europe bezeichnet Soba Protein Chili ausdrücklich als vegan und nennt 18 g Protein pro Becher.'
      }
    },
    'soba-teriyaki': {
      source:'https://de.nissin-foods.eu/en/products/nissin-soba-bag-teriyaki',
      market:'EU / DE',
      country:'Japan-inspired · official EU product',
      vegan:'check',
      verificationLevel:'official-eu',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'The exact Nissin Europe product page lists soy, gluten and celery allergens but does not explicitly label this version vegan. Treat it as unverified until the pack is checked.',
        de:'Die genaue Nissin-Europe-Produktseite nennt Soja, Gluten und Sellerie als Allergene, kennzeichnet diese Version aber nicht ausdrücklich als vegan. Bis zur Packungsprüfung unbestätigt.'
      }
    },
    'top-ramen-soy': {
      source:'https://www.nissinfoods.com/product/top-ramen/top-ramen-soy-sauce/',
      market:'US official · Germany availability pending',
      country:'USA · Japanese brand',
      vegan:'vegetarian',
      verificationLevel:'official-global',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'Nissin USA calls this exact Soy Sauce version vegetarian, and its FAQ says it contains no ingredients of animal origin. This does not verify a German retail version.',
        de:'Nissin USA bezeichnet genau diese Soy-Sauce-Version als vegetarisch; die FAQ sagt, sie enthalte keine Zutaten tierischen Ursprungs. Eine deutsche Verkaufsversion ist damit nicht geprüft.'
      }
    },
    'mama-tomyum': {
      source:'https://www.momogo.de/produkt/mama-instant-nudeln-garnelen-tom-yum-60g',
      buy:'https://www.momogo.de/produkt/mama-instant-nudeln-garnelen-tom-yum-60g',
      market:'DE',
      country:'Thailand · sold in Germany',
      vegan:'not',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'The German retailer’s ingredient list explicitly contains shrimp powder. This 60 g Tom Yum Shrimp pack is not vegan.',
        de:'Die Zutatenliste des deutschen Händlers enthält ausdrücklich Garnelenpulver. Diese 60-g-Tom-Yum-Shrimp-Packung ist nicht vegan.'
      }
    },
    'indomie-bbq': {
      source:'https://mam-shop.de/products/indomie-noodles-mi-goreng-barbeque-chicken-80g',
      buy:'https://mam-shop.de/products/indomie-noodles-mi-goreng-barbeque-chicken-80g',
      market:'DE retailer · currently listed out of stock',
      country:'Indonesia · sold in Germany',
      vegan:'check',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'The German retailer publishes a recipe without an obvious named animal ingredient, but the product is not explicitly vegan and flavour formulations can vary. Check the exact pack.',
        de:'Der deutsche Händler veröffentlicht eine Rezeptur ohne offensichtlich benannte tierische Zutat, kennzeichnet das Produkt aber nicht ausdrücklich als vegan; Aromarezepturen können variieren. Genaue Packung prüfen.'
      }
    },
    'mykuali-curry': {
      source:'https://www.mykuali.com.my/bundle-noodle/mykuali-penang-white-curry-noodle-bundle',
      market:'Official Malaysia · Germany availability pending',
      country:'Malaysia',
      vegan:'not',
      verificationLevel:'official-global',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'MyKuali’s official ingredient list contains shrimp paste, fish seasoning, seafood seasoning and milk. This original White Curry version is not vegan.',
        de:'Die offizielle Zutatenliste von MyKuali enthält Garnelenpaste, Fischwürzung, Seafood-Würzung und Milch. Diese originale White-Curry-Version ist nicht vegan.'
      }
    },
    'vifon-pho-chay': {
      source:'https://produkte.globus.de/nudeln-reis-konserven/nudeln-reis-getreide/5901882018761/pho-chay-rau-instant-reisnudelsuppe-vegetarisch',
      buy:'https://produkte.globus.de/nudeln-reis-konserven/nudeln-reis-getreide/5901882018761/pho-chay-rau-instant-reisnudelsuppe-vegetarisch',
      market:'DE',
      country:'Vietnam · sold in Germany',
      gtin:'5901882018761',
      vegan:'vegetarian',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'Globus Germany sells GTIN 5901882018761 as a vegetarian Pho Chay rice-noodle soup. The listing does not provide sufficient explicit vegan verification.',
        de:'Globus Deutschland verkauft GTIN 5901882018761 als vegetarische Pho-Chay-Reisnudelsuppe. Die Händlerseite liefert keine ausreichende ausdrückliche Vegan-Bestätigung.'
      }
    },
    'haohao-shrimp': {
      source:'https://www.nagofa.de/products/hao-hao-chua-cay-instantnudeln-hot-sour',
      buy:'https://www.nagofa.de/products/hao-hao-chua-cay-instantnudeln-hot-sour',
      market:'DE',
      country:'Vietnam · sold in Germany',
      gtin:'8934563138165',
      vegan:'not',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'The German listing for barcode 8934563138165 explicitly contains fish sauce and shrimp powder. This pack is not vegan.',
        de:'Die deutsche Händlerseite für Barcode 8934563138165 nennt ausdrücklich Fischsauce und Garnelenpulver. Diese Packung ist nicht vegan.'
      }
    },
    'sapporo-original': {
      source:'https://sanyofoodsamerica.com/product/sapporo-ichiban-original/',
      market:'Official US · Germany availability pending',
      country:'Japan / USA',
      vegan:'not',
      verificationLevel:'official-global',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'Sanyo Foods’ official ingredient list contains chicken broth powder and beef stock powder. This cited version is not vegan.',
        de:'Die offizielle Zutatenliste von Sanyo Foods enthält Hühnerbrühenpulver und Rinderbrühenpulver. Diese zitierte Version ist nicht vegan.'
      }
    },
    'tangle-garlic': {
      source:'https://www.rewe.de/shop/p/sam-yang-tangle-instant-noodle-garlic-oil-100g/9534000',
      buy:'https://www.kaufland.de/product/537094323/',
      market:'DE',
      country:'South Korea · sold in Germany',
      gtin:'4262371623196',
      vegan:'check',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'REWE and Kaufland list chicken-style flavouring for the German-market product, but do not establish whether the flavour itself is animal-derived. This pack remains unverified, not labelled vegan.',
        de:'REWE und Kaufland führen bei der deutschen Marktversion Aroma mit Huhngeschmack auf, klären aber nicht, ob dieses Aroma selbst tierischen Ursprungs ist. Die Packung bleibt unbestätigt und wird nicht als vegan markiert.'
      }
    },
    'buldak-habanero': {
      image:'https://images.openfoodfacts.org/images/products/880/107/314/3777/front_en.21.400.jpg',
      imageSource:'https://world.openfoodfacts.org/product/8801073143777'
    }
  };

  window.RAMEN_DATA = (Array.isArray(window.RAMEN_DATA) ? window.RAMEN_DATA : []).map(item => ({
    ...item,
    ...(reviewed[item.id] || {})
  }));
})();