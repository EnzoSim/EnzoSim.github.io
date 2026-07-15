import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2 uPointer;
  uniform vec2 uResolution;
  uniform float uTime;

  varying vec2 vUv;

  float hash21(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32);
    return fract(point.x * point.y);
  }

  float noise21(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);

    float a = hash21(cell);
    float b = hash21(cell + vec2(1.0, 0.0));
    float c = hash21(cell + vec2(0.0, 1.0));
    float d = hash21(cell + vec2(1.0, 1.0));

    return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);

    for (int octave = 0; octave < 3; octave++) {
      value += amplitude * noise21(point);
      point = rotation * point * 2.03 + 9.17;
      amplitude *= 0.5;
    }

    return value;
  }

  float ellipseField(vec2 point, vec2 center, vec2 radius, float phase) {
    vec2 local = (point - center) / radius;
    float angle = atan(local.y, local.x);
    float contour = length(local);
    float edgeMotion = 0.085 * sin(angle * 3.0 + uTime * 0.31 + phase)
      + 0.045 * sin(angle * 5.0 - uTime * 0.23 + phase * 1.7);

    return 1.0 - smoothstep(0.63 + edgeMotion, 1.17 + edgeMotion, contour);
  }

  float surface(vec2 point) {
    float aspect = clamp(uResolution.x / max(uResolution.y, 1.0), 0.46, 2.2);
    float horizontalRadius = mix(0.47, 0.78, smoothstep(0.5, 1.7, aspect));
    vec2 pointerDrift = uPointer * vec2(aspect, 1.0) * 0.038;
    vec2 slowDrift = vec2(
      0.09 * sin(uTime * 0.24),
      0.07 * cos(uTime * 0.19)
    );
    vec2 warp = vec2(
      fbm(point * 1.35 + vec2(uTime * 0.055, -uTime * 0.038)),
      fbm(point * 1.35 + vec2(8.2 - uTime * 0.042, 3.4 + uTime * 0.050))
    ) - 0.5;

    point += warp * 0.18;

    float left = ellipseField(
      point,
      vec2(-0.73 * aspect, 0.34) + slowDrift + pointerDrift,
      vec2(horizontalRadius, 0.62),
      0.3
    );
    float right = ellipseField(
      point,
      vec2(0.76 * aspect, 0.43) - slowDrift * 0.72 - pointerDrift * 0.55,
      vec2(horizontalRadius * 1.04, 0.68),
      2.1
    );
    float lower = ellipseField(
      point,
      vec2(0.48 * aspect, -0.82) + slowDrift * 0.55 + pointerDrift * 0.35,
      vec2(horizontalRadius * 1.12, 0.66),
      4.0
    );
    float mist = ellipseField(
      point,
      vec2(-0.46 * aspect, -0.72) - slowDrift * 0.42,
      vec2(horizontalRadius * 0.86, 0.54),
      5.7
    );

    return clamp(left * 0.78 + right * 0.72 + lower * 0.62 + mist * 0.34, 0.0, 1.15);
  }

  void main() {
    vec2 point = vUv * 2.0 - 1.0;
    float aspect = clamp(uResolution.x / max(uResolution.y, 1.0), 0.46, 2.2);
    point.x *= aspect;
    float height = surface(point);
    float epsilon = max(0.0024, 1.8 / max(uResolution.y, 1.0));
    float leftHeight = surface(point - vec2(epsilon, 0.0));
    float rightHeight = surface(point + vec2(epsilon, 0.0));
    float lowerHeight = surface(point - vec2(0.0, epsilon));
    float upperHeight = surface(point + vec2(0.0, epsilon));
    vec3 normal = normalize(vec3(
      (leftHeight - rightHeight) * 4.6,
      (lowerHeight - upperHeight) * 4.6,
      0.16
    ));

    vec3 paper = vec3(0.972, 0.979, 0.952);
    vec3 sage = vec3(0.535, 0.672, 0.586);
    vec3 moss = vec3(0.704, 0.768, 0.594);
    vec3 mist = vec3(0.745, 0.824, 0.769);
    vec3 lightDirection = normalize(vec3(
      -0.36 + 0.13 * sin(uTime * 0.27) + uPointer.x * 0.08,
      0.72 + 0.09 * cos(uTime * 0.21) + uPointer.y * 0.06,
      0.68
    ));
    vec3 viewDirection = vec3(0.0, 0.0, 1.0);

    float diffuse = 0.52 + 0.48 * max(dot(normal, lightDirection), 0.0);
    float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.15);
    float specular = pow(
      max(dot(reflect(-lightDirection, normal), viewDirection), 0.0),
      26.0
    );
    float volume = smoothstep(0.03, 0.92, height);
    float edge = smoothstep(0.08, 0.38, height)
      * (1.0 - smoothstep(0.72, 1.08, height));

    vec3 fieldColor = mix(sage, moss, smoothstep(-0.65, 0.82, point.y));
    fieldColor = mix(
      fieldColor,
      mist,
      smoothstep(-0.95, 0.88, point.x / aspect) * 0.48
    );

    vec3 color = mix(paper, fieldColor * diffuse, volume * 0.58);
    color += specular * 0.15;
    color += fresnel * edge * vec3(0.11, 0.14, 0.12);

    float sweepCoordinate = point.x / aspect + point.y * 0.18;
    float sweepCenter = 0.72 * sin(uTime * 0.42);
    float caustic = exp(-pow(sweepCoordinate - sweepCenter, 2.0) * 13.0) * volume;
    color += caustic * (0.025 + edge * 0.085) * vec3(0.82, 1.0, 0.88);

    vec2 focusRadius = vec2(0.55 * aspect, 0.62);
    vec2 focusPoint = point - vec2(
      0.07 * sin(uTime * 0.20),
      0.045 * cos(uTime * 0.17)
    );
    float focus = exp(-dot(focusPoint / focusRadius, focusPoint / focusRadius) * 1.48);
    color = mix(color, vec3(0.991, 0.991, 0.976), focus * 0.46);

    float veil = 0.018 * (fbm(point * 3.4 + uTime * 0.012) - 0.5);
    color += veil;

    gl_FragColor = vec4(color, 0.94);
  }
