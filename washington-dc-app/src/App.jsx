import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Download,
  ExternalLink,
  MapPin,
  Navigation,
  Sparkles
} from "lucide-react";

const cache = "v=20260608b";
const image = (name) => `assets/${name}?${cache}`;

const navItems = [
  ["Stay", "stay"],
  ["Plan", "itinerary"],
  ["Maps", "maps"],
  ["Georgetown", "georgetown"],
  ["Museums", "museums"],
  ["Nightlife", "nightlife"],
  ["Eat", "food"],
  ["Sources", "sources"]
];

const summary = [
  ["Arrival", "Fri 10pm"],
  ["Best base", "West End / Georgetown"],
  ["Vibe pick", "Georgetown"],
  ["Museum day", "Sat Mall"],
  ["Nightlife", "2 nights"],
  ["Monday", "Light exit"]
];

const hotels = [
  {
    title: "Georgetown",
    tag: "Best vibe",
    address: "C&O Canal / waterfront",
    copy: "Yes if you want the prettiest base: canal, waterfront, coffee, Fiola Mare, easy late walks. Tradeoff: no Metro station inside Georgetown.",
    link: "https://washington.org/dc-neighborhoods/georgetown"
  },
  {
    title: "West End / Foggy Bottom",
    tag: "Best practical call",
    address: "Between Georgetown and Metro",
    copy: "The clean compromise: you can walk or rideshare into Georgetown, use Foggy Bottom-GWU Metro, and get to the Mall faster.",
    link: "https://washington.org/dc-neighborhoods/foggy-bottom"
  },
  {
    title: "Dupont / Logan Circle",
    tag: "Bars + restaurants",
    address: "Dupont, 14th, U Street",
    copy: "Better if the trip becomes nightlife and restaurants first. Less postcard-pretty than Georgetown, more useful after midnight.",
    link: "https://washington.org/dc-neighborhoods/dupont-circle"
  }
];

const hotelShortlist = [
  ["Rosewood Washington, D.C.", "Georgetown luxury, strongest pretty-base pick", "https://www.rosewoodhotels.com/en/washington-dc"],
  ["The Dupont Circle", "Practical alternative near transit", "https://www.doylecollection.com/hotels/the-dupont-circle-hotel"],
  ["The Watergate Hotel", "Foggy Bottom, rooftop, Georgetown-adjacent", "https://www.thewatergatehotel.com/"],
  ["The Graham Georgetown", "Georgetown rooftop, more compact", "https://www.thegrahamgeorgetown.com/"],
  ["Pendry Washington DC - The Wharf", "Wharf waterfront splurge", "https://www.pendry.com/washington-dc/"]
];

const ticketGroups = [
  {
    title: "Reserve before",
    items: [
      ["Library of Congress", "Free timed-entry tickets; released 30 days ahead and same-day at 9am ET.", "https://www.loc.gov/visit/"],
      ["Air & Space Museum", "Free timed-entry passes required for the DC museum.", "https://airandspace.si.edu/visit"],
      ["NMAAHC", "Timed-entry passes required; plan around a multi-hour visit.", "https://nmaahc.si.edu/visit/passes"],
      ["Washington Monument", "If you want the elevator, book through Recreation.gov.", "https://www.recreation.gov/ticket/facility/234635"]
    ]
  },
  {
    title: "Free / flexible",
    items: [
      ["National Gallery of Art", "Free, no ticket needed; open daily 10am-5pm.", "https://www.nga.gov/visit"],
      ["Smithsonian museums", "Most Mall museums run daily around 10am-5:30pm.", "https://www.si.edu/visit/hours"],
      ["National Mall monuments", "Best at golden hour or after dinner; NPS-run memorials.", "https://www.nps.gov/nama/planyourvisit/index.htm"],
      ["Kennedy Center Millennium Stage", "Useful free-performance check for Sunday evening.", "https://www.kennedy-center.org/whats-on/millennium-stage/"]
    ]
  },
  {
    title: "Timing traps",
    items: [
      ["Georgetown transit", "No Metro station in the core neighborhood; use Foggy Bottom, bus, walking, or rideshare.", "https://washington.org/dc-neighborhoods/georgetown"],
      ["Monday", "Some museums and restaurants change schedules; keep the final morning light.", "https://washington.org/visit-dc/free-museums-washington-dc"],
      ["Restaurants", "Book Michelin anchors early; DC prime slots move fast.", "https://guide.michelin.com/us/en/district-of-columbia/washington-dc/restaurants"],
      ["Nightlife", "Check event calendars first: 9:30, Atlantis, Black Cat, Flash.", "https://www.blackcatdc.com/"]
    ]
  }
];

