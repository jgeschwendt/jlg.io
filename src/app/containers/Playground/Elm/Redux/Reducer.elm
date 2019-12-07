port module Reducer exposing (Model, Msg, encode, init, initModel, subscriptions, update)

import Json.Decode as Decode
import Json.Encode as Encode
import Redux



-- ACTIONS


type Msg
    = NoOp
    | Increment IncrementPayload
    | Decrement


type alias Model =
    { value : Int
    , count : Int
    , conversations : List Conversation
    }


type alias Conversation =
    { id : Int
    }


type alias IncrementPayload =
    { amount : Int
    }



-- ACTION CREATORS


port increment : (IncrementPayload -> msg) -> Sub msg


port decrement : (Decode.Value -> msg) -> Sub msg



-- ACTION CREATOR BINDINGS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ decrement <| always Decrement
        , increment Increment
        ]



-- STATE


initModel : Model
initModel =
    { count = 0
    , value = 0
    , conversations = []
    }


init : Model -> ( Model, Cmd Msg )
init model =
    ( { count = model.count
      , value = 0
      , conversations =
            [ { id = 1 }
            , { id = 2 }
            ]
      }
    , Cmd.none
    )


encode : Model -> Encode.Value
encode { value, count, conversations } =
    Encode.object
        [ ( "value", Encode.int value )
        , ( "count", Encode.int count )
        , ( "conversations", Encode.list encodeConversation conversations )
        ]


encodeConversation : Conversation -> Encode.Value
encodeConversation { id } =
    Encode.object
        [ ( "id", Encode.int id )
        ]



-- list <| List.map string planJson.triggers
-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update action model =
    case action of
        Increment payload ->
            let
                value =
                    payload.amount + model.value
            in
            ( { model | value = value }, Cmd.none )

        Decrement ->
            ( { model | value = model.value - model.count }, Cmd.none )

        NoOp ->
            ( model, Cmd.none )


maybe : (a -> Encode.Value) -> Maybe a -> Encode.Value
maybe encoder value =
    case value of
        Nothing ->
            Encode.null

        Just val ->
            encoder val


type alias ProgramSettings =
    { logLevel : String
    , mode : String
    }