`

export function mountAmbientScene(host) {
  const hero = host.closest('.home-hero')
  const scene = new Scene()
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const geometry = new PlaneGeometry(2, 2)
  const pointer = new Vector2()
  const pointerTarget = new Vector2()
  const uniforms = {
    uPointer: { value: pointer },
    uResolution: { value: new Vector2(1, 1) },
    uTime: { value: 0 },
  }
  const material = new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    fragmentShader,
    transparent: true,
    uniforms,
    vertexShader,
  })
  const mesh = new Mesh(geometry, material)
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
    premultipliedAlpha: true,
  })

  renderer.outputColorSpace = SRGBColorSpace
  renderer.setClearColor(0xffffff, 0)
  renderer.domElement.setAttribute('aria-hidden', 'true')
  renderer.domElement.tabIndex = -1
  scene.add(mesh)
  host.appendChild(renderer.domElement)

  let animationFrame = 0
  let elapsed = 0
  let inView = true
  let lastFrame = performance.now()
  let lastPaint = 0
  let running = false
  let contextLost = false

  const resize = () => {
    const { height, width } = host.getBoundingClientRect()
    const mobile = width < 640
    const maximumDpr = mobile ? 1 : 1.25
    const quality = mobile ? 0.78 : 0.72
    const dpr = Math.max(0.68, Math.min(window.devicePixelRatio || 1, maximumDpr) * quality)

    renderer.setPixelRatio(dpr)
    renderer.setSize(Math.max(1, width), Math.max(1, height), false)
    uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height)
  }

  const render = (now) => {
    animationFrame = 0

    if (!running || contextLost) return

    const delta = Math.min((now - lastFrame) / 1000, 0.05)
    lastFrame = now
    elapsed += delta
    pointer.lerp(pointerTarget, 1 - Math.exp(-delta * 7.5))

    if (now - lastPaint >= 1000 / 30) {
      uniforms.uTime.value = elapsed
      renderer.render(scene, camera)
      lastPaint = now
    }

    animationFrame = window.requestAnimationFrame(render)
  }

  const stop = () => {
    running = false
    window.cancelAnimationFrame(animationFrame)
    animationFrame = 0
  }

  const start = () => {
    if (running || contextLost || document.hidden || !inView) return

    running = true
    lastFrame = performance.now()
    animationFrame = window.requestAnimationFrame(render)
  }

  const syncVisibility = () => {
    if (document.hidden || !inView) {
      stop()
    } else {
      start()
    }
  }

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  const onPointerMove = (event) => {
    const bounds = hero?.getBoundingClientRect()

    if (!bounds) return

    pointerTarget.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
    )
  }
  const onPointerLeave = () => pointerTarget.set(0, 0)
  const onContextLost = (event) => {
    event.preventDefault()
    contextLost = true
    stop()
    host.classList.remove('is-ready')
    hero?.removeAttribute('data-webgl-ready')
  }

  const resizeObserver = new ResizeObserver(resize)
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    syncVisibility()
  }, { rootMargin: '120px' })

  resizeObserver.observe(host)
  intersectionObserver.observe(host)
  document.addEventListener('visibilitychange', syncVisibility)
  renderer.domElement.addEventListener('webglcontextlost', onContextLost)

  if (finePointer.matches) {
    hero?.addEventListener('pointermove', onPointerMove, { passive: true })
    hero?.addEventListener('pointerleave', onPointerLeave)
  }

  resize()
  renderer.render(scene, camera)
  host.classList.add('is-ready')
  hero?.setAttribute('data-webgl-ready', 'true')
  start()

  return () => {
    stop()
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    document.removeEventListener('visibilitychange', syncVisibility)
    renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
    hero?.removeEventListener('pointermove', onPointerMove)
    hero?.removeEventListener('pointerleave', onPointerLeave)
    host.classList.remove('is-ready')
    hero?.removeAttribute('data-webgl-ready')
    geometry.dispose()
    material.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}
