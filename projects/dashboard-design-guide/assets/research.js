/* Learn dashboard design with me: the figures of the chapter "What neighbouring fields know".
   A plain browser script, no build step and no modules. It needs nothing from guide.js and can sit beside it.
   It reads the page language from <html lang> ('en' by default, 'fr' for French) and draws each figure whose root,
   an empty <div class="stage" id="fig-…">, is on the page: F0 (the chapter's sources on one time axis) and F1 to F8.
   Every visible string is in STR. The computed figures carry their own model of the guide's sample plan.

   Data the page provides:
   window.GUIDE_DATA.research   = {overview, fields, typeTest}
       overview  research.json overview_points: [{field, year (null when undated), label}]
       fields    [{id, title}] in the chapter's order, titles in the page language
       typeTest  research.json type_test: {faces, results:[{face, zero_400, zero_700, pass_zero, pass_digits,
                 pass_minus, pass_point}], recheck:{rows:[{face, digits_400, digits_700, minus, point, percent}]}}
   window.GUIDE_DATA.figureData = figure-data.json, of which these figures read:
       A.values.rows[]   Heer and Bostock (2010), Figure 4: {type:'T1'…'T9', heer_bostock_mturk:{mean_log2_error,
                         ci95_low, ci95_high}, cleveland_mcgill_1984:{same}|null}                         → F5
       B.values.accuracy_by_size_quartile_fig2.rows[]   Fildes et al. (2009), Figure 2:
                         {group, size_quartile, direction:'positive'|'negative', median_FCIMP_pct_points}  → F3b
       C.values.clusters[]   Sarikaya et al. (2019), Table 1: {name, goal_group, n}                         → F7
       D.values.groups_final_version[]   Bach et al. (2023), Figure 1: {level, group, patterns:[{name,
                         pct_of_dashboards (a number, or 'explicit/with implicit' as '41/69')}]},
                         with D.values.dashboards_analysed and D.values.patterns_stated_in_text            → F7
   A figure whose published values are missing says so in its own stage and draws nothing else. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

/* ================= words =================
   French follows French typographic usage: a decimal comma, a narrow no-break space (U+202F) between thousands and
   before % : ; ? !, a no-break space (U+00A0) inside a date and before a unit. Sentences that carry numbers are
   functions and receive the numbers already formatted. */
