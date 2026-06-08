import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Download,
  ExternalLink,
  GlassWater,
  Landmark,
  MapPin,
  Martini,
  Navigation,
  Plane,
  Sparkles,
  Train,
  Utensils,
  Wine
} from "lucide-react";

const cache = "v=20260607d";
const image = (name) => `assets/${name}?${cache}`;

const navItems = [
  ["Stay", "stay"],
  ["Plan", "itinerary"],
  ["Maps", "maps"],
  ["Dallas", "dallas"],
  ["Irving", "irving"],
  ["Fort Worth", "fort-worth"],
  ["Eat", "food"],
  ["Sources", "sources"]
];

const summary = [
  ["Arrival", "Fri 10pm"],
  ["Base", "Uptown"],
  ["Hotel", "Canopy or Marriott"],
  ["Train day", "Sat Irving + FW"],
  ["Nightlife", "2 nights"],
  ["Sunday", "Dallas reset"]
];

const hotels = [
  {
    title: "Marriott Dallas Uptown",
    tag: "Best practical base",
    address: "3033 Fairmount Street",
    copy: "More central for Harwood, Happiest Hour, Klyde Warren, the Arts District, and short late-night rides. Pick it if the rate difference is small.",
    link: "https://www.marriott.com/en-us/hotels/dalmu-marriott-dallas-uptown/overview/"
  },
  {
    title: "Canopy by Hilton Dallas Uptown",
    tag: "West Village / Cityplace",
    address: "2950 Cityplace West Blvd",
    copy: "The exact Canopy you meant. Better for Cityplace/Uptown Station, M-Line access, and a calmer north-Uptown start.",
    link: "https://www.hilton.com/en/hotels/dfwrmpy-canopy-dallas-uptown/"
  },
  {
    title: "Hotel Swexan",
    tag: "Harwood - Michelin One Key",
    address: "2575 McKinnon Street",
    copy: "The upgrade version: design-forward, lively, and close to the strongest Dallas night-out geography.",
    link: "https://guide.michelin.com/mt/en/hotels-stays/dallas/hotel-swexan-13512"
  }
];

const ticketGroups = [
  {
    title: "Book before the trip",
    items: [
      ["Sixth Floor Museum", "Wed-Sun 10am-5pm, timed adult ticket around $27.", "https://tickets.jfk.org/"],
      ["Nasher Sculpture Center", "Wed-Sun 11am-5pm, adult ticket around $10.", "https://www.nashersculpturecenter.org/visit/plan-a-visit"],
      ["Cowtown Coliseum Rodeo", "Friday/Saturday 7:30pm, doors around 6pm.", "https://www.cowtowncoliseum.com/events-tickets/"],
      ["Las Colinas gondola", "Classic cruise from $155 for 2, by reservation.", "https://irving.gondola.com/cruises/classic-cruise/"]
    ]
  },
  {
    title: "Free / easy",
    items: [
      ["DMA", "Free general admission; reserve a GA ticket.", "https://tickets.dma.org/"],
      ["Klyde Warren Park", "Daily 6am-11pm, best as a connector.", "https://www.klydewarrenpark.org/"],
      ["M-Line Trolley", "Free/name-your-fare, useful from Uptown.", "https://www.mata.org/ride/route-map/"],
      ["Fort Worth Herd", "11:30am and 4pm daily, weather permitting.", "https://www.fortworth.com/the-herd/"]
    ]
  },
  {
    title: "Timing traps",
    items: [
      ["Monday", "Most museums in Dallas and Fort Worth are closed Monday.", "https://dma.org/visit"],
      ["TRE", "Regular Dallas-Fort Worth service is Monday-Saturday, not Sunday.", "https://www.trinityrailwayexpress.org/schedules/"],
      ["Clubs", "Check event calendars and bring valid 21+ ID.", "https://www.itlldoclub.com/"],
      ["Irving", "Keep it tight before Fort Worth: Mustangs + canal, gondola only if protected.", "https://www.irvingtexas.com/things-to-do/"]
    ]
  }
];

