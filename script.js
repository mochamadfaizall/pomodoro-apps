(function () {
        var $ = function (i) {
          return document.getElementById(i);
        };
        var S = {
          m: 25,
          k: null,
          mode: "focus",
          total: 0,
          left: 0,
          end: 0,
          run: false,
          t: null,
          done: 0,
        };
        var C = {
          sherlock: [
            "Clawd Detektif",
            "park",
            "Elementary! Kita selidiki materi ini sampai tuntas.",
          ],
          kopi: [
            "Clawd Kopi",
            "sky",
            "Seduh kopi, buka laptop, pelan tapi pasti.",
          ],
          pop: ["Pop Cat", "scene", "Pop! Satu sesi lagi, kamu pasti bisa."],
          finn: ["Finn", "mountain", "Ayo petualangan belajar, kawan!"],
          pisang: ["Kucing Pisang", "scene", "Santai tapi tetap fokus ya."],
          spidey: ["Spidey Mungil", "sky", "Jaring fokus sudah terpasang."],
          ayun: [
            "Spidey Ayun",
            "mountain",
            "Ayun lewat soal-soal sulit bareng aku.",
          ],
        };
        var BGN = {
          scene: "Hutan Jamur",
          sky: "Langit Cerah",
          park: "Taman",
          mountain: "Pegunungan",
        };
        var MF = [
          "Fokus dulu ya!",
          "Bagus, terus begitu!",
          "Setengah jalan, semangat!",
          "Dikit lagi, kamu keren!",
        ];
        var MB = [
          "Regangkan badan, yuk.",
          "Minum air dulu ya.",
          "Tarik napas pelan.",
          "Siap lanjut sebentar lagi!",
        ];
        var imgs = {},
          WIZ = $("main-img").src;
        var selectedTrack = "rain";
        var musicContext = null;
        var musicNodes = [];
        var musicInterval = null;
        var musicPlaying = false;
        var musicMaster = null;
        var P = null;

        function dateKey(date) {
          var d = date || new Date();
          return d.getFullYear() + "-" +
            String(d.getMonth() + 1).padStart(2, "0") + "-" +
            String(d.getDate()).padStart(2, "0");
        }
        function loadProgress() {
          try {
            P = JSON.parse(localStorage.getItem("pixelPomodoroProgress")) || {};
          } catch (e) {
            P = {};
          }
          P.history = P.history || {};
          P.settings = P.settings || {};
          P.settings.target = P.settings.target || 4;
          P.settings.auto = P.settings.auto || false;
          P.settings.vibrate = P.settings.vibrate !== false;
          P.settings.volume = P.settings.volume || 55;
          P.settings.task = P.settings.task || "";
          P.settings.focus = P.settings.focus || 25;
          P.settings.break = P.settings.break || 5;
          P.settings.theme = P.settings.theme || "pink";
          P.settings.alarm = P.settings.alarm || "pixel";
          P.settings.mood = P.settings.mood || "";
          P.checklist = P.checklist || [];
          P.moods = P.moods || {};
          P.xp = P.xp || 0;
          P.questClaimed = P.questClaimed || {};
          P.secrets = P.secrets || {};
          P.totalMinutes = P.totalMinutes || 0;
          P.totalSessions = P.totalSessions || 0;
          S.done = P.history[dateKey()] || 0;
          selectedTrack = P.settings.track || "rain";
        }
        function saveProgress() {
          P.settings.task = $("task-input") ? $("task-input").value.trim() : P.settings.task;
          P.settings.target = $("target-input") ? Math.max(1, Math.min(12, +$("target-input").value || 4)) : P.settings.target;
          P.settings.track = selectedTrack;
          localStorage.setItem("pixelPomodoroProgress", JSON.stringify(P));
        }
        function calculateStreak() {
          var streak = 0;
          var d = new Date();
          while (P.history[dateKey(d)] > 0) {
            streak++;
            d.setDate(d.getDate() - 1);
          }
          if (streak === 0) {
            d = new Date();
            d.setDate(d.getDate() - 1);
            while (P.history[dateKey(d)] > 0) {
              streak++;
              d.setDate(d.getDate() - 1);
            }
          }
          return streak;
        }
        Array.prototype.forEach.call(
          document.querySelectorAll(".pick"),
          function (b) {
            imgs[b.dataset.k] = b.querySelector("img").src;
          },
        );
        var LINE =
            "Halo, penjelajah! Aku Newt. Bareng Clawd si detektif, kita tuntaskan misi belajarmu satu pomodoro demi satu pomodoro.",
          tw;
        function typeIt() {
          clearInterval(tw);
          var el = $("say"),
            i = 0;
          if (matchMedia("(prefers-reduced-motion:reduce)").matches) {
            el.textContent = LINE;
            return;
          }
          el.textContent = "";
          tw = setInterval(function () {
            el.textContent = LINE.slice(0, ++i);
            if (i >= LINE.length) clearInterval(tw);
          }, 35);
        }
        var BGV = {
          scene: "--bg-scene",
          sky: "--bg-sky",
          park: "--bg-park",
          mountain: "--bg-mt",
        };
        function bg(n) {
          var b = document.body;
          if ((b.dataset.bgt || b.dataset.bg || "scene") === n) return;
          b.dataset.bgt = n;
          if (matchMedia("(prefers-reduced-motion:reduce)").matches) {
            b.dataset.bg = n;
            return;
          }
          var l = document.createElement("div");
          l.className = "bgl";
          l.style.backgroundImage = "var(" + BGV[n] + ")";
          b.insertBefore(l, b.firstChild);
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              l.style.opacity = 1;
            });
          });
          setTimeout(function () {
            b.dataset.bg = n;
            l.remove();
          }, 650);
        }
        function swap(el) {
          el.classList.remove("swap");
          void el.offsetWidth;
          el.classList.add("swap");
        }
        function hud() {
          $("lv").textContent = 1 + Math.floor(S.done / 4);
          var target = P ? P.settings.target : 4;
          var progress = target ? Math.min(100, (S.done / target) * 100) : 0;
          $("xpf").style.width = progress + "%";
          var s = $("stars");
          if (s.textContent != S.done) {
            s.textContent = S.done;
            var w = s.parentNode;
            w.classList.remove("bump");
            void w.offsetWidth;
            w.classList.add("bump");
          }
        }
        function renderProgress() {
          var today = P.history[dateKey()] || 0;
          var streak = calculateStreak();
          if ($("today-count")) $("today-count").textContent = today;
          if ($("streak-count")) $("streak-count").textContent = streak;
          if ($("level-preview")) $("level-preview").textContent = "LV" + (1 + Math.floor(S.done / 4));
          if ($("daily-progress")) $("daily-progress").style.width = Math.min(100, (today / (P.settings.target || 4)) * 100) + "%";
          if ($("daily-challenge")) {
            $("daily-challenge").textContent = today >= (P.settings.target || 4)
              ? "Misi selesai — luar biasa!"
              : "Selesaikan " + (P.settings.target || 4) + " sesi fokus";
          }

          if ($("week-bars")) {
            var html = "";
            for (var i = 6; i >= 0; i--) {
              var d = new Date();
              d.setDate(d.getDate() - i);
              var value = P.history[dateKey(d)] || 0;
              var height = Math.min(100, 8 + value * 14);
              var label = d.toLocaleDateString("id-ID", { weekday: "narrow" });
              html += '<div class="week-day"><div class="week-bar" style="height:' + height + '%"></div><span>' +
                label + "</span></div>";
            }
            $("week-bars").innerHTML = html;
          }

          var achievements = [
            ["Pertama", 1, "Selesaikan 1 sesi"],
            ["Rajin", 10, "Selesaikan 10 sesi"],
            ["Pemburu", 50, "Selesaikan 50 sesi"],
            ["Legenda", 100, "Selesaikan 100 sesi"],
          ];
          if ($("achievement-list")) {
            var ach = "";
            achievements.forEach(function (item) {
              var unlocked = P.totalSessions >= item[1];
              ach += '<div class="achievement ' + (unlocked ? "" : "locked") +
                '"><b>' + (unlocked ? "★ " : "🔒 ") + item[0] + "</b><br>" +
                item[2] + "</div>";
            });
            $("achievement-list").innerHTML = ach;
          }
          renderEvolution();
          renderQuests();
          renderSecrets();
        }
        function notifyUser(title, body) {
          if (P.settings.notify !== true || !("Notification" in window)) return;
          if (Notification.permission === "granted") {
            new Notification(title, { body: body });
          }
        }
        function showReward(title, text) {
          if (!$("reward-toast")) return;
          $("reward-title").textContent = title;
          $("reward-text").textContent = text;
          $("reward-toast").classList.add("on");
          clearTimeout(showReward.timer);
          showReward.timer = setTimeout(function () {
            $("reward-toast").classList.remove("on");
          }, 3200);
        }
        function unlockSecret(id, title, text) {
          if (P.secrets[id]) return;
          P.secrets[id] = true;
          saveProgress();
          showReward("Pencapaian tersembunyi!", title + " — " + text);
        }
        function renderEvolution() {
          var stages = [
            [0, "Newt Tingkat 1", "images/newt.png"],
            [5, "Newt Tingkat 2", "images/clawd.png"],
            [15, "Newt Tingkat 3", "images/wizard.png"],
            [30, "Newt Legenda", "images/pop-cat.jpg"],
          ];
          var level = 0;
          for (var i = 0; i < stages.length; i++) {
            if (P.totalSessions >= stages[i][0]) level = i;
          }
          var current = stages[level];
          var next = stages[level + 1];
          var progress = next
            ? Math.max(0, Math.min(100, ((P.totalSessions - current[0]) / (next[0] - current[0])) * 100))
            : 100;
          if ($("evolution-name")) $("evolution-name").textContent = current[1];
          if ($("evolution-progress")) {
            $("evolution-progress").textContent = next
              ? P.totalSessions + " / " + next[0] + " sesi evolusi"
              : "Evolusi maksimum tercapai";
          }
          if ($("evolution-xp")) $("evolution-xp").style.width = progress + "%";
          if ($("evolution-img")) $("evolution-img").src = next ? current[2] : stages[stages.length - 1][2];
        }
        function renderQuests() {
          var today = P.history[dateKey()] || 0;
          var doneChecklist = P.checklist.filter(function (item) { return item.done; }).length;
          var quests = [
            { icon: "★", text: "Selesaikan 1 sesi fokus", done: today >= 1 },
            { icon: "✓", text: "Selesaikan 2 langkah task", done: doneChecklist >= 2 },
            { icon: "♣", text: "Capai target harian", done: today >= (P.settings.target || 4) },
          ];
          if ($("quest-list")) {
            $("quest-list").innerHTML = quests.map(function (quest) {
              return '<div class="quest-item ' + (quest.done ? "done" : "") +
                '"><i>' + quest.icon + '</i><span>' + quest.text + "</span></div>";
            }).join("");
          }
          var incomplete = quests.filter(function (quest) { return !quest.done; });
          if ($("quest-float-text")) {
            $("quest-float-text").textContent = incomplete.length
              ? incomplete[0].text
              : "Semua quest selesai!";
          }
          if (!incomplete.length && !P.questClaimed[dateKey()]) {
            P.questClaimed[dateKey()] = true;
            P.xp += 120;
            saveProgress();
            showReward("Quest harian selesai!", "+120 XP masuk ke evolusi.");
          }
        }
        function renderSecrets() {
          var secrets = [
            ["morning", "Burung Pagi", "Selesai sesi sebelum jam 08.00", P.secrets.morning],
            ["night", "Burung Hantu", "Selesai sesi setelah jam 23.00", P.secrets.night],
            ["streak", "Streak 3", "Fokus aktif 3 hari berturut-turut", P.secrets.streak],
            ["task", "Task Master", "Tuntaskan 5 langkah task", P.secrets.task],
          ];
          if (!$("secret-list")) return;
          $("secret-list").innerHTML = secrets.map(function (item) {
            return '<div class="secret-item ' + (item[3] ? "" : "locked") + '">' +
              '<b>' + (item[3] ? "★ " : "?? ") + item[1] + '</b><br><span>' +
              (item[3] ? item[2] : "Belum terungkap") + "</span></div>";
          }).join("");
        }
        function renderChecklist() {
          if (!$("checklist")) return;
          $("checklist").innerHTML = P.checklist.map(function (item, index) {
            return '<div class="check-item ' + (item.done ? "done" : "") + '">' +
              '<input type="checkbox" data-check="' + index + '" ' + (item.done ? "checked" : "") + '>' +
              "<span>" + item.text.replace(/[<>&"]/g, function (c) {
                return {"<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;"}[c];
              }) + "</span>" +
              '<button type="button" data-remove-check="' + index + '" aria-label="Hapus">×</button></div>';
          }).join("");
        }
        function renderCalendar() {
          if (!$("calendar-grid")) return;
          var html = "";
          var now = new Date();
          var start = new Date(now.getFullYear(), now.getMonth(), 1);
          var first = start.getDay();
          for (var i = 0; i < first; i++) html += '<div class="calendar-day"></div>';
          for (var day = 1; day <= new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(); day++) {
            var d = new Date(now.getFullYear(), now.getMonth(), day);
            var value = P.history[dateKey(d)] || 0;
            html += '<div class="calendar-day ' + (value >= (P.settings.target || 4) ? "done" : value ? "hot" : "") +
              '" title="' + value + ' sesi">' + day + "</div>";
          }
          $("calendar-grid").innerHTML = html;
        }
        function applyTheme(theme) {
          P.settings.theme = theme;
          document.documentElement.dataset.theme = theme === "pink" ? "" : theme;
          if (theme === "pink") document.documentElement.removeAttribute("data-theme");
          Array.prototype.forEach.call(document.querySelectorAll(".theme-dot"), function (dot) {
            dot.classList.toggle("on", dot.dataset.theme === theme);
          });
          saveProgress();
        }
        function startAmbient() {
          var box = $("ambient-live");
          if (!box) return;
          box.innerHTML = "";
          var count = matchMedia("(max-width:600px)").matches ? 10 : 18;
          for (var i = 0; i < count; i++) {
            var particle = document.createElement("i");
            particle.style.left = (Math.random() * 100) + "%";
            particle.style.animationDelay = (-Math.random() * 12) + "s";
            particle.style.setProperty("--speed", (6 + Math.random() * 8) + "s");
            particle.style.setProperty("--drift", (Math.round(Math.random() * 70) - 35) + "px");
            box.appendChild(particle);
          }
        }
        function show(id) {
          ["s-home", "s-hub", "s-timer"].forEach(function (s) {
            $(s).classList.toggle("on", s === id);
          });
          document.body.dataset.mode =
            id === "s-timer" ? "timer" : id === "s-hub" ? "hub" : "home";
        }
        function tab(n) {
          if (n === "home") {
            show("s-home");
            bg("scene");
            document.title = "Pixel Pomodoro";
            typeIt();
            return;
          }
          show("s-hub");
          bg(S.k ? C[S.k][1] : "sky");
          ["apa", "cara", "teman", "statistik"].forEach(function (t) {
            $("t-" + t).classList.toggle("on", t === n);
          });
          Array.prototype.forEach.call($("nav").children, function (b) {
            b.setAttribute("aria-pressed", b.dataset.t === n);
          });
        }
        function fmt(s) {
          var m = Math.floor(s / 60),
            r = s % 60;
          return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r;
        }
        function beep() {
          try {
            var c = new (window.AudioContext || window.webkitAudioContext)(),
              o = c.createOscillator(),
              g = c.createGain();
            o.type = "square";
            var alarm = P ? P.settings.alarm : "pixel";
            o.type = alarm === "bell" ? "sine" : alarm === "chime" ? "triangle" : "square";
            o.frequency.value = alarm === "chime" ? 880 : alarm === "bell" ? 520 : 660;
            o.connect(g);
            g.connect(c.destination);
            g.gain.setValueAtTime(0.08, c.currentTime);
            o.start();
            o.stop(c.currentTime + 0.4);
          } catch (e) {}
          if (P && P.settings.vibrate && navigator.vibrate) navigator.vibrate([180, 80, 180]);
        }
        function stopMusic() {
          if (musicInterval) clearInterval(musicInterval);
          musicInterval = null;
          musicNodes.forEach(function (node) {
            try {
              if (node.stop) node.stop();
              node.disconnect();
            } catch (e) {}
          });
          musicNodes = [];
          if (musicContext && musicContext.state !== "closed") {
            musicContext.close();
          }
          musicContext = null;
          musicMaster = null;
          musicPlaying = false;
          if ($("music-toggle")) {
            $("music-toggle").textContent = "PUTAR MUSIK";
            $("music-toggle").setAttribute("aria-pressed", "false");
          }
        }
        function noiseSource(context) {
          var length = context.sampleRate * 2;
          var buffer = context.createBuffer(1, length, context.sampleRate);
          var data = buffer.getChannelData(0);
          for (var i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
          var source = context.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          return source;
        }
        function startMusic(track) {
          stopMusic();
          try {
            var AudioCtx = window.AudioContext || window.webkitAudioContext;
            musicContext = new AudioCtx();
            var ctx = musicContext;
            var master = ctx.createGain();
            master.gain.value = (P.settings.volume / 100) * 0.12;
            musicMaster = master;
            master.connect(ctx.destination);

            if (track === "rain" || track === "ocean") {
              var noise = noiseSource(ctx);
              var filter = ctx.createBiquadFilter();
              filter.type = track === "rain" ? "bandpass" : "lowpass";
              filter.frequency.value = track === "rain" ? 1800 : 520;
              filter.Q.value = 0.7;
              var gain = ctx.createGain();
              gain.gain.value = track === "rain" ? 0.24 : 0.32;
              noise.connect(filter);
              filter.connect(gain);
              gain.connect(master);
              noise.start();
              musicNodes.push(noise);

              if (track === "ocean") {
                var lfo = ctx.createOscillator();
                var lfoGain = ctx.createGain();
                lfo.frequency.value = 0.09;
                lfoGain.gain.value = 0.14;
                lfo.connect(lfoGain);
                lfoGain.connect(gain.gain);
                lfo.start();
                musicNodes.push(lfo);
              }
            } else if (track === "lofi") {
              var notes = [261.63, 329.63, 392, 440, 392, 329.63, 293.66, 349.23];
              var index = 0;
              function playNote() {
                var osc = ctx.createOscillator();
                var tone = ctx.createGain();
                osc.type = "triangle";
                osc.frequency.value = notes[index++ % notes.length];
                tone.gain.setValueAtTime(0.0001, ctx.currentTime);
                tone.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.08);
                tone.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.7);
                osc.connect(tone);
                tone.connect(master);
                osc.start();
                osc.stop(ctx.currentTime + 1.8);
              }
              playNote();
              musicInterval = setInterval(playNote, 900);
            } else {
              var noise = noiseSource(ctx);
              var filter = ctx.createBiquadFilter();
              var gain = ctx.createGain();
              if (track === "fire") {
                filter.type = "highpass";
                filter.frequency.value = 900;
                gain.gain.value = 0.12;
                musicInterval = setInterval(function () {
                  var crack = ctx.createOscillator();
                  var crackGain = ctx.createGain();
                  crack.type = "square";
                  crack.frequency.value = 100 + Math.random() * 500;
                  crackGain.gain.value = 0.06;
                  crack.connect(crackGain);
                  crackGain.connect(master);
                  crack.start();
                  crack.stop(ctx.currentTime + 0.04);
                }, 700);
              } else if (track === "wind") {
                filter.type = "bandpass";
                filter.frequency.value = 700;
                gain.gain.value = 0.2;
              } else {
                filter.type = "lowpass";
                filter.frequency.value = 1200;
                gain.gain.value = 0.16;
              }
              noise.connect(filter);
              filter.connect(gain);
              gain.connect(master);
              noise.start();
              musicNodes.push(noise);
            }
            musicPlaying = true;
            $("music-toggle").textContent = "MATIKAN MUSIK";
            $("music-toggle").setAttribute("aria-pressed", "true");
          } catch (e) {
            stopMusic();
          }
        }
        function paint() {
          var p = (S.total - S.left) / S.total;
          $("time").textContent = fmt(S.left);
          Array.prototype.forEach.call($("seg").children, function (x, i) {
            x.classList.toggle("on", i < Math.floor(p * 12));
          });
          var m = (S.mode === "focus" ? MF : MB)[
              Math.min(3, Math.floor(p * 4))
            ],
            bb = $("bubble");
          if (bb.textContent !== m) {
            bb.textContent = m;
            swap(bb);
          }
          document.title = fmt(S.left) + " · Pixel Pomodoro";
        }
        function begin(mode, min) {
          clearInterval(S.t);
          S.mode = mode;
          S.total = min * 60;
          S.left = S.total;
          S.run = true;
          S.end = Date.now() + S.left * 1000;
          var f = mode === "focus",
            pop = S.k === "pop";
          $("mode").textContent = f ? "BELAJAR" : "ISTIRAHAT";
          $("mode").className = "rib" + (f ? "" : " brk");
          $("main-img").src = f ? WIZ : imgs[S.k];
          $("main-img").className = f ? "" : pop ? "framed" : "";
          $("buddy").style.display = f ? "block" : "none";
          $("music").classList.toggle("on", !f);
          document.querySelector(".stage").classList.remove("jeda", "celebrate");
          if ($("active-task")) {
            var task = P.settings.task;
            $("active-task").textContent = task ? "TUGAS: " + task : "Tugas aktif belum dipilih";
          }
          if (f) stopMusic();
          else if (musicPlaying) startMusic(selectedTrack);
          $("pause").textContent = "JEDA";
          $("ov").classList.remove("on");
          show("s-timer");
          startAmbient();
          bg(C[S.k][1]);
          $("time").classList.remove("paused");
          paint();
          S.t = setInterval(tick, 250);
        }
        function tick() {
          if (!S.run) return;
          S.left = Math.max(0, Math.round((S.end - Date.now()) / 1000));
          paint();
          if (S.left <= 0) {
            clearInterval(S.t);
            S.run = false;
            beep();
            done();
          }
        }
        function done() {
          var f = S.mode === "focus";
          if (!f) stopMusic();
          if (f) {
            S.done++;
            P.history[dateKey()] = S.done;
            P.totalSessions = (P.totalSessions || 0) + 1;
            P.totalMinutes = (P.totalMinutes || 0) + S.m;
            P.xp = (P.xp || 0) + 25;
            var hour = new Date().getHours();
            if (hour >= 5 && hour < 8) unlockSecret("morning", "Burung Pagi", "Fokus sebelum matahari naik.");
            if (hour >= 23) unlockSecret("night", "Burung Hantu", "Fokus melewati tengah malam.");
            if (calculateStreak() >= 3) unlockSecret("streak", "Streak 3", "Fokus 3 hari berturut-turut.");
            if (P.checklist.filter(function (item) { return item.done; }).length >= 5) {
              unlockSecret("task", "Task Master", "Tuntaskan 5 langkah task.");
            }
            saveProgress();
            hud();
            renderProgress();
          }
          document.querySelector(".stage").classList.add("celebrate");
          setTimeout(function () {
            document.querySelector(".stage").classList.remove("celebrate");
          }, 1500);
          notifyUser(
            f ? "Sesi belajar selesai!" : "Istirahat selesai!",
            f ? "Kerja bagus. Saatnya istirahat sebentar." : "Siap lanjut belajar lagi?",
          );
          $("ov-img").src = imgs[S.k];
          $("ov-img").className = "ovi" + (S.k === "pop" ? " framed" : "");
          $("ov-t").textContent = f
            ? "Sesi belajar selesai!"
            : "Istirahat selesai!";
          $("ov-p").textContent = f
            ? S.done % 4 === 0
              ? "Level naik! Setelah 4 sesi, kamu pantas istirahat panjang 15 sampai 30 menit."
              : "Kerja bagus. Mau istirahat sebentar atau langsung lanjut?"
            : "Siap lanjut belajar lagi?";
          $("ov-a").textContent = f ? "Istirahat +5 menit" : "Kembali ke awal";
          $("ov-b").textContent = "Lanjut belajar";
          if (P.settings.auto) {
            $("ov").classList.remove("on");
            setTimeout(function () {
              begin(f ? "break" : "focus", f ? (P.settings.break || 5) : S.m);
            }, 900);
            return;
          }
          $("ov").classList.add("on");
          $("ov-b").focus();
        }
        loadProgress();
        if ($("task-input")) $("task-input").value = P.settings.task;
        if ($("checklist-input")) $("checklist-input").value = "";
        if ($("focus-min")) $("focus-min").value = P.settings.focus;
        if ($("break-min")) $("break-min").value = P.settings.break;
        if ($("alarm-select")) $("alarm-select").value = P.settings.alarm;
        applyTheme(P.settings.theme);
        renderChecklist();
        renderCalendar();
        S.done = P.history[dateKey()] || 0;
        if ($("target-input")) $("target-input").value = P.settings.target;
        if ($("auto-mode")) $("auto-mode").checked = P.settings.auto;
        if ($("vibrate-toggle")) $("vibrate-toggle").checked = P.settings.vibrate;
        if ($("volume-range")) $("volume-range").value = P.settings.volume;
        Array.prototype.forEach.call($("tracks").children, function (b) {
          var on = b.dataset.track === selectedTrack;
          b.classList.toggle("on", on);
          b.setAttribute("aria-pressed", on);
        });
        if (P.settings.friend) {
          var savedBuddy = document.querySelector('.pick[data-k="' + P.settings.friend + '"]');
          if (savedBuddy) savedBuddy.click();
        }
        if (P.settings.duration) {
          S.m = P.settings.duration;
          Array.prototype.forEach.call($("durs").children, function (b) {
            var on = +b.dataset.m === S.m;
            b.setAttribute("aria-pressed", on);
          });
        }
        typeIt();
        hud();
        renderProgress();
        startAmbient();
        document.addEventListener("click", function (e) {
          var b = e.target.closest("button");
          if (
            !b ||
            b.disabled ||
            matchMedia("(prefers-reduced-motion:reduce)").matches
          )
            return;
          var r = b.getBoundingClientRect(),
            x = e.detail ? e.clientX : r.left + r.width / 2,
            y = e.detail ? e.clientY : r.top + r.height / 2,
            cols = ["#ff8fb1", "#ffe27a", "#9be7c4", "#8fd3ff", "#c9b6ff"];
          for (var i = 0; i < 7; i++) {
            var p = document.createElement("i"),
              a = (Math.PI * 2 * i) / 7 + Math.random() * 0.6,
              d = 26 + Math.random() * 26;
            p.className = "pt";
            p.style.cssText =
              "left:" +
              (x - 4) +
              "px;top:" +
              (y - 4) +
              "px;background:" +
              cols[i % 5] +
              ";--dx:" +
              Math.round(Math.cos(a) * d) +
              "px;--dy:" +
              Math.round(Math.sin(a) * d - 14) +
              "px";
            document.body.appendChild(p);
            setTimeout(
              function (q) {
                q.remove();
              }.bind(null, p),
              750,
            );
          }
        });
        $("go-pick").onclick = function () {
          tab("apa");
        };
        $("to-cara").onclick = function () {
          tab("cara");
        };
        $("to-teman").onclick = function () {
          tab("teman");
        };
        $("nav").onclick = function (e) {
          var b = e.target.closest("button");
          if (b) tab(b.dataset.t);
        };
        $("buddies").onclick = function (e) {
          var b = e.target.closest(".pick");
          if (!b) return;
          S.k = b.dataset.k;
          var c = C[S.k];
          Array.prototype.forEach.call($("buddies").children, function (x) {
            x.setAttribute("aria-pressed", x === b);
          });
          bg(c[1]);
          $("hp").src = imgs[S.k];
          swap($("hs"));
          swap($("hn"));
          swap($("hp"));
          b.classList.remove("boing");
          void b.offsetWidth;
          b.classList.add("boing");
          $("hn").textContent = c[0].toUpperCase();
          $("hs").textContent = c[2] + " (Latar: " + BGN[c[1]] + ")";
          $("go-timer").disabled = false;
          P.settings.friend = S.k;
          saveProgress();
        };
        $("durs").onclick = function (e) {
          var b = e.target.closest(".chip");
          if (!b) return;
          S.m = +b.dataset.m;
          Array.prototype.forEach.call($("durs").children, function (x) {
            x.setAttribute("aria-pressed", x === b);
          });
          P.settings.duration = S.m;
          saveProgress();
        };
        $("go-timer").onclick = function () {
          $("buddy-img").src = imgs[S.k];
          $("buddy-img").className = S.k === "pop" ? "framed" : "";
          begin("focus", S.m);
        };
        $("pause").onclick = function () {
          if (S.run) {
            S.run = false;
            S.left = Math.max(0, Math.round((S.end - Date.now()) / 1000));
            $("pause").textContent = "LANJUT";
            $("time").classList.add("paused");
            document.querySelector(".stage").classList.add("jeda");
            if (S.mode === "break" && musicContext) musicContext.suspend();
          } else {
            S.run = true;
            S.end = Date.now() + S.left * 1000;
            $("pause").textContent = "JEDA";
            $("time").classList.remove("paused");
            document.querySelector(".stage").classList.remove("jeda");
            if (S.mode === "break" && musicContext) musicContext.resume();
          }
        };
        $("reset").onclick = function () {
          clearInterval(S.t);
          S.run = false;
          stopMusic();
          document.title = "Pixel Pomodoro";
          tab("teman");
        };
        $("ov-a").onclick = function () {
          if (S.mode === "focus") {
            begin("break", P.settings.break || 5);
          } else {
            $("ov").classList.remove("on");
            tab("teman");
          }
        };
        $("ov-b").onclick = function () {
          begin("focus", S.m);
        };
        $("task-input").oninput = saveProgress;
        $("target-input").onchange = saveProgress;
        $("auto-mode").onchange = function () {
          P.settings.auto = $("auto-mode").checked;
          saveProgress();
        };
        $("vibrate-toggle").onchange = function () {
          P.settings.vibrate = $("vibrate-toggle").checked;
          saveProgress();
        };
        $("volume-range").oninput = function () {
          P.settings.volume = +$("volume-range").value;
          if (musicMaster) musicMaster.gain.value = (P.settings.volume / 100) * 0.12;
          saveProgress();
        };
        $("notify-btn").onclick = function () {
          if (!("Notification" in window)) {
            $("notify-btn").textContent = "TIDAK ADA";
            return;
          }
          Notification.requestPermission().then(function (permission) {
            P.settings.notify = permission === "granted";
            saveProgress();
            $("notify-btn").textContent = P.settings.notify ? "AKTIF" : "DITOLAK";
          });
        };
        if (P.settings.notify && $("notify-btn")) $("notify-btn").textContent = "AKTIF";
        $("tracks").onclick = function (e) {
          var b = e.target.closest(".track");
          if (!b) return;
          selectedTrack = b.dataset.track;
          Array.prototype.forEach.call($("tracks").children, function (x) {
            x.classList.toggle("on", x === b);
            x.setAttribute("aria-pressed", x === b);
          });
          saveProgress();
          if (musicPlaying) startMusic(selectedTrack);
        };
        $("music-toggle").onclick = function () {
          if (musicPlaying) stopMusic();
          else startMusic(selectedTrack);
        };
        $("checklist-add").onclick = function () {
          var text = $("checklist-input").value.trim();
          if (!text) return;
          P.checklist.push({ text: text, done: false });
          $("checklist-input").value = "";
          saveProgress();
          renderChecklist();
        };
        $("checklist-input").onkeydown = function (event) {
          if (event.key === "Enter") $("checklist-add").click();
        };
        $("checklist").onclick = function (event) {
          var check = event.target.closest("[data-check]");
          var remove = event.target.closest("[data-remove-check]");
          if (check) {
            P.checklist[+check.dataset.check].done = check.checked;
            saveProgress();
            renderChecklist();
          }
          if (remove) {
            P.checklist.splice(+remove.dataset.removeCheck, 1);
            saveProgress();
            renderChecklist();
          }
        };
        $("theme-row").onclick = function (event) {
          var dot = event.target.closest(".theme-dot");
          if (dot) applyTheme(dot.dataset.theme);
        };
        $("focus-min").onchange = function () {
          P.settings.focus = Math.max(1, Math.min(120, +$("focus-min").value || 25));
          $("focus-min").value = P.settings.focus;
          S.m = P.settings.focus;
          saveProgress();
        };
        $("break-min").onchange = function () {
          P.settings.break = Math.max(1, Math.min(60, +$("break-min").value || 5));
          $("break-min").value = P.settings.break;
          saveProgress();
        };
        $("alarm-select").onchange = function () {
          P.settings.alarm = $("alarm-select").value;
          saveProgress();
          beep();
        };
        document.querySelector(".mood-row").onclick = function (event) {
          var mood = event.target.closest("[data-mood]");
          if (!mood) return;
          P.settings.mood = mood.dataset.mood;
          P.moods[dateKey()] = mood.dataset.mood;
          saveProgress();
          document.querySelectorAll("[data-mood]").forEach(function (button) {
            button.classList.toggle("on", button === mood);
          });
        };
        Array.prototype.forEach.call(document.querySelectorAll("[data-mood]"), function (button) {
          button.classList.toggle("on", button.dataset.mood === P.settings.mood);
        });
        $("ultra-btn").onclick = function () {
          var active = document.body.classList.toggle("ultra-focus");
          $("ultra-btn").setAttribute("aria-pressed", active);
          $("ultra-btn").textContent = active ? "EXIT FOCUS" : "FOCUS MODE";
        };
        $("export-btn").onclick = function () {
          var rows = [["tanggal", "sesi", "menit", "mood"]];
          Object.keys(P.history).sort().forEach(function (key) {
            var sessions = P.history[key] || 0;
            rows.push([key, sessions, sessions * S.m, P.moods[key] || ""]);
          });
          var csv = rows.map(function (row) {
            return row.map(function (value) {
              return '"' + String(value).replace(/"/g, '""') + '"';
            }).join(",");
          }).join("\n");
          var url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
          var link = document.createElement("a");
          link.href = url;
          link.download = "pixel-pomodoro.csv";
          link.click();
          setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        };
        window.addEventListener("storage", function (event) {
          if (event.key !== "pixelPomodoroProgress") return;
          loadProgress();
          hud();
          renderProgress();
          renderChecklist();
          renderCalendar();
        });
        document.addEventListener("keydown", function (event) {
          if (event.target.matches("input, textarea, select")) return;
          if (event.code === "Space") {
            event.preventDefault();
            if ($("s-timer").classList.contains("on")) $("pause").click();
          }
          if (event.key.toLowerCase() === "f" && $("s-timer").classList.contains("on")) {
            $("ultra-btn").click();
          }
          if (event.key.toLowerCase() === "r" && $("s-timer").classList.contains("on")) {
            $("reset").click();
          }
        });
        setInterval(function () {
          if (S.mode === "break" && S.run && S.left > 0 && S.left % 300 === 0) {
            notifyUser("Istirahat mata", "Gerakkan mata ke arah jauh selama 20 detik.");
          }
        }, 250);
        if ("serviceWorker" in navigator) {
          window.addEventListener("load", function () {
            navigator.serviceWorker.register("./sw.js").catch(function () {});
          });
        }
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
          $("intro").classList.add("done");
        } else {
          setTimeout(function () {
            $("intro").classList.add("done");
          }, 2300);
        }
      })();