const NN=' ',NB=' ';
const STR={
en:{
  locale:'en-CA',dateLocale:'en-US',pc:'%',K:'$K',money:v=>'$'+v,and:'and',
  list:a=>a.length<3?a.join(' and '):a.slice(0,-1).join(', ')+' and '+a[a.length-1],
  figFail:'This figure could not be drawn.',
  noData:'The data for this figure is not on the page yet.',
  lines:{jackets:['Jackets','jackets'],boots:['Boots','boots'],layers:['Base layers','base layers'],packs:['Packs','packs'],tents:['Tents','tents']},
  // F0: the sources on one time axis
  f0Title:'Sources by year',f0Hint:'select a field or a mark',earlier:'Earlier',later:'Later',allFields:'All fields',f0FieldAria:'Field',
  before:y=>`before ${y}`,undated:'undated',
  f0Short:{forecasts:'Forecasts',notation:'Business notation',retail:'Retail planning',tables:'Tables',perception:'Perception',operators:'Operators’ displays',dashboards:'Dashboards',type:'Type'},
  f0Aria:(n,f,a,b)=>`${n} sources on a time axis from ${a} to ${b}, in ${f} fields`,
  f0Dot:(l,y,f)=>`${l}, ${y}, ${f}`,
  f0All:(n,f,a,b,m,u)=>`<b>${n} sources in ${f} fields, from ${a} to ${b}.</b> Half of them date from ${m} or later.`+(u?` ${u} ${u>1?'are':'is'} undated.`:''),
  f0Field:(t,n,a,b,m)=>n>1?`<b>${t}: ${n} sources, from ${a} to ${b}.</b> Half of them date from ${m} or later.`:n===1?`<b>${t}: one source, from ${a}.</b>`:`<b>${t}: no dated source.</b>`,
  f0Pick:(l,y,t,n)=>`<b>${l}, ${y}.</b> ${t}, one of ${n} source${n>1?'s':''} in this field.`,
  // F1
  f1Title:'Four drawings',f1Hint:'illustrative demand for base layers, week of 19 October, units',
  f1Stock:'Stock',f1StockAria:'Units in stock',f1Units:n=>`${n} units`,f1Fifty:'Fifty dots',
  f1Names:{int:'90% interval',den:'Density',dot:'Quantile dotplot',cdf:'Cumulative curve'},
  f1Ctx:{int:'5th to 95th percentile',den:'area above the stock filled',dot:'one dot per equally likely outcome',cdf:'chance that demand exceeds x'},
  f1InStock:n=>`${n} in stock`,f1Median:n=>`median ${n}`,
  f1Read:{inside:['5% to 95%','all the interval can say: the stock lies inside it'],above:['under 5%','the stock lies above the interval'],below:['over 95%','the stock lies below the interval'],
    den:'of the area lies above the stock, to be judged by eye',dot:'dots lie above the stock',cdf:'read off the curve at the stock'},
  f1Count:(k,n)=>`${k} of ${n}`,
  f1Where:{inside:'inside it',above:'above it',below:'below it'},
  f1Status:(st,p,k,n,w)=>`<b>At ${st} units, demand exceeds the stock ${p} of the time.</b> The dotplot counts ${k} of ${n}, the curve reads ${p}, and the interval says only that ${st} lies ${w}.`,
  f1Aria:{int:(a,b,m,st)=>`A 90% interval of demand from ${a} to ${b} units, median ${m}, against a stock of ${st}`,
    den:(st,p)=>`The density of demand, with the ${p} of its area above a stock of ${st} filled`,
    dot:(n,k,st)=>`${n} quantile dots of demand; ${k} lie above a stock of ${st}`,
    cdf:(st,p)=>`The chance that demand exceeds each level; ${p} at a stock of ${st}`},
  // F2a
  f2aTitle:'Four scenarios',f2aHint:'sales by week, $K',f2aGrey:'Remove colour',
  f2aKey:['Actual','Forecast','Budget, illustrative','Previous year, illustrative'],f2aActual:'Actual',f2aForecast:'Forecast',
  f2aAria:'Sales by week in thousands of dollars: actual, forecast, an illustrative budget and an illustrative previous year',
  f2aStatus:(ac,b1,p1,fc,b2,p2)=>`<b>The four sold weeks: actual ${ac} against a budget of ${b1}, and ${p1} a year earlier.</b> The four weeks ahead: forecast ${fc} against a budget of ${b2}, and ${p2} a year earlier.`,
  f2aGreyStatus:(fc,b2)=>`<b>Without colour, the fills still keep the four apart:</b> solid actual, hatched forecast, outlined budget, light grey previous year. The weeks ahead still read as a forecast of ${fc} against a budget of ${b2}.`,
  // F2b
  f2bTitle:'What moves gross profit',f2bHint:'$K over four weeks, one driver at a time',f2bAria:'Ranges',
  f2bSets:[['ten','Every driver ±10%'],['real','Demand ±30%, price ±5%, cost ±3%']],
  f2bKey:['lowers gross profit','raises gross profit'],f2bCtx:v=>`change from ${v}`,
  drivers:{price:'price',cost:'unit cost',demand:'demand'},
  f2bPhrase:{price:n=>`the price of ${n}`,cost:n=>`the unit cost of ${n}`,demand:n=>`demand for ${n}`},
  f2bBase:v=>`gross profit ${v}`,
  f2bSvgAria:(b,set)=>`Tornado diagram: the change in gross profit from ${b} when each of fifteen drivers moves ${set}, sorted by swing`,
  f2bTop:(ph,lo,hi)=>`<b>${ph} moves gross profit most, from ${lo} to ${hi}.</b> `,
  f2bFirst:n=>`Prices and costs take the first ${['','one','two','three','four','five','six','seven','eight','nine'][n]||n} places. `,
  f2bCap:(ph,v)=>`${ph} can only lower it, by up to ${v}, because the plan already sells every unit in stock.`,
  // F3a
  f3aTitle:'Four kinds of demand',f3aHint:'illustrative series, 26 weeks',f3aAria:'Demand class',
  classes:{smooth:'Smooth',erratic:'Erratic',intermittent:'Intermittent',lumpy:'Lumpy',sample:'The sample'},
  f3aPlot:'Interval and variation',f3aPlotCtx:'average weeks between sales, ADI · squared variation of sale sizes, CV²',
  f3aSeries:'The four series',f3aSeriesCtx:'weekly units, 26 weeks',
  f3aSample:'the sample’s five lines',f3aStats:(a,c)=>`ADI ${a} · CV² ${c}`,f3aMax:m=>`max ${m}`,
  f3aStatus:(nm,k,a,lo,hi,c,a1,c1)=>`<b>${nm}: a sale in ${k} of 26 weeks, so ADI ${a}; sales of ${lo} to ${hi} units, so CV² ${c}.</b> `+(a1===c1?`${a1?'Over':'Under'} both cut-offs, 1.32 on timing and 0.49 on size.`:`${a1?'Over':'Under'} the 1.32 cut-off on timing, ${c1?'over':'under'} the 0.49 cut-off on size.`),
  f3aSampleStatus:(lo,loN,hi,hiN)=>`<b>The sample’s five lines sell every week, so ADI 1.00, with CV² from ${lo} for ${loN} to ${hi} for ${hiN}.</b> All five plot in the smooth corner, over the four weeks the sample has.`,
  f3aSvgAria:'Four illustrative demand series and the sample’s five lines placed by ADI and CV², with the cut-offs at 1.32 and 0.49',
  f3aSeriesAria:(nm,k)=>`${nm}: 26 weeks, a sale in ${k} of them`,
  f3aKH:'Kostenko and Hyndman’s diagonal',
  f3aKHStatus:(nm,above,ln)=>`<b>${nm} lies ${above?'above':'below'} Kostenko and Hyndman’s diagonal, ${ln}.</b> Above the diagonal, they prefer the Syntetos–Boylan approximation; it replaces both cut-offs with one line.`,
  f3aKHSample:ln=>`<b>All five of the sample’s lines lie below Kostenko and Hyndman’s diagonal, ${ln}.</b> Above the diagonal, they prefer the Syntetos–Boylan approximation; it replaces both cut-offs with one line.`,
  // F3b
  f3bTitle:'Adjustments and accuracy',f3bHint:'median gain in accuracy, percentage points',f3bNote:' Values read from the paper’s Figure 2, to within 0.5 to 1 point.',
  f3bKey:['upward adjustments','downward adjustments'],
  f3bGroups:{ac:['Manufacturers A to C','monthly'],d:['Retailer D','weekly']},
  f3bQ:['smallest','second','third','largest'],f3bQAxis:'quarter of adjustments, by size',
  f3bBetter:'more accurate',f3bWorse:'less accurate',
  f3bAria:(g)=>`Median change in forecast accuracy, in percentage points, after upward and downward adjustments of four sizes: ${g}`,
  f3bStatus:(n4,p4,dMin)=>`<b>For the three manufacturers, the largest downward adjustments gained ${n4} points of accuracy and the largest upward ones ${p4}.</b> At the retailer, upward adjustments lost accuracy at every size, as much as ${dMin} points.`,
  f3bStatusPlain:'<b>Each bar is the median gain in accuracy for one size and direction of adjustment.</b> Above the line the adjusted forecast was the better one.',
  // F3c
  f3cTitle:'One buy, one ratio',f3cHint:'illustrative demand for jackets, units',reset:'Reset',
  f3cClear:'Clearance value',f3cClearAria:'Clearance value of an unsold jacket, in dollars',
  f3cSpread:'Spread',f3cSpreadAria:'Standard deviation of demand, in units',f3cSigma:v=>`σ ${v}`,
  f3cMean:v=>`mean ${v}`,f3cCR:v=>`critical ratio ${v}`,f3cQ:v=>`order ${v}`,f3cProfit:'expected profit, $K',f3cPeak:(v,q)=>`${v} at ${q}`,
  f3cPairs:['Cost of a lost sale','Cost of an unsold jacket','Critical ratio','Order, jackets'],
  f3cAria:(cr,q)=>`The cumulative curve of demand, with the critical ratio of ${cr} read across to an order of ${q} units, and the expected profit by order size`,
  f3cStatus:(cu,co,cr,q)=>`<b>A lost sale costs ${cu} and an unsold jacket ${co}, so the critical ratio is ${cr} and the order that maximises expected profit is ${q} jackets.</b> `,
  f3cAbove:d=>`That is ${d} above the mean demand of 400, because running short costs more than running over.`,
  f3cBelow:d=>`That is ${d} below the mean demand of 400, because running over costs more than running short.`,
  f3cEven:'That is the mean demand, because running short and running over cost the same.',
  // F4a
  f4aTitle:'Weeks of stock',f4aHint:'five product lines, sample data',f4aOrder:'Order rows',f4aAria:'Row order',
  f4aOrders:[['listed','As listed'],['name','By name'],['now','Stock now'],['oct12','Stock, week of 12 Oct'],['seriate','Seriated']],
  f4aEarly:'80 boots a week early',f4aKey:['under 4 weeks','4 weeks or more','4-week horizon'],
  f4aOnHand:'On hand',f4aEnd:'End of the week of',
  f4aSvgAria:'Weeks of stock for five product lines on 28 September and at the end of each of the four weeks ahead',
  f4aSay:{listed:'As listed',name:'By name',now:'By stock on 28 September',oct12:'By stock at the end of the week of 12 October',seriate:'Seriated'},
  the:n=>n,f4aLead:'lead',f4aRows:r=>`sit in rows ${r}`,
  f4aStatus:(o,names,pos,k)=>`<b>${o}: ${names}, under four weeks in every column, ${pos}.</b> ${k} of 25 cells are under four weeks.`,
  f4aSame:' Seriation sets alike rows side by side; here it gives the order by stock on 28 September.',
  f4aEarlyNote:(a,b)=>` With 80 boots a week early, boots end the four weeks at ${a} weeks instead of ${b}.`,
  // F4b
  f4bTitle:'One table, set twice',f4bHint:'five product lines, sample data',
  f4bBefore:'As exported',f4bBeforeCtx:'a spreadsheet’s defaults',f4bAfter:'As Ehrenberg would set it',f4bAfterCtx:'rounded, ordered, totalled',
  f4bHeadRaw:['Product line','Sold','Demand','Change','Sales','Gross profit','Margin','Weeks of stock'],
  f4bHead:['Product line','Sold, last 4 weeks','Demand, next 4 weeks','Change','Sales, $K','Gross profit, $K','Margin','Weeks of stock'],
  total:'Total',
  f4bStatus:(up,upR,dn,dnR,m,ex)=>`<b>Rounded and ordered, the table reads without arithmetic:</b> ${up} rise by ${upR}, ${dn} fall by ${dnR}, and margins sit at ${m} except for ${ex}.`,
  f4bRange:(a,b)=>a===b?a:`${a} to ${b}`,f4bPair:(a,b)=>`${a} and ${b}`,
  // F5
  f5Title:'Judging proportions',f5Hint:'mean log error, lower is better · Heer and Bostock, 2010, Figure 4',
  f5Lab:'Laboratory results, 1984',f5Key:['crowdsourced, 2010','laboratory, 1984','95% interval'],
  f5Types:{T1:'Position, adjacent bars',T2:'Position, stacked bases',T3:'Position, separate bars',T4:'Length, stacked tops',T5:'Length, one stack',T6:'Angle, pie',T7:'Area, circles',T8:'Area, rectangles',T9:'Area, treemap'},
  f5Axis:'log₂ error',
  f5Aria:'Mean log error of nine kinds of proportion judgement, with 95% intervals, crowdsourced in 2010 and, for the first five, in the laboratory in 1984',
  f5Status:(p,l,a,ar)=>`<b>Position on a common scale: errors of ${p}. Length: ${l}. Angle: ${a}. Area: ${ar}.</b> `,
  f5LabNote:'The laboratory errors of 1984 run higher, in the same order for the five kinds both studies share.',
  f5Plain:'Lower is more accurate.',
  // F6a
  f6aTitle:'Two instruments',f6aHint:'weeks of base-layer stock · thresholds illustrative',f6aValue:'Weeks of stock',f6aValueAria:'Weeks of base-layer stock',
  f6aWeeks:v=>`${v} weeks`,f6aBullet:'Bullet graph',f6aBulletCtx:'after Few',f6aAnalog:'Analog indicator',f6aAnalogCtx:'after process-control practice',
  f6aBands:['poor','satisfactory','good'],f6aTarget:v=>`target ${v}`,f6aNormal:(a,b)=>`normal ${a} to ${b}`,
  f6aReason:{under:'under cover',over:'over cover'},
  f6aBulletAria:v=>`Bullet graph: ${v} weeks of stock against a target of 4, on bands of 0 to 2, 2 to 4 and 4 to 8`,
  f6aAnalogAria:(v,r)=>`Analog indicator: ${v} weeks of stock against a normal range of 2.5 to 6${r?', '+r:''}`,
  f6aIn:v=>`<b>${v}, inside the normal range of 2.5 to 6.</b> The indicator stays grey; the bullet graph draws its three bands, as it always does.`,
  f6aOut:(v,r,b)=>`<b>${v}: ${r}.</b> Only the indicator changes: its pointer and value turn cobalt and name the reason. The bullet graph shows the value in its ${b} band, drawn as before.`,
  // F6b
  f6bTitle:'Small histories',f6bHint:'illustrative values, not clinical data',f6bDay:'Reading',f6bDayAria:'Reading shown in every panel',f6bDayOut:d=>`reading ${d}`,
  f6bCase:'Case A, illustrative',f6bCaseCtx:'12 measures, 30 readings, the latest on the right',
  f6bEpochs:['earlier','past month','past week','today'],f6bEpochsShort:['earlier','month','week','today'],
  f6bWhen:['in the earlier history','in the past month','in the past week','today'],
  measures:{temp:['Temperature','°C'],hr:['Heart rate','per minute'],sys:['Systolic pressure','mmHg'],rr:['Respiratory rate','per minute'],
    spo2:['Oxygen saturation','%'],hb:['Haemoglobin','g/L'],wbc:['White cells','× 10⁹/L'],plt:['Platelets','× 10⁹/L'],
    na:['Sodium','mmol/L'],k:['Potassium','mmol/L'],cr:['Creatinine','µmol/L'],glu:['Glucose','mmol/L']},
  f6bAria:'Twelve small charts of illustrative patient measures on one shared time axis of four epochs, earlier history, the past month, the past week and today, each with its normal range in grey',
  f6bOut:(d,w,k,l)=>`<b>Reading ${d}, ${w}: ${k} of 12 measures lie outside their normal range:</b> ${l}.`,
  f6bIn:(d,w)=>`<b>Reading ${d}, ${w}: all 12 measures lie inside their normal range.</b> Point at a reading, or move the slider, to read every panel at once.`,
  f6bItem:(n,v,u)=>`${n.toLowerCase()} ${v}${u==='%'?'%':' '+u}`,
  // F7
  f7Title:'Two catalogues',f7Hint:'counts from the two papers',
  f7Left:'Sarikaya and colleagues, 2019',f7LeftCtx:(n,k)=>`${n} dashboards, ${k} clusters`,
  f7Right:'Bach and colleagues, 2023',f7RightCtx:(n,k)=>`${n} patterns, ${k} groups`,
  f7Detail:g=>`The ${g.toLowerCase()} patterns`,f7DetailCtx:n=>`share of the ${n} dashboards in which each was seen`,
  f7Pick:'Pattern group',
  f7LeftAria:'The number of dashboards in each of the seven clusters of Sarikaya and colleagues',
  f7RightAria:'The number of design patterns in each of the eight groups of Bach and colleagues',
  f7DetailAria:g=>`The share of dashboards in which each pattern of ${g} was seen`,
  f7Status:(g,n,top,tp)=>`<b>${g}: ${n} patterns.</b> The most common, ${top}, appears in ${tp} of the dashboards.`,
  f7Count:(f,p)=>p&&p!==f?` The published Figure 1 shows ${f} patterns in all; the preprint of May 2022 had ${p}.`:'',
  f7Implicit:'explicit, then including implicit',
  // F8
  f8Title:'Seven faces, four tests',f8Hint:'advance widths in em, tabular figures, weights 400 and 700',
  f8Cols:['Typeface','Zero','Ten digits','Minus sign','Decimal point'],f8Aria:'Typeface for the specimen',
  f8Keeps:'keeps',f8Shifts:'shifts',f8Nine:'nine',f8Digit:'matches the digits',f8Narrow:'narrower than a digit',f8Wide:'wider than a digit',
  f8At:v=>`at ${v} px`,
  f8Spec:'Live specimen',f8SpecCtx:f=>`${f}, regular with bold laid over it`,f8Size:'Size',f8SizeAria:'Specimen size in pixels',
  f8Status:(f,z,w,c)=>`<b>${f} at ${z} px: the weekly figures ${w}, the changes ${c}.</b> `,
  f8Same:'coincide',f8Moved:d=>`shift by up to ${d} px`,
  f8Pass:n=>n===3?'It passes the first three tests.':n===0?'It passes none of the first three tests.':`It passes ${['','one','two'][n]} of the first three tests.`,
  f8Note:'Seven faces are shown: the draft says seventeen were tested, and names these.'
},
fr:{
  locale:'fr-FR',dateLocale:'fr-FR',pc:NN+'%',K:'k$',money:v=>v+NB+'$',and:'et',
  list:a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' et '+a[a.length-1],
  figFail:'Cette figure n’a pas pu être dessinée.',
  noData:'Les données de cette figure ne sont pas encore sur la page.',
  lines:{jackets:['Vestes','vestes'],boots:['Bottes','bottes'],layers:['Sous-couches','sous-couches'],packs:['Sacs à dos','sacs à dos'],tents:['Tentes','tentes']},
  f0Title:'Les sources, par année',f0Hint:'sélectionnez un domaine ou une marque',earlier:'Plus tôt',later:'Plus tard',allFields:'Tous les domaines',f0FieldAria:'Domaine',
  before:y=>`avant ${y}`,undated:'sans date',
  f0Short:{forecasts:'Prévisions',notation:'Notation de gestion',retail:'Planification du commerce',tables:'Tableaux et matrices',perception:'Perception',operators:'Écrans d’opérateurs',dashboards:'Tableaux de bord',type:'Typographie'},
  f0Aria:(n,f,a,b)=>`${n} sources sur un axe du temps, de ${a} à ${b}, en ${f} domaines`,
  f0Dot:(l,y,f)=>`${l}, ${y}, ${f}`,
  f0All:(n,f,a,b,m,u)=>`<b>${n} sources dans ${f} domaines, de ${a} à ${b}.</b> La moitié date de ${m} ou après.`+(u?` ${u} ${u>1?'sont sans date':'est sans date'}.`:''),
  f0Field:(t,n,a,b,m)=>n>1?`<b>${t}${NN}: ${n} sources, de ${a} à ${b}.</b> La moitié date de ${m} ou après.`:n===1?`<b>${t}${NN}: une source, de ${a}.</b>`:`<b>${t}${NN}: aucune source datée.</b>`,
  f0Pick:(l,y,t,n)=>`<b>${l}, ${y}.</b> ${t}, l’une des ${n} sources de ce domaine.`,
  f1Title:'Quatre dessins',f1Hint:'exemple de demande de sous-couches, semaine du 19'+NB+'octobre, unités',
  f1Stock:'Stock',f1StockAria:'Unités en stock',f1Units:n=>`${n}${NB}unités`,f1Fifty:'Cinquante points',
  f1Names:{int:'Intervalle à 90'+NN+'%',den:'Densité',dot:'Diagramme en points de quantiles',cdf:'Courbe cumulative'},
  f1Ctx:{int:'du 5e au 95e centile',den:'aire au-delà du stock remplie',dot:'un point par issue également probable',cdf:'probabilité que la demande dépasse x'},
  f1InStock:n=>`${n} en stock`,f1Median:n=>`médiane ${n}`,
  f1Read:{inside:['5'+NN+'% à 95'+NN+'%','tout ce que dit l’intervalle'+NN+': le stock est à l’intérieur'],above:['moins de 5'+NN+'%','le stock est au-dessus de l’intervalle'],below:['plus de 95'+NN+'%','le stock est sous l’intervalle'],
    den:'de l’aire est au-delà du stock, à juger à l’œil',dot:'points sont au-delà du stock',cdf:'lu sur la courbe au niveau du stock'},
  f1Count:(k,n)=>`${k} sur ${n}`,
  f1Where:{inside:'à l’intérieur',above:'au-dessus',below:'en dessous'},
  f1Status:(st,p,k,n,w)=>`<b>Avec ${st} unités en stock, la demande dépasse le stock dans ${p} des cas.</b> Le diagramme en points en compte ${k} sur ${n}, la courbe lit ${p}, et l’intervalle dit seulement que ${st} se trouve ${w}.`,
  f1Aria:{int:(a,b,m,st)=>`Un intervalle à 90${NN}% de la demande, de ${a} à ${b} unités, médiane ${m}, face à un stock de ${st}`,
    den:(st,p)=>`La densité de la demande, avec les ${p} de son aire au-delà d’un stock de ${st} remplis`,
    dot:(n,k,st)=>`${n} points de quantiles de la demande${NN}; ${k} sont au-delà d’un stock de ${st}`,
    cdf:(st,p)=>`La probabilité que la demande dépasse chaque niveau${NN}: ${p} pour un stock de ${st}`},
  f2aTitle:'Quatre scénarios',f2aHint:'ventes par semaine, k$',f2aGrey:'Retirer la couleur',
  f2aKey:['Réel','Prévision','Budget, à titre d’exemple','Année précédente, à titre d’exemple'],f2aActual:'Réel',f2aForecast:'Prévision',
  f2aAria:`Ventes par semaine en milliers de dollars${NN}: réel, prévision, un budget et une année précédente à titre d’exemple`,
  f2aStatus:(ac,b1,p1,fc,b2,p2)=>`<b>Les quatre semaines vendues${NN}: réel ${ac} pour un budget de ${b1}, et ${p1} un an plus tôt.</b> Les quatre semaines à venir${NN}: prévision ${fc} pour un budget de ${b2}, et ${p2} un an plus tôt.`,
  f2aGreyStatus:(fc,b2)=>`<b>Sans couleur, les remplissages distinguent toujours les quatre scénarios${NN}:</b> plein pour le réel, hachuré pour la prévision, contour pour le budget, gris clair pour l’année précédente. Les semaines à venir se lisent toujours comme une prévision de ${fc} pour un budget de ${b2}.`,
  f2bTitle:'Ce qui fait bouger la marge brute',f2bHint:'k$ sur quatre semaines, un facteur à la fois',f2bAria:'Plages',
  f2bSets:[['ten','Chaque facteur ±10'+NN+'%'],['real','Demande ±30'+NN+'%, prix ±5'+NN+'%, coût ±3'+NN+'%']],
  f2bKey:['réduit la marge brute','augmente la marge brute'],f2bCtx:v=>`écart par rapport à ${v}`,
  drivers:{price:'prix',cost:'coût unitaire',demand:'demande'},
  f2bPhrase:{price:n=>`le prix des ${n}`,cost:n=>`le coût unitaire des ${n}`,demand:n=>`la demande de ${n}`},
  f2bBase:v=>`marge brute ${v}`,
  f2bSvgAria:(b,set)=>`Diagramme en tornade${NN}: l’écart de marge brute par rapport à ${b} quand chacun des quinze facteurs varie de ${set}, trié par amplitude`,
  f2bTop:(ph,lo,hi)=>`<b>${ph} fait le plus bouger la marge brute, de ${lo} à ${hi}.</b> `,
  f2bFirst:n=>`Les prix et les coûts occupent les ${['','une','deux','trois','quatre','cinq','six','sept','huit','neuf'][n]||n} premières places. `,
  f2bCap:(ph,v)=>`${ph} ne peut que la réduire, jusqu’à ${v}, car le plan vend déjà toutes les unités en stock.`,
  f3aTitle:'Quatre types de demande',f3aHint:'séries d’exemple sur 26 semaines',f3aAria:'Type de demande',
  classes:{smooth:'Régulière',erratic:'Erratique',intermittent:'Intermittente',lumpy:'Sporadique',sample:'L’exemple'},
  f3aPlot:'Intervalle et variation',f3aPlotCtx:'semaines moyennes entre deux ventes, ADI · variation au carré de la taille des ventes, CV²',
  f3aSeries:'Les quatre séries',f3aSeriesCtx:'unités par semaine, 26 semaines',
  f3aSample:'les cinq lignes de l’exemple',f3aStats:(a,c)=>`ADI ${a} · CV² ${c}`,f3aMax:m=>`max. ${m}`,
  f3aStatus:(nm,k,a,lo,hi,c,a1,c1)=>`<b>Demande ${nm.toLowerCase()}${NN}: une vente dans ${k} des 26 semaines, d’où un ADI de ${a}${NN}; des ventes de ${lo} à ${hi} unités, d’où un CV² de ${c}.</b> `+(a1===c1?`${a1?'Au-dessus':'Au-dessous'} des deux seuils, 1,32 pour l’intervalle et 0,49 pour la taille.`:`${a1?'Au-dessus':'Au-dessous'} du seuil de 1,32 pour l’intervalle, ${c1?'au-dessus':'au-dessous'} du seuil de 0,49 pour la taille.`),
  f3aSampleStatus:(lo,loN,hi,hiN)=>`<b>Les cinq lignes de l’exemple se vendent chaque semaine, d’où un ADI de 1,00, avec un CV² de ${lo} pour les ${loN} à ${hi} pour les ${hiN}.</b> Toutes les cinq tombent dans le coin de la demande régulière, sur les quatre semaines de l’exemple.`,
  f3aSvgAria:'Quatre séries de demande d’exemple et les cinq lignes de l’exemple placées selon l’ADI et le CV², avec les seuils de 1,32 et 0,49',
  f3aSeriesAria:(nm,k)=>`${nm}${NN}: 26 semaines, une vente dans ${k} d’entre elles`,
  f3aKH:'Diagonale de Kostenko et Hyndman',
  f3aKHStatus:(nm,above,ln)=>`<b>Demande ${nm.toLowerCase()}${NN}: la série se trouve ${above?'au-dessus':'au-dessous'} de la diagonale de Kostenko et Hyndman, ${ln}.</b> Au-dessus de la diagonale, ils préfèrent l’approximation de Syntetos et Boylan${NN}; une seule ligne remplace les deux seuils.`,
  f3aKHSample:ln=>`<b>Les cinq lignes de l’exemple se trouvent toutes au-dessous de la diagonale de Kostenko et Hyndman, ${ln}.</b> Au-dessus de la diagonale, ils préfèrent l’approximation de Syntetos et Boylan${NN}; une seule ligne remplace les deux seuils.`,
  f3bTitle:'Ajustements et précision',f3bHint:'gain médian de précision, en points de pourcentage',f3bNote:' Valeurs lues sur la figure 2 de l’article, à 0,5 à 1 point près.',
  f3bKey:['ajustements à la hausse','ajustements à la baisse'],
  f3bGroups:{ac:['Fabricants A à C','données mensuelles'],d:['Distributeur D','données hebdomadaires']},
  f3bQ:['plus petits','deuxième','troisième','plus grands'],f3bQAxis:'quart des ajustements, par taille',
  f3bBetter:'plus précis',f3bWorse:'moins précis',
  f3bAria:(g)=>`Variation médiane de la précision des prévisions, en points de pourcentage, après des ajustements à la hausse et à la baisse de quatre tailles${NN}: ${g}`,
  f3bStatus:(n4,p4,dMin)=>`<b>Chez les trois fabricants, les plus grands ajustements à la baisse ont gagné ${n4} points de précision, et les plus grands à la hausse ${p4}.</b> Chez le distributeur, les ajustements à la hausse ont perdu en précision à toutes les tailles, jusqu’à ${dMin} points.`,
  f3bStatusPlain:'<b>Chaque barre est le gain médian de précision pour une taille et un sens d’ajustement.</b> Au-dessus de la ligne, la prévision ajustée était la meilleure.',
  f3cTitle:'Un achat, un ratio',f3cHint:'exemple de demande de vestes, unités',reset:'Réinitialiser',
  f3cClear:'Valeur de liquidation',f3cClearAria:'Valeur de liquidation d’une veste invendue, en dollars',
  f3cSpread:'Dispersion',f3cSpreadAria:'Écart type de la demande, en unités',f3cSigma:v=>`σ ${v}`,
  f3cMean:v=>`moyenne ${v}`,f3cCR:v=>`ratio critique ${v}`,f3cQ:v=>`commande ${v}`,f3cProfit:'profit espéré, k$',f3cPeak:(v,q)=>`${v} pour ${q}`,
  f3cPairs:['Coût d’une vente perdue','Coût d’une veste invendue','Ratio critique','Commande, vestes'],
  f3cAria:(cr,q)=>`La courbe cumulative de la demande, avec le ratio critique de ${cr} reporté jusqu’à une commande de ${q} unités, et le profit espéré selon la commande`,
  f3cStatus:(cu,co,cr,q)=>`<b>Une vente perdue coûte ${cu} et une veste invendue ${co}${NN}: le ratio critique est de ${cr} et la commande qui maximise le profit espéré est de ${q} vestes.</b> `,
  f3cAbove:d=>`C’est ${d} de plus que la demande moyenne de 400, car manquer coûte plus cher que trop commander.`,
  f3cBelow:d=>`C’est ${d} de moins que la demande moyenne de 400, car trop commander coûte plus cher que manquer.`,
  f3cEven:'C’est la demande moyenne, car manquer et trop commander coûtent autant.',
  f4aTitle:'Semaines de stock',f4aHint:'cinq lignes de produits, données d’exemple',f4aOrder:'Ordre des lignes',f4aAria:'Ordre des lignes',
  f4aOrders:[['listed','Ordre de la liste'],['name','Par nom'],['now','Stock actuel'],['oct12','Stock, semaine du 12'+NB+'octobre'],['seriate','Sériation']],
  f4aEarly:'80 bottes une semaine plus tôt',f4aKey:['moins de 4 semaines','4 semaines ou plus','horizon de 4 semaines'],
  f4aOnHand:'En stock',f4aEnd:'Fin de la semaine du',
  f4aSvgAria:'Semaines de stock de cinq lignes de produits au 28 septembre et à la fin de chacune des quatre semaines à venir',
  f4aSay:{listed:'Dans l’ordre de la liste',name:'Par nom',now:'Par stock au 28'+NB+'septembre',oct12:'Par stock en fin de semaine du 12'+NB+'octobre',seriate:'Par sériation'},
  the:n=>'les '+n,f4aLead:'passent en tête',f4aRows:r=>`occupent les lignes ${r}`,
  f4aStatus:(o,names,pos,k)=>`<b>${o}${NN}: ${names}, sous quatre semaines dans chaque colonne, ${pos}.</b> ${k} cellules sur 25 sont sous quatre semaines.`,
  f4aSame:' La sériation place côte à côte les lignes qui se ressemblent${NN}; ici, elle donne l’ordre du stock au 28'+NB+'septembre.',
  f4aEarlyNote:(a,b)=>` Avec 80 bottes une semaine plus tôt, les bottes finissent les quatre semaines à ${a} sem. au lieu de ${b}.`,
  f4bTitle:'Un tableau, composé deux fois',f4bHint:'cinq lignes de produits, données d’exemple',
  f4bBefore:'Tel qu’exporté',f4bBeforeCtx:'les réglages par défaut d’un tableur',f4bAfter:'Tel qu’Ehrenberg le composerait',f4bAfterCtx:'arrondi, ordonné, totalisé',
  f4bHeadRaw:['Ligne de produits','Vendu','Demande','Variation','Ventes','Marge brute','Taux de marge','Semaines de stock'],
  f4bHead:['Ligne de produits','Vendu, 4 semaines passées','Demande, 4 semaines à venir','Variation','Ventes, k$','Marge brute, k$','Taux de marge','Semaines de stock'],
  total:'Total',
  f4bStatus:(up,upR,dn,dnR,m,ex)=>`<b>Arrondi et ordonné, le tableau se lit sans calcul${NN}:</b> ${up} progressent de ${upR}, ${dn} reculent de ${dnR}, et le taux de marge est de ${m}, sauf pour ${ex}.`,
  f4bRange:(a,b)=>a===b?a:`${a} à ${b}`,f4bPair:(a,b)=>`${a} et ${b}`,
  f5Title:'Juger des proportions',f5Hint:'erreur logarithmique moyenne, plus basse = plus juste · Heer et Bostock, 2010, figure 4',
  f5Lab:'Résultats de laboratoire, 1984',f5Key:['en ligne, 2010','laboratoire, 1984','intervalle à 95'+NN+'%'],
  f5Types:{T1:'Position, barres voisines',T2:'Position, bases empilées',T3:'Position, barres séparées',T4:'Longueur, sommets empilés',T5:'Longueur, une seule pile',T6:'Angle, secteurs',T7:'Aire, cercles',T8:'Aire, rectangles',T9:'Aire, carte proportionnelle'},
  f5Axis:'erreur log₂',
  f5Aria:'Erreur logarithmique moyenne de neuf types de jugement de proportion, avec leurs intervalles à 95 %, mesurée en ligne en 2010 et, pour les cinq premiers, en laboratoire en 1984',
  f5Status:(p,l,a,ar)=>`<b>Position sur une échelle commune${NN}: erreurs de ${p}. Longueur${NN}: ${l}. Angle${NN}: ${a}. Aire${NN}: ${ar}.</b> `,
  f5LabNote:'Les erreurs de laboratoire de 1984 sont plus élevées, dans le même ordre pour les cinq types communs aux deux études.',
  f5Plain:'Plus l’erreur est basse, plus le jugement est juste.',
  f6aTitle:'Deux instruments',f6aHint:'semaines de stock de sous-couches · seuils à titre d’exemple',f6aValue:'Semaines de stock',f6aValueAria:'Semaines de stock de sous-couches',
  f6aWeeks:v=>`${v} semaine${parseFloat(String(v).replace(',','.'))<2?'':'s'}`,f6aBullet:'Graphique à puces',f6aBulletCtx:'d’après Few',f6aAnalog:'Indicateur analogique',f6aAnalogCtx:'d’après la pratique du contrôle de procédés',
  f6aBands:['faible','satisfaisant','bon'],f6aTarget:v=>`cible ${v}`,f6aNormal:(a,b)=>`normal de ${a} à ${b}`,
  f6aReason:{under:'couverture insuffisante',over:'couverture excessive'},
  f6aBulletAria:v=>`Graphique à puces${NN}: ${v} semaines de stock pour une cible de 4, sur des bandes de 0 à 2, 2 à 4 et 4 à 8`,
  f6aAnalogAria:(v,r)=>`Indicateur analogique${NN}: ${v} semaines de stock pour une plage normale de 2,5 à 6${r?', '+r:''}`,
  f6aIn:v=>`<b>${v}, dans la plage normale de 2,5 à 6.</b> L’indicateur reste gris${NN}; le graphique à puces dessine ses trois bandes, comme toujours.`,
  f6aOut:(v,r,b)=>`<b>${v}${NN}: ${r}.</b> Seul l’indicateur change${NN}: son pointeur et sa valeur passent en cobalt et nomment la raison. Le graphique à puces montre la valeur dans sa bande «${NN}${b}${NN}», dessinée comme avant.`,
  f6bTitle:'Petits historiques',f6bHint:'valeurs d’exemple, pas des données cliniques',f6bDay:'Relevé',f6bDayAria:'Relevé affiché dans chaque panneau',f6bDayOut:d=>`relevé ${d}`,
  f6bCase:'Cas A, à titre d’exemple',f6bCaseCtx:'12 mesures, 30 relevés, le plus récent à droite',
  f6bEpochs:['avant','mois passé','semaine passée','aujourd’hui'],f6bEpochsShort:['avant','mois','semaine','auj.'],
  f6bWhen:['dans l’historique','le mois passé','la semaine passée','aujourd’hui'],
  measures:{temp:['Température','°C'],hr:['Fréquence cardiaque','par minute'],sys:['Pression systolique','mmHg'],rr:['Fréquence respiratoire','par minute'],
    spo2:['Saturation en oxygène','%'],hb:['Hémoglobine','g/L'],wbc:['Leucocytes','× 10⁹/L'],plt:['Plaquettes','× 10⁹/L'],
    na:['Sodium','mmol/L'],k:['Potassium','mmol/L'],cr:['Créatinine','µmol/L'],glu:['Glycémie','mmol/L']},
  measuresShort:{hr:'Fréq. cardiaque',rr:'Fréq. respiratoire',spo2:'Saturation en O₂'},
  f6bAria:'Douze petits graphiques de mesures de patient, à titre d’exemple, sur un même axe du temps en quatre époques, l’historique, le mois passé, la semaine passée et aujourd’hui, chacun avec sa plage normale en gris',
  f6bOut:(d,w,k,l)=>`<b>Relevé ${d}, ${w}${NN}: ${k} mesures sur 12 sortent de leur plage normale${NN}:</b> ${l}.`,
  f6bIn:(d,w)=>`<b>Relevé ${d}, ${w}${NN}: les 12 mesures sont dans leur plage normale.</b> Pointez un relevé, ou déplacez le curseur, pour lire tous les panneaux à la fois.`,
  f6bItem:(n,v,u)=>`${n.toLowerCase()} ${v}${u==='%'?NN+'%':NB+u}`,
  f7Title:'Deux catalogues',f7Hint:'effectifs tirés des deux articles',
  f7Left:'Sarikaya et coll., 2019',f7LeftCtx:(n,k)=>`${n} tableaux de bord, ${k} groupes`,
  f7Right:'Bach et coll., 2023',f7RightCtx:(n,k)=>`${n} modèles, ${k} familles`,
  f7Detail:g=>`Modèles de la famille «${NN}${g}${NN}»`,f7DetailCtx:n=>`part des ${n} tableaux de bord où chacun a été observé`,
  f7Pick:'Famille de modèles',
  f7LeftAria:'Le nombre de tableaux de bord dans chacun des sept groupes de Sarikaya et coll.',
  f7RightAria:'Le nombre de modèles de conception dans chacune des huit familles de Bach et coll.',
  f7DetailAria:g=>`La part des tableaux de bord où chaque modèle de la famille ${g} a été observé`,
  f7Status:(g,n,top,tp)=>`<b>${g}${NN}: ${n} modèles.</b> Le plus courant, «${NN}${top}${NN}», apparaît dans ${tp} des tableaux de bord.`,
  f7Count:(f,p)=>p&&p!==f?` La figure 1 publiée montre ${f} modèles en tout${NN}; la prépublication de mai 2022 en comptait ${p}.`:'',
  f7Implicit:'explicite, puis en comptant l’implicite',
  f8Title:'Sept polices, quatre tests',f8Hint:'chasses en em, chiffres tabulaires, graisses 400 et 700',
  f8Cols:['Police','Zéro','Dix chiffres','Signe moins','Séparateur décimal'],f8Aria:'Police du spécimen',
  f8Keeps:'tient',f8Shifts:'bouge',f8Nine:'neuf',f8Digit:'égal aux chiffres',f8Narrow:'plus étroit qu’un chiffre',f8Wide:'plus large qu’un chiffre',
  f8At:v=>`à ${v}${NB}px`,
  f8Spec:'Spécimen en direct',f8SpecCtx:f=>`${f}, le gras posé sur le normal`,f8Size:'Taille',f8SizeAria:'Taille du spécimen en pixels',
  f8Status:(f,z,w,c)=>`<b>${f} à ${z}${NB}px${NN}: les chiffres hebdomadaires ${w}, les variations ${c}.</b> `,
  f8Same:'coïncident',f8Moved:d=>`se décalent jusqu’à ${d}${NB}px`,
  f8Pass:n=>n===3?'Elle passe les trois premiers tests.':n===0?'Elle ne passe aucun des trois premiers tests.':`Elle passe ${['','un','deux'][n]} des trois premiers tests.`,
  f8Note:'Sept polices figurent ici${NN}: le brouillon dit en avoir testé dix-sept, et nomme celles-ci.'
}};
// Two French strings above carry a placeholder written for template literals; they are plain strings.
STR.fr.f4aSame=STR.fr.f4aSame.replace('${NN}',NN);
STR.fr.f8Note=STR.fr.f8Note.replace('${NN}',NN);
// Names that come from the published papers, in French. English pages print the data as it is.
const NAMES_FR={
  'Strategic Decision-Making':'Décision stratégique','Operational Decision-Making':'Décision opérationnelle','Static Operational':'Opérationnel statique',
  'Static Organizational':'Organisationnel statique','Quantified Self':'Mesure de soi','Communication':'Communication','Dashboards Evolved':'Formes dérivées',
  'Decision-Making':'Décision','Awareness':'Veille','Motivation and Learning':'Motivation et apprentissage','(catch-all)':'Autres',
  'Content':'Contenu','Composition':'Composition',
  'Data information':'Informations sur les données','Meta information':'Métadonnées','Visual representation':'Représentation visuelle',
  'Page layout':'Mise en page','Screenspace':'Espace à l’écran','Structure':'Structure','Interaction':'Interaction','Color':'Couleur',
  'Detailed data(sets)':'Données détaillées','Aggregated':'Agrégées','Filtered':'Filtrées','Derived values':'Valeurs dérivées','Thresholds':'Seuils',
  'Single value':'Valeur unique','Data source':'Source des données','Disclaimer':'Avertissement','Data description':'Description des données',
  'Update information':'Date de mise à jour','Annotations':'Annotations','Table':'Tableau','List':'Liste','Detailed visualization':'Visualisation détaillée',
  'Miniature chart':'Graphique miniature','Gauges & progress bars':'Jauges et barres de progression','Pictogram':'Pictogramme','Trend arrow':'Flèche de tendance',
  'Number':'Nombre','Open':'Ouverte','Stratified':'Stratifiée','Grouped':'Groupée','Schematic':'Schématique','Screenfit':'Tient dans l’écran',
  'Overflow':'Débordement','Detail on demand':'Détail à la demande','Parameterization':'Paramétrage','Multiple pages':'Plusieurs pages',
  'Single page':'Page unique','Parallel':'Parallèle','Hierarchical':'Hiérarchique','Exploration':'Exploration','Drilldown':'Forage',
  'Navigation':'Navigation','Personalization':'Personnalisation','Shared':'Partagée','Data encoding':'Encodage des données','Semantic':'Sémantique','Emotive':'Émotive'};

