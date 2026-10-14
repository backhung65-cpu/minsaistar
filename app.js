/* MIRACLE SKILLS — 갤러리 동작 (외부 라이브러리 없음) */
(function () {
  "use strict";
  var SITE = window.SITE || {};
  var SKILLS = (window.SKILLS || []).slice();

  /* ── 날짜: 한국 시간 기준 ── */
  function kstNow() { return new Date(Date.now() + 9 * 3600 * 1000); }
  function ym(d) { return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0"); }
  var NOW = kstNow();
  var THIS_MONTH = ym(NOW);
  function monthLabel(m) { return m ? Number(m.slice(5, 7)) + "월" : ""; }
  function lastDay(m) { var y = +m.slice(0, 4), mo = +m.slice(5, 7); return new Date(Date.UTC(y, mo, 0)).getUTCDate(); }
  function daysLeft(m) {
    var y = +m.slice(0, 4), mo = +m.slice(5, 7);
    var end = Date.UTC(y, mo, 1); // 다음 달 1일 0시(KST)
    return Math.max(0, Math.ceil((end - NOW.getTime()) / 86400000));
  }
  function won(n) { return Number(n).toLocaleString("ko-KR") + "원"; }
  function pad3(n) { return String(n).padStart(3, "0"); }

  /* 상태: open(이달 판매 중) · always(상시) · ended(판매 종료) · soon(공개 예정) */
  function status(s) {
    if (s.always) return "always";
    if (!s.month) return "always";
    if (s.month === THIS_MONTH) return "open";
    return s.month < THIS_MONTH ? "ended" : "soon";
  }
  function canBuy(s) { var st = status(s); return st === "open" || st === "always"; }
  function badge(s) {
    var st = status(s), el = document.createElement("span");
    el.className = "badge " + st;
    el.textContent = st === "open" ? monthLabel(s.month) + " 한정 · D-" + daysLeft(s.month)
      : st === "always" ? "판매 중"
      : st === "ended" ? monthLabel(s.month) + " 판매 종료"
      : monthLabel(s.month) + " 공개 예정";
    return el;
  }

  /* ── 사이트 설정 반영 ── */
  document.querySelectorAll("[data-site]").forEach(function (el) {
    var v = SITE[el.getAttribute("data-site")];
    if (!v) return;
    el.innerHTML = "";
    String(v).split("\n").forEach(function (line, i) { if (i) el.appendChild(document.createElement("br")); el.appendChild(document.createTextNode(line)); });
  });
  document.querySelectorAll("[data-price]").forEach(function (el) {
    var v = SITE[el.getAttribute("data-price")]; if (v) el.textContent = Number(v).toLocaleString("ko-KR");
  });
  function setLink(sel, url) {
    document.querySelectorAll(sel).forEach(function (a) {
      if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; } else { a.setAttribute("aria-disabled", "true"); }
    });
  }
  setLink("[data-membership]", SITE.membershipUrl);
  var yearEl = document.getElementById("year"); if (yearEl) yearEl.textContent = NOW.getUTCFullYear();

  /* ── 정렬: 판매 중 → 공개 예정 → 지난 스킬(최신순) ── */
  var rank = { open: 0, always: 1, soon: 2, ended: 3 };
  SKILLS.sort(function (a, b) {
    var ra = rank[status(a)], rb = rank[status(b)];
    if (ra !== rb) return ra - rb;
    return ra === 3 ? b.no - a.no : a.no - b.no;
  });

  /* ── 이달의 스킬 ── */
  var feature = document.getElementById("feature");
  var current = SKILLS.filter(function (s) { return status(s) === "open"; });
  var featured = current[0] || SKILLS.filter(function (s) { return status(s) === "always"; })[0];
  if (featured) {
    var fb = document.createElement("button");
    fb.type = "button";
    fb.setAttribute("aria-label", featured.title + " 설명 보기");
    fb.innerHTML = '<img class="f-img" alt=""><div class="f-body"><div class="f-top"><span class="eyebrow">이달의 스킬</span></div><h3></h3><p class="f-sum"></p><div class="f-price"><b></b><span></span></div></div>';
    fb.querySelector("img").src = featured.image;
    fb.querySelector("img").alt = featured.title;
    fb.querySelector(".f-top").appendChild(badge(featured));
    fb.querySelector("h3").textContent = featured.title;
    fb.querySelector(".f-sum").textContent = featured.summary || "";
    fb.querySelector(".f-price b").textContent = won(featured.price);
    fb.querySelector(".f-price span").textContent = "멤버십 회원 " + won(featured.memberPrice);
    fb.addEventListener("click", function () { openSkill(featured); });
    feature.appendChild(fb);
    if (current.length > 1) {
      var more = document.createElement("a");
      more.href = "#gallery"; more.className = "btn btn-ghost wide"; more.style.borderRadius = "0";
      more.textContent = "이달의 스킬 " + current.length + "개 모두 보기";
      feature.appendChild(more);
    }
    var cs = document.getElementById("closing-sub");
    if (cs && featured.month) cs.textContent = monthLabel(featured.month) + " " + lastDay(featured.month) + "일까지 · 남은 기간 " + daysLeft(featured.month) + "일";
  } else {
    feature.classList.add("placeholder");
    feature.innerHTML = "<div><p class='eyebrow'>이달의 스킬</p><p style='margin-top:10px'>이달의 스킬을 준비하고 있습니다.<br>곧 공개됩니다.</p></div>";
  }

  /* ── 갤러리 ── */
  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  function tile(s) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.className = "tile" + (status(s) === "ended" ? " is-ended" : "");
    b.setAttribute("aria-label", s.title + " 설명 보기");
    b.innerHTML = '<div class="frame"><img loading="lazy" alt=""></div><div class="cap"><p class="no"></p><p class="t"></p><p class="p"></p></div>';
    b.querySelector("img").src = s.image;
    b.querySelector("img").alt = s.title;
    b.querySelector(".frame").appendChild(badge(s));
    b.querySelector(".no").textContent = "SKILL " + pad3(s.no || 0);
    b.querySelector(".t").textContent = s.title;
    b.querySelector(".p").textContent = canBuy(s) ? won(s.price) + " · 회원 " + won(s.memberPrice) : (s.summary || "");
    b.addEventListener("click", function () { openSkill(s); });
    li.appendChild(b);
    li.dataset.status = status(s);
    return li;
  }
  function nextTile() {
    var d = new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth() + 1, 1));
    var li = document.createElement("li");
    li.dataset.status = "soon";
    li.innerHTML = '<div class="tile soon"><div class="frame"><div><p class="eyebrow">NEXT</p><p style="margin-top:8px;font-weight:600">' + (d.getUTCMonth() + 1) + '월 새 스킬 공개</p><p class="muted" style="margin-top:6px">매달 새로운 스킬이 걸립니다</p></div></div></div>';
    return li;
  }
  SKILLS.forEach(function (s) { grid.appendChild(tile(s)); });
  if (!SKILLS.some(function (s) { return status(s) === "soon"; })) grid.insertBefore(nextTile(), grid.children[current.length] || null);

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      document.querySelectorAll(".chip").forEach(function (c) { var on = c === chip; c.classList.toggle("on", on); c.setAttribute("aria-selected", on ? "true" : "false"); });
      var shown = 0;
      Array.prototype.forEach.call(grid.children, function (li) {
        var st = li.dataset.status;
        var ok = f === "all" || (f === "open" && (st === "open" || st === "always")) || (f === "ended" && st === "ended");
        li.hidden = !ok; if (ok) shown++;
      });
      empty.hidden = shown > 0;
    });
  });

  /* 본문: "## 소제목", "- 목록" 줄을 구분해 표시 (HTML은 그대로 글자로 표시) */
  function renderBody(box, text) {
    box.innerHTML = "";
    var list = null, para = [];
    function flushPara() { if (para.length) { var p = document.createElement("p"); p.textContent = para.join("\n"); box.appendChild(p); para = []; } }
    text.split("\n").forEach(function (line) {
      var t = line.trim();
      if (/^#{1,3}\s+/.test(t)) { flushPara(); list = null; var h = document.createElement("h4"); h.textContent = t.replace(/^#{1,3}\s+/, ""); box.appendChild(h); }
      else if (/^[-•·]\s+/.test(t)) { flushPara(); if (!list) { list = document.createElement("ul"); box.appendChild(list); } var li = document.createElement("li"); li.textContent = t.replace(/^[-•·]\s+/, ""); list.appendChild(li); }
      else if (!t) { flushPara(); list = null; }
      else { list = null; para.push(t); }
    });
    flushPara();
  }

  /* 결제 → (결제 완료) → 네이버 카페 */
  function link(cls, text, href) {
    var a = document.createElement("a");
    a.className = cls; a.textContent = text;
    if (href) { a.href = href; a.target = "_blank"; a.rel = "noopener"; }
    else { a.setAttribute("aria-disabled", "true"); }
    return a;
  }
  function renderBuy(s, opened) {
    var st = status(s), buy = document.getElementById("d-buy");
    buy.innerHTML = "";
    var hint = document.createElement("p"); hint.className = "d-hint";
    if (st === "open" || st === "always") {
      if (opened) {
        /* 카페 주소는 사이트에 두지 않습니다. 결제가 완료되면 페이앱이 카페로 보내 줍니다. */
        var done = document.createElement("div"); done.className = "d-done";
        done.innerHTML = "<b>결제창이 열렸습니다</b><span>결제를 완료하면 네이버 카페로 자동 이동해 스킬을 받을 수 있습니다.</span>";
        buy.appendChild(done);
        var back = document.createElement("button");
        back.type = "button"; back.className = "btn btn-ghost wide"; back.textContent = "결제창 다시 열기";
        back.addEventListener("click", function () { renderBuy(s, false); });
        buy.appendChild(back);
        return;
      }
      var pr = document.createElement("div"); pr.className = "d-prices";
      pr.innerHTML = "<b></b><span class='mp'></span><span>한 번 받으면 평생 소장</span>";
      pr.querySelector("b").textContent = won(s.price);
      pr.querySelector(".mp").textContent = "멤버십 회원 " + won(s.memberPrice);
      buy.appendChild(pr);
      var row = document.createElement("div"); row.className = "d-pay";
      var a1 = link("btn", s.pay ? won(s.price) + " 결제하기" : "결제 준비 중", s.pay);
      row.appendChild(a1);
      var a2 = s.memberPay ? link("btn btn-ghost", "회원가 " + won(s.memberPrice) + " 결제", s.memberPay) : null;
      if (a2) row.appendChild(a2);
      buy.appendChild(row);
      [a1, a2].forEach(function (a) { if (a && a.href) a.addEventListener("click", function () { setTimeout(function () { renderBuy(s, true); }, 400); }); });
      hint.textContent = "결제가 완료되면 네이버 카페로 이동합니다" + (st === "open" ? " · " + monthLabel(s.month) + " " + lastDay(s.month) + "일까지 판매" : "");
      buy.appendChild(hint);
    } else if (st === "ended") {
      buy.appendChild(link("btn wide", monthLabel(s.month) + " 판매 종료", ""));
      hint.textContent = "판매가 종료된 스킬입니다. 이달의 새 스킬은 갤러리 맨 앞에 있습니다.";
      buy.appendChild(hint);
    } else {
      buy.appendChild(link("btn wide", monthLabel(s.month) + " 1일 공개 예정", ""));
      hint.textContent = "공개되면 이곳에서 바로 결제할 수 있습니다.";
      buy.appendChild(hint);
    }
  }

  /* ── 설명 창 → 결제 ── */
  var dlg = document.getElementById("detail");
  function openSkill(s) {
    var st = status(s);
    document.getElementById("d-img").src = s.image;
    document.getElementById("d-img").alt = s.title;
    var meta = document.getElementById("d-meta");
    meta.innerHTML = "";
    var no = document.createElement("span"); no.textContent = "SKILL " + pad3(s.no || 0); meta.appendChild(no);
    meta.appendChild(badge(s));
    (s.tags || []).forEach(function (t) { var e = document.createElement("span"); e.textContent = "#" + t; meta.appendChild(e); });
    document.getElementById("d-title").textContent = s.title;
    document.getElementById("d-summary").textContent = s.summary || "";
    renderBody(document.getElementById("d-text"), s.body || "");
    renderBuy(s);

    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    dlg.querySelector(".d-body").scrollTop = 0;
    if (location.hash !== "#skill-" + s.id) history.replaceState(null, "", "#skill-" + encodeURIComponent(s.id));
  }
  document.querySelectorAll("[data-open-featured]").forEach(function (b) {
    b.addEventListener("click", function (e) { if (featured) { e.preventDefault(); openSkill(featured); } });
  });
  function closeSkill() {
    if (dlg.open) dlg.close();
  }
  dlg.addEventListener("close", function () { if (location.hash.indexOf("#skill-") === 0) history.replaceState(null, "", location.pathname + location.search); });
  dlg.querySelector("[data-close]").addEventListener("click", closeSkill);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeSkill(); });

  function fromHash() {
    var h = decodeURIComponent(location.hash || "");
    if (h.indexOf("#skill-") !== 0) return;
    var id = h.slice(7);
    var s = SKILLS.filter(function (x) { return x.id === id; })[0];
    if (s) openSkill(s);
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();
})();
