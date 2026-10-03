/* Learn dashboard design with me: the runtime of the figures.
   A plain browser script, no build step and no modules. It reads the page language from <html lang> ('en' by default,
   'fr' for French), builds the example's planning model, and draws each figure whose root element is on the page,
   so a chapter page carries only the figures it needs. Every visible string is in STR below; the people, their groups
   and the sources come from window.GUIDE_DATA. See README.md next to this file. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

/* ================= words =================
   Every string a reader can see or hear, in English and in French. Where a sentence carries numbers it is a function,
   and it receives them already formatted. French follows French typographic usage: a decimal comma, a narrow no-break
   space (U+202F) between thousands and before ; : ? %, a no-break space (U+00A0) inside a date and before a unit. */
const NN='\u202F',NB='\u00A0';   // narrow no-break space, no-break space
const stop=s=>/\.$/.test(s)?s:s+'.';   // an abbreviation such as « oct. » also ends the sentence
const STR={
en:{
  locale:'en-CA',group:false,dateLocale:'en-US',
  dm:(d,m)=>`${d} ${m}`,span:(a,b,y)=>`${a} – ${b} ${y}`,
  pct:s=>s+'%',px:s=>s+' px',K:'$K',list:a=>a.join(', '),
  lines:{jackets:{name:'Jackets',kind:'insulated',noun:'jackets'},boots:{name:'Boots',kind:'winter',noun:'boots'},
    layers:{name:'Base layers',kind:'merino',noun:'base layers'},packs:{name:'Packs',kind:'hiking',noun:'packs'},tents:{name:'Tents',kind:'3-season',noun:'tents'}},
  sigStock:(v,w,s)=>`${w} weeks of stock, demand ${s}`,sigShort:(n,d)=>`${n} short the week of ${d}`,sigOut:d=>`runs out the week of ${d}`,
  // the weekly sheet
  sold:'Sold',expected:'Expected',
  ariaWeekBars:'Sales by week in thousands of dollars: four sold weeks and four expected weeks',
  ariaHueBars:'Sales by week with expected demand and expected sales as two bars of different hue',
  short:n=>`${n} short`,ariaStock:(name,v)=>`${name}: stock ${v.join(', ')} units`,
  colLine:'Product line',colTrend:'Demand trend',colWeeks:'Weeks of stock',colNow:'Now',
  wkTitle:'Sales and stock by week',wkCtx:'sales in $K · stock in units at week end',
  key4:'4 weeks of stock',keyArriving:'arriving',keyLost:'lost sales',keyInStock:'in stock',keyOnOrder:'on order',
  // open-to-buy and stock value
  otb:'Open-to-buy',atCost:'$K at cost',
  need:'Need',have:'Have',toSell:'To sell',toKeep:'To keep in stock',inStock:'In stock',onOrder:'On order',onOrderTag:'On order',leftToBuy:'Left to buy',
  afterBuy:v=>`after the ${v} buy`,overPlan:'Over the plan',
  ariaBridge:(n,h,l)=>`Open-to-buy: need ${n}, have ${h}, left to buy ${l}, in thousands of dollars at cost`,
  bridgeKey:['to sell','to keep, on order','in stock'],
  svTitle:'Stock value',ariaStockValue:'Stock value by product line at cost, in stock and on order',
  // the markdown plot
  mdTitle:'Tent markdown',mdCtx:'profit in $K · drag the point',
  mdInStock:n=>`${n} in stock`,mdBeats:'beats full price',mdMatch:n=>`${n} to match`,mdAria:'Markdown test',
  mdValue:(d,u)=>`${d}% off, ${u} tents`,mdTents:u=>`${u} tents`,
  mdPlotAria:(u,d)=>`Tents needed to match the full-price profit at each discount; the test is ${u} tents at ${d}% off`,
  pFull:n=>`${n} at full price`,pOff:(n,p)=>`${n} at ${p} off`,pDiff:'difference',
  // instrument cards
  cDemand:'Demand',cNext4:'next 4 weeks',cLost:'Lost sales',cOut:'out of stock',cOtb:'Open-to-buy',cLeft:'left to buy',cGp:'Gross profit',
  cLast4:v=>`last 4 weeks ${v}`,cNone:'None',cNoun:(n,noun)=>`${n} ${noun}`,cUnits:n=>`${n} units`,cAllServed:'all demand served',
  cWeekOf:d=>`week of ${d}`,cWeeks:n=>`${n} weeks`,cOfNeed:p=>`${p} of need`,cCurrent:v=>`current orders ${v}`,cNeed:v=>`need ${v}`,
  cMargin:p=>`${p} margin`,cSales:v=>`sales ${v}`,
  // decisions and the worked example
  decBoots:'Receive 80 boots a week early',decLayers:n=>`Buy ${n} more base layers`,decPacks:'Defer 200 packs',decTents:p=>`Mark down tents ${p}`,
  decProfit:'Profit',decOtb:'Open-to-buy',
  exTitle:'Demand and inventory plan',exScope:s=>`${s} · five product lines · sample data`,ariaKey:'Key figures',
  decTitle:'Decisions',decCtx:'switch one on to test it',chipOn:(n,s)=>`${s} on`,reset:'Reset',
  // rule 1
  pgTitle:'Programme calculator',
  pgPresets:[['capital','Capital, 1962 · 58 + 2 units'],['page','This page · 1120 + 32 px'],['example','The example · 1088 + 8 px']],pgPresetsAria:'Presets',
  pgWidth:'Width',pgWidthAria:'Width in pixels',pgGutter:'Gutter',pgGutterAria:'Gutter in pixels',
  pgFrac:'fractional',pgModule:'on the 8 px module',pgWholePx:'whole pixels',pgWholeUnits:'whole units',
  pgAria:'Column counts from one to twelve and the width each gives',
  pgStatus:(W,g,t,px,l)=>`<b>${W} + ${g} = ${t}.</b> Column counts up to twelve that give whole ${px?'pixels':'units'}: ${l}.`,
  pgOut:(W,px)=>W+(px?' px':' units'),
  // rule 2: [id, switch label, the question it answers, the same question inside a sentence]
  inTitle:'Instrument builder',inValue:'Value',
  inParts:[['unit','Unit and basis','Of what?','of what'],['scale','Scale','On what range?','on what range'],
    ['comp','Comparator','Compared with what?','compared with what'],['gap','Gap','By how much?','by how much']],
  inHowMuch:'how much',inStatus:(a,m)=>`<b>Answered:</b> ${a}.`+(m?` <b>Left to the reader:</b> ${m}.`:''),
  // rule 3
  xmTitle:'Signal or routine',xmHint:'illustrative weekly sales, $K',xmLatestWeek:'Latest week',
  xmUpper:v=>`upper limit ${v}`,xmAvg:v=>`average ${v}`,xmLower:v=>`lower limit ${v}`,xmLatest:'latest',xmLatestShort:'latest',
  xmAria:'Twelve weeks of sales with the average and the limits of routine variation',
  xmAbove:(v,h)=>`<b>${v} is above the upper limit of ${h}.</b> A signal: something changed, and it is worth asking what.`,
  xmBelow:(v,l)=>`<b>${v} is below the lower limit of ${l}.</b> A signal: something changed, and it is worth asking what.`,
  xmRoutine:(v,l,h)=>`<b>${v} sits between ${l} and ${h}.</b> Routine variation: no explanation is owed.`,
  // rule 4
  resetExample:'Reset to the example',
  brStatus:(a,b,c,d,l)=>`<b>${a} + ${b} − ${c} − ${d} = <span class="cob">${l}</span>.</b> `,
  brMay:v=>`The plan may still buy ${v}.`,brOver:v=>`Stock in hand and on order is ${v} more than the plan needs.`,brExact:'The plan is exactly covered.',
  // rule 5
  sfTitle:'Surface lab',sfRegion:'Common region',sfGrey:'One grey, two parents',sfCorners:'Concentric corners',sfAccent:'An accent budget',
  sfEnclose:'Enclose',sfSurround:'Surround',sfSurroundAria:'Surround contrast',sfJoin:'Join the chips',
  sfRadius:'Radius',sfRadiusAria:'Outer radius',sfInset:'Inset',sfInsetAria:'Inset',sfAccented:'Accented',sfAccentedAria:'Marks in the accent colour',
  sfDotsAria:'Eight dots in four close pairs',sfRegionOn:'The eye pairs the dots that share a region, across the wider gaps.',
  sfRegionOff:'The eye pairs the dots that sit close together.',
  sfInner:r=>`inner ${r} px`,sfCalc:(r,i,ri)=>`${r} − ${i} = ${ri} px`,sfBarsAria:'Forty small bars',sfOf40:n=>`${n} of 40`,
  // rule 6
  ntTitle:'One job for each fill',ntHint:'sales by week, $K',ntHue:'Coded by hue',ntFill:'Coded by fill',ntAria:'Coding',ntGrey:'Remove colour',
  ntKeyHue:['sold','expected demand','expected sales'],ntKeyFill:['sold','expected','lost sales'],
  ntHueGrey:d=>`<b>Without colour the two series are almost the same grey.</b> The key no longer works, and the loss in the week of ${d} has to be found by comparing bar heights.`,
  ntHueCol:'<b>Hue carries the meaning.</b> The reader needs the key to tell demand from sales, and has to compare two bars to find the loss.',
  ntFillGrey:d=>`<b>Without colour the reading holds.</b> The lost sales are still the black cap on the week of ${d}. Sold and expected weeks come out in two close greys and are told apart by their headings.`,
  ntFillCol:'<b>Fill carries the meaning.</b> One bar per week. Its height is demand, the cobalt part is what the plan sells, and the ink cap is the sale lost.',
  legend:[['Sold or in stock','It has happened, or it physically exists.'],['Expected','What the plan expects to sell.'],
    ['Planned or arriving','Stock to keep, and orders on their way.'],['Left to buy','An amount that exists only as a gap.'],
    ['Lost sales','Demand that meets an empty shelf. The only use of ink as a fill.'],['Four weeks of stock','The line every stock row is read against.'],
    ['Comparator','The named reference on an instrument rail, always in ink.'],['Selection','A raised white pill, so the accent never means clickable.']],
  // rule 7
  axTitle:'One axis, read down',axOrder:'Order rows',axAria:'Row order',
  axOrders:[['listed','As listed'],['cover','Least stock first'],['close','Lowest closing stock']],
  axSay:{listed:'In the order the lines were listed, the two at risk sit among the others.',
    cover:'With the least stock first, the two lines under four weeks of stock lead: boots, which run short, and base layers, which run out.',
    close:'By closing stock, base layers lead: they end the four weeks with nothing left.'},
  // rule 8
  tbTitle:'Table rules',allOff:'All off',allOn:'All on',
  tbRules:[['furn','Remove the furniture','Tschichold'],['align','Align right, tabular figures','Schwabish'],
    ['round','Round, and state units once','Ehrenberg'],['order','Order rows by size','Ehrenberg'],['bars','Add a mark in the cell','Rao and Card']],
  tbHeadRound:['Product line','Demand, units','Closing stock, units','Weeks of stock','Stock value, $K'],
  tbHeadRaw:['Product line','Demand','Closing stock','Stock cover','Stock value'],
  tbUnits:v=>`${v} units`,tbWeeks:v=>`${v} weeks`,tbMoney:v=>`$${v}K`,
  // rule 9
  tyTitle:'Bold without a shift',tyHint:'weekly demand, units',tyAria:'Typeface',tyTnum:'Tabular figures',tyRowAria:'Selected row',
  tyStatus:(r,b)=>`<b>Ten digits: regular ${r} px, bold ${b} px.</b> `,
  tySame:'The two layers coincide, so a row can turn bold and its figures stay where they are.',
  tyShift:(d,wider)=>`Bold runs ${d} px ${wider?'wider':'narrower'}, so a row that turns bold moves its figures.`,
  // rule 10
  unTitle:'Three forms',unHint:'illustrative demand for one week, units',unAria:'Form',
  unForms:[['bar','Bar and whisker'],['bands','Nested bands'],['dots','Quantile dots']],
  unInStock:'In stock',unInStockAria:'Units in stock',unExpected:n=>`expected ${n}`,
  unBands9c:'9 in 10: 57 to 103',unHalfC:'half: 71 to 89',unBands9:'9 in 10 between 57 and 103',unHalf:'half between 71 and 89',
  unStock:n=>`${n} in stock`,unUnits:n=>`${n} units`,
  unPlotAria:'An illustrative demand distribution for one week, against the units in stock',
  unDots:n=>`<b>Demand exceeds stock in ${n} of 20 outcomes.</b> Each dot is one equally likely week. The hollow ones are the weeks that run short.`,
  unBar:s=>`<b>The whisker runs from 57 to 103.</b> How often demand exceeds ${s} cannot be read from it, and values inside the bar look likelier than values just beyond its end.`,
  unBands:(s,w)=>`<b>The stock of ${s} ${w}.</b> The form says how wide the spread is. It gives nothing to count.`,
  unBeyond:'lies beyond the wider band',unBelow:'lies below the wider band',unInside:'falls inside the wider band',
  // rule 11
  ctFull:n=>`${n} tents at full price`,ctOff:(n,p)=>`${n} tents at ${p} off`,ctMatch:'tents to match full price',
  ctMake:(u,p,v)=>`<b>${u} tents at ${p} off make ${v}.</b> `,
  ctBeats:(b,n)=>`That beats the ${b} from ${n} tents at full price.`,ctMatches:(b,n)=>`That matches the ${b} from ${n} tents at full price.`,
  ctShort:(s,b,n)=>`That is ${s} short of the ${b} from ${n} tents at full price. `,
  ctWould:n=>`${n} tents would match it.`,ctMore:(n,h)=>`Matching it would take ${n} tents, more than the ${h} in stock.`,
  // rule 12: the terms of the plan, computed from the example (v holds the formatted numbers)
  tmTitle:'The words of the plan',tmHint:'computed from the example',tmAria:'Term',termAka:a=>`also called ${a}`,
  terms:{
    demand:{name:'Demand',unit:'$K',aka:'unconstrained demand',calc:()=>'Five product lines over the next four weeks.',def:'What customers would buy if every item were in stock.'},
    sales:{name:'Sales',unit:'$K',aka:'served or constrained sales',calc:v=>`${v.demand} demand − ${v.lost} lost.`,def:'What the plan can actually sell: demand, capped each week by the stock on the shelf.'},
    lost:{name:'Lost sales',unit:'$K',aka:'unfilled demand, stockout',calc:v=>`${v.lostUnits} boots at $${v.price} in the week of ${v.week}.`,def:'Demand that meets an empty shelf.'},
    weeks:{name:'Weeks of stock',unit:'weeks, boots',aka:'cover, weeks of supply',calc:v=>`${v.open} in stock ÷ ${v.mean} a week.`,def:'How long the stock would last at the average weekly demand.'},
    otb:{name:'Open-to-buy',unit:'$K at cost',aka:'OTB',calc:v=>`${v.cogs} to sell + ${v.target} to keep − ${v.openCost} in stock − ${v.receipts} on order.`,def:'What the plan may still spend on stock.'},
    gp:{name:'Gross profit',unit:'$K',aka:'gross margin',calc:v=>`${v.served} sales − ${v.cogs} cost of what is sold. ${v.margin} of sales.`,def:'What sales leave after paying for the goods sold.'},
    st:{name:'Sell-through',unit:'boots, last 4 weeks',aka:'sell-through rate',calc:v=>`${v.sold} sold ÷ ${v.avail} available.`,def:'The share of the units available that were sold.'},
    gmroi:{name:'GMROI',unit:v=>`last ${v.weeks} weeks`,aka:'gross margin return on inventory investment',calc:v=>`${v.gp} gross profit ÷ ${v.stock} average stock at cost, in $K.`,def:'Gross profit earned for each dollar held in stock. Not annualised here.'}},
  // the system
  tnTitle:'Tune the system',tnHint:'three tokens of the example',tnAccent:'Accent',
  tnDepth:'Surface depth',tnDepthAria:'Surface depth in percent',tnRadius:'Sheet radius',tnRadiusAria:'Sheet radius in pixels',
  accents:{cobalt:'Cobalt',teal:'Teal',violet:'Violet'},
  tnStatus:(a,d,r,ri)=>`<b>${a} accent, surfaces at ${d}, sheet radius ${r}, field radius ${ri}.</b> `,
  tnDefault:'These are the values the example uses.',
  tnPale:'With the tones this close to white the sheets lose their edges, and grouping rests on spacing alone.',
  tnDeep:'Deeper tones separate the layers more firmly and leave the page less calm.',
  tnSharp:'Below 8 px the field corner reaches zero, because the inner radius is the outer one minus the inset.',
  tok:{surfaces:'surfaces: higher is lighter',ink:'ink and lines',
    marks:'marks: slate is sold or in stock; the accent is expected,\n     its tint is planned or arriving, its wash sits under a dashed outline',
    radii:'radii are concentric: field = sheet − inset'},
  copied:'Copied',copyFail:'Select the block to copy',copyTokens:'Copy tokens',
  // the people
  ppTitle:'The people, by year',ppHint:'select a face',ppProfile:'Read the profile',ppLearn:'What to learn from them',ppRule:(n,t)=>`Rule ${n} · ${t}`,earlier:'Earlier',later:'Later',before1900:'before 1900',
  ppAria:'People and works on a time axis from 1786 to 2022, in six bodies of work',
  ppSplit:/,| and /,   // the tag keeps the first name of a team
  groupLabels:['Grid and type','Cartography','Control rooms','Reporting and statistics','Perception and uncertainty','Interaction and forecasting'],
  ruleLinks:a=>`Rule${a.length>1?'s':''} `+a.join(', '),worksLink:'Works to open',
  notChecked:'Cited from prior knowledge, not checked again',
  // the example's caption, and failures
  recon:(a,b,c,d,e,f)=>`<b>A four-week plan for five product lines, on sample data.</b> Every figure is computed in the page. Under current orders the plan sells ${a}, earns ${b} and leaves ${c} to buy. With the boots a week early those become ${d}, ${e} and ${f}.`,
  reconFail:'<b>The example failed its own reconciliation.</b>',
  figFail:'This figure could not be drawn.'
},
fr:{
  locale:'fr-FR',group:true,dateLocale:'fr-FR',
  dm:(d,m)=>`${d}${NB}${m}`,span:(a,b,y)=>`${a}${NB}– ${b}${NB}${y}`,
  pct:s=>s+NN+'%',px:s=>s+NB+'px',K:'k$',
  list:a=>a.length>1?a.slice(0,-1).join(', ')+' et '+a[a.length-1]:a.join(''),
  lines:{jackets:{name:'Vestes',kind:'isolées',noun:'vestes'},boots:{name:'Bottes',kind:'d’hiver',noun:'bottes'},
    layers:{name:'Sous-pulls',kind:'mérinos',noun:'sous-pulls'},packs:{name:'Sacs à dos',kind:'de randonnée',noun:'sacs à dos'},tents:{name:'Tentes',kind:'3 saisons',noun:'tentes'}},
  sigStock:(v,w,s)=>`${w}${NB}sem. de stock, demande ${s}`,sigShort:(n,d)=>`manque ${n} la semaine du ${d}`,sigOut:d=>`stock épuisé la semaine du ${d}`,
  sold:'Vendu',expected:'Prévu',
  ariaWeekBars:`Ventes par semaine en milliers de dollars${NN}: quatre semaines vendues et quatre semaines prévues`,
  ariaHueBars:'Ventes par semaine, avec la demande prévue et les ventes prévues en deux barres de teintes différentes',
  short:n=>`manque ${n}`,ariaStock:(name,v)=>`${name}${NN}: stock ${v.join(', ')} unités`,
  colLine:'Ligne de produits',colTrend:'Tendance',colWeeks:'Sem. de stock',colNow:'Actuel',
  wkTitle:'Ventes et stock par semaine',wkCtx:'ventes en k$ · stock en unités en fin de semaine',
  key4:'4 semaines de stock',keyArriving:'à recevoir',keyLost:'ventes perdues',keyInStock:'en stock',keyOnOrder:'en commande',
  otb:'Budget d’achat restant',atCost:'k$ au coût',
  need:'Besoin',have:'Acquis',toSell:'À vendre',toKeep:'À garder en stock',inStock:'En stock',onOrder:'En commande',onOrderTag:'Commandé',leftToBuy:'À acheter',
  afterBuy:v=>`après ${v} d’achat`,overPlan:'Excédent',
  ariaBridge:(n,h,l)=>`Budget d’achat restant, en milliers de dollars au coût${NN}: besoin ${n}${NN}; acquis ${h}${NN}; reste à acheter ${l}`,
  bridgeKey:['à vendre','à garder, en commande','en stock'],
  svTitle:'Valeur du stock',ariaStockValue:'Valeur du stock par ligne de produits, au coût, en stock et en commande',
  mdTitle:'Démarque des tentes',mdCtx:'marge en k$ · glissez le point',
  mdInStock:n=>`${n} en stock`,mdBeats:'bat le plein tarif',mdMatch:n=>`${n} pour égaler`,mdAria:'Test de démarque',
  mdValue:(d,u)=>`remise de ${d}${NN}%, ${u} tentes`,mdTents:u=>`${u} tentes`,
  mdPlotAria:(u,d)=>`Tentes à vendre à chaque remise pour égaler la marge au plein tarif${NN}; le test est de ${u} tentes à −${d}${NN}%`,
  pFull:n=>`${n} au plein tarif`,pOff:(n,p)=>`${n} à −${p}`,pDiff:'écart',
  cDemand:'Demande',cNext4:'à 4 semaines',cLost:'Ventes perdues',cOut:'en rupture',cOtb:'Budget d’achat',cLeft:'restant',cGp:'Marge brute',
  cLast4:v=>`4 sem. passées ${v}`,cNone:'Aucune',cNoun:(n,noun)=>`${n} ${noun}`,cUnits:n=>`${n} unités`,cAllServed:'tout est servi',
  cWeekOf:d=>`semaine du ${d}`,cWeeks:n=>`${n} semaines`,cOfNeed:p=>`${p} du besoin`,cCurrent:v=>`plan actuel ${v}`,cNeed:v=>`besoin ${v}`,
  cMargin:p=>`${p} de marge`,cSales:v=>`ventes ${v}`,
  decBoots:'Recevoir 80 bottes une semaine plus tôt',decLayers:n=>`Acheter ${n} sous-pulls de plus`,decPacks:'Reporter 200 sacs à dos',decTents:p=>`Démarquer les tentes de ${p}`,
  decProfit:'Marge',decOtb:'Budget d’achat',
  exTitle:'Plan de demande et de stock',exScope:s=>`${s} · cinq lignes de produits · données d’exemple`,ariaKey:'Chiffres clés',
  decTitle:'Décisions',decCtx:'activez-en une pour la tester',chipOn:(n,s)=>`${s} activée${n>1?'s':''}`,reset:'Réinitialiser',
  pgTitle:'Calculateur de programme',
  pgPresets:[['capital','Capital, 1962 · 58 + 2 unités'],['page',`Cette page · 1${NN}120 + 32${NB}px`],['example',`L’exemple · 1${NN}088 + 8${NB}px`]],pgPresetsAria:'Préréglages',
  pgWidth:'Largeur',pgWidthAria:'Largeur en pixels',pgGutter:'Gouttière',pgGutterAria:'Gouttière en pixels',
  pgFrac:'fractionnaire',pgModule:`sur le module de 8${NB}px`,pgWholePx:'pixels entiers',pgWholeUnits:'unités entières',
  pgAria:'Nombres de colonnes de un à douze, et la largeur de chacune',
  pgStatus:(W,g,t,px,l)=>`<b>${W} + ${g} = ${t}.</b> Nombres de colonnes jusqu’à douze qui donnent des ${px?'pixels entiers':'unités entières'}${NN}: ${l}.`,
  pgOut:(W,px)=>W+NB+(px?'px':'unités'),
  inTitle:'Construire un instrument',inValue:'Valeur',
  inParts:[['unit','Unité et période',`De quoi${NN}?`,'de quoi'],['scale','Échelle',`Sur quelle plage${NN}?`,'sur quelle plage'],
    ['comp','Comparateur',`Comparé à quoi${NN}?`,'comparé à quoi'],['gap','Écart',`De combien${NN}?`,'de combien']],
  inHowMuch:'combien',inStatus:(a,m)=>`<b>Répond à${NN}:</b> ${a}.`+(m?` <b>Laissé au lecteur${NN}:</b> ${m}.`:''),
  xmTitle:'Signal ou routine',xmHint:'exemple de ventes hebdomadaires, k$',xmLatestWeek:'Dernière semaine',
  xmUpper:v=>`limite haute ${v}`,xmAvg:v=>`moyenne ${v}`,xmLower:v=>`limite basse ${v}`,xmLatest:'dernière',xmLatestShort:'dern.',
  xmAria:'Douze semaines de ventes, avec la moyenne et les limites de la variation ordinaire',
  xmAbove:(v,h)=>`<b>${v} dépasse la limite haute de ${h}.</b> C’est un signal${NN}: quelque chose a changé, et il faut se demander quoi.`,
  xmBelow:(v,l)=>`<b>${v} passe sous la limite basse de ${l}.</b> C’est un signal${NN}: quelque chose a changé, et il faut se demander quoi.`,
  xmRoutine:(v,l,h)=>`<b>${v} se situe entre ${l} et ${h}.</b> Variation ordinaire${NN}: aucune explication n’est due.`,
  resetExample:'Revenir à l’exemple',
  brStatus:(a,b,c,d,l)=>`<b>${a} + ${b} − ${c} − ${d} = <span class="cob">${l}</span>.</b> `,
  brMay:v=>`Le plan peut encore acheter ${v}.`,brOver:v=>`Le stock en main et en commande dépasse de ${v} le besoin du plan.`,brExact:'Le plan est exactement couvert.',
  sfTitle:'Laboratoire des surfaces',sfRegion:'Région commune',sfGrey:'Un gris, deux fonds',sfCorners:'Coins concentriques',sfAccent:'Un budget d’accent',
  sfEnclose:'Entourer',sfSurround:'Fond',sfSurroundAria:'Contraste du fond',sfJoin:'Relier les pastilles',
  sfRadius:'Rayon',sfRadiusAria:'Rayon extérieur',sfInset:'Retrait',sfInsetAria:'Retrait',sfAccented:'En accent',sfAccentedAria:'Marques dans la couleur d’accent',
  sfDotsAria:'Huit points en quatre paires rapprochées',sfRegionOn:'L’œil apparie les points d’une même région, par-dessus les écarts.',
  sfRegionOff:'L’œil apparie les points les plus proches.',
  sfInner:r=>`intérieur ${r}${NB}px`,sfCalc:(r,i,ri)=>`${r} − ${i} = ${ri}${NB}px`,sfBarsAria:'Quarante petites barres',sfOf40:n=>`${n} sur 40`,
  ntTitle:'Un rôle par remplissage',ntHint:'ventes par semaine, k$',ntHue:'Codé par la teinte',ntFill:'Codé par le remplissage',ntAria:'Codage',ntGrey:'Retirer la couleur',
  ntKeyHue:['vendu','demande prévue','ventes prévues'],ntKeyFill:['vendu','prévu','ventes perdues'],
  ntHueGrey:d=>`<b>Sans couleur, les deux séries sont presque du même gris.</b> La légende ne sert plus, et la perte de la semaine du ${d} ne se trouve qu’en comparant la hauteur des barres.`,
  ntHueCol:'<b>La teinte porte le sens.</b> Le lecteur a besoin de la légende pour distinguer la demande des ventes, et doit comparer deux barres pour trouver la perte.',
  ntFillGrey:d=>`<b>Sans couleur, la lecture tient.</b> Les ventes perdues restent le chapeau noir sur la semaine du ${stop(d)} Les semaines vendues et prévues sortent en deux gris proches, que leurs titres distinguent.`,
  ntFillCol:'<b>Le remplissage porte le sens.</b> Une barre par semaine. Sa hauteur est la demande, la partie cobalt ce que le plan vend, et le chapeau noir la vente perdue.',
  legend:[['Vendu ou en stock','C’est déjà arrivé, ou cela existe physiquement.'],['Prévu','Ce que le plan prévoit de vendre.'],
    ['Planifié ou en arrivage','Le stock à garder, et les commandes en route.'],['Reste à acheter','Un montant qui n’existe que comme un écart.'],
    ['Ventes perdues','La demande qui trouve un rayon vide. Le seul usage de l’encre comme remplissage.'],['Quatre semaines de stock','La ligne à laquelle se lit chaque rangée de stock.'],
    ['Comparateur','La référence nommée sur le rail d’un instrument, toujours à l’encre.'],['Sélection',`Une pastille blanche en relief, pour que l’accent ne veuille jamais dire «${NN}cliquable${NN}».`]],
  axTitle:'Un axe, lu de haut en bas',axOrder:'Ordre des lignes',axAria:'Ordre des lignes',
  axOrders:[['listed','Ordre de la liste'],['cover','Moins de stock d’abord'],['close','Stock final le plus bas']],
  axSay:{listed:'Dans l’ordre de la liste, les deux lignes à risque se perdent parmi les autres.',
    cover:`Avec le moins de stock en tête, les deux lignes sous quatre semaines de stock passent devant${NN}: les bottes, qui viennent à manquer, et les sous-pulls, qui s’épuisent.`,
    close:`Par stock final, les sous-pulls passent en tête${NN}: ils terminent les quatre semaines à zéro.`},
  tbTitle:'Règles de tableau',allOff:'Tout désactiver',allOn:'Tout activer',
  tbRules:[['furn','Retirer filets et fonds','Tschichold'],['align','Aligner à droite, tabulaires','Schwabish'],
    ['round','Arrondir, unité dite une fois','Ehrenberg'],['order','Trier les lignes par valeur','Ehrenberg'],['bars','Une marque dans la cellule','Rao et Card']],
  tbHeadRound:['Ligne de produits','Demande, unités','Stock final, unités','Semaines de stock','Valeur du stock, k$'],
  tbHeadRaw:['Ligne de produits','Demande','Stock final','Couverture de stock','Valeur du stock'],
  tbUnits:v=>`${v} unités`,tbWeeks:v=>`${v} semaines`,tbMoney:v=>`${v} k$`,
  tyTitle:'Le gras sans décalage',tyHint:'demande hebdomadaire, unités',tyAria:'Police',tyTnum:'Chiffres tabulaires',tyRowAria:'Ligne sélectionnée',
  tyStatus:(r,b)=>`<b>Dix chiffres${NN}: ${r}${NB}px en normal, ${b}${NB}px en gras.</b> `,
  tySame:`Les deux calques coïncident${NN}: une ligne peut passer en gras sans que ses chiffres bougent.`,
  tyShift:(d,wider)=>`Le gras est plus ${wider?'large':'étroit'} de ${d}${NB}px${NN}: une ligne qui passe en gras déplace ses chiffres.`,
  unTitle:'Trois formes',unHint:'exemple de demande pour une semaine, unités',unAria:'Forme',
  unForms:[['bar','Barre et moustache'],['bands','Bandes imbriquées'],['dots','Points de quantiles']],
  unInStock:'En stock',unInStockAria:'Unités en stock',unExpected:n=>`prévu ${n}`,
  unBands9c:`9 sur 10${NN}: 57 à 103`,unHalfC:`moitié${NN}: 71 à 89`,unBands9:'9 sur 10 entre 57 et 103',unHalf:'la moitié entre 71 et 89',
  unStock:n=>`${n} en stock`,unUnits:n=>`${n} unités`,
  unPlotAria:'Un exemple de distribution de la demande pour une semaine, face aux unités en stock',
  unDots:n=>`<b>La demande dépasse le stock dans ${n} cas sur 20.</b> Chaque point est une semaine également probable. Les points creux sont les semaines en rupture.`,
  unBar:s=>`<b>La moustache va de 57 à 103.</b> Elle ne dit pas à quelle fréquence la demande dépasse ${s}, et les valeurs dans la barre paraissent plus probables que celles juste au-delà de son bout.`,
  unBands:(s,w)=>`<b>Le stock de ${s} ${w}.</b> La forme dit l’étendue de la dispersion. Elle ne donne rien à compter.`,
  unBeyond:'se situe au-delà de la bande large',unBelow:'se situe sous la bande large',unInside:'tombe dans la bande large',
  ctFull:n=>`${n} tentes au plein tarif`,ctOff:(n,p)=>`${n} tentes à −${p}`,ctMatch:'pour égaler le plein tarif',
  ctMake:(u,p,v)=>`<b>${u} tentes à −${p} rapportent ${v}.</b> `,
  ctBeats:(b,n)=>`C’est mieux que les ${b} de ${n} tentes au plein tarif.`,ctMatches:(b,n)=>`C’est autant que les ${b} de ${n} tentes au plein tarif.`,
  ctShort:(s,b,n)=>`C’est ${s} de moins que les ${b} de ${n} tentes au plein tarif. `,
  ctWould:n=>`${n} tentes suffiraient à l’égaler.`,ctMore:(n,h)=>`Pour l’égaler, il faudrait ${n} tentes, plus que les ${h} en stock.`,
  tmTitle:'Les mots du plan',tmHint:'calculés à partir de l’exemple',tmAria:'Terme',termAka:a=>`on dit aussi ${a}`,
  terms:{
    demand:{name:'Demande',unit:'k$',aka:'demande non contrainte',calc:()=>'Cinq lignes de produits sur les quatre prochaines semaines.',def:'Ce que les clients achèteraient si chaque article était en stock.'},
    sales:{name:'Ventes',unit:'k$',aka:'ventes servies, ventes contraintes',calc:v=>`${v.demand} de demande − ${v.lost} de ventes perdues.`,def:`Ce que le plan peut vraiment vendre${NN}: la demande, plafonnée chaque semaine par le stock en rayon.`},
    lost:{name:'Ventes perdues',unit:'k$',aka:'demande non servie, rupture de stock',calc:v=>stop(`${v.lostUnits} bottes à ${v.price}${NN}$ la semaine du ${v.week}`),def:'La demande qui trouve un rayon vide.'},
    weeks:{name:'Semaines de stock',unit:'semaines, bottes',aka:'couverture, semaines d’approvisionnement',calc:v=>`${v.open} en stock ÷ ${v.mean} par semaine.`,def:'Le temps que durerait le stock au rythme moyen de la demande hebdomadaire.'},
    otb:{name:'Budget d’achat restant',title:'Budget d’achat restant (open-to-buy)',unit:'k$ au coût',aka:'OTB',calc:v=>`${v.cogs} à vendre + ${v.target} à garder − ${v.openCost} en stock − ${v.receipts} en commande.`,def:'Ce que le plan peut encore dépenser en stock.'},
    gp:{name:'Marge brute',unit:'k$',aka:'marge commerciale',calc:v=>`${v.served} de ventes − ${v.cogs} de coût des marchandises vendues. ${v.margin} des ventes.`,def:'Ce qui reste des ventes une fois payées les marchandises vendues.'},
    st:{name:'Taux d’écoulement',unit:'bottes, 4 sem. passées',aka:'sell-through',calc:v=>`${v.sold} vendues ÷ ${v.avail} disponibles.`,def:'La part des unités disponibles qui a été vendue.'},
    gmroi:{name:'GMROI',unit:v=>`${v.weeks} sem. passées`,aka:'rendement de la marge brute sur le stock investi',calc:v=>`${v.gp} de marge brute ÷ ${v.stock} de stock moyen au coût, en k$.`,def:'La marge brute gagnée pour chaque dollar immobilisé en stock. Non annualisée ici.'}},
  tnTitle:'Régler le système',tnHint:'trois tokens de l’exemple',tnAccent:'Accent',
  tnDepth:'Profondeur des tons',tnDepthAria:'Profondeur des tons de surface, en pourcentage',tnRadius:'Rayon des feuilles',tnRadiusAria:'Rayon des feuilles, en pixels',
  accents:{cobalt:'Cobalt',teal:'Sarcelle',violet:'Violet'},
  tnStatus:(a,d,r,ri)=>`<b>Accent ${a.toLowerCase()}, surfaces à ${d}, rayon des feuilles ${r}, rayon des champs ${ri}.</b> `,
  tnDefault:'Ce sont les valeurs de l’exemple.',
  tnPale:'Avec des tons aussi proches du blanc, les feuilles perdent leurs bords, et le regroupement ne tient plus qu’à l’espacement.',
  tnDeep:'Des tons plus profonds séparent plus nettement les couches et rendent la page moins calme.',
  tnSharp:`Sous 8${NB}px, le coin du champ tombe à zéro, car le rayon intérieur est le rayon extérieur moins le retrait.`,
  tok:{surfaces:'surfaces : plus haut, plus clair',ink:'encre et filets',
    marks:'marques : l’ardoise pour le vendu ou le stock, l’accent pour le prévu,\n     sa teinte pour le planifié ou l’arrivage, son lavis sous un contour pointillé',
    radii:'rayons concentriques : champ = feuille − retrait'},
  copied:'Copié',copyFail:'Sélectionnez le bloc pour le copier',copyTokens:'Copier les tokens',
  ppTitle:'Les personnes, par année',ppHint:'sélectionnez un visage',ppProfile:'Lire la fiche',ppLearn:'La leçon à en tirer',ppRule:(n,t)=>`Règle ${n} · ${t}`,earlier:'Plus tôt',later:'Plus tard',before1900:'avant 1900',
  ppAria:'Personnes et œuvres sur un axe du temps, de 1786 à 2022, en six domaines',
  ppSplit:/,| et /,
  groupLabels:['Grille et typographie','Cartographie','Salles de contrôle','Rapports et statistiques','Perception et incertitude','Interaction et prévision'],
  ruleLinks:a=>`Règle${a.length>1?'s':''} `+(a.length>1?a.slice(0,-1).join(', ')+' et '+a[a.length-1]:a.join('')),worksLink:'Œuvres à ouvrir',
  notChecked:'Cité de mémoire, non revérifié',
  recon:(a,b,c,d,e,f)=>`<b>Un plan sur quatre semaines pour cinq lignes de produits, sur données d’exemple.</b> Chaque chiffre est calculé dans la page. Avec les commandes en cours, le plan vend pour ${a}, dégage ${b} de marge brute et laisse ${c} à acheter. Avec les bottes une semaine plus tôt, ces chiffres passent à ${d}${NN}; ${e} et ${f}.`,
  reconFail:'<b>L’exemple ne passe pas son propre rapprochement.</b>',
  figFail:'Cette figure n’a pas pu être dessinée.'
}};

