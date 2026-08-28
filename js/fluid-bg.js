// Interactive fluid background (WebGL smoke/dye simulation)
// Ported from alkemymarket.com's hero background (a react-three-fiber build of
// Pavel Dobryakov's MIT-licensed WebGL fluid simulation) to dependency-free JS.
// Renders into #fluid-bg: a fixed, pointer-events-none, transparent canvas that
// reacts to mouse/touch anywhere and fades out as the page scrolls.
(function () {
  'use strict';

  var config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1024,
    DENSITY_DISSIPATION: 0.97,
    VELOCITY_DISSIPATION: 0.98,
    PRESSURE: 0.8,
    PRESSURE_ITERATIONS: 20,
    CURL: 30,
    SPLAT_RADIUS: 0.25,
    SPLAT_FORCE: 3000,
    BLOOM_ITERATIONS: 6,
    BLOOM_RESOLUTION: 256,
    BLOOM_INTENSITY: 0.25,
    BLOOM_THRESHOLD: 0.9,
    BLOOM_SOFT_KNEE: 0.4,
    SUNRAYS_RESOLUTION: 196,
    SUNRAYS_WEIGHT: 0.5,
    AUTO_SPLAT_INTERVAL: 2.5
  };

  // Apple Keynote / macOS ambient palette (Apple Blue, Indigo, Purple, Cyan, Emerald)
  var PALETTE = [
    { r: 0.04, g: 0.52, b: 1.00 }, // Apple Blue
    { r: 0.37, g: 0.36, b: 0.90 }, // Apple Indigo
    { r: 0.75, g: 0.35, b: 0.95 }, // Apple Purple
    { r: 0.39, g: 0.82, b: 1.00 }, // Apple Cyan
    { r: 0.20, g: 0.84, b: 0.29 }, // Apple Emerald
    { r: 0.00, g: 0.44, b: 0.89 }  // Apple Sapphire
  ];

  var baseVertexShader = [
    'precision highp float;',
    'attribute vec2 position;',
    'varying vec2 vUv;',
    'varying vec2 vL;',
    'varying vec2 vR;',
    'varying vec2 vT;',
    'varying vec2 vB;',
    'uniform vec2 texelSize;',
    'void main() {',
    '  vUv = position.xy * 0.5 + 0.5;',
    '  vL = vUv - vec2(texelSize.x, 0.0);',
    '  vR = vUv + vec2(texelSize.x, 0.0);',
    '  vT = vUv + vec2(0.0, texelSize.y);',
    '  vB = vUv - vec2(0.0, texelSize.y);',
    '  gl_Position = vec4(position.xy, 0.0, 1.0);',
    '}'
  ].join('\n');

  var blurVertexShader = [
    'precision highp float;',
    'attribute vec2 position;',
    'varying vec2 vUv;',
    'varying vec2 vL;',
    'varying vec2 vR;',
    'uniform vec2 texelSize;',
    'void main() {',
    '  vUv = position.xy * 0.5 + 0.5;',
    '  float offset = 1.33333333;',
    '  vL = vUv - texelSize * offset;',
    '  vR = vUv + texelSize * offset;',
    '  gl_Position = vec4(position.xy, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FP = 'precision highp float;\nprecision highp sampler2D;\n';

  var curlShader = FP + [
    'varying vec2 vL;',
    'varying vec2 vR;',
    'varying vec2 vT;',
    'varying vec2 vB;',
    'uniform sampler2D uVelocity;',
    'void main() {',
    '  float L = texture2D(uVelocity, vL).y;',
    '  float R = texture2D(uVelocity, vR).y;',
    '  float T = texture2D(uVelocity, vT).x;',
    '  float B = texture2D(uVelocity, vB).x;',
    '  float vorticity = R - L - T + B;',
    '  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);',
    '}'
  ].join('\n');

  var vorticityShader = FP + [
    'varying vec2 vUv;',
    'varying vec2 vL;',
    'varying vec2 vR;',
    'varying vec2 vT;',
    'varying vec2 vB;',
    'uniform sampler2D uVelocity;',
    'uniform sampler2D uCurl;',
    'uniform float curl;',
    'uniform float dt;',
    'void main() {',
    '  float L = texture2D(uCurl, vL).x;',
    '  float R = texture2D(uCurl, vR).x;',
    '  float T = texture2D(uCurl, vT).x;',
    '  float B = texture2D(uCurl, vB).x;',
    '  float C = texture2D(uCurl, vUv).x;',
    '  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));',
    '  force /= length(force) + 0.0001;',
    '  force *= curl * C;',
    '  force.y *= -1.0;',
    '  vec2 velocity = texture2D(uVelocity, vUv).xy;',
    '  velocity += force * dt;',
    '  velocity = min(max(velocity, -1000.0), 1000.0);',
    '  gl_FragColor = vec4(velocity, 0.0, 1.0);',
    '}'
  ].join('\n');

  var divergenceShader = FP + [
    'varying vec2 vUv;',
    'varying vec2 vL;',
    'varying vec2 vR;',
    'varying vec2 vT;',
    'varying vec2 vB;',
    'uniform sampler2D uVelocity;',
    'void main() {',
    '  float L = texture2D(uVelocity, vL).x;',
    '  float R = texture2D(uVelocity, vR).x;',
    '  float T = texture2D(uVelocity, vT).y;',
    '  float B = texture2D(uVelocity, vB).y;',
    '  vec2 C = texture2D(uVelocity, vUv).xy;',
    '  if (vL.x < 0.0) { L = -C.x; }',
    '  if (vR.x > 1.0) { R = -C.x; }',
    '  if (vT.y > 1.0) { T = -C.y; }',
    '  if (vB.y < 0.0) { B = -C.y; }',
    '  float div = 0.5 * (R - L + T - B);',
    '  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);',
    '}'
  ].join('\n');

  var pressureShader = FP + [
    'varying vec2 vUv;',
    'varying vec2 vL;',
    'varying vec2 vR;',
    'varying vec2 vT;',
    'varying vec2 vB;',
    'uniform sampler2D uPressure;',
    'uniform sampler2D uDivergence;',
    'void main() {',
    '  float L = texture2D(uPressure, vL).x;',
    '  float R = texture2D(uPressure, vR).x;',
    '  float T = texture2D(uPressure, vT).x;',
    '  float B = texture2D(uPressure, vB).x;',
    '  float divergence = texture2D(uDivergence, vUv).x;',
    '  float pressure = (L + R + B + T - divergence) * 0.25;',
    '  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);',
    '}'
  ].join('\n');

  var gradientSubtractShader = FP + [
    'varying vec2 vUv;',
    'varying vec2 vL;',
    'varying vec2 vR;',
    'varying vec2 vT;',
    'varying vec2 vB;',
    'uniform sampler2D uPressure;',
    'uniform sampler2D uVelocity;',
    'void main() {',
    '  float L = texture2D(uPressure, vL).x;',
    '  float R = texture2D(uPressure, vR).x;',
    '  float T = texture2D(uPressure, vT).x;',
    '  float B = texture2D(uPressure, vB).x;',
    '  vec2 velocity = texture2D(uVelocity, vUv).xy;',
    '  velocity.xy -= vec2(R - L, T - B);',
    '  gl_FragColor = vec4(velocity, 0.0, 1.0);',
    '}'
  ].join('\n');

  var advectionShader = FP + [
    'varying vec2 vUv;',
    'uniform sampler2D uVelocity;',
    'uniform sampler2D uSource;',
    'uniform vec2 texelSize;',
    'uniform float dt;',
    'uniform float dissipation;',
    'void main() {',
    '  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;',
    '  vec4 result = texture2D(uSource, coord);',
    '  float decay = 1.0 + dissipation * dt;',
    '  gl_FragColor = result / decay;',
    '}'
  ].join('\n');

  var splatShader = FP + [
    'varying vec2 vUv;',
    'uniform sampler2D uTarget;',
    'uniform float aspectRatio;',
    'uniform vec3 color;',
    'uniform vec2 point;',
    'uniform float radius;',
    'void main() {',
    '  vec2 p = vUv - point.xy;',
    '  p.x *= aspectRatio;',
    '  vec3 splat = exp(-dot(p, p) / radius) * color;',
    '  vec3 base = texture2D(uTarget, vUv).xyz;',
    '  gl_FragColor = vec4(base + splat, 1.0);',
    '}'
  ].join('\n');

  var copyShader = FP + [
    'varying vec2 vUv;',
    'uniform sampler2D uTexture;',
    'void main() { gl_FragColor = texture2D(uTexture, vUv); }'
  ].join('\n');

  var clearShader = FP + [
    'varying vec2 vUv;',
    'uniform sampler2D uTexture;',
    'uniform float value;',
    'void main() { gl_FragColor = value * texture2D(uTexture, vUv); }'
  ].join('\n');

  var bloomPrefilterShader = FP + [
    'varying vec2 vUv;',
    'uniform sampler2D uTexture;',
    'uniform vec3 curve;',
    'uniform float threshold;',
    'void main() {',
    '  vec3 c = texture2D(uTexture, vUv).rgb;',
    '  float br = max(c.r, max(c.g, c.b));',
    '  float rq = clamp(br - curve.x, 0.0, curve.y);',
    '  rq = curve.z * rq * rq;',
    '  c *= max(rq, br - threshold) / max(br, 0.0001);',
    '  gl_FragColor = vec4(c, 0.0);',
    '}'
  ].join('\n');

  var bloomBlurShader = FP + [
    'varying vec2 vL;',
    'varying vec2 vR;',
    'varying vec2 vT;',
    'varying vec2 vB;',
    'uniform sampler2D uTexture;',
    'void main() {',
    '  vec4 sum = vec4(0.0);',
    '  sum += texture2D(uTexture, vL);',
    '  sum += texture2D(uTexture, vR);',
    '  sum += texture2D(uTexture, vT);',
    '  sum += texture2D(uTexture, vB);',
    '  sum *= 0.25;',
    '  gl_FragColor = sum;',
    '}'
  ].join('\n');

  var bloomFinalShader = FP + [
    'varying vec2 vL;',
    'varying vec2 vR;',
    'varying vec2 vT;',
    'varying vec2 vB;',
    'uniform sampler2D uTexture;',
    'uniform float intensity;',
    'void main() {',
    '  vec4 sum = vec4(0.0);',
    '  sum += texture2D(uTexture, vL);',
    '  sum += texture2D(uTexture, vR);',
    '  sum += texture2D(uTexture, vT);',
    '  sum += texture2D(uTexture, vB);',
    '  sum *= 0.25;',
    '  gl_FragColor = sum * intensity;',
    '}'
  ].join('\n');

  var sunraysMaskShader = FP + [
    'varying vec2 vUv;',
    'uniform sampler2D uTexture;',
    'void main() {',
    '  vec4 c = texture2D(uTexture, vUv);',
    '  float br = max(c.r, max(c.g, c.b));',
    '  c.a = 1.0 - min(max(br * 20.0, 0.0), 0.8);',
    '  gl_FragColor = c;',
    '}'
  ].join('\n');

  var sunraysShader = FP + [
    'varying vec2 vUv;',
    'uniform sampler2D uTexture;',
    'uniform float weight;',
    '#define ITERATIONS 16',
    'void main() {',
    '  float Density = 0.3;',
    '  float Decay = 0.95;',
    '  float Exposure = 0.7;',
    '  vec2 coord = vUv;',
    '  vec2 dir = vUv - 0.5;',
    '  dir *= 1.0 / float(ITERATIONS) * Density;',
    '  float illuminationDecay = 1.0;',
    '  float color = texture2D(uTexture, vUv).a;',
    '  for (int i = 0; i < ITERATIONS; i++) {',
    '    coord -= dir;',
    '    float col = texture2D(uTexture, coord).a;',
    '    color += col * illuminationDecay * weight;',
    '    illuminationDecay *= Decay;',
    '  }',
    '  gl_FragColor = vec4(color * Exposure, 0.0, 0.0, 1.0);',
    '}'
  ].join('\n');

  var blurShader = FP + [
    'varying vec2 vUv;',
    'varying vec2 vL;',
    'varying vec2 vR;',
    'uniform sampler2D uTexture;',
    'void main() {',
    '  vec4 sum = texture2D(uTexture, vUv) * 0.29411764;',
    '  sum += texture2D(uTexture, vL) * 0.35294117;',
    '  sum += texture2D(uTexture, vR) * 0.35294117;',
    '  gl_FragColor = sum;',
    '}'
  ].join('\n');

  var displayShader = FP + [
    '#define SHADING',
    '#define BLOOM',
    '#define SUNRAYS',
    'varying vec2 vUv;',
    'varying vec2 vL;',
    'varying vec2 vR;',
    'varying vec2 vT;',
    'varying vec2 vB;',
    'uniform sampler2D uTexture;',
    'uniform sampler2D uBloom;',
    'uniform sampler2D uSunrays;',
    'uniform vec2 texelSize;',
    'vec3 linearToGamma(vec3 color) {',
    '  color = max(color, vec3(0));',
    '  return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));',
    '}',
    'void main() {',
    '  vec3 c = texture2D(uTexture, vUv).rgb;',
    '  #ifdef SHADING',
    '    vec3 lc = texture2D(uTexture, vL).rgb;',
    '    vec3 rc = texture2D(uTexture, vR).rgb;',
    '    vec3 tc = texture2D(uTexture, vT).rgb;',
    '    vec3 bc = texture2D(uTexture, vB).rgb;',
    '    float dx = length(rc) - length(lc);',
    '    float dy = length(tc) - length(bc);',
    '    vec3 n = normalize(vec3(dx, dy, length(texelSize)));',
    '    vec3 l = vec3(0.0, 0.0, 1.0);',
    '    float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);',
    '    c *= diffuse;',
    '  #endif',
    '  #ifdef BLOOM',
    '    vec3 bloom = texture2D(uBloom, vUv).rgb;',
    '  #endif',
    '  #ifdef SUNRAYS',
    '    float sunrays = texture2D(uSunrays, vUv).r;',
    '    c *= sunrays;',
    '    #ifdef BLOOM',
    '      bloom *= sunrays;',
    '    #endif',
    '  #endif',
    '  #ifdef BLOOM',
    '    bloom = linearToGamma(bloom);',
    '    c += bloom;',
    '  #endif',
    '  float a = max(c.r, max(c.g, c.b));',
    '  gl_FragColor = vec4(c, a);',
    '}'
  ].join('\n');

  function hsvToRgb(h) {
    var i = Math.floor(6 * h);
    var f = 6 * h - i;
    var q = 1 - f;
    var t = f;
    switch (i % 6) {
      case 0: return { r: 1, g: t, b: 0 };
      case 1: return { r: q, g: 1, b: 0 };
      case 2: return { r: 0, g: 1, b: t };
      case 3: return { r: 0, g: q, b: 1 };
      case 4: return { r: t, g: 0, b: 1 };
      default: return { r: 1, g: 0, b: q };
    }
  }

  function generateColor() {
    var c;
    if (Math.random() < 0.7) {
      c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    } else {
      c = hsvToRgb(Math.random());
    }
    return { r: 0.15 * c.r, g: 0.15 * c.g, b: 0.15 * c.b };
  }

  function getResolution(resolution, w, h) {
    var aspect = w / h;
    if (aspect < 1) aspect = 1 / aspect;
    var min = Math.round(resolution);
    var max = Math.round(resolution * aspect);
    return w > h ? { width: max, height: min } : { width: min, height: max };
  }

  function init() {
    var container = document.getElementById('fluid-bg');
    if (!container) return;

    if (/Mobi|Android/i.test(navigator.userAgent)) {
      config.DYE_RESOLUTION = 512;
    }

    var canvas = document.createElement('canvas');
    var ctxParams = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
      premultipliedAlpha: true
    };
    var gl = canvas.getContext('webgl2', ctxParams);
    var isWebGL2 = !!gl;
    if (!gl) {
      gl = canvas.getContext('webgl', ctxParams) ||
           canvas.getContext('experimental-webgl', ctxParams);
    }
    if (!gl) return;

    var halfFloatType, supportLinearFiltering;
    if (isWebGL2) {
      var cb = gl.getExtension('EXT_color_buffer_float');
      var cbh = gl.getExtension('EXT_color_buffer_half_float');
      if (!cb && !cbh) return;
      halfFloatType = gl.HALF_FLOAT;
      supportLinearFiltering = true;
    } else {
      var hf = gl.getExtension('OES_texture_half_float');
      if (!hf) return;
      halfFloatType = hf.HALF_FLOAT_OES;
      supportLinearFiltering = !!gl.getExtension('OES_texture_half_float_linear');
    }
    var internalFormat = isWebGL2 ? gl.RGBA16F : gl.RGBA;

    // verify half-float render targets actually work on this device
    function renderTargetWorks() {
      var tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, gl.RGBA, halfFloatType, null);
      var fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.deleteFramebuffer(fb);
      gl.deleteTexture(tex);
      return ok;
    }
    if (!renderTargetWorks()) return;

    container.appendChild(canvas);

    function compileShader(type, source) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || 'shader compile failed');
      }
      return shader;
    }

    function createProgram(vertexSource, fragmentSource) {
      var program = gl.createProgram();
      gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexSource));
      gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || 'program link failed');
      }
      var uniforms = {};
      var count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < count; i++) {
        var name = gl.getActiveUniform(program, i).name;
        uniforms[name] = gl.getUniformLocation(program, name);
      }
      return { program: program, uniforms: uniforms };
    }

    var programs;
    try {
      programs = {
        curl: createProgram(baseVertexShader, curlShader),
        vorticity: createProgram(baseVertexShader, vorticityShader),
        divergence: createProgram(baseVertexShader, divergenceShader),
        pressure: createProgram(baseVertexShader, pressureShader),
        gradientSubtract: createProgram(baseVertexShader, gradientSubtractShader),
        advection: createProgram(baseVertexShader, advectionShader),
        splat: createProgram(baseVertexShader, splatShader),
        copy: createProgram(baseVertexShader, copyShader),
        clear: createProgram(baseVertexShader, clearShader),
        bloomPrefilter: createProgram(baseVertexShader, bloomPrefilterShader),
        bloomBlur: createProgram(baseVertexShader, bloomBlurShader),
        bloomFinal: createProgram(baseVertexShader, bloomFinalShader),
        sunraysMask: createProgram(baseVertexShader, sunraysMaskShader),
        sunrays: createProgram(baseVertexShader, sunraysShader),
        blur: createProgram(blurVertexShader, blurShader),
        display: createProgram(baseVertexShader, displayShader)
      };
    } catch (e) {
      return;
    }

    // fullscreen quad shared by every pass (attribute location bound per program)
    var quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

    var currentProgram = null;
    function useProgram(p) {
      if (currentProgram !== p) {
        gl.useProgram(p.program);
        currentProgram = p;
      }
      return p.uniforms;
    }

    function blit(p, target) {
      if (target == null) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      var loc = gl.getAttribLocation(p.program, 'position');
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    function createFBO(w, h, linear) {
      var filter = linear && supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
      var texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, gl.RGBA, halfFloatType, null);
      var fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return {
        texture: texture,
        fbo: fbo,
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        attach: function (id) {
          gl.activeTexture(gl.TEXTURE0 + id);
          gl.bindTexture(gl.TEXTURE_2D, this.texture);
          return id;
        },
        dispose: function () {
          gl.deleteTexture(this.texture);
          gl.deleteFramebuffer(this.fbo);
        }
      };
    }

    function createDoubleFBO(w, h, linear) {
      var fbo1 = createFBO(w, h, linear);
      var fbo2 = createFBO(w, h, linear);
      return {
        get read() { return fbo1; },
        get write() { return fbo2; },
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        swap: function () {
          var t = fbo1;
          fbo1 = fbo2;
          fbo2 = t;
        },
        dispose: function () {
          fbo1.dispose();
          fbo2.dispose();
        }
      };
    }

    var velocity, dye, pressure, curl, divergence, bloom, bloomFBOs, sunrays, sunraysTemp;
    var canvasW = 0, canvasH = 0;
    var autoSplatTimer = 0;

    function initBloomFBOs(w, h) {
      var res = getResolution(config.BLOOM_RESOLUTION, w, h);
      bloom = createFBO(res.width, res.height, true);
      bloomFBOs = [];
      for (var i = 0; i < config.BLOOM_ITERATIONS; i++) {
        var bw = res.width >> (i + 1);
        var bh = res.height >> (i + 1);
        if (bw < 2 || bh < 2) break;
        bloomFBOs.push(createFBO(bw, bh, true));
      }
    }

    function initSunraysFBOs(w, h) {
      var res = getResolution(config.SUNRAYS_RESOLUTION, w, h);
      sunrays = createFBO(res.width, res.height, true);
      sunraysTemp = createFBO(res.width, res.height, true);
    }

    function initFBOs(w, h) {
      canvasW = w;
      canvasH = h;
      var simRes = getResolution(config.SIM_RESOLUTION, w, h);
      var dyeRes = getResolution(config.DYE_RESOLUTION, w, h);
      velocity = createDoubleFBO(simRes.width, simRes.height, true);
      dye = createDoubleFBO(dyeRes.width, dyeRes.height, true);
      pressure = createDoubleFBO(simRes.width, simRes.height, false);
      curl = createFBO(simRes.width, simRes.height, false);
      divergence = createFBO(simRes.width, simRes.height, false);
      initBloomFBOs(w, h);
      initSunraysFBOs(w, h);
    }

    function resizeDoubleFBO(target, w, h, linear) {
      if (target.read.width === w && target.read.height === h) return target;
      var next = createDoubleFBO(w, h, linear);
      var u = useProgram(programs.copy);
      gl.uniform1i(u.uTexture, target.read.attach(0));
      blit(programs.copy, next.read);
      target.dispose();
      return next;
    }

    function resizeFBOs(w, h) {
      if (w === canvasW && h === canvasH) return;
      canvasW = w;
      canvasH = h;
      var simRes = getResolution(config.SIM_RESOLUTION, w, h);
      var dyeRes = getResolution(config.DYE_RESOLUTION, w, h);
      velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, true);
      dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, true);
      pressure = resizeDoubleFBO(pressure, simRes.width, simRes.height, false);
      curl.dispose();
      divergence.dispose();
      curl = createFBO(simRes.width, simRes.height, false);
      divergence = createFBO(simRes.width, simRes.height, false);
      bloom.dispose();
      bloomFBOs.forEach(function (f) { f.dispose(); });
      initBloomFBOs(w, h);
      sunrays.dispose();
      sunraysTemp.dispose();
      initSunraysFBOs(w, h);
    }

    function splat(x, y, dx, dy, color) {
      var aspect = canvasW / canvasH;
      var radius = config.SPLAT_RADIUS / 100;
      if (aspect > 1) radius *= aspect;
      var u = useProgram(programs.splat);
      gl.uniform1i(u.uTarget, velocity.read.attach(0));
      gl.uniform1f(u.aspectRatio, aspect);
      gl.uniform2f(u.point, x, y);
      gl.uniform3f(u.color, dx, dy, 0);
      gl.uniform1f(u.radius, radius);
      blit(programs.splat, velocity.write);
      velocity.swap();
      gl.uniform1i(u.uTarget, dye.read.attach(0));
      gl.uniform3f(u.color, color.r, color.g, color.b);
      blit(programs.splat, dye.write);
      dye.swap();
    }

    function multipleSplats(amount) {
      for (var i = 0; i < amount; i++) {
        var color = generateColor();
        color.r *= 10;
        color.g *= 10;
        color.b *= 10;
        var x = Math.random();
        var y = Math.random();
        var dx = 1000 * (Math.random() - 0.5);
        var dy = 1000 * (Math.random() - 0.5);
        splat(x, y, dx, dy, color);
      }
    }

    function step(dt) {
      gl.disable(gl.BLEND);
      var u;

      u = useProgram(programs.curl);
      gl.uniform2f(u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));
      blit(programs.curl, curl);

      u = useProgram(programs.vorticity);
      gl.uniform2f(u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(u.uCurl, curl.attach(1));
      gl.uniform1f(u.curl, config.CURL);
      gl.uniform1f(u.dt, dt);
      blit(programs.vorticity, velocity.write);
      velocity.swap();

      u = useProgram(programs.divergence);
      gl.uniform2f(u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));
      blit(programs.divergence, divergence);

      u = useProgram(programs.clear);
      gl.uniform2f(u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(u.uTexture, pressure.read.attach(0));
      gl.uniform1f(u.value, config.PRESSURE);
      blit(programs.clear, pressure.write);
      pressure.swap();

      u = useProgram(programs.pressure);
      gl.uniform2f(u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(u.uDivergence, divergence.attach(0));
      for (var i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(u.uPressure, pressure.read.attach(1));
        blit(programs.pressure, pressure.write);
        pressure.swap();
      }

      u = useProgram(programs.gradientSubtract);
      gl.uniform2f(u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(u.uPressure, pressure.read.attach(0));
      gl.uniform1i(u.uVelocity, velocity.read.attach(1));
      blit(programs.gradientSubtract, velocity.write);
      velocity.swap();

      u = useProgram(programs.advection);
      gl.uniform2f(u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(u.uSource, velocity.read.attach(0));
      gl.uniform1f(u.dt, dt);
      gl.uniform1f(u.dissipation, config.VELOCITY_DISSIPATION);
      blit(programs.advection, velocity.write);
      velocity.swap();

      gl.uniform1i(u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(u.uSource, dye.read.attach(1));
      gl.uniform1f(u.dissipation, config.DENSITY_DISSIPATION);
      blit(programs.advection, dye.write);
      dye.swap();
    }

    function applyBloom() {
      if (bloomFBOs.length < 2) return;
      gl.disable(gl.BLEND);
      var knee = config.BLOOM_THRESHOLD * config.BLOOM_SOFT_KNEE + 0.0001;
      var curve0 = config.BLOOM_THRESHOLD - knee;
      var u = useProgram(programs.bloomPrefilter);
      gl.uniform3f(u.curve, curve0, 2 * knee, 0.25 / knee);
      gl.uniform1f(u.threshold, config.BLOOM_THRESHOLD);
      gl.uniform1i(u.uTexture, dye.read.attach(0));
      blit(programs.bloomPrefilter, bloom);

      var last = bloom;
      u = useProgram(programs.bloomBlur);
      for (var i = 0; i < bloomFBOs.length; i++) {
        var dest = bloomFBOs[i];
        gl.uniform2f(u.texelSize, last.texelSizeX, last.texelSizeY);
        gl.uniform1i(u.uTexture, last.attach(0));
        blit(programs.bloomBlur, dest);
        last = dest;
      }

      gl.blendFunc(gl.ONE, gl.ONE);
      gl.enable(gl.BLEND);
      for (var j = bloomFBOs.length - 2; j >= 0; j--) {
        var target = bloomFBOs[j];
        gl.uniform2f(u.texelSize, last.texelSizeX, last.texelSizeY);
        gl.uniform1i(u.uTexture, last.attach(0));
        blit(programs.bloomBlur, target);
        last = target;
      }
      gl.disable(gl.BLEND);

      u = useProgram(programs.bloomFinal);
      gl.uniform2f(u.texelSize, last.texelSizeX, last.texelSizeY);
      gl.uniform1i(u.uTexture, last.attach(0));
      gl.uniform1f(u.intensity, config.BLOOM_INTENSITY);
      blit(programs.bloomFinal, bloom);
    }

    function applySunrays() {
      gl.disable(gl.BLEND);
      var u = useProgram(programs.sunraysMask);
      gl.uniform1i(u.uTexture, dye.read.attach(0));
      blit(programs.sunraysMask, dye.write);

      u = useProgram(programs.sunrays);
      gl.uniform1f(u.weight, config.SUNRAYS_WEIGHT);
      gl.uniform1i(u.uTexture, dye.write.attach(0));
      blit(programs.sunrays, sunrays);

      u = useProgram(programs.blur);
      gl.uniform2f(u.texelSize, sunrays.texelSizeX, 0);
      gl.uniform1i(u.uTexture, sunrays.attach(0));
      blit(programs.blur, sunraysTemp);
      gl.uniform2f(u.texelSize, 0, sunrays.texelSizeY);
      gl.uniform1i(u.uTexture, sunraysTemp.attach(0));
      blit(programs.blur, sunrays);
    }

    function render() {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      var u = useProgram(programs.display);
      gl.uniform2f(u.texelSize, 1 / canvas.width, 1 / canvas.height);
      gl.uniform1i(u.uTexture, dye.read.attach(0));
      gl.uniform1i(u.uBloom, bloom.attach(1));
      gl.uniform1i(u.uSunrays, sunrays.attach(2));
      blit(programs.display, null);
      gl.disable(gl.BLEND);
    }

    var pointer = {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      moved: false,
      color: generateColor()
    };

    window.addEventListener('mousemove', function (e) {
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
      pointer.x = e.clientX / window.innerWidth;
      pointer.y = 1 - e.clientY / window.innerHeight;
      pointer.moved = true;
      pointer.color = generateColor();
    }, { passive: true });

    window.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      if (!t) return;
      pointer.prevX = t.clientX / window.innerWidth;
      pointer.prevY = 1 - t.clientY / window.innerHeight;
      pointer.x = pointer.prevX;
      pointer.y = pointer.prevY;
      pointer.moved = true;
      pointer.color = generateColor();
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      var t = e.touches[0];
      if (!t) return;
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
      pointer.x = t.clientX / window.innerWidth;
      pointer.y = 1 - t.clientY / window.innerHeight;
      pointer.moved = true;
      pointer.color = generateColor();
    }, { passive: true });

    // Maintain constant ambient brightness throughout the entire page (no darkening on scroll)
    container.style.opacity = '0.9';

    function sizeCanvas() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.floor(container.clientWidth * dpr));
      var h = Math.max(1, Math.floor(container.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        return true;
      }
      return false;
    }

    sizeCanvas();
    initFBOs(canvas.width, canvas.height);
    multipleSplats(Math.floor(15 * Math.random()) + 8);

    window.addEventListener('resize', function () {
      if (sizeCanvas()) resizeFBOs(canvas.width, canvas.height);
    });

    var lastTime = performance.now();
    function frame(now) {
      var dt = Math.min((now - lastTime) / 1000, 0.016666);
      lastTime = now;

      autoSplatTimer += dt;
      if (autoSplatTimer > config.AUTO_SPLAT_INTERVAL) {
        autoSplatTimer = 0;
        multipleSplats(Math.floor(3 * Math.random()) + 1);
      }

      if (pointer.moved) {
        pointer.moved = false;
        var aspect = canvasW / canvasH;
        var dx = pointer.x - pointer.prevX;
        var dy = pointer.y - pointer.prevY;
        if (aspect < 1) dx *= aspect;
        if (aspect > 1) dy /= aspect;
        splat(pointer.x, pointer.y, dx * config.SPLAT_FORCE, dy * config.SPLAT_FORCE, pointer.color);
      }

      step(dt);
      applyBloom();
      applySunrays();
      render();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Performance: don't pay for the WebGL sim on small screens or when the
  // user prefers reduced motion. The layered background image already covers
  // the hero visually, so the fluid canvas is an enhancement, not a necessity.
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var smallScreen = window.matchMedia('(max-width: 768px)');
  var booted = false;

  // Lazy-init: boot the sim only after first paint / idle, so hero text and
  // fonts win the race for the main thread. Also skips the work entirely when
  // the hero has already been scrolled past before the listener fires.
  function bootWhenIdle() {
    if (booted) return;
    booted = true;
    init();
  }

  function capsLifted() {
    return !reducedMotion.matches && !smallScreen.matches;
  }

  function scheduleBoot() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(bootWhenIdle, { timeout: 2000 });
    } else {
      setTimeout(bootWhenIdle, 250);
    }
  }

  if (capsLifted()) {
    scheduleBoot();
  } else {
    // Re-boot if the visitor rotates to a desktop viewport or disables
    // reduced motion while the page is open.
    var caps = [reducedMotion, smallScreen];
    function onCapChange() {
      if (capsLifted()) {
        caps.forEach(function (m) {
          if (m.removeEventListener) m.removeEventListener('change', onCapChange);
          else if (m.removeListener) m.removeListener(onCapChange);
        });
        scheduleBoot();
      }
    }
    caps.forEach(function (m) {
      if (m.addEventListener) m.addEventListener('change', onCapChange);
      else if (m.addListener) m.addListener(onCapChange);
    });
  }
})();
