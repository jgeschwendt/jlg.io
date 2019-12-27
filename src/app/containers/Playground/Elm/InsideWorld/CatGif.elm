module CatGif exposing
    ( CatGifModel
    , encodeCatGif
    , getRandomCatGif
    , updateCatGifRequest
    , updateCatGifResponseErr
    , updateCatGifResponseOk
    )

import Helpers exposing (encodeHttpError, maybe)
import Http
import Json.Decode as Decode
import Json.Encode as Encode
import Types exposing (Msg(..))


type alias CatGifModel =
    { data : Maybe String
    , error : Maybe Http.Error
    , loading : Bool
    }


encodeCatGif : CatGifModel -> Encode.Value
encodeCatGif model =
    Encode.object
        [ ( "data", maybe Encode.string model.data )
        , ( "error", maybe encodeHttpError model.error )
        , ( "loading", Encode.bool model.loading )
        ]


getRandomCatGif : Cmd Msg
getRandomCatGif =
    Http.get
        { url = "https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=cat"
        , expect = Http.expectJson CatGifResponse gifDecoder
        }


gifDecoder : Decode.Decoder String
gifDecoder =
    Decode.field "data" (Decode.field "image_url" Decode.string)


setDataOnCatGif : Maybe String -> CatGifModel -> CatGifModel
setDataOnCatGif data model =
    { model | data = data }


setErrorOnCatGif : Maybe Http.Error -> CatGifModel -> CatGifModel
setErrorOnCatGif error model =
    { model | error = error }


setLoadingOnCatGif : Bool -> CatGifModel -> CatGifModel
setLoadingOnCatGif loading model =
    { model | loading = loading }


updateCatGifRequest : CatGifModel -> CatGifModel
updateCatGifRequest model =
    model
        |> setErrorOnCatGif Nothing
        |> setLoadingOnCatGif True


updateCatGifResponseErr : Http.Error -> CatGifModel -> CatGifModel
updateCatGifResponseErr err model =
    model
        |> setErrorOnCatGif (Just err)
        |> setLoadingOnCatGif False


updateCatGifResponseOk : String -> CatGifModel -> CatGifModel
updateCatGifResponseOk url model =
    model
        |> setDataOnCatGif (Just url)
        |> setLoadingOnCatGif False