const LANG=/^fr(-|$)/i.test(document.documentElement.lang||'')?'fr':'en';
const str=STR[LANG];

/* Numbers and dates in the page language. fx(v,d) prints the digits of v.toFixed(d) through Intl.NumberFormat, so the
   rounding stays that of toFixed (300.65 is 300.6, as the binary value is just below) and only the separators change:
   294.4 in English, 294,4 in French. int() prints a whole number. English keeps the original's plain digits (1120 px);
   French groups thousands with a narrow no-break space (1 120 px). The example's dates come from Intl.DateTimeFormat. */
const NF={},nf=(d,g)=>NF[d+'|'+g]||(NF[d+'|'+g]=new Intl.NumberFormat(str.locale,{minimumFractionDigits:d,maximumFractionDigits:d,useGrouping:g}));
const fx=(v,d)=>nf(d,str.group).format(+(+v).toFixed(d)),int=v=>nf(0,str.group).format(v);
const DM=new Intl.DateTimeFormat(str.dateLocale,{day:'numeric',month:'short'});
const dayMonth=d=>{const p={};DM.formatToParts(d).forEach(x=>{p[x.type]=x.value;});return str.dm(p.day,p.month);};

/* ================= the example's model =================
   Sample data for five product lines of a retailer: four weeks sold, four weeks ahead.
   Every figure on the page is computed here. There is no fitted forecast. */
