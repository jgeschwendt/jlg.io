module MineSweeperMain exposing (..)

import MineSweeper exposing (Model, Msg, encode, init, subscriptions, update)
import Redux exposing (program)


main : Program Model Model Msg
main =
    program
        { init = init
        , encode = encode
        , update = update
        , subscriptions = subscriptions
        }