const days = [
  {
    key: "fri",
    day: "Fri",
    label: "arrival",
    title: "Check in, then one clean night out",
    city: "Georgetown / U Street",
    image: image("monuments-night.jpg"),
    items: [
      ["10:00pm", "Arrive, rideshare to Georgetown, West End, or Dupont. Do not plan a serious dinner."],
      ["11:15pm", "First drink: The Graham rooftop if staying Georgetown, Top of the Gate if West End/Foggy Bottom, or Service Bar / Jane Jane if closer to Logan."],
      ["12:15am", "If energy is still there: Black Cat, Flash, 9:30 Club, Atlantis, or Adams Morgan depending on the event calendar."]
    ],
    note: "Friday should be frictionless. Pick the venue by calendar, not by generic neighborhood reputation."
  },
  {
    key: "sat",
    day: "Sat",
    label: "museum day",
    title: "National Mall, Library, monuments at night",
    city: "Mall / Capitol Hill",
    image: image("library-congress.jpg"),
    items: [
      ["9:30am", "Coffee and move east. If staying Georgetown, start early because the Mall is not next door."],
      ["10:30am", "Choose one serious museum: National Gallery, NMAAHC, Air & Space, or American History. Do not try to do every Smithsonian."],
      ["2:30pm", "Library of Congress timed-entry slot, then Capitol exterior and Supreme Court walk."],
      ["5:30pm", "Break at hotel. Dinner: Albi, Rose's Luxury, Fiola Mare, Daru, Yellow, or The Dabney depending on budget and bookings."],
      ["9:30pm", "Monuments after dinner: Lincoln, Vietnam, Korean, Reflecting Pool, Washington Monument."]
    ],
    note: "Saturday is the big DC day: museums by day, monuments by night. It is the highest-value version of the city."
  },
  {
    key: "sun",
    day: "Sun",
    label: "neighborhoods",
    title: "Georgetown, Dupont, Embassy Row",
    city: "Georgetown / Dupont",
    image: image("georgetown-waterfront.jpg"),
    items: [
      ["10:00am", "Georgetown morning: Baked & Wired, C&O Canal, Book Hill, waterfront."],
      ["12:30pm", "Dumbarton Oaks if it fits the schedule; otherwise keep it as a garden/museum backup."],
      ["2:30pm", "Dupont and Embassy Row: Phillips Collection, Kramerbooks, side streets."],
      ["5:30pm", "Kennedy Center terrace or Millennium Stage check."],
      ["8:00pm", "Dinner route: Fiola Mare if Georgetown, Tail Up Goat / Reveler's Hour if Adams Morgan, or Maydan / Daru for a more local food night."]
    ],
    note: "Sunday is where Georgetown earns its place. Keep it slower and more neighborhood-driven."
  },
  {
    key: "mon",
    day: "Mon",
    label: "exit",
    title: "One last clean morning",
    city: "Georgetown / White House",
    image: image("national-gallery-east.jpg"),
    items: [
      ["9:30am", "If Georgetown: canal/waterfront coffee. If West End/Dupont: Lafayette Square and White House exterior."],
      ["11:00am", "Optional final museum: National Gallery if you missed it, or National Portrait Gallery if downtown is easier."],
      ["12:30pm", "Lunch near hotel, airport."]
    ],
    note: "Do not put a timed-ticket anchor on Monday unless your flight is late."
  }
];