// The eight week columns start on Mondays: four sold from 31 August 2026, four ahead from 28 September.
const WEEK=i=>new Date(2026,7,31+7*i);
const DATES=Array.from({length:8},(_,i)=>dayMonth(WEEK(i)));
const SPAN=str.span(DATES[4],dayMonth(new Date(2026,9,25)),2026);   // 28 Sep – 25 Oct 2026
const HORIZON=4;
// price and cost in $ per unit; open = units in stock at the 28 Sep snapshot; prev = units sold in the last four weeks;
// weekly = demand in units for the next four weeks; receipts = units arriving at the start of each week.
// name, kind and noun come from STR.
const LINES=[
  {id:'jackets',price:300,cost:180,open:540,prev:250,weekly:[80,85,95,100],receipts:[0,0,120,0]},
  {id:'boots',price:220,cost:120,open:160,prev:160,weekly:[80,80,80,80],receipts:[0,0,0,240]},
  {id:'layers',price:120,cost:60,open:450,prev:320,weekly:[120,140,160,180],receipts:[0,0,150,0]},
  {id:'packs',price:200,cost:120,open:360,prev:200,weekly:[35,30,30,25],receipts:[0,0,200,0]},
  {id:'tents',price:500,cost:300,open:180,prev:80,weekly:[13,11,9,7],receipts:[0,0,0,0]}].map(p=>({id:p.id,...str.lines[p.id],...p}));
const ACTUAL_SALES=[55.7,57.6,56.7,58.6];        // $K sold in the last four weeks
const TARGET=225.0;                              // stock to keep at the end of the four weeks, $K at cost
const LAYER_BUY={units:300,cost:18.0},BOOTS_EARLY=[0,0,80,160];
const DECISIONS=['boots','layers','packs','tents'];
const DEFAULTS={boots:false,layers:false,packs:false,tents:false,depth:20,units:60};
const LIMITS={depth:[0,35,5],units:[40,180,5]};
const sum=a=>a.reduce((x,y)=>x+y,0),K=v=>v/1000;

/* One plan. With every decision off it is the plan under current orders. */
function plan(input={}){
  const d={...DEFAULTS,...input};
  const rows=LINES.map(p=>{
    let receipts=p.receipts.slice(),price=p.price,weekly=p.weekly.slice();
    if(p.id==='boots'&&d.boots) receipts=BOOTS_EARLY.slice();            // 80 of the 240 arrive a week early
    if(p.id==='packs'&&d.packs) receipts=[0,0,0,0];                      // the 200 packs arrive after the four weeks
    if(p.id==='tents'&&d.tents){price=p.price*(1-d.depth/100); const base=sum(p.weekly); weekly=p.weekly.map(u=>u*d.units/base);}
    let stock=p.open; const close=[stock],sold=[],unfilled=[];
    for(let w=0;w<HORIZON;w++){stock+=receipts[w]; const q=Math.min(stock,weekly[w]); sold.push(q); unfilled.push(weekly[w]-q); stock-=q; close.push(stock);}
    const mean=sum(weekly)/HORIZON,rc=sum(receipts);
    return {...p,price,weekly,receipts,close,sold,unfilled,mean,cover:close.map(c=>c/mean),shift:sum(weekly)/p.prev-1,
      demandUnits:sum(weekly),servedUnits:sum(sold),unfilledUnits:sum(unfilled),
      demandValue:K(sum(weekly)*price),servedValue:K(sum(sold)*price),cogs:K(sum(sold)*p.cost),
      openCost:K(p.open*p.cost),receiptsCost:K(rc*p.cost),deferredCost:K((sum(p.receipts)-rc)*p.cost),
      proposedCost:p.id==='layers'&&d.layers?LAYER_BUY.cost:0};
  });
  const total=key=>sum(rows.map(r=>r[key])),byWeek=fn=>Array.from({length:HORIZON},(_,w)=>sum(rows.map(r=>fn(r,w))));
  const demand=total('demandValue'),served=total('servedValue'),cogs=total('cogs'),openCost=total('openCost'),receiptsCost=total('receiptsCost');
  const proposedBuy=d.layers?LAYER_BUY.cost:0,need=TARGET+cogs,have=openCost+receiptsCost;
  return {rows,demandByWeek:byWeek((r,w)=>K(r.weekly[w]*r.price)),servedByWeek:byWeek((r,w)=>K(r.sold[w]*r.price)),
    demand,served,unfilled:demand-served,unfilledUnits:total('unfilledUnits'),cogs,grossProfit:served-cogs,margin:(served-cogs)/served,
    openCost,receiptsCost,proposedBuy,need,have,openToBuy:need-have,openToBuyAfterBuy:need-have-proposedBuy,previousSales:sum(ACTUAL_SALES)};
}
const BASELINE=plan();

/* Tent markdown arithmetic, whether or not the test is applied to the plan. */
function markdown(depth,units){
  const t=LINES[4],baseUnits=sum(t.weekly),price=t.price*(1-depth/100),contribution=price-t.cost,baseProfit=K(baseUnits*(t.price-t.cost));
  return {price,basePrice:t.price,cost:t.cost,baseUnits,baseProfit,grossProfit:K(units*contribution),parityUnits:contribution>0?baseProfit*1000/contribution:Infinity,onHand:t.open};
}
/* What one decision changes, measured against the same plan without it. */
function effect(state,id){
  const a=plan({...state,[id]:true}),b=plan({...state,[id]:false});
  return {grossProfit:a.grossProfit-b.grossProfit,openToBuy:a.openToBuyAfterBuy-b.openToBuyAfterBuy};
}

/* Policy: the judgement calls, kept apart from the arithmetic. These defaults need no company knowledge. */
const POLICY={horizonWeeks:HORIZON,excessWeeks:12};
function signal(row){
  const stock=str.sigStock(row.cover[0],wk(row.cover[0]),spc(row.shift)),short=row.unfilled.findIndex(u=>u>0);
  if(short>=0) return str.sigShort(int(Math.round(row.unfilled[short])),DATES[4+short]);
  const zero=row.close.findIndex((c,i)=>i>0&&c<=0);
  if(zero>0) return str.sigOut(DATES[3+zero]);
  return stock;
}

/* ================= formats and drawing helpers ================= */
// Printed numbers go through fx, int and n0. SVG coordinates (p1) and CSS lengths stay machine numbers.
const f1=v=>{const a=Math.abs(v)<0.05?0:v;return (a<0?'−':'')+fx(Math.abs(a),1)};
const sg=v=>(v>0.049?'+':v<-0.049?'−':'')+fx(Math.abs(v),1);
const n0=v=>nf(0,true).format(Math.round(v));
const pc=(v,d=1)=>str.pct(fx(v*100,d));
const spc=v=>str.pct(`${v>=0?'+':'−'}${int(Math.abs(Math.round(v*100)))}`);
function wk(v){return Math.abs(v-Math.round(v))<0.05?int(Math.round(v)):fx(v,1);}
const differs=(a,b)=>Math.abs(a-b)>0.049;
const p1=v=>(+v).toFixed(1);
const R=(x,y,w,h,c,rx=0,ex='')=>`<rect x="${p1(x)}" y="${p1(y)}" width="${p1(Math.max(0,w))}" height="${p1(Math.max(0,h))}" rx="${rx}" class="${c}" ${ex}/>`;
const L=(x1,y1,x2,y2,c,ex='')=>`<line x1="${p1(x1)}" y1="${p1(y1)}" x2="${p1(x2)}" y2="${p1(y2)}" class="${c}" ${ex}/>`;
const T=(x,y,s,c,a='start',ex='')=>`<text x="${p1(x)}" y="${p1(y)}" class="${c}" text-anchor="${a}" ${ex}>${s}</text>`;
const S=(w,h,body,label,fluid)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}"${fluid?' style="width:100%;height:auto"':''}>${body}</svg>`;
// A vertical bar with a rounded top, and a horizontal segment with its own left and right radius.
const bar=(x,top,w,h,c,r=6)=>{if(h<=0) return ''; r=Math.min(r,h,w/2); return `<path d="M${p1(x)},${p1(top+h)} V${p1(top+r)} a${r},${r} 0 0 1 ${r},${-r} H${p1(x+w-r)} a${r},${r} 0 0 1 ${r},${r} V${p1(top+h)} Z" class="${c}"/>`;};
const hseg=(x,y,w,h,c,rl=0,rr=0)=>{if(w<=0) return ''; rl=Math.min(rl,w/2,h/2); rr=Math.min(rr,w/2,h/2);
  return `<path d="M${p1(x+rl)},${y} H${p1(x+w-rr)} a${rr},${rr} 0 0 1 ${rr},${rr} V${y+h-rr} a${rr},${rr} 0 0 1 ${-rr},${rr} H${p1(x+rl)} a${rl},${rl} 0 0 1 ${-rl},${-rl} V${y+rl} a${rl},${rl} 0 0 1 ${rl},${-rl} Z" class="${c}"/>`;};
const HALO='style="paint-order:stroke;stroke:var(--field);stroke-width:4px;stroke-linejoin:round"';