const LANG=/^fr(-|$)/i.test(document.documentElement.lang||'')?'fr':'en';
const s=STR[LANG];
const NAMES_EN={'(catch-all)':'Other'};
const nameOf=v=>{const k=String(v||'').replace(/\s*\(Fig\..*\)$/,'');return LANG==='fr'?NAMES_FR[k]||k:NAMES_EN[k]||k;};

/* ================= numbers and dates =================
   fx(v,d) prints v with d decimals in the page language, a true minus sign and French spaces; years never group. */
const NF={},nf=(d,g)=>NF[d+'|'+g]||(NF[d+'|'+g]=new Intl.NumberFormat(s.locale,{minimumFractionDigits:d,maximumFractionDigits:d,useGrouping:g}));
const fx=(v,d=0,g=true)=>{if(!Number.isFinite(v)) return '—'; if(Math.abs(v)<0.5*Math.pow(10,-d)) v=0; let t=nf(d,g).format(Math.abs(v)); if(LANG==='fr') t=t.replace(/[\s  ]/g,NN); return (v<0?'−':'')+t;};
const f1=v=>fx(v,1);
const sgn=(v,d=1)=>{const e=0.5*Math.pow(10,-d);return (v>=e?'+':v<=-e?'−':'')+fx(Math.abs(v),d);};
const pct=(v,d=0)=>fx(v*100,d)+s.pc;
const spct=(v,d=0)=>sgn(v*100,d)+s.pc;
const DTF={},dm=(date,long)=>{const k=long?'l':'s',f=DTF[k]||(DTF[k]=new Intl.DateTimeFormat(s.dateLocale,{day:'numeric',month:long?'long':'short'})),p={};
  f.formatToParts(date).forEach(x=>{p[x.type]=x.value;}); return p.day+(LANG==='fr'?NB:' ')+p.month;};
const WEEK=i=>new Date(2026,7,31+7*i);                 // eight week columns from Monday 31 August 2026
const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ================= distributions ================= */
function erfc(x){const z=Math.abs(x),t=1/(1+0.5*z),r=t*Math.exp(-z*z-1.26551223+t*(1.00002368+t*(0.37409196+t*(0.09678418+t*(-0.18628806+t*(0.27886807+t*(-1.13520398+t*(1.48851587+t*(-0.82215223+t*0.17087277)))))))));return x>=0?r:2-r;}
const PHI=z=>0.5*erfc(-z/Math.SQRT2), phi=z=>Math.exp(-z*z/2)/Math.sqrt(2*Math.PI);
function PHIinv(p){   // Acklam's rational approximation, relative error under 1.2e-9
  const a=[-39.69683028665376,220.9460984245205,-275.9285104469687,138.3577518672690,-30.66479806614716,2.506628277459239],
    b=[-54.47609879822406,161.5858368580409,-155.6989798598866,66.80131188771972,-13.28068155288572],
    c=[-0.007784894002430293,-0.3223964580411365,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783],
    d=[0.007784695709041462,0.3224671290700398,2.445134137142996,3.754408661907416];
  const tail=q=>(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  if(p<0.02425) return tail(Math.sqrt(-2*Math.log(p)));
  if(p>1-0.02425) return -tail(Math.sqrt(-2*Math.log(1-p)));
  const q=p-0.5,r=q*q;return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}
// A seeded generator (mulberry32), so every illustrative series is the same on every visit.
const rng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};

/* ================= the sample plan =================
   The guide's example: five product lines, four weeks sold, four weeks ahead. The same numbers as guide.js, computed
   here so this chapter needs nothing else. scale = {lineId:{price, cost, demand}} multiplies one driver of one line. */
const LINES=[
  {id:'jackets',price:300,cost:180,open:540,prev:250,weekly:[80,85,95,100],receipts:[0,0,120,0]},
  {id:'boots',price:220,cost:120,open:160,prev:160,weekly:[80,80,80,80],receipts:[0,0,0,240]},
  {id:'layers',price:120,cost:60,open:450,prev:320,weekly:[120,140,160,180],receipts:[0,0,150,0]},
  {id:'packs',price:200,cost:120,open:360,prev:200,weekly:[35,30,30,25],receipts:[0,0,200,0]},
  {id:'tents',price:500,cost:300,open:180,prev:80,weekly:[13,11,9,7],receipts:[0,0,0,0]}];
const ACTUAL_SALES=[55.7,57.6,56.7,58.6],BOOTS_EARLY=[0,0,80,160],HORIZON=4;
const sum=a=>a.reduce((x,y)=>x+y,0);
function plan(o={}){
  const rows=LINES.map(p=>{
    const k=(o.scale&&o.scale[p.id])||{},price=p.price*(k.price||1),cost=p.cost*(k.cost||1),weekly=p.weekly.map(u=>u*(k.demand||1));
    const receipts=p.id==='boots'&&o.bootsEarly?BOOTS_EARLY:p.receipts;
    let st=p.open; const close=[st],sold=[];
    for(let w=0;w<HORIZON;w++){st+=receipts[w]; const q=Math.min(st,weekly[w]); sold.push(q); st-=q; close.push(st);}
    const demand=sum(weekly),served=sum(sold),mean=demand/HORIZON;
    return {id:p.id,name:s.lines[p.id][0],noun:s.lines[p.id][1],price,cost,prev:p.prev,demand,served,sold,close,mean,cover:close.map(c=>c/mean),
      sales:served*price/1000,gp:served*(price-cost)/1000};
  });
  const sales=sum(rows.map(r=>r.sales)),gp=sum(rows.map(r=>r.gp));
  return {rows,sales,gp,byWeek:Array.from({length:HORIZON},(_,w)=>sum(rows.map(r=>r.sold[w]*r.price))/1000)};
}