const maps = [
  {
    id: "base",
    title: "Base map",
    deck: "Georgetown -> West End -> Dupont",
    iframe:
      "https://maps.google.com/maps?q=Rosewood%20Washington%20DC%20to%20Georgetown%20Waterfront%20Park%20to%20Foggy%20Bottom-GWU%20Metro%20Station%20to%20The%20Dupont%20Circle%20Hotel%20to%20Logan%20Circle%20Washington%20DC&output=embed",
    action:
      "https://www.google.com/maps/dir/?api=1&origin=Rosewood%20Washington%20DC&destination=Logan%20Circle%2C%20Washington%2C%20DC&travelmode=walking&waypoints=Georgetown%20Waterfront%20Park%7CFoggy%20Bottom-GWU%20Metro%20Station%7CThe%20Dupont%20Circle%20Hotel",
    pins: ["Rosewood / Georgetown", "Georgetown Waterfront", "Foggy Bottom-GWU Metro", "Dupont Circle", "Logan / 14th"]
  },
  {
    id: "mall",
    title: "Saturday core",
    deck: "Mall -> LOC -> monuments",
    iframe:
      "https://maps.google.com/maps?q=National%20Gallery%20of%20Art%20to%20National%20Museum%20of%20African%20American%20History%20and%20Culture%20to%20Library%20of%20Congress%20Thomas%20Jefferson%20Building%20to%20Lincoln%20Memorial%20to%20Washington%20Monument&output=embed",
    action:
      "https://www.google.com/maps/dir/?api=1&origin=National%20Gallery%20of%20Art&destination=Lincoln%20Memorial%2C%20Washington%2C%20DC&travelmode=walking&waypoints=National%20Museum%20of%20African%20American%20History%20and%20Culture%7CLibrary%20of%20Congress%20Thomas%20Jefferson%20Building%7CWashington%20Monument",
    pins: ["National Gallery", "NMAAHC / Mall", "Library of Congress", "Washington Monument", "Lincoln Memorial"]
  },
  {
    id: "georgetown",
    title: "Georgetown loop",
    deck: "Canal -> Book Hill -> waterfront",
    iframe:
      "https://maps.google.com/maps?q=Baked%20%26%20Wired%20Washington%20DC%20to%20C%26O%20Canal%20Georgetown%20to%20Dumbarton%20Oaks%20to%20Georgetown%20Waterfront%20Park%20to%20Fiola%20Mare&output=embed",
    action:
      "https://www.google.com/maps/dir/?api=1&origin=Baked%20%26%20Wired%2C%20Washington%2C%20DC&destination=Fiola%20Mare%2C%20Washington%2C%20DC&travelmode=walking&waypoints=C%26O%20Canal%20Georgetown%7CDumbarton%20Oaks%7CGeorgetown%20Waterfront%20Park",
    pins: ["Baked & Wired", "C&O Canal", "Dumbarton Oaks", "Waterfront Park", "Fiola Mare"]
  },
  {
    id: "night",
    title: "Night route",
    deck: "Rooftops -> U Street -> Adams Morgan",
    iframe:
      "https://maps.google.com/maps?q=The%20Graham%20Georgetown%20to%20Top%20of%20the%20Gate%20Washington%20DC%20to%20Black%20Cat%20DC%20to%209%3A30%20Club%20to%20Adams%20Morgan%20Washington%20DC&output=embed",
    action:
      "https://www.google.com/maps/dir/?api=1&origin=The%20Graham%20Georgetown&destination=Adams%20Morgan%2C%20Washington%2C%20DC&travelmode=driving&waypoints=Top%20of%20the%20Gate%7CBlack%20Cat%20DC%7C9%3A30%20Club",
    pins: ["The Graham Rooftop", "Top of the Gate", "Black Cat", "9:30 / Atlantis", "Adams Morgan"]
  }
];

const officialChecks = [
  ["Washington.org", "Georgetown is worth it for atmosphere.", "Official tourism positions Georgetown as one of DC's core visitor neighborhoods; use it for canals, waterfront, shops, and historic streets.", "https://washington.org/dc-neighborhoods/georgetown"],
  ["NPS National Mall", "Monuments at night are not filler.", "The National Mall is the city-defining outdoor route; put it after dinner when the museums are closed.", "https://www.nps.gov/nama/planyourvisit/index.htm"],
  ["Michelin Guide", "Use DC for one serious dinner and one Bib-style meal.", "Michelin's DC coverage is deep enough to drive dinner choices without making every meal expensive.", "https://guide.michelin.com/us/en/district-of-columbia/washington-dc/restaurants"]
];

const georgetownOptions = [
  ["Core walk", "C&O Canal + Waterfront", "The best short walk if you only give Georgetown 90 minutes."],
  ["Coffee", "Baked & Wired or Yellow", "Keeps the morning local and avoids a generic hotel breakfast."],
  ["Culture", "Dumbarton Oaks", "Garden/museum option when you want old-world DC instead of another federal museum."],
  ["Dinner", "Fiola Mare", "The obvious waterfront splurge if you stay in Georgetown."]
];