const segCtl=(name,opts,cur,label)=>`<div class="seg" role="radiogroup" aria-label="${label}">${opts.map(([v,t])=>`<button type="button" role="radio" data-${name}="${v}" aria-checked="${String(v)===String(cur)}">${t}</button>`).join('')}</div>`;
const setSeg=(root,name,cur)=>$$(`[data-${name}]`,root).forEach(b=>b.setAttribute('aria-checked',String(b.dataset[name]===String(cur))));
const opt=(id,label,sub,on,cls='')=>`<button type="button" class="opt ${cls}" role="switch" aria-checked="${on}" data-opt="${id}"><i class="sw"></i><span>${cls?label:`<b>${label}</b>`}${sub?`<small>${sub}</small>`:''}</span></button>`;
const onOpt=(root,fn)=>root.addEventListener('click',e=>{const o=e.target.closest('[data-opt]'); if(!o||o.disabled) return; const on=o.getAttribute('aria-checked')!=='true'; o.setAttribute('aria-checked',on); fn(o.dataset.opt,on);});

/* A chart is drawn at the width it has, and drawn again when that width changes. */
const drawW=(el,min=380)=>{const cs=getComputedStyle(el),w=Math.floor(el.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)); return w>0?Math.max(min,w):960;};
const redraw=[];
const watch=(el,min,render)=>{let last=drawW(el,min); redraw.push(force=>{const w=drawW(el,min); if(force||w!==last){last=w;render();}});};

/* ================= the example's charts =================
   Marks: slate = sold or in stock, cobalt = expected, cobalt tint = planned or arriving,
   dashed = left to buy, ink = lost sales. */

// Sales by week: four sold weeks, then four expected weeks with any lost part in ink at the top of the bar.
function weekBars(P,W,fluid){
  const cw=W/8,H=222,y0=186,k=1.75,bw=Math.min(72,Math.round(cw*0.46)),inset=(cw-bw)/2;
  let s=L(16,y0,W-16,y0,'l-a')+T(inset,20,str.sold,'t-grp')+T(4*cw+inset,20,str.expected,'t-grp cob');
  for(let i=0;i<8;i++){
    const cx=i*cw+cw/2,x=cx-bw/2;
    if(i<4){const v=ACTUAL_SALES[i]; s+=bar(x,y0-v*k,bw,v*k,'f-slate')+T(cx,y0-v*k-10,f1(v),'t-v','middle');}
    else{
      const d=P.demandByWeek[i-4],sv=P.servedByWeek[i-4],lost=d-sv;
      if(lost>0.05){
        s+=R(x,y0-sv*k,bw,sv*k,'f-cob')+bar(x,y0-d*k,bw,lost*k-2,'f-ink');
        if(bw>=38) s+=lost*k>=18?T(cx,y0-d*k+(lost*k-2)/2+5,`−${f1(lost)}`,'t-on','middle'):T(x+bw+8,y0-d*k+10,`−${f1(lost)}`,'t-v');
      }else s+=bar(x,y0-sv*k,bw,sv*k,'f-cob');
      s+=T(cx,y0-d*k-10,f1(d),'t-v cob','middle');
    }
    s+=T(cx,y0+24,DATES[i],'t-tk','middle');
  }
  return S(W,H,s,str.ariaWeekBars,fluid);
}

// The same eight weeks coded by hue: expected demand and expected sales as two bars. Used only to show what the example avoids.
function hueBars(P,W){
  const cw=W/8,H=222,y0=186,k=1.75,bw=Math.min(72,Math.round(cw*0.46)),b2=Math.max(10,Math.round(bw/2-1.5)),inset=(cw-bw)/2,two=b2>=30;
  let s=L(16,y0,W-16,y0,'l-a')+T(inset,20,str.sold,'t-grp')+T(4*cw+inset,20,str.expected,'t-grp');
  for(let i=0;i<8;i++){
    const cx=i*cw+cw/2;
    if(i<4){const v=ACTUAL_SALES[i]; s+=bar(cx-bw/2,y0-v*k,bw,v*k,'f-slate')+T(cx,y0-v*k-10,f1(v),'t-v','middle');}
    else{
      const d=P.demandByWeek[i-4],sv=P.servedByWeek[i-4];
      s+=bar(cx-b2-1.5,y0-d*k,b2,d*k,'f-huea')+bar(cx+1.5,y0-sv*k,b2,sv*k,'f-hueb');
      s+=two?T(cx-b2/2-1.5,y0-d*k-10,f1(d),'t-v','middle')+T(cx+b2/2+1.5,y0-sv*k-10,f1(sv),'t-v','middle'):T(cx,y0-d*k-10,f1(d),'t-v','middle');
    }
    s+=T(cx,y0+24,DATES[i],'t-tk','middle');
  }
  return S(W,H,s,str.ariaHueBars,true);
}

// One product line: stock now and at the end of each of the four weeks, against the dashed four-week line.
function stockCells(r,cw){
  const W=5*cw,H=80,maxH=44,bw=Math.min(48,Math.round(cw*0.32));
  const line=r.mean*POLICY.horizonWeeks,peak=Math.max(line,...r.close),h=v=>v/peak*maxH;
  let s=L(cw/2-bw/2-12,H-h(line),W-cw/2+bw/2+12,H-h(line),'l-d');
  r.close.forEach((c,j)=>{
    const cx=j*cw+cw/2,x=cx-bw/2,lost=j?r.unfilled[j-1]:0,rc=j?r.receipts[j-1]:0,bh=h(c);
    if(rc>0) s+=T(cx-26,22,`+${n0(rc)}`,'t-rc','end');
    if(lost>0){s+=R(cx-38,H-34,76,26,'f-ink',8)+T(cx,H-16.5,str.short(n0(lost)),'t-on','middle'); return;}
    if(c>0){const rh=Math.min(bh,h(rc)); s+=rh>0?bar(x,H-bh,bw,rh,'f-tint',5)+R(x,H-bh+rh+1.5,bw,bh-rh-1.5,'f-slate'):bar(x,H-bh,bw,bh,'f-slate',5);}
    s+=T(cx,22,n0(c),'t-v','middle');
  });
  return S(W,H,s,str.ariaStock(r.name,r.close.map(c=>n0(c))));
}

// The weekly sheet: sales on top, one stock row per product line under the same week columns.
function weekly(P,W,order){
  const cw=W/8,mini=Math.round(Math.min(152,Math.max(104,cw*0.8))),nameW=3*cw-2*mini;
  let h=`<div class="wk" style="width:${W}px" data-cw="${cw}"><div class="wk-band"></div>${weekBars(P,W)}
    <div class="wk-head"><div style="width:${nameW}px;padding-left:24px">${str.colLine}</div><div style="width:${mini}px">${str.colTrend}</div><div style="width:${mini}px">${str.colWeeks}</div><div class="c" style="width:${cw}px">${str.colNow}</div></div>`;
  (order||P.rows.map((_,i)=>i)).forEach(i=>{
    const r=P.rows[i],c0=r.cover[0];
    h+=`<div class="wk-row" data-line="${r.id}"><div class="nm" style="width:${nameW}px"><b>${r.name}</b><span>${r.kind}</span></div>
      <div class="mini" style="width:${mini}px"><b>${spc(r.shift)}</b><div class="dv"><i class="${r.shift>=0?'up':'dn'}" style="width:${p1(Math.min(1,Math.abs(r.shift))*50)}%"></i></div></div>
      <div class="mini" style="width:${mini}px"><b>${wk(c0)}</b><div class="lv"><i style="width:${p1(Math.min(100,c0/20*100))}%"></i><u style="left:${POLICY.horizonWeeks/20*100}%"></u></div></div>
      ${stockCells(r,cw)}</div>`;
  });
  return h+'</div>';
}

// Open-to-buy as two bars on one scale: what the plan needs against what is in stock or on order. The dashed space is left to buy.
function bridge(v,W,o={}){
  const need=v.sell+v.keep,have=v.stock+v.order,buy=v.buy||0,left=need-have-buy;
  const x0=o.compact?72:96,x1=W-(o.compact?10:24),k=(x1-x0)/Math.max(need,have+buy,1),X=q=>x0+q*k,lx=o.compact?6:24,top=o.compact?14:52,yN=top,yH=top+68,bh=28,gap=1.5;
  let s=T(lx,yN+13,str.need,'t-row')+T(lx,yN+30,f1(need),'t-lb')+T(lx,yH+13,str.have,'t-row')+T(lx,yH+30,f1(have+buy),'t-lb');
  s+=hseg(X(0),yN,v.sell*k-gap,bh,'f-cob',8,0)+hseg(X(v.sell)+gap,yN,v.keep*k-gap,bh,'f-tint',0,8);
  s+=hseg(X(0),yH,v.stock*k-gap,bh,'f-slate',8,0)+hseg(X(v.stock)+gap,yH,v.order*k-gap*2,bh,'f-tint',0,0);
  if(!o.compact){
    s+=T(X(0),20,f1(v.sell),'t-v')+T(X(0),38,str.toSell,'t-lb');
    if(v.keep*k>150) s+=T(X(need),20,f1(v.keep),'t-v','end')+T(X(need),38,str.toKeep,'t-lb','end');
    s+=T(X(0),yH+bh+22,f1(v.stock),'t-v')+T(X(0),yH+bh+40,str.inStock,'t-lb');
    if(X(Math.max(need,have+buy))-X(v.stock)>150&&v.stock*k>70) s+=T(X(v.stock)+4,yH+bh+22,f1(v.order),'t-v')+T(X(v.stock)+4,yH+bh+40,str.onOrderTag,'t-lb');
  }
  if(buy>0) s+=R(X(have)+gap,yH+1,buy*k-gap*2,bh-2,'o-dash tintfill',3);
  if(left>=0.05){
    const gx=X(have+buy)+gap;
    s+=`<path d="M${p1(gx+1)},${yN+bh+6} V${yH+bh-1} H${p1(X(need)-1)} V${yN+bh+6}" class="o-dash washfill"/>`;
    s+=T(X(need),yH+bh+24,f1(left),'t-big cob','end')+T(X(need),yH+bh+40,str.leftToBuy,'t-lb cob','end');
    if(buy>0&&X(need)-gx>96) s+=T(gx+8,yN+bh+26,str.afterBuy(f1(buy)),'t-tk cob');
  }else if(left<=-0.05){
    s+=`<path d="M${p1(X(need)+gap+1)},${yH-6} V${yN+1} H${p1(X(have+buy)-1)} V${yH-6}" class="o-over"/>`;
    s+=T(X(have+buy),yH+bh+24,f1(left),'t-big','end')+T(X(have+buy),yH+bh+40,str.overPlan,'t-lb ink','end');
  }else s+=T(X(need),yH+bh+24,f1(0),'t-big cob','end')+T(X(need),yH+bh+40,str.leftToBuy,'t-lb cob','end');
  return S(W,top+152,s,str.ariaBridge(f1(need),f1(have+buy),f1(left)),o.fluid);
}
const bridgeOf=P=>({sell:P.cogs,keep:TARGET,stock:P.openCost,order:P.receiptsCost,buy:P.proposedBuy});
const BRIDGE_KEY=`<div class="key under"><span><i style="background:var(--cobalt)"></i>${str.bridgeKey[0]}</span><span><i style="background:var(--tint)"></i>${str.bridgeKey[1]}</span><span><i style="background:var(--slate)"></i>${str.bridgeKey[2]}</span></div>`;

// Stock value by product line: in stock, on order, and anything proposed or moved later shown dashed.
function stockValue(P,W){
  const x0=112,px=(W-x0-72)/125; let s='';
  P.rows.forEach((r,i)=>{
    const y=12+i*36,on=r.receiptsCost*px,dashed=(r.proposedCost+r.deferredCost)*px; let x=x0+r.openCost*px;
    s+=T(24,y+14,r.name,'t-lb ink')+hseg(x0,y,r.openCost*px-1.5,18,'f-slate',6,on||dashed?0:6);
    if(on>0){s+=hseg(x+1.5,y,on-1.5,18,'f-tint',0,dashed?0:6); x+=on;}
    if(dashed>0){s+=R(x+2.5,y+1,dashed-3,16,'o-dash',4); x+=dashed;}
    s+=T(x+10,y+14.5,f1(r.openCost+r.receiptsCost+r.proposedCost),'t-v');
  });
  return S(W,204,s,str.ariaStockValue,true);
}

// Tent markdown: the curve is the number of tents that keeps the full-price profit at each discount. The point is the test.
const mdGeom=W=>({left:44,right:W-24,top:14,bottom:186,maxDepth:LIMITS.depth[1],maxUnits:200});
function markdownPlot(depth,units,W){
  const m=markdown(depth,units),g=mdGeom(W),H=216;
  const x=v=>g.left+v/g.maxDepth*(g.right-g.left),y=v=>g.bottom-v/g.maxUnits*(g.bottom-g.top);
  const par=d=>m.baseProfit*1000/(m.basePrice*(1-d/100)-m.cost);
  let curve='',last=0;
  for(let d=0;d<=g.maxDepth;d+=0.5){const v=par(d); if(v>g.maxUnits||v<=0) break; curve+=`${d?'L':'M'}${p1(x(d))},${p1(y(v))}`; last=d;}
  let s=`<path d="${curve} L${p1(x(last))},${g.top} L${g.left},${g.top} Z" class="washfill"/>`;
  [100,200].forEach(v=>{s+=L(g.left,y(v),g.right,y(v),'l-g')+T(g.left-8,y(v)+4,int(v),'t-tk','end');});
  s+=L(g.left,g.bottom,g.right,g.bottom,'l-a');
  [0,10,20,30].forEach(v=>{s+=T(x(v),g.bottom+22,str.pct(int(v)),'t-tk','middle');});
  s+=L(g.left,y(m.onHand),g.right,y(m.onHand),'l-d')+T(g.left+12,y(m.onHand)+18,str.mdInStock(int(m.onHand)),'t-tk');
  s+=`<path d="${curve}" class="l-s"/>`+T(g.left+12,y(128),str.mdBeats,'t-tk cob');
  const hx=x(depth),hy=y(units),flip=hx>g.right-96;
  if(m.parityUnits<=g.maxUnits&&Math.abs(m.parityUnits-units)>=8){
    const py=y(m.parityUnits);
    s+=L(hx,hy,hx,py,'l-d')+`<circle cx="${p1(hx)}" cy="${p1(py)}" r="5" class="o-ink"/>`+T(hx-12,py+(m.parityUnits>units?-8:18),str.mdMatch(n0(m.parityUnits)),'t-tk on-wash',hx<g.left+110?'start':'end');
  }
  s+=`<g data-md-handle tabindex="0" role="slider" aria-label="${str.mdAria}" aria-valuetext="${str.mdValue(int(depth),int(units))}"><circle cx="${p1(hx)}" cy="${p1(hy)}" r="15" class="halo"/><circle cx="${p1(hx)}" cy="${p1(hy)}" r="8" class="knob"/></g>`;
  s+=T(flip?hx-20:hx+20,hy+5,str.mdTents(int(units)),'t-v cob',flip?'end':'start');
  return S(W,H,s,str.mdPlotAria(int(units),int(depth)));
}
// The markdown test is set on the plot itself: drag the point, or use the arrow keys on it.
const snap=(v,[lo,hi,step])=>Math.min(hi,Math.max(lo,Math.round(v/step)*step));
function wireMarkdown(root,sel,get,set){
  let dragging=false;
  const to=(depth,units)=>{depth=snap(depth,LIMITS.depth);units=snap(units,LIMITS.units);const s=get(); if(depth!==s.depth||units!==s.units) set(depth,units);};
  const dragTo=e=>{const svg=$(sel+' svg',root); if(!svg) return; const box=svg.getBoundingClientRect(),g=mdGeom(box.width);
    to((e.clientX-box.left-g.left)/(g.right-g.left)*g.maxDepth,(g.bottom-(e.clientY-box.top))/(g.bottom-g.top)*g.maxUnits);};
  root.addEventListener('pointerdown',e=>{const plot=e.target.closest(sel); if(!plot) return; dragging=true; try{plot.setPointerCapture(e.pointerId);}catch(err){/* a synthetic pointer has nothing to capture */} dragTo(e); e.preventDefault();});
  root.addEventListener('pointermove',e=>{if(dragging) dragTo(e);});
  ['pointerup','pointercancel'].forEach(t=>root.addEventListener(t,()=>{dragging=false;}));
  root.addEventListener('keydown',e=>{
    if(!e.target.closest||!e.target.closest(sel+' [data-md-handle]')) return;
    const step={ArrowLeft:[-LIMITS.depth[2],0],ArrowRight:[LIMITS.depth[2],0],ArrowUp:[0,LIMITS.units[2]],ArrowDown:[0,-LIMITS.units[2]]}[e.key]; if(!step) return;
    e.preventDefault(); const s=get(); to(s.depth+step[0],s.units+step[1]); const h=$(sel+' [data-md-handle]',root); if(h) h.focus();
  });
}
// Pointing at a product line marks it wherever it appears; pointing at a week marks its column.
function wireWeekly(root){
  const hot=sel=>{$$('.hot',root).forEach(n=>n.classList.remove('hot')); if(sel) $$(sel,root).forEach(n=>n.classList.add('hot'));};
  root.addEventListener('pointerover',e=>{const p=e.target.closest('[data-line]'); hot(p?`.wk-row[data-line="${p.dataset.line}"],.dec-row[data-line="${p.dataset.line}"]`:'');});
  root.addEventListener('pointermove',e=>{const band=$('.wk-band',root); if(!band) return; const w=e.target.closest&&e.target.closest('.wk'); if(!w){band.style.opacity=0;return;}
    const cw=Number(w.dataset.cw),col=Math.floor((e.clientX-w.getBoundingClientRect().left)/cw); band.style.cssText=`opacity:1;left:${col*cw}px;width:${cw}px`;});
  root.addEventListener('pointerleave',()=>{hot('');const band=$('.wk-band',root); if(band) band.style.opacity=0;});
}

