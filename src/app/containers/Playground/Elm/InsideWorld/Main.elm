module Main exposing (main)

import CatGif
    exposing
        ( getRandomCatGif
        , updateCatGifRequest
        , updateCatGifResponseErr
        , updateCatGifResponseOk
        )
import Platform exposing (worker)
import Ports
    exposing
        ( Model
        , doRequest
        , increment
        , reset
        , store
        )
import Time
import Types exposing (Msg(..))


init : Model -> ( Model, Cmd Msg )
init model =
    ( model, Cmd.none )


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
    ( state, Cmd.batch [ store state, cmd ] )


main : Program Model Model Msg
main =
    worker
        { init = init
        , update = update
        , subscriptions = subscriptions
        }
