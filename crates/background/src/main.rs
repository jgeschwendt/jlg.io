//! Fullscreen animated shader background rendered into the `#bevy-bg` canvas.

use bevy::{
    asset::embedded_asset,
    prelude::*,
    render::render_resource::AsBindGroup,
    shader::ShaderRef,
    sprite_render::{Material2d, Material2dPlugin},
};

#[derive(Asset, AsBindGroup, Clone, TypePath)]
struct BackgroundMaterial {
    #[uniform(0)]
    tint: LinearRgba,
}

impl Material2d for BackgroundMaterial {
    fn fragment_shader() -> ShaderRef {
        "embedded://background/background.wgsl".into()
    }
}

#[derive(Component)]
struct Backdrop;

struct BackgroundPlugin;

impl Plugin for BackgroundPlugin {
    fn build(&self, app: &mut App) {
        embedded_asset!(app, "background.wgsl");
        app.insert_resource(ClearColor(Color::BLACK))
            .add_plugins(Material2dPlugin::<BackgroundMaterial>::default())
            .add_systems(Startup, setup)
            .add_systems(Update, fit_to_window);
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

fn setup(
    mut commands: Commands,
    mut materials: ResMut<Assets<BackgroundMaterial>>,
    mut meshes: ResMut<Assets<Mesh>>,
) {
    commands.spawn(Camera2d);
    commands.spawn((
        Backdrop,
        Mesh2d(meshes.add(Rectangle::default())),
        MeshMaterial2d(materials.add(BackgroundMaterial {
            // Dim slate blue; the shader scales it well below full intensity.
            tint: LinearRgba::new(0.16, 0.20, 0.28, 1.0),
        })),
    ));
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
