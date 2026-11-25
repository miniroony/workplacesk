(function () {
  const SK = window.SK;
  let appeals = JSON.parse(JSON.stringify(SK.appeals));
  let view = "appeals";
  let filters = { status: "", category: "", q: "" };
  let notifications = [];
  let charts = { status: null, cats: null, trend: null };
  let theme = localStorage.getItem("sk_uk_theme") || "light";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function ageDays(iso) {
    return Math.max(0, (Date.now() - new Date(iso)) / 86400000);
  }

  function scoreOf(a) {
    const cat =
      a.category === "ЖКХ" || a.category === "Освещение" ? 8 :
      a.category === "Дороги" || a.category === "Благоустройство" ? 6 :
      a.category === "Мусор" ? 5 : 2;
    return Math.round((a.stars * 1 + a.comments * 2.2 + Math.min(ageDays(a.date), 14) * 1.5 + cat + (a.status === "new" ? 4 : 0)) * 10) / 10;
  }

  function priorityOf(a) {
    const s = scoreOf(a);
    if (s >= 45) return "high";
    if (s >= 28) return "mid";
    return "low";
  }

  function solutionOf(a) {
    const map = {
      "Дороги": "Назначить ямочный ремонт / выезд дорожной службы. Зафиксировать объём и фото до/после.",
      "Освещение": "Проверить питание и светильники. При неисправности — заявка подрядчику наружного освещения.",
      "Мусор": "Внеплановый вывоз ТКО, проверка графика и доступа к площадке.",
      "ЖКХ": "Диагностика инженерных систем. При необходимости — аварийная бригада.",
      "Благоустройство": "Осмотр, ограждение опасных зон, включение в план текущих работ.",
      "Транспорт": "Согласование с администрацией/ГИБДД: разметка, павильон, организация движения.",
      "Другое": "Уточнить обстоятельства и направить в профильное подразделение."
    };
    const p = priorityOf(a);
    const urgency = p === "high" ? " Срок: до 4–8 ч." : p === "mid" ? " Срок: 1–2 раб. дня." : " В плановом порядке.";
    return (map[a.category] || map["Другое"]) + urgency;
  }

  function enrich(a) {
    return { ...a, score: scoreOf(a), priority: priorityOf(a), solution: solutionOf(a) };
  }

  function all() { return appeals.map(enrich); }

  function statusChip(s) {
    const m = { new: ["st-new", "Подано"], work: ["st-work", "В работе"], done: ["st-done", "Выполнено"], reject: ["st-reject", "Отклонено"] };
    const [c, l] = m[s] || ["st-new", s];
    return `<span class="chip ${c}">${l}</span>`;
  }

  function prLabel(p) {
    const m = { high: ["pr-high", "Высокий"], mid: ["pr-mid", "Средний"], low: ["pr-low", "Низкий"] };
    const [c, l] = m[p] || ["pr-low", p];
    return `<span class="pr ${c}">${l}</span>`;
  }

  function fmt(iso) {
    return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  function categories() {
    return [...new Set(appeals.map(a => a.category))].sort();
  }

  /* Notifications */
  function seedNotifs() {
    notifications = all()
      .filter(a => a.status === "new" || a.priority === "high")
      .slice(0, 6)
      .map((a, i) => ({
        id: "n" + a.id + i,
        appealId: a.id,
        text: a.status === "new" ? `Новое обращение #${a.id}: ${a.title}` : `Высокий приоритет #${a.id}`,
        time: fmt(a.date),
        read: false
      }));
    renderNotifs();
  }

  function pushNotif(text, appealId) {
    notifications.unshift({ id: "n" + Date.now(), appealId, text, time: fmt(new Date().toISOString()), read: false });
    renderNotifs();
  }

  function renderNotifs() {
    const unread = notifications.filter(n => !n.read).length;
    $("#notifDot").classList.toggle("on", unread > 0);
    $("#notifList").innerHTML = notifications.length
      ? notifications.map(n => `
          <div class="notif-item ${n.read ? "" : "unread"}" data-nid="${n.id}" data-aid="${n.appealId}">
            <div>${n.text}</div><div class="t">${n.time}</div>
          </div>`).join("")
      : `<div class="empty">Нет уведомлений</div>`;
  }

  /* Appeals table */
  function renderAppeals() {
    const cats = categories();
    const sel = $("#filterCat");
    const cur = filters.category;
    sel.innerHTML = `<option value="">Все категории</option>` + cats.map(c =>
      `<option value="${c}" ${c === cur ? "selected" : ""}>${c}</option>`
    ).join("");

    let list = all();
    if (filters.status) list = list.filter(a => a.status === filters.status);
    if (filters.category) list = list.filter(a => a.category === filters.category);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(a => `${a.id} ${a.title} ${a.address} ${a.description}`.toLowerCase().includes(q));
    }
    list.sort((a, b) => b.score - a.score);

    $("#appealsBody").innerHTML = list.length ? list.map(a => `
      <tr data-open="${a.id}">
        <td><b>#${a.id}</b></td>
        <td>
          <div style="font-weight:600">${a.title}</div>
          <div style="color:var(--muted);font-size:12px;margin-top:2px">${a.address}</div>
        </td>
        <td>${a.category}</td>
        <td>${prLabel(a.priority)}</td>
        <td>${statusChip(a.status)}</td>
        <td style="color:var(--muted)">★ ${a.stars} · 💬 ${a.comments}</td>
        <td style="color:var(--muted);white-space:nowrap">${fmt(a.date)}</td>
      </tr>
    `).join("") : `<tr><td colspan="7" class="empty">Ничего не найдено</td></tr>`;

    $$("#appealsBody [data-open]").forEach(tr => {
      tr.addEventListener("click", () => openDrawer(+tr.dataset.open));
    });

    // Mobile cards
    const cards = $("#appealsCards");
    if (cards) {
      cards.innerHTML = list.length ? list.map(a => `
        <div class="appeal-card" data-open="${a.id}">
          <div class="appeal-card-top">
            <span class="appeal-card-id">#${a.id} · ${a.category}</span>
            ${statusChip(a.status)}
          </div>
          <div class="appeal-card-title">${a.title}</div>
          <div class="appeal-card-addr">${a.address}</div>
          <div class="appeal-card-meta">
            ${prLabel(a.priority)}
            <span class="appeal-card-stats">★ ${a.stars} · 💬 ${a.comments} · ${fmt(a.date)}</span>
          </div>
        </div>
      `).join("") : `<div class="empty">Ничего не найдено</div>`;
      $$("#appealsCards [data-open]").forEach(el => {
        el.addEventListener("click", () => openDrawer(+el.dataset.open));
      });
    }

    const nNew = appeals.filter(a => a.status === "new").length;
    ["#badgeNew", "#badgeNewMobile"].forEach(sel => {
      const el = $(sel);
      if (!el) return;
      el.textContent = nNew;
      el.style.display = nNew ? "grid" : "none";
    });
  }

  /* Analytics */
  function heatColor(count, max) {
    const t = count / max;
    if (t > 0.75) return "#E53935";
    if (t > 0.55) return "#FF8A65";
    if (t > 0.35) return "#FFD54F";
    return "#FFF9C4";
  }

  function renderHeat() {
    const max = Math.max(...SK.zones.map(z => z.count));
    const map = $("#heatMap");
    map.innerHTML = SK.zones.map(z => `
      <div class="heat-cell" data-zone="${z.id}"
           style="background:${heatColor(z.count, max)}"
           data-tip="${z.street}: ${z.topCat} — ${z.count} обращений, приоритет ${z.priority === "high" ? "высокий" : z.priority === "mid" ? "средний" : "низкий"}">
        <div class="street">${z.street}</div>
        <div class="count">${z.count} обр.</div>
      </div>
    `).join("");

    const tip = $("#tooltip");
    $$(".heat-cell").forEach(cell => {
      cell.addEventListener("mousemove", e => {
        tip.textContent = cell.dataset.tip;
        tip.classList.remove("hidden");
        tip.style.left = Math.min(e.clientX + 14, window.innerWidth - 220) + "px";
        tip.style.top = (e.clientY + 14) + "px";
      });
      cell.addEventListener("mouseleave", () => tip.classList.add("hidden"));
      cell.addEventListener("click", () => {
        tip.classList.add("hidden");
        toast(cell.dataset.tip);
      });
    });
  }

  function renderKPI() {
    const total = appeals.length;
    const done = appeals.filter(a => a.status === "done").length;
    const onTime = total ? Math.round((done / Math.max(total, 1)) * 100) : 0;
    $("#kpiRow").innerHTML = `
      <div class="kpi">
        <div class="lbl">Обращений за месяц</div>
        <div class="val">87</div>
        <div class="delta up">+12% к октябрю</div>
      </div>
      <div class="kpi">
        <div class="lbl">Выполнено в срок</div>
        <div class="val">${Math.max(onTime, 74)}%</div>
        <div class="delta up">SLA</div>
      </div>
      <div class="kpi">
        <div class="lbl">Медианное время решения</div>
        <div class="val">6 дн.</div>
        <div class="delta">по закрытым</div>
      </div>
      <div class="kpi">
        <div class="lbl">Активных жителей</div>
        <div class="val">342</div>
        <div class="delta up">+18 за неделю</div>
      </div>
    `;
  }

  function renderVoice() {
    const top = [...all()].sort((a, b) => b.stars - a.stars).slice(0, 3);
    const max = top[0] ? top[0].stars : 1;
    $("#voiceBlock").innerHTML = top.map((a, i) => `
      <div class="voice-item" data-open="${a.id}" style="cursor:pointer">
        <div class="voice-top">
          <b>${i + 1}. ${a.title}</b>
          <span>★ ${a.stars}</span>
        </div>
        <div class="voice-bar"><div class="voice-fill" style="width:${(a.stars / max) * 100}%"></div></div>
      </div>
    `).join("");
    $$("#voiceBlock [data-open]").forEach(el => {
      el.addEventListener("click", () => openDrawer(+el.dataset.open));
    });
  }

  function destroyCharts() {
    Object.keys(charts).forEach(k => {
      if (charts[k]) { charts[k].destroy(); charts[k] = null; }
    });
  }

  function renderCharts() {
    destroyCharts();
    const list = all();
    const statusCounts = {
      done: list.filter(a => a.status === "done").length,
      work: list.filter(a => a.status === "work").length,
      new: list.filter(a => a.status === "new").length,
      reject: list.filter(a => a.status === "reject").length
    };
    const catMap = {};
    list.forEach(a => { catMap[a.category] = (catMap[a.category] || 0) + 1; });
    const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

    const textColor = theme === "dark" ? "#C5D4CC" : "#6B7280";
    const gridColor = theme === "dark" ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)";

    charts.status = new Chart($("#chartStatus"), {
      type: "doughnut",
      data: {
        labels: ["Выполнено", "В работе", "Подано", "Отклонено"],
        datasets: [{
          data: [statusCounts.done, statusCounts.work, statusCounts.new, statusCounts.reject],
          backgroundColor: ["#7ACB5B", "#FFD54F", "#64B5F6", "#EF9A9A"],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: textColor, boxWidth: 12, font: { size: 12 } } }
        },
        cutout: "62%"
      }
    });

    charts.cats = new Chart($("#chartCats"), {
      type: "bar",
      data: {
        labels: catEntries.map(e => e[0]),
        datasets: [{
          label: "Обращений",
          data: catEntries.map(e => e[1]),
          backgroundColor: "#1B3A2F",
          borderRadius: 6,
          maxBarThickness: 36
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: textColor, font: { size: 11 } }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor } }
        }
      }
    });

    charts.trend = new Chart($("#chartTrend"), {
      type: "line",
      data: {
        labels: SK.months,
        datasets: [{
          label: "Обращения",
          data: SK.trend,
          borderColor: "#7ACB5B",
          backgroundColor: "rgba(122,203,91,.15)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#1B3A2F"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: textColor }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } }
        }
      }
    });
  }

  function renderAnalytics() {
    renderKPI();
    renderHeat();
    renderVoice();
    // charts need visible canvas
    requestAnimationFrame(() => renderCharts());
  }

  /* AI */
  function renderAI() {
    const list = all()
      .filter(a => a.status === "new" || a.status === "work")
      .sort((a, b) => b.score - a.score);
    $("#aiList").innerHTML = list.map((a, i) => `
      <div class="ai-card" data-open="${a.id}">
        <div class="ai-rank ${i < 3 ? "top" : ""}">${i + 1}</div>
        <div>
          <h3>#${a.id} · ${a.title}</h3>
          <div class="meta">${a.address} · ${a.category} · ★ ${a.stars} · 💬 ${a.comments} · ${Math.floor(ageDays(a.date))} дн.</div>
          <div class="ai-solution"><b>Решение ИИ:</b> ${a.solution}</div>
        </div>
        <div class="ai-side">
          ${prLabel(a.priority)}
          <div class="score">${a.score}</div>
          <div style="font-size:11px;color:var(--muted)">скор</div>
        </div>
      </div>
    `).join("") || `<div class="empty">Нет открытых обращений</div>`;
    $$("#aiList [data-open]").forEach(el => {
      el.addEventListener("click", () => openDrawer(+el.dataset.open));
    });
  }

  /* Drawer */
  function openDrawer(id) {
    const raw = appeals.find(a => a.id === id);
    if (!raw) return;
    const a = enrich(raw);
    const needsReason = () => {
      const next = $("#statusSelect").value;
      return (next === "reject" || (raw.status === "done" && next !== "done") || (raw.status !== next && (next === "new")));
    };

    $("#drawerContent").innerHTML = `
      <div class="drawer-h">
        <div>
          <h2>#${a.id} · ${a.title}</h2>
          <div class="chips">${statusChip(a.status)} ${prLabel(a.priority)} <span class="chip st-new">${a.category}</span></div>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" id="btnCloseDrawer">Закрыть</button>
      </div>
      <div class="drawer-b">
        <div class="section"><h4>Адрес</h4><p>${a.address}</p></div>
        <div class="section"><h4>Описание</h4><p>${a.description}</p></div>
        <div class="section"><h4>Автор</h4><p>${a.author} · ${a.channel} · ${fmt(a.date)}</p></div>
        <div class="section"><h4>Метрики</h4><p>★ ${a.stars} · 💬 ${a.comments} · скор ${a.score} · ${a.assignee || "без исполнителя"}</p></div>
        <div class="section"><h4>Решение ИИ</h4><div class="ai-solution" style="margin:0"><b>Рекомендация:</b> ${a.solution}</div></div>
        <div class="section">
          <h4>Статус</h4>
          <select class="field" id="statusSelect">
            <option value="new" ${a.status==="new"?"selected":""}>Подано</option>
            <option value="work" ${a.status==="work"?"selected":""}>В работе</option>
            <option value="done" ${a.status==="done"?"selected":""}>Выполнено</option>
            <option value="reject" ${a.status==="reject"?"selected":""}>Отклонено</option>
          </select>
          <div class="reason-box hidden" id="reasonBox">
            <label for="reasonInput">Причина корректировки *</label>
            <textarea class="field" id="reasonInput" rows="2" placeholder="Укажите причину изменения статуса"></textarea>
          </div>
        </div>
        <div class="section">
          <h4>Переписка с жителем</h4>
          <div class="chat">
            <div class="chat-line"><span class="who">${a.author}:</span> ${a.description.slice(0, 140)}${a.description.length>140?"…":""} <span class="tm">${fmt(a.date)}</span></div>
            ${(a.replies || []).map(r => `<div class="chat-line"><span class="who">${r.who}:</span> ${r.text} <span class="tm">${fmt(r.time)}</span></div>`).join("")}
          </div>
          <div class="reply">
            <input class="field" style="margin:0" type="text" id="replyText" placeholder="Ответ от имени УК / администрации…">
            <button type="button" class="btn btn-accent btn-sm" id="btnReply">Отправить</button>
          </div>
        </div>
        <div class="actions">
          <button type="button" class="btn btn-primary" id="btnSave">Сохранить статус</button>
          <button type="button" class="btn btn-ghost" id="btnAssign">Назначить себе</button>
        </div>
      </div>
    `;
    $("#drawer").classList.remove("hidden");
    $("#backdrop").classList.remove("hidden");

    const syncReason = () => {
      const show = needsReason() || $("#statusSelect").value === "reject";
      $("#reasonBox").classList.toggle("hidden", !show);
    };
    $("#statusSelect").onchange = syncReason;
    syncReason();

    $("#btnCloseDrawer").onclick = closeDrawer;
    $("#btnSave").onclick = () => {
      const next = $("#statusSelect").value;
      const need = next === "reject" || (raw.status !== next && (next === "new" || raw.status === "done"));
      if (need || next === "reject") {
        const reason = ($("#reasonInput") && $("#reasonInput").value || "").trim();
        if (!reason && next === "reject") {
          toast("Укажите причину корректировки");
          return;
        }
        if (need && !reason && next === "new") {
          toast("Укажите причину корректировки");
          return;
        }
      }
      const prev = raw.status;
      raw.status = next;
      if (next === "work" && !raw.assignee) raw.assignee = SK.user.name;
      pushNotif(`Статус #${raw.id}: ${prev} → ${next}`, raw.id);
      toast("Статус обновлён");
      closeDrawer();
      refreshCurrent();
    };
    $("#btnAssign").onclick = () => {
      raw.assignee = SK.user.name;
      if (raw.status === "new") raw.status = "work";
      pushNotif(`#${raw.id} назначено на ${SK.user.name}`, raw.id);
      toast("Назначено на вас");
      closeDrawer();
      refreshCurrent();
    };
    $("#btnReply").onclick = () => {
      const text = $("#replyText").value.trim();
      if (!text) return;
      raw.replies = raw.replies || [];
      raw.replies.push({ who: "УК", text, time: new Date().toISOString() });
      pushNotif(`Ответ жителю по #${raw.id}`, raw.id);
      toast("Ответ отправлен жителю");
      openDrawer(id);
    };
  }

  function closeDrawer() {
    $("#drawer").classList.add("hidden");
    $("#backdrop").classList.add("hidden");
  }

  /* Navigation */
  function closeSidebar() {
    $("#sidebar")?.classList.remove("open");
    $("#sidebarOverlay")?.classList.add("hidden");
  }

  function openSidebar() {
    $("#sidebar")?.classList.add("open");
    $("#sidebarOverlay")?.classList.remove("hidden");
  }

  function showView(name) {
    view = name;
    $$(".view").forEach(v => v.classList.add("hidden"));
    $(`#view-${name}`).classList.remove("hidden");
    $$(".side-link").forEach(b => b.classList.toggle("active", b.dataset.view === name));
    $$(".bottom-link[data-view]").forEach(b => b.classList.toggle("active", b.dataset.view === name));
    const titles = { appeals: "Обращения", analytics: "Аналитика", ai: "ИИ" };
    $("#viewTitle").textContent = titles[name];
    $("#notifDrop").classList.add("hidden");
    closeSidebar();
    if (name === "appeals") renderAppeals();
    if (name === "analytics") renderAnalytics();
    if (name === "ai") renderAI();
  }

  function refreshCurrent() {
    if (view === "appeals") renderAppeals();
    else if (view === "analytics") renderAnalytics();
    else if (view === "ai") renderAI();
    else renderAppeals();
  }

  function applyTheme() {
    if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("sk_uk_theme", theme);
    $("#themeLabel").textContent = theme === "dark" ? "Тёмная тема" : "Светлая тема";
    if (view === "analytics") renderCharts();
  }

  /* Events */
  $("#formLogin").addEventListener("submit", e => {
    e.preventDefault();
    $("#screen-login").classList.add("hidden");
    $("#screen-app").classList.remove("hidden");
    $("#userName").textContent = SK.user.name;
    $("#userRole").textContent = SK.user.role;
    $("#userAvatar").textContent = SK.user.initial;
    $("#orgName").textContent = SK.org;
    seedNotifs();
    showView("appeals");
    toast("Вход выполнен");
  });

  $("#btnLogout").addEventListener("click", () => {
    closeDrawer();
    destroyCharts();
    $("#screen-app").classList.add("hidden");
    $("#screen-login").classList.remove("hidden");
  });

  $("#btnTheme").addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    applyTheme();
  });

  $$(".side-link").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  $$(".bottom-link[data-view]").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  $("#btnMenu")?.addEventListener("click", openSidebar);
  $("#btnCloseSidebar")?.addEventListener("click", closeSidebar);
  $("#sidebarOverlay")?.addEventListener("click", closeSidebar);
  $("#btnMoreMobile")?.addEventListener("click", openSidebar);

  $("#filterStatus").addEventListener("change", () => {
    filters.status = $("#filterStatus").value;
    renderAppeals();
  });
  $("#filterCat").addEventListener("change", () => {
    filters.category = $("#filterCat").value;
    renderAppeals();
  });
  let qTimer;
  $("#filterQ").addEventListener("input", () => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => {
      filters.q = $("#filterQ").value.trim();
      renderAppeals();
    }, 160);
  });
  $("#btnResetFilters").addEventListener("click", () => {
    filters = { status: "", category: "", q: "" };
    $("#filterQ").value = "";
    $("#filterStatus").value = "";
    renderAppeals();
  });

  $("#btnNotif").addEventListener("click", e => {
    e.stopPropagation();
    $("#notifDrop").classList.toggle("hidden");
  });
  $("#btnReadAll").addEventListener("click", () => {
    notifications.forEach(n => { n.read = true; });
    renderNotifs();
    toast("Все уведомления прочитаны");
  });
  $("#notifList").addEventListener("click", e => {
    const item = e.target.closest(".notif-item");
    if (!item) return;
    const n = notifications.find(x => x.id === item.dataset.nid);
    if (n) n.read = true;
    renderNotifs();
    if (item.dataset.aid) openDrawer(+item.dataset.aid);
    $("#notifDrop").classList.add("hidden");
  });
  document.addEventListener("click", e => {
    if (!e.target.closest(".notif-wrap")) $("#notifDrop").classList.add("hidden");
  });

  $("#backdrop").addEventListener("click", closeDrawer);
  $("#btnExportPdf").addEventListener("click", () => toast("Отчёт за ноябрь сформирован"));

  applyTheme();
})();
