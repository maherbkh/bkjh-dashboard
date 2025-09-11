<template>
  <Teleport to="body">
    <!-- hidden SVG color filters -->
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style="position: absolute"
    >
      <defs>
        <!-- Matrices adapted from Brettel/Viénot color vision model -->
        <filter :id="ids.protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0     0 0
                  0.558 0.442 0     0 0
                  0     0.242 0.758 0 0
                  0     0     0     1 0"
          />
        </filter>
        <filter :id="ids.deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0     0 0
                  0.7   0.3   0     0 0
                  0     0.3   0.7   0 0
                  0     0     0     1 0"
          />
        </filter>
        <filter :id="ids.tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95  0.05  0     0 0
                  0     0.433 0.567 0 0
                  0     0.475 0.525 0 0
                  0     0     0     1 0"
          />
        </filter>
      </defs>
    </svg>

    <!-- floating widget -->
    <div
      ref="wrap"
      class="a11y-wrap"
      :style="{ left: `${pos.x}px`, top: `${pos.y}px` }"
      role="region"
      aria-label="Accessibility assistant"
    >
      <button
        ref="fab"
        class="a11y-fab"
        type="button"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-controls="panelId"
        @click="open = !open"
        @keydown="onFabKey"
        @pointerdown="startDrag"
        title="Accessibility (Alt + 1)"
      >
        <span class="sr-only">Open accessibility options</span>
        <!-- simple person icon -->
        <svg viewBox="0 0 24 24" class="a11y-icon" aria-hidden="true">
          <circle cx="12" cy="7.5" r="2.5" />
          <path d="M4 11h16v2h-6v8h-4v-8H4z" />
        </svg>
      </button>

      <transition name="a11y-pop">
        <section
          v-if="open"
          :id="panelId"
          class="a11y-panel"
          role="dialog"
          aria-modal="false"
          @keydown.esc.prevent="open = false"
        >
          <header class="a11y-h">Visuelle Hilfe</header>

          <!-- TTS -->
          <fieldset class="a11y-group" :disabled="!supportsTTS">
            <legend>Vorlesen (TTS)</legend>
            <div class="row">
              <label class="grow">
                Stimme
                <select v-model="voiceUri">
                  <option v-for="v in voices" :key="v.voiceURI" :value="v.voiceURI">
                    {{ v.name }} ({{ v.lang }})
                  </option>
                </select>
              </label>
              <label>
                Rate
                <input type="range" min="0.5" max="2" step="0.1" v-model.number="rate" />
              </label>
              <label>
                Pitch
                <input type="range" min="0.5" max="2" step="0.1" v-model.number="pitch" />
              </label>
            </div>
            <div class="row">
              <button type="button" @click="speakSelection">Auswahl vorlesen</button>
              <button type="button" @click="speakPage">Seite vorlesen</button>
              <button type="button" @click="togglePause">
                {{ paused ? "Fortsetzen" : "Pause" }}
              </button>
              <button type="button" @click="stop">Stopp</button>
            </div>
            <p v-if="!supportsTTS" class="muted">
              TTS wird von diesem Browser nicht unterstützt.
            </p>
          </fieldset>

          <!-- Zoom -->
          <fieldset class="a11y-group">
            <legend>Zoom</legend>
            <div class="row">
              <button type="button" @click="setZoom(zoom - 10)" :disabled="zoom <= 80">
                A-
              </button>
              <div class="muted">Schriftgröße: {{ zoom }}%</div>
              <button type="button" @click="setZoom(zoom + 10)" :disabled="zoom >= 200">
                A+
              </button>
              <button type="button" @click="setZoom(100)">Zurücksetzen</button>
            </div>
          </fieldset>

          <!-- Color vision / contrast -->
          <fieldset class="a11y-group">
            <legend>Farbhilfen</legend>
            <div class="row wrap">
              <label><input type="radio" value="none" v-model="filter" /> Keine</label>
              <label
                ><input type="radio" value="grayscale" v-model="filter" />
                Graustufen</label
              >
              <label
                ><input type="radio" value="high-contrast" v-model="filter" /> Hoher
                Kontrast</label
              >
              <label
                ><input type="radio" value="protanopia" v-model="filter" />
                Protanopie</label
              >
              <label
                ><input type="radio" value="deuteranopia" v-model="filter" />
                Deuteranopie</label
              >
              <label
                ><input type="radio" value="tritanopia" v-model="filter" />
                Tritanopie</label
              >
            </div>
          </fieldset>

          <footer class="a11y-foot">
            <span class="kbd"><kbd>ALT</kbd> + <kbd>1</kbd></span> zum Öffnen/Schließen.
            <button class="link" type="button" @click="resetAll">
              Alles zurücksetzen
            </button>
          </footer>
        </section>
      </transition>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, computed, watch } from "vue";