const days = [
  {
    key: "fri",
    day: "Fri",
    label: "night",
    title: "Arrive, check in, go straight out",
    city: "Dallas",
    image: image("dallas-deep-ellum.jpg"),
    items: [
      ["10:00pm", "Land, rideshare to Uptown. Canopy puts you near Cityplace/West Village; Marriott is closer to Harwood and the Arts District."],
      ["11:15pm", "First drink: Happiest Hour for big rooftop energy, Waterproof for dressed-up roof, Midnight Rambler for cocktails first."],
      ["12:15am", "Club route: It'll Do if the DJ is right, The Nines for Deep Ellum, or Round-Up for country dancing."]
    ],
    note: "Do not book a serious dinner Friday. Check the club calendar before landing, then commit to one late-night destination."
  },
  {
    key: "sat",
    day: "Sat",
    label: "rail day",
    title: "Irving + Fort Worth by train",
    city: "Irving + Fort Worth",
    image: image("irving-mustangs-las-colinas.jpg"),
    items: [
      ["9:30am", "DART Orange Line toward Las Colinas Urban Center. From Canopy, Cityplace/Uptown is the cleanest rail start."],
      ["10:15am", "Mustangs of Las Colinas, Mandalay Canal, quick coffee. Gondola only if booked early enough."],
      ["12:15pm", "DART back toward Dallas, transfer to TRE westbound at Victory or Union depending on schedule."],
      ["4:00pm", "Fort Worth Herd cattle drive on East Exchange Avenue."],
      ["7:30pm", "Rodeo at Cowtown Coliseum, then Billy Bob's if you want the honky-tonk version."]
    ],
    note: "Saturday is the correct day because TRE has regular Saturday service. Treat the late return as a rideshare if you stay past the clean train window."
  },
  {
    key: "sun",
    day: "Sun",
    label: "Dallas",
    title: "Dallas recovery day",
    city: "Bishop + Arts District",
    image: image("dallas-klyde-warren.jpg"),
    items: [
      ["10:30am", "Bishop Arts brunch: Written By The Seasons is the Michelin-listed fit."],
      ["12:30pm", "Arts District: DMA, Nasher, Klyde Warren, then M-Line back toward Uptown."],
      ["4:30pm", "Katy Trail, Lower Greenville, or the Dallas Arboretum if you want a softer outdoor block."],
      ["7:30pm", "Dinner: Tei-An, Gemma, Mamani, or keep it Bishop Arts."]
    ],
    note: "Sunday should recover from the Saturday rail day. Keep it Dallas-only unless a Toyota Music Factory event beats rest."
  },
  {
    key: "mon",
    day: "Mon",
    label: "exit",
    title: "One clean final morning",
    city: "Uptown",
    image: image("dallas-mline-trolley.jpg"),
    items: [
      ["9:30am", "Pretty version: Dallas Arboretum. Easy version: Katy Trail coffee walk from Uptown."],
      ["11:30am", "Lunch near the hotel, pack, airport."]
    ],
    note: "Do not plan Sixth Floor, DMA, Nasher, Kimbell, Modern, or Amon Carter for Monday morning."
  }
];

const maps = [
  {
    id: "rail",
    title: "Saturday rail map",
    deck: "Uptown -> Irving -> Fort Worth",
    iframe:
      "https://maps.google.com/maps?q=Cityplace%2FUptown%20Station%20to%20Las%20Colinas%20Urban%20Center%20Station%20to%20Mustangs%20of%20Las%20Colinas%20to%20Mandalay%20Canal%20Walk%20at%20Las%20Colinas%20to%20Victory%20Station%20Dallas%20to%20Fort%20Worth%20Central%20Station%20to%20Fort%20Worth%20Stockyards%20to%20Billy%20Bob%27s%20Texas&output=embed",
    action:
      "https://www.google.com/maps/dir/?api=1&origin=Canopy%20by%20Hilton%20Dallas%20Uptown&destination=Billy%20Bob%27s%20Texas%2C%20Fort%20Worth%2C%20TX&travelmode=transit&waypoints=Cityplace%2FUptown%20Station%7CLas%20Colinas%20Urban%20Center%20Station%7CMustangs%20of%20Las%20Colinas%7CMandalay%20Canal%20Walk%20at%20Las%20Colinas%7CVictory%20Station%20Dallas%7CFort%20Worth%20Central%20Station%7CFort%20Worth%20Stockyards",
    pins: ["Cityplace/Uptown Station", "Las Colinas Urban Center", "Mustangs + Mandalay Canal", "Victory / Union transfer", "Fort Worth Central", "Stockyards + Billy Bob's"]
  },
  {
    id: "dallas",
    title: "Dallas loop",
    deck: "Uptown -> Arts -> Bishop -> Deep Ellum",
    iframe:
      "https://maps.google.com/maps?q=Canopy%20by%20Hilton%20Dallas%20Uptown%20to%20Klyde%20Warren%20Park%20to%20Dallas%20Museum%20of%20Art%20to%20Nasher%20Sculpture%20Center%20to%20Bishop%20Arts%20District%20to%20Deep%20Ellum%20Dallas&output=embed",
    action:
      "https://www.google.com/maps/dir/?api=1&origin=Canopy%20by%20Hilton%20Dallas%20Uptown&destination=Deep%20Ellum%2C%20Dallas%2C%20TX&travelmode=driving&waypoints=Klyde%20Warren%20Park%7CDallas%20Museum%20of%20Art%7CNasher%20Sculpture%20Center%7CBishop%20Arts%20District",
    pins: ["Canopy / Marriott", "Klyde Warren Park", "DMA + Nasher", "Bishop Arts", "Deep Ellum / It'll Do"]
  },
  {
    id: "irving",
    title: "Irving / Las Colinas",
    deck: "Mustangs -> canal -> coffee",
    iframe:
      "https://maps.google.com/maps?q=Canopy%20by%20Hilton%20Dallas%20Uptown%20to%20Mustangs%20of%20Las%20Colinas%20to%20Mandalay%20Canal%20Walk%20at%20Las%20Colinas%20to%20Toyota%20Music%20Factory&output=embed",
    action:
      "https://www.google.com/maps/dir/?api=1&origin=Canopy%20by%20Hilton%20Dallas%20Uptown&destination=Toyota%20Music%20Factory%2C%20Irving%2C%20TX&travelmode=transit&waypoints=Cityplace%2FUptown%20Station%7CLas%20Colinas%20Urban%20Center%20Station%7CMustangs%20of%20Las%20Colinas%7CMandalay%20Canal%20Walk%20at%20Las%20Colinas",
    pins: ["Las Colinas Urban Center", "Mustangs of Las Colinas", "Mandalay Canal", "Pax & Beneficia", "Toyota Music Factory"]
  },
  {
    id: "fort-worth",
    title: "Fort Worth day trip",
    deck: "Central -> Stockyards -> rodeo",
    iframe:
      "https://maps.google.com/maps?q=Las%20Colinas%20Urban%20Center%20Station%20to%20Victory%20Station%20Dallas%20to%20Fort%20Worth%20Central%20Station%20to%20Fort%20Worth%20Stockyards%20to%20Billy%20Bob%27s%20Texas&output=embed",
    action:
      "https://www.google.com/maps/dir/?api=1&origin=Canopy%20by%20Hilton%20Dallas%20Uptown&destination=Billy%20Bob%27s%20Texas%2C%20Fort%20Worth%2C%20TX&travelmode=transit&waypoints=Las%20Colinas%20Urban%20Center%20Station%7CVictory%20Station%20Dallas%7CFort%20Worth%20Central%20Station%7CFort%20Worth%20Stockyards%7CCowtown%20Coliseum",
    pins: ["Fort Worth Central", "Cultural District", "Stockyards", "Cowtown Coliseum", "Billy Bob's Texas"]
  }
];

