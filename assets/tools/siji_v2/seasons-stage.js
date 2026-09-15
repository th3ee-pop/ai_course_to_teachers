// Seasons stage: realistic earth + sun, space & ground views. Registers <seasons-stage>.
const IMG = './assets/';
const D2R = Math.PI / 180;
const ORB = 60, LON0 = 116;
let _three;
const loadThree = () => (_three ??= import('three'));

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function radialTexture(THREE, stops) {
  const s = 256, c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d').createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  const ctx = c.getContext('2d'); ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function bandTexture(THREE) {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,1)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function labelSprite(THREE, text, color, px) {
  const c = document.createElement('canvas'), f = px || 44;
  const ctx = c.getContext('2d');
  ctx.font = `500 ${f}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
  c.width = Math.ceil(ctx.measureText(text).width) + 24; c.height = f * 1.7;
  const x = c.getContext('2d');
  x.font = `500 ${f}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`;
  x.fillStyle = color; x.textBaseline = 'middle'; x.textAlign = 'center';
  x.fillText(text, c.width / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sp.userData.aspect = c.width / c.height;
  return sp;
}

const EARTH_VERT = `
varying vec2 vUv; varying vec3 vN; varying vec3 vView;
void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position,1.0); vView = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp; }`;

const EARTH_FRAG = `
uniform sampler2D dayMap, nightMap, waterMap; uniform vec3 sunDir, fallback, twilight;
uniform float hasMaps;
varying vec2 vUv; varying vec3 vN; varying vec3 vView;
vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }
void main(){
  vec3 N = normalize(vN);
  float d = dot(N, sunDir);
  vec3 day = hasMaps > 0.5 ? lin(texture2D(dayMap, vUv).rgb) : fallback;
  vec3 night = hasMaps > 0.5 ? lin(texture2D(nightMap, vUv).rgb) : fallback * 0.06;
  float water = hasMaps > 0.5 ? texture2D(waterMap, vUv).r : 1.0;
  float lit = smoothstep(-0.09, 0.22, d);
  vec3 col = mix(night * 1.15, day * (0.16 + 1.02 * max(d, 0.0)), lit);
  col += twilight * exp(-abs(d) * 11.0) * 0.5 * (0.35 + 0.65 * water);
  vec3 H = normalize(sunDir + vView);
  col += vec3(1.0, 0.94, 0.82) * pow(max(dot(N, H), 0.0), 60.0) * water * 0.55 * step(0.0, d);
  float rim = pow(1.0 - max(dot(N, vView), 0.0), 3.0) * max(d + 0.25, 0.0);
  col += vec3(0.30, 0.52, 0.95) * rim * 0.55;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const GLOW_VERT = `varying vec3 vN; varying vec3 vView;
void main(){ vN = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position,1.0); vView = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp; }`;

const GLOW_FRAG = `uniform vec3 sunDir, tint; uniform float power, strength;
varying vec3 vN; varying vec3 vView;
void main(){ vec3 N = normalize(vN);
  float f = pow(1.0 - abs(dot(N, vView)), power);
  float s = smoothstep(-0.45, 0.35, dot(N, sunDir));
  gl_FragColor = vec4(tint * f * strength * (0.12 + 0.88 * s), f * strength * (0.12 + 0.88 * s));
}`;

const SKY_FRAG = `uniform vec3 zenith, horizon, sunTint, sunDir; uniform float alpha;
varying vec3 vDir;
void main(){ vec3 d = normalize(vDir);
  float h = max(d.y, 0.0);
  vec3 c = mix(horizon, zenith, pow(h, 0.55));
  float g = pow(max(dot(d, sunDir), 0.0), 6.0);
  c += sunTint * g * 0.55;
  float a = alpha * (0.55 + 0.45 * (1.0 - h));
  gl_FragColor = vec4(c, clamp(a + g * 0.4, 0.0, 1.0));
}`;

const SKY_VERT = `varying vec3 vDir;
void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;

class SeasonsStage extends HTMLElement {
  constructor() {
    super();
    this.p = { day: 172, hour: 12, lat: 40, tilt: 23.44, view: 'space', accent: '#e6b25c', grat: 1, starlv: 0.6 };
    this.cam = { az: 0.55, el: 0.42, dist: 5.6 };
    this.gnd = { yaw: Math.PI, fov: 62, pitch: 0.62 };
    this._lat = null;
  }
  static get observedAttributes() { return ['day', 'hour', 'lat', 'tilt', 'view', 'accent', 'grat', 'starlv']; }
  attributeChangedCallback(n, _o, v) {
    if (v == null) return;
    this.p[n] = (n === 'view' || n === 'accent') ? v : parseFloat(v);
  }
  connectedCallback() {
    if (this._booted) return;
    this._booted = true;
    this.style.cssText = 'position:absolute;inset:0;display:block;touch-action:none;cursor:grab';
    this.boot();
  }
  disconnectedCallback() { this._stop = true; this._ro?.disconnect(); }

  async boot() {
    const THREE = this.THREE = await loadThree();
    const W = this.clientWidth || 1200, H = this.clientHeight || 800;
    const renderer = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';

    const scene = this.scene = new THREE.Scene();
    scene.background = new THREE.Color('#05070b');
    this.camS = new THREE.PerspectiveCamera(38, W / H, 0.05, 4000);
    this.camG = new THREE.PerspectiveCamera(62, W / H, 0.1, 4000);
    this.camG.position.set(0, 1.7, 0);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const tex = (file, cs) => new Promise(res => loader.load(IMG + file,
      t => { if (cs) t.colorSpace = THREE.SRGBColorSpace; res(t); }, undefined, () => res(null)));

    // starfield sphere (shared by both views)
    const stars = this.stars = new THREE.Mesh(
      new THREE.SphereGeometry(1400, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0x5c6470, side: THREE.BackSide, depthWrite: false }));
    scene.add(stars);

    // ---- space view ----
    const space = this.space = new THREE.Group();
    scene.add(space);
    space.add(new THREE.PointLight(0xfff2dc, 3.1, 0, 0));
    scene.add(new THREE.AmbientLight(0x2b3a52, 0.16));

    const sun = new THREE.Mesh(new THREE.SphereGeometry(5.2, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0xfff4dd }));
    space.add(sun);
    const halo = radialTexture(THREE, [[0, 'rgba(255,240,205,0.95)'], [0.18, 'rgba(255,214,140,0.42)'], [0.5, 'rgba(255,180,90,0.10)'], [1, 'rgba(255,170,80,0)']]);
    [16, 44, 130].forEach((s, i) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: [0.95, 0.5, 0.22][i] }));
      sp.scale.setScalar(s); space.add(sp);
    });

    const orbitPts = [];
    for (let i = 0; i <= 256; i++) { const a = i / 256 * Math.PI * 2; orbitPts.push(new THREE.Vector3(Math.cos(a) * ORB, 0, Math.sin(a) * ORB)); }
    this.orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPts),
      new THREE.LineBasicMaterial({ color: 0x8fa4c0, transparent: true, opacity: 0.3 }));
    space.add(this.orbit);
    this.marks = new THREE.Group(); space.add(this.marks);
    // λ at each event: 春分 0, 夏至 90, 秋分 180, 冬至 270 → θ = λ+90
    [['春分', 0], ['夏至', 90], ['秋分', 180], ['冬至', 270]].forEach(([name, lam]) => {
      const th = (lam + 90) * D2R;
      const pos = new THREE.Vector3(Math.cos(th) * ORB, 0, Math.sin(th) * ORB);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 8), new THREE.MeshBasicMaterial({ color: 0xbcc9da }));
      dot.position.copy(pos); this.marks.add(dot);
      const lb = labelSprite(THREE, name, 'rgba(226,232,240,0.85)');
      lb.position.copy(pos).multiplyScalar(1.10).setY(3.2);
      lb.scale.set(7 * lb.userData.aspect, 7, 1); this.marks.add(lb);
    });

    const earthGroup = this.earthGroup = new THREE.Group();
    earthGroup.matrixAutoUpdate = false;
    space.add(earthGroup);
    const spin = this.spin = new THREE.Group();
    earthGroup.add(spin);

    this.earthU = {
      dayMap: { value: null }, nightMap: { value: null }, waterMap: { value: null },
      sunDir: { value: new THREE.Vector3(1, 0, 0) }, hasMaps: { value: 0 },
      fallback: { value: new THREE.Color(0x1b3b57) }, twilight: { value: new THREE.Color(0xff8a4c) },
    };
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96),
      new THREE.ShaderMaterial({ uniforms: this.earthU, vertexShader: EARTH_VERT, fragmentShader: EARTH_FRAG }));
    spin.add(earth);

    const glowU = (tint, power, strength) => ({
      sunDir: this.earthU.sunDir, tint: { value: new THREE.Color(tint) },
      power: { value: power }, strength: { value: strength },
    });
    this.atmoIn = new THREE.Mesh(new THREE.SphereGeometry(1.012, 96, 64),
      new THREE.ShaderMaterial({ uniforms: glowU(0x7fb2ff, 2.6, 1.15), vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    spin.add(this.atmoIn);
    this.atmoOut = new THREE.Mesh(new THREE.SphereGeometry(1.16, 96, 64),
      new THREE.ShaderMaterial({ uniforms: glowU(0x5f9dff, 3.4, 1.0), vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide }));
    spin.add(this.atmoOut);

    // graticule
    const gl = [], seg = 96;
    for (let lat = -75; lat <= 75; lat += 15) {
      const r = Math.cos(lat * D2R), y = Math.sin(lat * D2R);
      for (let i = 0; i < seg; i++) {
        const a1 = i / seg * Math.PI * 2, a2 = (i + 1) / seg * Math.PI * 2;
        gl.push(Math.cos(a1) * r, y, -Math.sin(a1) * r, Math.cos(a2) * r, y, -Math.sin(a2) * r);
      }
    }
    for (let lon = 0; lon < 360; lon += 30) {
      for (let i = 0; i < seg / 2; i++) {
        const t1 = -Math.PI / 2 + i / (seg / 2) * Math.PI, t2 = -Math.PI / 2 + (i + 1) / (seg / 2) * Math.PI;
        const f = t => [Math.cos(t) * Math.cos(lon * D2R) , Math.sin(t), -Math.cos(t) * Math.sin(lon * D2R)];
        gl.push(...f(t1).map(v => v * 1.002), ...f(t2).map(v => v * 1.002));
      }
    }
    const grat = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(gl, 3)),
      new THREE.LineBasicMaterial({ color: 0xdce6f5, transparent: true, opacity: 0.13 }));
    grat.scale.setScalar(1.004); spin.add(grat);

    const ring = (r, y, color, op, w) => {
      const pts = [];
      for (let i = 0; i <= 128; i++) { const a = i / 128 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, y, -Math.sin(a) * r)); }
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: op }));
      l.scale.setScalar(1.006); return l;
    };
    this.equator = ring(1, 0, 0xffffff, 0.3); spin.add(this.equator);
    this.tropics = new THREE.Group(); spin.add(this.tropics);
    this.polar = new THREE.Group(); spin.add(this.polar);
    this.latRing = ring(1, 0, 0x7fd4ff, 0.75); spin.add(this.latRing);

    this.axis = new THREE.Line(new THREE.BufferGeometry().setFromPoints(
      [new THREE.Vector3(0, -1.75, 0), new THREE.Vector3(0, 1.75, 0)]),
      new THREE.LineBasicMaterial({ color: 0xe6edf7, transparent: true, opacity: 0.55 }));
    earthGroup.add(this.axis);

    this.observer = new THREE.Group();
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 12), new THREE.MeshBasicMaterial({ color: 0x9fe0ff }));
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.12, 6), new THREE.MeshBasicMaterial({ color: 0x9fe0ff, transparent: true, opacity: 0.7 }));
    stalk.position.y = 0.06; this.observer.add(stalk, pin); pin.position.y = 0.12;
    spin.add(this.observer);

    this.subsolar = new THREE.Group();
    const sdot = new THREE.Mesh(new THREE.SphereGeometry(0.032, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe3a8 }));
    const sring = new THREE.Mesh(new THREE.RingGeometry(0.055, 0.075, 40), new THREE.MeshBasicMaterial({ color: 0xffce7a, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
    this.subsolar.add(sdot, sring);
    space.add(this.subsolar);

    // ---- ground view ----
    const ground = this.ground = new THREE.Group();
    ground.visible = false; scene.add(ground);
    this.skyU = {
      zenith: { value: new THREE.Color(0x1a4f8f) }, horizon: { value: new THREE.Color(0x9fb8cf) },
      sunTint: { value: new THREE.Color(0xffd9a0) }, sunDir: { value: new THREE.Vector3(0, 1, 0) },
      alpha: { value: 1 },
    };
    ground.add(new THREE.Mesh(new THREE.SphereGeometry(900, 64, 40),
      new THREE.ShaderMaterial({ uniforms: this.skyU, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, transparent: true, depthWrite: false })));
    this.groundMat = new THREE.MeshBasicMaterial({ color: 0x1a222c });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(880, 96), this.groundMat);
    disc.rotation.x = -Math.PI / 2; disc.position.y = -0.02; ground.add(disc);
    this.grids = [];
    for (let i = 1; i <= 6; i++) {
      const r = i * 130, pts = [];
      for (let k = 0; k <= 128; k++) { const a = k / 128 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
      const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x8fa6bf, transparent: true, opacity: 0.18 }));
      this.grids.push(ln); ground.add(ln);
    }
    this.bandMat = new THREE.MeshBasicMaterial({ map: bandTexture(THREE), transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, opacity: 0.5 });
    const band = new THREE.Mesh(new THREE.CylinderGeometry(878, 878, 120, 96, 1, true), this.bandMat);
    band.position.y = 58; ground.add(band);
    const hpts = [];
    for (let k = 0; k <= 200; k++) { const a = k / 200 * Math.PI * 2; hpts.push(new THREE.Vector3(Math.cos(a) * 876, 0.6, Math.sin(a) * 876)); }
    this.horizonLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(hpts),
      new THREE.LineBasicMaterial({ color: 0xa8bdd4, transparent: true, opacity: 0.4 }));
    ground.add(this.horizonLine);
    this.gsun = new THREE.Mesh(new THREE.SphereGeometry(11, 32, 24), new THREE.MeshBasicMaterial({ color: 0xfff3d4 }));
    ground.add(this.gsun);
    this.gsunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9 }));
    this.gsunHalo.scale.setScalar(110); ground.add(this.gsunHalo);
    this.pathUp = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffcf8a, transparent: true, opacity: 0.55 }));
    this.pathDn = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineDashedMaterial({ color: 0x8fa8c4, transparent: true, opacity: 0.22, dashSize: 12, gapSize: 14 }));
    ground.add(this.pathUp, this.pathDn);
    [['北', 0], ['东', 90], ['南', 180], ['西', 270]].forEach(([t, az]) => {
      const sp = labelSprite(THREE, t, 'rgba(230,238,248,0.65)');
      const a = az * D2R;
      sp.position.set(Math.sin(a) * 700, 26, -Math.cos(a) * 700);
      sp.scale.set(58 * sp.userData.aspect, 58, 1); ground.add(sp);
    });

    this.bindInput();
    this._ro = new ResizeObserver(() => this.resize()); this._ro.observe(this);
    this.loop();

    const [d, n, w, sk] = await Promise.all([tex('earth-blue-marble.jpg', 1), tex('earth-night.jpg', 1), tex('earth-water.png', 0), tex('night-sky.png', 1)]);
    if (d && n) {
      this.earthU.dayMap.value = d; this.earthU.nightMap.value = n;
      this.earthU.waterMap.value = w || d; this.earthU.hasMaps.value = 1;
    }
    if (sk) { this.stars.material.map = sk; this.stars.material.needsUpdate = true; }
    this.dispatchEvent(new CustomEvent('maps', { detail: { ok: !!(d && n) } }));
  }

  bindInput() {
    const el = this.renderer.domElement;
    let px = 0, py = 0, down = false;
    let pinchDistance = 0;
    const pointers = new Map();
    const distance = () => {
      const [a, b] = [...pointers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    el.addEventListener('pointerdown', e => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) {
        down = true; px = e.clientX; py = e.clientY;
      } else if (pointers.size === 2) {
        down = false; pinchDistance = distance();
      }
      el.setPointerCapture(e.pointerId);
      this.style.cursor = 'grabbing';
    });
    const endPointer = e => {
      pointers.delete(e.pointerId);
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (pointers.size === 1) {
        const p = [...pointers.values()][0];
        down = true; px = p.x; py = p.y; pinchDistance = 0;
      } else {
        down = false; pinchDistance = 0; this.style.cursor = 'grab';
      }
    };
    el.addEventListener('pointerup', endPointer);
    el.addEventListener('pointercancel', endPointer);
    el.addEventListener('pointermove', e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size >= 2) {
        const nextDistance = distance();
        const delta = pinchDistance - nextDistance;
        if (this.p.view === 'space') this.cam.dist = clamp(this.cam.dist * Math.exp(delta * 0.005), 1.9, 190);
        else { this._userLook = true; this.gnd.fov = clamp(this.gnd.fov + delta * 0.12, 28, 78); }
        pinchDistance = nextDistance;
        return;
      }
      if (!down) return;
      const dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
      if (this.p.view === 'space') {
        this.cam.az -= dx * 0.005;
        this.cam.el = clamp(this.cam.el + dy * 0.004, -1.35, 1.35);
      } else {
        this._userLook = true;
        this.gnd.yaw -= dx * 0.0035;
        this.gnd.pitch = clamp(this.gnd.pitch + dy * 0.003, -0.25, 1.3);
      }
    });
    el.addEventListener('wheel', e => {
      e.preventDefault();
      if (this.p.view === 'space') this.cam.dist = clamp(this.cam.dist * Math.exp(e.deltaY * 0.0012), 1.9, 190);
      else this.gnd.fov = clamp(this.gnd.fov + e.deltaY * 0.03, 28, 78);
    }, { passive: false });
  }

  resize() {
    const w = this.clientWidth, h = this.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.camS.aspect = this.camG.aspect = w / h;
    this.camS.updateProjectionMatrix(); this.camG.updateProjectionMatrix();
  }

  geom() {
    const p = this.p, eps = p.tilt * D2R;
    const lam = (p.day - 80) / 365.2422 * Math.PI * 2;
    const dec = Math.asin(Math.sin(eps) * Math.sin(lam));
    const th = lam + Math.PI / 2;
    return { eps, lam, dec, th };
  }

  loop = () => {
    if (this._stop) return;
    requestAnimationFrame(this.loop);
    const THREE = this.THREE, p = this.p, g = this.geom();
    const A = new THREE.Vector3(Math.sin(g.eps), Math.cos(g.eps), 0);
    const e1 = new THREE.Vector3(0, 0, 1);
    const e2 = new THREE.Vector3().crossVectors(A, e1);
    const earthPos = new THREE.Vector3(Math.cos(g.th) * ORB, 0, Math.sin(g.th) * ORB);
    const S = earthPos.clone().negate().normalize();
    const psiNoon = Math.atan2(S.dot(e2), S.dot(e1));
    const psi = psiNoon - LON0 * D2R + (p.hour - 12) * 15 * D2R;

    const zAx = new THREE.Vector3().crossVectors(e1, A);
    this.earthGroup.matrix.makeBasis(e1, A, zAx).setPosition(earthPos);
    this.earthGroup.matrixWorldNeedsUpdate = true;
    this.spin.rotation.y = psi;
    this.earthU.sunDir.value.copy(S);
    const gvis = p.grat > 0.5;
    this.spin.children.forEach(c => { if (c.type === 'LineSegments') c.visible = gvis; });
    this.tropics.visible = this.polar.visible = gvis;
    this.equator.visible = gvis;
    const sl = clamp(p.starlv, 0, 1);
    this.stars.material.color.setRGB(0.36 * sl + 0.02, 0.39 * sl + 0.02, 0.44 * sl + 0.03);

    // latitude / tropic rings follow inputs
    const phi = p.lat * D2R;
    this.latRing.scale.set(Math.cos(phi) * 1.006, 1, Math.cos(phi) * 1.006);
    this.latRing.position.y = Math.sin(phi);
    if (this._lat !== p.tilt) {
      this._lat = p.tilt;
      this.tropics.clear(); this.polar.clear();
      const mk = (latDeg, color, op) => {
        const r = Math.cos(latDeg * D2R), pts = [];
        for (let i = 0; i <= 128; i++) { const a = i / 128 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(latDeg * D2R), -Math.sin(a) * r)); }
        const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: op }));
        l.scale.setScalar(1.006); return l;
      };
      if (p.tilt > 0.2) {
        this.tropics.add(mk(p.tilt, 0xffc98a, 0.32), mk(-p.tilt, 0xffc98a, 0.32));
        this.polar.add(mk(90 - p.tilt, 0x9fd0ff, 0.24), mk(-(90 - p.tilt), 0x9fd0ff, 0.24));
      }
    }
    const obs = A.clone().multiplyScalar(Math.sin(phi))
      .add(e1.clone().multiplyScalar(Math.cos(phi) * Math.cos(psi + LON0 * D2R)))
      .add(e2.clone().multiplyScalar(Math.cos(phi) * Math.sin(psi + LON0 * D2R)));
    this.observer.position.copy(this.spin.worldToLocal(earthPos.clone().add(obs.clone().multiplyScalar(1.0))));
    this.observer.lookAt(this.spin.worldToLocal(earthPos.clone().add(obs.clone().multiplyScalar(2.2))));
    this.observer.rotateX(Math.PI / 2);

    this.subsolar.position.copy(earthPos).add(S.clone().multiplyScalar(1.005));
    this.subsolar.lookAt(0, 0, 0);

    if (p.view === 'space') {
      this.space.visible = true; this.ground.visible = false;
      this._lastView = 'space';
      const t = smooth(14, 62, this.cam.dist);
      const target = earthPos.clone().multiplyScalar(1 - t);
      const d = this.cam.dist;
      const cp = new THREE.Vector3(
        Math.cos(this.cam.el) * Math.cos(this.cam.az), Math.sin(this.cam.el), Math.cos(this.cam.el) * Math.sin(this.cam.az)
      ).multiplyScalar(d).add(target);
      this.camS.position.lerp(cp, 0.25);
      const right = new THREE.Vector3().subVectors(this.camS.position, target).cross(new THREE.Vector3(0, 1, 0)).normalize();
      this.camS.lookAt(target.clone().add(right.multiplyScalar(-d * 0.17)));
      const fade = smooth(9, 26, d);
      this.orbit.material.opacity = 0.30 * fade;
      this.marks.children.forEach(c => { c.material.opacity = 0.9 * fade; c.material.transparent = true; });
      this.stars.position.set(0, 0, 0);
      this.renderer.render(this.scene, this.camS);
    } else {
      this.space.visible = false; this.ground.visible = true;
      if (this._lastView !== 'ground') { this._lastView = 'ground'; this._userLook = false; }
      const dec = g.dec, H = (p.hour - 12) * 15 * D2R;
      const alt = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
      const azS = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
      const azN = azS + Math.PI;
      const dir = new THREE.Vector3(Math.sin(azN) * Math.cos(alt), Math.sin(alt), -Math.cos(azN) * Math.cos(alt));
      this.gsun.position.copy(dir).multiplyScalar(700);
      this.gsunHalo.position.copy(this.gsun.position);
      const aDeg = alt / D2R;
      const t1 = smooth(-9, 4, aDeg), t2 = smooth(1, 15, aDeg);
      const zen = mix3(mix3([0.008, 0.014, 0.035], [0.055, 0.09, 0.22], t1), [0.10, 0.28, 0.62], t2);
      const hor = mix3(mix3([0.03, 0.045, 0.09], [0.85, 0.42, 0.22], t1), [0.60, 0.72, 0.86], t2);
      this.skyU.zenith.value.setRGB(...zen);
      this.skyU.horizon.value.setRGB(...hor);
      this.skyU.sunTint.value.setRGB(...mix3([0.25, 0.16, 0.10], [1.0, 0.80, 0.55], t1));
      this.skyU.alpha.value = clamp(0.22 + t1 * 0.78, 0, 1);
      this.skyU.sunDir.value.copy(dir);
      this.gsun.material.color.setRGB(...mix3([1.0, 0.55, 0.32], [1.0, 0.96, 0.87], t2));
      this.gsunHalo.material.opacity = 0.35 + 0.6 * t1;
      const gb = 0.05 + 0.13 * Math.max(Math.sin(alt), 0);
      this.groundMat.color.setRGB(gb * 0.86, gb * 0.92, gb);
      this.bandMat.color.setRGB(...mix3([0.10, 0.13, 0.22], hor, 0.85));
      this.bandMat.opacity = 0.34 + 0.3 * t1;
      this.horizonLine.material.opacity = 0.42 - 0.16 * t2;
      this.grids.forEach(g => { g.material.opacity = 0.2 - 0.08 * t2; });
      if (!this._userLook) {
        this.gnd.yaw = azN;
        this.gnd.pitch = clamp(aDeg * 0.42, 6, 34) * D2R;
        this.gnd.fov = clamp(58 + Math.max(aDeg, 0) * 0.6, 58, 100);
      }
      if (this._pd !== `${p.day}|${p.lat}|${p.tilt}`) {
        this._pd = `${p.day}|${p.lat}|${p.tilt}`;
        const up = [], dn = [];
        for (let i = 0; i <= 144; i++) {
          const hh = i / 144 * 24, Hh = (hh - 12) * 15 * D2R;
          const a = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(Hh));
          const as = Math.atan2(Math.sin(Hh), Math.cos(Hh) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)) + Math.PI;
          const v = new THREE.Vector3(Math.sin(as) * Math.cos(a), Math.sin(a), -Math.cos(as) * Math.cos(a)).multiplyScalar(700);
          (a >= 0 ? up : dn).push(v);
        }
        this.pathUp.geometry.dispose(); this.pathDn.geometry.dispose();
        this.pathUp.geometry = new THREE.BufferGeometry().setFromPoints(up.length ? up : [new THREE.Vector3()]);
        this.pathDn.geometry = new THREE.BufferGeometry().setFromPoints(dn.length ? dn : [new THREE.Vector3()]);
        this.pathDn.computeLineDistances();
      }
      const cd = new THREE.Vector3(Math.sin(this.gnd.yaw) * Math.cos(this.gnd.pitch), Math.sin(this.gnd.pitch), -Math.cos(this.gnd.yaw) * Math.cos(this.gnd.pitch));
      this.camG.fov += (this.gnd.fov - this.camG.fov) * 0.2;
      this.camG.updateProjectionMatrix();
      this.camG.lookAt(this.camG.position.clone().add(cd));
      this.renderer.render(this.scene, this.camG);
    }
  };
}
if (!customElements.get('seasons-stage')) customElements.define('seasons-stage', SeasonsStage);
