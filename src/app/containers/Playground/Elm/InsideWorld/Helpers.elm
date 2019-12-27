module Helpers exposing (encodeHttpError, maybe)

import Http
import Json.Encode as Encode


encodeHttpError : Http.Error -> Encode.Value
encodeHttpError error =
    case error of
        Http.BadStatus status ->
            Encode.object
                [ ( "msg", Encode.string ("Bad Status: " ++ String.fromInt status) )
                ]

        Http.NetworkError ->
            Encode.object
                [ ( "msg", Encode.string "Network Error" )
                ]

        _ ->
            Encode.object
                [ ( "msg", Encode.string "Unhandled" )
                ]


maybe : (a -> Encode.Value) -> Maybe a -> Encode.Value
maybe encoder =
    Maybe.map encoder >> Maybe.withDefault Encode.null