/* ================= drawing helpers, as in guide.js ================= */
const p1=v=>(+v).toFixed(1);
const R=(x,y,w,h,c,rx=0,ex='')=>`<rect x="${p1(x)}" y="${p1(y)}" width="${p1(Math.max(0,w))}" height="${p1(Math.max(0,h))}" rx="${rx}" class="${c}" ${ex}/>`;
const L=(x1,y1,x2,y2,c,ex='')=>`<line x1="${p1(x1)}" y1="${p1(y1)}" x2="${p1(x2)}" y2="${p1(y2)}" class="${c}" ${ex}/>`;
const T=(x,y,t,c,a='start',ex='')=>`<text x="${p1(x)}" y="${p1(y)}" class="${c}" text-anchor="${a}" ${ex}>${t}</text>`;
const S=(w,h,body,label,fluid,role='img')=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="${role}" aria-label="${esc(label)}"${fluid?' style="width:100%;height:auto"':''}>${body}</svg>`;
const C=(x,y,r,c,ex='')=>`<circle cx="${p1(x)}" cy="${p1(y)}" r="${p1(r)}" class="${c}" ${ex}/>`;
// A vertical bar with a rounded top, as a path; and a horizontal segment with its own left and right radius.
const barD=(x,top,w,h,r=6)=>{r=Math.max(0,Math.min(r,h,w/2)); return `M${p1(x)},${p1(top+h)} V${p1(top+r)} a${r},${r} 0 0 1 ${r},${-r} H${p1(x+w-r)} a${r},${r} 0 0 1 ${r},${r} V${p1(top+h)} Z`;};
const barDownD=(x,top,w,h,r=6)=>{r=Math.max(0,Math.min(r,h,w/2)); return `M${p1(x)},${p1(top)} V${p1(top+h-r)} a${r},${r} 0 0 0 ${r},${r} H${p1(x+w-r)} a${r},${r} 0 0 0 ${r},${-r} V${p1(top)} Z`;};
const bar=(x,top,w,h,c,r=6,ex='')=>h>0&&w>0?`<path d="${barD(x,top,w,h,r)}" class="${c}" ${ex}/>`:'';
const hseg=(x,y,w,h,c,rl=0,rr=0)=>{if(w<=0) return ''; rl=Math.min(rl,w/2,h/2); rr=Math.min(rr,w/2,h/2);
  return `<path d="M${p1(x+rl)},${p1(y)} H${p1(x+w-rr)} a${rr},${rr} 0 0 1 ${rr},${rr} V${p1(y+h-rr)} a${rr},${rr} 0 0 1 ${-rr},${rr} H${p1(x+rl)} a${rl},${rl} 0 0 1 ${-rl},${-rl} V${p1(y+rl)} a${rl},${rl} 0 0 1 ${rl},${-rl} Z" class="${c}"/>`;};
const HALO='style="paint-order:stroke;stroke:var(--field);stroke-width:4px;stroke-linejoin:round"';

const segCtl=(name,opts,cur,label)=>`<div class="seg" role="radiogroup" aria-label="${esc(label)}">${opts.map(([v,t])=>`<button type="button" role="radio" data-${name}="${v}" aria-checked="${String(v)===String(cur)}">${t}</button>`).join('')}</div>`;
const setSeg=(root,name,cur)=>$$(`[data-${name}]`,root).forEach(b=>b.setAttribute('aria-checked',String(b.dataset[name]===String(cur))));
const opt=(id,label,sub,on,cls='')=>`<button type="button" class="opt ${cls}" role="switch" aria-checked="${on}" data-opt="${id}"><i class="sw"></i><span>${cls?label:`<b>${label}</b>`}${sub?`<small>${sub}</small>`:''}</span></button>`;
const onOpt=(root,fn)=>root.addEventListener('click',e=>{const o=e.target.closest('[data-opt]'); if(!o||o.disabled) return; const on=o.getAttribute('aria-checked')!=='true'; o.setAttribute('aria-checked',on); fn(o.dataset.opt,on);});
const head=(title,hint,ctl='')=>`<div class="demo-head"><div><h3>${title}</h3>${hint?`<span class="hint">${hint}</span>`:''}</div>${ctl}</div>`;
const key=items=>items.map(([style,t])=>`<span><i style="${style}"></i>${t}</span>`).join('');
const noData=title=>head(title,'')+`<p class="status">${s.noData}</p>`;

/* A chart is drawn at the width it has, and drawn again when that width changes. */
const drawW=(el,min=320)=>{const cs=getComputedStyle(el),w=Math.floor(el.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)); return w>0?Math.max(min,w):960;};
const redraw=[];
const watch=(el,min,render)=>{let last=drawW(el,min); redraw.push(force=>{if(!el.isConnected) return; const w=drawW(el,min); if(force||w!==last){last=w;render();}});};

const DATA=()=>window.GUIDE_DATA||{};
const research=()=>DATA().research||{};
const figData=()=>DATA().figureData||{};

/* ================= F0: the chapter's sources on one time axis =================
   One lane per field, in the chapter's order; one mark per reference at the year of the work cited. Marks that
   touch are stacked in their lane. Years before 1950 sit in a compressed segment of their own, marked as such,
   and undated references in a column at the end. The lane names are a radio group that highlights one field. */
function figF0(root){
  const R0=research(),raw=Array.isArray(R0.overview)?R0.overview:[];
  const fl=Array.isArray(R0.fields)&&R0.fields.length?R0.fields:[...new Set(raw.map(p=>p.field))].map(id=>({id,title:id}));
  const F=fl.map(f=>({id:f.id,title:String(f.title||f.id),short:s.f0Short[f.id]||String(f.title||f.id)}));
  const P=raw.map(p=>({fi:F.findIndex(f=>f.id===p.field),year:p.year===null||p.year===undefined||p.year===''||!Number.isFinite(+p.year)?null:Math.round(+p.year),label:String(p.label||'')}))
    .filter(p=>p.fi>=0).map((p,i)=>({...p,i}));
  if(!P.length||!P.some(p=>p.year!==null)){root.innerHTML=noData(s.f0Title);return;}
  const dated=P.filter(p=>p.year!==null),undated=P.filter(p=>p.year===null),CUT=1950;
  const years=dated.map(p=>p.year).sort((a,b)=>a-b),minY=years[0],maxY=years[years.length-1],early=minY<CUT;
  const half=ys=>ys.length?ys[ys.length-Math.ceil(ys.length/2)]:null;
  const order=P.slice().sort((a,b)=>(a.year===null)-(b.year===null)||(a.year||0)-(b.year||0)||a.fi-b.fi||a.label.localeCompare(b.label,s.locale));
  const st={field:null,cur:null};
  root.innerHTML=head(s.f0Title,s.f0Hint,`<div class="demo-ctl"><button class="btn" type="button" data-step="-1">${s.earlier}</button><button class="btn" type="button" data-step="1">${s.later}</button></div>`)
    +`<section class="sheet s1"><div class="field scroll"><div class="rx-tl" id="f0-view"></div></div></section><p class="status" id="f0-status" aria-live="polite"></p>`;
  const view=$('#f0-view',root),sc=view.parentElement,status=$('#f0-status',root);
  let G=null;
  function geometry(){
    const cw=Math.floor(sc.clientWidth),narrow=cw>0&&cw<720,W=Math.max(820,cw),LW=narrow?150:236,TOP=36,RH=48,H=TOP+F.length*RH+36;
    const PRE=early?112:0,GAP=early?26:0,UND=undated.length?72:0,X0=LW+16+PRE+GAP,X1=W-24-UND;
    const START=early?CUT:Math.floor(minY/10)*10,END=Math.max(2030,Math.ceil((maxY+1)/10)*10);
    const E0=early?Math.floor(minY/50)*50:CUT;
    const x=y=>y<CUT&&early?LW+16+(y-E0)/(CUT-E0)*PRE:X0+(y-START)/(END-START)*(X1-X0);
    return {cw,narrow,W,LW,TOP,RH,H,PRE,GAP,UND,X0,X1,START,END,E0,x};
  }
  function place(g){
    const lanes=F.map(()=>[]),ux=g.X1+g.UND/2+6;
    P.forEach(p=>{p.x=p.year===null?ux:g.x(p.year); lanes[p.fi].push(p);});
    lanes.forEach((ln,fi)=>{ln.sort((a,b)=>a.x-b.x||a.label.localeCompare(b.label,s.locale)); const last=[],lv=[0,-10,10,-20,20,-30,30];
      ln.forEach(p=>{let k=0; while(k<last.length&&p.x-last[k]<8.5) k++; last[k]=p.x; p.y=g.TOP+fi*g.RH+g.RH/2+(lv[Math.min(k,lv.length-1)]);});});
  }
  function labels(g){
    return `<div class="rx-lab" style="width:${g.LW}px;height:${g.H}px" role="radiogroup" aria-label="${esc(s.f0FieldAria)}">`
      +`<button type="button" role="radio" data-fld="" aria-checked="${st.field===null}" style="top:2px;height:${g.TOP-6}px">${s.allFields}</button>`
      +F.map((f,i)=>`<button type="button" role="radio" data-fld="${esc(f.id)}" aria-checked="${st.field===f.id}" style="top:${g.TOP+i*g.RH+2}px;height:${g.RH-4}px">${esc(g.narrow?f.short:f.title)}</button>`).join('')+'</div>';
  }
  function svg(g){
    const fi=st.field===null?-1:F.findIndex(f=>f.id===st.field),bottom=g.TOP+F.length*g.RH; let b='';
    if(fi>=0) b+=hseg(g.LW,g.TOP+fi*g.RH+2,g.W-g.LW-8,g.RH-4,'f-sheet',0,10);
    for(let y=Math.ceil(g.START/10)*10;y<=g.END;y+=10){const xx=g.x(y); b+=L(xx,g.TOP-6,xx,bottom,'l-g'); if(xx<g.X1-14||y===g.END) b+=T(xx,g.H-12,y,'t-tk','middle');}
    if(early){
      // the compressed segment: its own scale, marked off by a dashed rule, with the years of its marks printed
      const xs=g.X0-g.GAP/2;
      b+=L(xs,g.TOP-10,xs,bottom,'l-d')+T(g.LW+16+g.PRE/2,g.TOP-14,s.before(CUT),'t-tk','middle');
      let lastX=-99;[...new Set(years.filter(y=>y<CUT))].forEach(y=>{const xx=g.x(y); if(xx-lastX>=34){b+=L(xx,bottom,xx,bottom+5,'l-a')+T(xx,g.H-12,y,'t-tk','middle'); lastX=xx;}});
    }
    if(undated.length){const xu=g.X1+8; b+=L(xu,g.TOP-10,xu,bottom,'l-d')+T(g.X1+g.UND/2+6,g.H-12,s.undated,'t-tk','middle');}
    for(let i=0;i<=F.length;i++) b+=L(g.LW,g.TOP+i*g.RH,g.W-8,g.TOP+i*g.RH,i===F.length?'l-a':'l-g');
    P.forEach(p=>{const on=p.i===st.cur,cls=['pm',on?'on':'',fi>=0?(p.fi===fi?'rx-hi':'rx-lo'):''].join(' ').trim();
      b+=`<g class="${cls}" data-pt="${p.i}" tabindex="-1" role="button" aria-label="${esc(s.f0Dot(p.label,p.year===null?s.undated:p.year,F[p.fi].title))}" transform="translate(${p1(p.x)},${p1(p.y)})"><circle r="10" class="hit"/><circle r="${on?6:4}" class="dot"/></g>`;});
    b+='<g class="rx-tag" pointer-events="none"></g>';
    return S(g.W,g.H,b,s.f0Aria(P.length,F.length,minY,maxY),false,'group');
  }
  function roving(){const pts=$$('[data-pt]',view),cur=st.cur!==null?st.cur:(order[0]&&order[0].i); pts.forEach(n=>n.setAttribute('tabindex',+n.dataset.pt===cur?'0':'-1'));}
  let opened=false;
  function render(){
    G=geometry(); place(G);
    view.style.width=G.W+'px';
    view.innerHTML=labels(G)+svg(G);
    roving(); tag(st.cur); say();
    if(!opened&&sc.scrollWidth>sc.clientWidth+1){opened=true; sc.scrollLeft=sc.scrollWidth;}
  }
  function redrawSvg(){const old=$('svg',view); if(!old) return render(); old.outerHTML=svg(G); roving(); tag(st.cur);}
  function tag(i){
    const g=$('.rx-tag',view); if(!g) return; if(i===null||i===undefined){g.innerHTML='';return;}
    const p=P[i]; g.innerHTML=`<rect class="tag" rx="8" height="26"/><text class="t-n" text-anchor="middle">${esc(p.label)} · ${p.year===null?s.undated:p.year}</text>`;
    const t=$('text',g),w=(t.getComputedTextLength?t.getComputedTextLength():p.label.length*7.4)+24;
    const tx=Math.min(Math.max(p.x,G.LW+w/2+6),G.W-w/2-6),ty=p.y-40<4?p.y+14:p.y-40;
    const r=$('rect',g); r.setAttribute('x',p1(tx-w/2)); r.setAttribute('y',p1(ty)); r.setAttribute('width',p1(w));
    t.setAttribute('x',p1(tx)); t.setAttribute('y',p1(ty+17.5));
  }
  function say(){
    if(st.cur!==null){const p=P[st.cur],f=F[p.fi],n=P.filter(q=>q.fi===p.fi).length; status.innerHTML=s.f0Pick(esc(p.label),p.year===null?s.undated:p.year,esc(f.title),n); return;}
    if(st.field!==null){const fi=F.findIndex(f=>f.id===st.field),ys=dated.filter(p=>p.fi===fi).map(p=>p.year).sort((a,b)=>a-b);
      status.innerHTML=s.f0Field(esc(F[fi].title),ys.length,ys[0],ys[ys.length-1],half(ys)); return;}
    status.innerHTML=s.f0All(P.length,F.length,minY,maxY,half(years),undated.length);
  }
  function pick(i,focus){
    st.cur=i; $$('[data-pt]',view).forEach(n=>{const on=+n.dataset.pt===i; n.classList.toggle('on',on); $('.dot',n).setAttribute('r',on?6:4);});
    roving(); tag(i); say();
    if(i!==null){const p=P[i]; if(sc.scrollWidth>sc.clientWidth+1&&(p.x<sc.scrollLeft+G.LW+20||p.x>sc.scrollLeft+sc.clientWidth-20)) sc.scrollLeft=Math.max(0,p.x-G.LW-(sc.clientWidth-G.LW)/2);
      if(focus){const n=$(`[data-pt="${i}"]`,view); if(n&&document.activeElement!==n) n.focus({preventScroll:true});}}
  }
  const pool=()=>order.filter(p=>st.field===null||F[p.fi].id===st.field);
  function step(d,focus){const a=pool(); if(!a.length) return; const k=a.findIndex(p=>p.i===st.cur); pick(k<0?(d>0?a[0].i:a[a.length-1].i):a[(k+d+a.length)%a.length].i,focus);}
  root.addEventListener('click',e=>{
    const f=e.target.closest('[data-fld]'),m=e.target.closest('[data-pt]'),b=e.target.closest('[data-step]');
    if(f){const id=f.dataset.fld||null; st.field=id; if(st.cur!==null&&id!==null&&F[P[st.cur].fi].id!==id) st.cur=null;
      $$('[data-fld]',view).forEach(x=>x.setAttribute('aria-checked',String((x.dataset.fld||null)===id))); redrawSvg(); say();}
    else if(m) pick(+m.dataset.pt,true);
    else if(b) step(+b.dataset.step,false);
  });
  root.addEventListener('focusin',e=>{const m=e.target.closest&&e.target.closest('[data-pt]'); if(m&&+m.dataset.pt!==st.cur) pick(+m.dataset.pt,false);});
  root.addEventListener('pointerover',e=>{const m=e.target.closest&&e.target.closest('[data-pt]'); if(m) tag(+m.dataset.pt);});
  root.addEventListener('pointerout',e=>{const m=e.target.closest&&e.target.closest('[data-pt]'); if(m&&!(e.relatedTarget&&m.contains(e.relatedTarget))) tag(st.cur);});
  root.addEventListener('keydown',e=>{
    const m=e.target.closest&&e.target.closest('[data-pt]');
    if(m){
      const i=+m.dataset.pt,p=P[i];
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault(); st.cur=i; step(e.key==='ArrowRight'?1:-1,true);}
      else if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault(); const d=e.key==='ArrowDown'?1:-1;
        for(let fi=p.fi+d;fi>=0&&fi<F.length;fi+=d){const c=P.filter(q=>q.fi===fi); if(c.length){c.sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x)); pick(c[0].i,true); break;}}}
      else if(e.key==='Home'||e.key==='End'){e.preventDefault(); const a=pool(); if(a.length) pick((e.key==='Home'?a[0]:a[a.length-1]).i,true);}
      else if(e.key==='Enter'||e.key===' '){e.preventDefault(); pick(i,true);}
      return;
    }
    const f=e.target.closest&&e.target.closest('[data-fld]');
    if(f&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault(); const bs=$$('[data-fld]',view),k=bs.indexOf(f),n=bs[(k+(e.key==='ArrowDown'?1:-1)+bs.length)%bs.length]; n.focus(); n.click();}
  });
  render(); watch(sc,820,render);
}

/* ================= F1: one forecast, four drawings =================
   Lognormal demand, median 180 units and log standard deviation 0.20 (5th and 95th percentiles 130 and 250).
   P(demand > stock) = 1 − Φ(ln(stock/180)/0.20). The quantile dots sit at (i − 0.5)/n, stacked in 10-unit bins.
   With fifty dots the top one is at 287 units, so all four drawings share an axis from 100 to 290. */
function figF1(root){
  const MED=180,SIG=0.2,LO=100,HI=290,st={stock:180,n:20};
  const over=v=>1-PHI(Math.log(v/MED)/SIG),qt=p=>MED*Math.exp(SIG*PHIinv(p)),P5=qt(0.05),P95=qt(0.95);
  const pdf=v=>Math.exp(-Math.pow(Math.log(v/MED)/SIG,2)/2)/(v*SIG*Math.sqrt(2*Math.PI)),PK=pdf(MED*Math.exp(-SIG*SIG));
  const K=['int','den','dot','cdf'];
  root.innerHTML=head(s.f1Title,s.f1Hint,`<label class="rng wide"><span>${s.f1Stock}</span><input type="range" id="f1-s" min="120" max="260" step="5" value="180" aria-label="${esc(s.f1StockAria)}"><output id="f1-so"></output></label>`)
    +`<section class="sheet s2">${K.map(k=>`<div class="field rx-mini"><div class="tbar"><div><h4>${s.f1Names[k]}</h4><span class="ctx">${s.f1Ctx[k]}</span></div></div><div class="rx-plot" id="f1-${k}"></div><div class="rx-foot"><div class="rx-read" id="f1-${k}-r"></div>${k==='dot'?opt('fifty',s.f1Fifty,'',false,'inline'):''}</div></div>`).join('')}</section>
    <p class="status" id="f1-status" aria-live="polite"></p>`;
  const el=k=>$('#f1-'+k,root),rd=k=>$('#f1-'+k+'-r',root),status=$('#f1-status',root),so=$('#f1-so',root);
  const geo=VW=>{const xl=44,xr=VW-16;return {VW,H:160,xl,xr,x:v=>xl+(v-LO)/(HI-LO)*(xr-xl),top:30,base:128};};
  const axis=g=>{let a=L(g.xl,g.base,g.xr,g.base,'l-a');[100,150,200,250].forEach(v=>{a+=L(g.x(v),g.base,g.x(v),g.base+5,'l-a')+T(g.x(v),g.base+21,fx(v),'t-tk','middle');});return a;};
  const rule=g=>{const x=g.x(st.stock),right=x>g.xr-104;return L(x,g.top-12,x,g.base,'l-i')+T(right?x-7:x+7,g.top-3,s.f1InStock(fx(st.stock)),'t-v',right?'end':'start');};
  const read=(k,b,t)=>{rd(k).innerHTML=`<b>${b}</b><span>${t}</span>`;};
  function render(){
    const VW=drawW(el('int'),240),g=geo(VW),p=over(st.stock),P=pct(p),stock=fx(st.stock);
    // the interval: 5th to 95th percentile, a tick at the median
    {const y=g.base-64,h=16; let b=axis(g)+hseg(g.x(P5),y,g.x(P95)-g.x(P5),h,'f-tint',8,8)+rule(g)+L(g.x(MED),y-9,g.x(MED),y+h+9,'l-s');
      b+=T(g.x(P5),y+h+22,fx(P5),'t-tk','middle',HALO)+T(g.x(P95),y+h+22,fx(P95),'t-tk','middle',HALO)+T(g.x(MED),y+h+22,s.f1Median(fx(MED)),'t-lb ink','middle',HALO);
      el('int').innerHTML=S(VW,g.H,b,s.f1Aria.int(fx(P5),fx(P95),fx(MED),stock),true);
      const w=st.stock>P95?'above':st.stock<P5?'below':'inside'; read('int',s.f1Read[w][0],s.f1Read[w][1]);}
    // the density, the area above the stock in ink
    {const yv=d=>g.base-d/PK*(g.base-g.top-4),pts=(a,b)=>{let d='';for(let v=a;v<b;v+=1) d+=`L${p1(g.x(v))},${p1(yv(pdf(v)))}`;return d+`L${p1(g.x(b))},${p1(yv(pdf(b)))}`;};
      const area=(a,b)=>`M${p1(g.x(a))},${g.base}${pts(a,b)}L${p1(g.x(b))},${g.base}Z`;
      let b=`<path d="${area(LO,st.stock)}" class="washfill"/><path d="${area(st.stock,HI)}" class="f-ink"/><path d="M${p1(g.x(LO))},${p1(yv(pdf(LO)))}${pts(LO,HI)}" class="l-s"/>`;
      el('den').innerHTML=S(VW,g.H,b+axis(g)+rule(g),s.f1Aria.den(stock,P),true); read('den',P,s.f1Read.den);}
    // the quantile dotplot: dots above the stock in ink
    {const n=st.n,qs=Array.from({length:n},(_,i)=>qt((i+0.5)/n)),bw=10/(HI-LO)*(g.xr-g.xl),cnt={};
      qs.forEach(v=>{const k=Math.floor(v/10);cnt[k]=(cnt[k]||0)+1;});
      const top=Math.max(...Object.values(cnt)),r=Math.max(2.5,Math.min(bw/2-1.2,(g.base-g.top+4)/(2*top)-0.9)),seen={}; let b=axis(g),k=0;
      qs.forEach(v=>{const bin=Math.floor(v/10),j=seen[bin]=(seen[bin]||0)+1,o=v>st.stock; if(o) k++;
        b+=C(g.x(bin*10+5),g.base-r-1.5-(j-1)*(2*r+1.5),r,o?'f-ink':'f-cob');});
      el('dot').innerHTML=S(VW,g.H,b+rule(g),s.f1Aria.dot(n,k,stock),true); read('dot',s.f1Count(k,n),s.f1Read.dot); st.k=k;}
    // the cumulative curve, in the complementary form: the chance that demand exceeds x
    {const yv=q=>g.base-q*(g.base-g.top); let b='',c='';
      [0,0.5,1].forEach(q=>{b+=L(g.xl,yv(q),g.xr,yv(q),'l-g')+T(g.xl-8,yv(q)+4,pct(q),'t-tk','end');});
      for(let v=LO;v<=HI;v+=1) c+=(v===LO?'M':'L')+p1(g.x(v))+','+p1(yv(over(v)));
      const x=g.x(st.stock),y=yv(p),right=x>g.xr-60;
      b+=`<path d="${c}" class="l-s"/>`+axis(g)+rule(g)+L(g.xl,y,x,y,'l-d')+C(x,y,5,'f-ink')+T(right?x-10:x+10,y-9,P,'t-v',right?'end':'start');
      el('cdf').innerHTML=S(VW,g.H,b,s.f1Aria.cdf(stock,P),true); read('cdf',P,s.f1Read.cdf);}
    so.textContent=s.f1Units(stock);
    status.innerHTML=s.f1Status(stock,P,st.k,st.n,s.f1Where[st.stock>P95?'above':st.stock<P5?'below':'inside']);
  }
  root.addEventListener('input',e=>{if(e.target.id==='f1-s'){st.stock=+e.target.value;render();}});
  onOpt(root,(id,on)=>{if(id==='fifty'){st.n=on?50:20;render();}});
  render(); watch(el('int'),240,render);
}

/* ================= F2a: four scenarios, four fills =================
   The notation of the International Business Communication Standards: actual solid, forecast hatched, budget
   outlined, previous year light grey. Actual and forecast are the sample's; budget and previous year are illustrative. */
function figF2a(root){
  const B=plan(),AC=ACTUAL_SALES,FC=B.byWeek,BU=[56,56,57,58,68,70,73,75],PY=[52.4,54.1,53.6,55.0,64.2,66.5,70.1,72.0],st={grey:false};
  const hatch='background:repeating-linear-gradient(135deg,var(--cobalt) 0 1.6px,var(--wash) 1.6px 4.2px);box-shadow:inset 0 0 0 1.5px var(--cobalt)';
  root.innerHTML=head(s.f2aTitle,s.f2aHint,`<div class="demo-ctl">${opt('grey',s.f2aGrey,'',false,'inline')}</div>`)
    +`<section class="sheet s1"><div class="field scroll"><div class="tbar"><div class="key" id="f2a-key">${key([['background:var(--slate)',s.f2aKey[0]],[hatch,s.f2aKey[1]],['background:var(--field);box-shadow:inset 0 0 0 1.5px var(--ink2)',s.f2aKey[2]],['background:var(--slate2)',s.f2aKey[3]]])}</div></div><div id="f2a-view" style="padding:0 0 10px"></div></div></section>
    <p class="status" id="f2a-status" aria-live="polite"></p>`;
  const view=$('#f2a-view',root),status=$('#f2a-status',root),keyEl=$('#f2a-key',root);
  const val=v=>fx(v,Number.isInteger(v)?0:1);
  function render(){
    const W=Math.max(640,Math.floor(view.parentElement.clientWidth)),cw=W/8,H=252,y0=212,k=(y0-60)/80,gap=3,gw=Math.min(cw*0.82,3*36+2*gap),bw=(gw-2*gap)/3,inside=bw>=29,long=cw>=118;
    let b=`<defs><pattern id="f2a-hatch" patternUnits="userSpaceOnUse" width="5.5" height="5.5" patternTransform="rotate(45)"><rect width="5.5" height="5.5" style="fill:var(--wash)"/><rect width="2.1" height="5.5" style="fill:var(--cobalt)"/></pattern></defs>`;
    b+=L(10,y0,W-10,y0,'l-a')+T(cw/2-gw/2,22,s.f2aActual,'t-grp')+T(4*cw+cw/2-gw/2,22,s.f2aForecast,'t-grp cob');
    for(let i=0;i<8;i++){
      const cx=i*cw+cw/2,x0=cx-gw/2,xs=[x0,x0+bw+gap,x0+2*(bw+gap)],m=i<4?AC[i]:FC[i-4];
      b+=bar(xs[0],y0-PY[i]*k,bw,PY[i]*k,'f-slate2',4);
      b+=i<4?bar(xs[1],y0-m*k,bw,m*k,'f-slate',4):`<path d="${barD(xs[1]+0.75,y0-m*k+0.75,bw-1.5,m*k-0.75,4)}" class="rx-hatch" style="fill:url(#f2a-hatch)"/>`;
      b+=`<path d="${barD(xs[2]+0.75,y0-BU[i]*k+0.75,bw-1.5,BU[i]*k-0.75,4)}" class="rx-out"/>`;
      b+=T(xs[1]+bw/2,y0-m*k-9,f1(m),i<4?'t-v':'t-v cob','middle');
      if(inside) b+=T(xs[0]+bw/2,y0-PY[i]*k+18,f1(PY[i]),'t-lb ink','middle')+T(xs[2]+bw/2,y0-BU[i]*k+18,val(BU[i]),'t-tk','middle');
      b+=T(cx,y0+23,dm(WEEK(i),LANG==='fr'&&long),'t-tk','middle');
    }
    view.innerHTML=S(W,H,b,s.f2aAria);
    view.style.filter=keyEl.style.filter=st.grey?'grayscale(1)':'';
    const t=a=>f1(sum(a));
    status.innerHTML=st.grey?s.f2aGreyStatus(t(FC),t(BU.slice(4))):s.f2aStatus(t(AC),t(BU.slice(0,4)),t(PY.slice(0,4)),t(FC),t(BU.slice(4)),t(PY.slice(4)));
  }
  onOpt(root,(id,on)=>{st[id]=on;render();});
  render(); watch(view.parentElement,640,render);
}

/* ================= F2b: what moves gross profit =================
   Each of fifteen drivers (price, unit cost and weekly demand of each line) is scaled down and up while the rest
   stay at base; gross profit is served sales minus the cost of goods served. Rows are sorted by swing and slide
   to their new places when the ranges change. */
function figF2b(root){
  const SETS={ten:{price:.1,cost:.1,demand:.1},real:{price:.05,cost:.03,demand:.3}},BASE=plan().gp,DR=['price','cost','demand'],st={set:'ten'},pos={};
  const rows=set=>{const r=SETS[set],out=[];
    LINES.forEach((p,li)=>DR.forEach((d,di)=>{const lo=plan({scale:{[p.id]:{[d]:1-r[d]}}}).gp-BASE,hi=plan({scale:{[p.id]:{[d]:1+r[d]}}}).gp-BASE;
      out.push({key:p.id+'-'+d,li,di,line:p.id,driver:d,dn:Math.min(lo,hi,0),up:Math.max(lo,hi,0),swing:Math.abs(hi-lo)});}));
    return out.sort((a,b)=>Math.round((b.swing-a.swing)*100)||a.li-b.li||a.di-b.di);};
  root.innerHTML=head(s.f2bTitle,s.f2bHint,`<div class="demo-ctl">${segCtl('set',s.f2bSets,'ten',s.f2bAria)}</div>`)
    +`<section class="sheet s1"><div class="field scroll"><div class="tbar"><div class="key">${key([['background:var(--ink)',s.f2bKey[0]],['background:var(--cobalt)',s.f2bKey[1]]])}</div><span class="ctx" style="margin:0">${s.f2bCtx(f1(BASE))}</span></div><div id="f2b-view" style="padding:0 0 12px"></div></div></section>
    <p class="status" id="f2b-status" aria-live="polite"></p>`;
  const view=$('#f2b-view',root),status=$('#f2b-status',root);
  function render(animate){
    const FW=Math.floor(view.parentElement.clientWidth),stack=FW>0&&FW<480,W=stack?Math.max(300,FW):Math.max(600,FW),LWc=stack?0:W<760?156:212,PL=LWc+52,PR=W-56,D=14,cx=(PL+PR)/2,x=v=>cx+v/D*(PR-PL)/2;
    const RH=stack?42:26,BY=stack?22:5,TY=stack?35:RH/2+5,TOP=34,list=rows(st.set),H=TOP+list.length*RH+38,lines=Object.fromEntries(LINES.map(p=>[p.id,s.lines[p.id][0]]));
    let b='';
    [-10,-5,5,10].forEach(v=>{b+=L(x(v),TOP-6,x(v),TOP+list.length*RH,'l-g')+T(x(v),H-14,sgn(v,0),'t-tk','middle');});
    b+=T(cx,H-14,'0','t-tk','middle')+T(cx,16,s.f2bBase(f1(BASE)),'t-lb ink','middle')+L(cx,TOP-8,cx,TOP+list.length*RH+4,'l-i');
    list.forEach((r,i)=>{
      const y=TOP+i*RH,from=animate&&pos[r.key]!==undefined?pos[r.key]:y; pos[r.key]=y;
      let g=T(stack?6:14,stack?15:RH/2+5,`${lines[r.line]} · ${s.drivers[r.driver]}`,'t-lb ink','start',HALO);
      if(r.dn<-0.005) g+=hseg(x(r.dn),BY,x(0)-x(r.dn),16,'f-ink',4,0)+T(x(r.dn)-7,TY,sgn(r.dn),'t-n','end');
      else g+=T(x(0)-7,TY,f1(0),'t-tk','end');
      if(r.up>0.005) g+=hseg(x(0),BY,x(r.up)-x(0),16,'f-cob',0,4)+T(x(r.up)+7,TY,sgn(r.up),'t-n cob','start');
      else g+=T(x(0)+7,TY,f1(0),'t-tk','start');
      b+=`<g class="rx-row" data-k="${r.key}" data-y="${y}" style="transform:translate(0,${from}px)">${g}</g>`;
    });
    view.innerHTML=S(W,H,b,s.f2bSvgAria(f1(BASE),s.f2bSets.find(o=>o[0]===st.set)[1]),stack);
    if(animate) requestAnimationFrame(()=>requestAnimationFrame(()=>$$('.rx-row',view).forEach(g=>{g.style.transform=`translate(0,${g.dataset.y}px)`;})));
    const top=list[0],ph=r=>s.f2bPhrase[r.driver](s.lines[r.line][1]);
    let t=s.f2bTop(cap(ph(top)),sgn(top.dn),sgn(top.up));
    const lead=list.findIndex(r=>r.driver==='demand'); if(lead>=2) t+=s.f2bFirst(lead);
    const capped=list.find(r=>r.up<=0.005&&r.dn<-0.005); if(capped) t+=s.f2bCap(cap(ph(capped)),f1(-capped.dn));
    status.innerHTML=t; setSeg(root,'set',st.set);
  }
  root.addEventListener('click',e=>{const b=e.target.closest('[data-set]'); if(b&&b.dataset.set!==st.set){st.set=b.dataset.set;render(true);}});
  render(false); watch(view.parentElement,300,()=>render(false));
}

/* ================= F3a: four kinds of demand =================
   Syntetos, Boylan and Croston (2005): ADI, the number of weeks over the number of weeks with a sale, against CV²,
   the squared coefficient of variation of the non-zero weekly quantities (population variance), with cut-offs at
   1.32 and 0.49. Four illustrative 26-week series from fixed seeds, and the sample's five lines over four weeks. */
function figF3a(root){
  const gen={smooth:r=>Array.from({length:26},()=>16+Math.floor(r()*9)),erratic:r=>Array.from({length:26},()=>Math.round(2+58*Math.pow(r(),3))),
    intermittent:r=>Array.from({length:26},()=>r()<1/3?4+Math.floor(r()*3):0),lumpy:r=>Array.from({length:26},()=>r()<1/3?Math.round(1+39*Math.pow(r(),2.2)):0)};
  const SEED={smooth:1,erratic:2,intermittent:21,lumpy:147},CLS=['smooth','erratic','intermittent','lumpy'],CUTA=1.32,CUTC=0.49;
  const stats=a=>{const nz=a.filter(v=>v>0),n=nz.length,m=sum(nz)/n,v=sum(nz.map(x=>(x-m)*(x-m)))/n;return {k:n,adi:a.length/n,cv2:v/(m*m),lo:Math.min(...nz),hi:Math.max(...nz)};};
  const SER=Object.fromEntries(CLS.map(c=>{const a=gen[c](rng(SEED[c]));return [c,{a,...stats(a)}];}));
  const SAMPLE=plan().rows.map(r=>({name:r.name,noun:r.noun,...stats(LINES.find(p=>p.id===r.id).weekly)}));
  const st={cls:'sample',kh:false},KH=a=>2-1.5*a;   // Kostenko and Hyndman's simpler rule: SBA above CV² = 2 − 1.5 × ADI
  root.innerHTML=head(s.f3aTitle,s.f3aHint,`<div class="demo-ctl">${segCtl('cls',['sample',...CLS].map(c=>[c,s.classes[c]]),'sample',s.f3aAria)}</div>`)
    +`<section class="sheet s2"><div class="field"><div class="tbar"><div><h4>${s.f3aPlot}</h4></div>${opt('kh',s.f3aKH,'',false,'inline')}</div><div id="f3a-plot" class="rx-plot" style="padding-bottom:12px"></div></div>
      <div class="field"><div class="tbar"><div><h4>${s.f3aSeries}</h4><span class="ctx">${s.f3aSeriesCtx}</span></div></div><div id="f3a-series" class="rx-plot" style="padding-bottom:12px"></div></div></section>
    <p class="status" id="f3a-status" aria-live="polite"></p>`;
  const plot=$('#f3a-plot',root),series=$('#f3a-series',root),status=$('#f3a-status',root);
  const f2=v=>fx(v,2);
  function render(){
    // the plane
    {// axes are offset from the data, so the marks at ADI 1 and CV² near 0 clear the axis lines
      const VW=drawW(plot,300),H=304,l=46,r=VW-14,t=30,bt=H-34,O=12,x=a=>l+O+(a-1)/4*(r-l-O),y=c=>bt-O-Math.min(c,2)/2*(bt-O-t); let b='';
      const q={smooth:[1,CUTA,0,CUTC],erratic:[1,CUTA,CUTC,2],intermittent:[CUTA,5,0,CUTC],lumpy:[CUTA,5,CUTC,2]};
      if(st.kh) b+=`<path d="M${p1(x(1))},${p1(y(KH(1)))} L${p1(x(4/3))},${p1(y(0))} L${p1(x(5))},${p1(y(0))} L${p1(x(5))},${p1(y(2))} L${p1(x(1))},${p1(y(2))} Z" class="washfill"/>`;
      else if(st.cls!=='sample'){const z=q[st.cls]; b+=R(x(z[0]),y(z[3]),x(z[1])-x(z[0]),y(z[2])-y(z[3]),'f-sheet');}
      [0,0.5,1,1.5,2].forEach(c=>{b+=L(x(1),y(c),x(5),y(c),'l-g')+T(l-8,y(c)+4,c?fx(c,1):'0','t-tk','end');});
      [1,2,3,4,5].forEach(a=>{b+=L(x(a),y(2),x(a),y(0),'l-g')+T(x(a),bt+20,fx(a),'t-tk','middle');});
      b+=L(l,y(0),l,y(2),'l-a')+L(x(1),bt,x(5),bt,'l-a')+T(l-8,t-14,'CV²','t-tk','end')+T(x(1)-10,bt+20,'ADI','t-tk','end');
      if(!st.kh) b+=L(x(CUTA),y(2)-6,x(CUTA),y(0),'l-d')+L(x(1),y(CUTC),x(5),y(CUTC),'l-d')+T(x(CUTA)+6,y(2)+6,'ADI '+f2(CUTA),'t-tk','start',HALO)+T(x(5)-2,y(CUTC)-7,'CV² '+f2(CUTC),'t-tk','end',HALO);
      // The smooth corner holds the smooth series and the sample's five lines (all at ADI 1): one annotation names both,
      // on a white ground so the cut-off line does not run through it.
      // with the diagonal on, the annotation moves past the diagonal's foot, and the diagonal is drawn over everything
      const on=st.cls==='sample',sm=st.cls==='smooth',bw=Math.max(s.classes.smooth.length,s.f3aSample.length)*7.6+10,ax=st.kh?x(4/3)+6:x(1)+6;
      b+=R(ax,y(0)-45,bw,36,'f-field',4);
      const dots=()=>SAMPLE.map(p=>C(x(p.adi),y(p.cv2),3.4,on?'f-cob':'f-slate','style="stroke:var(--field);stroke-width:1"')).join('');
      if(!on) b+=dots();
      CLS.forEach(c=>{const p=SER[c],sel=st.cls===c,px=x(p.adi),py=y(p.cv2);
        b+=(sel?C(px,py,13,'f-cob','style="opacity:.16"'):'')+C(px,py,c==='smooth'?5:6,sel?'f-cob':'f-slate',c==='smooth'?'style="stroke:var(--field);stroke-width:1.5"':'');
        if(c!=='smooth') b+=T(px+11,py+5,s.classes[c],sel?'t-n cob':'t-lb ink','start',HALO);});
      if(on) b+=dots();
      b+=T(ax+5,y(0)-30,s.classes.smooth,sm?'t-n cob':'t-lb ink','start')+T(ax+5,y(0)-14,s.f3aSample,on?'t-n cob':'t-lb ink','start');
      if(st.kh) b+=L(x(1),y(KH(1)),x(4/3),y(0),'l-s')+T(x(1)+10,y(KH(1))-9,khLine,'t-lb cob','start',HALO);
      plot.innerHTML=S(VW,H,b,s.f3aSvgAria,true);}
    // the four series, laid out as the quadrants are
    {const VW=drawW(series,300),gap=14,pw=(VW-gap)/2,ph=128,H=2*ph+gap,lay={erratic:[0,0],lumpy:[1,0],smooth:[0,1],intermittent:[1,1]}; let b='';
      CLS.forEach(c=>{const p=SER[c],[cx,cy]=lay[c],x0=cx*(pw+gap),y0=cy*(ph+gap),sel=st.cls===c,mx=Math.max(...p.a),bw=(pw-16)/26,base=y0+ph-14,top=y0+48;
        let g=sel?R(x0,y0,pw,ph,'f-sheet',10):'';
        g+=T(x0+10,y0+22,s.classes[c],sel?'t-row cob':'t-row')+T(x0+10,y0+40,s.f3aStats(f2(p.adi),f2(p.cv2)),'t-tk')+(pw>=200?T(x0+pw-10,y0+22,s.f3aMax(mx),'t-tk','end'):'');
        p.a.forEach((v,i)=>{const bx=x0+8+i*bw; g+=v>0?bar(bx+0.8,base-v/mx*(base-top),bw-1.6,v/mx*(base-top),sel?'f-cob':'f-slate',2):L(bx+1,base,bx+bw-1,base,'l-a');});
        b+=`<g class="rx-pick" data-cls="${c}" tabindex="0" role="button" aria-pressed="${sel}" aria-label="${esc(s.f3aSeriesAria(s.classes[c],p.k))}">${R(x0,y0,pw,ph,'rx-hitbox',10)}${g}</g>`;});
      series.innerHTML=S(VW,H,b,s.f3aSeriesCtx,true,'group');}
    if(st.kh){
      if(st.cls==='sample') {const a=SAMPLE.slice().sort((p,q)=>p.cv2-q.cv2); status.innerHTML=SAMPLE.every(p=>p.cv2<KH(p.adi))?s.f3aKHSample(khLine):s.f3aSampleStatus(f2(a[0].cv2),a[0].noun,f2(a[a.length-1].cv2),a[a.length-1].noun);}
      else{const p=SER[st.cls]; status.innerHTML=s.f3aKHStatus(s.classes[st.cls],p.cv2>KH(p.adi),khLine);}}
    else if(st.cls==='sample'){const a=SAMPLE.slice().sort((p,q)=>p.cv2-q.cv2),lo=a[0],hi=a[a.length-1]; status.innerHTML=s.f3aSampleStatus(f2(lo.cv2),lo.noun,f2(hi.cv2),hi.noun);}
    else{const p=SER[st.cls]; status.innerHTML=s.f3aStatus(s.classes[st.cls],p.k,f2(p.adi),p.lo,p.hi,f2(p.cv2),p.adi>CUTA,p.cv2>CUTC);}
    setSeg(root,'cls',st.cls);
  }
  const khLine=`CV² = 2 − ${fx(1.5,1)} × ADI`;
  const choose=c=>{st.cls=c;render(); const g=$(`[data-cls="${c}"]`,series); if(g&&document.activeElement&&document.activeElement.closest&&document.activeElement.closest('[data-cls]')) g.focus();};
  onOpt(root,(id,on)=>{st[id]=on;render();});
  root.addEventListener('click',e=>{const b=e.target.closest('[data-cls]'); if(b) choose(b.dataset.cls);});
  root.addEventListener('keydown',e=>{const g=e.target.closest&&e.target.closest('g[data-cls]'); if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();choose(g.dataset.cls);}});
  render(); watch(plot,300,render);
}

/* ================= F3b: what adjustments did to accuracy =================
   Fildes, Goodwin, Lawrence and Nikolopoulos (2009), Figure 2: the median gain in accuracy, the system forecast's
   absolute percentage error minus the final forecast's (FCIMP, points), for upward and downward adjustments by
   quarter of adjustment size, for the three manufacturers pooled and for the retailer. Values read from the figure. */
function figF3b(root){
  const B=figData().B,rows=B&&B.values&&B.values.accuracy_by_size_quartile_fig2&&B.values.accuracy_by_size_quartile_fig2.rows;
  if(!Array.isArray(rows)||!rows.length){root.innerHTML=noData(s.f3bTitle);return;}
  const groups=[...new Set(rows.map(r=>r.group))],quarts=[...new Set(rows.map(r=>r.size_quartile))];
  const gName=g=>/A.?C|manufactur/i.test(g)?s.f3bGroups.ac:/retail|D1/i.test(g)?s.f3bGroups.d:[esc(g),''];
  const v=(g,q,d)=>{const r=rows.find(x=>x.group===g&&x.size_quartile===q&&x.direction===d);return r?+r.median_FCIMP_pct_points:null;};
  const all=rows.map(r=>+r.median_FCIMP_pct_points),lo=Math.min(-10,Math.floor(Math.min(...all)/20)*20),hi=Math.max(10,Math.ceil(Math.max(...all)/20)*20);
  root.innerHTML=head(s.f3bTitle,s.f3bHint,`<div class="key">${key([['background:var(--cobalt)',s.f3bKey[0]],['background:var(--slate)',s.f3bKey[1]]])}</div>`)
    +`<section class="sheet s2">${groups.map((g,i)=>`<div class="field"><div class="tbar"><div><h4>${gName(g)[0]}</h4><span class="ctx">${gName(g)[1]}</span></div></div><div class="rx-plot" id="f3b-${i}" style="padding-bottom:10px"></div></div>`).join('')}</section>
    <p class="status" id="f3b-status" aria-live="polite"></p>`;
  const status=$('#f3b-status',root);
  function render(){
    groups.forEach((g,gi)=>{
      const el=$('#f3b-'+gi,root),VW=drawW(el,300),H=306,l=48,r=VW-8,t=16,bt=H-50,y=v=>t+(hi-v)/(hi-lo)*(bt-t),cw=(r-l)/quarts.length,bw=Math.min(34,cw*0.32);
      let b='';
      for(let v=lo;v<=hi;v+=20){b+=L(l,y(v),r,y(v),v===0?'l-a':'l-g')+T(l-8,y(v)+4,sgn(v,0),'t-tk','end');}
      b+=T(l+4,y(hi)+12,'↑ '+s.f3bBetter,'t-tk')+T(l+4,y(lo)-6,'↓ '+s.f3bWorse,'t-tk');
      quarts.forEach((q,qi)=>{const cx=l+qi*cw+cw/2;
        ['positive','negative'].forEach((d,di)=>{const val=v(g,q,d); if(val===null) return; const x0=cx+(di?2:-bw-2),y0=y(0),yv=y(val),c=d==='positive'?'f-cob':'f-slate';
          b+=val>=0?bar(x0,yv,bw,y0-yv,c,3):`<path d="${barDownD(x0,y0,bw,yv-y0,3)}" class="${c}"/>`;
          const cls=d==='positive'?'t-n cob':'t-n',beside=val<0&&yv+16>bt-8;
          b+=beside?T(di?x0+bw+6:x0-6,yv-3,sgn(val),cls,di?'start':'end',HALO):T(x0+bw/2,val>=0?yv-7:yv+16,sgn(val),cls,'middle');});
        b+=T(cx,bt+20,s.f3bQ[qi]||q,'t-tk','middle');});
      b+=T((l+r)/2,bt+40,s.f3bQAxis,'t-tk','middle');
      el.innerHTML=S(VW,H,b,s.f3bAria(gName(g).join(', ')),true);
    });
    const ac=groups.find(g=>/A.?C|manufactur/i.test(g)),d=groups.find(g=>/retail|D1/i.test(g)),last=quarts[quarts.length-1];
    if(ac&&d){const dp=quarts.map(q=>v(d,q,'positive')).filter(x=>x!==null),allNeg=dp.every(x=>x<0);
      status.innerHTML=(allNeg?s.f3bStatus(f1(v(ac,last,'negative')),f1(v(ac,last,'positive')),f1(-Math.min(...dp))):s.f3bStatusPlain)+s.f3bNote;}
    else status.innerHTML=s.f3bStatusPlain+s.f3bNote;
  }
  render(); watch($('#f3b-0',root),300,render);
}

/* ================= F3c: one buy, one ratio =================
   The newsvendor rule for jackets: price $300 and unit cost $180, so a lost sale costs cu = $120; an unsold jacket
   costs co = 180 − s, where s is its clearance value. Critical ratio CR = cu/(cu + co); demand normal with mean 400
   and spread σ; order Q* = 400 + σ·Φ⁻¹(CR). Expected profit E[π(Q)] = (p − c)Q − (p − s)σ(zΦ(z) + φ(z)), z = (Q − μ)/σ. */
function figF3c(root){
  const PRICE=300,COST=180,MU=400,DEF={s:120,sd:120},st={...DEF};
  root.innerHTML=head(s.f3cTitle,s.f3cHint,`<button class="btn" type="button" id="f3c-reset">${s.reset}</button>`)
    +`<section class="sheet s32"><div class="field"><div class="tbar ctl rx-nw">
        <label class="rng"><span>${s.f3cClear}</span><input type="range" id="f3c-s" min="0" max="170" step="10" value="120" aria-label="${esc(s.f3cClearAria)}"><output id="f3c-so"></output></label>
        <label class="rng"><span>${s.f3cSpread}</span><input type="range" id="f3c-sd" min="40" max="200" step="10" value="120" aria-label="${esc(s.f3cSpreadAria)}"><output id="f3c-sdo"></output></label></div>
        <div id="f3c-view" class="rx-plot" style="padding-bottom:10px"></div></div>
      <div class="field"><div class="pairs quad" id="f3c-pairs"></div></div></section>
    <p class="status" id="f3c-status" aria-live="polite"></p>`;
  const view=$('#f3c-view',root),pairs=$('#f3c-pairs',root),status=$('#f3c-status',root);
  const profit=(Q,sd,sv)=>{const z=(Q-MU)/sd;return ((PRICE-COST)*Q-(PRICE-sv)*sd*(z*PHI(z)+phi(z)))/1000;};
  function render(sync){
    const cu=PRICE-COST,co=COST-st.s,cr=cu/(cu+co),Q=MU+st.sd*PHIinv(cr),Qr=Math.round(Q),EP=profit(Q,st.sd,st.s);
    const VW=drawW(view,300),l=46,r=VW-14,x=v=>l+v/1000*(r-l),t1=26,b1=206,t2=236,b2=322,H=352,y1=p=>b1-p*(b1-t1),PMAX=50,y2=v=>b2-Math.max(-4,Math.min(PMAX,v))/PMAX*(b2-t2);
    let b=`<defs><clipPath id="f3c-clip"><rect x="${l}" y="${t2-4}" width="${p1(r-l)}" height="${p1(b2-t2+4)}"/></clipPath></defs>`;
    [0,0.5,1].forEach(p=>{b+=L(l,y1(p),r,y1(p),'l-g')+T(l-8,y1(p)+4,fx(p,1),'t-tk','end');});
    [0,200,400,600,800,1000].forEach(v=>{b+=L(x(v),b1,x(v),b1+5,'l-a')+L(x(v),b2,x(v),b2+5,'l-a')+T(x(v),b2+21,fx(v),'t-tk','middle');});
    b+=L(x(MU),t1-6,x(MU),b1,'l-d')+T(x(MU)+6,t1+4,s.f3cMean(fx(MU)),'t-tk');
    let c='';for(let v=0;v<=1000;v+=5) c+=(v?'L':'M')+p1(x(v))+','+p1(y1(PHI((v-MU)/st.sd)));
    b+=`<path d="${c}" class="l-s"/>`+L(l,b1,r,b1,'l-a');
    const qx=x(Q),cy=y1(cr),leftLab=qx>l+150;
    b+=L(l,cy,qx,cy,'l-i')+L(qx,cy,qx,b2,'l-i')+C(qx,cy,5,'f-ink');
    b+=T(l+8,cy-8,s.f3cCR(fx(cr,2)),'t-v')+T(qx+(qx>r-110?-8:8),b1-10,s.f3cQ(fx(Qr)),'t-v cob',qx>r-110?'end':'start');
    // expected profit by order size, clipped to its panel
    let pc='';for(let v=0;v<=1000;v+=5) pc+=(v?'L':'M')+p1(x(v))+','+p1(y2(profit(v,st.sd,st.s)));
    b+=L(l,y2(0),r,y2(0),'l-a')+L(l,y2(PMAX),r,y2(PMAX),'l-g')+T(l-8,y2(0)+4,'0','t-tk','end')+T(l-8,y2(PMAX)+4,fx(PMAX),'t-tk','end');
    b+=`<path d="${pc}" class="l-o" clip-path="url(#f3c-clip)"/>`+C(qx,y2(EP),5,'f-cob');
    const right=qx>r-130; b+=T(qx+(right?-10:10),y2(EP)-8,s.f3cPeak(f1(EP),fx(Qr)),'t-v',right?'end':'start');
    b+=T(l+8,t2-8,s.f3cProfit,'t-tk','start',HALO);
    view.innerHTML=S(VW,H,b,s.f3cAria(fx(cr,2),fx(Qr)),true);
    pairs.innerHTML=`<div><b>${s.money(fx(cu))}</b><span>${s.f3cPairs[0]}</span></div><div><b>${s.money(fx(co))}</b><span>${s.f3cPairs[1]}</span></div>
      <div><b>${fx(cr,2)}</b><span>${s.f3cPairs[2]}</span></div><div><b class="cob">${fx(Qr)}</b><span>${s.f3cPairs[3]}</span></div>`;
    $('#f3c-so',root).textContent=s.money(fx(st.s)); $('#f3c-sdo',root).textContent=s.f3cSigma(fx(st.sd));
    if(sync){$('#f3c-s',root).value=st.s;$('#f3c-sd',root).value=st.sd;}
    const d=Qr-MU;
    status.innerHTML=s.f3cStatus(s.money(fx(cu)),s.money(fx(co)),fx(cr,2),fx(Qr))+(Math.abs(cr-0.5)<1e-9?s.f3cEven:d>0?s.f3cAbove(fx(d)):s.f3cBelow(fx(-d)));
  }
  root.addEventListener('input',e=>{if(e.target.id==='f3c-s'){st.s=+e.target.value;render(false);} else if(e.target.id==='f3c-sd'){st.sd=+e.target.value;render(false);}});
  $('#f3c-reset',root).addEventListener('click',()=>{Object.assign(st,DEF);render(true);});
  render(true); watch(view,300,()=>render(false));
}

/* ================= F4a: the matrix, reordered =================
   Bertin's reorderable matrix: rows are the five lines, columns the stock on hand on 28 September and at the end of
   each of the four weeks ahead, in weeks of the average demand ahead. Bars share a maximum of 8 weeks; longer ones are
   clipped and keep their figure. Cells under the four-week horizon are dark. Rows slide to each new order. */
function figF4a(root){
  const st={order:'listed',early:false},pos={};
  root.innerHTML=head(s.f4aTitle,s.f4aHint,`<div class="demo-ctl"><span class="rng two"><span>${s.f4aOrder}</span>${segCtl('ord',s.f4aOrders,'listed',s.f4aAria)}</span></div>`)
    +`<section class="sheet s1"><div class="field scroll"><div class="tbar"><div class="key">${key([['background:var(--ink)',s.f4aKey[0]],['background:var(--slate2)',s.f4aKey[1]]])}<span><i class="k-line"></i>${s.f4aKey[2]}</span></div>${opt('early',s.f4aEarly,'',false,'inline')}</div><div id="f4a-view" style="padding:0 0 10px"></div></div></section>
    <p class="status" id="f4a-status" aria-live="polite"></p>`;
  const view=$('#f4a-view',root),status=$('#f4a-status',root);
  // Rows in the order that makes neighbours most alike: the shortest path through the five rows, lowest stock first.
  const seriate=rows=>{const idx=rows.map((_,i)=>i),d=(a,b)=>Math.hypot(...rows[a].cover.map((v,j)=>Math.min(v,8)-Math.min(rows[b].cover[j],8)));
    let best=null,bl=Infinity;const perm=(a,k)=>{if(k===a.length){let l=0;for(let i=1;i<a.length;i++) l+=d(a[i-1],a[i]); const m0=sum(rows[a[0]].cover),m1=sum(rows[a[a.length-1]].cover);
      if(l<bl-1e-9||(Math.abs(l-bl)<1e-9&&m0<m1&&best&&sum(rows[best[0]].cover)>m0)){bl=l;best=a.slice();} return;}
      for(let i=k;i<a.length;i++){[a[k],a[i]]=[a[i],a[k]];perm(a,k+1);[a[k],a[i]]=[a[i],a[k]];}};
    perm(idx,0); if(sum(rows[best[0]].cover)>sum(rows[best[best.length-1]].cover)) best.reverse(); return best;};
  const orderOf=(o,rows)=>{const idx=rows.map((_,i)=>i);
    if(o==='name') return idx.sort((a,b)=>rows[a].name.localeCompare(rows[b].name,s.locale));
    if(o==='now') return idx.sort((a,b)=>rows[a].cover[0]-rows[b].cover[0]);
    if(o==='oct12') return idx.sort((a,b)=>rows[a].cover[3]-rows[b].cover[3]);
    if(o==='seriate') return seriate(rows);
    return idx;};
  function render(animate){
    const P=plan({bootsEarly:st.early}),rows=P.rows,ord=orderOf(st.order,rows);
    const W=Math.max(640,Math.floor(view.parentElement.clientWidth)),NW=W<760?118:150,cw=(W-NW-12)/5,RH=50,TOP=56,H=TOP+5*RH+8;
    const barMax=Math.min(cw-62,150),bh=16,X=(j,v)=>NW+j*cw+10+Math.min(v,8)/8*barMax;
    let b=T(NW+10,22,s.f4aOnHand,'t-tk')+T(NW+cw+10,22,s.f4aEnd,'t-tk');
    for(let j=0;j<5;j++){b+=T(NW+j*cw+10,42,dm(WEEK(4+Math.max(0,j-1)),LANG==='fr'&&cw>=150),'t-lb ink');}
    b+=L(NW+cw-2,12,NW+cw-2,H-6,'l-g');
    rows.forEach((r,ri)=>{
      const y=TOP+ord.indexOf(ri)*RH,from=animate&&pos[r.id]!==undefined?pos[r.id]:y; pos[r.id]=y;
      let g=L(0,0,W,0,'l-g')+T(14,RH/2+5,r.name,'t-row');
      r.cover.forEach((v,j)=>{const x0=NW+j*cw+10,under=v<4-1e-9,len=Math.min(v,8)/8*barMax,yb=RH/2-bh/2;
        g+=L(x0+barMax/2,yb-6,x0+barMax/2,yb+bh+6,'l-d');
        if(len>0.5) g+=hseg(x0,yb,len,bh,under?'f-ink':'f-slate2',3,v>8?0:3);
        if(v>8) g+=`<path d="M${p1(x0+len-9)},${p1(yb+bh+1)} l5,${-bh-2} M${p1(x0+len-4)},${p1(yb+bh+1)} l5,${-bh-2}" class="rx-break"/>`;
        g+=T(x0+Math.max(len,0)+8,RH/2+5,f1(v),under?'t-n':'t-lb ink','start',HALO);});
      b+=`<g class="rx-row" data-k="${r.id}" data-y="${y}" style="transform:translate(0,${from}px)">${g}</g>`;
    });
    b+=L(0,TOP+5*RH,W,TOP+5*RH,'l-g');
    view.innerHTML=S(W,H,b,s.f4aSvgAria);
    if(animate) requestAnimationFrame(()=>requestAnimationFrame(()=>$$('.rx-row',view).forEach(g=>{g.style.transform=`translate(0,${g.dataset.y}px)`;})));
    // what the order shows: where the two lines under four weeks throughout sit
    const risk=rows.map((r,i)=>i).filter(i=>rows[i].cover.every(v=>v<4)),place=risk.map(i=>ord.indexOf(i)+1).sort((a,b)=>a-b);
    const names=s.list(risk.slice().sort((a,b)=>ord.indexOf(a)-ord.indexOf(b)).map(i=>s.the(rows[i].noun)));
    const lead=place.every((p,i)=>p===i+1),dark=sum(rows.map(r=>r.cover.filter(v=>v<4).length));
    let t=s.f4aStatus(s.f4aSay[st.order],names,lead?s.f4aLead:s.f4aRows(s.list(place.map(String))),dark);
    if(st.order==='seriate'&&orderOf('now',rows).join()===ord.join()) t+=s.f4aSame;
    if(st.early){const b0=plan().rows.find(r=>r.id==='boots'),b1=rows.find(r=>r.id==='boots'); t+=s.f4aEarlyNote(f1(b1.cover[4]),f1(b0.cover[4]));}
    status.innerHTML=t; setSeg(root,'ord',st.order);
  }
  root.addEventListener('click',e=>{const b=e.target.closest('[data-ord]'); if(b&&b.dataset.ord!==st.order){st.order=b.dataset.ord;render(true);}});
  onOpt(root,(id,on)=>{st[id]=on;render(true);});
  render(false); watch(view.parentElement,640,()=>render(false));
}

/* ================= F4b: Ehrenberg's rules, before and after =================
   The same five lines from the plan model, as a spreadsheet exports them (alphabetical, cents, long decimals, centred
   cells, a full grid) and as Ehrenberg would set them (rows by gross profit, $K to two effective digits, whole
   percentages, right-aligned tabular figures, a total row, horizontal rules only). */
function figF4b(root){
  const P=plan(),rows=P.rows.map(r=>({id:r.id,name:r.name,noun:r.noun,prev:r.prev,dem:r.demand,chg:r.demand/r.prev-1,sales:r.sales,gp:r.gp,m:r.gp/r.sales,wk:r.cover[0]}));
  const tot={prev:sum(rows.map(r=>r.prev)),dem:sum(rows.map(r=>r.demand||r.dem)),sales:P.sales,gp:P.gp};tot.chg=tot.dem/tot.prev-1;tot.m=tot.gp/tot.sales;
  const raw=(v,d)=>{let t=nf(d,false).format(v);return t.replace('−','-');};            // a spreadsheet prints a hyphen and no grouping
  const two=v=>{if(v===0) return fx(0);const e=Math.floor(Math.log10(Math.abs(v)))-1,r=Math.round(v/Math.pow(10,e))*Math.pow(10,e);return fx(r,Math.max(0,-e));};
  root.innerHTML=head(s.f4bTitle,s.f4bHint)
    +`<section class="sheet s1"><div class="field"><div class="tbar"><div><h4>${s.f4bBefore}</h4><span class="ctx">${s.f4bBeforeCtx}</span></div></div><div class="tablebox" id="f4b-a"></div></div>
      <div class="field"><div class="tbar"><div><h4>${s.f4bAfter}</h4><span class="ctx">${s.f4bAfterCtx}</span></div></div><div class="tablebox" id="f4b-b"></div></div></section>
    <p class="status" id="f4b-status" aria-live="polite"></p>`;
  const before=rows.slice().sort((a,b)=>a.name.localeCompare(b.name,s.locale)),after=rows.slice().sort((a,b)=>b.gp-a.gp);
  const th=(h,i)=>`<th${i?' class="n"':''} scope="col">${h}</th>`;
  $('#f4b-a',root).innerHTML=`<table class="dt furn rx-raw"><thead><tr>${s.f4bHeadRaw.map(th).join('')}</tr></thead><tbody>${before.map(r=>`<tr data-line="${r.id}"><th scope="row">${r.name}</th><td class="n">${raw(r.prev,0)}</td><td class="n">${raw(r.dem,0)}</td><td class="n">${raw(r.chg,6)}</td><td class="n">${raw(r.sales*1000,2)}</td><td class="n">${raw(r.gp*1000,2)}</td><td class="n">${raw(r.m,6)}</td><td class="n">${raw(r.wk,Number.isInteger(r.wk)?0:6)}</td></tr>`).join('')}</tbody></table>`;
  const cells=r=>[fx(r.prev),fx(r.dem),spct(r.chg),two(r.sales),two(r.gp),pct(r.m),r.wk===undefined?'':fx(r.wk)];
  $('#f4b-b',root).innerHTML=`<table class="dt num-r rx-set"><thead><tr>${s.f4bHead.map(th).join('')}</tr></thead><tbody>${after.map(r=>`<tr data-line="${r.id}"><th scope="row">${r.name}</th>${cells(r).map(v=>`<td class="n">${v}</td>`).join('')}</tr>`).join('')}
    <tr class="rx-total"><th scope="row">${s.total}</th>${cells({...tot,wk:undefined}).map(v=>`<td class="n">${v}</td>`).join('')}</tr></tbody></table>`;
  // pointing at a line marks it in both tables
  const hot=id=>$$('tr[data-line]',root).forEach(tr=>tr.classList.toggle('rx-hot',tr.dataset.line===id));
  root.addEventListener('pointerover',e=>{const tr=e.target.closest&&e.target.closest('tr[data-line]'); hot(tr?tr.dataset.line:null);});
  root.addEventListener('pointerleave',()=>hot(null));
  const up=after.filter(r=>r.chg>0),dn=after.filter(r=>r.chg<0),pr=a=>a.map(r=>Math.round(r.chg*100)).sort((x,y)=>Math.abs(x)-Math.abs(y));
  const rng=a=>{const v=pr(a).map(x=>fx(Math.abs(x))+s.pc);return a.length===2?s.f4bPair(v[0],v[1]):s.f4bRange(v[0],v[v.length-1]);};
  const ms=after.map(r=>Math.round(r.m*100)),mode=ms.slice().sort((a,b)=>ms.filter(x=>x===b).length-ms.filter(x=>x===a).length)[0];
  const ex=after.filter((r,i)=>ms[i]!==mode).map(r=>`${s.the(r.noun)} (${fx(Math.round(r.m*100))}${s.pc})`);
  $('#f4b-status',root).innerHTML=s.f4bStatus(s.list(up.map(r=>s.the(r.noun))),rng(up),s.list(dn.map(r=>s.the(r.noun))),rng(dn),fx(mode)+s.pc,s.list(ex));
}

/* ================= F5: how accurately readers judge proportions =================
   Heer and Bostock (2010), Figure 4: the mean of log2(|judged − true| + 1/8) with its bootstrapped 95% interval for
   judgement types T1 to T9 in the crowdsourced study, and Cleveland and McGill's laboratory values for T1 to T5. */
function figF5(root){
  const A=figData().A,rows=A&&A.values&&Array.isArray(A.values.rows)?A.values.rows.filter(r=>r&&r.heer_bostock_mturk):null;
  if(!rows||!rows.length){root.innerHTML=noData(s.f5Title);return;}
  const st={lab:true},M=r=>r.heer_bostock_mturk,CM=r=>r.cleveland_mcgill_1984;
  root.innerHTML=head(s.f5Title,s.f5Hint,`<div class="demo-ctl">${opt('lab',s.f5Lab,'',true,'inline')}</div>`)
    +`<section class="sheet s1"><div class="field scroll"><div class="tbar"><div class="key">${key([['background:var(--slate);border-radius:6px',s.f5Key[0]],['background:var(--field);box-shadow:inset 0 0 0 2px var(--ink3);border-radius:6px',s.f5Key[1]]])}<span><i style="width:22px;height:2px;border-radius:1px;background:var(--slate)"></i>${s.f5Key[2]}</span></div></div><div id="f5-view" class="rx-plot" style="padding-bottom:10px"></div></div></section>
    <p class="status" id="f5-status" aria-live="polite"></p>`;
  const view=$('#f5-view',root),status=$('#f5-status',root);
  const enc=r=>String(r.encoding||'').toLowerCase();
  function render(){
    const VW=drawW(view,580),LWc=VW<760?196:228,l=LWc+12,r=VW-58,RH=40,TOP=10,H=TOP+rows.length*RH+40,D0=0.8,D1=3.0,x=v=>l+(v-D0)/(D1-D0)*(r-l);
    let b='';
    [1,1.5,2,2.5,3].forEach(v=>{b+=L(x(v),TOP,x(v),TOP+rows.length*RH,'l-g')+T(x(v),H-22,fx(v,1),'t-tk','middle');});
    b+=T(0,H-22,s.f5Axis,'t-tk');
    rows.forEach((row,i)=>{
      const yc=TOP+i*RH+RH/2,m=M(row),c=st.lab&&CM(row),dy=c?-6:0;
      if(i&&enc(rows[i-1]).split(' ')[0]!==enc(row).split(' ')[0]) b+=L(0,TOP+i*RH,VW,TOP+i*RH,'l-a');
      b+=T(0,yc+5,esc(s.f5Types[row.type]||row.type),'t-lb ink')+T(LWc-2,yc+5,esc(row.type),'t-tk','end');
      b+=L(x(m.ci95_low),yc+dy,x(m.ci95_high),yc+dy,'l-o')+C(x(m.mean_log2_error),yc+dy,5.5,'f-slate')+T(x(m.ci95_high)+8,yc+dy+4.5,fx(m.mean_log2_error,2),'t-n');
      if(c){b+=L(x(c.ci95_low),yc+7,x(c.ci95_high),yc+7,'l-a','style="stroke:var(--ink3);stroke-width:1.5"')+C(x(c.mean_log2_error),yc+7,4.5,'o-ink','style="stroke:var(--ink3);stroke-width:2"')+T(x(c.ci95_high)+8,yc+11.5,fx(c.mean_log2_error,2),'t-tk');}
    });
    view.innerHTML=S(VW,H,b,s.f5Aria);
    const grp=k=>rows.filter(r=>enc(r).startsWith(k)).map(r=>M(r).mean_log2_error),span=a=>a.length?(a.length>1?s.f4bRange(fx(Math.min(...a),2),fx(Math.max(...a),2)):fx(a[0],2)):'—';
    let t=s.f5Status(span(grp('position')),span(grp('length')),span(grp('angle')),span(grp('area')));
    const both=rows.filter(r=>CM(r)),higher=both.every(r=>CM(r).mean_log2_error>M(r).mean_log2_error),same=both.map(r=>r.type).join()===both.slice().sort((a,b)=>CM(a).mean_log2_error-CM(b).mean_log2_error).map(r=>r.type).join()&&both.map(r=>r.type).join()===both.slice().sort((a,b)=>M(a).mean_log2_error-M(b).mean_log2_error).map(r=>r.type).join();
    t+=st.lab&&both.length&&higher&&same?s.f5LabNote:s.f5Plain;
    status.innerHTML=t;
  }
  onOpt(root,(id,on)=>{st[id]=on;render();});
  render(); watch(view,580,render);
}

/* ================= F6a: two instruments for one value =================
   Few's bullet graph (ranges 0–2 poor, 2–4 satisfactory, 4–8 good, a target at 4) beside the analog indicator of
   process-control guidance (a grey normal range of 2.5 to 6 and a pointer, in the accent only outside the range).
   Thresholds are illustrative. */
function figF6a(root){
  const st={v:3.0},LO=2.5,HI=6;
  root.innerHTML=head(s.f6aTitle,s.f6aHint,`<label class="rng wide"><span>${s.f6aValue}</span><input type="range" id="f6a-v" min="0" max="8" step="0.1" value="3" aria-label="${esc(s.f6aValueAria)}"><output id="f6a-vo"></output></label>`)
    +`<section class="sheet s2"><div class="field rx-mini"><div class="tbar"><div><h4>${s.f6aBullet}</h4><span class="ctx">${s.f6aBulletCtx}</span></div></div><div class="rx-plot" id="f6a-b" style="padding-bottom:14px"></div></div>
      <div class="field rx-mini"><div class="tbar"><div><h4>${s.f6aAnalog}</h4><span class="ctx">${s.f6aAnalogCtx}</span></div></div><div class="rx-plot" id="f6a-a" style="padding-bottom:14px"></div></div></section>
    <p class="status" id="f6a-status" aria-live="polite"></p>`;
  const bEl=$('#f6a-b',root),aEl=$('#f6a-a',root),status=$('#f6a-status',root);
  function render(){
    const v=st.v,V=f1(v),reason=v<LO-1e-9?'under':v>HI+1e-9?'over':null,band=v<2?0:v<4?1:2;
    {const VW=drawW(bEl,260),l=16,r=VW-58,x=u=>l+u/8*(r-l),y=34,h=34,H=120; let b='';
      b+=hseg(x(0),y,x(2)-x(0),h,'f-slate2',6,0)+R(x(2),y,x(4)-x(2),h,'f-well')+hseg(x(4),y,x(8)-x(4),h,'f-sheet',0,6);
      s.f6aBands.forEach((n,i)=>{const a=[0,2,4][i],c=[2,4,8][i]; b+=T((x(a)+x(c))/2,y-10,n,'t-tk','middle');});
      b+=hseg(x(0),y+h/2-6,Math.max(0,x(v)-x(0)),12,'f-slate',0,3)+R(x(4)-1.5,y+5,3,h-10,'f-ink',1);
      b+=T(x(8)+12,y+h/2+5,V,'t-v')+T(x(4),y+h+18,s.f6aTarget(fx(4)),'t-tk','middle');
      [0,2,6,8].forEach(u=>{b+=T(x(u),y+h+18,fx(u),'t-tk','middle');});
      bEl.innerHTML=S(VW,H,b,s.f6aBulletAria(V),true);}
    {const VW=drawW(aEl,260),l=16,r=VW-58,x=u=>l+u/8*(r-l),y=58,H=124,px=x(v),left=px>VW/2,half=V.length*4.6+8; let b='';
      // the track, its grey normal range, and a pointer that takes the accent only outside the range
      b+=L(x(0),y,x(8),y,'l-a')+R(x(LO),y-5,x(HI)-x(LO),10,'f-well',5);
      [0,2,4,6,8].forEach(u=>{b+=L(x(u),y,x(u),y+6,'l-a')+T(x(u),y+24,fx(u),'t-tk','middle');});
      b+=L(x(LO),y+30,x(LO),y+36,'l-a')+L(x(HI),y+30,x(HI),y+36,'l-a')+L(x(LO),y+36,x(HI),y+36,'l-a')+T((x(LO)+x(HI))/2,y+54,s.f6aNormal(f1(LO),fx(HI)),'t-tk','middle');
      b+=`<path d="M${p1(px)},${y-1} l-8,-15 h16 z" class="${reason?'f-cob':'f-slate'}"/>`;
      b+=T(px,y-22,V,reason?'t-v cob':'t-v','middle');
      if(reason) b+=T(left?px-half:px+half,y-22,s.f6aReason[reason],'t-lb cob',left?'end':'start',HALO);
      aEl.innerHTML=S(VW,H,b,s.f6aAnalogAria(V,reason?s.f6aReason[reason]:''),true);}
    $('#f6a-vo',root).textContent=s.f6aWeeks(V);
    status.innerHTML=reason?s.f6aOut(s.f6aWeeks(V),s.f6aReason[reason],s.f6aBands[band]):s.f6aIn(s.f6aWeeks(V));
  }
  root.addEventListener('input',e=>{if(e.target.id==='f6a-v'){st.v=+e.target.value;render();}});
  render(); watch(bEl,260,render);
}

/* ================= F6b: a page of small histories =================
   The form of Powsner and Tufte's graphical summary of patient status: one small series per measure, the normal range
   a grey band, the latest value printed, values outside the range in ink. The time axis follows their design: four
   epochs of the same width, earlier history, the past month, the past week and today, shared by every panel. The values
   are illustrative, from a fixed seed, and not clinical data; temperature, heart rate and white cells drift out of range. */
function figF6b(root){
  const MS=[['temp',36.1,37.2,36.65,0.11,1,38.4],['hr',60,100,76,3.5,0,112],['sys',90,140,118,5,0],['rr',12,20,15.5,0.8,0],
    ['spo2',95,100,97.6,0.45,0],['hb',120,160,138,2.5,0],['wbc',4,11,7.0,0.45,1,13.6],['plt',150,400,248,14,0],
    ['na',135,145,139.5,0.9,0],['k',3.5,5.0,4.25,0.13,1],['cr',60,110,84,4,0],['glu',4.0,7.8,5.7,0.35,1]];
  const EP=[6,8,8,8],N=sum(EP),EPOCH=Array.from({length:N},(_,t)=>{let k=0,c=EP[0];while(t>=c){k++;c+=EP[k];}return k;}),r=rng(1994);
  const D=MS.map(([id,lo,hi,base,sd,dec,to])=>{const a=[];let e=0;
    for(let t=0;t<N;t++){const u1=Math.max(1e-9,r()),u2=r(),z=Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2); e=0.55*e+sd*z;
      let v=base+e; if(to!==undefined&&t>=21) v+=(to-base)*Math.pow((t-20)/(N-21),1.6);
      const m=(hi-lo)*0.06; if(to===undefined||t<23) v=Math.min(hi-m,Math.max(lo+m,v)); a.push(+v.toFixed(dec));}
    return {id,lo,hi,dec,a,name:s.measures[id][0],unit:s.measures[id][1]};});
  const st={t:N};
  root.innerHTML=head(s.f6bTitle,s.f6bHint,`<label class="rng wide"><span>${s.f6bDay}</span><input type="range" id="f6b-t" min="1" max="${N}" step="1" value="${N}" aria-label="${esc(s.f6bDayAria)}"><output id="f6b-to"></output></label>`)
    +`<section class="sheet s1"><div class="field"><div class="tbar"><div><h4>${s.f6bCase}</h4><span class="ctx">${s.f6bCaseCtx}</span></div></div><div id="f6b-view" class="rx-plot" style="padding:0 16px 12px"></div></div></section>
    <p class="status" id="f6b-status" aria-live="polite"></p>`;
  const view=$('#f6b-view',root),status=$('#f6b-status',root);
  let G=null;
  const out=(m,v)=>v<m.lo||v>m.hi;
  function render(){
    const VW=drawW(view,300),cols=VW>=840?4:VW>=560?3:2,gx=cols>2?18:12,gy=10,pw=(VW-(cols-1)*gx)/cols,ph=cols>2?104:98,rowsN=Math.ceil(D.length/cols),H=rowsN*ph+(rowsN-1)*gy+24;
    const pl=6,pr=6,Q=(pw-pl-pr)/4,short=Q<64,narrowP=pw<200;
    const x=(c,t)=>{const k=EPOCH[t],j=t-sum(EP.slice(0,k));return c*(pw+gx)+pl+k*Q+(j+0.5)/EP[k]*Q;};
    G={cols,pw,gx,x,VW};
    let b='';
    D.forEach((m,i)=>{
      const c=i%cols,rr=Math.floor(i/cols),x0=c*(pw+gx),y0=rr*(ph+gy),top=y0+36,bot=y0+ph-8,mn=Math.min(m.lo,...m.a),mx=Math.max(m.hi,...m.a),pad=(mx-mn)*0.1,y=v=>bot-(v-(mn-pad))/((mx+pad)-(mn-pad))*(bot-top);
      const v=m.a[st.t-1],o=out(m,v),fv=fx(v,m.dec);
      b+=R(x0,y0,pw,ph,'rx-panel',8);
      const vy=narrowP?y0+32:y0+21;
      b+=T(x0+9,y0+18,esc(narrowP&&s.measuresShort&&s.measuresShort[m.id]||m.name),'t-lb ink','start',narrowP?'style="font-size:13px"':'')+T(x0+9,y0+32,esc(m.unit),'t-tk');
      b+=T(x0+pw-9,vy,fv,o?'t-v':'t-lb ink','end');
      if(o) b+=C(x0+pw-17-fv.length*8.4,vy-5,3.5,'f-ink');
      b+=R(x0+pl,y(m.hi),pw-pl-pr,y(m.lo)-y(m.hi),'f-sheet');
      for(let k=1;k<4;k++) b+=L(x0+pl+k*Q,top-2,x0+pl+k*Q,bot,'l-g');
      b+=`<path d="${m.a.map((u,t)=>(t?'L':'M')+p1(x(c,t))+','+p1(y(u))).join('')}" class="l-o" style="stroke-width:1.5"/>`;
      m.a.forEach((u,t)=>{if(out(m,u)) b+=C(x(c,t),y(u),2.6,'f-ink');});
      b+=L(x(c,st.t-1),top-4,x(c,st.t-1),bot+3,'l-a')+C(x(c,st.t-1),y(v),3.6,o?'f-ink':'f-slate','style="stroke:var(--field);stroke-width:1.5"');
    });
    const lab=short?s.f6bEpochsShort:s.f6bEpochs;
    for(let c=0;c<cols;c++){const x0=c*(pw+gx);
      if(Q>=44) lab.forEach((t,k)=>{b+=T(x0+pl+(k+0.5)*Q,H-6,t,'t-tk','middle');});
      else b+=T(x0+pl,H-6,lab[0],'t-tk','start')+T(x0+pw-pr,H-6,lab[3],'t-tk','end');}
    view.innerHTML=S(VW,H,b,s.f6bAria,true);
    $('#f6b-to',root).textContent=s.f6bDayOut(st.t);
    const offs=D.filter(m=>out(m,m.a[st.t-1])),when=s.f6bWhen[EPOCH[st.t-1]];
    status.innerHTML=offs.length?s.f6bOut(st.t,when,offs.length,s.list(offs.map(m=>s.f6bItem(m.name,fx(m.a[st.t-1],m.dec),m.unit)))):s.f6bIn(st.t,when);
  }
  root.addEventListener('input',e=>{if(e.target.id==='f6b-t'){st.t=+e.target.value;render();}});
  view.addEventListener('pointermove',e=>{if(!G) return; const svg=$('svg',view); if(!svg) return; const box=svg.getBoundingClientRect(),k=box.width/G.VW,px=(e.clientX-box.left)/k;
    const c=Math.min(G.cols-1,Math.max(0,Math.floor(px/(G.pw+G.gx)))); let best=0,bd=Infinity;
    for(let t=0;t<N;t++){const d=Math.abs(G.x(c,t)-px); if(d<bd){bd=d;best=t;}}
    if(best+1!==st.t){st.t=best+1;$('#f6b-t',root).value=st.t;render();}});
  render(); watch(view,300,render);
}

/* ================= F7: two catalogues of dashboards =================
   Left, Sarikaya and colleagues (2019): dashboards per cluster, grouped by goal. Right, Bach and colleagues (2023):
   design patterns per group, content then composition; select a group to see its patterns and the share of the
   dashboards in which each was seen. The decision-making clusters and the composition groups are in the accent. */
function figF7(root){
  const Cd=figData().C,Dd=figData().D,cl=Cd&&Cd.values&&Cd.values.clusters,gr=Dd&&Dd.values&&Dd.values.groups_final_version;
  if(!Array.isArray(cl)||!cl.length||!Array.isArray(gr)||!gr.length){root.innerHTML=noData(s.f7Title);return;}
  const nDash=sum(cl.map(c=>+c.n)),nPat=sum(gr.map(g=>(g.patterns||[]).length)),pre=Dd.values.arxiv_v1_fig1&&+Dd.values.arxiv_v1_fig1.total,base=+Dd.values.dashboards_analysed||144;
  const goals=[...new Set(cl.map(c=>c.goal_group))],levels=[...new Set(gr.map(g=>g.level))];
  const CL=goals.flatMap(g=>cl.filter(c=>c.goal_group===g).sort((a,b)=>b.n-a.n));
  const decision=c=>/decision/i.test(c.goal_group),compose=g=>/composition/i.test(g.level);
  const st={g:(gr.find(compose)||gr[0]).group};
  const pv=v=>{if(typeof v==='number') return [v,v]; const m=String(v).match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/); if(m) return [+m[1],+m[2]]; const n=parseFloat(v); return Number.isFinite(n)?[n,n]:[0,0];};
  root.innerHTML=head(s.f7Title,s.f7Hint)
    +`<section class="sheet s2"><div class="field"><div class="tbar"><div><h4>${s.f7Left}</h4><span class="ctx">${s.f7LeftCtx(nDash,cl.length)}</span></div></div><div id="f7-l" class="rx-plot" style="padding-bottom:12px"></div></div>
      <div class="field"><div class="tbar"><div><h4>${s.f7Right}</h4><span class="ctx">${s.f7RightCtx(nPat,gr.length)}</span></div></div><div id="f7-r" class="rx-plot" style="padding-bottom:12px"></div></div></section>
    <section class="sheet s1"><div class="field"><div class="tbar"><div class="rx-wrap"><h4 id="f7-dh"></h4><span class="ctx">${s.f7DetailCtx(base)}</span></div></div><div id="f7-d" class="rx-plot" style="padding-bottom:12px"></div></div></section>
    <p class="status" id="f7-status" aria-live="polite"></p>`;
  const lEl=$('#f7-l',root),rEl=$('#f7-r',root),dEl=$('#f7-d',root),status=$('#f7-status',root);
  function bars(VW,items,gkey,valOf,clsOf,label,max,sel){
    // items grouped under small headings; each row a name, a bar and its count
    const st2=VW<440,LWc=st2?0:Math.min(210,VW*0.46),l=LWc,r=VW-40,RH=st2?44:28,x=v=>l+v/max*(r-l),by=st2?24:RH/2-6,ty=st2?16:RH/2+4; let y=4,b='';
    let last=null; items.forEach(it=>{const g=gkey(it);
      if(g!==last){y+=last===null?14:24; b+=T(0,y,esc(nameOf(g)),'t-grp'); y+=8; last=g;}
      const on=sel&&sel(it),yy=y+4;
      const row=(on?R(-4,yy-1,VW+4-0,RH,'f-sheet',8):'')+T(0,yy+ty,esc(nameOf(label(it))),on?'t-n':'t-lb ink')+hseg(l,yy+by,x(valOf(it))-l,12,clsOf(it),0,4)+T(x(valOf(it))+7,yy+by+11,fx(valOf(it)),'t-n');
      b+=sel?`<g class="rx-pick" data-grp="${esc(it.group)}" tabindex="0" role="radio" aria-checked="${!!on}" aria-label="${esc(nameOf(it.group)+', '+(it.patterns||[]).length)}">${R(-4,yy-1,VW+4,RH,'rx-hitbox',8)}${row}</g>`:row;
      y+=RH;});
    return {b,H:y+8};
  }
  function render(focus){
    const lw=drawW(lEl,280),rw=drawW(rEl,280),dw=drawW(dEl,300);
    const L1=bars(lw,CL,c=>c.goal_group,c=>+c.n,c=>decision(c)?'f-cob':'f-slate',c=>c.name,Math.max(...CL.map(c=>+c.n)),null);
    lEl.innerHTML=S(lw,L1.H,L1.b,s.f7LeftAria,true);
    const GR=levels.flatMap(lv=>gr.filter(g=>g.level===lv));
    const R1=bars(rw,GR,g=>g.level,g=>(g.patterns||[]).length,g=>compose(g)?'f-cob':'f-slate',g=>g.group,Math.max(...GR.map(g=>(g.patterns||[]).length)),g=>g.group===st.g);
    rEl.innerHTML=`<div role="radiogroup" aria-label="${esc(s.f7Pick)}">${S(rw,R1.H,R1.b,s.f7RightAria,true,'group')}</div>`;
    const g=gr.find(x=>x.group===st.g),ps=(g.patterns||[]).map(p=>({name:p.name,v:pv(p.pct_of_dashboards)})).sort((a,b)=>b.v[1]-a.v[1]);
    {const VW=dw,LWc=Math.min(240,VW*0.42),l=LWc,r=VW-74,RH=28,x=v=>l+v/100*(r-l); let b='',y=6;
      [0,50,100].forEach(v=>{b+=L(x(v),2,x(v),6+ps.length*RH,'l-g');});
      ps.forEach(p=>{b+=T(0,y+RH/2+5,esc(nameOf(p.name)),'t-lb ink');
        if(p.v[1]>p.v[0]) b+=hseg(l,y+RH/2-6,x(p.v[1])-l,12,'f-tint',0,4);
        b+=hseg(l,y+RH/2-6,x(p.v[0])-l,12,compose(g)?'f-cob':'f-slate',0,p.v[1]>p.v[0]?0:4);
        b+=T(x(p.v[1])+7,y+RH/2+5,p.v[1]>p.v[0]?`${fx(p.v[0])}/${fx(p.v[1])}${s.pc}`:fx(p.v[0])+s.pc,'t-n');
        y+=RH;});
      b+=T(x(0),y+18,'0'+s.pc,'t-tk','middle')+T(x(50),y+18,'50'+s.pc,'t-tk','middle')+T(x(100),y+18,'100'+s.pc,'t-tk','middle');
      dEl.innerHTML=S(VW,y+26,b,s.f7DetailAria(nameOf(g.group)),true);}
    $('#f7-dh',root).textContent=s.f7Detail(nameOf(g.group));
    const top=ps[0];
    status.innerHTML=s.f7Status(esc(nameOf(g.group)),ps.length,esc(nameOf(top.name).toLowerCase()),fx(top.v[0])+s.pc)+s.f7Count(nPat,pre);
    if(focus){const n=$(`[data-grp="${CSS.escape(st.g)}"]`,rEl); if(n) n.focus();}
  }
  const choose=(g,focus)=>{if(g&&g!==st.g){st.g=g;render(focus);}};
  root.addEventListener('click',e=>{const n=e.target.closest('[data-grp]'); if(n) choose(n.dataset.grp,true);});
  root.addEventListener('keydown',e=>{const n=e.target.closest&&e.target.closest('[data-grp]'); if(!n) return;
    if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(n.dataset.grp,true);}
    else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault(); const all=$$('[data-grp]',rEl),k=all.indexOf(n),m=all[(k+(e.key==='ArrowDown'?1:-1)+all.length)%all.length]; choose(m.dataset.grp,true);}});
  render(false); watch(lEl,280,()=>render(false));
}

/* ================= F8: bold without a shift, face by face =================
   type_test: the width of the tabular zero at 400 and 700 (the draft's measure, headless Chrome on the Google Fonts
   builds), and the recheck of 3 October 2026 for all ten digits, the minus sign and the decimal point. Selecting a
   face sets the live specimen: the sample's weekly demand and changes, right-aligned with tabular figures, in bold
   laid over regular, so any shift shows as a doubled edge. The seven faces load from Google Fonts. */
const FONT_CSS='https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&family=Hanken+Grotesk:wght@400;700&family=Red+Hat+Text:wght@400;700&family=Geist:wght@400;700&family=Archivo:wght@400;700&family=Roboto+Flex:opsz,wght@8..144,400..700&family=Instrument+Sans:wdth,wght@75..100,400..700&display=swap';
function figF8(root){
  const TT=research().typeTest||{},res=Array.isArray(TT.results)?TT.results:[],rc=TT.recheck&&Array.isArray(TT.recheck.rows)?TT.recheck.rows:[];
  if(!res.length){root.innerHTML=noData(s.f8Title);return;}
  if(!document.querySelector('link[data-rx-fonts]')){const k=document.createElement('link');k.rel='stylesheet';k.href=FONT_CSS;k.setAttribute('data-rx-fonts','');document.head.appendChild(k);}
  const nums=t=>(String(t||'').match(/\d+(?:[.,]\d+)?/g)||[]).map(v=>+v.replace(',','.'));
  // the recheck rows of one face: the plain one, or for a size-dependent face the text size and the large size
  const rowsOf=f=>rc.filter(r=>String(r.face||'').split(',')[0].trim()===f).map(r=>({...r,size:(nums(String(r.face).split(',').slice(1).join(',').replace(/[\s  ,]/g,''))[0])||null}));
  const F=res.map(r=>{const rs=rowsOf(r.face),big=rs.find(x=>x.size&&x.size>=100)||rs[0]||{},small=rs.find(x=>x.size&&x.size<100)||null;return {...r,big,small};});
  const LINESV=[[80,85,95,100],[80,80,80,80],[120,140,160,180],[35,30,30,25],[13,11,9,7]],chg=plan().rows.map(r=>r.demand/r.prev-1);
  const st={face:F[0].face,size:24};
  root.innerHTML=head(s.f8Title,s.f8Hint)
    +`<section class="sheet s1"><div class="field scroll"><div class="rx-tt" id="f8-m" role="radiogroup" aria-label="${esc(s.f8Aria)}"></div></div></section>
    <section class="sheet s1" style="margin-top:8px"><div class="field"><div class="tbar ctl"><div><h4>${s.f8Spec}</h4><span class="ctx" id="f8-ctx"></span></div>
      <label class="rng"><span>${s.f8Size}</span><input type="range" id="f8-z" min="12" max="48" step="1" value="24" aria-label="${esc(s.f8SizeAria)}"><output id="f8-zo"></output></label></div>
      <div class="rx-spec" id="f8-spec"><div class="lay r"></div><div class="lay b" aria-hidden="true"></div></div></div></section>
    <p class="status" id="f8-status" aria-live="polite"></p>`;
  const m=$('#f8-m',root),spec=$('#f8-spec',root),status=$('#f8-status',root);
  const e3=v=>fx(v,3),pair=(a,b)=>`${e3(a)} / ${e3(b)}`;
  const cell=(ok,top,verdict,note)=>`<span class="rx-c${ok?'':' bad'}"><span class="v">${top}</span><span class="k"><em>${verdict}</em>${note?' '+note:''}</span></span>`,vk=ok=>ok?s.f8Keeps:s.f8Shifts;
  function matrix(){
    m.innerHTML=`<div class="rx-tt-h">${s.f8Cols.map(c=>`<span>${c}</span>`).join('')}</div>`+F.map(f=>{
      const d4=nums(f.big.digits_400),d7=nums(f.big.digits_700),mi=nums(f.big.minus),pt=nums(f.big.point),dig=d4[0];
      const nine=d7.length>1?`${s.f8Nine} ${e3(d7[d7.length-1])}`:'';
      // the minus sign is compared with the digits at text size, where the face has a size of its own
      const ref=f.small?nums(f.small.digits_400)[0]:dig,mi2=f.small&&nums(f.small.minus).length>1?nums(f.small.minus):mi;
      const mSub=mi2.length?(Math.abs(mi2[0]-ref)<0.0005&&Math.abs(mi2[1]-ref)<0.0005?s.f8Digit:mi2[0]<ref?s.f8Narrow:s.f8Wide):'';
      const sm=f.small?`${s.f8At(fx(f.small.size))}${LANG==='fr'?NN:''}: ${pair(nums(f.small.digits_400)[0],nums(f.small.digits_700)[0])}`:'';
      const at=f.small&&f.big.size?s.f8At(fx(f.big.size)):'';
      return `<button type="button" role="radio" class="rx-tt-r" data-face="${esc(f.face)}" aria-checked="${f.face===st.face}"><b style="font-family:'${esc(f.face)}',var(--sans)">${esc(f.face)}</b>`
        +cell(f.pass_zero,pair(f.zero_400,f.zero_700),vk(f.pass_zero),at)
        +cell(f.pass_digits,d4.length?(nine?`${e3(dig)} / ${e3(d7[0])}, ${nine}`:pair(dig,d7[0])):'—',vk(f.pass_digits),sm)
        +cell(f.pass_minus,mi.length>1?pair(mi[0],mi[1]):'—',f.pass_minus?s.f8Digit:mSub||vk(false),'')
        +cell(f.pass_point,pt.length>1?pair(pt[0],pt[1]):'—',vk(f.pass_point),'')+'</button>';}).join('')+`<p class="rx-tt-n">${s.f8Note}</p>`;
  }
  function specimen(){
    const fam=`'${st.face}',sans-serif`,cells=LINESV.flatMap((r,i)=>r.map(v=>fx(v)).concat([spct(chg[i])]));
    $$('.lay',spec).forEach(l=>{l.style.fontFamily=fam;l.style.fontSize=st.size+'px';l.innerHTML=cells.map(t=>`<span>${t}</span>`).join('');});
    const a=$$('.lay.r span',spec),b=$$('.lay.b span',spec);let dw=0,dc=0;
    a.forEach((n,i)=>{const d=Math.abs(b[i].getBoundingClientRect().width-n.getBoundingClientRect().width); if(i%5===4) dc=Math.max(dc,d); else dw=Math.max(dw,d);});
    const f=F.find(x=>x.face===st.face),passes=[f.pass_zero,f.pass_digits,f.pass_minus].filter(Boolean).length;
    const say=d=>d<0.3?s.f8Same:s.f8Moved(fx(d,1));
    status.innerHTML=s.f8Status(esc(st.face),fx(st.size),say(dw),say(dc))+s.f8Pass(passes);
    $('#f8-ctx',root).textContent=s.f8SpecCtx(st.face); $('#f8-zo',root).textContent=fx(st.size)+(LANG==='fr'?NB:' ')+'px';
    $$('[data-face]',m).forEach(n=>n.setAttribute('aria-checked',String(n.dataset.face===st.face)));
  }
  {const avail=spec.clientWidth-48; if(avail>0&&avail<17.4*st.size){st.size=Math.max(12,Math.floor(avail/17.4)); $('#f8-z',root).value=st.size;}}
  matrix(); specimen();
  root.addEventListener('click',e=>{const n=e.target.closest('[data-face]'); if(n){st.face=n.dataset.face;specimen();}});
  root.addEventListener('input',e=>{if(e.target.id==='f8-z'){st.size=+e.target.value;specimen();}});
  root.addEventListener('keydown',e=>{const n=e.target.closest&&e.target.closest('[data-face]'); if(n&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();
    const all=$$('[data-face]',m),k=all.indexOf(n),x=all[(k+(e.key==='ArrowDown'?1:-1)+all.length)%all.length]; x.focus(); st.face=x.dataset.face; specimen();}});
  if(document.fonts&&document.fonts.load){Promise.all(F.flatMap(f=>[document.fonts.load(`400 24px "${f.face}"`),document.fonts.load(`700 24px "${f.face}"`)])).then(()=>{matrix();specimen();}).catch(()=>{});}
  redraw.push(force=>{if(force) specimen();});
}

/* ================= mount =================
   Each figure is drawn only when its root is on the page, and only once. mount() can run again for roots added later. */
const FIGURES=[['#fig-F0',figF0],['#fig-F1',figF1],['#fig-F2a',figF2a],['#fig-F2b',figF2b],['#fig-F3a',figF3a],['#fig-F3b',figF3b],['#fig-F3c',figF3c],
  ['#fig-F4a',figF4a],['#fig-F4b',figF4b],['#fig-F5',figF5],['#fig-F6a',figF6a],['#fig-F6b',figF6b],['#fig-F7',figF7],['#fig-F8',figF8]];
const drawn=new WeakSet();
let observing=false;
function mount(){
  FIGURES.forEach(([sel,fn])=>{const el=$(sel); if(!el||drawn.has(el)) return; drawn.add(el);
    try{fn(el);}catch(err){el.innerHTML=`<p class="status">${s.figFail}</p>`;console.error(sel,err);}});
  if(!observing&&document.body){observing=true;
    let raf=0;new ResizeObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>redraw.forEach(f=>f()));}).observe(document.body);
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>redraw.forEach(f=>f(true)));}
}
window.__research={mount,STR,LANG,plan};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
})();