const officialChecks = [
  ["Visit Dallas", "Arts District, Klyde, Bishop Arts, Deep Ellum stay.", "Official Dallas tourism backs a city weekend built around culture, green-space transitions, neighborhoods, food, and nightlife.", "https://www.visitdallas.com/things-to-do/"],
  ["Visit Irving", "Las Colinas is worth a tight morning, not a full day.", "Mandalay Canal, Lake Carolyn, Mustangs, and Toyota Music Factory are the useful hits before the TRE transfer.", "https://www.irvingtexas.com/things-to-do/"],
  ["Visit Fort Worth", "Stockyards + culture district is the right westbound move.", "The official Fort Worth angle points to Stockyards, live music/rodeo, and major museums.", "https://www.fortworth.com/things-to-do/"]
];

const dallasCards = [
  ["Arts District", "Dallas Museum of Art, Nasher, Winspear, Meyerson, Klyde Warren next door.", image("dallas-arts-dma.jpg")],
  ["Klyde Warren Park", "Free, lively, and the clean connector between Uptown and downtown.", image("dallas-klyde-warren.jpg")],
  ["Katy Trail + M-Line", "Golden-hour walk, then free heritage trolley through Uptown.", image("dallas-mline-trolley.jpg")],
  ["Bishop Arts", "Independent shops, murals, coffee, and a softer Sunday pace.", image("dallas-bishop-arts.jpg")],
  ["Deep Ellum", "Murals by day, clubs and live music after dark.", image("dallas-deep-ellum.jpg")]
];

const irvingOptions = [
  ["Photo stop", "Mustangs of Las Colinas", "Distinctive, free, near the rail/canal area, and the best reason Irving belongs in the plan."],
  ["Walk", "Mandalay Canal + Lake Carolyn", "Short waterfront loop. Keep it to 25-35 minutes if Fort Worth is still the main event."],
  ["Only if booked early", "Gondola Adventures", "Romantic, but it consumes schedule. Earliest practical slot or skip."],
  ["Backup culture", "Irving Arts Center", "Good gallery backup if weather is bad, less iconic than Mustangs + canal."]
];

const fortCards = [
  ["Stockyards + cattle drive", "Longhorns on East Exchange Avenue at 11:30am and 4pm, weather permitting.", image("fort-worth-stockyards-cattle-drive.jpg")],
  ["Kimbell or The Modern", "Pick one museum if you start early; do not try to do every museum on the combined day.", image("fort-worth-kimbell.jpg")],
  ["Billy Bob's option", "Stay late for the honky-tonk version. Treat the return as rideshare if the TRE window closes.", image("fort-worth-billy-bobs.jpg")]
];

