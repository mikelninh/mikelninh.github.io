(() => {
  'use strict';

  const VERIFIED_AT = '2026-07-20';
  const base = Array.isArray(window.RAMEN_DATA) ? window.RAMEN_DATA : [];

  const packshots = {
    'shin-black': {image:'https://images.openfoodfacts.org/images/products/880/104/306/0226/front_en.26.400.jpg',imageSource:'https://world.openfoodfacts.org/product/8801043060226'},
    'demae-sesame': {image:'https://images.openfoodfacts.org/images/products/871/242/935/0407/front_en.87.400.jpg',imageSource:'https://world.openfoodfacts.org/product/8712429350407'},
    'chapagetti': {image:'https://images.openfoodfacts.org/images/products/880/104/304/8064/front_en.3.400.jpg',imageSource:'https://world.openfoodfacts.org/product/8801043048064'},
    'shin-green': {image:'https://images.openfoodfacts.org/images/products/003/114/606/3567/front_en.3.400.jpg',imageSource:'https://world.openfoodfacts.org/product/0031146063567'},
    'demae-miso': {image:'https://images.openfoodfacts.org/images/products/599/752/333/5410/front_fr.3.400.jpg',imageSource:'https://world.openfoodfacts.org/product/5997523335410'},
    'paldo-bibim': {image:'https://images.openfoodfacts.org/images/products/880/112/850/3051/front_en.3.400.jpg',imageSource:'https://world.openfoodfacts.org/product/8801128503051'},
    'soon-kimchi': {image:'https://images.openfoodfacts.org/images/products/003/114/603/3515/front_en.11.400.jpg',imageSource:'https://world.openfoodfacts.org/product/0031146033515'},
    'top-ramen-chili': {image:'https://images.openfoodfacts.org/images/products/007/066/201/0174/front_en.24.400.jpg',imageSource:'https://world.openfoodfacts.org/product/0070662010174'},
    'demae-spicy': {image:'https://images.openfoodfacts.org/images/products/599/752/336/3130/front_fr.3.400.jpg',imageSource:'https://world.openfoodfacts.org/product/5997523363130'},
    'mama-creamy-tomyum': {image:'https://images.openfoodfacts.org/images/products/885/098/713/1776/front_en.17.400.jpg',imageSource:'https://world.openfoodfacts.org/product/8850987131776'},
    'indomie-chicken-curry': {image:'https://images.openfoodfacts.org/images/products/008/968/612/0134/front_en.6.400.jpg',imageSource:'https://world.openfoodfacts.org/product/0089686120134'},
    'tangle-tomato': {image:'https://mao-mao.de/cdn/shop/files/samyang-instant-nudeln-tangle-stuckige-tomate-105g-153400.png?v=1750420918',imageSource:'https://mao-mao.de/en/products/samyang-instant-nudeln-tangle-stuckige-tomate-105g'},
    'prima-laksa': {image:'https://images.openfoodfacts.org/images/products/888/635/006/7854/front_en.7.400.jpg',imageSource:'https://world.openfoodfacts.org/product/8886350067854'},
    'maruchan-chicken': {image:'https://cdn.sanity.io/images/5hhe19bn/production/66b059834afec0c1844a0ef29acbadd512565b58-760x760.webp',imageSource:'https://www.maruchan.com/products/ramen/chicken-flavor/'}
  };

  const overrides = {
    'shin-original': {
      name: 'Shin Ramyun · vegan German import', country: 'South Korea · sold in Germany', market: 'DE', gtin: '8801043150620', vegan: 'verified', verificationLevel: 'germany-retailer', verifiedAt: VERIFIED_AT,
      image: 'https://asia-foodstore.de/media/image/product/967/xs/shin-ramen-vegan.jpg', imageSource: 'https://asia-foodstore.de/shin-ramen-vegan', source: 'https://asia-foodstore.de/shin-ramen-vegan', buy: 'https://asia-foodstore.de/shin-ramen-vegan',
      evidence: {en:'German retailer listing for GTIN 8801043150620 marks this version vegan and lists a plant-based seasoning recipe. Always match the GTIN and current pack.',de:'Die deutsche Händlerseite führt GTIN 8801043150620 als vegan und listet eine pflanzliche Würzmischung. Immer GTIN und aktuelle Packung abgleichen.'},
      reason: {en:'The iconic Shin experience in a Germany-available recipe that is explicitly sold as vegan.',de:'Das ikonische Shin-Erlebnis in einer in Deutschland erhältlichen Rezeptur, die ausdrücklich als vegan verkauft wird.'}
    },
    'soon-veggie': {
      country:'South Korea · sold in Germany', market:'DE', vegan:'verified', verificationLevel:'germany-retailer', verifiedAt:VERIFIED_AT,
      source:'https://www.rewe.de/shop/p/nongshim-veggie-ramyun-nudelsuppe-vegan-560g/3587537', buy:'https://www.rewe.de/shop/p/nongshim-veggie-ramyun-nudelsuppe-vegan-560g/3587537',
      evidence:{en:'REWE Germany labels the product vegan and publishes a plant-based ingredient list.',de:'REWE Deutschland kennzeichnet das Produkt als vegan und veröffentlicht eine pflanzliche Zutatenliste.'}
    },
    'buldak-original': {
      market:'Global official · German pack review pending', verificationLevel:'official-global', verifiedAt:VERIFIED_AT,
      source:'https://www.samyangfoods.com/eng/brand/view.do?searchMainUseYn=Y&seq=245', imageSource:'https://www.samyangfoods.com/eng/brand/view.do?searchMainUseYn=Y&seq=245',
      evidence:{en:'Samyang’s current global product page verifies the product identity. Vegan status for the German retail pack is not verified.',de:'Samyangs aktuelle globale Produktseite bestätigt die Produktidentität. Der Veganstatus der deutschen Verkaufspackung ist nicht geprüft.'}
    },
    'buldak-habanero': {
      market:'Global official · German pack review pending', verificationLevel:'official-global', verifiedAt:VERIFIED_AT,
      source:'https://buldak.com/us/blog/all-about-buldak-habanero-lime-flavor/',
      evidence:{en:'The current official Buldak page verifies the flavour. The cited US recipe uses artificial chicken flavour; the German import pack still requires a separate ingredient check.',de:'Die aktuelle offizielle Buldak-Seite bestätigt die Sorte. Die zitierte US-Rezeptur nutzt künstliches Hühneraroma; die deutsche Importpackung braucht weiterhin eine eigene Zutatenprüfung.'}
    },
    'tangle-tomato': {
      country:'South Korea · sold in Germany', market:'DE retailer · exact recipe check required', verificationLevel:'germany-retailer', verifiedAt:VERIFIED_AT,
      source:'https://mao-mao.de/en/products/samyang-instant-nudeln-tangle-stuckige-tomate-105g', buy:'https://mao-mao.de/en/products/samyang-instant-nudeln-tangle-stuckige-tomate-105g', vegan:'check',
      evidence:{en:'A current German retailer sells this 105 g version. German marketplace ingredient listings mention chicken flavour, so it is not treated as vegan-verified without checking the physical pack.',de:'Ein aktueller deutscher Händler verkauft diese 105-g-Version. Deutsche Marktplatz-Zutatenlisten nennen Hühneraroma; ohne Prüfung der physischen Packung gilt sie nicht als vegan bestätigt.'}
    },
    'tangle-garlic': {
      country:'South Korea · sold in Germany', market:'DE', verificationLevel:'germany-retailer', verifiedAt:VERIFIED_AT,
      source:'https://www.rewe.de/shop/p/sam-yang-tangle-instant-noodle-garlic-oil-100g/9534000', buy:'https://www.rewe.de/shop/p/sam-yang-tangle-instant-noodle-garlic-oil-100g/9534000', vegan:'check',
      evidence:{en:'REWE Germany publishes the local ingredient list, which includes chicken-style flavouring. The source does not explicitly establish whether that flavour is animal-derived, so this pack is not marked vegan.',de:'REWE Deutschland veröffentlicht die lokale Zutatenliste, die Aroma mit Huhngeschmack enthält. Die Quelle klärt nicht ausdrücklich, ob dieses Aroma tierischen Ursprungs ist; daher wird die Packung nicht als vegan markiert.'}
    },
    'jin-spicy': {
      country:'South Korea · sold in Germany', market:'DE', gtin:'8801045520124', vegan:'not', globalVeganStatus:'not', verificationLevel:'germany-retailer', verifiedAt:VERIFIED_AT,
      image:'https://static.y-mart.de/media/6c57542d9de0dd32d38b45c84db49a02/8801045520124-800.webp', imageSource:'https://www.y-mart.de/en/category/ramen-noodles/ramen-instant-noodles/ottogi-jin-ramen-spicy.8801045520124-1153209474.html',
      source:'https://www.y-mart.de/en/category/ramen-noodles/ramen-instant-noodles/ottogi-jin-ramen-spicy.8801045520124-1153209474.html', buy:'https://www.y-mart.de/en/category/ramen-noodles/ramen-instant-noodles/ottogi-jin-ramen-spicy.8801045520124-1153209474.html',
      evidence:{en:'The German y-mart listing for GTIN 8801045520124 includes eggshell powder, seasoned beef flakes and an allergen statement covering egg, milk, beef, pork, chicken and shellfish. This 120 g pack is not vegan.',de:'Die deutsche y-mart-Seite für GTIN 8801045520124 nennt Eierschalenpulver, gewürzte Rindfleischflocken sowie Ei, Milch, Rind, Schwein, Huhn und Schalentiere. Diese 120-g-Packung ist nicht vegan.'}
    },
    'akuan-hot-sour': {
      country:'China · sold in Germany', market:'DE', vegan:'verified', verificationLevel:'germany-retailer', verifiedAt:VERIFIED_AT,
      image:'https://mao-mao.de/cdn/shop/products/AK-Instant-Nudeln-mit-rotem-_l-_sauer-scharf_-115g-Andere-47780015.jpg?v=1744133596&width=1080', imageSource:'https://mao-mao.de/en/products/ak-instant-nudeln-mit-rotem-ol-sauer-scharf-115g',
      source:'https://mao-mao.de/en/products/ak-instant-nudeln-mit-rotem-ol-sauer-scharf-115g', buy:'https://mao-mao.de/en/products/ak-instant-nudeln-mit-rotem-ol-sauer-scharf-115g',
      evidence:{en:'The German retailer publishes the ingredient list and explicitly states that its imported 115 g sour-spicy version is suitable for vegan and vegetarian diets.',de:'Der deutsche Händler veröffentlicht die Zutatenliste und bezeichnet seine importierte 115-g-Version ausdrücklich als für vegane und vegetarische Ernährung geeignet.'}
    },
    'koyo-tofu-miso': {
      market:'Official US product · Germany availability pending', vegan:'check', verificationLevel:'official-global', verifiedAt:VERIFIED_AT,
      image:'https://koyonoodles.com/content/brands/koyonoodles/en/products/ramen/tofu-miso-ramen-reduced-sodium/_jcr_content/par/stylablecontainer/par/stylablecontainer_14/par/multicolumnlist/column_1/multicolumnlist/column_1/image.img.png/1673471277863', imageSource:'https://koyonoodles.com/products/ramen/tofu-miso-ramen-reduced-sodium.html',
      source:'https://koyonoodles.com/products/ramen/tofu-miso-ramen-reduced-sodium.html',
      evidence:{en:'Koyo’s current page lists a plant-based ingredient recipe for the reduced-sodium Tofu Miso product, but it does not provide Germany-market verification or an explicit vegan claim on the cited page.',de:'Koyos aktuelle Seite listet eine pflanzliche Zutatenrezeptur für Tofu Miso Reduced Sodium, liefert aber weder eine Deutschland-Prüfung noch eine ausdrückliche Vegan-Aussage auf der zitierten Seite.'}
    },
    'demae-miso': {market:'EU / DE',verificationLevel:'official-eu',verifiedAt:VERIFIED_AT,source:'https://www.nissin-foods.eu/en/products?category=Demae+Ramen'},
    'demae-spicy': {market:'EU / DE',verificationLevel:'official-eu',verifiedAt:VERIFIED_AT,source:'https://www.nissin-foods.eu/en/products?category=Demae+Ramen'},
    'soba-chili': {market:'EU / DE',verificationLevel:'official-eu',verifiedAt:VERIFIED_AT,source:'https://www.nissin-foods.eu/en/products'},
    'soba-protein-chili': {market:'EU / DE',verificationLevel:'official-eu',verifiedAt:VERIFIED_AT,source:'https://www.nissin-foods.eu/en/products'},
    'koka-mushroom': {
      market:'Global · German availability to verify',verificationLevel:'official-global',verifiedAt:VERIFIED_AT,source:'https://kokanoodles.com/product/koka-original-mushroom-noodles/',
      image:'https://kokanoodles.com/wp-content/uploads/2024/08/Mushroom-Original-MP-S.webp',imageSource:'https://kokanoodles.com/product/koka-original-mushroom-noodles/',vegan:'vegetarian',
      evidence:{en:'KOKA’s official page calls it suitable for vegetarians and publishes ingredients without an explicit vegan certification. Treat it as not vegan-verified until the German pack is checked.',de:'KOKA bezeichnet das Produkt offiziell als vegetarisch und veröffentlicht Zutaten, aber keine ausdrückliche Vegan-Zertifizierung. Bis zur Prüfung der deutschen Packung nicht als vegan bestätigt behandeln.'}
    },
    'koka-curry': {
      market:'Global · German availability to verify',verificationLevel:'official-global',verifiedAt:VERIFIED_AT,source:'https://kokanoodles.com/product/koka-original-curry-noodles/',
      image:'https://kokanoodles.com/wp-content/uploads/2024/08/Curry-Original-MP-S.webp',imageSource:'https://kokanoodles.com/product/koka-original-curry-noodles/',vegan:'check',
      evidence:{en:'The official KOKA Original Curry ingredient list shown on the source page contains no obvious animal ingredient, but the exact German retail pack is not yet verified.',de:'Die offizielle Zutatenliste von KOKA Original Curry enthält auf der Quellseite keine offensichtliche tierische Zutat; die konkrete deutsche Verkaufspackung ist jedoch noch nicht geprüft.'}
    }
  };

  const removedIds = new Set(['nissin-cup-chicken']);
  const patched = base.filter(item=>!removedIds.has(item.id)).map(item=>{
    const override=overrides[item.id];
    const downgradeGlobalVeganClaim=!override&&item.vegan==='verified';
    return {...item,globalVeganStatus:item.vegan,market:'Global · Germany review pending',verificationLevel:'needs-germany-review',verifiedAt:null,buy:null,gtin:null,imageSource:item.image?item.source:null,vegan:downgradeGlobalVeganClaim?'check':item.vegan,evidence:downgradeGlobalVeganClaim?{en:'A version outside Germany may be described as vegan, but the German/EU retail pack has not yet been verified. Check the exact package before buying.',de:'Eine Version außerhalb Deutschlands kann als vegan beschrieben sein; die deutsche/EU-Verkaufspackung ist jedoch noch nicht geprüft. Vor dem Kauf die konkrete Packung kontrollieren.'}:item.evidence,...(packshots[item.id]||{}),...(override||{})};
  });

  patched.push({
    rank:6,id:'shin-spicy-chicken-de',brand:'Nongshim',name:'Shin Ramyun · Spicy Chicken German import',country:'South Korea · sold in Germany',market:'DE',style:'Spicy soup',spice:4,gtin:'8801043069588',vegan:'not',globalVeganStatus:'not',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
    image:'https://static.y-mart.de/media/0af6bbf8a646b57379ad03e79b1fcd80/8801043069588-800.webp',imageSource:'https://www.y-mart.de/de/kategorie/ramen-nudeln/ramen-instant-noodeln/nongshim-shin-ramyun-wuerziger-huehnergeschmack.8801043069588-1245574622.html',source:'https://www.rewe.de/shop/p/nongshim-shin-ramyun-spicy-chicken-120g/9963099',buy:'https://www.y-mart.de/de/kategorie/ramen-nudeln/ramen-instant-noodeln/nongshim-shin-ramyun-wuerziger-huehnergeschmack.8801043069588-1245574622.html',imageQuery:'Nongshim Shin Ramyun Spicy Chicken 8801043069588',
    reason:{en:'A Germany-sold Shin version that looks similar to the vegan import but uses a different recipe and GTIN.',de:'Eine in Deutschland verkaufte Shin-Version, die ähnlich aussieht wie der vegane Import, aber eine andere Rezeptur und GTIN hat.'},
    evidence:{en:'REWE and y-mart list chicken flavour in the seasoning for GTIN 8801043069588. This version is not vegan.',de:'REWE und y-mart führen bei GTIN 8801043069588 Hühneraroma in der Würzmischung. Diese Version ist nicht vegan.'}
  });

  patched.sort((a,b)=>(a.rank||999)-(b.rank||999));
  window.RAMEN_DATA=patched;
})();