/* Instrument cards: label, value, a rail drawn to scale, the gap. */
const inst=o=>`<div class="top"><b>${o.label}</b><span>${o.ctx}</span></div><div class="val"><b>${o.val}</b><span>${str.K}</span></div><div class="rail">${o.rail}</div><div class="gap"><b>${o.gap}</b><span>${o.ref}</span></div>`;
const part=(c,v)=>v>0.049?`<i class="${c}" style="flex:${v.toFixed(2)}"></i>`:'';
function cards(P){
  const B=BASELINE,top=Math.max(320,P.demand*1.04),short=P.rows.filter(r=>r.unfilledUnits>0);
  const weeks=[...new Set(short.flatMap(r=>r.unfilled.map((u,w)=>u>0?DATES[4+w]:null).filter(Boolean)))];
  const otbMoved=differs(P.openToBuyAfterBuy,B.openToBuy),gpMoved=differs(P.grossProfit,B.grossProfit);
  return [
    {html:inst({label:str.cDemand,ctx:str.cNext4,val:f1(P.demand),rail:`${part('c',P.demand)}${part('w',top-P.demand)}<u style="left:${(P.previousSales/top*100).toFixed(2)}%"></u>`,gap:spc(P.demand/P.previousSales-1),ref:str.cLast4(f1(P.previousSales))})},
    {ink:P.unfilled>0.049,html:inst({label:str.cLost,ctx:str.cOut,val:f1(P.unfilled),rail:part('c',P.served)+part('k',P.unfilled),
      gap:short.length===0?str.cNone:short.length===1?str.cNoun(n0(short[0].unfilledUnits),short[0].noun):str.cUnits(n0(P.unfilledUnits)),
      ref:short.length===0?str.cAllServed:weeks.length===1?str.cWeekOf(weeks[0]):str.cWeeks(int(weeks.length))})},
    {html:inst({label:str.cOtb,ctx:str.cLeft,val:f1(P.openToBuyAfterBuy),rail:part('s',P.have+P.proposedBuy)+part('c',P.openToBuyAfterBuy),
      gap:otbMoved?sg(P.openToBuyAfterBuy-B.openToBuy):str.cOfNeed(pc(P.openToBuy/P.need,0)),ref:otbMoved?str.cCurrent(f1(B.openToBuy)):str.cNeed(f1(P.need))})},
    {html:inst({label:str.cGp,ctx:str.cNext4,val:f1(P.grossProfit),rail:part('s2',P.cogs)+part('c',P.grossProfit),
      gap:gpMoved?sg(P.grossProfit-B.grossProfit):str.cMargin(pc(P.margin)),ref:gpMoved?str.cCurrent(f1(B.grossProfit)):str.cSales(f1(P.served))})}];
}
const cardsHTML=P=>cards(P).map(c=>`<div class="field inst${c.ink?' ink':''}">${c.html}</div>`).join('');

function decisionRows(state){
  const items=[['boots',str.decBoots],['layers',str.decLayers(int(LAYER_BUY.units))],['packs',str.decPacks],['tents',str.decTents(str.pct(int(state.depth)))]];
  const num=v=>Math.abs(v)<0.05?'<b class="nil">—</b>':`<b class="${v>0?'cob':''}">${sg(v)}</b>`;
  let h=`<div class="dec"><div class="dec-row head"><div></div><div></div><div>${str.decProfit}</div><div>${str.decOtb}</div></div>`;
  items.forEach(([id,title])=>{
    const e=effect(state,id),before=plan({...state,[id]:false}).rows.find(r=>r.id===id);
    h+=`<div class="dec-row" data-line="${id}"><div><button class="sw" type="button" role="switch" aria-checked="${state[id]}" data-switch="${id}" aria-label="${title}"></button></div>
      <div><b>${title}</b><small>${signal(before)}</small></div><div class="num">${num(e.grossProfit)}</div><div class="num">${num(e.openToBuy)}</div></div>`;
  });
  return h+'</div>';
}
const mdPairs=(depth,units)=>{const m=markdown(depth,units),diff=m.grossProfit-m.baseProfit;
  return `<div><b>${f1(m.baseProfit)}</b><span>${str.pFull(int(m.baseUnits))}</span></div><div><b class="cob">${f1(m.grossProfit)}</b><span>${str.pOff(int(units),str.pct(int(depth)))}</span></div><div><b${diff>0.049?' class="cob"':''}>${sg(diff)}</b><span>${str.pDiff}</span></div>`;};

/* ================= the worked example ================= */
function mountExample(root){
  const state={...DEFAULTS};
  root.innerHTML=`<div class="titleline"><h3>${str.exTitle}</h3><div class="scope">${str.exScope(SPAN)}</div></div>
    <section class="sheet k4" aria-label="${str.ariaKey}" id="ex-cards"></section>
    <section class="sheet s1"><div class="field scroll"><div class="tbar"><div><h4>${str.wkTitle}</h4><span class="ctx">${str.wkCtx}</span></div>
        <div class="key"><span><i class="k-line"></i>${str.key4}</span><span><i style="background:var(--tint)"></i>${str.keyArriving}</span><span><i style="background:var(--ink)"></i>${str.keyLost}</span></div></div><div id="ex-weekly"></div></div></section>
    <section class="sheet s32"><div class="field"><div class="tbar"><div><h4>${str.otb}</h4><span class="ctx">${str.atCost}</span></div></div><div id="ex-bridge" style="padding-bottom:8px"></div></div>
      <div class="field"><div class="tbar"><div><h4>${str.svTitle}</h4><span class="ctx">${str.atCost}</span></div><div class="key"><span><i style="background:var(--slate)"></i>${str.keyInStock}</span><span><i style="background:var(--tint)"></i>${str.keyOnOrder}</span></div></div><div id="ex-stock" style="padding-bottom:8px"></div></div></section>
    <section class="sheet s32"><div class="field scroll"><div class="tbar"><div><h4>${str.decTitle}</h4><span class="ctx">${str.decCtx}</span></div><div class="plan-chip" id="ex-chip"></div></div><div id="ex-decisions"></div></div>
      <div class="field"><div class="tbar"><div><h4>${str.mdTitle}</h4><span class="ctx">${str.mdCtx}</span></div></div><div class="md"><div id="ex-md" class="mdplot"></div><div class="pairs" id="ex-cmp"></div></div></div></section>`;
  const el=id=>$('#ex-'+id,root);
  function paintMd(){const p=el('md'); p.innerHTML=markdownPlot(state.depth,state.units,Math.max(260,Math.floor(p.clientWidth))); el('cmp').innerHTML=mdPairs(state.depth,state.units);}
  function paint(){
    const P=plan(state),n=DECISIONS.filter(id=>state[id]).length;
    el('chip').innerHTML=n?`<span>${str.chipOn(n,int(n))}</span><button class="btn quiet" type="button" data-reset>${str.reset}</button>`:'';
    el('cards').innerHTML=cardsHTML(P);
    el('weekly').innerHTML=weekly(P,Math.max(960,Math.floor(el('weekly').parentElement.clientWidth)));
    const bw=drawW(el('bridge'),360); el('bridge').innerHTML=bridge(bridgeOf(P),bw,{compact:bw<520,fluid:true})+(bw<520?BRIDGE_KEY.replace('key under','key under" style="padding:10px 16px 6px'):'');
    el('stock').innerHTML=stockValue(P,drawW(el('stock'),300));
    el('decisions').innerHTML=decisionRows(state);
    paintMd();
  }
  root.addEventListener('click',e=>{
    const t=e.target.closest('[data-switch],[data-reset]'); if(!t) return;
    if(t.dataset.switch){const id=t.dataset.switch; state[id]=!state[id]; paint(); const f=$(`[data-switch="${id}"]`,root); if(f) f.focus();}
    else{DECISIONS.forEach(id=>{state[id]=false;}); paint();}
  });
  wireMarkdown(root,'#ex-md',()=>state,(d,u)=>{state.depth=d;state.units=u; if(state.tents) paint(); else{paintMd(); el('decisions').innerHTML=decisionRows(state);}});
  wireWeekly(root);
  paint(); watch(root,300,paint);
}

/* ================= figures of the rules ================= */

/* Rule 1: a column count gives whole pixels exactly when it divides the width plus one gutter. */
function demoProgramme(root){
  const st={W:1120,g:32,unit:'px'},PRESET={page:[1120,32],example:[1088,8]};
  root.innerHTML=`<div class="demo-head"><div><h3>${str.pgTitle}</h3></div>
    <div class="demo-ctl">${segCtl('preset',str.pgPresets,'page',str.pgPresetsAria)}</div></div>
    <section class="sheet s1"><div class="field"><div class="tbar ctl"><label class="rng"><span>${str.pgWidth}</span><input type="range" id="pg-w" min="960" max="1600" step="8" value="1120" aria-label="${str.pgWidthAria}"><output id="pg-wo"></output></label>
      <span class="rng two"><span>${str.pgGutter}</span>${segCtl('g',[8,16,24,32].map(v=>[v,int(v)]),32,str.pgGutterAria)}</span></div><div id="pg-view" class="pad"></div></div></section>
    <p class="status" id="pg-status" aria-live="polite"></p>`;
  const view=$('#pg-view',root),status=$('#pg-status',root),wo=$('#pg-wo',root),rng=$('#pg-w',root);
  const key=(cls,t)=>`<span><i class="${cls}" style="width:22px"></i>${t}</span>`;
  function render(){
    const VW=drawW(view),{W,g,unit}=st,px=unit==='px',compact=VW<640,x0=28,barsW=compact?VW-x0-2:VW-x0-190,sc=barsW/W; let s='';
    for(let n=1;n<=12;n++){
      const y=4+(n-1)*36,cwid=(W-(n-1)*g)/n,whole=Math.abs(cwid-Math.round(cwid))<1e-9,mod=px&&whole&&Math.round(cwid)%8===0,lab=whole?int(Math.round(cwid)):fx(cwid,1);
      const cls=!whole?'o-frac':(px&&!mod)?'f-slate2':'f-slate',tc=!whole?'t-tk':(px&&!mod)?'t-n':'t-on';
      s+=T(2,y+19,int(n),'t-row');
      for(let c=0;c<n;c++){const x=x0+c*(cwid+g)*sc; s+=R(x,y,cwid*sc,28,cls,6);
        if(cwid*sc>lab.length*8+10) s+=T(x+cwid*sc/2,y+19,lab,tc,'middle');}
      if(!compact) s+=T(x0+barsW+16,y+19,!whole?str.pgFrac:px?(mod?str.pgModule:str.pgWholePx):str.pgWholeUnits,whole?'t-lb ink':'t-lb');
    }
    view.innerHTML=S(VW,4+12*36,s,str.pgAria,true)
      +(compact?`<div class="key under">${px?key('dot f-slate',str.pgModule)+`<span><i style="width:22px;background:var(--slate2)"></i>${str.pgWholePx}</span>`:key('dot f-slate',str.pgWholeUnits)}<span><i class="k-dash" style="width:22px"></i>${str.pgFrac}</span></div>`:'');
    const total=W+g,div=[];for(let n=1;n<=12;n++) if(total%n===0) div.push(n);
    status.innerHTML=str.pgStatus(int(W),int(g),int(total),px,str.list(div.map(int)));
    wo.textContent=str.pgOut(int(W),px); rng.disabled=!px; if(px) rng.value=W;
    setSeg(root,'g',px?g:''); setSeg(root,'preset',!px?'capital':(Object.keys(PRESET).find(k=>PRESET[k][0]===W&&PRESET[k][1]===g)||''));
  }
  root.addEventListener('input',e=>{if(e.target.id==='pg-w'){st.W=+e.target.value;st.unit='px';render();}});
  root.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.g){st.g=+b.dataset.g; if(st.unit!=='px'){st.unit='px';st.W=1120;} render();}
    else if(b.dataset.preset==='capital'){st.W=58;st.g=2;st.unit='units';render();}
    else if(PRESET[b.dataset.preset]){[st.W,st.g]=PRESET[b.dataset.preset];st.unit='px';render();}
  });
  render(); watch(view,380,render);
}

/* Rule 2: what each part of an instrument answers. */
function demoInstrument(root){
  const st={v:BASELINE.demand,unit:true,scale:true,comp:true,gap:true},REF=sum(ACTUAL_SALES);
  const parts=str.inParts;   // [id, switch label, question, the question inside a sentence]
  root.innerHTML=`<div class="demo-head"><div><h3>${str.inTitle}</h3></div><label class="rng wide"><span>${str.inValue}</span><input type="range" id="in-v" min="180" max="320" step="0.2" value="${BASELINE.demand.toFixed(1)}" aria-label="${str.inValue}"><output id="in-vo"></output></label></div>
    <section class="sheet s23"><div class="field inst" id="in-card"></div><div class="field opts">${parts.map(p=>opt(p[0],p[1],p[2],true)).join('')}</div></section>
    <p class="status" id="in-status" aria-live="polite"></p>`;
  const card=$('#in-card',root),status=$('#in-status',root),vo=$('#in-vo',root);
  function render(){
    const top=Math.max(320,st.v*1.04),gapOn=st.gap&&st.comp;
    card.innerHTML=`<div class="top"><b>${str.cDemand}</b><span>${st.unit?str.cNext4:'&nbsp;'}</span></div><div class="val"><b>${f1(st.v)}</b>${st.unit?`<span>${str.K}</span>`:''}</div>
      <div class="rail"${st.scale?'':' style="visibility:hidden"'}>${part('c',st.v)}${part('w',top-st.v)}${st.comp?`<u style="left:${(REF/top*100).toFixed(2)}%"></u>`:''}</div>
      <div class="gap"><b>${gapOn?spc(st.v/REF-1):'&nbsp;'}</b><span>${st.comp?str.cLast4(f1(REF)):''}</span></div>`;
    const on=p=>p[0]==='gap'?gapOn:st[p[0]],q=p=>p[3];
    const miss=parts.filter(p=>!on(p)).map(q);
    status.innerHTML=str.inStatus([str.inHowMuch].concat(parts.filter(on).map(q)).join(', '),miss.length?miss.join(', '):'');
    vo.textContent=f1(st.v);
    const g=$('[data-opt="gap"]',root); g.disabled=!st.comp;
  }
  root.addEventListener('input',e=>{if(e.target.id==='in-v'){st.v=+e.target.value;render();}});
  onOpt(root,(id,on)=>{st[id]=on;render();});
  render();
}

