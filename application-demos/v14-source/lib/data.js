// Fictional, hand-labelled product-support fixtures. Never customer data.
export const cases = [
{id:'RL-301',day:'12 Oct',product:'Everyday Socks · Black 3-Pack',sku:'SOCK-3-BLK',text:'Nach zweimaligem Tragen kann ich durch die Ferse fast schon Zeitung lesen. Ist das normal?',gold:['quality'],sub:'premature_wear'},
{id:'RL-302',day:'12 Oct',product:'Everyday Socks · Black 3-Pack',sku:'SOCK-3-BLK',text:'Bei beiden Paaren ist die Naht an der Ferse aufgegangen. Könnt ihr mir helfen?',gold:['quality'],sub:'seam_failure'},
{id:'RL-303',day:'13 Oct',product:'Everyday Socks · Black 3-Pack',sku:'SOCK-3-BLK',text:'Die Socken haben nach drei Wäschen winzige Löcher am Zeh.',gold:['quality'],sub:'hole'},
{id:'RL-304',day:'13 Oct',product:'Everyday Socks · Black 3-Pack',sku:'SOCK-3-BLK',text:'Das Bündchen ist nach einer Woche ausgeleiert und der Stoff wird immer dünner.',gold:['quality'],sub:'premature_wear'},
{id:'RL-305',day:'14 Oct',product:'Everyday Socks · Black 3-Pack',sku:'SOCK-3-BLK',text:'Leider franst das Material schon beim ersten Tragen aus.',gold:['quality'],sub:'fabric_failure'},
{id:'RL-306',day:'14 Oct',product:'Everyday Socks · Black 3-Pack',sku:'SOCK-3-BLK',text:'Ein Faden an der Naht zieht sich komplett heraus. Sieht nach einem Verarbeitungsfehler aus.',gold:['quality'],sub:'seam_failure'},
{id:'RL-307',day:'14 Oct',product:'Rib Tee · White M',sku:'TEE-WHT-M',text:'Das Shirt passt mir nicht. Es sitzt sehr eng an den Schultern.',gold:['fit'],sub:'sizing'},
{id:'RL-308',day:'15 Oct',product:'Rib Tee · White M',sku:'TEE-WHT-M',text:'Das T-Shirt kam in XL statt M. Ich würde es gern umtauschen.',gold:['order_issue','return'],sub:'wrong_item'},
{id:'RL-309',day:'15 Oct',product:'Heavy Hoodie · Stone L',sku:'HOO-STN-L',text:'Laut Tracking wurde zugestellt, aber ich habe keine Ware bekommen.',gold:['shipping'],sub:'delivery_missing'},
{id:'RL-310',day:'15 Oct',product:'Heavy Hoodie · Stone L',sku:'HOO-STN-L',text:'Kann ich die Retoure noch anmelden? Ich brauche ein neues Etikett.',gold:['return'],sub:'return_label'},
{id:'RL-311',day:'16 Oct',product:'Rib Tee · Black S',sku:'TEE-BLK-S',text:'Der Stoff hat sich nach dem ersten Waschen stark verfärbt.',gold:['quality'],sub:'discolouration'},
{id:'RL-312',day:'16 Oct',product:'Heavy Hoodie · Black M',sku:'HOO-BLK-M',text:'Mein Paket hängt seit fünf Tagen im Verteilzentrum.',gold:['shipping'],sub:'late_parcel'},
{id:'RL-313',day:'17 Oct',product:'Rib Tee · White L',sku:'TEE-WHT-L',text:'Ich möchte meinen Kauf widerrufen und hätte gern die Erstattung.',gold:['return'],sub:'refund'},
{id:'RL-314',day:'17 Oct',product:'Everyday Socks · Black 3-Pack',sku:'SOCK-3-BLK',text:'Die Socken sind zu klein und an der Ferse ist bereits ein Loch.',gold:['fit','quality'],sub:'hole'},
{id:'RL-315',day:'17 Oct',product:'Heavy Hoodie · Stone L',sku:'HOO-STN-L',text:'Das Paket kam verspätet, der Reißverschluss ist zudem defekt.',gold:['shipping','quality'],sub:'hardware_failure'},
{id:'RL-316',day:'18 Oct',product:'Everyday Socks · Navy 3-Pack',sku:'SOCK-3-NVY',text:'Leider fehlt ein Paar in der Packung, sonst alles gut.',gold:['order_issue'],sub:'missing_item'},
{id:'RL-317',day:'18 Oct',product:'Rib Tee · White M',sku:'TEE-WHT-M',text:'Könnt ihr meine Rechnungsadresse auf der Rechnung ändern?',gold:['other'],sub:'invoice'},
{id:'RL-318',day:'18 Oct',product:'Heavy Hoodie · Black M',sku:'HOO-BLK-M',text:'Danke für die tolle Lieferung! Alles perfekt.',gold:['other'],sub:'positive_feedback'},
{id:'RL-319',day:'19 Oct',product:'Rib Tee · Black S',sku:'TEE-BLK-S',text:'Am Ärmel hängen zwei lose Fäden und die Naht löst sich.',gold:['quality'],sub:'seam_failure'},
{id:'RL-320',day:'19 Oct',product:'Heavy Hoodie · Black M',sku:'HOO-BLK-M',text:'Welche Größe wäre bei 1,82 m passend?',gold:['fit'],sub:'sizing'},
{id:'RL-321',day:'20 Oct',product:'Everyday Socks · Navy 3-Pack',sku:'SOCK-3-NVY',text:'Wie bekomme ich das Versandetikett für eine Rücksendung?',gold:['return'],sub:'return_label'},
{id:'RL-322',day:'20 Oct',product:'Heavy Hoodie · Stone L',sku:'HOO-STN-L',text:'Der Stoff ist rau und kratzt am Hals, obwohl ich ihn noch nicht gewaschen habe.',gold:['quality'],sub:'comfort'},
{id:'RL-323',day:'20 Oct',product:'Rib Tee · White M',sku:'TEE-WHT-M',text:'Habt ihr das gleiche Shirt auch in Schwarz?',gold:['other'],sub:'product_question'},
{id:'RL-324',day:'20 Oct',product:'Everyday Socks · Black 3-Pack',sku:'SOCK-3-BLK',text:'Die Rückzahlung fehlt noch und zwei Socken haben Löcher.',gold:['return','quality'],sub:'hole'}
];
export const labels={quality:'Produktqualität',fit:'Größe & Passform',shipping:'Versand',return:'Retoure & Erstattung',order_issue:'Falsche oder fehlende Ware',other:'Sonstiges'};
export const sublabels={seam_failure:'Nahtfehler',hole:'Loch / Riss',premature_wear:'Vorzeitige Abnutzung',fabric_failure:'Material / Faser',discolouration:'Verfärbung',hardware_failure:'Reißverschluss / Hardware',comfort:'Tragekomfort',sizing:'Größenproblem',wrong_item:'Falscher Artikel',delivery_missing:'Nicht zugestellt',late_parcel:'Verspätung',return_label:'Retourenetikett',refund:'Erstattung',missing_item:'Unvollständige Bestellung',invoice:'Rechnung',positive_feedback:'Positives Feedback',product_question:'Produktfrage',unknown:'Nicht sicher'};
// Deliberately simple, clearly inferior baseline; never claim it is a calibrated model.
export function baseline(text){const s=text.toLocaleLowerCase('de-DE');const hits=[];if(/loch|löcher|naht|gerissen|faden|franst|dünn|defekt|reißverschluss|verfärbt|kratzt|verarbeitung/.test(s))hits.push('quality');if(/zu klein|zu groß|passt mir nicht|sitzt|größe|grösse/.test(s))hits.push('fit');if(/paket|tracking|versand|zustell|verteilzentrum/.test(s))hits.push('shipping');if(/retoure|rücksendung|etikett|umtausch|widerruf|erstattung|rückzahlung/.test(s))hits.push('return');return hits.length?hits:['other']}
