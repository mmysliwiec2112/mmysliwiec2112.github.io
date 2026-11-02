const app = document.getElementById("app");

const session = {
  current: "1a",
  consent: { study: false, rodo: false },
  screen: {
    age: "",
    polish: "",
    diagnosis: "",
    meds: "",
    therapy: "",
    psychMajor: "",
  },
};

const views = {
  "1a": renderInfo,
  "1b": renderConsent,
  "1c": renderScreening,
  "1d": renderThanks,
  "4a": renderJoin,
  "4b": renderMatch,
  "4c": renderGame,
};

const pendingTimeouts = [];

function show(id) {
  session.viewGen = (session.viewGen || 0) + 1;
  pendingTimeouts.forEach(clearTimeout);
  pendingTimeouts.length = 0;
  session.current = id;
  app.replaceChildren();
  views[id]();
}

function wait(ms) {
  const gen = session.viewGen;
  return new Promise((resolve) => {
    const id = setTimeout(() => resolve(session.viewGen === gen), ms);
    pendingTimeouts.push(id);
  });
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) node.setAttribute(key, "");
    else if (value !== false && value != null) node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(child));
  }
  return node;
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 800px), (pointer: coarse)").matches;
}

function renderInfo() {
  const nodes = [
    el("h1", { text: "Interakcje i samopoczucie w grach online" }),
  ];
  if (isMobileViewport()) {
    nodes.push(
      el("p", {
        class: "notice",
        text: "Badanie jest przeznaczone do wykonania na komputerze lub laptopie.",
      })
    );
  }
  app.append(
    ...nodes,
    el("p", {
      text: "Zapraszam do udziału w badaniu poświęconym interakcjom społecznym podczas gier online oraz samopoczuciu towarzyszącemu tego rodzaju aktywności.",
    }),
    el("p", {
      text: "W trakcie badania zostaniesz połączony/a z innymi uczestnikami, którzy będą wykonywać zadania w tym samym czasie.",
    }),
    el("p", {
      text: "Badanie trwa około 30 minut i obejmuje krótką grę online, zadanie angażujące myślenie oraz zestaw kwestionariuszy.",
    }),
    el("p", {
      text: "Udział w badaniu jest dobrowolny i anonimowy. Możesz zrezygnować z udziału na dowolnym etapie, zamykając okno przeglądarki.",
    }),
    el("p", {
      text: "Warunki udziału: badanie należy przeprowadzić na komputerze lub laptopie, w cichym i spokojnym miejscu, zapewniając sobie czas na jego ukończenie bez przerw.",
    }),
    el("div", { class: "actions" }, [
      el("button", { type: "button", text: "Dalej", onClick: () => show("1b") }),
    ])
  );
}

function renderConsent() {
  const next = el("button", { type: "button", text: "Dalej", disabled: true });

  function sync() {
    next.disabled = !(session.consent.study && session.consent.rodo);
  }

  const study = el("input", {
    type: "checkbox",
    id: "consent-study",
    checked: session.consent.study,
    onChange: (event) => {
      session.consent.study = event.target.checked;
      sync();
    },
  });
  const rodo = el("input", {
    type: "checkbox",
    id: "consent-rodo",
    checked: session.consent.rodo,
    onChange: (event) => {
      session.consent.rodo = event.target.checked;
      sync();
    },
  });

  next.addEventListener("click", () => {
    if (session.consent.study && session.consent.rodo) show("1c");
  });

  app.append(
    el("h1", { text: "Zgoda na udział i informacje o danych" }),
    el("label", { class: "check", for: "consent-study" }, [
      study,
      "Zapoznałem/am się z informacją o badaniu i dobrowolnie wyrażam zgodę na udział.",
    ]),
    el("label", { class: "check", for: "consent-rodo" }, [
      rodo,
      "Wyrażam zgodę na przetwarzanie moich danych w celach naukowych zgodnie z RODO.",
    ]),
    el("div", { class: "legal" }, [
      el("p", { text: "Klauzula informacyjna (art. 13 RODO)" }),
      el("p", {
        text: "Administrator danych: [imię i nazwisko / jednostka] — uzupełnić przed naborem.",
      }),
      el("p", {
        text: "Cel: realizacja badania naukowego dotyczącego interakcji społecznych i samopoczucia podczas gier online.",
      }),
      el("p", {
        text: "Podstawa prawna: art. 6 ust. 1 lit. a RODO (zgoda).",
      }),
      el("p", {
        text: "Okres przechowywania: [okres] — uzupełnić przed naborem. Dane są przetwarzane w postaci uniemożliwiającej bezpośrednią identyfikację, w zakresie niezbędnym do celów naukowych.",
      }),
      el("p", {
        text: "Prawa uczestnika: dostęp do danych, sprostowanie, usunięcie, ograniczenie przetwarzania, przenoszenie danych, cofnięcie zgody w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania przed jej cofnięciem) oraz wniesienie skargi do Prezesa UODO.",
      }),
    ]),
    el("div", { class: "actions" }, [
      el("button", {
        type: "button",
        class: "secondary",
        text: "Wstecz",
        onClick: () => show("1a"),
      }),
      next,
    ])
  );
  sync();
}

