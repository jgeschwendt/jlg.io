//! Fullscreen animated shader background rendered into the `#bevy-bg` canvas.

mod pointer;

use bevy::{
    asset::embedded_asset,
    camera::{CompositingSpace, RenderTarget, visibility::RenderLayers},
    image::ImageSampler,
    prelude::*,
    render::{
        render_resource::{AsBindGroup, ShaderType, TextureFormat},
        view::Msaa,
    },
    shader::ShaderRef,
    sprite_render::{Material2d, Material2dPlugin},
};

use crate::pointer::{Pointer, PointerPlugin};

const SIM_HEIGHT: u32 = 270;
const SIM_LAYER: usize = 1;
const SIM_WIDTH: u32 = 480;

#[derive(Asset, AsBindGroup, Clone, TypePath)]
struct BackgroundMaterial {
    #[uniform(0)]
    tint: LinearRgba,
    #[texture(1)]
    #[sampler(2)]
    fluid: Handle<Image>,
}

impl Material2d for BackgroundMaterial {
    fn fragment_shader() -> ShaderRef {
        "embedded://background/background.wgsl".into()
    }
}

#[derive(Asset, AsBindGroup, Clone, TypePath)]
struct SimMaterial {
    #[uniform(0)]
    params: SimParams,
    #[texture(1)]
    state: Handle<Image>,
}

impl Material2d for SimMaterial {
    fn fragment_shader() -> ShaderRef {
        "embedded://background/sim.wgsl".into()
    }
}

// Field order is the uniform's memory layout, not alphabetical.
#[derive(Clone, Default, ShaderType)]
struct SimParams {
    mouse: Vec4,
    resolution: Vec2,
    mouse_active: f32,
}

#[derive(Component)]
struct Backdrop;

#[derive(Component)]
struct SimCamera;

/// The ping-pong pair (`write` indexes the texture the sim camera targets), the two
/// materials that reference it, and the history the sim shader needs each frame.
#[derive(Resource)]
struct SimState {
    backdrop: Handle<BackgroundMaterial>,
    images: [Handle<Image>; 2],
    pointer: Option<Vec2>,
    quad: Handle<SimMaterial>,
    write: usize,
}

struct BackgroundPlugin;

impl Plugin for BackgroundPlugin {
    fn build(&self, app: &mut App) {
        embedded_asset!(app, "background.wgsl");
        embedded_asset!(app, "sim.wgsl");
        app.insert_resource(ClearColor(Color::BLACK))
            .add_plugins((
                Material2dPlugin::<BackgroundMaterial>::default(),
                Material2dPlugin::<SimMaterial>::default(),
                PointerPlugin,
            ))
            .add_systems(Startup, setup)
            .add_systems(Update, (advance_sim, fit_to_window));
    }
}

fn main() {
    App::new()
        .add_plugins((
            DefaultPlugins.set(WindowPlugin {
                primary_window: Some(Window {
                    canvas: Some("#bevy-bg".into()),
                    fit_canvas_to_parent: true,
                    prevent_default_event_handling: false,
                    ..default()
                }),
                ..default()
            }),
            BackgroundPlugin,
        ))
        .run();
}

fn sim_resolution() -> Vec2 {
    Vec2::new(SIM_WIDTH as f32, SIM_HEIGHT as f32)
}

// Rgba16Float carries signed velocity and pressure; WebGL2 renders to it through
// EXT_color_buffer_float and filters half-float linearly in core.
fn sim_target(images: &mut Assets<Image>) -> Handle<Image> {
    let mut image =
        Image::new_target_texture(SIM_WIDTH, SIM_HEIGHT, TextureFormat::Rgba16Float, None);
    image.sampler = ImageSampler::linear();
    images.add(image)
}

fn setup(
    mut backgrounds: ResMut<Assets<BackgroundMaterial>>,
    mut commands: Commands,
    mut images: ResMut<Assets<Image>>,
    mut meshes: ResMut<Assets<Mesh>>,
    mut sims: ResMut<Assets<SimMaterial>>,
) {
    let targets = [sim_target(&mut images), sim_target(&mut images)];
    let backdrop = backgrounds.add(BackgroundMaterial {
        fluid: targets[1].clone(),
        // Deep blue anchor for thin wash; the shader ramps it toward violet as the
        // ink thickens.
        tint: LinearRgba::new(0.06, 0.10, 0.34, 1.0),
    });
    let quad = sims.add(SimMaterial {
        params: SimParams {
            resolution: sim_resolution(),
            ..default()
        },
        state: targets[0].clone(),
    });

    commands.spawn(Camera2d);
    commands.spawn((
        Backdrop,
        Mesh2d(meshes.add(Rectangle::default())),
        MeshMaterial2d(backdrop.clone()),
    ));

    // WebGL2 has no compute shaders, so the fluid steps as a fragment ping-pong: an
    // offscreen camera on its own render layer redraws the whole state texture.
    commands.spawn((
        Camera2d,
        Camera {
            order: -1,
            ..default()
        },
        // Srgb compositing would swap the intermediate target for Rgba8Unorm and gamma
        // the blit, clamping away the signed velocity and pressure the state carries.
        CompositingSpace::Linear,
        Msaa::Off,
        RenderLayers::layer(SIM_LAYER),
        RenderTarget::Image(targets[1].clone().into()),
        SimCamera,
    ));
    commands.spawn((
        Mesh2d(meshes.add(Rectangle::default())),
        MeshMaterial2d(quad.clone()),
        RenderLayers::layer(SIM_LAYER),
        Transform::from_scale(sim_resolution().extend(1.0)),
    ));

    commands.insert_resource(SimState {
        backdrop,
        images: targets,
        pointer: None,
        quad,
        write: 1,
    });
}

// Swap the ping-pong pair and refresh the sim uniforms. The backdrop samples the
// texture written this frame; the sim camera (order -1) has already filled it.
fn advance_sim(
    mut backgrounds: ResMut<Assets<BackgroundMaterial>>,
    mut sims: ResMut<Assets<SimMaterial>>,
    mut state: ResMut<SimState>,
    mut target: Single<&mut RenderTarget, With<SimCamera>>,
    pointer: Res<Pointer>,
    window: Single<&Window>,
) {
    state.write = 1 - state.write;
    let read = state.images[1 - state.write].clone();
    let write = state.images[state.write].clone();

    // Client CSS pixels are y-down and so is the sim's texel space, so this is a
    // plain rescale. A pointer that just woke up has no meaningful previous position.
    let viewport = Vec2::new(window.width(), window.height()).max(Vec2::ONE);
    let current = pointer.position * sim_resolution() / viewport;
    let prior = state.pointer.unwrap_or(current);
    state.pointer = pointer.active.then_some(current);

    if let Some(mut material) = sims.get_mut(&state.quad) {
        material.params.mouse = Vec4::new(current.x, current.y, prior.x, prior.y);
        material.params.mouse_active = f32::from(pointer.active);
        material.state = read;
    }
    if let Some(mut material) = backgrounds.get_mut(&state.backdrop) {
        material.fluid = write.clone();
    }
    **target = RenderTarget::Image(write.into());
}

// Keep the unit quad stretched across the window; Camera2d maps 1 world unit to 1 px.
// The 2px overscan hides logical/physical rounding slivers at the viewport edges.
fn fit_to_window(window: Single<&Window>, mut backdrops: Query<&mut Transform, With<Backdrop>>) {
    let scale = Vec3::new(window.width() + 2.0, window.height() + 2.0, 1.0);
    for mut transform in &mut backdrops {
        if transform.scale != scale {
            transform.scale = scale;
        }
    }
}