type Voice = SpeechSynthesisVoice;
type Pos = { x: number; y: number };

const isClient = typeof window !== "undefined";
const panelId = `a11y-${Math.random().toString(36).slice(2)}`;
const STORAGE = "a11y-assist-v1";

/** ----- UI state ----- */
const open = ref(true);
const wrap = ref<HTMLElement | null>(null);
const fab = ref<HTMLButtonElement | null>(null);
const pos = ref<Pos>({ x: 24, y: 120 });
const dragging = ref(false);
let pointerId: number | null = null;
let dragOff = { x: 0, y: 0 };

/** ----- TTS (Web Speech) ----- */
const supportsTTS = isClient && "speechSynthesis" in window;
const voices = ref<Voice[]>([]);
const voiceUri = ref<string>("");
const rate = ref(1);
const pitch = ref(1);
const speaking = ref(false);
const paused = ref(false);
let utterance: SpeechSynthesisUtterance | null = null;

function loadVoices() {
  if (!supportsTTS) return;
  voices.value = window.speechSynthesis.getVoices();
  if (!voiceUri.value && voices.value.length) {
    const preferred =
      voices.value.find((v) =>
        v.lang?.toLowerCase().startsWith(navigator.language?.toLowerCase() || "")
      ) || voices.value[0];
    voiceUri.value = preferred.voiceURI;
  }
}

function makeUtterance(text: string) {
  if (!supportsTTS) return null;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate.value;
  u.pitch = pitch.value;
  const v = voices.value.find((v) => v.voiceURI === voiceUri.value);
  if (v) u.voice = v;
  u.onstart = () => {
    speaking.value = true;
    paused.value = false;
  };
  u.onend = u.onpause = () => {
    speaking.value = false;
    paused.value = false;
  };
  u.onresume = () => {
    paused.value = false;
  };
  return u;
}

function speak(text: string) {
  if (!supportsTTS || !text.trim()) return;
  stop();
  utterance = makeUtterance(text)!;
  window.speechSynthesis.speak(utterance);
}

function speakSelection() {
  const sel = window.getSelection()?.toString() || "";
  speak(sel);
}

function speakPage() {
  // prefer <main> or <article>, else body text
  const root = document.querySelector("main, article") || document.body;
  const text = root.innerText.replace(/\s+/g, " ").trim();
  speak(text);
}

function togglePause() {
  if (!supportsTTS) return;
  if (window.speechSynthesis.speaking) {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      paused.value = false;
    } else {
      window.speechSynthesis.pause();
      paused.value = true;
    }
  }
}

function stop() {
  if (!supportsTTS) return;
  window.speechSynthesis.cancel();
  speaking.value = false;
  paused.value = false;
}

/** ----- Zoom (root font size) ----- */
const zoom = ref(100);
function applyZoom() {
  document.documentElement.style.fontSize = `${zoom.value}%`;
}
function setZoom(val: number) {
  zoom.value = Math.min(200, Math.max(80, Math.round(val)));
  applyZoom();
  persist();
}

/** ----- Color filters ----- */
type Filter =
  | "none"
  | "grayscale"
  | "high-contrast"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia";
const filter = ref<Filter>("none");
const ids = {
  protanopia: "a11y-prot-" + panelId,
  deuteranopia: "a11y-deut-" + panelId,
  tritanopia: "a11y-trit-" + panelId,
};
function applyFilter() {
  const el = document.documentElement;
  el.style.filter = "";
  switch (filter.value) {
    case "none":
      break;
    case "grayscale":
      el.style.filter = "grayscale(1)";
      break;
    case "high-contrast":
      el.style.filter = "invert(1) contrast(1.2)";
      break;
    case "protanopia":
      el.style.filter = `url(#${ids.protanopia})`;
      break;
    case "deuteranopia":
      el.style.filter = `url(#${ids.deuteranopia})`;
      break;
    case "tritanopia":
      el.style.filter = `url(#${ids.tritanopia})`;
      break;
  }
}

/** ----- Dragging ----- */
function clamp(p: Pos): Pos {
  const W = window.innerWidth,
    H = window.innerHeight;
  const w = 64,
    h = 64;
  return {
    x: Math.min(Math.max(8, p.x), W - w - 8),
    y: Math.min(Math.max(8, p.y), H - h - 8),
  };
}
function startDrag(e: PointerEvent) {
  if ((e as PointerEvent).button !== 0 && e.pointerType === "mouse") return;
  dragging.value = true;
  pointerId = e.pointerId;
  fab.value?.setPointerCapture(pointerId!);
  dragOff = { x: e.clientX - pos.value.x, y: e.clientY - pos.value.y };
  window.addEventListener("pointermove", onDrag);
  window.addEventListener("pointerup", endDrag, { once: true });
}
function onDrag(e: PointerEvent) {
  if (!dragging.value) return;
  pos.value = clamp({ x: e.clientX - dragOff.x, y: e.clientY - dragOff.y });
}
function endDrag() {
  dragging.value = false;
  if (pointerId != null) fab.value?.releasePointerCapture(pointerId);
  window.removeEventListener("pointermove", onDrag);
  persist();
}

