module Types exposing (Msg(..))

import Http
import Time


type Msg
    = CatGifRequest
    | CatGifResponse (Result Http.Error String)
    | Increment Int
    | Reset
    | NextFrame Time.Posix