/* Rule 3: Wheeler's chart of individual values. Limits = mean ± 2.66 × the average moving range of the baseline. */
function demoXmr(root){
  const base=[55.2,57.4,56.1,54.8,57.0,58.1,55.9,56.6,55.7,57.6,56.7];
  const mean=sum(base)/base.length,mr=base.slice(1).reduce((a,b,i)=>a+Math.abs(b-base[i]),0)/(base.length-1);
  const lo=mean-2.66*mr,hi=mean+2.66*mr,st={v:58.6};
  root.innerHTML=`<div class="demo-head"><div><h3>${str.xmTitle}</h3><span class="hint">${str.xmHint}</span></div>
    <label class="rng wide"><span>${str.xmLatestWeek}</span><input type="range" id="xm-v" min="48" max="66" step="0.1" value="58.6" aria-label="${str.xmLatestWeek}"><output id="xm-vo"></output></label></div>
    <section class="sheet s1"><div class="field"><div id="xm-view" class="pad" style="padding-top:16px"></div></div></section><p class="status" id="xm-status" aria-live="polite"></p>`;
  const view=$('#xm-view',root),status=$('#xm-status',root),vo=$('#xm-vo',root);
  function render(){
    const VW=drawW(view),compact=VW<640,xr=VW-(compact?124:150),x=i=>60+i*(xr-80)/11,y=v=>232-(v-47)/20*212,all=base.concat([st.v]),out=st.v>hi||st.v<lo; let s='';
    [50,55,60,65].forEach(v=>{s+=L(44,y(v),xr,y(v),'l-g')+T(36,y(v)+4.5,int(v),'t-tk','end');});
    s+=R(44,y(hi),xr-44,y(lo)-y(hi),'f-sheet');
    s+=L(44,y(hi),xr,y(hi),'l-d')+L(44,y(lo),xr,y(lo),'l-d')+L(44,y(mean),xr,y(mean),'l-a');
    s+=T(xr+10,y(hi)+5,str.xmUpper(f1(hi)),'t-lb')+T(xr+10,y(mean)+5,str.xmAvg(f1(mean)),'t-lb')+T(xr+10,y(lo)+5,str.xmLower(f1(lo)),'t-lb');
    s+=`<path d="${all.map((v,i)=>(i?'L':'M')+p1(x(i))+','+p1(y(v))).join('')}" class="l-o"/>`;
    base.forEach((v,i)=>{s+=`<circle cx="${p1(x(i))}" cy="${p1(y(v))}" r="4.5" class="f-slate"/>`;});
    s+=(out?`<circle cx="${p1(x(11))}" cy="${p1(y(st.v))}" r="13" class="l-i"/>`:'')+`<circle cx="${p1(x(11))}" cy="${p1(y(st.v))}" r="7" class="f-ink"/>`+T(x(11),y(st.v)+(st.v>mean?-20:30),f1(st.v),'t-v','middle');
    for(let i=0;i<12;i++) if(!compact||i===11||i%3===0) s+=T(x(i),254,i===11?(compact?str.xmLatestShort:str.xmLatest):int(i+1),'t-tk','middle');
    view.innerHTML=S(VW,262,s,str.xmAria,true);
    status.innerHTML=out?(st.v>hi?str.xmAbove(f1(st.v),f1(hi)):str.xmBelow(f1(st.v),f1(lo)))
      :str.xmRoutine(f1(st.v),f1(lo),f1(hi));
    vo.textContent=f1(st.v);
  }
  root.addEventListener('input',e=>{if(e.target.id==='xm-v'){st.v=+e.target.value;render();}});
  render(); watch(view,380,render);
}

/* Rule 4: the open-to-buy identity with every term movable. */
function demoBridge(root){
  const def=bridgeOf(BASELINE),st={...def};
  const rows=[['sell',str.toSell,'f-cob',100,220],['keep',str.toKeep,'f-tint',150,300],['stock',str.inStock,'f-slate',150,350],['order',str.onOrder,'f-tint',0,160]];
  root.innerHTML=`<div class="demo-head"><div><h3>${str.otb}</h3><span class="hint">${str.atCost}</span></div><button class="btn" type="button" id="br-reset">${str.resetExample}</button></div>
    <section class="sheet s23"><div class="field sliders">${rows.map(r=>`<label class="rng col"><span><i class="dot ${r[2]}"></i>${r[1]}</span><output id="br-${r[0]}o"></output><input type="range" id="br-${r[0]}" min="${r[3]}" max="${r[4]}" step="0.2"></label>`).join('')}</div>
      <div class="field" style="display:flex;align-items:center"><div id="br-view" class="pad" style="flex:1;min-width:0;padding-top:12px"></div></div></section>
    <p class="status" id="br-status" aria-live="polite"></p>`;
  const view=$('#br-view',root),status=$('#br-status',root);
  function render(sync){
    const VW=drawW(view,360); view.innerHTML=bridge(st,VW,{compact:VW<520,fluid:true});
    const left=st.sell+st.keep-st.stock-st.order;
    status.innerHTML=str.brStatus(f1(st.sell),f1(st.keep),f1(st.stock),f1(st.order),f1(left))+(left>=0.05?str.brMay(f1(left)):left<=-0.05?str.brOver(f1(-left)):str.brExact);
    rows.forEach(r=>{$('#br-'+r[0]+'o',root).textContent=f1(st[r[0]]); if(sync) $('#br-'+r[0],root).value=st[r[0]];});
  }
  root.addEventListener('input',e=>{const k=e.target.id.slice(3); if(k in st){st[k]=+e.target.value;render(false);}});
  $('#br-reset',root).addEventListener('click',()=>{Object.assign(st,def);render(true);});
  render(true); watch(view,360,()=>render(false));
}

/* Rule 5: four small models of surface. */
function demoSurfaces(root){
  const st={region:true,contrast:70,join:false,radius:20,inset:8,accent:2};
  const mix=(a,b,t)=>'#'+a.map((v,i)=>Math.round(v+(b[i]-v)*t).toString(16).padStart(2,'0')).join('');
  const G=[185,192,202],DARK=[90,102,118],LIGHT=[255,255,255];
  const vals=Array.from({length:40},(_,i)=>Math.abs((Math.sin(i*12.9898)*43758.5453)%1)),rank=vals.map((v,i)=>[v,i]).sort((a,b)=>b[0]-a[0]).map(a=>a[1]);
  const mini=(title,id,ctl,style='')=>`<div class="field minifield"><div class="tbar"><div><h4>${title}</h4></div></div><div class="view" id="sf-${id}"${style}></div><div class="minictl">${ctl}</div></div>`;
  root.innerHTML=`<div class="demo-head"><div><h3>${str.sfTitle}</h3></div></div><section class="sheet s2">
    ${mini(str.sfRegion,'a',opt('region',str.sfEnclose,'',true,'inline')+'<p id="sf-at"></p>')}
    ${mini(str.sfGrey,'b',`<label class="rng"><span>${str.sfSurround}</span><input type="range" id="sf-contrast" min="0" max="100" value="70" aria-label="${str.sfSurroundAria}"><output id="sf-co"></output></label>`+opt('join',str.sfJoin,'',false,'inline'),' style="padding:0 24px 16px"')}
    ${mini(str.sfCorners,'c',`<label class="rng"><span>${str.sfRadius}</span><input type="range" id="sf-radius" min="0" max="32" value="20" aria-label="${str.sfRadiusAria}"><output id="sf-ro"></output></label><label class="rng"><span>${str.sfInset}</span><input type="range" id="sf-inset" min="4" max="24" value="8" aria-label="${str.sfInsetAria}"><output id="sf-io"></output></label>`)}
    ${mini(str.sfAccent,'d',`<label class="rng"><span>${str.sfAccented}</span><input type="range" id="sf-accent" min="1" max="40" value="2" aria-label="${str.sfAccentedAria}"><output id="sf-ao"></output></label>`)}</section>`;
  function render(){
    const xs=[30,58,104,132,178,206,252,280]; let a='';
    if(st.region) [[1,2],[3,4],[5,6]].forEach(([i,j])=>{a+=R(xs[i]-17,22,xs[j]-xs[i]+34,46,'f-well',23);});
    xs.forEach(x=>{a+=`<circle cx="${x}" cy="45" r="9" class="f-ink"/>`;});
    $('#sf-a',root).innerHTML=`<svg viewBox="0 0 310 90" style="width:100%;max-width:380px;height:auto" role="img" aria-label="${str.sfDotsAria}">${a}</svg>`;
    $('#sf-at',root).textContent=st.region?str.sfRegionOn:str.sfRegionOff;
    const t=st.contrast/100,g=mix(G,G,0),dk=mix(G,DARK,t),lt=mix(G,LIGHT,t);
    $('#sf-b',root).innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;width:100%;min-height:152px;position:relative;border-radius:8px;overflow:hidden"><div style="background:${dk};display:flex;align-items:center;justify-content:center"><i style="width:56px;height:56px;border-radius:8px;background:${g};display:block"></i></div><div style="background:${lt};display:flex;align-items:center;justify-content:center"><i style="width:56px;height:56px;border-radius:8px;background:${g};display:block"></i></div>${st.join?`<i style="position:absolute;left:25%;right:25%;top:calc(50% - 10px);height:20px;background:${g};display:block"></i>`:''}</div>`;
    const r=st.radius,ins=st.inset,ri=Math.max(r-ins,0),box=(inner,lab)=>`<div style="display:flex;flex-direction:column;align-items:center;gap:8px"><div style="width:132px;height:96px;border-radius:${r}px;background:var(--sheet);padding:${ins}px;box-shadow:inset 0 0 0 1px var(--line)"><div style="width:100%;height:100%;border-radius:${inner}px;background:var(--field);box-shadow:0 0 0 1px var(--line2)"></div></div><span style="font-size:14px;font-weight:500;color:var(--ink3)">${lab}</span></div>`;
    $('#sf-c',root).innerHTML=`<div style="display:flex;gap:24px;flex-wrap:wrap;justify-content:center">${box(r,str.sfInner(int(r)))}${box(ri,str.sfCalc(int(r),int(ins),int(ri)))}</div>`;
    const on=new Set(rank.slice(0,st.accent)); let d='';
    for(let i=0;i<40;i++){const cx=(i%8)*30,cy=Math.floor(i/8)*26,h=6+vals[i]*16; d+=R(cx+4,cy+24-h,22,h,on.has(i)?'f-cob':'f-slate2',3);}
    $('#sf-d',root).innerHTML=`<svg viewBox="0 0 244 132" style="width:100%;max-width:340px;height:auto" role="img" aria-label="${str.sfBarsAria}">${d}</svg>`;
    $('#sf-ro',root).textContent=str.px(int(r)); $('#sf-io',root).textContent=str.px(int(ins)); $('#sf-ao',root).textContent=str.sfOf40(int(st.accent)); $('#sf-co',root).textContent=str.pct(int(st.contrast));
  }
  root.addEventListener('input',e=>{const id=e.target.id.slice(3); if(id in st){st[id]=+e.target.value;render();}});
  onOpt(root,(id,on)=>{st[id]=on;render();});
  render();
}

/* Rule 6: the same weeks coded by hue and by fill. */
function demoNotation(root){
  const st={mode:'fill',grey:false},P=BASELINE;
  root.innerHTML=`<div class="demo-head"><div><h3>${str.ntTitle}</h3><span class="hint">${str.ntHint}</span></div>
    <div class="demo-ctl">${segCtl('mode',[['hue',str.ntHue],['fill',str.ntFill]],'fill',str.ntAria)}${opt('grey',str.ntGrey,'',false,'inline')}</div></div>
    <section class="sheet s1"><div class="field"><div class="tbar"><div class="key" id="nt-key"></div></div><div id="nt-view" style="padding:0 0 10px"></div></div></section>
    <p class="status" id="nt-status" aria-live="polite"></p>`;
  const view=$('#nt-view',root),key=$('#nt-key',root),status=$('#nt-status',root);
  const k=(c,t)=>`<span><i style="background:${c}"></i>${t}</span>`;
  function render(){
    const VW=drawW(view);
    view.innerHTML=st.mode==='hue'?hueBars(P,VW):weekBars(P,VW,true);
    view.style.filter=key.style.filter=st.grey?'grayscale(1)':'';
    const kh=str.ntKeyHue,kf=str.ntKeyFill;
    key.innerHTML=st.mode==='hue'?k('var(--slate)',kh[0])+k('var(--hue-a)',kh[1])+k('var(--hue-b)',kh[2]):k('var(--slate)',kf[0])+k('var(--cobalt)',kf[1])+k('var(--ink)',kf[2]);
    status.innerHTML=st.mode==='hue'   // the boots run short in the week of DATES[6]
      ?(st.grey?str.ntHueGrey(DATES[6]):str.ntHueCol)
      :(st.grey?str.ntFillGrey(DATES[6]):str.ntFillCol);
    setSeg(root,'mode',st.mode);
  }
  root.addEventListener('click',e=>{const b=e.target.closest('[data-mode]'); if(b){st.mode=b.dataset.mode;render();}});
  onOpt(root,(id,on)=>{st[id]=on;render();});
  render(); watch(view,380,render);
}

/* Rule 7: sales and stock on one set of week columns, with rows that reorder. */
function demoAxis(root){
  const st={order:'listed'},P=BASELINE,idx=[0,1,2,3,4];
  const orders={listed:idx,cover:idx.slice().sort((a,b)=>P.rows[a].cover[0]-P.rows[b].cover[0]),close:idx.slice().sort((a,b)=>P.rows[a].close[4]-P.rows[b].close[4])};
  const say=str.axSay;
  root.innerHTML=`<div class="demo-head"><div><h3>${str.axTitle}</h3></div>
    <div class="demo-ctl"><span class="rng two"><span>${str.axOrder}</span>${segCtl('order',str.axOrders,'listed',str.axAria)}</span></div></div>
    <section class="sheet s1"><div class="field scroll"><div class="tbar"><div><h4>${str.wkTitle}</h4><span class="ctx">${str.wkCtx}</span></div>
      <div class="key"><span><i class="k-line"></i>${str.key4}</span><span><i style="background:var(--tint)"></i>${str.keyArriving}</span><span><i style="background:var(--ink)"></i>${str.keyLost}</span></div></div><div id="ax-view"></div></div></section>
    <p class="status" id="ax-status" aria-live="polite"></p>`;
  const view=$('#ax-view',root),status=$('#ax-status',root);
  function render(){
    view.innerHTML=weekly(P,Math.max(960,Math.floor(view.parentElement.clientWidth)),orders[st.order]);
    status.textContent=say[st.order]; setSeg(root,'order',st.order);
  }
  root.addEventListener('click',e=>{const b=e.target.closest('[data-order]'); if(b){st.order=b.dataset.order;render();}});
  wireWeekly(root); render(); watch(view.parentElement,960,render);
}

