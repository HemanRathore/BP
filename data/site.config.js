/* ==========================================================================
   BP ENTERPRISES — SITE CONFIGURATION
   --------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU NEED TO EDIT TO UPDATE THE WEBSITE.
   Every phone number, address, email and toggle used across all pages of the
   website is read from this file. Change it here once, and it updates
   everywhere on the site.

   HOW TO EDIT:  change the text between the "quotes". Keep the punctuation
   (commas, colons, quotes) exactly as it is. Save. Refresh the page.
   ========================================================================== */

window.BP_CONFIG = {

  /* ---------------------------------------------------------------------
     1. BRAND
     --------------------------------------------------------------------- */
  brand: {
    name: "BP Enterprises",
    short: "BP",
    tagline: "Packaging Solutions",
    intro: "Corrugated boxes, paper & protective packaging for industry.",
    established: "February 2026",
    formerName: "JMD Enterprises",
    formerSince: "2019",
    logo: "assets/img/bp-logo-192.png",
  },

  /* ---------------------------------------------------------------------
     2. WHATSAPP ORDER / ENQUIRY LINES
     ---------------------------------------------------------------------
     "number" must be the full number with country code, DIGITS ONLY.
     India +91 7417019146  ->  "917417019146"
     Do NOT type +, spaces or dashes here.
     "orders" is the number that receives every enquiry from the website.
     --------------------------------------------------------------------- */
  whatsapp: {
    orders: {
      number: "917417019146",
      label: "Sales & Orders Desk",
      person: "Harsh Chaudhary",
      role: "General Manager",
    },
    quotes: {
      number: "918679670680",
      label: "Business Enquiries",
      person: "Karthik Chaudhary",
      role: "Business Development",
    },
    owner: {
      number: "919410883400",
      label: "Proprietor",
      person: "Tejpal Singh Tangar",
      role: "Owner",
    },
  },

  /* Pre-filled greeting used on every WhatsApp redirect. */
  whatsappGreeting: "Hello BP Enterprises, I found you on your website and I would like a quotation.",

  /* ---------------------------------------------------------------------
     3. PHONE / EMAIL
     --------------------------------------------------------------------- */
  contact: {
    email: "bpenterprises@gmail.com",
        phones: [
      { number: "+91 74170 19146", label: "Sales & Orders (GM)", wa: "917417019146" },
      { number: "+91 86796 70680", label: "Business Development", wa: "918679670680" },
      { number: "+91 94108 83400", label: "Owner", wa: "919410883400" },
    ],
    hours: "Monday – Saturday, 9:00 AM – 7:00 PM",
    hoursNote: "Sunday: enquiry received, reply on Monday",
    responseTime: "Replies within 2 working hours",
  },

  /* Leave gstin empty ("") to hide it completely from the website. */
  gstin: "",
  gstinNote: "",

  /* ---------------------------------------------------------------------
     4. LOCATIONS
     ---------------------------------------------------------------------
     To update the map, replace the "map" link with the Google Maps share
     link of that location.
     --------------------------------------------------------------------- */
  locations: [
    {
      id: "headoffice",
      type: "Head Office",
      name: "Head Office & Works",
      address: "SH 142, Near Kosi Kalan Police Station, Old GT Road, Kosi Kalan, Chhata, Mathura – 281403, Uttar Pradesh",
      city: "Kosi Kalan, Mathura",
      map: "https://www.google.com/maps/search/?api=1&query=Kosi+Kalan+Police+Station+Old+GT+Road+Mathura+281403",
      phone: "+91 74170 19146",
      wa: "917417019146",
      primary: true,
    },
    {
      id: "chhata",
      type: "Office",
      name: "Chhata Office",
      address: "Khasra 143, Opp. Ginny, Ghuhari Industrial Area, Chhata, Mathura – 281401, Uttar Pradesh",
      city: "Chhata, Mathura",
      map: "https://www.google.com/maps/search/?api=1&query=Ghuhari+Industrial+Area+Chhata+Mathura+281401",
      phone: "+91 74170 19146",
      wa: "917417019146",
    },
    {
      id: "godown1",
      type: "Godown",
      name: "Godown 1 — Kosi Kalan",
      address: "Plot B-3, UPSIDC Industrial Area, Kosi Kalan, Mathura – 281403, Uttar Pradesh",
      city: "Kosi Kalan, Mathura",
      storage: "3,000 sq. m. covered storage",
      map: "https://www.google.com/maps/search/?api=1&query=UPSIDC+Industrial+Area+Kosi+Kalan+Mathura+281403",
      phone: "+91 86796 70680",
      wa: "918679670680",
    },
    {
      id: "gurugram-office",
      type: "Office",
      name: "Gurugram Office",
      address: "2304, OM Pareena, Sector 112, Gurugram, Haryana",
      city: "Gurugram, Haryana",
      map: "https://www.google.com/maps/search/?api=1&query=OM+Pareena+Sector+112+Gurugram",
      phone: "+91 94108 83400",
      wa: "919410883400",
    },
    {
      id: "godown2",
      type: "Godown",
      name: "Godown 2 — Gurugram",
      address: "H-45, Masani Road, Near Shitla Mata Mandir, Old Gurugram – 122001, Haryana",
      city: "Gurugram, Haryana",
      storage: "650 sq. m. covered storage",
      map: "https://www.google.com/maps/search/?api=1&query=Masani+Road+Shitla+Mata+Mandir+Old+Gurugram+122001",
      phone: "+91 94108 83400",
      wa: "919410883400",
    },
  ],

  /* ---------------------------------------------------------------------
     5. TEAM
     --------------------------------------------------------------------- */
  team: [
    { name: "Tejpal Singh Tangar", role: "Owner", group: "Leadership" },
    { name: "Damodar Singh",       role: "Owner", group: "Leadership" },
    { name: "Harsh Chaudhary",     role: "General Manager", group: "Office Team" },
    { name: "Karthik Chaudhary",   role: "Business Development Manager", group: "Office Team" },
    { name: "Amit Arora",          role: "Accounts Head", group: "Office Team" },
    { name: "Vandana",             role: "Accounts", group: "Office Team" },
    { name: "Mragender Kumar",     role: "Godown Incharge — Kosi Kalan", group: "Warehouse Team" },
    { name: "Abhay Yadav",         role: "Godown Incharge — Gurugram", group: "Warehouse Team" },
  ],

  teamNote: "Supported by a 14-member warehouse and dispatch team across two godowns.",

  /* ---------------------------------------------------------------------
     6. CLIENTS
     --------------------------------------------------------------------- */
  clients: [
    "Divine Industries",
    "Dheeraj Packaging",
    "Mapoo Inc.",
    "Yana Packaging Solutions",
    "Jain Pizza & Bakery",
    "Eat Club",
    "Samkwang",
    "Next Clothing",
    "Cream Bell",
    "RK Industries",
    "United Packagings",
    "Neeraj Engineering",
  ],

  /* ---------------------------------------------------------------------
     7. COMPANY NUMBERS SHOWN ON THE WEBSITE
     ---------------------------------------------------------------------
     Set to "" to hide an individual figure, or delete the whole "stats"
     list to remove the section. Only keep numbers you can stand behind.
     --------------------------------------------------------------------- */
  stats: [
    { value: "2",      suffix: "",  label: "Manufacturing & storage units" },
    { value: "3,650",  suffix: "",  label: "sq. m. of godown space" },
    { value: "2019",   suffix: "",  label: "Serving industry since" },
    { value: "24",     suffix: "hr", label: "Quotation turnaround" },
  ],

  /* ---------------------------------------------------------------------
     8. PRODUCT PAGE SETTINGS
     --------------------------------------------------------------------- */
  catalogue: {
    /* Set to false to hide every price and show "Price on request" instead.
       Recommended if your rates change often. */
    showPrices: true,

    /* Wording shown next to any price. */
    priceNote: "Indicative rate, ex-godown. Final rate depends on size, ply, GSM & quantity — confirm on WhatsApp.",

    /* Set to false if you do not want MOQ shown on cards. */
    showMoq: true,

    /* Set to false to hide the "Type of box" / spec filters under the search bar. */
    showSpecFilters: true,
  },

  /* ---------------------------------------------------------------------
     9. SEARCH ENGINE / SHARING INFO
     --------------------------------------------------------------------- */
  seo: {
    siteUrl: "https://bpentprises.in",
    title: "BP Enterprises — Corrugated Boxes & Packaging Solutions, Mathura & Gurugram",
    description: "Manufacturer & supplier of 3-ply, 5-ply and 7-ply corrugated boxes, jumbo boxes, mono cartons, kraft paper, duplex board, poly bags, stretch film, bubble wrap, BOPP tape and wooden pallets. Bulk stock, pan-India dispatch from Mathura and Gurugram.",
    keywords: "corrugated box manufacturer Mathura, 5 ply box supplier, kraft paper dealer, duplex board, jumbo box, mono carton, packaging material Kosi Kalan, corrugated box Gurugram, BOPP tape, stretch film, bubble wrap, wooden pallet supplier",
  },

  /* ---------------------------------------------------------------------
     10. FEATURE TOGGLES
     --------------------------------------------------------------------- */
  features: {
    enquiryBasket: true,   // multi-product "add to enquiry" list + WhatsApp send
    floatingWhatsapp: true, // green floating WhatsApp button
    websiteEnquiryForm: true,
  },

  /* ---------------------------------------------------------------------
     11. FILE / BUILD INFO
     --------------------------------------------------------------------- */
  build: {
    version: "1.0.0",
    lastUpdated: "2026-10-06",
  },
};
