port module Main exposing (main)

import Json.Decode as Decode
import Platform exposing (worker)


type alias Model =
    { count : Int
    }


port increment : (Int -> msg) -> Sub msg


port reset : ({} -> msg) -> Sub msg


port store : Model -> Cmd msg


type Msg
    = NoOp
    | Increment Int
    | Reset


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( flags, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ increment (\amount -> Increment amount)
        , reset (\_ -> Reset)
        ]


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        ( data, cmd ) =
            case msg of
                Increment amount ->
                    ( { model | count = model.count + amount }, Cmd.none )

                Reset ->
                    ( { model | count = 0 }, Cmd.none )

                NoOp ->
                    ( model, Cmd.none )
    in
    ( data, store data )


type alias Flags =
    { count : Int
    }


main : Program Flags Model Msg
main =
    worker
        { init = init
        , subscriptions = subscriptions
        , update = update
        }
