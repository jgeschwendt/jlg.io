// The fluid sim read as dark water: ink plus pressure form a height field, the ink's
// density ramps the body from deep blue to violet, and a modest glint off the surface
// slope sits on top. Every lit term is gated on that slope, so an untouched state
// texture renders exactly black.

#import bevy_sprite::mesh2d_vertex_output::VertexOutput

@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> tint: vec4<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(1) var fluid: texture_2d<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(2) var fluid_sampler: sampler;

const BODY_GAIN: f32 = 1.4;
// uv y runs down, so a negative y component puts the light above the surface.
const LIGHT_DIR: vec3<f32> = vec3<f32>(-0.45, -0.55, 0.7);
// Pressure spreads past the ink, which is what draws the bow wave ahead of a stroke.
const PRESSURE_WEIGHT: f32 = 0.25;
const PURPLE: vec3<f32> = vec3<f32>(0.34, 0.11, 0.52);
const RAMP_GAIN: f32 = 1.5;
const SHEEN_GAIN: f32 = 0.12;
const SHININESS: f32 = 56.0;
const SLOPE_EPS: f32 = 0.02;
const SLOPE_GAIN: f32 = 4.0;
const SPECULAR_COLOR: vec3<f32> = vec3<f32>(0.75, 0.72, 1.0);
// The glint peaks where the surface slope passes 1/SLOPE_GAIN of the half-vector's
// tilt, which lands on a stroke's thin outer tail — far enough down the ink profile
// that density cannot be used to damp it, so the level is set here instead.
const SPECULAR_GAIN: f32 = 0.4;

fn height(uv: vec2<f32>) -> f32 {
    let s = textureSample(fluid, fluid_sampler, uv);
    return s.w + PRESSURE_WEIGHT * s.z;
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    // Ease off toward the center so the type sits on near-black.
    let clearing = smoothstep(0.0, 1.4, length((in.uv - vec2<f32>(0.5, 0.5)) * 2.0));
    let readable = 0.35 + 0.65 * clearing;

    let texel = 1.0 / vec2<f32>(textureDimensions(fluid));
    let me = textureSample(fluid, fluid_sampler, in.uv);
    let h = height(in.uv);
    let dhdx = height(in.uv + vec2<f32>(texel.x, 0.0)) - height(in.uv - vec2<f32>(texel.x, 0.0));
    let dhdy = height(in.uv + vec2<f32>(0.0, texel.y)) - height(in.uv - vec2<f32>(0.0, texel.y));

    // Flat water still faces the light head-on, so the highlight has to be masked by
    // slope rather than left to fall off on its own — otherwise idle is not black.
    let disturbed = smoothstep(0.0, SLOPE_EPS, length(vec2<f32>(dhdx, dhdy)));

    let n = normalize(vec3<f32>(-dhdx * SLOPE_GAIN, -dhdy * SLOPE_GAIN, 1.0));
    let half_dir = normalize(normalize(LIGHT_DIR) + vec3<f32>(0.0, 0.0, 1.0));
    let specular = pow(max(dot(n, half_dir), 0.0), SHININESS) * SPECULAR_GAIN;
    let sheen = length(me.xy) * SHEEN_GAIN;

    // The ramp only picks a hue; height still scales it, so idle stays black.
    let body = mix(tint.rgb, PURPLE, saturate(me.w * RAMP_GAIN));
    let water = body * max(h, 0.0) * BODY_GAIN
        + SPECULAR_COLOR * (specular + sheen) * disturbed;

    return vec4<f32>(water * readable, 1.0);
}
