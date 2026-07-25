/* ==========================================================================
   L.L. CARD GAME - DATABASE CARTE UFFICIALI (28 CARTE UNICHE - MAZZO CONDIVISO)
   ========================================================================== */

const CARDS_DATABASE = [
    // --- BATCH 1 (5) ---
    {
        id: "card_ampolla",
        name: "AMPOLLA",
        element: "Giallo",
        elementColor: "#ffb800",
        attack: 25,
        hp: 25,
        rarity: "Rara",
        bonusText: "+5 VITA CONTRO VERDI",
        bonusType: "VITA_VS_ELEMENT",
        targetElement: "Verde",
        bonusValue: 5,
        lore: "Conservata troppo a lungo nel pollaio, ha iniziato a fare chicchirichì. Nessuno sa se sia un pollo dentro un'ampolla o un'ampolla che si crede un pollo.",
        image: "assets/cards/ampolla.jpg"
    },
    {
        id: "card_aranchina",
        name: "AranChina",
        element: "Verde",
        elementColor: "#2ed573",
        attack: 10,
        hp: 50,
        rarity: "Epica",
        bonusText: "+5 ATT CONTRO BLU",
        bonusType: "ATT_VS_ELEMENT",
        targetElement: "Blu",
        bonusValue: 5,
        lore: "Venuta da lontano, ha un solo obiettivo: conquistare il palato e il mondo. Bastoncini in mano e occhi a mandorla, non sottovalutare questa sfera di riso!",
        image: "assets/cards/aranchina.jpg"
    },
    {
        id: "card_bananas",
        name: "BANANAS",
        element: "Verde",
        elementColor: "#2ed573",
        attack: 15,
        hp: 20,
        rarity: "Leggendaria",
        bonusText: "+30 ATT CONTRO BLU",
        bonusType: "ATT_VS_ELEMENT",
        targetElement: "Blu",
        bonusValue: 30,
        lore: "Un'insolita fusione tropicale nata per sbaglio ma cresciuta con orgoglio. Dolce, allegro e leggermente fuori di testa, ma quando vede blu... entra in modalità frullato devastante!",
        image: "assets/cards/bananas.jpg"
    },
    {
        id: "card_bananna",
        name: "BANANNA",
        element: "Bianco",
        elementColor: "#ffffff",
        attack: 20,
        hp: 20,
        rarity: "Rara",
        bonusText: "+10 ATT CONTRO TUTTI SE È GIÀ PRESENTE UN BLU IN CAMPO",
        bonusType: "ATT_IF_ELEMENT_ON_BOARD",
        targetElement: "Blu",
        bonusValue: 10,
        lore: "Dorme dappertutto. Dorme sempre. Dorme anche per vincere. Se lo svegli... forse non ricorda nemmeno di avere combattuto.",
        image: "assets/cards/bananna.jpg"
    },
    {
        id: "card_ca_micia",
        name: "CA-MICIA",
        element: "Verde",
        elementColor: "#2ed573",
        attack: 20,
        hp: 20,
        rarity: "Epica",
        bonusText: "+20 VITA CONTRO BLU",
        bonusType: "VITA_VS_ELEMENT",
        targetElement: "Blu",
        bonusValue: 20,
        lore: "Non è chiaro se sia una camicia che vuole essere un gatto o un gatto che ha capito che l'eleganza è tutto. In ogni caso, ha stile da vendere e graffi da lasciare.",
        image: "assets/cards/ca_micia.jpg"
    },

    // --- BATCH 2 (5) ---
    {
        id: "card_caneriere",
        name: "CANERIERE",
        element: "Blu",
        elementColor: "#00b0ff",
        attack: 5,
        hp: 50,
        rarity: "Rara",
        bonusText: "+15 ATT CONTRO GIALLI",
        bonusType: "ATT_VS_ELEMENT",
        targetElement: "Giallo",
        bonusValue: 15,
        lore: "Elegante, raffinato e sempre col ciuffo in ordine. Serve con classe e un sorriso a 32 denti. Ma appena vede giallo, lascia il vassoio e passa al servizio militare.",
        image: "assets/cards/caneriere.jpg"
    },
    {
        id: "card_can_guru",
        name: "CAN-GURU",
        element: "Giallo",
        elementColor: "#ffb800",
        attack: 20,
        hp: 20,
        rarity: "Epica",
        bonusText: "+5 VITA CONTRO VERDI",
        bonusType: "VITA_VS_ELEMENT",
        targetElement: "Verde",
        bonusValue: 5,
        lore: "Maestro del salto e del silenzio. Non combatte per primo, ma quando lo fa... è già troppo tardi. La via del canguro è la via dell'equilibrio.",
        image: "assets/cards/can_guru.jpg"
    },
    {
        id: "card_ciclo_pe",
        name: "CICLO-PE",
        element: "Giallo",
        elementColor: "#ffb800",
        attack: 30,
        hp: 15,
        rarity: "Leggendaria",
        bonusText: "+10 ATT CONTRO VERDI",
        bonusType: "ATT_VS_ELEMENT",
        targetElement: "Verde",
        bonusValue: 10,
        lore: "Veloce come un raggio, ostinato come una salita al 20%. Non ha bisogno di due occhi, perché guarda sempre solo avanti.",
        image: "assets/cards/ciclo_pe.jpg"
    },
    {
        id: "card_cuocodrillo",
        name: "CuocoDrillo",
        element: "Bianco",
        elementColor: "#ffffff",
        attack: 15,
        hp: 40,
        rarity: "Epica",
        bonusText: "+5 VITA CONTRO TUTTI",
        bonusType: "VITA_VS_ALL",
        targetElement: "Tutti",
        bonusValue: 5,
        lore: "In cucina è un artista, sul campo è una roccia. Prepara piatti deliziosi e difende gli alleati con gusto e forza!",
        image: "assets/cards/cuocodrillo.jpg"
    },
    {
        id: "card_formaggio",
        name: "ForMAGGIO",
        element: "Bianco",
        elementColor: "#ffffff",
        attack: 10,
        hp: 20,
        rarity: "Comune",
        bonusText: "+10 ATT CONTRO TUTTI SE BLU GIÀ IN CAMPO",
        bonusType: "ATT_IF_ELEMENT_ON_BOARD",
        targetElement: "Blu",
        bonusValue: 10,
        lore: "Un formaggio con un'ossessione per il tempo. Non scade mai... o almeno così dice il suo calendario personale, che segna sempre Maggio!",
        image: "assets/cards/formaggio.jpg"
    },

    // --- BATCH 3 (5) ---
    {
        id: "card_gorlilla",
        name: "GORLILLA",
        element: "Giallo",
        elementColor: "#ffb800",
        attack: 15,
        hp: 20,
        rarity: "Rara",
        bonusText: "+20 VITA CONTRO VERDE",
        bonusType: "VITA_VS_ELEMENT",
        targetElement: "Verde",
        bonusValue: 20,
        lore: "Massiccio, misterioso, ma soprattutto... lilla. Nessuno sa come sia nato così, ma è il più calmo e resistente della giungla.",
        image: "assets/cards/gorlilla.jpg"
    },
    {
        id: "card_classifigatto",
        name: "IL PRIMO CLASSIFIGATTO",
        element: "Blu",
        elementColor: "#00b0ff",
        attack: 10,
        hp: 30,
        rarity: "Rara",
        bonusText: "+5 ATT CONTRO GIALLO",
        bonusType: "ATT_VS_ELEMENT",
        targetElement: "Giallo",
        bonusValue: 5,
        lore: "Sempre primo, sempre miao! Ha vinto la medaglia d'oro per il pisolino più lungo della storia.",
        image: "assets/cards/classifigatto.jpg"
    },
    {
        id: "card_kebarb",
        name: "KEBARB",
        element: "Verde",
        elementColor: "#2ed573",
        attack: 15,
        hp: 20,
        rarity: "Epica",
        bonusText: "+20 VITA CONTRO BLU",
        bonusType: "VITA_VS_ELEMENT",
        targetElement: "Blu",
        bonusValue: 20,
        lore: "Da lontane spezierie è giunto un guerriero del gusto. La sua barba è più folta del suo ripieno!",
        image: "assets/cards/kebarb.jpg"
    },
    {
        id: "card_labello",
        name: "LA-BELLO",
        element: "Blu",
        elementColor: "#00b0ff",
        attack: 30,
        hp: 10,
        rarity: "Rara",
        bonusText: "+10 ATT VS GIALLO",
        bonusType: "ATT_VS_ELEMENT",
        targetElement: "Giallo",
        bonusValue: 10,
        lore: "Non è solo un burro di cacao, è un fenomeno. Le labbra si sciolgono, i cuori battoni più forte!",
        image: "assets/cards/labello.jpg"
    },
    {
        id: "card_lavattrice",
        name: "LAVATTRICE",
        element: "Giallo",
        elementColor: "#ffb800",
        attack: 15,
        hp: 30,
        rarity: "Epica",
        bonusText: "+10 VITA CONTRO VERDE",
        bonusType: "VITA_VS_ELEMENT",
        targetElement: "Verde",
        bonusValue: 10,
        lore: "Non è solo una lavatrice, è un'istituzione. Cicli perfetti, profumo imbattibile, macchie? Mai sentite!",
        image: "assets/cards/lavattrice.jpg"
    },

    // --- BATCH 4 (5) ---
    {
        id: "card_mc_canico",
        name: "MC CANICO",
        element: "Verde",
        elementColor: "#2ed573",
        attack: 15,
        hp: 30,
        rarity: "Rara",
        bonusText: "+5 ATT CONTRO BLU",
        bonusType: "ATT_VS_ELEMENT",
        targetElement: "Blu",
        bonusValue: 5,
        lore: "Non è solo un panino, è un ingegnere del sapore e della velocità! Con il suo giravite bacchetta e la sua super-carburazione magica!",
        image: "assets/cards/mc_canico.jpg"
    },
    {
        id: "card_maestro_marco",
        name: "MAESTRO M'ARCO",
        element: "Blu",
        elementColor: "#00b0ff",
        attack: 40,
        hp: 15,
        rarity: "Leggendaria",
        bonusText: "+10 ATT CONTRO GIALLO",
        bonusType: "ATT_VS_ELEMENT",
        targetElement: "Giallo",
        bonusValue: 10,
        lore: "Il leggendario arciere che non manca mai il bersaglio... a patto che il bersaglio sia grande quanto una montagna!",
        image: "assets/cards/maestro_marco.jpg"
    },
    {
        id: "card_occhi_ali",
        name: "OCCHI-ALI",
        element: "Bianco",
        elementColor: "#ffffff",
        attack: 10,
        hp: 20,
        rarity: "Comune",
        bonusText: "+5 VITA CONTRO TUTTI",
        bonusType: "VITA_VS_ALL",
        targetElement: "Tutti",
        bonusValue: 5,
        lore: "Occhiali speciali donati dal cielo. Con le sue ali, plana leggero e osserva ogni cosa. La chiarezza è il suo potere.",
        image: "assets/cards/occhi_ali.jpg"
    },
    {
        id: "card_pan_demonio",
        name: "PAN DEMONIO",
        element: "Bianco",
        elementColor: "#ffffff",
        attack: 25,
        hp: 30,
        rarity: "Leggendaria",
        bonusText: "+10 ATT CONTRO TUTTI",
        bonusType: "ATT_VS_ALL",
        targetElement: "Tutti",
        bonusValue: 10,
        lore: "Nato da un impasto mal riuscito e da intenzioni ancora peggiori. Non è solo cattivo, è bruschettatamente malvagio!",
        image: "assets/cards/pan_demonio.jpg"
    },
    {
        id: "card_pand_doro",
        name: "PAND-D'ORO",
        element: "Blu",
        elementColor: "#00b0ff",
        attack: 25,
        hp: 25,
        rarity: "Epica",
        bonusText: "+10 ATT CONTRO GIALLO",
        bonusType: "ATT_VS_ELEMENT",
        targetElement: "Giallo",
        bonusValue: 10,
        lore: "Nato da una rara fusione tra un panda e l'oro più puro del mondo. Pand'oro colpisce duro contro i gialli!",
        image: "assets/cards/pand_doro.jpg"
    },

    // --- BATCH 5 (5) ---
    {
        id: "card_pa_pera",
        name: "PA-PERA",
        element: "Giallo",
        elementColor: "#ffb800",
        attack: 15,
        hp: 55,
        rarity: "Epica",
        bonusText: "+5 ATT CONTRO VERDE",
        bonusType: "ATT_VS_ELEMENT",
        targetElement: "Verde",
        bonusValue: 5,
        lore: "Non è solo una papera. È anche una pera. Un frutto? Un uccello? Un mistero naturale! Con il suo corpo resistente e la sua determinazione!",
        image: "assets/cards/pa_pera.jpg"
    },
    {
        id: "card_pergamena",
        name: "PERGAMENA",
        element: "Giallo",
        elementColor: "#ffb800",
        attack: 20,
        hp: 15,
        rarity: "Rara",
        bonusText: "+10 ATT CONTRO VERDE",
        bonusType: "ATT_VS_ELEMENT",
        targetElement: "Verde",
        bonusValue: 10,
        lore: "Arrotolata, mai piegata. Ha studiato ogni tecnica, ogni stile, ogni scuola. Una maestra antica... che sa ancora come picchiare.",
        image: "assets/cards/pergamena.jpg"
    },
    {
        id: "card_popcorni",
        name: "PopCorni",
        element: "Verde",
        elementColor: "#2ed573",
        attack: 20,
        hp: 20,
        rarity: "Epica",
        bonusText: "+20 VITA CONTRO BLU",
        bonusType: "VITA_VS_ELEMENT",
        targetElement: "Blu",
        bonusValue: 20,
        lore: "Un sacchetto di popcorn che ha preso la visione del film un po' troppo seriamente. È così salato che le corna gli sono cresciute per la rabbia!",
        image: "assets/cards/popcorni.jpg"
    },
    {
        id: "card_porco_spino",
        name: "PORCO SPINO",
        element: "Bianco",
        elementColor: "#ffffff",
        attack: 10,
        hp: 50,
        rarity: "Rara",
        bonusText: "+10 VITA SE HAI UNA CARTA VERDE",
        bonusType: "VITA_IF_ELEMENT_ON_BOARD",
        targetElement: "Verde",
        bonusValue: 10,
        lore: "È un maiale? È un istrice? No, è solo un errore della natura che non riceve un abbraccio dal 1994.",
        image: "assets/cards/porco_spino.jpg"
    },
    {
        id: "card_scarpa",
        name: "Scarpa",
        element: "Blu",
        elementColor: "#00b0ff",
        attack: 5,
        hp: 30,
        rarity: "Rara",
        bonusText: "+20 ATT CONTRO GIALLO",
        bonusType: "ATT_VS_ELEMENT",
        targetElement: "Giallo",
        bonusValue: 20,
        lore: "Nata tra le onde e le vetrine dei negozi di lusso, Scarpa è l'unica carpa che non scivola mai. Calza a pennello!",
        image: "assets/cards/scarpa.jpg"
    },

    // --- BATCH 6 (3) ---
    {
        id: "card_serpente",
        name: "SERPENTE",
        element: "Bianco",
        elementColor: "#ffffff",
        attack: 20,
        hp: 20,
        rarity: "Rara",
        bonusText: "+10 ATT CONTRO TUTTI SE BLU GIÀ IN CAMPO",
        bonusType: "ATT_IF_ELEMENT_ON_BOARD",
        targetElement: "Blu",
        bonusValue: 10,
        lore: "Discendente di una stirpe reale, non striscia mai senza il suo tè delle cinque. Se lo disturbi, ti colpirà con estrema... eleganza.",
        image: "assets/cards/serpente.jpg"
    },
    {
        id: "card_uovo_in_camicia",
        name: "UovoInCamicia",
        element: "Verde",
        elementColor: "#2ed573",
        attack: 40,
        hp: 10,
        rarity: "Leggendaria",
        bonusText: "+10 VITA CONTRO BLU",
        bonusType: "VITA_VS_ELEMENT",
        targetElement: "Blu",
        bonusValue: 10,
        lore: "Ha preso la ricetta troppo alla lettera. Ora è l'uovo più elegante del pollaio, ma guai a sgualcigli il colletto!",
        image: "assets/cards/uovo_in_camicia.jpg"
    },
    {
        id: "card_vacca_da_bagno",
        name: "VaccaDaBagno",
        element: "Blu",
        elementColor: "#00b0ff",
        attack: 5,
        hp: 50,
        rarity: "Epica",
        bonusText: "+10 ATT CONTRO GIALLO",
        bonusType: "ATT_VS_ELEMENT",
        targetElement: "Giallo",
        bonusValue: 10,
        lore: "Non è una mucca qualunque, è una vera SPA itinerante. Produce latte scremato... e molto profumato!",
        image: "assets/cards/vacca_da_bagno.jpg"
    }
];

function getCardCopy(cardId) {
    const original = CARDS_DATABASE.find(c => c.id === cardId);
    if (!original) return null;
    const card = JSON.parse(JSON.stringify(original));
    card.instanceId = 'card_' + Math.random().toString(36).substring(2, 9);
    card.currentHp = card.hp;
    card.currentBonusAtk = 0;
    card.currentBonusHp = 0;
    card.canAttack = false;
    return card;
}

// Genera un UNICO mazzo di 28 carte uniche condiviso tra i due giocatori
function generateSharedDeck() {
    const deck = [];

    // Inserisci 1 copia esatta di ognuna delle 28 carte reali
    CARDS_DATABASE.forEach(card => {
        deck.push(getCardCopy(card.id));
    });

    // Mescola il mazzo condiviso (Fisher-Yates Shuffle)
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}