const museumCards = [
  ["National Gallery", "Free, reliable, no timed ticket, strongest flexible museum anchor.", image("national-gallery-east.jpg")],
  ["Library of Congress", "Best timed-entry interior. Pair with Capitol Hill, not Georgetown.", image("library-congress.jpg")],
  ["NMAAHC / Air & Space", "High-demand timed-pass choices. Pick one, do it properly.", image("hero-dc-mall-dusk.jpg")]
];

const nightlife = [
  ["The Graham Rooftop", "Georgetown", "Convenient first drink if staying in the neighborhood.", "https://www.thegrahamgeorgetown.com/dining"],
  ["Top of the Gate", "Rooftop", "Best fit if staying West End/Foggy Bottom or Watergate.", "https://www.thewatergatehotel.com/dine-and-drink/top-of-the-gate/"],
  ["Black Cat", "14th Street", "Music venue three blocks from U Street/Cardozo Metro.", "https://www.blackcatdc.com/"],
  ["9:30 Club / The Atlantis", "U Street", "Pick by show calendar; this is better than forcing a random club.", "https://www.930.com/"],
  ["Flash", "Club", "Electronic/dance option; check the lineup first.", "https://www.flashdc.com/"],
  ["Adams Morgan", "Late bars", "Use for a looser second night if the show calendar is weak.", "https://washington.org/dc-neighborhoods/adams-morgan"]
];

const eats = {
  "Michelin anchors": [
    ["Albi", "One of the strongest serious dinner calls; Navy Yard.", "https://guide.michelin.com/us/en/district-of-columbia/washington-dc/restaurant/albi"],
    ["Rose's Luxury", "Capitol Hill classic, useful with Library/Mall day.", "https://guide.michelin.com/us/en/district-of-columbia/washington-dc/restaurant/rose-s-luxury"],
    ["Fiola Mare", "Georgetown waterfront splurge.", "https://guide.michelin.com/us/en/washington/washington-dc/restaurant/fiola-mare"],
    ["The Dabney", "Mid-Atlantic, Shaw/Blagden Alley.", "https://guide.michelin.com/us/en/district-of-columbia/washington-dc/restaurant/the-dabney"]
  ],
  "Bib / easier": [
    ["Daru", "Michelin Bib Gourmand Indian; H Street.", "https://guide.michelin.com/us/en/district-of-columbia/washington-dc/restaurant/daru"],
    ["Yellow", "Bib Gourmand cafe/Levantine; useful in Georgetown or Union Market.", "https://guide.michelin.com/us/en/district-of-columbia/washington-dc/restaurant/yellow"],
    ["Maydan", "Open-fire group dinner; still a strong DC food-room choice.", "https://guide.michelin.com/us/en/district-of-columbia/washington-dc/restaurant/maydan"],
    ["Amparo Fondita", "Dupont Mexican option in the Michelin conversation.", "https://guide.michelin.com/us/en/district-of-columbia/washington-dc/restaurant/amparo-fondita"]
  ],
  "Coffee / casual": [
    ["Baked & Wired", "Georgetown morning anchor.", "https://bakedandwired.com/"],
    ["Kramerbooks", "Dupont bookstore/cafe stop.", "https://www.kramers.com/"],
    ["Eastern Market", "Good if Sunday shifts toward Capitol Hill.", "https://easternmarket-dc.org/"],
    ["Union Market", "Food hall backup if weather is poor.", "https://unionmarketdc.com/"]
  ]
};

const sources = [
  ["Michelin: DC restaurants", "https://guide.michelin.com/us/en/district-of-columbia/washington-dc/restaurants"],
  ["Michelin: DC Bib Gourmands 2025", "https://guide.michelin.com/us/en/article/michelin-guide-ceremony/the-most-affordable-restaurants-in-washington-d.c.-in-2025"],
  ["Michelin: DC hotels with Keys", "https://guide.michelin.com/us/en/article/travel/best-hotels-washington-dc-michelin-keys"],
  ["Washington.org: Georgetown", "https://washington.org/dc-neighborhoods/georgetown"],
  ["Washington.org: Adams Morgan", "https://washington.org/dc-neighborhoods/adams-morgan"],
  ["NPS: National Mall", "https://www.nps.gov/nama/planyourvisit/index.htm"],
  ["Smithsonian hours", "https://www.si.edu/visit/hours"],
  ["National Gallery visit", "https://www.nga.gov/visit"],
  ["Library of Congress visit", "https://www.loc.gov/visit/"],
  ["Air & Space visit", "https://airandspace.si.edu/visit"],
  ["NMAAHC timed passes", "https://nmaahc.si.edu/visit/passes"],
  ["Recreation.gov Washington Monument", "https://www.recreation.gov/ticket/facility/234635"]
];