/* Rule 8: five table rules, each on its own switch. */
function demoTable(root){
  const st={furn:true,align:true,round:true,order:true,bars:true};
  const data=BASELINE.rows.map(r=>({n:r.name,dem:r.demandUnits,close:r.close[4],cover:r.cover[0],stock:r.openCost+r.receiptsCost}));
  const rules=str.tbRules;
  root.innerHTML=`<div class="demo-head"><div><h3>${str.tbTitle}</h3></div><div class="demo-ctl"><button class="btn" type="button" data-all="0">${str.allOff}</button><button class="btn" type="button" data-all="1">${str.allOn}</button></div></div>
    <section class="sheet stab"><div class="field opts" style="grid-template-columns:minmax(0,1fr)">${rules.map(r=>opt(r[0],r[1],r[2],true)).join('')}</div><div class="field tablebox" id="tb-view"></div></section>`;
  const view=$('#tb-view',root);
  function render(){
    const rows=data.slice().sort(st.order?(a,b)=>b.stock-a.stock:(a,b)=>a.n.localeCompare(b.n,str.locale)),mx=Math.max(...rows.map(r=>r.stock));
    const head=st.round?str.tbHeadRound:str.tbHeadRaw;
    const fmt=st.round?r=>[n0(r.dem),n0(r.close),fx(r.cover,0),fx(r.stock,1)]:r=>[str.tbUnits(fx(r.dem,2)),str.tbUnits(fx(r.close,2)),str.tbWeeks(fx(r.cover,2)),str.tbMoney(fx(r.stock,2))];
    view.innerHTML=`<table class="dt${st.furn?'':' furn'}${st.align?' num-r':''}"><thead><tr>${head.map((h,i)=>`<th${i?' class="n"':''} scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>{const f=fmt(r);return `<tr><th scope="row">${r.n}</th>${f.map((v,i)=>`<td class="n${i===3&&st.bars?' bar':''}">${v}${i===3&&st.bars?`<i style="width:${(r.stock/mx*80).toFixed(0)}px"></i>`:''}</td>`).join('')}</tr>`}).join('')}</tbody></table>`;
    $$('[data-opt]',root).forEach(o=>o.setAttribute('aria-checked',st[o.dataset.opt]));
  }
  onOpt(root,(id,on)=>{st[id]=on;render();});
  root.addEventListener('click',e=>{const b=e.target.closest('[data-all]'); if(b){rules.forEach(r=>{st[r[0]]=b.dataset.all==='1';});render();}});
  render();
}

/* Rule 9: bold laid over regular. Duplexed figures coincide. The table lets a row turn bold in place. */
function demoType(root){
  const st={face:'Instrument Sans',tnum:true,row:1},TXT='0123456789';
  const rows=LINES.map(p=>[p.name].concat(p.weekly.map(int)));
  root.innerHTML=`<div class="demo-head"><div><h3>${str.tyTitle}</h3><span class="hint">${str.tyHint}</span></div>
    <div class="demo-ctl">${segCtl('face',[['Instrument Sans','Instrument Sans'],['Geist','Geist'],['Archivo','Archivo']],'Instrument Sans',str.tyAria)}${opt('tnum',str.tyTnum,'',true,'inline')}</div></div>
    <section class="sheet s2"><div class="field typebox"><div class="specimen" id="ty-spec"><span class="r"></span><span class="b"></span></div><p id="ty-status" aria-live="polite"></p></div>
      <div class="field ty" id="ty-table" role="radiogroup" aria-label="${str.tyRowAria}"></div></section>`;
  const spec=$('#ty-spec',root),status=$('#ty-status',root),table=$('#ty-table',root);
  function render(){
    const fam=`'${st.face}',sans-serif`,num=st.tnum?'tabular-nums lining-nums':'proportional-nums lining-nums';
    $$('span',spec).forEach(e=>{e.textContent=TXT;e.style.fontFamily=fam;e.style.fontVariantNumeric=num;});
    $('.r',spec).style.fontWeight=400;
    const wr=$('.r',spec).getBoundingClientRect().width,wb=$('.b',spec).getBoundingClientRect().width,d=wb-wr;
    status.innerHTML=str.tyStatus(fx(wr,1),fx(wb,1))+(Math.abs(d)<0.3?str.tySame:str.tyShift(fx(Math.abs(d),1),d>0));
    table.innerHTML=`<div class="ty-head"><span></span>${DATES.slice(4).map(w=>`<span>${w}</span>`).join('')}</div>`+rows.map((r,i)=>`<button type="button" role="radio" class="ty-row" data-row="${i}" aria-checked="${i===st.row}" style="font-family:${fam};font-variant-numeric:${num}">${r.map(v=>`<span>${v}</span>`).join('')}</button>`).join('');
    setSeg(root,'face',st.face);
  }
  root.addEventListener('click',e=>{
    const f=e.target.closest('[data-face]'),r=e.target.closest('[data-row]');
    if(f){st.face=f.dataset.face;render();}
    else if(r){st.row=+r.dataset.row;$$('[data-row]',table).forEach(b=>b.setAttribute('aria-checked',String(+b.dataset.row===st.row)));}
  });
  onOpt(root,(id,on)=>{st[id]=on;render();});
  render();
  if(document.fonts&&document.fonts.load) Promise.all(['Instrument Sans','Geist','Archivo'].flatMap(f=>[document.fonts.load(`400 56px "${f}"`),document.fonts.load(`700 56px "${f}"`)])).then(render).catch(()=>{});
}

/* Rule 10: one illustrative distribution in three forms. Normal, mean 80 units, standard deviation 14. */
function demoUncertainty(root){
  const Z=[-1.95996,-1.43953,-1.15035,-0.93459,-0.75542,-0.59776,-0.45376,-0.31864,-0.18912,-0.06271,0.06271,0.18912,0.31864,0.45376,0.59776,0.75542,0.93459,1.15035,1.43953,1.95996];
  const M=80,SD=14,Q=Z.map(z=>M+SD*z),st={form:'dots',stock:95};
  root.innerHTML=`<div class="demo-head"><div><h3>${str.unTitle}</h3><span class="hint">${str.unHint}</span></div>
    <div class="demo-ctl">${segCtl('form',str.unForms,'dots',str.unAria)}</div></div>
    <section class="sheet s1"><div class="field"><div class="tbar ctl"><label class="rng"><span>${str.unInStock}</span><input type="range" id="un-s" min="50" max="115" step="5" value="95" aria-label="${str.unInStockAria}"><output id="un-so"></output></label></div><div id="un-view" class="pad"></div></div></section>
    <p class="status" id="un-status" aria-live="polite"></p>`;
  const view=$('#un-view',root),status=$('#un-status',root),so=$('#un-so',root);
  function render(){
    const VW=drawW(view),compact=VW<640,xl=compact?14:36,per=(VW-xl-18)/120,x=u=>xl+u*per,H=compact?176:212,base=H-32,r=Math.min(13,5*per/2-1.5); let s='',lab='';
    [0,20,40,60,80,100,120].forEach(v=>{s+=L(x(v),base,x(v),base+5,'l-a')+T(x(v),base+22,int(v),'t-tk','middle');});
    s+=L(x(0),base,x(120),base,'l-a');
    const over=Q.filter(q=>q>st.stock).length,a=M-1.645*SD,b=M+1.645*SD;
    if(st.form==='bar'){
      s+=hseg(x(0),base-76,x(M)-x(0),44,'f-cob',0,8);
      s+=L(x(a),base-54,x(b),base-54,'l-i','style="stroke:var(--field);stroke-width:5"')+L(x(a),base-54,x(b),base-54,'l-i')+L(x(a),base-64,x(a),base-44,'l-i')+L(x(b),base-64,x(b),base-44,'l-i');
      lab+=T(x(M),base-86,str.unExpected(int(M)),'t-v cob','middle');
    }else if(st.form==='bands'){
      s+=R(x(a),base-76,x(b)-x(a),44,'washfill',6)+R(x(M-0.6745*SD),base-76,x(M+0.6745*SD)-x(M-0.6745*SD),44,'f-tint')+L(x(M),base-82,x(M),base-26,'l-i');
      lab+=compact?T(x(a)-8,base-58,str.unBands9c,'t-lb ink','end',HALO)+T(x(a)-8,base-40,str.unHalfC,'t-lb ink','end',HALO)
        :T(x(a),base-88,str.unBands9,'t-lb ink','start',HALO)+T(x(M),base-8,str.unHalf,'t-lb ink','middle',HALO);
    }else{
      const stack={};
      Q.forEach(q=>{const bin=Math.floor(q/5)*5,j=stack[bin]=(stack[bin]||0)+1,o=q>st.stock;
        s+=`<circle cx="${p1(x(bin+2.5))}" cy="${p1(base-r-3-(j-1)*(2*r+3))}" r="${p1(r)}" class="${o?'o-cob':'f-cob'}"/>`;});
    }
    s+=L(x(st.stock),14,x(st.stock),base,'l-i')+lab+T(x(st.stock)+(st.stock>100?-8:8),26,str.unStock(int(st.stock)),'t-v',st.stock>100?'end':'start');
    view.innerHTML=S(VW,H,s,str.unPlotAria,true);
    so.textContent=str.unUnits(int(st.stock));
    status.innerHTML=st.form==='dots'?str.unDots(int(over))
      :st.form==='bar'?str.unBar(int(st.stock))
      :str.unBands(int(st.stock),st.stock>103?str.unBeyond:st.stock<57?str.unBelow:str.unInside);
    setSeg(root,'form',st.form);
  }
  root.addEventListener('click',e=>{const b=e.target.closest('[data-form]'); if(b){st.form=b.dataset.form;render();}});
  root.addEventListener('input',e=>{if(e.target.id==='un-s'){st.stock=+e.target.value;render();}});
  render(); watch(view,380,render);
}

/* Rule 11: the control is the point on the plot. */
function demoControl(root){
  const def={depth:20,units:60},st={...def};
  root.innerHTML=`<div class="demo-head"><div><h3>${str.mdTitle}</h3><span class="hint">${str.mdCtx}</span></div><button class="btn" type="button" id="ct-reset">${str.resetExample}</button></div>
    <section class="sheet s32"><div class="field"><div class="md" style="padding-top:16px"><div id="ct-plot" class="mdplot"></div></div></div><div class="field"><div class="pairs quad" id="ct-cmp"></div></div></section>
    <p class="status" id="ct-status" aria-live="polite"></p>`;
  const plot=$('#ct-plot',root),cmp=$('#ct-cmp',root),status=$('#ct-status',root);
  function render(){
    const m=markdown(st.depth,st.units),diff=m.grossProfit-m.baseProfit,can=isFinite(m.parityUnits);
    plot.innerHTML=markdownPlot(st.depth,st.units,Math.max(260,Math.floor(plot.clientWidth)));
    const off=str.pct(int(st.depth)),base=int(m.baseUnits);
    cmp.innerHTML=`<div><b>${f1(m.baseProfit)}</b><span>${str.ctFull(base)}</span></div><div><b class="cob">${f1(m.grossProfit)}</b><span>${str.ctOff(int(st.units),off)}</span></div>
      <div><b>${sg(diff)||f1(0)}</b><span>${str.pDiff}</span></div><div><b>${can?n0(m.parityUnits):'—'}</b><span>${str.ctMatch}</span></div>`;
    status.innerHTML=str.ctMake(int(st.units),off,f1(m.grossProfit))+(diff>0.049?str.ctBeats(f1(m.baseProfit),base):diff>-0.05?str.ctMatches(f1(m.baseProfit),base)
      :str.ctShort(f1(-diff),f1(m.baseProfit),base)+(m.parityUnits<=m.onHand?str.ctWould(n0(m.parityUnits)):str.ctMore(n0(m.parityUnits),int(m.onHand))));
  }
  wireMarkdown(root,'#ct-plot',()=>st,(d,u)=>{st.depth=d;st.units=u;render();});
  $('#ct-reset',root).addEventListener('click',()=>{Object.assign(st,def);render();});
  render(); watch(plot,260,render);
}

/* The system: the example's cards and open-to-buy sheet, restyled by three tokens. */
const ACCENTS={cobalt:[str.accents.cobalt,'#2146D6','#A9B9F2','#E8EDFC'],teal:[str.accents.teal,'#0F6F73','#9CCDCE','#E2F1F1'],violet:[str.accents.violet,'#5A3FD0','#BDB3F1','#EDEAFC']};
const hex=c=>'#'+c.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('').toUpperCase();
const tone=(base,t)=>hex(base.map(v=>Math.max(0,255-(255-v)*t)));
const tokensOf=st=>{const t=st.depth/100,a=ACCENTS[st.accent];
  return {ground:tone([227,231,237],t),sheet:tone([241,243,247],t),well:tone([220,225,233],t),cobalt:a[1],tint:a[2],wash:a[3],r:st.radius,ri:Math.max(st.radius-8,0)};};
const tokensText=k=>`:root {
  /* ${str.tok.surfaces} */
  --ground: ${k.ground};  --sheet: ${k.sheet};  --field: #FFFFFF;  --well: ${k.well};
  /* ${str.tok.ink} */
  --ink: #121923;  --ink2: #414B59;  --ink3: #5D6776;
  --line: #E1E5EB;  --line2: #98A2B1;
  /* ${str.tok.marks} */
  --slate: #5A6676;  --slate2: #B7BFCA;
  --cobalt: ${k.cobalt};  --tint: ${k.tint};  --wash: ${k.wash};
  /* ${str.tok.radii} */
  --r-sheet: ${k.r}px;  --inset: 8px;  --r-field: ${k.ri}px;
  --font: "Instrument Sans", system-ui, sans-serif;
}
body    { font: 500 15px/22px var(--font);
          font-variant-numeric: tabular-nums lining-nums; }
.sheet  { display: grid; gap: var(--inset); padding: var(--inset);
          border-radius: var(--r-sheet); background: var(--sheet); }
.field  { border-radius: var(--r-field); background: var(--field); }
.value  { font: 600 48px/52px var(--font); letter-spacing: -.03em;
          color: var(--cobalt); }