const eats = {
  "Irving / Las Colinas": [
    ["The Ranch at Las Colinas", "Texas ranch-to-table anchor before moving west.", "https://www.theranchlc.com/"],
    ["Via Real", "Las Colinas classic for polished Southwestern/Mexican.", "https://www.viareal.com/"],
    ["Mr Max", "Tiny Japanese izakaya energy; the niche pick.", "https://www.mrmaxtx.com/"],
    ["Empa Mundo", "Fast, local empanadas, good if you need casual.", "https://www.empamundo.com/"],
    ["Pax & Beneficia", "Coffee stop near Mustangs + canal.", "https://paxandbeneficia.com/pages/las-colinas"]
  ],
  "Fort Worth / Stockyards": [
    ["97 West Kitchen & Bar", "Polished Hotel Drover / modern Texas dinner.", "https://97westkitchenandbar.com/"],
    ["Provender Hall", "Mule Alley Southern comfort before Cowtown Coliseum.", "https://www.provenderhall.com/"],
    ["Second Rodeo Brewing", "Beer garden/live music mood without overplanning.", "https://www.secondrodeobrewing.com/"],
    ["White Elephant Saloon", "Classic Fort Worth bar, more authentic than generic nightlife.", "https://whiteelephantsaloon.com/"],
    ["Basement Bar", "Small Stockyards dive/honky-tonk option.", "https://www.fortworthstockyards.org/things-do/basement-bar"],
    ["Panther City BBQ", "BBQ mission if food beats museum time.", "https://www.panthercitybbq.com/"]
  ],
  "Dallas Sunday anchors": [
    ["Tatsu", "Deep Ellum sushi counter; reservation-hard.", "https://guide.michelin.com/us/en/texas/dallas/restaurant/tatsu-dallas"],
    ["Mamani", "Michelin-star splurge dinner.", "https://guide.michelin.com/us/en/texas/dallas/restaurant/mamani"],
    ["Gemma", "Knox-Henderson dinner before a cleaner Dallas night.", "https://guide.michelin.com/us/en/texas/dallas/restaurant/gemma"],
    ["Written By The Seasons", "Bishop Arts brunch/lunch, strongest Sunday fit.", "https://guide.michelin.com/us/en/texas/dallas/restaurant/written-by-the-seasons"]
  ]
};

const sources = [
  ["Guide du Routard: Dallas", "https://www.routard.com/fr/guide/ameriques/etats-unis/texas/dallas"],
  ["Guide du Routard: Fort Worth", "https://www.routard.com/fr/guide/ameriques/etats-unis/texas/fort-worth"],
  ["Michelin Guide Texas 2025", "https://guide.michelin.com/us/en/article/michelin-guide-ceremony/all-the-stars-in-the-michelin-guide-texas-2025"],
  ["Visit Dallas", "https://www.visitdallas.com/things-to-do/"],
  ["Visit Irving", "https://www.irvingtexas.com/things-to-do/"],
  ["Visit Fort Worth", "https://www.fortworth.com/things-to-do/"],
  ["DART Cityplace/Uptown Station", "https://www.dart.org/guide/transit-and-use/rail/rail-station-detail/cityplace-uptown-station"],
  ["TRE schedules", "https://www.trinityrailwayexpress.org/schedules/"],
  ["Cowtown Coliseum", "https://www.cowtowncoliseum.com/events-tickets/"],
  ["Fort Worth Herd", "https://www.fortworth.com/the-herd/"],
  ["Mustangs of Las Colinas", "https://www.irvingarchivesandmuseum.com/mustangs-of-las-colinas"],
  ["Mandalay Canal Walk", "https://www.irvingtexas.com/listing/mandalay-canal-walk-at-las-colinas/700/"]
];

