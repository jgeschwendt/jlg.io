port module MineSweeper exposing (..)

import Json.Decode as Decode
import Json.Encode as Encode


type alias Coordinate =
    { x : Int
    , y : Int
    }


type Msg
    = NoOp
    | TileLeftClick Coordinate
    | TileRightClick Coordinate



-- ACTION CREATORS


port tileRightClick : (Coordinate -> msg) -> Sub msg


port tileLeftClick : (Coordinate -> msg) -> Sub msg



-- ACTION DISPATCHERS


type alias Model =
    { value : Int
    , count : Int
    }


type alias Game =
    { hasStarted : Bool
    , hasFinished : Int
    , board : Board
    }


type alias Board =
    List BoardRow


type alias BoardRow =
    List BoardCell


type alias BoardCell =
    { data : String
    }


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ tileLeftClick TileLeftClick
        , tileRightClick TileRightClick
        ]


initModel : Model
initModel =
    { count = 0
    , value = 0
    }


init : Model -> ( Model, Cmd Msg )
init model =
    ( { count = model.count
      , value = 0
      }
    , Cmd.none
    )


encode : Model -> Encode.Value
encode { value, count } =
    Encode.object
        [ ( "value", Encode.int value )
        , ( "count", Encode.int count )
        ]


update : Msg -> Model -> ( Model, Cmd Msg )
update action model =
    case action of
        TileLeftClick coordinate ->
            let
                value =
                    coordinate.x
            in
            ( { model | value = value }, Cmd.none )

        TileRightClick coordinate ->
            ( { model | value = coordinate.x }, Cmd.none )

        NoOp ->
            ( model, Cmd.none )
