/**
 * HappyMoments --- This Day in History
 * Number-connected fun facts for daily engagement.
 * Combined with personal milestones for the "Today" section.
 */

const HISTORY_FACTS = {

    // ==================== JANUARY ====================

    "01-01": [
        {
            year: 1970,
            event: "Unix Epoch: the moment all computers count from",
            funFact: "Every digital timestamp traces back to midnight Jan 1, 1970 UTC",
            numberFact: "That's {daysAgo} days the Unix clock has been ticking --- over {yearsAgo} years of digital time",
            category: "technology"
        }
    ],
    "01-03": [
        {
            year: 1959,
            event: "Alaska becomes the 49th US state",
            funFact: "Alaska is 2.5x the size of Texas but has fewer people than San Francisco",
            numberFact: "Alaska joined the union {yearsAgo} years ago --- it's the largest state at 1.7 million km2",
            category: "politics"
        }
    ],
    "01-04": [
        {
            year: 2004,
            event: "NASA's Spirit rover lands on Mars",
            funFact: "Spirit was designed for 90 days but lasted over 2,200 days on Mars",
            numberFact: "Spirit landed {yearsAgo} years ago --- it outlived its warranty by 2,400%",
            category: "space"
        }
    ],
    "01-06": [
        {
            year: 1838,
            event: "Samuel Morse demonstrates the telegraph for the first time",
            funFact: "Morse code uses just dots and dashes to encode all 26 letters",
            numberFact: "{yearsAgo} years since Morse's demo --- his code used only 2 symbols to replace 26 letters",
            category: "invention"
        }
    ],
    "01-07": [
        {
            year: 1610,
            event: "Galileo discovers Jupiter's four largest moons",
            funFact: "The Galilean moons are so bright you could see them with binoculars",
            numberFact: "Galileo saw them {yearsAgo} years ago --- Io orbits Jupiter every 1.77 days, 42 hours",
            category: "science"
        }
    ],
    "01-09": [
        {
            year: 2007,
            event: "Steve Jobs unveils the first iPhone at Macworld",
            funFact: "The first iPhone had a 2MP camera and 128MB RAM --- less than a modern smartwatch",
            numberFact: "{yearsAgo} years since the iPhone launch --- over 2.3 billion iPhones have been sold since",
            category: "technology"
        }
    ],
    "01-12": [
        {
            year: 2010,
            event: "Devastating 7.0 earthquake strikes Haiti",
            funFact: "The earthquake released energy equivalent to 32 Hiroshima bombs",
            numberFact: "{yearsAgo} years since the Haiti earthquake --- 3 million people were affected",
            category: "nature"
        }
    ],
    "01-14": [
        {
            year: 2005,
            event: "Huygens probe lands on Saturn's moon Titan",
            funFact: "Huygens traveled 3.5 billion km over 7 years to reach Titan",
            numberFact: "Huygens landed {yearsAgo} years ago after traveling {daysAgo} days worth of distance in 7 years",
            category: "space"
        }
    ],
    "01-17": [
        {
            year: 1773,
            event: "Captain Cook's ship Resolution crosses Antarctic Circle",
            funFact: "Cook was the first known person to cross the Antarctic Circle at 66.5 degrees south",
            numberFact: "{yearsAgo} years ago humanity first crossed 66.5 degrees south latitude",
            category: "exploration"
        }
    ],
    "01-19": [
        {
            year: 1915,
            event: "Neon tube signs are patented by Georges Claude",
            funFact: "Neon gas glows red-orange; other 'neon' colors use different gases",
            numberFact: "{yearsAgo} years since neon signs were patented --- they use just 5 noble gases for all colors",
            category: "invention"
        }
    ],
    "01-21": [
        {
            year: 1976,
            event: "Concorde begins commercial supersonic flights",
            funFact: "Concorde flew at Mach 2.04 --- so fast it could outrun the sunset heading west",
            numberFact: "{yearsAgo} years since Concorde's first flight --- it crossed the Atlantic in 3 hours 30 minutes",
            category: "technology"
        }
    ],
    "01-23": [
        {
            year: 1960,
            event: "Bathyscaphe Trieste dives to the deepest ocean point",
            funFact: "At 10,916m deep, the pressure is over 1,000 atmospheres --- like 50 jumbo jets stacked on you",
            numberFact: "{yearsAgo} years since humans first reached 10,916m below sea level",
            category: "exploration"
        }
    ],
    "01-25": [
        {
            year: 2004,
            event: "NASA's Opportunity rover lands on Mars",
            funFact: "Opportunity ran a marathon distance on Mars --- 42.195 km over 11 years",
            numberFact: "Opportunity landed {yearsAgo} years ago and drove 45.16 km --- the first Martian marathon",
            category: "space"
        }
    ],
    "01-27": [
        {
            year: 1945,
            event: "Liberation of Auschwitz-Birkenau concentration camp",
            funFact: "International Holocaust Remembrance Day --- 'lest we forget'",
            numberFact: "{yearsAgo} years since liberation --- over 1.1 million people perished at Auschwitz alone",
            category: "human_rights"
        }
    ],
    "01-28": [
        {
            year: 1986,
            event: "Space Shuttle Challenger breaks apart 73 seconds after launch",
            funFact: "The disaster was caused by a single O-ring seal that failed at low temperature",
            numberFact: "{yearsAgo} years since Challenger --- a $0.10 O-ring caused the loss of 7 lives",
            category: "space"
        }
    ],
    "01-30": [
        {
            year: 1948,
            event: "Mahatma Gandhi is assassinated in New Delhi",
            funFact: "Gandhi walked over 79,000 km in his lifetime --- equivalent to circling Earth twice",
            numberFact: "{yearsAgo} years since Gandhi's death --- he led 400 million people to independence through nonviolence",
            category: "human_rights"
        }
    ],

    // ==================== FEBRUARY ====================

    "02-01": [
        {
            year: 2003,
            event: "Space Shuttle Columbia disintegrates during re-entry",
            funFact: "Columbia was traveling at Mach 18.3 --- 22,800 km/h --- when it broke apart",
            numberFact: "{yearsAgo} years since Columbia --- a piece of foam 750g caused the loss of 7 crew",
            category: "space"
        }
    ],
    "02-03": [
        {
            year: 1966,
            event: "Soviet Luna 9 makes first soft landing on the Moon",
            funFact: "Luna 9 weighed just 99 kg and transmitted photos for 3 days",
            numberFact: "First lunar soft landing {yearsAgo} years ago --- the lander was the size of a beach ball",
            category: "space"
        }
    ],
    "02-06": [
        {
            year: 1952,
            event: "Elizabeth II becomes Queen of the United Kingdom",
            funFact: "Elizabeth II reigned for 70 years and 214 days --- the longest in British history",
            numberFact: "{yearsAgo} years since her accession --- she met 13 US presidents during her reign",
            category: "politics"
        }
    ],
    "02-08": [
        {
            year: 1828,
            event: "Jules Verne is born in Nantes, France",
            funFact: "Verne predicted submarines, space travel, and video calls over 100 years early",
            numberFact: "Born {yearsAgo} years ago --- Verne wrote 54 novels that predicted the next 150 years of invention",
            category: "culture"
        }
    ],
    "02-10": [
        {
            year: 1996,
            event: "IBM's Deep Blue defeats Garry Kasparov in a chess game",
            funFact: "Deep Blue could evaluate 200 million positions per second",
            numberFact: "{yearsAgo} years since a computer first beat a world chess champion in a game",
            category: "technology"
        }
    ],
    "02-12": [
        {
            year: 1809,
            event: "Charles Darwin born --- later author of On the Origin of Species",
            funFact: "Darwin and Abraham Lincoln were born on the exact same day",
            numberFact: "{yearsAgo} years since Darwin's birth --- he studied 10,000+ barnacles before publishing his theory",
            category: "science"
        }
    ],
    "02-14": [
        {
            year: 270,
            event: "St. Valentine's Day --- celebrating love since Roman times",
            funFact: "About 150 million Valentine's cards are exchanged every year worldwide",
            numberFact: "The tradition spans roughly {yearsAgo} years --- 1 billion dollars in chocolate is sold each Feb 14",
            category: "culture"
        }
    ],
    "02-15": [
        {
            year: 1564,
            event: "Galileo Galilei born in Pisa, Italy",
            funFact: "Galileo's telescope had only 20x magnification --- less than cheap binoculars today",
            numberFact: "Born {yearsAgo} years ago --- Galileo discovered 4 moons with a lens just 37mm across",
            category: "science"
        }
    ],
    "02-17": [
        {
            year: 1869,
            event: "Mendeleev creates the first periodic table of elements",
            funFact: "Mendeleev left gaps and correctly predicted 3 undiscovered elements",
            numberFact: "{yearsAgo} years since the periodic table --- it started with 63 elements, now has 118",
            category: "science"
        }
    ],
    "02-19": [
        {
            year: 1473,
            event: "Nicolaus Copernicus is born in Torun, Poland",
            funFact: "Copernicus delayed publishing his heliocentric theory for 30 years, fearing backlash",
            numberFact: "Born {yearsAgo} years ago --- Copernicus proved Earth orbits the Sun at 107,000 km/h",
            category: "science"
        }
    ],
    "02-21": [
        {
            year: 1953,
            event: "Watson and Crick discover the double helix structure of DNA",
            funFact: "Stretched out, the DNA in one cell is about 2 meters long",
            numberFact: "{yearsAgo} years since the double helix --- your body has 37 trillion cells, each with 2m of DNA",
            category: "science"
        }
    ],
    "02-23": [
        {
            year: 1455,
            event: "Gutenberg Bible: first major book printed with movable type",
            funFact: "Only 49 Gutenberg Bibles survive; each is worth over $25 million",
            numberFact: "{yearsAgo} years since the printing revolution --- Gutenberg used 290 different letter molds",
            category: "invention"
        }
    ],
    "02-25": [
        {
            year: 1836,
            event: "Samuel Colt patents the first practical revolver",
            funFact: "The revolver had 6 chambers --- giving us the phrase 'six-shooter'",
            numberFact: "Patented {yearsAgo} years ago --- Colt was just 21 years old when he filed",
            category: "invention"
        }
    ],
    "02-27": [
        {
            year: 1932,
            event: "James Chadwick discovers the neutron",
            funFact: "Neutrons have no charge but make up over half the mass of most atoms",
            numberFact: "{yearsAgo} years since the neutron was found --- it completed the atomic model of proton-neutron-electron",
            category: "science"
        }
    ],
    "02-29": [
        {
            year: 1504,
            event: "Christopher Columbus uses a lunar eclipse to impress Jamaicans",
            funFact: "Leap days happen because Earth takes 365.2422 days to orbit the Sun",
            numberFact: "If you're born on Feb 29, you've only had {yearsAgo} 'real' birthdays... divided by 4",
            category: "science"
        }
    ],

    // ==================== MARCH ====================

    "03-01": [
        {
            year: 1896,
            event: "Henri Becquerel discovers radioactivity",
            funFact: "Becquerel left uranium on a photographic plate by accident --- and changed physics",
            numberFact: "{yearsAgo} years since radioactivity was discovered by pure accident",
            category: "science"
        }
    ],
    "03-03": [
        {
            year: 1847,
            event: "Alexander Graham Bell is born in Edinburgh",
            funFact: "Bell's first words on the telephone were 'Mr. Watson, come here, I want to see you'",
            numberFact: "Born {yearsAgo} years ago --- the telephone now connects 5.4 billion people worldwide",
            category: "invention"
        }
    ],
    "03-06": [
        {
            year: 1869,
            event: "Mendeleev presents the periodic table to the Russian Chemical Society",
            funFact: "He arranged 63 elements by atomic weight and predicted gallium, scandium, germanium",
            numberFact: "{yearsAgo} years ago Mendeleev organized all known matter --- from 63 elements to 118 today",
            category: "science"
        }
    ],
    "03-08": [
        {
            year: 1911,
            event: "International Women's Day celebrated for the first time",
            funFact: "Over 1 million people attended the first IWD rallies across Europe",
            numberFact: "{yearsAgo} years of International Women's Day --- still only 26% of national parliament seats held by women",
            category: "human_rights"
        }
    ],
    "03-10": [
        {
            year: 1876,
            event: "Alexander Graham Bell makes the first telephone call",
            funFact: "Bell considered the telephone an intrusion and refused to have one in his study",
            numberFact: "{yearsAgo} years since the first phone call --- today 6.8 billion people carry a phone",
            category: "invention"
        }
    ],
    "03-12": [
        {
            year: 1989,
            event: "Tim Berners-Lee proposes the World Wide Web at CERN",
            funFact: "The original proposal was marked 'Vague but exciting' by his boss",
            numberFact: "{yearsAgo} years since the web was proposed --- there are now over 1.9 billion websites",
            category: "technology"
        }
    ],
    "03-14": [
        {
            year: 1592,
            event: "Pi Day! Celebrating 3.14159265... (and Einstein's birthday, 1879)",
            funFact: "Pi has been calculated to 105 trillion digits --- it would take 3.3 million years to recite",
            numberFact: "{daysAgo} days since the year 1592 (3.14-15-92) --- pi is truly infinite and never repeating",
            category: "science"
        }
    ],
    "03-16": [
        {
            year: 1926,
            event: "Robert Goddard launches the first liquid-fueled rocket",
            funFact: "Goddard's first rocket flew for 2.5 seconds and reached 12.5 meters",
            numberFact: "{yearsAgo} years from a 12.5m flight to rockets that reach 400 km orbit",
            category: "space"
        }
    ],
    "03-18": [
        {
            year: 1965,
            event: "Alexei Leonov performs the first spacewalk (12 minutes)",
            funFact: "Leonov's suit inflated so much he could barely fit back through the airlock",
            numberFact: "{yearsAgo} years since the first spacewalk --- astronauts have now logged 2,500+ hours outside",
            category: "space"
        }
    ],
    "03-20": [
        {
            year: 2026,
            event: "March equinox --- day and night are nearly equal worldwide",
            funFact: "On the equinox, the Sun rises exactly east and sets exactly west everywhere on Earth",
            numberFact: "Earth tilts 23.44 degrees --- this tiny angle creates all our seasons across {daysAgo} days of orbit",
            category: "nature"
        }
    ],
    "03-22": [
        {
            year: 1993,
            event: "World Water Day established by the United Nations",
            funFact: "Only 2.5% of Earth's water is freshwater; only 0.3% is accessible in lakes and rivers",
            numberFact: "{yearsAgo} years raising awareness --- 2.2 billion people still lack safe drinking water",
            category: "nature"
        }
    ],
    "03-24": [
        {
            year: 1882,
            event: "Robert Koch announces the discovery of the tuberculosis bacterium",
            funFact: "TB has killed more humans than any other infectious disease in history",
            numberFact: "{yearsAgo} years since Koch identified TB --- it had killed an estimated 1 billion people before him",
            category: "science"
        }
    ],
    "03-27": [
        {
            year: 1998,
            event: "FDA approves Viagra --- sildenafil becomes a cultural phenomenon",
            funFact: "Viagra was originally developed as a heart medication; the famous effect was a side effect",
            numberFact: "{yearsAgo} years since approval --- over 65 million prescriptions written worldwide",
            category: "science"
        }
    ],
    "03-29": [
        {
            year: 1807,
            event: "Heinrich Olbers discovers the asteroid Vesta",
            funFact: "Vesta is so bright it's sometimes visible to the naked eye --- the only asteroid you can see",
            numberFact: "Discovered {yearsAgo} years ago --- Vesta has a diameter of 525 km and 9% of asteroid belt mass",
            category: "space"
        }
    ],
    "03-31": [
        {
            year: 1889,
            event: "Eiffel Tower officially opens in Paris",
            funFact: "The tower was supposed to be dismantled after 20 years but was saved by radio antennas",
            numberFact: "{yearsAgo} years old --- the Eiffel Tower grows ~15 cm taller in summer due to thermal expansion",
            category: "culture"
        }
    ],

    // ==================== APRIL ====================

    "04-01": [
        {
            year: 1976,
            event: "Steve Jobs and Steve Wozniak found Apple Computer Company",
            funFact: "Apple was founded on April Fools' Day --- the Apple I sold for $666.66",
            numberFact: "{yearsAgo} years since Apple was founded --- now worth over $3 trillion",
            category: "technology"
        }
    ],
    "04-03": [
        {
            year: 1973,
            event: "First handheld mobile phone call made by Martin Cooper",
            funFact: "The first mobile phone weighed 1.1 kg and had 30 minutes of battery life",
            numberFact: "{yearsAgo} years from a 1.1 kg brick phone to 200g smartphones with 48-hour batteries",
            category: "invention"
        }
    ],
    "04-06": [
        {
            year: 1909,
            event: "Robert Peary claims to reach the North Pole",
            funFact: "The North Pole sits on frozen ocean --- there's no land beneath it at all",
            numberFact: "{yearsAgo} years since the claimed first North Pole expedition --- the ice is now 40% thinner",
            category: "exploration"
        }
    ],
    "04-08": [
        {
            year: 1820,
            event: "Venus de Milo discovered on the Greek island of Milos",
            funFact: "Nobody knows who sculpted her or how she lost her arms",
            numberFact: "Found {yearsAgo} years ago --- the statue is roughly 2,100 years old and stands 2.04m tall",
            category: "culture"
        }
    ],
    "04-10": [
        {
            year: 2019,
            event: "First image of a black hole revealed (M87 galaxy)",
            funFact: "The black hole's shadow is 6.5 billion times the mass of our Sun",
            numberFact: "{yearsAgo} years since we first SAW a black hole --- 5 petabytes of data were needed for 1 image",
            category: "space"
        }
    ],
    "04-12": [
        {
            year: 1961,
            event: "Yuri Gagarin becomes the first human in space",
            funFact: "Gagarin's entire flight lasted 108 minutes in Vostok 1 --- just 1 orbit",
            numberFact: "{yearsAgo} years since humanity first left Earth --- Gagarin orbited at 27,400 km/h for 108 minutes",
            category: "space"
        }
    ],
    "04-14": [
        {
            year: 1986,
            event: "Largest hailstones on record fall in Bangladesh (1 kg each)",
            funFact: "Hailstones can exceed 15 cm diameter and fall at 160 km/h",
            numberFact: "{yearsAgo} years since 1 kg hailstones fell --- they were the size of grapefruits",
            category: "nature"
        }
    ],
    "04-15": [
        {
            year: 1912,
            event: "RMS Titanic sinks after hitting an iceberg",
            funFact: "The Titanic had only 20 lifeboats for 2,224 people --- 48% of what was needed",
            numberFact: "{yearsAgo} years since the Titanic sank --- it lies 3,800m deep, roughly {daysAgo} days of memories ago",
            category: "culture"
        }
    ],
    "04-17": [
        {
            year: 1970,
            event: "Apollo 13 crew splashes down safely after near-disaster",
            funFact: "The crew survived by using the lunar module as a lifeboat for 4 days",
            numberFact: "{yearsAgo} years since Apollo 13 --- the crew had to navigate 330,000 km home with almost no power",
            category: "space"
        }
    ],
    "04-19": [
        {
            year: 1971,
            event: "Soviet Union launches Salyut 1 --- the first space station",
            funFact: "Salyut 1 orbited for 175 days and was just 15.8m long --- smaller than a bus",
            numberFact: "{yearsAgo} years since the first space station --- the ISS is now 109m wide and weighs 420,000 kg",
            category: "space"
        }
    ],
    "04-22": [
        {
            year: 1970,
            event: "First Earth Day celebrated --- 20 million Americans participate",
            funFact: "Earth Day is now observed in 193 countries by over 1 billion people",
            numberFact: "{yearsAgo} years of Earth Day --- from 20 million participants to 1 billion across 193 countries",
            category: "nature"
        }
    ],
    "04-24": [
        {
            year: 1990,
            event: "Hubble Space Telescope launched aboard Space Shuttle Discovery",
            funFact: "Hubble orbits at 547 km altitude and has made over 1.5 million observations",
            numberFact: "{yearsAgo} years of Hubble --- it has traveled over 6 billion km, like Neptune and back",
            category: "space"
        }
    ],
    "04-25": [
        {
            year: 1953,
            event: "Watson and Crick publish the structure of DNA in Nature",
            funFact: "Their paper was just 1 page long --- 900 words that changed biology forever",
            numberFact: "{yearsAgo} years since the DNA paper --- 900 words described 3.2 billion base pairs of human genome",
            category: "science"
        }
    ],
    "04-26": [
        {
            year: 1986,
            event: "Chernobyl nuclear disaster --- worst nuclear accident in history",
            funFact: "The exclusion zone is now a thriving wildlife refuge with wolves, bears, and wild horses",
            numberFact: "{yearsAgo} years since Chernobyl --- the area will remain unsafe for ~20,000 years due to plutonium-239",
            category: "nature"
        }
    ],
    "04-28": [
        {
            year: 2001,
            event: "Dennis Tito becomes the first space tourist",
            funFact: "Tito paid $20 million for 7 days, 22 hours in space aboard the ISS",
            numberFact: "{yearsAgo} years since the first space tourist --- that's about $110,000 per minute in space",
            category: "space"
        }
    ],
    "04-30": [
        {
            year: 1897,
            event: "J.J. Thomson announces the discovery of the electron",
            funFact: "Electrons are 1,836 times lighter than protons but carry equal and opposite charge",
            numberFact: "{yearsAgo} years since electrons were discovered --- every device you use depends on moving them",
            category: "science"
        }
    ],

    // ==================== MAY ====================

    "05-01": [
        {
            year: 1886,
            event: "International Workers' Day --- origin from Haymarket affair in Chicago",
            funFact: "The 8-hour workday movement started here: '8 hours work, 8 hours rest, 8 hours play'",
            numberFact: "{yearsAgo} years of Labour Day --- the original demand was 8+8+8=24 hours fairly divided",
            category: "human_rights"
        }
    ],
    "05-03": [
        {
            year: 1469,
            event: "Niccolo Machiavelli is born in Florence, Italy",
            funFact: "The Prince was published 5 years after his death and banned by the Pope",
            numberFact: "Born {yearsAgo} years ago --- The Prince has been continuously in print for 500+ years",
            category: "culture"
        }
    ],
    "05-05": [
        {
            year: 1961,
            event: "Alan Shepard becomes the first American in space",
            funFact: "Shepard's suborbital flight lasted just 15 minutes and reached 187 km altitude",
            numberFact: "{yearsAgo} years since Shepard's flight --- only 23 days after Gagarin, the space race was on",
            category: "space"
        }
    ],
    "05-07": [
        {
            year: 1895,
            event: "Alexander Popov demonstrates a practical radio receiver",
            funFact: "Popov and Marconi independently invented radio --- who was first is still debated",
            numberFact: "{yearsAgo} years of radio --- electromagnetic waves travel at 300,000 km/s",
            category: "invention"
        }
    ],
    "05-10": [
        {
            year: 1869,
            event: "Transcontinental railroad completed at Promontory, Utah",
            funFact: "The 3,000 km railway replaced a 6-month journey with a 7-day train ride",
            numberFact: "{yearsAgo} years since the golden spike --- it cut US coast-to-coast travel time by 96%",
            category: "technology"
        }
    ],
    "05-11": [
        {
            year: 1997,
            event: "IBM's Deep Blue defeats Garry Kasparov in a 6-game chess match",
            funFact: "Deep Blue evaluated 200 million chess positions per second using 480 custom chips",
            numberFact: "{yearsAgo} years since a machine first beat the world chess champion in a match --- a milestone for AI",
            category: "technology"
        }
    ],
    "05-14": [
        {
            year: 1796,
            event: "Edward Jenner administers the first successful smallpox vaccine",
            funFact: "Smallpox killed 300 million people in the 20th century alone before eradication in 1980",
            numberFact: "{yearsAgo} years since the first vaccine --- it eventually saved an estimated 500 million lives",
            category: "science"
        }
    ],
    "05-16": [
        {
            year: 1960,
            event: "Theodore Maiman fires the first laser (ruby crystal, 694nm)",
            funFact: "The laser was called 'a solution looking for a problem' --- now it's in everything",
            numberFact: "{yearsAgo} years since the first laser pulse --- it emitted light at exactly 694.3 nanometers",
            category: "invention"
        }
    ],
    "05-18": [
        {
            year: 1980,
            event: "Mount St. Helens erupts with the force of 500 Hiroshima bombs",
            funFact: "The eruption removed 400m from the mountain's peak in seconds",
            numberFact: "{yearsAgo} years since the eruption --- it ejected 2.8 km3 of material and was heard 300 km away",
            category: "nature"
        }
    ],
    "05-20": [
        {
            year: 1873,
            event: "Levi Strauss and Jacob Davis patent blue jeans with copper rivets",
            funFact: "The original jeans were made for miners --- riveted for durability while digging gold",
            numberFact: "{yearsAgo} years of blue jeans --- over 450 million pairs are sold every year worldwide",
            category: "invention"
        }
    ],
    "05-22": [
        {
            year: 1906,
            event: "Wright brothers granted patent for their 'Flying Machine'",
            funFact: "Their first flight was shorter than a Boeing 747's wingspan: 36.5m vs 64.4m",
            numberFact: "{yearsAgo} years since the Wright patent --- from 36.5m flights to 13,000 km nonstop range today",
            category: "invention"
        }
    ],
    "05-24": [
        {
            year: 1844,
            event: "First telegraph message sent: 'What hath God wrought'",
            funFact: "The message traveled 61 km from Washington DC to Baltimore in seconds",
            numberFact: "{yearsAgo} years since the first long-distance instant message --- at about 2/3 the speed of light",
            category: "technology"
        }
    ],
    "05-25": [
        {
            year: 1977,
            event: "Star Wars released in theaters --- changes cinema forever",
            funFact: "The original budget was $11 million; it earned $775 million worldwide",
            numberFact: "{yearsAgo} years since Star Wars --- it returned 7,000% on investment and spawned a $70B franchise",
            category: "culture"
        }
    ],
    "05-27": [
        {
            year: 1930,
            event: "Chrysler Building opens in New York --- world's tallest at 319m",
            funFact: "Its spire was assembled secretly inside and raised in 90 minutes to beat a rival",
            numberFact: "{yearsAgo} years since the Chrysler Building opened --- it held the record for just 11 months",
            category: "culture"
        }
    ],
    "05-29": [
        {
            year: 1953,
            event: "Edmund Hillary and Tenzing Norgay reach the summit of Everest",
            funFact: "At 8,849m, you inhale only 1/3 the oxygen available at sea level",
            numberFact: "{yearsAgo} years since humans first stood at 8,849m --- over 6,000 have summited since",
            category: "exploration"
        }
    ],
    "05-31": [
        {
            year: 1859,
            event: "Big Ben rings for the first time at the Palace of Westminster",
            funFact: "Big Ben is actually the bell's name --- the tower is Elizabeth Tower",
            numberFact: "{yearsAgo} years of Big Ben --- the bell weighs 13.7 tonnes and strikes the note E natural",
            category: "culture"
        }
    ],

    // ==================== JUNE ====================

    "06-01": [
        {
            year: 1967,
            event: "The Beatles release Sgt. Pepper's Lonely Hearts Club Band",
            funFact: "Took 129 days and 700 hours of studio time --- revolutionized the album as an art form",
            numberFact: "Released {daysAgo} days ago --- the album that changed music has been inspiring artists for {yearsAgo} years",
            category: "culture"
        }
    ],
    "06-03": [
        {
            year: 1965,
            event: "Ed White performs the first American spacewalk (23 minutes)",
            funFact: "White enjoyed it so much that Houston had to order him back inside multiple times",
            numberFact: "{yearsAgo} years since the first US spacewalk --- White floated at 28,000 km/h for 23 minutes",
            category: "space"
        }
    ],
    "06-05": [
        {
            year: 1981,
            event: "CDC reports first cases of what will become known as AIDS",
            funFact: "The first report described just 5 cases of pneumonia in Los Angeles",
            numberFact: "{yearsAgo} years since AIDS was identified --- from 5 initial cases to 85 million infections worldwide",
            category: "science"
        }
    ],
    "06-06": [
        {
            year: 1944,
            event: "D-Day: Allied forces land on Normandy beaches",
            funFact: "156,000 troops landed on 5 beaches spanning 80 km of coastline on a single day",
            numberFact: "{yearsAgo} years since D-Day --- 5,000 ships, 13,000 aircraft, 156,000 troops in one operation",
            category: "politics"
        }
    ],
    "06-08": [
        {
            year: 1949,
            event: "George Orwell's 1984 is published",
            funFact: "Orwell wrote it while dying of tuberculosis on a remote Scottish island",
            numberFact: "{yearsAgo} years since 1984 was published --- sales spike every time surveillance news breaks",
            category: "culture"
        }
    ],
    "06-10": [
        {
            year: 2003,
            event: "NASA launches Spirit rover to Mars --- arrives January 2004",
            funFact: "Spirit's 90-day mission lasted 6 years --- 20 times its planned duration",
            numberFact: "Launched {yearsAgo} years ago --- Spirit traveled 487 million km to land on another planet",
            category: "space"
        }
    ],
    "06-12": [
        {
            year: 1991,
            event: "Mount Pinatubo erupts in the Philippines --- 2nd largest eruption of 20th century",
            funFact: "Pinatubo's ash cloud cooled global temperatures by 0.5C for an entire year",
            numberFact: "{yearsAgo} years since Pinatubo --- it injected 20 million tonnes of SO2 into the stratosphere",
            category: "nature"
        }
    ],
    "06-14": [
        {
            year: 1951,
            event: "UNIVAC I delivered to the US Census Bureau --- first commercial computer",
            funFact: "UNIVAC weighed 13 tonnes, used 5,200 vacuum tubes, and had 1,000 words of memory",
            numberFact: "{yearsAgo} years from 13-tonne computers to chips weighing 2 grams with 100 billion transistors",
            category: "technology"
        }
    ],
    "06-16": [
        {
            year: 1904,
            event: "Bloomsday --- the day on which all of Joyce's Ulysses takes place",
            funFact: "The entire 730-page novel covers a single day in Dublin: June 16, 1904",
            numberFact: "{yearsAgo} years since the fictional day --- Joyce packed 265,222 words into 18 hours of narrative",
            category: "culture"
        }
    ],
    "06-18": [
        {
            year: 1983,
            event: "Sally Ride becomes the first American woman in space",
            funFact: "A reporter asked if she wept during spaceflight --- Ride responded with laughter",
            numberFact: "{yearsAgo} years since Sally Ride's flight --- she was 32 years old, the youngest American astronaut",
            category: "space"
        }
    ],
    "06-20": [
        {
            year: 2001,
            event: "World Refugee Day observed for the first time by the UN",
            funFact: "More people are displaced now than at any time in recorded human history",
            numberFact: "{yearsAgo} years of World Refugee Day --- over 100 million people are currently forcibly displaced",
            category: "human_rights"
        }
    ],
    "06-21": [
        {
            year: 2026,
            event: "June solstice --- longest day of the year in the Northern Hemisphere",
            funFact: "At the Arctic Circle, the Sun doesn't set at all on the summer solstice",
            numberFact: "Earth's 23.44-degree tilt gives us {daysAgo} days of varying daylight each year",
            category: "nature"
        }
    ],
    "06-22": [
        {
            year: 1633,
            event: "Galileo forced to recant heliocentrism by the Inquisition",
            funFact: "Legend says Galileo muttered 'And yet it moves' after recanting --- likely apocryphal",
            numberFact: "{yearsAgo} years since Galileo's trial --- the Vatican formally apologized in 1992, 359 years later",
            category: "science"
        }
    ],
    "06-23": [
        {
            year: 1868,
            event: "Christopher Sholes patents the QWERTY typewriter",
            funFact: "QWERTY was designed to prevent jams, not to slow typists --- that's a myth",
            numberFact: "{yearsAgo} years and we still use the same keyboard layout for billions of devices",
            category: "invention"
        }
    ],
    "06-25": [
        {
            year: 1991,
            event: "Slovenia and Croatia declare independence from Yugoslavia",
            funFact: "Slovenia's independence war lasted just 10 days --- the 'Ten-Day War'",
            numberFact: "{yearsAgo} years since Slovenian independence --- won in just 10 days with 19 casualties",
            category: "politics"
        }
    ],
    "06-26": [
        {
            year: 2000,
            event: "Human Genome Project announces first draft of the human genome",
            funFact: "Humans share 60% of their DNA with bananas and 98.8% with chimpanzees",
            numberFact: "{yearsAgo} years since the genome draft --- 3.2 billion base pairs sequenced over 13 years",
            category: "science"
        }
    ],
    "06-28": [
        {
            year: 1969,
            event: "Stonewall uprising begins in New York City",
            funFact: "The Stonewall Inn was designated a US National Monument in 2016",
            numberFact: "{yearsAgo} years since Stonewall --- it sparked the modern LGBTQ+ rights movement worldwide",
            category: "human_rights"
        }
    ],
    "06-30": [
        {
            year: 1905,
            event: "Einstein publishes his paper on special relativity (E=mc2)",
            funFact: "Einstein was a 26-year-old patent clerk when he changed physics forever",
            numberFact: "{yearsAgo} years since E=mc2 --- the most famous equation says 1 kg of mass = 90 petajoules of energy",
            category: "science"
        }
    ],

// ==================== JULY ====================

    "07-01": [
        {
            year: 1867,
            event: "Canada becomes a self-governing dominion (Canada Day)",
            funFact: "Canada has the longest coastline of any country: 243,042 km",
            numberFact: "{yearsAgo} years of Canada --- its coastline of 243,042 km could wrap Earth 6 times",
            category: "politics"
        }
    ],
    "07-02": [
        {
            year: 1937,
            event: "Amelia Earhart disappears over the Pacific Ocean",
            funFact: "Earhart had already flown solo across the Atlantic --- only the second person ever",
            numberFact: "{yearsAgo} years since Earhart vanished --- her plane has never been found despite 35,000 km2 of searches",
            category: "exploration"
        }
    ],
    "07-04": [
        {
            year: 1776,
            event: "United States Declaration of Independence adopted",
            funFact: "Only 2 signers became President: John Adams and Thomas Jefferson --- both died on July 4, 1826",
            numberFact: "{yearsAgo} years of American independence --- 56 men signed the document on that day",
            category: "politics"
        },
        {
            year: 2012,
            event: "CERN announces discovery of the Higgs boson",
            funFact: "The Higgs field gives mass to all particles --- without it, everything would travel at light speed",
            numberFact: "{yearsAgo} years since the Higgs discovery --- it took 48 years and $13.25 billion to confirm",
            category: "science"
        }
    ],
    "07-05": [
        {
            year: 1996,
            event: "Dolly the sheep born --- first mammal cloned from an adult cell",
            funFact: "Dolly was named after Dolly Parton because the cell came from a mammary gland",
            numberFact: "{yearsAgo} years since the first mammal clone --- created from cell number 277 out of 277 attempts",
            category: "science"
        }
    ],
    "07-07": [
        {
            year: 1928,
            event: "Sliced bread sold for the first time in Chillicothe, Missouri",
            funFact: "The phrase 'best thing since sliced bread' refers to this exact date",
            numberFact: "{yearsAgo} years of sliced bread --- Americans now consume about 3 billion loaves per year",
            category: "invention"
        }
    ],
    "07-09": [
        {
            year: 1955,
            event: "Russell-Einstein Manifesto calls for nuclear disarmament",
            funFact: "Signed by 11 scientists including 10 Nobel laureates --- Einstein signed 4 days before his death",
            numberFact: "{yearsAgo} years since the manifesto --- global nuclear stockpile peaked at 70,300 warheads in 1986",
            category: "science"
        }
    ],
    "07-10": [
        {
            year: 1856,
            event: "Nikola Tesla born in Smiljan, Croatia (then Austrian Empire)",
            funFact: "Tesla held over 300 patents and could visualize entire machines in his mind before building them",
            numberFact: "Born {yearsAgo} years ago --- Tesla's AC motor runs at 50-60 Hz, powering the entire modern world",
            category: "invention"
        }
    ],
    "07-12": [
        {
            year: 100,
            event: "Julius Caesar born (traditional date) --- Roman dictator and reformer",
            funFact: "The Julian calendar he introduced was used for 1,600 years across the Western world",
            numberFact: "Born roughly {yearsAgo} years ago --- his calendar had 365.25 days, off by only 11 minutes per year",
            category: "politics"
        }
    ],
    "07-14": [
        {
            year: 1789,
            event: "Storming of the Bastille begins the French Revolution",
            funFact: "Only 7 prisoners were inside the Bastille when it was stormed",
            numberFact: "{yearsAgo} years since Bastille Day --- the fortress held just 7 prisoners but symbolized absolute power",
            category: "politics"
        }
    ],
    "07-16": [
        {
            year: 1945,
            event: "Trinity nuclear test --- first detonation of a nuclear weapon",
            funFact: "Oppenheimer quoted the Bhagavad Gita: 'Now I am become Death, the destroyer of worlds'",
            numberFact: "{yearsAgo} years since Trinity --- the blast was equivalent to 21 kilotonnes of TNT",
            category: "science"
        }
    ],
    "07-18": [
        {
            year: 1918,
            event: "Nelson Mandela born in Mvezo, South Africa",
            funFact: "Mandela spent 27 years in prison --- he emerged to become South Africa's first Black president",
            numberFact: "Born {yearsAgo} years ago --- Mandela was prisoner #46664 for 27 years, then president for 5",
            category: "human_rights"
        }
    ],
    "07-20": [
        {
            year: 1969,
            event: "Apollo 11: Neil Armstrong and Buzz Aldrin walk on the Moon",
            funFact: "The Apollo Guidance Computer had less processing power than a modern calculator",
            numberFact: "{yearsAgo} years since humans walked on the Moon --- Armstrong's first step was watched by 600 million people",
            category: "space"
        }
    ],
    "07-22": [
        {
            year: 1934,
            event: "FBI agents shoot John Dillinger outside a Chicago cinema",
            funFact: "Dillinger escaped jail twice and robbed 24 banks in just one year",
            numberFact: "{yearsAgo} years since Dillinger's end --- his crime spree lasted 424 days, robbing $500,000 total",
            category: "culture"
        }
    ],
    "07-24": [
        {
            year: 1911,
            event: "Hiram Bingham III rediscovers Machu Picchu",
            funFact: "The Inca citadel sits at 2,430m and was unknown to the outside world for 400 years",
            numberFact: "Rediscovered {yearsAgo} years ago --- Machu Picchu has 150 buildings at 2,430m altitude",
            category: "exploration"
        }
    ],
    "07-25": [
        {
            year: 1978,
            event: "Louise Brown born --- the world's first 'test-tube baby' (IVF)",
            funFact: "Over 12 million babies have been born through IVF since Louise Brown",
            numberFact: "{yearsAgo} years of IVF --- from 1 baby to 12 million and growing worldwide",
            category: "science"
        }
    ],
    "07-27": [
        {
            year: 1866,
            event: "First successful transatlantic telegraph cable completed",
            funFact: "The cable stretched 3,000 km across the Atlantic Ocean floor",
            numberFact: "{yearsAgo} years since the Atlantic was wired --- messages dropped from 10 days to minutes",
            category: "technology"
        }
    ],
    "07-29": [
        {
            year: 1958,
            event: "NASA established by the National Aeronautics and Space Act",
            funFact: "NASA's first budget was $100 million --- it peaked at $5.9 billion in 1966 for Apollo",
            numberFact: "{yearsAgo} years of NASA --- from $100M budget to landing humans on the Moon in just 11 years",
            category: "space"
        },
        {
            year: 1989,
            event: "Tim Berners-Lee writes the first proposal for the World Wide Web",
            funFact: "The first website went live in 1991 --- it explained what the World Wide Web was",
            numberFact: "{yearsAgo} years since the WWW was conceived --- there are now 5.4 billion internet users",
            category: "technology"
        }
    ],
    "07-30": [
        {
            year: 1863,
            event: "Henry Ford born in Dearborn, Michigan",
            funFact: "Ford didn't invent the car --- he invented the assembly line that made cars affordable",
            numberFact: "Born {yearsAgo} years ago --- Ford's assembly line cut Model T build time from 12 hours to 93 minutes",
            category: "invention"
        }
    ],

    // ==================== AUGUST ====================

    "08-01": [
        {
            year: 1774,
            event: "Joseph Priestley discovers oxygen by heating mercury oxide",
            funFact: "Priestley didn't realize what he found --- Lavoisier later named it 'oxygen'",
            numberFact: "{yearsAgo} years since oxygen was isolated --- it makes up 21% of the air we breathe",
            category: "science"
        }
    ],
    "08-02": [
        {
            year: 1922,
            event: "Alexander Graham Bell dies --- every phone in North America silenced for 1 minute",
            funFact: "Over 13 million phones went silent simultaneously during Bell's funeral tribute",
            numberFact: "{yearsAgo} years since Bell's death --- 13 million phones silenced, now 8 billion phones exist",
            category: "invention"
        }
    ],
    "08-04": [
        {
            year: 2007,
            event: "NASA's Phoenix lander launched to Mars --- discovers water ice",
            funFact: "Phoenix confirmed water ice on Mars by watching it sublimate over several days",
            numberFact: "{yearsAgo} years since Phoenix launched --- it traveled 679 million km to touch Martian ice",
            category: "space"
        }
    ],
    "08-06": [
        {
            year: 1945,
            event: "Atomic bomb 'Little Boy' dropped on Hiroshima, Japan",
            funFact: "The bomb detonated at 580m altitude with a yield of 15 kilotonnes --- equivalent to 15,000 tonnes of TNT",
            numberFact: "{yearsAgo} years since Hiroshima --- the blast killed approximately 80,000 people instantly",
            category: "politics"
        }
    ],
    "08-08": [
        {
            year: 1908,
            event: "Wilbur Wright flies publicly for the first time in Le Mans, France",
            funFact: "European skeptics were silenced --- Wright circled the field with perfect control",
            numberFact: "{yearsAgo} years since Wright's European debut --- just 5 years after the first 12-second flight",
            category: "invention"
        }
    ],
    "08-10": [
        {
            year: 1990,
            event: "Magellan spacecraft begins mapping Venus with radar",
            funFact: "Venus's surface is hidden by thick clouds --- radar was the only way to see it",
            numberFact: "{yearsAgo} years since Magellan mapped Venus --- it imaged 98% of the surface at 100m resolution",
            category: "space"
        }
    ],
    "08-12": [
        {
            year: 1981,
            event: "IBM introduces the Personal Computer (IBM PC 5150)",
            funFact: "The original IBM PC had 16 KB of RAM and cost $1,565 --- about $5,200 today",
            numberFact: "{yearsAgo} years of the PC era --- from 16 KB RAM to 128 GB, an 8-million-fold increase",
            category: "technology"
        }
    ],
    "08-13": [
        {
            year: 1961,
            event: "East Germany begins building the Berlin Wall overnight",
            funFact: "The wall was 155 km long with 302 watchtowers and a 'death strip' between two walls",
            numberFact: "{yearsAgo} years since the Wall went up --- it stood for 10,316 days before falling",
            category: "politics"
        }
    ],
    "08-15": [
        {
            year: 1945,
            event: "Japan surrenders, ending World War II (V-J Day)",
            funFact: "Emperor Hirohito's surrender broadcast was the first time most Japanese heard his voice",
            numberFact: "{yearsAgo} years since WWII ended --- the war lasted 2,194 days and involved 70 million soldiers",
            category: "politics"
        }
    ],
    "08-17": [
        {
            year: 1807,
            event: "Robert Fulton's steamboat makes its first trip on the Hudson River",
            funFact: "The Clermont traveled 240 km upstream from NYC to Albany in 32 hours",
            numberFact: "{yearsAgo} years since the first steamboat trip --- it made travel against river currents practical",
            category: "invention"
        }
    ],
    "08-19": [
        {
            year: 1839,
            event: "Daguerreotype photography process publicly announced in Paris",
            funFact: "Early daguerreotype exposures took 15-30 minutes --- subjects had to sit perfectly still",
            numberFact: "{yearsAgo} years of photography --- from 15-minute exposures to 1/8000-second shutter speeds",
            category: "invention"
        }
    ],
    "08-21": [
        {
            year: 1959,
            event: "Hawaii becomes the 50th US state",
            funFact: "Hawaii is the only US state made entirely of islands --- 137 of them",
            numberFact: "{yearsAgo} years since Hawaii joined the union --- it consists of 137 islands spanning 2,400 km",
            category: "politics"
        }
    ],
    "08-23": [
        {
            year: 1966,
            event: "Lunar Orbiter 1 takes the first photo of Earth from the Moon's orbit",
            funFact: "The iconic photo showed Earth rising above the Moon's horizon for the first time",
            numberFact: "{yearsAgo} years since humans first saw Earth from another world --- at a distance of 380,000 km",
            category: "space"
        }
    ],
    "08-25": [
        {
            year: 1977,
            event: "Voyager 2 launched --- now the farthest human-made object in interstellar space",
            funFact: "Voyager 2 is still transmitting data from 19+ billion km away with a 23-watt radio",
            numberFact: "{yearsAgo} years of flight --- Voyager 2 is over 19 billion km from Earth, signals take 18+ hours",
            category: "space"
        }
    ],
    "08-27": [
        {
            year: 1883,
            event: "Krakatoa erupts --- loudest sound in recorded history",
            funFact: "The eruption was heard 4,800 km away in Australia --- equivalent to hearing a bomb in London from New York",
            numberFact: "{yearsAgo} years since Krakatoa --- the eruption was heard 4,800 km away and lowered global temps by 1.2C",
            category: "nature"
        }
    ],
    "08-29": [
        {
            year: 2005,
            event: "Hurricane Katrina devastates New Orleans and the Gulf Coast",
            funFact: "Katrina's storm surge reached 8.5m --- higher than most two-story buildings",
            numberFact: "{yearsAgo} years since Katrina --- it caused $125 billion in damage and displaced 1 million people",
            category: "nature"
        }
    ],
    "08-31": [
        {
            year: 1897,
            event: "Thomas Edison patents the kinetoscope (motion picture camera)",
            funFact: "Edison's early films were just 20 seconds long --- enough time for a sneeze or a kiss",
            numberFact: "{yearsAgo} years of motion pictures --- from 20-second clips to 3-hour blockbusters at 120 fps",
            category: "invention"
        }
    ],

    // ==================== SEPTEMBER ====================

    "09-01": [
        {
            year: 1939,
            event: "Germany invades Poland --- World War II begins",
            funFact: "WWII would involve 61 countries and 1.7 billion people --- 3/4 of the world's population",
            numberFact: "{yearsAgo} years since WWII began --- it lasted 2,194 days and cost an estimated 70-85 million lives",
            category: "politics"
        }
    ],
    "09-02": [
        {
            year: 1969,
            event: "First ARPANET message sent --- precursor to the internet",
            funFact: "The first message was 'LO' --- it was supposed to be 'LOGIN' but the system crashed after 2 letters",
            numberFact: "{yearsAgo} years from a 2-letter crash to 5.4 billion internet users sending 333 billion emails daily",
            category: "technology"
        }
    ],
    "09-04": [
        {
            year: 1998,
            event: "Google is founded by Larry Page and Sergey Brin in a garage",
            funFact: "Google's original name was 'Backrub' and ran on Stanford University servers",
            numberFact: "{yearsAgo} years of Google --- from a garage project to processing 8.5 billion searches per day",
            category: "technology"
        }
    ],
    "09-06": [
        {
            year: 1522,
            event: "Magellan's ship Victoria completes first circumnavigation of Earth",
            funFact: "Only 18 of 270 crew survived --- Magellan himself was killed in the Philippines",
            numberFact: "{yearsAgo} years since the first trip around the world --- it took 3 years; now planes do it in 42 hours",
            category: "exploration"
        }
    ],
    "09-08": [
        {
            year: 1966,
            event: "Star Trek premieres on NBC television",
            funFact: "Star Trek predicted mobile phones, tablets, voice assistants, and automatic doors",
            numberFact: "{yearsAgo} years of Star Trek --- the show predicted technologies that took 30-50 years to build",
            category: "culture"
        }
    ],
    "09-10": [
        {
            year: 2008,
            event: "Large Hadron Collider at CERN activated for the first time",
            funFact: "The LHC is 27 km in circumference and cooled to -271.3C --- colder than outer space",
            numberFact: "{yearsAgo} years since the LHC first fired --- protons travel at 99.9999991% the speed of light inside",
            category: "science"
        }
    ],
    "09-12": [
        {
            year: 1962,
            event: "JFK's 'We choose to go to the Moon' speech at Rice University",
            funFact: "The Moon landing was achieved just 7 years later --- one of the greatest engineering feats ever",
            numberFact: "{yearsAgo} years since that speech --- 400,000 people worked on Apollo and it cost $25.4 billion",
            category: "space"
        }
    ],
    "09-14": [
        {
            year: 1849,
            event: "Ivan Pavlov born --- discoverer of the conditioned reflex",
            funFact: "Pavlov's dogs began salivating at the sound of a bell --- proving learned responses exist",
            numberFact: "Born {yearsAgo} years ago --- Pavlov's work on conditioning is still foundational in psychology and AI",
            category: "science"
        }
    ],
    "09-15": [
        {
            year: 2008,
            event: "Lehman Brothers files for bankruptcy --- triggers global financial crisis",
            funFact: "Lehman had $639 billion in assets --- making it the largest bankruptcy in US history",
            numberFact: "{yearsAgo} years since the financial crash --- $639 billion in assets vanished overnight, triggering a global recession",
            category: "politics"
        }
    ],
    "09-17": [
        {
            year: 1787,
            event: "US Constitution signed in Philadelphia by 39 delegates",
            funFact: "The Constitution is just 4,543 words --- the shortest national constitution still in use",
            numberFact: "{yearsAgo} years since the US Constitution --- 4,543 words have governed 330 million people",
            category: "politics"
        }
    ],
    "09-19": [
        {
            year: 1991,
            event: "Otzi the Iceman discovered in the Alps by German hikers",
            funFact: "Otzi lived around 3300 BC, making him over 5,000 years old --- with 61 tattoos",
            numberFact: "Found {yearsAgo} years ago --- Otzi is about 5,300 years old, the oldest well-preserved human mummy",
            category: "science"
        }
    ],
    "09-21": [
        {
            year: 1981,
            event: "Belize gains independence from the United Kingdom",
            funFact: "Belize is home to the Great Blue Hole --- a 300m-wide underwater sinkhole visible from space",
            numberFact: "{yearsAgo} years of Belizean independence --- the Great Blue Hole is 300m across and 125m deep",
            category: "politics"
        }
    ],
    "09-23": [
        {
            year: 1846,
            event: "Neptune discovered by Johann Galle using Le Verrier's calculations",
            funFact: "Neptune was found mathematically before it was seen --- pure mathematics predicted a planet",
            numberFact: "Discovered {yearsAgo} years ago --- Neptune orbits so slowly it hasn't completed one orbit since discovery",
            category: "space"
        }
    ],
    "09-25": [
        {
            year: 1956,
            event: "First transatlantic telephone cable (TAT-1) goes into operation",
            funFact: "TAT-1 could handle just 36 simultaneous calls between the US and UK",
            numberFact: "{yearsAgo} years from 36 calls to millions of simultaneous transatlantic data streams",
            category: "technology"
        }
    ],
    "09-28": [
        {
            year: 1928,
            event: "Alexander Fleming discovers penicillin by accident",
            funFact: "Fleming noticed mold killing bacteria on a Petri dish he'd left unwashed over vacation",
            numberFact: "{yearsAgo} years since penicillin --- it has saved an estimated 200 million lives since discovery",
            category: "science"
        }
    ],
    "09-30": [
        {
            year: 1907,
            event: "First electric washing machine patented by Alva Fisher",
            funFact: "Before electric washers, laundry took an entire day of manual labor",
            numberFact: "{yearsAgo} years of the electric washing machine --- it freed 8+ hours per week of household labor",
            category: "invention"
        }
    ],

    // ==================== OCTOBER ====================

    "10-01": [
        {
            year: 1908,
            event: "Ford Model T goes on sale --- first affordable automobile",
            funFact: "Ford's assembly line cut the Model T price from $850 to $260 --- about $4,500 today",
            numberFact: "{yearsAgo} years since the Model T --- Ford sold 15 million of them by 1927",
            category: "invention"
        }
    ],
    "10-03": [
        {
            year: 1990,
            event: "German reunification --- East and West Germany merge into one nation",
            funFact: "Reunification happened in just 11 months after the Wall fell --- astonishingly fast for geopolitics",
            numberFact: "{yearsAgo} years since reunification --- 16 million East Germans joined 63 million West Germans overnight",
            category: "politics"
        }
    ],
    "10-04": [
        {
            year: 1957,
            event: "Soviet Union launches Sputnik 1 --- first artificial satellite",
            funFact: "Sputnik was just 58 cm across and weighed 83.6 kg --- it beeped for 21 days",
            numberFact: "{yearsAgo} years since Sputnik --- humanity's first satellite orbited at 29,000 km/h for 3 months",
            category: "space"
        }
    ],
    "10-06": [
        {
            year: 1995,
            event: "First exoplanet orbiting a Sun-like star discovered (51 Pegasi b)",
            funFact: "51 Pegasi b is a 'hot Jupiter' --- it orbits its star in just 4.23 days",
            numberFact: "{yearsAgo} years since the first exoplanet --- we've now confirmed over 5,500 exoplanets",
            category: "space"
        }
    ],
    "10-09": [
        {
            year: 1446,
            event: "Hangul Day --- Korean alphabet proclaimed by King Sejong the Great",
            funFact: "Hangul was designed to be learned in a single day --- it has 14 consonants and 10 vowels",
            numberFact: "{yearsAgo} years of Hangul --- a 24-letter system designed so that anyone could learn to read",
            category: "culture"
        }
    ],
    "10-11": [
        {
            year: 1958,
            event: "NASA's Pioneer 1 launched --- first spacecraft after NASA's founding",
            funFact: "Pioneer 1 didn't reach escape velocity but still gathered useful data about radiation belts",
            numberFact: "{yearsAgo} years since NASA's first launch --- Pioneer 1 reached an altitude of 113,854 km",
            category: "space"
        }
    ],
    "10-13": [
        {
            year: 1884,
            event: "Greenwich adopted as the Prime Meridian (0 degrees longitude)",
            funFact: "France abstained from the vote and used the Paris Meridian for 27 more years",
            numberFact: "{yearsAgo} years since we agreed on 0 degrees longitude --- dividing Earth into 360 degrees and 24 time zones",
            category: "science"
        }
    ],
    "10-14": [
        {
            year: 1947,
            event: "Chuck Yeager breaks the sound barrier in the Bell X-1",
            funFact: "Yeager named the plane 'Glamorous Glennis' after his wife --- and flew it with broken ribs",
            numberFact: "{yearsAgo} years since Mach 1 was broken --- Yeager flew at 1,127 km/h at 13,700m altitude",
            category: "technology"
        }
    ],
    "10-16": [
        {
            year: 1846,
            event: "First public demonstration of surgical anesthesia (ether)",
            funFact: "Before anesthesia, surgery was a race against the patient passing out from pain",
            numberFact: "{yearsAgo} years of painless surgery --- over 310 million operations are performed annually worldwide",
            category: "science"
        }
    ],
    "10-18": [
        {
            year: 1867,
            event: "United States takes possession of Alaska from Russia",
            funFact: "The US paid $7.2 million for Alaska --- about 2 cents per acre. Critics called it 'Seward's Folly'",
            numberFact: "{yearsAgo} years since the Alaska purchase --- $7.2M for 1.7 million km2, or $0.02 per acre",
            category: "politics"
        }
    ],
    "10-20": [
        {
            year: 2011,
            event: "Muammar Gaddafi captured and killed, ending 42-year rule of Libya",
            funFact: "Gaddafi ruled Libya for 42 years --- one of the longest dictatorships in modern history",
            numberFact: "{yearsAgo} years since the end of a 42-year dictatorship in Libya",
            category: "politics"
        }
    ],
    "10-22": [
        {
            year: 1938,
            event: "Chester Carlson invents xerography --- the basis of photocopying",
            funFact: "20 companies including IBM and Kodak rejected Carlson's invention before Haloid (later Xerox) took it",
            numberFact: "{yearsAgo} years of photocopying --- rejected by 20 companies, it became a $25 billion industry",
            category: "invention"
        }
    ],
    "10-24": [
        {
            year: 1945,
            event: "United Nations officially comes into existence",
            funFact: "The UN Charter was signed by 51 original member nations --- today there are 193",
            numberFact: "{yearsAgo} years of the United Nations --- from 51 founding members to 193 nations today",
            category: "politics"
        }
    ],
    "10-26": [
        {
            year: 1861,
            event: "Pony Express ends as transcontinental telegraph is completed",
            funFact: "The Pony Express lasted just 18 months before the telegraph made it obsolete",
            numberFact: "{yearsAgo} years since the Pony Express ended --- 10-day mail delivery replaced by instant telegrams",
            category: "technology"
        }
    ],
    "10-28": [
        {
            year: 1886,
            event: "Statue of Liberty dedicated in New York Harbor",
            funFact: "Lady Liberty's torch was originally supposed to function as a lighthouse",
            numberFact: "{yearsAgo} years since the Statue of Liberty --- she stands 93m tall and weighs 225 tonnes",
            category: "culture"
        }
    ],
    "10-29": [
        {
            year: 1969,
            event: "First ARPANET message sent --- the birthday of the internet",
            funFact: "The message was 'LO' --- meant to be 'LOGIN' but the system crashed after two characters",
            numberFact: "{yearsAgo} years since the internet's first message --- 2 letters grew into 5.4 billion connected users",
            category: "technology"
        }
    ],
    "10-31": [
        {
            year: 1517,
            event: "Martin Luther posts 95 Theses --- sparks the Protestant Reformation",
            funFact: "Luther's protest led to the translation of the Bible into common languages for the first time",
            numberFact: "{yearsAgo} years since the 95 Theses --- they sparked a reformation across 2/3 of Europe",
            category: "culture"
        },
        {
            year: 2026,
            event: "Halloween --- from ancient Celtic Samhain to modern trick-or-treating",
            funFact: "Americans spend about $12 billion on Halloween annually --- $3.6 billion on costumes alone",
            numberFact: "Halloween traditions span over 2,000 years --- {yearsAgo} years of candy, costumes, and 600 million pounds of candy sold",
            category: "culture"
        }
    ],

    // ==================== NOVEMBER ====================

    "11-01": [
        {
            year: 1512,
            event: "Sistine Chapel ceiling by Michelangelo first exhibited to the public",
            funFact: "Michelangelo painted the 1,100 m2 ceiling mostly standing up, not lying down as commonly believed",
            numberFact: "{yearsAgo} years since the Sistine ceiling --- Michelangelo painted 343 figures over 1,100 m2 in 4 years",
            category: "culture"
        }
    ],
    "11-03": [
        {
            year: 1957,
            event: "Soviet Union launches Sputnik 2 with Laika --- first animal in orbit",
            funFact: "Laika the dog was a stray from the streets of Moscow chosen for her calm temperament",
            numberFact: "{yearsAgo} years since Laika orbited Earth --- she was the first living creature in orbit, one month after Sputnik 1",
            category: "space"
        }
    ],
    "11-05": [
        {
            year: 1605,
            event: "Gunpowder Plot discovered --- Guy Fawkes caught under Parliament",
            funFact: "Fawkes had 36 barrels of gunpowder --- enough to destroy Parliament and damage buildings 500m away",
            numberFact: "{yearsAgo} years since the Gunpowder Plot --- 36 barrels of gunpowder found 5m beneath the House of Lords",
            category: "politics"
        }
    ],
    "11-07": [
        {
            year: 1867,
            event: "Marie Curie born in Warsaw, Poland",
            funFact: "Curie is the only person to win Nobel Prizes in two different sciences --- physics and chemistry",
            numberFact: "Born {yearsAgo} years ago --- Curie discovered 2 elements (polonium and radium) and won 2 Nobel Prizes",
            category: "science"
        }
    ],
    "11-09": [
        {
            year: 1989,
            event: "Berlin Wall falls --- the beginning of the end of the Cold War",
            funFact: "The Wall fell partly because of a confused press conference --- a spokesman accidentally said borders were open 'immediately'",
            numberFact: "{yearsAgo} years since the Wall fell --- it had stood for 10,316 days, dividing 3.5 million Berliners",
            category: "politics"
        }
    ],
    "11-10": [
        {
            year: 1969,
            event: "Sesame Street premieres on National Educational Television",
            funFact: "Research showed children who watched Sesame Street entered school with a 6-month learning advantage",
            numberFact: "{yearsAgo} years of Sesame Street --- watched by 77 million Americans in its first season alone",
            category: "culture"
        }
    ],
    "11-12": [
        {
            year: 1980,
            event: "Voyager 1 makes closest approach to Saturn (124,000 km)",
            funFact: "Saturn's rings are only about 10m thick on average despite being 282,000 km wide",
            numberFact: "{yearsAgo} years since Voyager 1 flew past Saturn --- its rings are 282,000 km wide but just 10m thick",
            category: "space"
        }
    ],
    "11-14": [
        {
            year: 1889,
            event: "Nellie Bly begins her trip around the world in 72 days",
            funFact: "Bly beat Phileas Fogg's fictional 80 days, traveling with just one small bag",
            numberFact: "{yearsAgo} years since Bly's journey --- she circled the globe in 72 days, 6 hours, 11 minutes",
            category: "exploration"
        }
    ],
    "11-16": [
        {
            year: 1945,
            event: "UNESCO established to promote world peace through education and science",
            funFact: "UNESCO has designated over 1,100 World Heritage Sites across 167 countries",
            numberFact: "{yearsAgo} years of UNESCO --- it protects 1,100+ World Heritage Sites in 167 countries",
            category: "culture"
        }
    ],
    "11-18": [
        {
            year: 1928,
            event: "Mickey Mouse debuts in Steamboat Willie --- first synchronized sound cartoon",
            funFact: "Walt Disney himself voiced Mickey Mouse for the first 20 years",
            numberFact: "{yearsAgo} years of Mickey Mouse --- Disney's $15,000 cartoon launched a $200 billion entertainment empire",
            category: "culture"
        }
    ],
    "11-19": [
        {
            year: 1863,
            event: "Abraham Lincoln delivers the Gettysburg Address (272 words)",
            funFact: "Lincoln's speech was just 2 minutes long, after a 2-hour speech by Edward Everett that nobody remembers",
            numberFact: "{yearsAgo} years since the Gettysburg Address --- 272 words delivered in 2 minutes became the most quoted speech in history",
            category: "politics"
        }
    ],
    "11-21": [
        {
            year: 1877,
            event: "Thomas Edison announces the phonograph --- first device to record and play sound",
            funFact: "Edison's first recording was 'Mary Had a Little Lamb' --- it lasted about 10 seconds",
            numberFact: "{yearsAgo} years of recorded sound --- from a 10-second nursery rhyme to 100 million songs on streaming",
            category: "invention"
        }
    ],
    "11-23": [
        {
            year: 1924,
            event: "Edwin Hubble proves galaxies exist beyond the Milky Way",
            funFact: "Before Hubble, scientists believed the Milky Way WAS the entire universe",
            numberFact: "{yearsAgo} years since we learned the Milky Way isn't alone --- there are 2 trillion galaxies in the observable universe",
            category: "space"
        }
    ],
    "11-25": [
        {
            year: 1952,
            event: "Agatha Christie's The Mousetrap opens in London --- still running today",
            funFact: "The Mousetrap has had over 28,000 performances --- the longest-running show in history",
            numberFact: "{yearsAgo} years of continuous performances --- over 28,000 shows and 10 million audience members",
            category: "culture"
        }
    ],
    "11-28": [
        {
            year: 1964,
            event: "NASA launches Mariner 4 to Mars --- first successful Mars flyby",
            funFact: "Mariner 4 sent back 22 photos of Mars that took 8 hours each to transmit",
            numberFact: "{yearsAgo} years since Mariner 4 --- it returned 22 photos at 8.3 bits per second, slower than a telegraph",
            category: "space"
        }
    ],
    "11-30": [
        {
            year: 1872,
            event: "First international football match: Scotland 0 --- England 0",
            funFact: "The match was played in Glasgow before 4,000 spectators --- now the World Cup final draws 1 billion viewers",
            numberFact: "{yearsAgo} years of international football --- from 4,000 spectators to 1 billion watching the World Cup",
            category: "culture"
        }
    ],

    // ==================== DECEMBER ====================

    "12-01": [
        {
            year: 1988,
            event: "World AIDS Day observed for the first time",
            funFact: "The red ribbon became the first disease-awareness ribbon, starting a now-universal practice",
            numberFact: "{yearsAgo} years of World AIDS Day --- 40 million people have died of AIDS-related illness since 1981",
            category: "human_rights"
        }
    ],
    "12-02": [
        {
            year: 1942,
            event: "Enrico Fermi achieves first self-sustaining nuclear chain reaction",
            funFact: "The reactor was built under the bleachers of a University of Chicago squash court",
            numberFact: "{yearsAgo} years since the first nuclear reaction --- 440 nuclear reactors now generate 10% of world electricity",
            category: "science"
        }
    ],
    "12-04": [
        {
            year: 1996,
            event: "Mars Pathfinder launched --- first rover on Mars (Sojourner)",
            funFact: "Sojourner was the size of a microwave oven and weighed just 10.6 kg",
            numberFact: "{yearsAgo} years since the first Mars rover launched --- Sojourner traveled only 100m but proved rovers work on Mars",
            category: "space"
        }
    ],
    "12-06": [
        {
            year: 1877,
            event: "Thomas Edison records the first human voice ('Mary Had a Little Lamb')",
            funFact: "Edison shouted the nursery rhyme into a tin foil cylinder --- and it played back",
            numberFact: "{yearsAgo} years of recorded human voice --- from tin foil to 100 trillion hours of audio stored digitally",
            category: "invention"
        }
    ],
    "12-08": [
        {
            year: 1995,
            event: "Galileo spacecraft arrives at Jupiter after 6-year journey",
            funFact: "Galileo's atmospheric probe survived for 58 minutes inside Jupiter before being crushed by pressure",
            numberFact: "{yearsAgo} years since Galileo reached Jupiter --- it traveled 4.6 billion km over 6 years",
            category: "space"
        }
    ],
    "12-10": [
        {
            year: 1901,
            event: "First Nobel Prizes awarded in Stockholm (and Oslo for Peace)",
            funFact: "Alfred Nobel invented dynamite and left his fortune of 31 million SEK to fund the prizes",
            numberFact: "{yearsAgo} years of Nobel Prizes --- over 900 individuals and 25 organizations have been honored",
            category: "science"
        },
        {
            year: 1948,
            event: "Universal Declaration of Human Rights adopted by the UN General Assembly",
            funFact: "Eleanor Roosevelt chaired the drafting committee --- it was translated into 500+ languages",
            numberFact: "{yearsAgo} years of the UDHR --- 30 articles in 500+ languages, the most translated document in the world",
            category: "human_rights"
        }
    ],
    "12-12": [
        {
            year: 1901,
            event: "Guglielmo Marconi receives the first transatlantic radio signal",
            funFact: "The signal was the Morse code letter 'S' (three dots) sent from Cornwall to Newfoundland",
            numberFact: "{yearsAgo} years since the first transatlantic radio --- 3 dots traveled 3,500 km through the air",
            category: "technology"
        }
    ],
    "12-14": [
        {
            year: 1911,
            event: "Roald Amundsen reaches the South Pole --- first expedition to do so",
            funFact: "Amundsen beat Robert Scott by 34 days --- Scott's team perished on the return journey",
            numberFact: "{yearsAgo} years since humans first reached the South Pole --- the temperature there averages -49C",
            category: "exploration"
        }
    ],
    "12-16": [
        {
            year: 1773,
            event: "Boston Tea Party --- colonists dump 342 chests of tea into the harbor",
            funFact: "The 342 chests contained 46 tonnes of tea --- worth about $1.7 million today",
            numberFact: "{yearsAgo} years since the Boston Tea Party --- 46 tonnes of tea dumped, sparking a revolution",
            category: "politics"
        }
    ],
    "12-17": [
        {
            year: 1903,
            event: "Wright Brothers achieve first powered, controlled airplane flight",
            funFact: "The first flight lasted 12 seconds and covered 36.5m --- less than a Boeing 747's wingspan",
            numberFact: "{yearsAgo} years from a 12-second flight to commercial planes that fly 18 hours nonstop",
            category: "invention"
        }
    ],
    "12-19": [
        {
            year: 1972,
            event: "Apollo 17 returns to Earth --- last humans to visit the Moon",
            funFact: "Gene Cernan is the last person to walk on the Moon --- his daughter's initials are still there",
            numberFact: "{yearsAgo} years since the last Moon visit --- only 12 humans have ever walked on another world",
            category: "space"
        }
    ],
    "12-21": [
        {
            year: 2026,
            event: "December solstice --- shortest day in Northern Hemisphere",
            funFact: "At the Arctic Circle, the Sun doesn't rise at all on the winter solstice",
            numberFact: "Earth's 23.44-degree axial tilt creates seasons --- the Sun is at its lowest noon point today",
            category: "nature"
        }
    ],
    "12-23": [
        {
            year: 1947,
            event: "Transistor demonstrated at Bell Labs by Bardeen, Brattain, and Shockley",
            funFact: "The first transistor was the size of a thumb --- modern chips have 100 billion transistors",
            numberFact: "{yearsAgo} years since the transistor --- from 1 to 100 billion on a chip, enabling all modern technology",
            category: "technology"
        }
    ],
    "12-25": [
        {
            year: 1642,
            event: "Isaac Newton born (Julian calendar) --- discoverer of gravity and calculus",
            funFact: "Newton invented calculus, described gravity, and split white light --- during a plague lockdown",
            numberFact: "Born {yearsAgo} years ago --- Newton's F=ma, three laws, and universal gravitation still govern engineering",
            category: "science"
        },
        {
            year: 2026,
            event: "Christmas Day --- celebrated by 2 billion people worldwide",
            funFact: "The tradition of Christmas trees came from 16th-century Germany",
            numberFact: "Christmas is celebrated by 2+ billion people in 160+ countries --- {yearsAgo} years of modern tradition",
            category: "culture"
        }
    ],
    "12-27": [
        {
            year: 1831,
            event: "Charles Darwin departs on HMS Beagle --- the voyage that inspired evolution",
            funFact: "Darwin was 22, nearly rejected for the shape of his nose, and seasick the entire voyage",
            numberFact: "{yearsAgo} years since Darwin's voyage --- 5 years at sea visiting 40+ islands shaped evolutionary theory",
            category: "science"
        }
    ],
    "12-29": [
        {
            year: 1989,
            event: "Vaclav Havel elected president of Czechoslovakia --- Velvet Revolution triumph",
            funFact: "Havel went from political prisoner to president in just 6 weeks",
            numberFact: "{yearsAgo} years since Havel's election --- from prison to presidency in 42 days without a shot fired",
            category: "politics"
        }
    ],
    "12-31": [
        {
            year: 1879,
            event: "Thomas Edison demonstrates incandescent electric light publicly for the first time",
            funFact: "Edison's bulb lasted 13.5 hours --- modern LEDs last 50,000 hours, a 3,700x improvement",
            numberFact: "{yearsAgo} years of electric light --- from 13.5 hours to 50,000 hours per bulb, a {yearsAgo}-year revolution",
            category: "invention"
        },
        {
            year: 2026,
            event: "New Year's Eve --- the world celebrates the turn of the year",
            funFact: "The Times Square ball has dropped since 1907 --- the current one weighs 5,386 kg with 2,688 crystals",
            numberFact: "Midnight sweeps across 24 time zones in 24 hours --- {yearsAgo} years of New Year's celebrations and counting",
            category: "culture"
        }
    ]
};

