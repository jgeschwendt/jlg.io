port module Redux exposing (program)

import Debug exposing (toString)
import Json.Encode as Json
import Platform


port store : ( String, Json.Value ) -> Cmd msg


program :
    { init : flags -> ( model, Cmd msg )
    , encode : model -> Json.Value
    , update : msg -> model -> ( model, Cmd msg )
    , subscriptions : model -> Sub msg
    }
    -> Program flags model msg
program app =
    let
        reducer : action -> ( model, Cmd msg ) -> ( model, Cmd msg )
        reducer action ( message, cmd ) =
            ( message, Cmd.batch [ cmd, ( toString action, app.encode message ) |> store ] )

        reduce update msg model =
            reducer msg <| update msg model

        init flags =
            let
                ( initModel, initCmd ) =
                    app.init flags

                initReduxCmd =
                    store ( "@@elm.init", app.encode initModel )
            in
            ( initModel, Cmd.batch [ initCmd, initReduxCmd ] )
    in
    Platform.worker
        { init = init
        , update = reduce app.update
        , subscriptions = app.subscriptions
        }
