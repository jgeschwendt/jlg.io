// Wyatt's fluid (shadertoy XtGcDK) ported from compute to a fragment ping-pong:
// WebGL2 has no compute shaders, so each frame redraws the whole state texture
// from the other one. State: xy = velocity in sim px/frame, z = pressure, w = ink.
//
// Texel row 0 is the top of the screen: `@builtin(position)` and `textureLoad`
// index the same row under both WebGPU and GL (GL's bottom-up framebuffer and
// bottom-up texture conventions cancel), so DOM client coords need no y flip.

#import bevy_sprite::mesh2d_vertex_output::VertexOutput

struct SimParams {
    // (current.xy, previous.xy) in sim pixels, y-down.
    mouse: vec4<f32>,
    resolution: vec2<f32>,
    mouse_active: f32,
}

@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> params: SimParams;
@group(#{MATERIAL_BIND_GROUP}) @binding(1) var state: texture_2d<f32>;

const DAMPING: f32 = 0.95;
// The reference tuned these against a 960px-wide sim; halved for a 480px one so
// the stirring covers the same fraction of the screen.
const INJECT_FALLOFF: f32 = 15.0;
const INJECT_RADIUS: f32 = 3.0;
const INJECT_SPEED: f32 = 25.0;
const INJECT_SPEED_CAP: f32 = 10.0;
// Widens a stroke to ~3x its deposit width over five seconds at 60fps, diluting the
// peak as it goes so the glints soften instead of holding a hard edge.
const INK_BLEED: f32 = 0.1;
const PRESSURE_SCALE: f32 = 10.0;

fn segment_distance(p: vec2<f32>, a: vec2<f32>, b: vec2<f32>) -> f32 {
    let ba = b - a;
    return length(p - a - ba * clamp(dot(p - a, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0));
}

// textureLoad is undefined out of bounds; the border is zeroed below anyway.
fn load(coord: vec2<i32>) -> vec4<f32> {
    let last = vec2<i32>(params.resolution) - vec2<i32>(1);
    return textureLoad(state, clamp(coord, vec2<i32>(0), last), 0);
}

fn bilinear(u: vec2<f32>) -> vec4<f32> {
    let f = vec2<i32>(floor(u));
    let c = vec2<i32>(ceil(u));
    let fr = fract(u);

    return (1.0 - fr.x) * (1.0 - fr.y) * load(vec2<i32>(f.x, f.y))
        + (1.0 - fr.x) * fr.y * load(vec2<i32>(f.x, c.y))
        + fr.x * fr.y * load(vec2<i32>(c.x, c.y))
        + fr.x * (1.0 - fr.y) * load(vec2<i32>(c.x, f.y));
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let R = params.resolution;

    var U = floor(in.position.xy);
    var A = U + vec2<f32>(1.0, 0.0);
    var B = U + vec2<f32>(0.0, 1.0);
    var C = U + vec2<f32>(-1.0, 0.0);
    var D = U + vec2<f32>(0.0, -1.0);
    var u = bilinear(U);
    var a = bilinear(A);
    var b = bilinear(B);
    var c = bilinear(C);
    var d = bilinear(D);
    var p = vec4<f32>(0.0);
    var g = vec2<f32>(0.0);

    // Two semi-Lagrangian backtrace steps; neighbour drift accumulates divergence
    // into p while g accumulates the pressure gradient.
    for (var i = 0; i < 2; i = i + 1) {
        U = U - u.xy;
        A = A - a.xy;
        B = B - b.xy;
        C = C - c.xy;
        D = D - d.xy;

        p = p + (vec4<f32>(length(U - A), length(U - B), length(U - C), length(U - D)) - 1.0);
        g = g + vec2<f32>(a.z - c.z, b.z - d.z);

        u = bilinear(U);
        a = bilinear(A);
        b = bilinear(B);
        c = bilinear(C);
        d = bilinear(D);
    }

    var Q = u;
    Q.z = 0.25 * (a.z + b.z + c.z + d.z);
    let projected = Q.xy - g / PRESSURE_SCALE / 2.0;
    Q.x = projected.x;
    Q.y = projected.y;
    Q.z = (Q.z + (p.x + p.y + p.z + p.w) / PRESSURE_SCALE) * DAMPING;
    // Ink soaks into the same backtraced neighbours Q.z averages, and the injection
    // below runs after it, so a stroke lands crisp and only then bleeds.
    Q.w = mix(Q.w, 0.25 * (a.w + b.w + c.w + d.w), INK_BLEED);

    let m = params.mouse.xy - params.mouse.zw;
    let l = length(m);
    if params.mouse_active > 0.0 && l > 0.0 {
        let q = segment_distance(U, params.mouse.xy, params.mouse.zw);
        let stirred = mix(
            vec3<f32>(Q.x, Q.y, Q.w),
            vec3<f32>(-normalize(m) * min(l, INJECT_SPEED_CAP) / INJECT_SPEED, 1.0),
            max(0.0, INJECT_RADIUS - q) / INJECT_FALLOFF,
        );
        Q.x = stirred.x;
        Q.y = stirred.y;
        Q.w = stirred.z;
    }

    if U.x < 1.0 || U.y < 1.0 || R.x - U.x < 1.0 || R.y - U.y < 1.0 {
        Q.x = 0.0;
        Q.y = 0.0;
        Q.w = 0.0;
    }

    return Q;
}
