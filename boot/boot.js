(function () {
  "use strict";

  // Prevent duplicate boot instances
  if (window.__OBAKE_BOOT_INSTANCE__) return;
  window.__OBAKE_BOOT_INSTANCE__ = true;

  function start() {
    if (sessionStorage.getItem("obake.boot.completed") === "true") {
      window.__OBAKE_BOOT_COMPLETE__ = true;
      return;
    }

    if (document.querySelector("#retro-boot")) return;

    const boot = document.createElement("div");
    boot.id = "retro-boot";

    boot.innerHTML = `
      <div id="boot-screen">
        <div id="boot-output"></div>
        <span id="boot-cursor"></span>
      </div>
    `;

    document.body.insertBefore(boot, document.body.firstChild);

    const output = boot.querySelector("#boot-output");
    const cursor = boot.querySelector("#boot-cursor");

    let finished = false;
    let enterPressed = false;

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // BIOS diagnostics
    const lines = [
      ["bright", "Award Modular BIOS v4.51PG"],
      ["dim", "Copyright (C) 1984-1998, Award Software, Inc."],
      ["", ""],

      ["bright", "CPU: Genuine Intel-compatible 200 MHz"],
      ["", "Memory Test : 65536K OK"],
      ["", "Primary Master : QUANTUM FIREBALL"],
      ["", ""],

      ["dim", "RTC CHECK................ OK"],
      ["dim", "CMOS CHECK............... OK"],
      ["", "Initializing clock..."],
      ["warn", "RTC: 11:34:07"],
      ["error", "RTC DRIFT DETECTED (-00:09)"],
      ["", ""],

      ["dim", "Temporal synchronization"],
      ["warn", "REFERENCE DATE : 08/21/1998"],
      ["warn", "SYSTEM DATE    : 08/21/2026"],
      ["error", "TEMPORAL SYNC FAILED"],
      ["", ""],

      ["dim", "NVRAM EVENT LOG........."],
      ["error", "TIMESTAMP CORRUPTION"],
      ["dim", "LAST BOOT: 01/14/2010 13:01:03"],
      ["", ""]
    ];

    async function typeLine(type, text) {
      if (finished) return;

      const line = document.createElement("div");

      if (type) {
        line.className = type;
      }

      output.appendChild(line);

      for (const char of text) {
        if (finished) return;

        line.textContent += char;

        let delay = 5 + Math.random() * 7;

        if (char === "." || char === ":") {
          delay += 8;
        }

        await sleep(delay);
      }
    }

    // Wait for ENTER
    function waitForEnter() {
      return new Promise(resolve => {
        cursor.style.display = "none";

        const prompt = document.createElement("div");
        prompt.id = "boot-prompt";
        prompt.className = "bright";

        prompt.innerHTML =
          "Press ENTER to startup WIN98." +
          '<span id="prompt-cursor"></span>';

        output.appendChild(prompt);

        function keyHandler(e) {
          if (e.key !== "Enter" || enterPressed) return;

          e.preventDefault();
          e.stopImmediatePropagation();

          enterPressed = true;

          if (window.__requestOkabeFullscreen) {
            window.__requestOkabeFullscreen();
          }

          document.removeEventListener(
            "keydown",
            keyHandler,
            true
          );

          const promptCursor =
            prompt.querySelector("#prompt-cursor");

          if (promptCursor) {
            promptCursor.remove();
          }

          resolve();
        }

        document.addEventListener(
          "keydown",
          keyHandler,
          true
        );
      });
    }

    // Windows startup stage
    async function windowsLoad() {
      await typeLine(
        "dim",
        "Starting Windows 98..."
      );

      await sleep(180);

      const loader = document.createElement("div");

      loader.innerHTML = `
        <div class="dim">
          Loading system files...
        </div>

        <div id="windows-loader">
          <div id="windows-loader-bar"></div>
        </div>
      `;

      output.appendChild(loader);

      await sleep(1150);

      await typeLine(
        "bright",
        "System ready."
      );
    }

    // CRT-style transition into website
    async function exitBoot() {
      if (finished) return;

      finished = true;

      boot.classList.add("boot-exit");

      await sleep(180);

      boot.style.clipPath = "inset(0 0 48% 0)";
      await sleep(60);

      boot.style.clipPath = "inset(48% 0 0 0)";
      await sleep(70);

      boot.style.clipPath = "inset(0)";
      await sleep(1100);

      if (boot.parentNode) {
        boot.parentNode.removeChild(boot);
      }

      sessionStorage.setItem("obake.boot.completed", "true");
      window.__OBAKE_BOOT_COMPLETE__ = true;
    }

    // Start boot sequence
    async function run() {
      for (const [type, text] of lines) {
        await typeLine(type, text);

        let pause = 8 + Math.random() * 18;

        if (type === "error") {
          pause = 55 + Math.random() * 55;
        }

        await sleep(pause);
      }

      await waitForEnter();
      await windowsLoad();
      await sleep(200);
      await exitBoot();
    }

    run();
  }

  // Start once DOM is available
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start,
      { once: true }
    );
  } else {
    start();
  }
})();