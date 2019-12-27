module Main exposing (main)

import CatGif
    exposing
        ( CatGifModel
        , encodeCatGif
        , getRandomCatGif
        , updateCatGifRequest
        , updateCatGifResponseErr
        , updateCatGifResponseOk
        )
import Json.Encode as Encode
import Platform exposing (worker)
import Ports
    exposing
        ( doRequest
        , increment
        , reset
        , store
        )
import Time
import Types exposing (Msg(..))


type alias Flags =
    { catGifUrl : Maybe String
    , count : Int
    , frame : Int
    }


type alias Model =
    { catGif : CatGifModel
    , count : Int
    , frame : Int
    }


setup : Flags -> Model
setup flags =
    { count = flags.count
    , frame = flags.frame
    , catGif =
        { data = flags.catGifUrl
        , loading = False
        , error = Nothing
        }
    }


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( setup flags, Cmd.none )


encodeModel : Model -> Encode.Value
encodeModel model =
    Encode.object
        [ ( "catGif", encodeCatGif model.catGif )
        , ( "count", Encode.int model.count )
        , ( "frame", Encode.int model.frame )
        ]


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ doRequest (\_ -> CatGifRequest)
        , increment (\amount -> Increment amount)
        , reset (\_ -> Reset)
        , Time.every (60 / 1000) NextFrame
        ]


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        ( state, cmd ) =
            case msg of
                CatGifRequest ->
                    ( { model | catGif = model.catGif |> updateCatGifRequest }, getRandomCatGif )

                CatGifResponse response ->
                    case response of
                        Ok url ->
                            ( { model | catGif = model.catGif |> updateCatGifResponseOk url }, Cmd.none )

                        Err err ->
                            ( { model | catGif = model.catGif |> updateCatGifResponseErr err }, Cmd.none )

                Increment amount ->
                    ( { model | count = model.count + amount }, Cmd.none )

                NextFrame _ ->
                    ( { model | frame = model.frame + 1 }, Cmd.none )

                Reset ->
                    ( { model | count = 0, frame = 0 }, Cmd.none )
    in
    ( state, Cmd.batch [ store (encodeModel state), cmd ] )


main : Program Flags Model Msg
main =
    worker
        { init = \flags -> init flags
        , subscriptions = subscriptions
        , update = update
        }