function App() {
  const [selectedMap, setSelectedMap] = useState("rail");
  const [nightRoute, setNightRoute] = useState("fortWorth");
  const activeMap = useMemo(() => maps.find((map) => map.id === selectedMap) ?? maps[0], [selectedMap]);

  return (
    <div className="min-h-screen overflow-hidden">
      <Header />
      <main id="main">
        <Hero />
        <StaySection />
        <TicketDesk />
        <Itinerary nightRoute={nightRoute} setNightRoute={setNightRoute} />
        <Maps activeMap={activeMap} selectedMap={selectedMap} setSelectedMap={setSelectedMap} />
        <DallasSection />
        <IrvingSection />
        <NightlifeSection />
        <FortWorthSection />
        <FoodSection />
        <SourcesSection />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8">
      <div className="glass mx-auto flex h-16 max-w-7xl items-center justify-between rounded-[2rem] px-4 md:px-6">
        <a href="../" className="focus-ring flex items-center gap-3 rounded-full">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-guide-red text-sm font-black text-white shadow-soft">ES</span>
          <span className="hidden text-sm font-bold text-guide-ink sm:block">Enzo Simier</span>
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Guide sections">
          {navItems.map(([label, id]) => (
            <a key={id} href={`#${id}`} className="focus-ring rounded-full px-4 py-2 text-sm font-semibold text-guide-ink/70 transition hover:bg-white/60 hover:text-guide-ink">
              {label}
            </a>
          ))}
        </nav>
        <button onClick={() => window.print()} className="focus-ring inline-flex items-center gap-2 rounded-full border border-guide-red/30 bg-white/55 px-4 py-2 text-sm font-bold text-guide-red transition hover:bg-guide-red hover:text-white">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Print</span>
        </button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative min-h-[820px] px-4 pt-20 md:px-8">
      <div className="absolute inset-0 -z-10">
        <img src={image("hero-dallas-skyline.jpg")} alt="" className="h-full w-full object-cover object-center opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-guide-mist/30 to-guide-mist" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
        <div className="glass mt-4 rounded-[2rem] p-6 md:mt-8 md:p-8 lg:min-h-[500px]">
          <div className="guide-label mb-5">Weekend itinerary</div>
          <h1 className="guide-serif max-w-xl text-[3.45rem] font-semibold leading-[0.9] tracking-[-0.04em] text-guide-ink md:text-[5.5rem]">
            Dallas & <br />Fort Worth
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-guide-ink/70">
            <Sparkles className="h-4 w-4 text-guide-gold" />
            <span>Liquid glass guide</span>
            <span className="h-1 w-1 rounded-full bg-guide-red" />
            <span>Michelin mood</span>
          </div>
          <p className="mt-5 max-w-xl text-base leading-7 text-guide-ink/72 md:text-lg">
            Where to stay, what is actually worth doing, the rooftop and club plan for two late nights, and a Saturday rail day that combines Irving with Fort Worth.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2 min-[380px]:grid-cols-3 md:grid-cols-3">
            {summary.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/70 bg-white/42 p-2.5 shadow-sm backdrop-blur-xl md:p-3">
                <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-guide-ink/45 md:text-[11px]">{label}</span>
                <strong className="mt-1 block text-[13px] font-extrabold text-guide-ink md:text-sm">{value}</strong>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#itinerary" className="focus-ring inline-flex items-center gap-2 rounded-full bg-guide-red px-5 py-3 text-sm font-extrabold text-white shadow-soft transition hover:bg-guide-redDeep">
              View itinerary <ChevronDown className="h-4 w-4" />
            </a>
            <a href="#maps" className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-5 py-3 text-sm font-extrabold text-guide-ink transition hover:bg-white/80">
              Open maps <Navigation className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="glass-subtle mb-2 hidden rounded-[2rem] p-4 lg:block">
          <div className="relative overflow-hidden rounded-[1.55rem]">
            <img src={image("dallas-arts-dma.jpg")} alt="Dallas Arts District at dusk" className="h-[460px] w-full object-cover" />
            <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-guide-ink/72 px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl">
              <MapPin className="h-4 w-4" />
              Klyde Warren / Arts District
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ number, label, title, copy }) {
  return (
    <div className="mb-9 grid gap-5 md:grid-cols-[120px_1fr] md:items-end">
      <div className="guide-label">{number} / {label}</div>
      <div>
        <h2 className="section-title">{title}</h2>
        {copy ? <p className="mt-5 max-w-3xl text-lg leading-8 text-guide-ink/66">{copy}</p> : null}
      </div>
    </div>
  );
}

function StaySection() {
  return (
    <section id="stay" className="section-shell">
      <SectionHeader number="01" label="Stay" title="Base in Uptown" copy="For this trip, the best neighborhood is the one that removes friction after midnight: close to Katy Trail, Klyde Warren, rooftops, cocktail bars, and short rides to Deep Ellum or Bishop Arts." />
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="glass rounded-[2rem] p-6 md:p-8">
          <div className="guide-label">The call</div>
          <p className="mt-4 text-2xl font-semibold leading-snug text-guide-ink md:text-3xl">
            Book <span className="text-guide-red">Marriott Dallas Uptown</span> if the price is close. Book <span className="text-guide-red">Canopy by Hilton</span> if it is meaningfully cheaper or you prefer West Village/Cityplace.
          </p>
        </div>
        <div className="glass-subtle rounded-[2rem] p-6">
          <div className="guide-label">Neighborhood logic</div>
          <div className="mt-5 space-y-4">
            {["Uptown / Harwood: polished, walkable, bars everywhere.", "Design District: cooler hotel scene, more rideshares.", "Downtown: good for The Joule, weaker for this late-night plan."].map((item) => (
              <div key={item} className="flex gap-3 text-sm leading-6 text-guide-ink/72">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-guide-red" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {hotels.map((hotel) => (
          <a key={hotel.title} href={hotel.link} target="_blank" rel="noreferrer" className="glass-subtle focus-ring group rounded-[1.6rem] p-5 transition hover:-translate-y-1 hover:bg-white/72">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-guide-red">{hotel.tag}</span>
            <h3 className="mt-3 text-xl font-extrabold text-guide-ink">{hotel.title}</h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-guide-ink/45">{hotel.address}</p>
            <p className="mt-4 text-sm leading-6 text-guide-ink/66">{hotel.copy}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-guide-red">
              Official page <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function TicketDesk() {
  return (
    <section id="tickets" className="section-shell pt-4">
      <SectionHeader number="02" label="Tickets" title="Booking desk" copy="The compact version: what to buy, what is free, and what can break the plan if you forget the hours." />
      <div className="grid gap-4 lg:grid-cols-3">
        {ticketGroups.map((group, index) => (
          <article key={group.title} className={`rounded-[1.8rem] p-5 ${index === 2 ? "glass border-guide-red/20" : "glass-subtle"}`}>
            <h3 className="text-lg font-extrabold text-guide-ink">{group.title}</h3>
            <div className="mt-5 space-y-4">
              {group.items.map(([title, copy, href]) => (
                <a key={title} href={href} target="_blank" rel="noreferrer" className="focus-ring group block rounded-2xl bg-white/38 p-4 transition hover:bg-white/70">
                  <div className="flex items-start justify-between gap-3">
                    <strong className="text-sm text-guide-ink">{title}</strong>
                    <ExternalLink className="h-4 w-4 shrink-0 text-guide-red/70" />
                  </div>
                  <p className="mt-2 text-sm leading-5 text-guide-ink/63">{copy}</p>
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Itinerary({ nightRoute, setNightRoute }) {
  const routeCopy = nightRoute === "fortWorth"
    ? "Stay for Billy Bob's if you want the honky-tonk version. If you miss the last TRE, budget for a late rideshare back to Dallas."
    : "Return to Dallas after dinner if clubbing is the priority. Pick It'll Do for electronic, The Nines for Deep Ellum, or Round-Up for country dancing.";

  return (
    <section id="itinerary" className="section-shell">
      <SectionHeader number="03" label="Plan" title="The 3-day plan" copy="Built for a Friday 10pm arrival, two club nights, Saturday Irving + Fort Worth by train, then a lighter Dallas Sunday." />
      <div className="grid gap-5">
        {days.map((day, index) => (
          <article key={day.key} className="glass grid overflow-hidden rounded-[2rem] lg:grid-cols-[240px_1fr]">
            <div className="relative min-h-56">
              <img src={day.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-guide-ink/70 via-guide-ink/10 to-transparent" />
              <div className="absolute left-5 top-5 grid h-14 w-14 place-items-center rounded-full bg-guide-red text-lg font-black text-white shadow-soft">{index + 1}</div>
              <div className="absolute bottom-5 left-5 text-white">
                <span className="block text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">{day.city}</span>
                <strong className="mt-1 block text-2xl font-black">{day.day}</strong>
              </div>
            </div>
            <div className="p-5 md:p-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-guide-red/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-guide-red">{day.label}</span>
                <span className="text-sm font-semibold text-guide-ink/44">{day.city}</span>
              </div>
              <h3 className="guide-serif mt-4 text-3xl font-semibold tracking-[-0.02em] text-guide-ink md:text-4xl">{day.title}</h3>
              <div className="mt-5 grid gap-3">
                {day.items.map(([time, copy]) => (
                  <div key={`${day.key}-${time}`} className="grid gap-3 rounded-2xl bg-white/46 p-4 md:grid-cols-[88px_1fr]">
                    <strong className="text-sm text-guide-red">{time}</strong>
                    <p className="text-sm leading-6 text-guide-ink/68">{copy}</p>
                  </div>
                ))}
              </div>
              {day.key === "sat" ? (
                <div className="mt-5 rounded-2xl border border-guide-red/15 bg-white/46 p-4">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setNightRoute("fortWorth")} className={`focus-ring rounded-full px-4 py-2 text-sm font-bold transition ${nightRoute === "fortWorth" ? "bg-guide-red text-white" : "bg-white/70 text-guide-ink"}`}>Fort Worth night</button>
                    <button onClick={() => setNightRoute("dallas")} className={`focus-ring rounded-full px-4 py-2 text-sm font-bold transition ${nightRoute === "dallas" ? "bg-guide-red text-white" : "bg-white/70 text-guide-ink"}`}>Dallas club night</button>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-guide-ink/68">{routeCopy}</p>
                </div>
              ) : null}
              <p className="mt-5 text-sm font-medium leading-6 text-guide-ink/56">{day.note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Maps({ activeMap, selectedMap, setSelectedMap }) {
  return (
    <section id="maps" className="section-shell">
      <SectionHeader number="04" label="Maps" title="Glass map desk" copy="One combined Saturday rail map plus readable pins, so the named places stay visible even if Google hides labels." />
      <div className="glass overflow-hidden rounded-[2rem]">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="p-4 md:p-6">
            <div className="flex flex-wrap gap-2">
              {maps.map((map) => (
                <button key={map.id} onClick={() => setSelectedMap(map.id)} className={`focus-ring rounded-full px-4 py-2 text-sm font-extrabold transition ${selectedMap === map.id ? "bg-guide-red text-white shadow-soft" : "bg-white/54 text-guide-ink/68 hover:bg-white"}`}>
                  {map.title}
                </button>
              ))}
            </div>
            <div className="mt-8">
              <div className="guide-label">{activeMap.title}</div>
              <h3 className="guide-serif mt-3 text-4xl font-semibold tracking-[-0.02em] text-guide-ink">{activeMap.deck}</h3>
              <ol className="mt-6 grid gap-2">
                {activeMap.pins.map((pin, index) => (
                  <li key={pin} className="flex items-center gap-3 rounded-2xl bg-white/48 p-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-guide-red text-xs font-black text-white">{index + 1}</span>
                    <span className="text-sm font-bold text-guide-ink/78">{pin}</span>
                  </li>
                ))}
              </ol>
              <a href={activeMap.action} target="_blank" rel="noreferrer" className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-guide-ink px-5 py-3 text-sm font-extrabold text-white transition hover:bg-guide-red">
                Open route <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="min-h-[520px] border-t border-white/60 bg-white/30 lg:border-l lg:border-t-0">
            <iframe title={`${activeMap.title} embedded map`} src={activeMap.iframe} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full min-h-[520px] w-full border-0 grayscale-[0.1] saturate-[0.9]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function DallasSection() {
  return (
    <section id="dallas" className="section-shell">
      <SectionHeader number="05" label="Dallas" title="Worth doing" copy="Keep the weekend urban: walks, rooftops, galleries, restaurants, and one Fort Worth detour. Skip the regional hiking layer this time." />
      <div className="grid gap-4 lg:grid-cols-3">
        {officialChecks.map(([source, title, copy, href]) => (
          <a key={source} href={href} target="_blank" rel="noreferrer" className="glass-subtle focus-ring rounded-[1.6rem] p-5 transition hover:-translate-y-1 hover:bg-white/74">
            <span className="guide-label">{source} check</span>
            <strong className="mt-4 block text-lg leading-snug text-guide-ink">{title}</strong>
            <p className="mt-3 text-sm leading-6 text-guide-ink/62">{copy}</p>
          </a>
        ))}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {dallasCards.map(([title, copy, src], index) => (
          <article key={title} className={`${index === 0 ? "md:col-span-2 lg:col-span-2" : ""} glass-subtle overflow-hidden rounded-[1.6rem]`}>
            <img src={src} alt="" className="h-56 w-full object-cover" loading="lazy" decoding="async" />
            <div className="p-5">
              <h3 className="text-lg font-extrabold text-guide-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-guide-ink/62">{copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function IrvingSection() {
  return (
    <section id="irving" className="section-shell">
      <SectionHeader number="06" label="Irving" title="Las Colinas, tight" copy="This is the first half of Saturday, not a separate day. Keep it compact before the TRE transfer." />
      <div className="glass grid overflow-hidden rounded-[2rem] lg:grid-cols-[1.25fr_0.75fr]">
        <img src={image("irving-mustangs-las-colinas.jpg")} alt="Mustangs of Las Colinas sculpture in Irving" className="h-[420px] w-full object-cover lg:h-full" loading="lazy" decoding="async" />
        <div className="p-6 md:p-8">
          <div className="guide-label">Main Irving image</div>
          <h3 className="guide-serif mt-3 text-4xl font-semibold tracking-[-0.02em] text-guide-ink">Mustangs + canal</h3>
          <p className="mt-5 text-sm leading-7 text-guide-ink/66">The fastest worthwhile sightseeing stop before Fort Worth: distinctive sculpture, short waterfront walk, coffee, then back to the rail plan.</p>
          <div className="mt-6 grid gap-3">
            {irvingOptions.map(([tag, title, copy]) => (
              <div key={title} className="rounded-2xl bg-white/46 p-4">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-guide-red">{tag}</span>
                <strong className="mt-1 block text-guide-ink">{title}</strong>
                <p className="mt-2 text-sm leading-6 text-guide-ink/60">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NightlifeSection() {
  const bars = [
    ["Happiest Hour", "Rooftop", "Big Dallas rooftop, easiest Friday opener.", "https://www.happiesthourdallas.com/location/happiest-hour/"],
    ["Waterproof", "Rooftop", "Dressed-up downtown pool/skyline roof.", "https://www.waterproofdallas.com/"],
    ["Midnight Rambler", "Cocktails", "Underground cocktail room at The Joule.", "https://www.midnightramblerbar.com/"],
    ["It'll Do Club", "Club", "The electronic music pick if the DJ is right.", "https://www.itlldoclub.com/"],
    ["The Nines", "Deep Ellum", "Rougher Deep Ellum late-night option.", "https://www.theninesbar.com/"],
    ["Round-Up Saloon", "Dancing", "Country dancing without waiting for Fort Worth.", "https://roundupsaloon.com/"]
  ];
  return (
    <section id="nightlife" className="relative py-20 md:py-28">
      <div className="absolute inset-0 -z-10">
        <img src={image("dallas-deep-ellum.jpg")} alt="" className="h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-guide-ink/88" />
      </div>
      <div className="mx-auto w-[min(1180px,calc(100%_-_32px))]">
        <div className="mb-9">
          <div className="guide-label text-guide-gold">07 / Nightlife</div>
          <h2 className="guide-serif mt-4 text-5xl font-semibold tracking-[-0.03em] text-white md:text-7xl">Two nights out</h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/66">Friday is arrival-night energy. Saturday is either Fort Worth honky-tonk or back-to-Dallas clubbing, depending on how hard you commit to the rodeo.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {bars.map(([name, tag, copy, href]) => (
            <a key={name} href={href} target="_blank" rel="noreferrer" className="focus-ring rounded-[1.4rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl transition hover:bg-white/[0.12]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-guide-gold">{tag}</span>
                  <h3 className="mt-2 text-xl font-extrabold text-white">{name}</h3>
                </div>
                <ArrowUpRight className="h-5 w-5 text-white/55" />
              </div>
              <p className="mt-3 text-sm leading-6 text-white/58">{copy}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FortWorthSection() {
  return (
    <section id="fort-worth" className="section-shell">
      <SectionHeader number="08" label="Fort Worth" title="Westbound, focused" copy="No Irving versus Fort Worth choice: both happen Saturday. Fort Worth gets the afternoon, cattle drive, rodeo, and late option." />
      <div className="mb-5 grid gap-3 md:grid-cols-5">
        {["DART", "TRE", "Central", "Stockyards", "Rodeo"].map((step) => (
          <div key={step} className="glass-subtle rounded-2xl p-4 text-center text-sm font-extrabold text-guide-ink/72">{step}</div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {fortCards.map(([title, copy, src]) => (
          <article key={title} className="glass-subtle overflow-hidden rounded-[1.6rem]">
            <img src={src} alt="" className="h-60 w-full object-cover" loading="lazy" decoding="async" />
            <div className="p-5">
              <h3 className="text-xl font-extrabold text-guide-ink">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-guide-ink/62">{copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FoodSection() {
  return (
    <section id="food" className="section-shell">
      <SectionHeader number="09" label="Eat" title="Eat, drink & coffee" copy="For Saturday, choose places near Las Colinas or the Stockyards. Dallas Michelin anchors are better for Sunday or a clean dinner night." />
      <div className="grid gap-4 lg:grid-cols-3">
        {Object.entries(eats).map(([city, picks]) => (
          <article key={city} className="glass-subtle rounded-[1.8rem] p-5">
            <h3 className="guide-serif text-2xl font-semibold tracking-[-0.02em] text-guide-ink">{city}</h3>
            <div className="mt-5 divide-y divide-guide-ink/10">
              {picks.map(([name, copy, href]) => (
                <a key={name} href={href} target="_blank" rel="noreferrer" className="focus-ring group flex items-start justify-between gap-4 py-4">
                  <span>
                    <strong className="block text-sm text-guide-ink">{name}</strong>
                    <span className="mt-1 block text-sm leading-5 text-guide-ink/56">{copy}</span>
                  </span>
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-guide-red/60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SourcesSection() {
  return (
    <section id="sources" className="section-shell pb-12">
      <SectionHeader number="10" label="Sources" title="Check before you go" copy="The plan is source-backed, but times and event calendars can move. Recheck the official pages before booking." />
      <div className="glass rounded-[2rem] p-5 md:p-7">
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {sources.map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="focus-ring group flex items-center justify-between gap-4 rounded-2xl bg-white/45 px-4 py-3 text-sm font-bold text-guide-ink/72 transition hover:bg-white">
              {label}
              <ExternalLink className="h-4 w-4 text-guide-red/70" />
            </a>
          ))}
        </div>
        <details className="mt-5 rounded-2xl bg-white/45 p-4">
          <summary className="cursor-pointer text-sm font-extrabold text-guide-red">Image credits</summary>
          <p className="mt-3 text-sm leading-7 text-guide-ink/62">
            Hero skyline by Gattacal, CC BY-SA 4.0. Winspear, Deep Ellum, Mustangs, and Kimbell photos by Carol M. Highsmith / Library of Congress, public domain. Klyde Warren Park by Joe Mabel, CC BY-SA 3.0. Bishop Arts by Aceplace, CC BY 2.5. Stockyards cattle drive by Andrew Postell, CC BY-SA 3.0. Billy Bob's by Michael Barera, CC BY-SA 4.0.
          </p>
        </details>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-4 pb-10 md:px-8">
      <div className="glass mx-auto max-w-7xl rounded-[2rem] p-8 text-center">
        <p className="guide-serif text-3xl font-semibold tracking-[-0.02em] text-guide-ink md:text-5xl">Base in Uptown. Go out twice. Ride west once.</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-guide-ink/58">
          <a href="../" className="focus-ring rounded-full px-3 py-2 hover:text-guide-red">Back to homepage</a>
          <span>Dallas - Fort Worth - Friday to Monday</span>
        </div>
      </div>
    </footer>
  );
}

export default App;
