port module Ports exposing (doRequest, increment, reset, store)

import Json.Encode as Encode


port increment : (Int -> msg) -> Sub msg


port reset : ({} -> msg) -> Sub msg


port store : Encode.Value -> Cmd msg


port doRequest : ({} -> msg) -> Sub msg
