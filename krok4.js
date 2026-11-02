const THROW_COUNT = 30;
const THROWS_TO_SELF = 2;
const BOT_DELAY_MIN = 500;
const BOT_DELAY_MAX = 3000;
const BALL_MS = 450;
const BOT_POOL = ["Marek", "Ania", "Ola", "Kuba", "Iga", "Tomek"];

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
        text: "Dołącz do gry",
        onClick: () => show("4b"),
      }),
    ])
  );
}

function seatCard(seat, joined) {
  const nick =
    seat === "self" ? session.nickname : joined ? playerLabel(seat) : "…";
  const empty = seat !== "self" && !joined;
  return el("div", { class: `seat${empty ? " empty" : ""}` }, [
    el("div", { class: "avatar", text: empty ? "" : nick.slice(0, 1) }),
    el("div", {
      class: "nick",
      text: seat === "self" ? (nick === "Ty" ? "Ty" : `${nick} (Ty)`) : nick,
    }),
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
  const lobbyFull = el("div", { class: "lobby" }, [
    seatCard("left", true),
    seatCard("self", true),
    seatCard("right", true),
  ]);
  app.querySelector(".lobby").replaceWith(lobbyFull);
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
    const raw = playerLabel(seat);
    const nick = seat === "self" && raw !== "Ty" ? `${raw} (Ty)` : raw;
    const btn = el("button", {
      type: "button",
      class: "player-btn",
      "aria-label": `Podaj do ${playerLabel(seat)}`,
    }, [
      el("div", { class: "avatar", text: playerLabel(seat).slice(0, 1) }),
      el("div", { class: "nick", text: nick }),
    ]);
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
    session.cyberball.throws.push({
      n: throwsDone + 1,
      from,
      to,
      rtMs: rtMs ?? null,
      at: Date.now(),
    });
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
    const target = toSelfLeft > 0 ? (toSelfLeft--, "self") : otherBot(holder);
    await pass(holder, target, null);
  }

  function onPlayerClick(seat) {
    if (!canThrow || holder !== "self" || seat === "self" || busy) return;
    const rt = Date.now() - receivedAt;
    pass("self", seat, rt);
  }

  function finish() {
    canThrow = false;
    busy = true;
    session.cyberball.endedAt = Date.now();
    paint();
    status.textContent = "";
    endBox.hidden = false;
    endBox.append(
      el("p", { text: "Gra zakończona." }),
      el("div", { class: "actions" }, [
        el("button", {
          type: "button",
          text: "Dalej",
          onClick: () => show("hold"),
        }),
      ])
    );
  }

  requestAnimationFrame(() => {
    setBall(holder, false);
    paint();
    botTurn();
  });
}

views["4a"] = renderJoin;
views["4b"] = renderMatch;
views["4c"] = renderGame;
