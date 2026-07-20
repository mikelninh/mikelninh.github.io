(() => {
  'use strict';

  if (!document.querySelector('link[href="upgrades.css"]')) {
    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = 'upgrades.css';
    document.head.appendChild(styles);
  }

  const VERIFIED_AT = '2026-07-20';
  const reviewed = {
    'buldak-carbonara': {
      source:'https://www.rewe.de/shop/p/samyang-buldak-hot-chicken-carbonara-flavor-ramen-130g/9968977',buy:'https://www.rewe.de/shop/p/samyang-buldak-hot-chicken-carbonara-flavor-ramen-130g/9968977',market:'DE',country:'South Korea · sold in Germany',vegan:'check',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
      evidence:{en:'REWE Germany lists a current 130 g recipe with chicken-style flavouring but no explicit vegan claim. Older German listings used dairy ingredients, so the exact GTIN and physical pack must be checked.',de:'REWE Deutschland listet eine aktuelle 130-g-Rezeptur mit Hühnerfleischgeschmacksaroma, aber ohne ausdrückliche Vegan-Kennzeichnung. Ältere deutsche Listungen enthielten Milchbestandteile; daher müssen GTIN und konkrete Packung geprüft werden.'}
    },
    'shin-black': {
      source:'https://www.tavato.de/p/8801043060226',buy:'https://www.tavato.de/p/8801043060226',market:'DE',country:'South Korea · sold in Germany',gtin:'8801043060226',vegan:'not',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
      evidence:{en:'The German listing for GTIN 8801043060226 includes eggshell calcium; German retailers also describe the broth as beef-based. This Shin Black pack is not vegan.',de:'Die deutsche Händlerseite für GTIN 8801043060226 nennt Eierschalencalcium; deutsche Händler beschreiben die Brühe außerdem als rindfleischbasiert. Diese Shin-Black-Packung ist nicht vegan.'}
    },
    'buldak-2x': {
      source:'https://edeka-foodservice.de/eigenmarken/produkte/5087720009/samyang-buldak-2x-spicy-hot-chicken-140g',buy:'https://edeka-foodservice.de/eigenmarken/produkte/5087720009/samyang-buldak-2x-spicy-hot-chicken-140g',market:'DE retailer · recipe verification incomplete',country:'South Korea · sold in Germany',vegan:'check',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
      evidence:{en:'A current German retailer lists the exact 140 g product, but the page does not provide enough ingredient evidence to verify it as vegan. Check the imported pack.',de:'Ein aktueller deutscher Händler führt das genaue 140-g-Produkt, liefert aber nicht genügend Zutateninformationen für eine Vegan-Bestätigung. Importpackung prüfen.'}
    },
    'demae-sesame': {
      source:'https://de.nissin-foods.eu/en/products/nissin-demae-ramen-sesame',market:'EU / DE',country:'Japan-inspired · official EU product',gtin:'8712429350407',vegan:'check',verificationLevel:'official-eu',verifiedAt:VERIFIED_AT,
      evidence:{en:'Nissin Europe publishes the exact German/EU product page and lists only soy, gluten and sesame allergens, but does not explicitly label this version vegan. Treat it as unverified.',de:'Nissin Europe veröffentlicht die genaue deutsche/EU-Produktseite und nennt nur Soja, Gluten und Sesam als Allergene, kennzeichnet diese Version aber nicht ausdrücklich vegan. Daher bleibt sie unbestätigt.'}
    },
    'chapagetti': {
      source:'https://www.rewe.de/shop/p/nongshim-instantnudeln-chapagetti-140g/1917981',buy:'https://www.rewe.de/shop/p/nongshim-instantnudeln-chapagetti-140g/1917981',market:'DE',country:'South Korea · sold in Germany',gtin:'8801043048064',vegan:'not',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
      evidence:{en:'REWE Germany’s ingredient list for the 140 g pack explicitly includes shrimp in the seasoning. This German retail version is not vegan.',de:'Die Zutatenliste von REWE Deutschland für die 140-g-Packung enthält ausdrücklich Garnelen in der Würzung. Diese deutsche Verkaufsversion ist nicht vegan.'}
    },
    'buldak-cheese': {
      source:'https://www.rewe.de/shop/p/samyang-buldak-cheese-flavour-hot-chicken-flavor-ramen-140g/9969483',buy:'https://www.rewe.de/shop/p/samyang-buldak-cheese-flavour-hot-chicken-flavor-ramen-140g/9969483',market:'DE',country:'South Korea · sold in Germany',vegan:'check',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
      evidence:{en:'REWE’s current German listing contains chicken-style flavouring and no explicit vegan claim. A separate older German SKU contained milk and mozzarella, so the exact pack must be checked.',de:'Die aktuelle deutsche REWE-Listung enthält Hühnerfleischgeschmacksaroma und keine ausdrückliche Vegan-Kennzeichnung. Eine ältere deutsche SKU enthielt Milch und Mozzarella; deshalb muss die konkrete Packung geprüft werden.'}
    },
    'indomie-rendang': {
      source:'https://www.asia-in.de/Indomie-Instant-Brat-Nudeln-mit-Mi-Goreng-Rendang-Beef-Rind-Geschmack-Dry-Noodles-80-g',buy:'https://www.asia-in.de/Indomie-Instant-Brat-Nudeln-mit-Mi-Goreng-Rendang-Beef-Rind-Geschmack-Dry-Noodles-80-g',market:'DE',country:'Indonesia · sold in Germany',vegan:'check',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
      evidence:{en:'The German retailer lists beef flavour in the seasoning, but does not establish whether the flavour is animal-derived and does not label the product vegan. Check the exact pack.',de:'Der deutsche Händler führt Rindfleischgeschmack in der Würzung, klärt aber nicht, ob das Aroma tierischen Ursprungs ist, und kennzeichnet das Produkt nicht vegan. Genaue Packung prüfen.'}
    },
    'paldo-bibim': {
      source:'https://www.y-mart.de/de/kategorie/ramen-nudeln/ramen-instant-noodeln/paldo-bibimmyeon.8801128503037-1102280306.html',buy:'https://www.y-mart.de/de/kategorie/ramen-nudeln/ramen-instant-noodeln/paldo-bibimmyeon.8801128503037-1102280306.html',market:'DE',country:'South Korea · sold in Germany',gtin:'8801128503037',vegan:'not',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
      evidence:{en:'The German y-mart listing states that this 130 g pack contains milk and ingredients from pork, beef and chicken. It is not vegan.',de:'Die deutsche y-mart-Seite gibt an, dass diese 130-g-Packung Milch sowie Bestandteile von Schwein, Rind und Huhn enthält. Sie ist nicht vegan.'}
    },
    'soon-kimchi': {
      source:'https://www.rewe.de/shop/p/nongshim-kimchi-shin-112g/1964061',buy:'https://www.rewe.de/shop/p/nongshim-kimchi-shin-112g/1964061',market:'DE',country:'South Korea · sold in Germany',vegan:'check',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
      evidence:{en:'REWE Germany publishes an ingredient list without an obvious animal ingredient for this 112 g Kimchi pack, but does not explicitly label it vegan. The physical pack remains authoritative.',de:'REWE Deutschland veröffentlicht für diese 112-g-Kimchi-Packung eine Zutatenliste ohne offensichtliche tierische Zutat, kennzeichnet sie aber nicht ausdrücklich vegan. Maßgeblich bleibt die konkrete Packung.'}
    },
    'indomie-original': {
      source:'https://www.y-mart.de/de/kategorie/ramen-nudeln/ramen-instant-noodeln/indomie-mi-goreng-gebratene-instant-nudeln.8994963002800-1126622303.html',buy:'https://www.y-mart.de/de/kategorie/ramen-nudeln/ramen-instant-noodeln/indomie-mi-goreng-gebratene-instant-nudeln.8994963002800-1126622303.html',market:'DE',country:'Serbia · sold in Germany',gtin:'8994963002800',vegan:'check',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
      evidence:{en:'The German y-mart listing for GTIN 8994963002800 includes artificial chicken flavour but does not establish its origin and does not label this pack vegan. Check the exact packet.',de:'Die deutsche y-mart-Seite für GTIN 8994963002800 nennt künstlichen Hühnergeschmack, klärt dessen Ursprung aber nicht und kennzeichnet die Packung nicht vegan. Genaue Packung prüfen.'}
    },
    'indomie-hot': {
      source:'https://www.momogo.de/produkt/indomie-mi-goreng-stir-fry-spicy-instant-gebratene-nudeln-80g',buy:'https://www.momogo.de/produkt/indomie-mi-goreng-stir-fry-spicy-instant-gebratene-nudeln-80g',market:'DE retailer · full recipe check required',country:'Indonesia · sold in Germany',vegan:'check',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
      evidence:{en:'A German retailer sells the exact Hot & Spicy 80 g product, but the accessible listing does not provide sufficient evidence for an explicit vegan claim. Check the pack.',de:'Ein deutscher Händler verkauft das genaue Hot-&-Spicy-Produkt mit 80 g, die zugängliche Listung liefert aber keinen ausreichenden ausdrücklichen Vegan-Nachweis. Packung prüfen.'}
    },
    'shin-green': {
      source:'https://nongshimusa.com/product-detail?pid=65',buy:'https://www.idealo.de/preisvergleich/ProductCategory/31946F102691157.html',market:'Official US recipe · available in Germany via marketplace',country:'South Korea / USA version',vegan:'verified',verificationLevel:'official-global',verifiedAt:VERIFIED_AT,
      evidence:{en:'Nongshim officially describes Shin Green Mushroom & Fried Tofu as completely plant-based. German marketplace availability exists, but buyers must confirm that the imported pack is the same cited version.',de:'Nongshim beschreibt Shin Green Mushroom & Fried Tofu offiziell als vollständig pflanzlich. Es ist über deutsche Marktplätze erhältlich; Käufer:innen müssen jedoch prüfen, ob die Importpackung genau der zitierten Version entspricht.'}
    },
    'buldak-jjajang': {
      source:'https://www.samyangfoods.com/eng/brand/view.do?searchMainUseYn=Y&seq=403',buy:'https://huaxinsupermarkt.de/shop/nudeln/instant-nudeln/samyang-buldak-jjajiang-140g/',market:'Official global identity · sold in Germany',country:'South Korea · German retailer available',vegan:'check',verificationLevel:'official-global',verifiedAt:VERIFIED_AT,
      evidence:{en:'Samyang’s official page verifies the Jjajang product identity and a German retailer sells the 140 g pack. No explicit vegan claim for the German recipe was found, so the pack must be checked.',de:'Samyangs offizielle Seite bestätigt die Jjajang-Produktidentität und ein deutscher Händler verkauft die 140-g-Packung. Für die deutsche Rezeptur wurde keine ausdrückliche Vegan-Kennzeichnung gefunden; daher Packung prüfen.'}
    },
    'indomie-satay': {
      source:'https://www.indomie.com/products',market:'Official global product · Germany availability pending',country:'Indonesia',vegan:'check',verificationLevel:'official-global',verifiedAt:VERIFIED_AT,
      evidence:{en:'Indomie’s official catalogue confirms the Satay flavour and describes it as inspired by chicken satay with peanut sauce. It does not provide a vegan claim or a verified German recipe.',de:'Indomies offizieller Katalog bestätigt die Satay-Sorte und beschreibt sie als von Hähnchen-Satay mit Erdnusssauce inspiriert. Eine Vegan-Kennzeichnung oder geprüfte deutsche Rezeptur wird nicht angegeben.'}
    },
    'top-ramen-chili': {
      source:'https://www.nissinfoods.com/product/top-ramen/top-ramen-chili/',market:'Official US recipe · Germany availability pending',country:'USA · Japanese brand',vegan:'vegetarian',verificationLevel:'official-global',verifiedAt:VERIFIED_AT,
      evidence:{en:'Nissin USA explicitly presents Top Ramen Chili as suitable for vegetarians and publishes its ingredient list. The cited page does not verify a German retail version or use an explicit vegan label.',de:'Nissin USA stellt Top Ramen Chili ausdrücklich als für Vegetarier:innen geeignet dar und veröffentlicht die Zutatenliste. Die zitierte Seite bestätigt weder eine deutsche Verkaufsversion noch eine ausdrückliche Vegan-Kennzeichnung.'}
    },
    'buldak-kimchi': {
      source:'https://www.rewe.de/shop/p/samyang-buldak-kimchi-hot-chicken-flavor-ramen-135g/8598527',buy:'https://www.rewe.de/shop/p/samyang-buldak-kimchi-hot-chicken-flavor-ramen-135g/8598527',market:'DE',country:'South Korea · sold in Germany',vegan:'check',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
      evidence:{en:'REWE Germany lists artificial chicken flavour in the current 135 g recipe and does not label the product vegan. The exact pack remains unverified.',de:'REWE Deutschland nennt in der aktuellen 135-g-Rezeptur künstliches Hühneraroma und kennzeichnet das Produkt nicht vegan. Die konkrete Packung bleibt unbestätigt.'}
    },
    'buldak-stew': {
      source:'https://www.rewe.de/shop/p/samyang-instant-hot-chicken-stew-145g/3356544',buy:'https://www.rewe.de/shop/p/samyang-instant-hot-chicken-stew-145g/3356544',market:'DE',country:'South Korea · sold in Germany',vegan:'not',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
      evidence:{en:'REWE Germany’s ingredient list explicitly contains chicken seasoning powder for the 145 g Stew Type pack. This version is not vegan.',de:'Die Zutatenliste von REWE Deutschland enthält für die 145-g-Stew-Type-Packung ausdrücklich Huhn-Würzpulver. Diese Version ist nicht vegan.'}
    },
    'mama-creamy-tomyum': {
      source:'https://www.momogo.de/produkt/mama-instantnudeln-creamy-tom-yum-geschmack-55g',buy:'https://www.momogo.de/produkt/mama-instantnudeln-creamy-tom-yum-geschmack-55g',market:'DE',country:'Thailand · sold in Germany',gtin:'8850987141058',vegan:'not',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
      evidence:{en:'The German retailer’s ingredient list contains shrimp powder. Other German listings of the creamy shrimp version also contain milk or milk protein. It is not vegan.',de:'Die Zutatenliste des deutschen Händlers enthält Garnelenpulver. Andere deutsche Listungen der cremigen Garnelenversion enthalten außerdem Milch oder Milcheiweiß. Sie ist nicht vegan.'}
    },
    'indomie-chicken-curry': {
      source:'https://www.shisha-skywhite.de/indomie-noodle-75g-curry-flavour-6390',buy:'https://www.shisha-skywhite.de/indomie-noodle-75g-curry-flavour-6390',market:'DE retailer · currently unavailable',country:'Turkey/Indonesia brand · listed in Germany',gtin:'8680908020014',vegan:'check',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
      evidence:{en:'The German listing for GTIN 8680908020014 includes artificial chicken flavour and does not label the Curry pack vegan. The flavour’s origin is not established, so check the physical pack.',de:'Die deutsche Händlerseite für GTIN 8680908020014 nennt künstlichen Hühnergeschmack und kennzeichnet die Curry-Packung nicht vegan. Der Ursprung des Aromas ist nicht geklärt; physische Packung prüfen.'}
    },
    'prima-laksa': {
      source:'https://www.kaufland.de/product/458902083/',buy:'https://www.kaufland.de/product/458902083/',market:'DE marketplace',country:'Singapore · sold in Germany',vegan:'not',verificationLevel:'germany-retailer',verifiedAt:VERIFIED_AT,
      evidence:{en:'The German marketplace ingredient list explicitly contains dried shrimp, shrimp paste, shrimp and sodium caseinate from milk. This Singapore Laksa La Mian version is not vegan.',de:'Die deutsche Marktplatz-Zutatenliste enthält ausdrücklich getrocknete Garnelen, Garnelenpaste, Garnelen und Natriumcaseinat aus Milch. Diese Singapore-Laksa-La-Mian-Version ist nicht vegan.'}
    },
    'maruchan-chicken': {
      source:'https://maruchan.com/products/ramen/chicken-flavor',market:'Official US recipe · Germany availability pending',country:'Japan / USA',vegan:'not',verificationLevel:'official-global',verifiedAt:VERIFIED_AT,
      evidence:{en:'Maruchan’s official ingredient list contains lactose and powdered cooked chicken. The cited Chicken Flavor packet is not vegan; Germany availability is not verified.',de:'Maruchans offizielle Zutatenliste enthält Laktose und gekochtes Hühnerfleischpulver. Die zitierte Chicken-Flavor-Packung ist nicht vegan; die Verfügbarkeit in Deutschland ist nicht geprüft.'}
    }
  };

  window.RAMEN_DATA = (Array.isArray(window.RAMEN_DATA) ? window.RAMEN_DATA : []).map(item => ({...item,...(reviewed[item.id] || {})}));
})();