const SCREEN_ITEMS = [
  {
    key: "age",
    legend: "Ile masz lat?",
    options: [
      { value: "under18", label: "poniżej 18" },
      { value: "18-35", label: "18–35" },
      { value: "over35", label: "powyżej 35" },
    ],
  },
  {
    key: "polish",
    legend: "Czy język polski jest Twoim językiem ojczystym lub posługujesz się nim biegle?",
    options: [
      { value: "yes", label: "tak" },
      { value: "no", label: "nie" },
    ],
  },
  {
    key: "diagnosis",
    legend:
      "Czy masz aktualnie zdiagnozowane zaburzenie psychiczne (np. depresję, zaburzenia lękowe, PTSD)?",
    options: [
      { value: "yes", label: "tak" },
      { value: "no", label: "nie" },
    ],
  },
  {
    key: "meds",
    legend: "Czy przyjmujesz obecnie leki psychotropowe?",
    options: [
      { value: "yes", label: "tak" },
      { value: "no", label: "nie" },
    ],
  },
  {
    key: "therapy",
    legend: "Czy uczestniczysz obecnie w psychoterapii?",
    options: [
      { value: "yes", label: "tak" },
      { value: "no", label: "nie" },
    ],
  },
  {
    key: "psychMajor",
    legend: "Czy studiujesz lub studiowałeś/aś psychologię?",
    options: [
      { value: "yes", label: "tak" },
      { value: "no", label: "nie" },
    ],
  },
];

function isScreenComplete() {
  return SCREEN_ITEMS.every((item) => Boolean(session.screen[item.key]));
}

function isScreenedOut() {
  const s = session.screen;
  return (
    s.age === "under18" ||
    s.age === "over35" ||
    s.polish === "no" ||
    s.diagnosis === "yes" ||
    s.meds === "yes" ||
    s.therapy === "yes" ||
    s.psychMajor === "yes"
  );
}

function renderScreening() {
  const next = el("button", { type: "button", text: "Dalej", disabled: true });

  function sync() {
    next.disabled = !isScreenComplete();
  }

  const fields = SCREEN_ITEMS.map((item) => {
    const options = item.options.map((option) => {
      const id = `${item.key}-${option.value}`;
      const input = el("input", {
        type: "radio",
        name: item.key,
        id,
        value: option.value,
        checked: session.screen[item.key] === option.value,
        onChange: () => {
          session.screen[item.key] = option.value;
          sync();
        },
      });
      return el("label", { class: "choice", for: id }, [input, option.label]);
    });
    return el("fieldset", {}, [el("legend", { text: item.legend }), ...options]);
  });

  next.addEventListener("click", () => {
    if (!isScreenComplete()) return;
    if (isScreenedOut()) show("1d");
    else show("4a");
  });

  app.append(
    el("h1", { text: "Kilka pytań na początek" }),
    el("p", {
      class: "muted",
      text: "Odpowiedz na wszystkie pytania, a następnie przejdź dalej.",
    }),
    el("div", { class: "stack" }, fields),
    el("div", { class: "actions" }, [
      el("button", {
        type: "button",
        class: "secondary",
        text: "Wstecz",
        onClick: () => show("1b"),
      }),
      next,
    ])
  );
  sync();
}

function renderThanks() {
  app.append(
    el("h1", { text: "Dziękujemy" }),
    el("p", {
      text: "Dziękujemy za zainteresowanie badaniem.",
    })
  );
}