.label  { font: 500 14px/20px var(--font); color: var(--ink3); }
.rail   { display: flex; gap: 3px; height: 12px; }
.rail i { border-radius: 6px; }`;
function demoTune(root){
  const def={accent:'cobalt',depth:100,radius:20},st={...def},pre=$('#tokens'),P=BASELINE;
  root.innerHTML=`<div class="demo-head"><div><h3>${str.tnTitle}</h3><span class="hint">${str.tnHint}</span></div><button class="btn" type="button" id="tn-reset">${str.resetExample}</button></div>
    <div class="tune"><span class="rng two" style="justify-content:start"><span>${str.tnAccent}</span>${segCtl('accent',Object.entries(ACCENTS).map(([k,v])=>[k,v[0]]),'cobalt',str.tnAccent)}</span>
      <label class="rng"><span>${str.tnDepth}</span><input type="range" id="tn-depth" min="0" max="160" step="5" value="100" aria-label="${str.tnDepthAria}"><output id="tn-deptho"></output></label>
      <label class="rng"><span>${str.tnRadius}</span><input type="range" id="tn-radius" min="0" max="28" step="1" value="20" aria-label="${str.tnRadiusAria}"><output id="tn-radiuso"></output></label></div>
    <section class="sheet k4" aria-label="${str.ariaKey}">${cardsHTML(P)}</section>
    <section class="sheet s32"><div class="field"><div class="tbar"><div><h4>${str.otb}</h4><span class="ctx">${str.atCost}</span></div></div><div id="tn-bridge" style="padding-bottom:8px"></div></div>
      <div class="field"><div class="tbar"><div><h4>${str.svTitle}</h4><span class="ctx">${str.atCost}</span></div><div class="key"><span><i style="background:var(--slate)"></i>${str.keyInStock}</span><span><i style="background:var(--tint)"></i>${str.keyOnOrder}</span></div></div><div id="tn-stock" style="padding-bottom:8px"></div></div></section>
    <p class="status" id="tn-status" aria-live="polite"></p>`;
  const status=$('#tn-status',root),bEl=$('#tn-bridge',root),sEl=$('#tn-stock',root);
  function charts(){const bw=drawW(bEl,360); bEl.innerHTML=bridge(bridgeOf(P),bw,{compact:bw<520,fluid:true}); sEl.innerHTML=stockValue(P,drawW(sEl,300));}
  function apply(){
    const k=tokensOf(st);
    Object.entries({'--ground':k.ground,'--sheet':k.sheet,'--well':k.well,'--cobalt':k.cobalt,'--tint':k.tint,'--wash':k.wash,'--r-sheet':k.r+'px','--r-field':k.ri+'px'}).forEach(([n,v])=>root.style.setProperty(n,v));
    if(pre) pre.textContent=tokensText(k);
    $('#tn-deptho',root).textContent=str.pct(int(st.depth)); $('#tn-radiuso',root).textContent=str.px(int(st.radius));
    setSeg(root,'accent',st.accent);
    const notes=[];
    if(st.depth<=30) notes.push(str.tnPale);
    else if(st.depth>=135) notes.push(str.tnDeep);
    if(st.radius<8) notes.push(str.tnSharp);
    const isDef=Object.keys(def).every(n=>st[n]===def[n]);
    status.innerHTML=str.tnStatus(ACCENTS[st.accent][0],str.pct(int(st.depth)),str.px(int(st.radius)),str.px(int(k.ri)))+(isDef?str.tnDefault:notes.join(' '));
  }
  root.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.accent){st.accent=b.dataset.accent;apply();}
    else if(b.id==='tn-reset'){Object.assign(st,def);$('#tn-depth',root).value=st.depth;$('#tn-radius',root).value=st.radius;apply();}
  });
  root.addEventListener('input',e=>{const n=e.target.id.slice(3); if(n==='depth'||n==='radius'){st[n]=+e.target.value;apply();}});
  charts(); apply(); watch(root,300,charts);
}

/* ================= the people =================
   Who the rules come from. The page provides them in window.GUIDE_DATA (see README.md):
   people: [{id, g, y, n, l, w, u, r, d}], g = body of work, y = year of the work this guide draws on (it places the mark
   on the time axis), r = rules that use it; groups: [[name, short name, description]]; sources: [{g, st, who, work, url, take}].
   links (optional): {rule:'#r{n}', works:'#works'}, for chapter pages where a rule lives on another page. */
let GROUPS=[],PEOPLE=[],SOURCES=[],LINKS={},RULES={};
function readData(){
  const d=window.GUIDE_DATA||{},arr=v=>Array.isArray(v)?v:[];
  GROUPS=arr(d.groups); PEOPLE=arr(d.people); SOURCES=arr(d.sources); LINKS=d.links||{}; RULES=d.rules||{};
}
const ruleHref=n=>{const h=LINKS.rule||'#r{n}'; return typeof h==='function'?h(n):String(h).replace('{n}',n);};
const groupLabel=i=>str.groupLabels[i]||(GROUPS[i]&&GROUPS[i][1])||'';   // the six rows of the time axis
const groupName=i=>(GROUPS[i]&&GROUPS[i][0])||str.groupLabels[i]||'';
const ruleLinks=p=>(p.r||[]).length?str.ruleLinks(p.r.map(n=>`<a href="${ruleHref(n)}">${n}</a>`)):`<a href="${LINKS.works||'#works'}">${str.worksLink}</a>`;

/* The people on one time axis, six rows, each drawn as a face (or initials where no free photograph exists).
   Two works predate 1900 and sit in their own column, with their years printed. */
function demoPeople(root){
  const order=PEOPLE.slice().sort((a,b)=>a.y-b.y||a.n.localeCompare(b.n,str.locale));
  const first=['gerstner','few','tufte'].map(id=>PEOPLE.find(p=>p.id===id)).filter(Boolean),st={id:(first.find(p=>p.img)||first[0]||order[0]||{}).id};
  const NG=GROUPS.length||str.groupLabels.length;
  // A team is shown by its first member: their photograph, or their first and last initials.
  const ini=p=>{const w=p.n.split(str.ppSplit)[0].trim().split(/\s+/).filter(x=>/^[A-ZÀ-Ý]/.test(x));return w.length?w[0][0]+(w.length>1?w[w.length-1][0]:''):p.n.slice(0,2);};
  root.innerHTML=`<div class="demo-head"><div><h3>${str.ppTitle}</h3><span class="hint">${str.ppHint}</span></div>
      <div class="demo-ctl"><button class="btn" type="button" data-step="-1">${str.earlier}</button><button class="btn" type="button" data-step="1">${str.later}</button></div></div>
    <section class="sheet s1"><div class="field scroll"><div id="pp-view"></div></div><div class="field who" id="pp-card" aria-live="polite"></div></section>`;
  const view=$('#pp-view',root),card=$('#pp-card',root);
  function render(focus){
    const sc=view.parentElement,cw=Math.floor(sc.clientWidth),narrow=cw>0&&cw<700,W=Math.max(820,cw),LW=narrow?124:212,PRE=92,X0=LW+PRE+20,X1=W-32,TOP=22,FR=15,GAP=32;
    const x=y=>X0+(y-1900)/130*(X1-X0);
    // Faces are 30 px across. One that would overlap the face before it moves up or down a level, and a crowded row grows taller.
    const LV=[0,-GAP,GAP,-2*GAP,2*GAP];
    const lanes=Array.from({length:NG},(_,i)=>{
      const last=LV.map(()=>-1e9); let pre=0,reach=0;
      const marks=order.filter(p=>p.g===i).map(p=>{
        const px=p.y<1900?LW+24+(pre++)*36:x(p.y); let k=last.findIndex(q=>px-q>=GAP); if(k<0) k=last.indexOf(Math.min(...last));
        last[k]=px; reach=Math.max(reach,Math.abs(LV[k])); return {p,px,off:LV[k]};
      });
      return {marks,h:Math.max(64,2*(reach+FR)+22)};
    });
    const tops=[]; let yy=TOP; lanes.forEach(l=>{tops.push(yy); yy+=l.h;});
    const BOT=yy,H=BOT+34; let s='',sel='',selX=0;
    s+=T(LW+PRE/2,14,str.before1900,'t-tk','middle')+L(LW+PRE+6,TOP-4,LW+PRE+6,BOT,'l-d');
    for(let y=1900;y<=2020;y+=20) s+=L(x(y),TOP-4,x(y),BOT,'l-g')+T(x(y),H-10,y,'t-tk','middle');   // years print as they are
    lanes.forEach((ln,i)=>{
      const cy=tops[i]+ln.h/2;
      s+=L(0,tops[i],X1,tops[i],'l-g');
      ln.marks.forEach(({p,px,off})=>{
        const py=cy+off,on=p.id===st.id,r=on?21:FR;
        if(p.y<1900) s+=T(px,H-10,p.y,'t-tk','middle');
        const face=p.img
          ?`<clipPath id="ppc-${p.id}"><circle r="${r}"/></clipPath><image href="${p.img}" x="${-r}" y="${-r}" width="${2*r}" height="${2*r}" clip-path="url(#ppc-${p.id})" preserveAspectRatio="xMidYMid slice"/>`
          :`<circle r="${r}" class="nf"/><text class="t-ini" y="${on?5:4}" text-anchor="middle">${ini(p)}</text>`;
        const mark=`<g class="pm${on?' on':''}" data-p="${p.id}" tabindex="0" role="button" aria-pressed="${on}" aria-label="${p.n}, ${p.w}" transform="translate(${p1(px)},${p1(py)})"><circle r="${r+5}" class="hit"/>${face}<circle r="${r}" class="ring"/></g>`;
        if(on){const name=`${p.n.split(str.ppSplit)[0]} · ${p.y}`,tw=name.length*7.7+22,tx=Math.min(Math.max(px,LW+tw/2),X1-tw/2),ty=py-r-34<2?py+r+8:py-r-34;
          selX=px; sel=mark+R(tx-tw/2,ty,tw,26,'tag',8)+T(tx,ty+17.5,name,'t-n','middle');}
        else s+=mark;
      });
    });
    s+=L(0,BOT,X1,BOT,'l-a')+sel;
    // The row names stay in view when the plot scrolls sideways on a narrow screen.
    view.innerHTML=`<div class="pp-wrap" style="width:${W}px"><div class="pp-lab${narrow?' narrow':''}" style="width:${LW}px;height:${H}px">${lanes.map((l,i)=>`<span style="top:${tops[i]}px;height:${l.h}px">${groupLabel(i)}</span>`).join('')}</div>${S(W,H,s,str.ppAria)}</div>`;
    if(sc.scrollWidth>sc.clientWidth+1) sc.scrollLeft=Math.max(0,selX-LW-(sc.clientWidth-LW)/2);
    const p=PEOPLE.find(q=>q.id===st.id),prof=p&&document.getElementById('p-'+p.id);
    // The card: who they were and one project on the left, what to learn from them and the rule it serves on the right.
    const ru=(p&&p.r||[])[0],pr=p&&p.pr;
    card.innerHTML=p?`<div class="who-grid"><div class="who-id"><span class="who-ph">${p.img?`<img src="${p.img}" alt="" width="96" height="96">`:`<i>${ini(p)}</i>`}</span><div class="who-main"><div class="who-top"><b>${p.n}</b><span>${p.l}</span></div>${pr?`<div class="who-pr"><span>${pr.year}</span><div><b>${pr.title}</b><p>${pr.what}</p></div></div>`:`<p>${p.d}</p>`}</div></div>${p.learn?`<div class="who-learn"><span class="kicker">${str.ppLearn}</span><p>${p.learn}</p>${ru&&RULES[ru]?`<a href="${ruleHref(ru)}">${str.ppRule(ru,RULES[ru])}</a>`:''}</div>`:''}</div><div class="who-foot"><a href="${p.u}">${p.w}</a><span>${groupName(p.g)} · ${ruleLinks(p)}${prof?` · <a class="who-more" href="#p-${p.id}">${str.ppProfile}</a>`:''}</span></div>`:'';
    if(focus){const m=$(`[data-p="${st.id}"]`,view); if(m) m.focus({preventScroll:true});}
  }
  const step=d=>{if(!order.length) return; const i=order.findIndex(p=>p.id===st.id); st.id=order[(i+d+order.length)%order.length].id;};
  root.addEventListener('click',e=>{
    const m=e.target.closest('[data-p]'),b=e.target.closest('[data-step]');
    if(m){st.id=m.dataset.p;render(true);} else if(b){step(+b.dataset.step);render(false);}
  });
  root.addEventListener('keydown',e=>{
    const m=e.target.closest&&e.target.closest('[data-p]'); if(!m) return;
    if(e.key==='Enter'||e.key===' '){e.preventDefault();st.id=m.dataset.p;render(true);}
    else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();st.id=m.dataset.p;step(e.key==='ArrowRight'?1:-1);render(true);}
  });
  render(false); watch(view.parentElement,820,()=>render(false));
}
function peopleList(){
  return GROUPS.map((g,gi)=>`<h3 class="group">${g[0]}</h3><p class="gdesc">${g[2]}</p><ul class="people">${PEOPLE.filter(p=>p.g===gi).sort((a,b)=>a.y-b.y).map(p=>`<li id="p-${p.id}"><b>${p.n}</b><span class="life">${p.l}</span><p>${p.d}</p><span class="to"><a href="${p.u}">${p.w}</a> · ${ruleLinks(p)}</span></li>`).join('')}</ul>`).join('');
}

/* Rule 12: the words of the plan, each computed from the example's own numbers. */
function demoTerms(root){
  const B=BASELINE,boots=B.rows[1],GMROI={profit:260,stock:230,weeks:13},st={id:'lost'};
  // The numbers each term prints, formatted once; the words are in str.terms.
  const v={demand:f1(B.demand),lost:f1(B.unfilled),lostUnits:n0(B.unfilledUnits),price:int(boots.price),week:DATES[6],open:n0(boots.open),mean:n0(boots.mean),
    cogs:f1(B.cogs),target:f1(TARGET),openCost:f1(B.openCost),receipts:f1(B.receiptsCost),served:f1(B.served),margin:pc(B.margin),
    sold:n0(boots.prev),avail:n0(boots.open+boots.prev),gp:int(GMROI.profit),stock:int(GMROI.stock),weeks:int(GMROI.weeks)};
  const VAL={demand:f1(B.demand),sales:f1(B.served),lost:f1(B.unfilled),weeks:wk(boots.cover[0]),otb:f1(B.openToBuy),gp:f1(B.grossProfit),
    st:pc(boots.prev/(boots.open+boots.prev),0),gmroi:fx(GMROI.profit/GMROI.stock,2)};
  const TERMS=['demand','sales','lost','weeks','otb','gp','st','gmroi'].map(id=>{const t=str.terms[id];
    return {id,name:t.name,title:t.title||t.name,val:VAL[id],unit:typeof t.unit==='function'?t.unit(v):t.unit,ink:id==='lost',aka:t.aka,calc:t.calc(v),def:t.def};});
  root.innerHTML=`<div class="demo-head"><div><h3>${str.tmTitle}</h3><span class="hint">${str.tmHint}</span></div></div>
    <section class="sheet stab"><div class="field picks" role="radiogroup" aria-label="${str.tmAria}">${TERMS.map(t=>`<button type="button" class="pick" role="radio" data-term="${t.id}" aria-checked="${t.id===st.id}">${t.name}</button>`).join('')}</div>
      <div class="field inst term" id="tm-card" aria-live="polite"></div></section>`;
  const card=$('#tm-card',root);
  function render(){
    const t=TERMS.find(q=>q.id===st.id);
    card.className='field inst term'+(t.ink?' ink':'');
    card.innerHTML=`<div class="top"><b>${t.title}</b><span>${str.termAka(t.aka)}</span></div><div class="val"><b>${t.val}</b><span>${t.unit}</span></div><p class="calc">${t.calc}</p><p class="def">${t.def}</p>`;
    setSeg(root,'term',st.id);
  }
  root.addEventListener('click',e=>{const b=e.target.closest('[data-term]'); if(b){st.id=b.dataset.term;render();}});
  render();
}


/* the marks, as a legend under rule 6 */
function figNote(){
  const it=[
   'background:var(--slate)',
   'background:var(--cobalt)',
   'background:var(--tint)',
   'border:1.5px dashed var(--cobalt);background:var(--wash)',
   'background:var(--ink)',
   'height:0;margin-top:1px;border-top:1.5px dashed var(--line2);border-radius:0',
   'background:linear-gradient(90deg,var(--well) 0 62%,var(--ink) 62% 69%,var(--well) 69%);height:12px;border-radius:6px',
   'background:var(--field);box-shadow:0 1px 2px rgba(18,25,35,.25),0 0 0 1px rgba(18,25,35,.06)'];
  return it.map((a,i)=>`<div><i style="${a}"></i><span><b>${str.legend[i][0]}</b>${str.legend[i][1]}</span></div>`).join('');
}

/* sources, from GUIDE_DATA.sources */
function srcList(){
  if(!SOURCES.length) return '';
  let h='',g=null;
  SOURCES.forEach(r=>{
    if(r.g!==g){ if(g!==null) h+='</ul>'; g=r.g; h+=`<h3 class="group">${g}</h3><ul class="refs">`; }
    h+=`<li>${r.st==='k'?`<span title="${str.notChecked}">○ </span>`:''}<b>${r.who}</b> · ${r.url?`<a href="${r.url}">${r.work}</a>`:r.work}${r.take?`<p>${r.take}</p>`:''}</li>`;
  });
  return h+'</ul>';
}

/* ================= mount =================
   Each part is drawn only when its root is on the page, since a chapter page carries only some of the figures.
   mount() runs once the document is parsed, and can run again for roots added later: it skips what it has drawn. */
const ok=(a,b)=>Math.abs(a-b)<0.05,EARLY=plan({boots:true});
const good=ok(BASELINE.served,276.8)&&ok(BASELINE.grossProfit,120.8)&&ok(BASELINE.openToBuy,57.0)&&ok(EARLY.served,294.4)&&ok(EARLY.grossProfit,128.8)&&ok(EARLY.openToBuy,66.6);
const FIGURES=[['#board',mountExample],['#demo-people',demoPeople],['#demo-terms',demoTerms],['#demo-programme',demoProgramme],['#demo-instrument',demoInstrument],['#demo-xmr',demoXmr],['#demo-bridge',demoBridge],['#demo-surfaces',demoSurfaces],['#demo-notation',demoNotation],['#demo-axis',demoAxis],['#demo-table',demoTable],['#demo-type',demoType],['#demo-uncertainty',demoUncertainty],['#demo-control',demoControl],['#demo-tune',demoTune]];
const drawn=new WeakSet();
const first=el=>!!el&&!drawn.has(el)&&!!drawn.add(el);
let observing=false;
function mount(){
  readData();
  const rc=$('#recon');
  if(first(rc)) rc.innerHTML=good?str.recon(f1(BASELINE.served),f1(BASELINE.grossProfit),f1(BASELINE.openToBuy),f1(EARLY.served),f1(EARLY.grossProfit),f1(EARLY.openToBuy)):str.reconFail;
  FIGURES.forEach(([sel,fn])=>{const el=$(sel); if(!first(el)) return; try{fn(el);}catch(err){el.innerHTML=`<p class="status">${str.figFail}</p>`;console.error(sel,err);}});
  const note=$('#fig-note'); if(first(note)) note.innerHTML=figNote();
  const g=$('#grid-toggle'),lay=$('#gridlay'); if(lay&&first(g)) g.addEventListener('click',()=>{const on=g.getAttribute('aria-checked')!=='true'; g.setAttribute('aria-checked',on); lay.hidden=!on;});
  const pl=$('#people-list'); if(first(pl)) pl.innerHTML=peopleList();
  const sl=$('#srclist'); if(first(sl)) sl.innerHTML=srcList();
  const cb=$('#copy-tokens');
  if(first(cb)){const label=cb.textContent||str.copyTokens;
    cb.addEventListener('click',()=>{const t=($('#tokens')||{}).textContent||'',done=ok=>{cb.textContent=ok?str.copied:str.copyFail;setTimeout(()=>{cb.textContent=label;},1800);};
      if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(()=>done(true),()=>done(false)); else done(false);});}
  if(!observing&&document.body){observing=true;
    let raf=0;new ResizeObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>redraw.forEach(f=>f()));}).observe(document.body);
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>redraw.forEach(f=>f(true)));}
}
window.__guide={plan,BASELINE,EARLY,markdown,LANG,STR,mount};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
})();