// Get today's history facts with calculated days/years ago
const _NEGATIVE_WORDS = ['bankrupt','bomb','atomic','hiroshima','nagasaki','earthquake','tsunami','hurricane','devastat','kills','killed','death','dies','died','assassinat','murder','war begin','invades','attack','terror','crash','disaster','sank','sinking','plague','pandemic','famine','genocide','massacre','nuclear test','breaks apart','erupts','forced to recant','concentration camp','perished'];

function getTodayHistoryFacts() {
    const now = new Date();
    const key = String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    const allFacts = HISTORY_FACTS[key] || [];

    // Filter out negative events
    const facts = allFacts.filter(f => {
        const lower = (f.event + ' ' + f.numberFact).toLowerCase();
        return !_NEGATIVE_WORDS.some(w => lower.includes(w));
    });

    return facts.map(f => {
        const yearsAgo = now.getFullYear() - f.year;
        const daysAgo = Math.floor((now - new Date(f.year, now.getMonth(), now.getDate())) / (24*60*60*1000));

        return {
            ...f,
            daysAgo: daysAgo,
            yearsAgo: yearsAgo,
            numberFact: f.numberFact
                .replace(/\{daysAgo\}/g, daysAgo.toLocaleString())
                .replace(/\{yearsAgo\}/g, yearsAgo.toString())
        };
    });
}

// Get a random history fact (for variety)
function getRandomHistoryFact() {
    const keys = Object.keys(HISTORY_FACTS);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const facts = HISTORY_FACTS[key];
    return facts[Math.floor(Math.random() * facts.length)];
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HISTORY_FACTS, getTodayHistoryFacts, getRandomHistoryFact };
}