const THROW_COUNT = 30;
const THROWS_TO_SELF = 2;
const BOT_DELAY_MIN = 500;
const BOT_DELAY_MAX = 3000;
const BALL_MS = 450;
const BOT_POOL = ["n0va", "pixel", "sowa", "orbit", "fenix", "krek"];

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickBots() {
  const pool = BOT_POOL.slice();
  const left = pool.splice(randInt(0, pool.length - 1), 1)[0];
  const right = pool.splice(randInt(0, pool.length - 1), 1)[0];
  return { left, right };
}

function ensureMatch() {
  if (!session.nickname) session.nickname = "Ty";
  if (!session.bots) session.bots = pickBots();
}

function playerLabel(seat) {
  if (seat === "self") return session.nickname;
  if (seat === "left") return session.bots.left;
  return session.bots.right;
}

function selfCaption() {
  return session.nickname === "Ty" ? "Ty" : `${session.nickname} (Ty)`;
}

const AVATAR_SVG = {
  left: `<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="#ece7dc"/><path d="M24 32c0-12 8-20 16-20s16 8 16 20v4H24z" fill="#2c241b"/><circle cx="40" cy="36" r="13" fill="#e2b48a"/><rect x="37" y="48" width="6" height="6" rx="2" fill="#e2b48a"/><path d="M18 68c2-12 10-18 22-18s20 6 22 18v4H18z" fill="#0f766e"/></svg>`,
  right: `<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="#ece7dc"/><path d="M22 38c1-16 10-24 18-24s17 8 18 24c4 2 6 10 5 16h-8c0-8-3-12-15-12s-15 4-15 12h-8c-1-6 1-14 5-16z" fill="#6b3f1d"/><circle cx="40" cy="36" r="13" fill="#d9a574"/><rect x="37" y="48" width="6" height="6" rx="2" fill="#d9a574"/><path d="M18 68c2-12 10-18 22-18s20 6 22 18v4H18z" fill="#b45309"/></svg>`,
  self: `<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="#e8eef7"/><path d="M23 34c1-11 8-18 17-18s16 7 17 18v3H23z" fill="#1c1917"/><circle cx="40" cy="37" r="13" fill="#c9956c"/><rect x="37" y="49" width="6" height="6" rx="2" fill="#c9956c"/><path d="M17 68c3-12 11-18 23-18s20 6 23 18v4H17z" fill="#1d4ed8"/></svg>`,
};

function avatarNode(seat, empty) {
  const node = el("div", { class: `avatar avatar-${seat}` });
  if (!empty) node.innerHTML = AVATAR_SVG[seat];
  return node;
}

function renderJoin() {
  ensureMatch();
  app.append(
    el("h1", { text: "Gra w podawanie piłki" }),
    el("p", {
      text: "Za chwilę zagrasz w prostą grę w podawanie piłki z dwiema innymi osobami biorącymi udział w badaniu. Piłkę podajesz, klikając w wybranego gracza.",
    }),
    el("div", { class: "actions" }, [
      el("button", {
        type: "button",
        class: "secondary",
        text: "Wstecz",
        onClick: () => show("1c"),
      }),
      el("button", {
        type: "button",
        text: "Dołącz do gry",
        onClick: () => show("4b"),
      }),
    ])
  );
}

function seatCard(seat, joined) {
  const nick = seat === "self" ? selfCaption() : joined ? playerLabel(seat) : "…";
  const empty = seat !== "self" && !joined;
  return el("div", { class: `seat${empty ? " empty" : ""}` }, [
    avatarNode(seat, empty),
    el("div", { class: "nick", text: nick }),
  ]);
}

async function renderMatch() {
  ensureMatch();
  const status = el("p", { text: "Łączenie z innymi uczestnikami…" });
  const log = el("div", { class: "match-log" });
  const lobby = el("div", { class: "lobby" }, [
    seatCard("left", false),
    seatCard("self", true),
    seatCard("right", false),
  ]);

  app.append(
    el("h1", { text: "Łączenie z graczami" }),
    el("div", { class: "match-status" }, [el("div", { class: "spinner" }), status]),
    log,
    lobby
  );

  if (!(await wait(randInt(8000, 15000)))) return;

  log.append(el("p", { text: "Gracz 1 dołączył" }));
  lobby.replaceWith(
    el("div", { class: "lobby" }, [
      seatCard("left", true),
      seatCard("self", true),
      seatCard("right", false),
    ])
  );
  if (!(await wait(2000))) return;

  log.append(el("p", { text: "Gracz 2 dołączył" }));
  app.querySelector(".lobby").replaceWith(
    el("div", { class: "lobby" }, [
      seatCard("left", true),
      seatCard("self", true),
      seatCard("right", true),
    ])
  );
  if (!(await wait(2000))) return;

  log.append(el("p", { text: "Wszyscy gracze połączeni. Gra rozpocznie się za chwilę." }));
  status.textContent = "Połączono";
  const spin = app.querySelector(".spinner");
  if (spin) spin.remove();
  if (!(await wait(1500))) return;
  show("4c");
}

