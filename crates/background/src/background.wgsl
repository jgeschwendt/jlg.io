// Domain-warped value-noise fog, dim enough that the white foreground type carries.

#import bevy_sprite::mesh2d_vertex_output::VertexOutput
#import bevy_sprite::mesh2d_view_bindings::globals

@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> tint: vec4<f32>;

fn hash(p: vec2<f32>) -> f32 {
    return fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453123);
}

fn vnoise(p: vec2<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash(i), hash(i + vec2<f32>(1.0, 0.0)), u.x),
        mix(hash(i + vec2<f32>(0.0, 1.0)), hash(i + vec2<f32>(1.0, 1.0)), u.x),
        u.y,
    );
}

fn fbm(p0: vec2<f32>) -> f32 {
    var p = p0;
    var amplitude = 0.5;
    var value = 0.0;
    for (var i = 0; i < 4; i = i + 1) {
        value = value + amplitude * vnoise(p);
        p = p * 2.03 + vec2<f32>(11.3, 7.7);
        amplitude = amplitude * 0.5;
    }
    return value;
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let t = globals.time * 0.02;
    let p = in.world_position.xy / 720.0;

    // First fbm pass drifts, second swirls against it.
    let q = vec2<f32>(
        fbm(p + vec2<f32>(t, -0.3 * t)),
        fbm(p + vec2<f32>(2.7 - 0.4 * t, 1.3 + 0.25 * t)),
    );
    let fog = fbm(p + 1.6 * q);

    // Ease off toward the center so the type sits on near-black.
    let clearing = smoothstep(0.0, 1.4, length((in.uv - vec2<f32>(0.5, 0.5)) * 2.0));

    return vec4<f32>(tint.rgb * fog * fog * (0.35 + 0.65 * clearing), 1.0);
}