/** ----- Keyboard / persistence ----- */
function onFabKey(e: KeyboardEvent) {
  const step = e.shiftKey ? 20 : 10;
  if (["ArrowUp", "Up"].includes(e.key)) {
    pos.value = clamp({ x: pos.value.x, y: pos.value.y - step });
    persist();
    e.preventDefault();
  }
  if (["ArrowDown", "Down"].includes(e.key)) {
    pos.value = clamp({ x: pos.value.x, y: pos.value.y + step });
    persist();
    e.preventDefault();
  }
  if (["ArrowLeft", "Left"].includes(e.key)) {
    pos.value = clamp({ x: pos.value.x - step, y: pos.value.y });
    persist();
    e.preventDefault();
  }
  if (["ArrowRight", "Right"].includes(e.key)) {
    pos.value = clamp({ x: pos.value.x + step, y: pos.value.y });
    persist();
    e.preventDefault();
  }
}

function onGlobalKey(e: KeyboardEvent) {
  if (e.altKey && (e.key === "1" || e.code === "Digit1")) {
    e.preventDefault();
    open.value = !open.value;
    if (open.value) fab.value?.focus();
  }
}

function persist() {
  try {
    localStorage.setItem(
      STORAGE,
      JSON.stringify({
        pos: pos.value,
        zoom: zoom.value,
        filter: filter.value,
        voiceUri: voiceUri.value,
        rate: rate.value,
        pitch: pitch.value,
      })
    );
  } catch {}
}

function restore() {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return;
    const v = JSON.parse(raw);
    if (v.pos) pos.value = clamp(v.pos);
    if (v.zoom) zoom.value = v.zoom;
    if (v.filter) filter.value = v.filter;
    if (v.voiceUri) voiceUri.value = v.voiceUri;
    if (v.rate) rate.value = v.rate;
    if (v.pitch) pitch.value = v.pitch;
  } catch {}
}

function resetAll() {
  zoom.value = 100;
  filter.value = "none";
  stop();
  persist();
  applyZoom();
  applyFilter();
}

/** ----- lifecycle ----- */
onMounted(() => {
  restore();
  applyZoom();
  applyFilter();

  window.addEventListener("resize", () => {
    pos.value = clamp(pos.value);
  });
  window.addEventListener("keydown", onGlobalKey);

  if (supportsTTS) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onGlobalKey);
  if (supportsTTS) window.speechSynthesis.onvoiceschanged = null;
});

watch([voiceUri, rate, pitch], persist);
watch(filter, () => {
  applyFilter();
  persist();
});
</script>

<style scoped>
/* base */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
.a11y-wrap {
  position: fixed;
  z-index: 2147483000;
}
.a11y-fab {
  width: 64px;
  height: 64px;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  background: #1ea7fd;
  color: white;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}
.a11y-fab:focus {
  outline: 3px solid #000;
  outline-offset: 3px;
}
.a11y-icon {
  width: 28px;
  height: 28px;
  fill: currentColor;
}

.a11y-panel {
  position: absolute;
  right: 76px;
  top: 0;
  max-width: 360px;
  background: #111;
  color: #fff;
  border-radius: 14px;
  padding: 14px 14px 10px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
}
.a11y-h {
  font-weight: 700;
  margin-bottom: 8px;
}
.a11y-group {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 10px;
  margin: 8px 0;
}
.a11y-group legend {
  padding: 0 6px;
}
.row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.row.wrap {
  flex-wrap: wrap;
}
.grow {
  flex: 1;
}
.muted {
  opacity: 0.8;
  font-size: 0.9em;
}
.kbd kbd {
  background: #222;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #333;
}

button {
  background: #2d8cff;
  border: none;
  border-radius: 10px;
  color: white;
  padding: 8px 10px;
  cursor: pointer;
}
button.link {
  background: none;
  border: none;
  color: #9ad;
  cursor: pointer;
  text-decoration: underline;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
select,
input[type="range"] {
  width: 100%;
}

.a11y-pop-enter-from,
.a11y-pop-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
.a11y-pop-enter-active,
.a11y-pop-leave-active {
  transition: 0.12s ease;
}
</style>
