//! Window-level pointer tracking.
//!
//! The canvas sits under `pointer-events: none`, so winit never sees a cursor on
//! wasm; the position comes from DOM listeners on the window instead.

use bevy::prelude::*;

/// Pointer position in logical window pixels, y-down from the top-left.
#[derive(Default, Resource)]
pub struct Pointer {
    pub active: bool,
    pub position: Vec2,
}

pub struct PointerPlugin;

impl Plugin for PointerPlugin {
    fn build(&self, app: &mut App) {
        platform::listen();
        app.init_resource::<Pointer>()
            .add_systems(PreUpdate, platform::sync);
    }
}

#[cfg(not(target_arch = "wasm32"))]
mod platform {
    use bevy::{prelude::*, window::CursorMoved};

    use super::Pointer;

    pub fn listen() {}

    pub fn sync(mut moves: MessageReader<CursorMoved>, mut pointer: ResMut<Pointer>) {
        let latest = moves.read().last().map(|event| event.position);

        pointer.active = latest.is_some();
        if let Some(position) = latest {
            pointer.position = position;
        }
    }
}

#[cfg(target_arch = "wasm32")]
mod platform {
    use core::sync::atomic::{AtomicBool, AtomicU32, Ordering};

    use bevy::prelude::*;
    use wasm_bindgen::{JsCast, closure::Closure};
    use web_sys::{AddEventListenerOptions, MouseEvent};

    use super::Pointer;

    // wasm is single-threaded, but statics still have to be Sync; f32 rides in its bits.
    static DOWN: AtomicBool = AtomicBool::new(false);
    static MOVES: AtomicU32 = AtomicU32::new(0);
    static X: AtomicU32 = AtomicU32::new(0);
    static Y: AtomicU32 = AtomicU32::new(0);

    pub fn listen() {
        let Some(window) = web_sys::window() else {
            return;
        };

        let options = AddEventListenerOptions::new();
        // Passive, and no preventDefault anywhere: mobile scrolling must keep working.
        options.set_passive(true);

        let down = Closure::<dyn FnMut(MouseEvent)>::new(|_: MouseEvent| {
            DOWN.store(true, Ordering::Relaxed);
        });
        let moved = Closure::<dyn FnMut(MouseEvent)>::new(|event: MouseEvent| {
            X.store((event.client_x() as f32).to_bits(), Ordering::Relaxed);
            Y.store((event.client_y() as f32).to_bits(), Ordering::Relaxed);
            MOVES.fetch_add(1, Ordering::Relaxed);
        });
        let up = Closure::<dyn FnMut(MouseEvent)>::new(|_: MouseEvent| {
            DOWN.store(false, Ordering::Relaxed);
        });

        for (event, callback) in [
            ("pointercancel", &up),
            ("pointerdown", &down),
            ("pointermove", &moved),
            ("pointerup", &up),
        ] {
            let _ = window.add_event_listener_with_callback_and_add_event_listener_options(
                event,
                callback.as_ref().unchecked_ref(),
                &options,
            );
        }

        // The listeners outlive this scope; the app owns the canvas for the session.
        down.forget();
        moved.forget();
        up.forget();
    }

    pub fn sync(mut moves: Local<u32>, mut pointer: ResMut<Pointer>) {
        let count = MOVES.load(Ordering::Relaxed);
        let moved = count != *moves;
        *moves = count;

        // Hover alone stirs; a held pointer keeps stirring so touch drags read as motion.
        pointer.active = moved || DOWN.load(Ordering::Relaxed);
        pointer.position = Vec2::new(
            f32::from_bits(X.load(Ordering::Relaxed)),
            f32::from_bits(Y.load(Ordering::Relaxed)),
        );
    }
}
