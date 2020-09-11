module Helpers exposing (encodeHttpError, maybe)

import Http
import Json.Encode as Encode


encodeHttpError : Maybe Http.Error -> Maybe String
encodeHttpError error =
    case error of
        _ ->
            Nothing


maybe : (a -> Encode.Value) -> Maybe a -> Encode.Value
maybe encoder =
    Maybe.map encoder >> Maybe.withDefault Encode.null
