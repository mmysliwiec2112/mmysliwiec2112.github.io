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
};

function show(id) {
  session.current = id;
  app.replaceChildren();
  views[id]();
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
  app.append(
    el("h1", { text: "Interakcje i samopoczucie w grach online" }),
    isMobileViewport()
      ? el("p", {
          class: "notice",
          text: "Badanie jest przeznaczone do wykonania na komputerze lub laptopie.",
        })
      : null,
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
    else show("hold");
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

function renderHold() {
  app.append(
    el("h1", { text: "Dalsza część badania" }),
    el("p", {
      text: "Kolejny etap (dane demograficzne) pojawi się w następnej iteracji.",
    })
  );
}

views.hold = renderHold;

show("1a");