function renderGame() {
  ensureMatch();
  session.cyberball = {
    throws: [],
    startedAt: Date.now(),
    bots: { ...session.bots },
    nickname: session.nickname,
  };

  const status = el("p", { class: "game-status", text: "" });
  const pitch = el("div", { class: "pitch" });
  const ball = el("div", { class: "ball" });
  const endBox = el("div", { class: "overlay-end" });
  endBox.hidden = true;

  const nodes = {};
  for (const seat of ["left", "right", "self"]) {
    const nick = seat === "self" ? selfCaption() : playerLabel(seat);
    const btn = el(
      "button",
      {
        type: "button",
        class: "player-btn",
        "aria-label": `Podaj do ${playerLabel(seat)}`,
      },
      [
        avatarNode(seat, false),
        el("div", { class: "nick", text: nick }),
      ]
    );
    const wrap = el("div", { class: `player ${seat}`, "data-seat": seat }, [btn]);
    nodes[seat] = wrap;
    btn.addEventListener("click", () => onPlayerClick(seat));
    pitch.append(wrap);
  }
  pitch.append(ball);

  app.append(el("h1", { text: "Gra" }), status, pitch, endBox);

  let holder = "left";
  let throwsDone = 0;
  let toSelfLeft = THROWS_TO_SELF;
  let canThrow = false;
  let receivedAt = 0;
  let busy = false;

  function setBall(seat, animate) {
    const field = pitch.getBoundingClientRect();
    const target = nodes[seat].getBoundingClientRect();
    ball.classList.toggle("animate", Boolean(animate));
    ball.style.left = `${target.left - field.left + target.width / 2}px`;
    ball.style.top = `${target.top - field.top + 18}px`;
  }

  function paint() {
    for (const seat of ["left", "right", "self"]) {
      nodes[seat].classList.toggle("has-ball", seat === holder);
      nodes[seat].classList.toggle(
        "clickable",
        canThrow && seat !== "self" && holder === "self"
      );
    }
    if (endBox.hidden) {
      if (canThrow && holder === "self") {
        status.textContent = "Masz piłkę. Kliknij gracza, aby podać.";
      } else {
        status.textContent = `Piłka u: ${playerLabel(holder)}`;
      }
    }
  }

  function otherBot(seat) {
    return seat === "left" ? "right" : "left";
  }

  async function pass(from, to, rtMs) {
    if (busy) return;
    busy = true;
    canThrow = false;
    paint();
    setBall(to, true);
    const ok = await wait(BALL_MS);
    if (!ok) return;
    const record = {
      n: throwsDone + 1,
      from,
      to,
      at: Date.now(),
    };
    if (typeof rtMs === "number") record.rtMs = rtMs;
    session.cyberball.throws.push(record);
    throwsDone += 1;
    holder = to;
    busy = false;
    if (throwsDone >= THROW_COUNT) {
      finish();
      return;
    }
    if (holder === "self") {
      canThrow = true;
      receivedAt = Date.now();
      paint();
      return;
    }
    paint();
    await botTurn();
  }

  async function botTurn() {
    const delay = randInt(BOT_DELAY_MIN, BOT_DELAY_MAX);
    if (!(await wait(delay))) return;
    if (throwsDone >= THROW_COUNT || session.current !== "4c") return;
    let target;
    if (toSelfLeft > 0) {
      toSelfLeft -= 1;
      target = "self";
    } else {
      target = otherBot(holder);
    }
    await pass(holder, target);
  }

  function onPlayerClick(seat) {
    if (!canThrow || holder !== "self" || seat === "self" || busy) return;
    pass("self", seat, Date.now() - receivedAt);
  }

  function finish() {
    canThrow = false;
    busy = true;
    session.cyberball.endedAt = Date.now();
    paint();
    status.textContent = "";
    endBox.hidden = false;
    endBox.append(el("p", { text: "Gra zakończona." }));
  }

  requestAnimationFrame(() => {
    setBall(holder, false);
    paint();
    botTurn();
  });
}

show("1a");
