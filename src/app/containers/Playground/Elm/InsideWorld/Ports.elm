port module Ports exposing
    ( Model
    , doRequest
    , increment
    , reset
    , store
    )

import CatGif exposing (CatGifModel)


type alias Model =
    { catGif : CatGifModel
    , count : Int
    , frame : Int
    }


port doRequest : ({} -> msg) -> Sub msg


port increment : (Int -> msg) -> Sub msg


port reset : ({} -> msg) -> Sub msg


port store : Model -> Cmd msg