function App() {
  const [selectedMap, setSelectedMap] = useState("base");
  const [nightRoute, setNightRoute] = useState("show");
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
        <GeorgetownSection />
        <MuseumSection />
        <NightlifeSection />
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
    <section id="top" className="relative min-h-[760px] px-4 pt-20 md:min-h-[820px] md:px-8">
      <div className="absolute inset-0 -z-10">
        <img src={image("hero-dc-mall-dusk.jpg")} alt="" className="h-full w-full object-cover object-center opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-guide-mist/30 to-guide-mist" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
        <div className="glass mt-3 rounded-[1.7rem] p-5 md:mt-8 md:rounded-[2rem] md:p-8 lg:min-h-[500px]">
          <div className="guide-label mb-4 md:mb-5">Weekend itinerary</div>
          <h1 className="guide-serif max-w-xl text-[2.9rem] font-semibold leading-[0.9] tracking-[-0.04em] text-guide-ink min-[380px]:text-[3.15rem] md:text-[5.5rem]">
            Washington <br />DC
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-guide-ink/70 md:mt-6 md:gap-3 md:text-xs md:tracking-[0.18em]">
            <Sparkles className="h-4 w-4 text-guide-gold" />
            <span>Liquid glass guide</span>
            <span className="h-1 w-1 rounded-full bg-guide-red" />
            <span>Michelin + museums</span>
          </div>
          <p className="mt-4 max-w-xl text-[15px] leading-6 text-guide-ink/72 md:mt-5 md:text-lg md:leading-7">
            <span className="md:hidden">A Friday-to-Monday DC plan: Georgetown versus West End, one serious museum day, monuments at night, food, and two possible nights out.</span>
            <span className="hidden md:inline">Same Friday night to Monday format: where to stay, what to book, Georgetown versus better transit bases, one serious museum day, monuments after dark, and two possible nights out.</span>
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 min-[380px]:grid-cols-3 md:mt-6 md:grid-cols-3">
            {summary.map(([label, value]) => (
              <div key={label} className="rounded-[1.1rem] border border-white/70 bg-white/42 p-2.5 shadow-sm backdrop-blur-xl md:rounded-2xl md:p-3">
                <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-guide-ink/45 md:text-[11px]">{label}</span>
                <strong className="mt-1 block text-[13px] font-extrabold text-guide-ink md:text-sm">{value}</strong>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3 md:mt-6">
            <a href="#itinerary" className="focus-ring inline-flex items-center gap-2 rounded-full bg-guide-red px-4 py-3 text-sm font-extrabold text-white shadow-soft transition hover:bg-guide-redDeep md:px-5">
              View itinerary <ChevronDown className="h-4 w-4" />
            </a>
            <a href="#maps" className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-3 text-sm font-extrabold text-guide-ink transition hover:bg-white/80 md:px-5">
              Open maps <Navigation className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="glass-subtle mb-2 hidden rounded-[2rem] p-4 lg:block">
          <div className="relative overflow-hidden rounded-[1.55rem]">
            <img src={image("georgetown-waterfront.jpg")} alt="Georgetown waterfront in Washington DC" className="h-[460px] w-full object-cover" />
            <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-guide-ink/72 px-4 py-2 text-sm font-semibold text-white backdrop-blur-xl">
              <MapPin className="h-4 w-4" />
              Georgetown Waterfront
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
      <SectionHeader number="01" label="Stay" title="Stay Georgetown-ish" copy="Georgetown is the right instinct for charm, but the strict answer is Georgetown/West End/Foggy Bottom. You get the look without trapping every museum transfer in a rideshare." />
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="glass rounded-[2rem] p-6 md:p-8">
          <div className="guide-label">The call</div>
          <p className="mt-4 text-2xl font-semibold leading-snug text-guide-ink md:text-3xl">
            Book <span className="text-guide-red">Georgetown</span> if this is a pretty, romantic weekend. Book <span className="text-guide-red">West End/Foggy Bottom</span> if you want the same feel with Metro access.
          </p>
        </div>
        <div className="glass-subtle rounded-[2rem] p-6">
          <div className="guide-label">Avoid</div>
          <div className="mt-5 space-y-4">
            {["Do not stay deep downtown just because it is close to museums.", "Do not stay at The Wharf unless the hotel is the point.", "Do not make Georgetown the base if you hate rideshares."].map((item) => (
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
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-guide-red">Area source <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
          </a>
        ))}
      </div>
      <div className="mt-5 glass-subtle rounded-[1.8rem] p-5">
        <div className="guide-label">Hotel shortlist</div>
        <div className="mt-4 grid gap-2 md:grid-cols-5">
          {hotelShortlist.map(([name, why, href]) => (
            <a key={name} href={href} target="_blank" rel="noreferrer" className="focus-ring rounded-2xl bg-white/45 p-4 transition hover:bg-white">
              <strong className="block text-sm text-guide-ink">{name}</strong>
              <span className="mt-1 block text-xs leading-5 text-guide-ink/56">{why}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function TicketDesk() {
  return (
    <section id="tickets" className="section-shell pt-4">
      <SectionHeader number="02" label="Tickets" title="Booking desk" copy="DC is easy if you separate free walk-ins from timed-entry traps. Book the constrained items, leave the rest flexible." />
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
  const routeCopy = nightRoute === "show"
    ? "Prioritize one real show/club: 9:30, Atlantis, Black Cat, or Flash. This is stronger than wandering into a random bar."
    : "Keep it Georgetown/West End: rooftop, late walk by the canal or monuments, and back before the Sunday neighborhood day.";

  return (
    <section id="itinerary" className="section-shell">
      <SectionHeader number="03" label="Plan" title="The 3-day plan" copy="Friday 10pm arrival, Saturday museum/monument core, Sunday Georgetown plus Dupont, Monday light exit." />
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
                    <button aria-pressed={nightRoute === "show"} onClick={() => setNightRoute("show")} className={`focus-ring rounded-full px-4 py-2 text-sm font-bold transition ${nightRoute === "show" ? "bg-guide-red text-white" : "bg-white/70 text-guide-ink"}`}>Show / club night</button>
                    <button aria-pressed={nightRoute === "quiet"} onClick={() => setNightRoute("quiet")} className={`focus-ring rounded-full px-4 py-2 text-sm font-bold transition ${nightRoute === "quiet" ? "bg-guide-red text-white" : "bg-white/70 text-guide-ink"}`}>Quiet Georgetown night</button>
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
      <SectionHeader number="04" label="Maps" title="Glass map desk" copy="Four compact maps with named pins, so the itinerary is readable even when Google hides labels." />
      <div className="glass overflow-hidden rounded-[2rem]">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="p-4 md:p-6">
            <div className="flex flex-wrap gap-2">
              {maps.map((map) => (
                <button key={map.id} aria-pressed={selectedMap === map.id} onClick={() => setSelectedMap(map.id)} className={`focus-ring rounded-full px-4 py-2 text-sm font-extrabold transition ${selectedMap === map.id ? "bg-guide-red text-white shadow-soft" : "bg-white/54 text-guide-ink/68 hover:bg-white"}`}>
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

function GeorgetownSection() {
  return (
    <section id="georgetown" className="section-shell">
      <SectionHeader number="05" label="Georgetown" title="Yes, but precisely" copy="Georgetown is the right emotional answer. The practical answer is to stay at the edge: Georgetown, West End, or Foggy Bottom." />
      <div className="glass grid overflow-hidden rounded-[2rem] lg:grid-cols-[1.25fr_0.75fr]">
        <img src={image("georgetown-waterfront.jpg")} alt="Georgetown waterfront in Washington DC" className="h-[420px] w-full object-cover lg:h-full" loading="lazy" decoding="async" />
        <div className="p-6 md:p-8">
          <div className="guide-label">Georgetown logic</div>
          <h3 className="guide-serif mt-3 text-4xl font-semibold tracking-[-0.02em] text-guide-ink">Canal + waterfront</h3>
          <p className="mt-5 text-sm leading-7 text-guide-ink/66">Use Georgetown for atmosphere, coffee, old streets, waterfront dinner, and a Sunday morning that feels distinct from federal DC.</p>
          <div className="mt-6 grid gap-3">
            {georgetownOptions.map(([tag, title, copy]) => (
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

function MuseumSection() {
  return (
    <section id="museums" className="section-shell">
      <SectionHeader number="06" label="Museums" title="Pick fewer, go deeper" copy="The failure mode in DC is trying to collect museums. For a long weekend, pick one hard-ticket museum, one flexible art museum, and one night monument walk." />
      <div className="grid gap-4 lg:grid-cols-3">
        {officialChecks.map(([source, title, copy, href]) => (
          <a key={source} href={href} target="_blank" rel="noreferrer" className="glass-subtle focus-ring rounded-[1.6rem] p-5 transition hover:-translate-y-1 hover:bg-white/74">
            <span className="guide-label">{source} check</span>
            <strong className="mt-4 block text-lg leading-snug text-guide-ink">{title}</strong>
            <p className="mt-3 text-sm leading-6 text-guide-ink/62">{copy}</p>
          </a>
        ))}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {museumCards.map(([title, copy, src]) => (
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

function NightlifeSection() {
  return (
    <section id="nightlife" className="relative py-20 md:py-28">
      <div className="absolute inset-0 -z-10">
        <img src={image("monuments-night.jpg")} alt="" className="h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-guide-ink/88" />
      </div>
      <div className="mx-auto w-[min(1180px,calc(100%_-_32px))]">
        <div className="mb-9">
          <div className="guide-label text-guide-gold">07 / Nightlife</div>
          <h2 className="guide-serif mt-4 text-5xl font-semibold tracking-[-0.03em] text-white md:text-7xl">Two nights out</h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/66">Friday is a short rooftop/show decision. Saturday is either a real venue night or a quieter monuments-and-Georgetown night.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {nightlife.map(([name, type, copy, href]) => (
            <a key={name} href={href} target="_blank" rel="noreferrer" className="focus-ring rounded-[1.4rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl transition hover:bg-white/[0.12]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-guide-gold">{type}</span>
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

function FoodSection() {
  return (
    <section id="food" className="section-shell">
      <SectionHeader number="08" label="Eat" title="Eat, drink & coffee" copy="One serious dinner, one easier Michelin/Bib-style meal, and local coffee. Do not make every meal a reservation project." />
      <div className="grid gap-4 lg:grid-cols-3">
        {Object.entries(eats).map(([city, places]) => (
          <article key={city} className="glass-subtle rounded-[1.8rem] p-5">
            <h3 className="guide-serif text-2xl font-semibold tracking-[-0.02em] text-guide-ink">{city}</h3>
            <div className="mt-5 divide-y divide-guide-ink/10">
              {places.map(([name, copy, href]) => (
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
      <SectionHeader number="09" label="Sources" title="Check before you go" copy="The plan is source-backed, but timed-entry rules, restaurant schedules, and show calendars can move. Recheck before booking." />
      <div className="glass rounded-[2rem] p-5 md:p-7">
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {sources.map(([title, href]) => (
            <a key={title} href={href} target="_blank" rel="noreferrer" className="focus-ring group flex items-center justify-between gap-4 rounded-2xl bg-white/45 px-4 py-3 text-sm font-bold text-guide-ink/72 transition hover:bg-white">
              {title}
              <ExternalLink className="h-4 w-4 text-guide-red/70" />
            </a>
          ))}
        </div>
        <details className="mt-5 rounded-2xl bg-white/45 p-4">
          <summary className="cursor-pointer text-sm font-extrabold text-guide-red">Image credits</summary>
          <p className="mt-3 text-sm leading-7 text-guide-ink/62">
            Photos are real Wikimedia Commons images: Washington Monument from the Capitol at dusk; Key Bridge from Georgetown Waterfront by G. Edward Johnson; Thomas Jefferson Building interior; National Gallery East Building; Washington Monument from Lincoln Memorial at night. Licenses and attribution should be rechecked on Commons before any commercial reuse.
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
        <p className="guide-serif text-3xl font-semibold tracking-[-0.02em] text-guide-ink md:text-5xl">Stay Georgetown-ish. Museum once. Walk the monuments at night.</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-guide-ink/58">
          <a href="../" className="focus-ring rounded-full px-3 py-2 hover:text-guide-red">Back to homepage</a>
          <span>Washington DC - Friday to Monday</span>
        </div>
      </div>
    </footer>
  );
}

export default App;
