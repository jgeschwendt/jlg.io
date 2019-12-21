port module Main exposing (main)

import Http
import Json.Decode as Decode
import Platform exposing (worker)
import Time

type alias Model =
    { count : Int
    , frame : Int
    , openSlot1: Int
    , openSlot2: Int
    }

port increment : (Int -> msg) -> Sub msg

port reset : ({} -> msg) -> Sub msg

port store : Model -> Cmd msg

port doRequest : ({} -> msg) -> Sub msg

type Msg
    = NoOp
    | CatGifRequest
    | CatGifResponse (Result Http.Error String)
    | Increment Int
    | Reset
    | NextFrame Time.Posix


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( flags, Cmd.none )


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
        ( data, cmd ) =
            case msg of
                CatGifRequest ->
                    ({ model | openSlot1 = model.openSlot1 + 1 }, getRandomCatGif)

                CatGifResponse catGif ->
                    ({ model | openSlot2 = model.openSlot2 + 1 }, Cmd.none)

                Increment amount ->
                    ( { model | count = model.count + amount }, Cmd.none )

                Reset ->
                    ( { model | count = 0, frame = 0 }, Cmd.none )

                NextFrame _ ->
                    ( { model | frame = model.frame + 1 }, Cmd.none )

                NoOp ->
                    ( model, Cmd.none )

    in
    ( data, Cmd.batch [store data, cmd])


type alias Flags =
    { count : Int
    , frame : Int
    , openSlot1: Int
    , openSlot2: Int
    }


main : Program Flags Model Msg
main =
    worker
        { init = init
        , subscriptions = subscriptions
        , update = update
        }

getRandomCatGif : Cmd Msg
getRandomCatGif =
  Http.get
    { url = "https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=cat"
    , expect = Http.expectJson CatGifResponse gifDecoder
    }


gifDecoder : Decode.Decoder String
gifDecoder =
  Decode.field "data" (Decode.field "image_url" Decode.string)
