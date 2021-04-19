# i poorly document variables used in picrew image makers #
hello imma try to document parts of an undocumented thing
## window.__NUXT__.state ##
important stuff is stored here.
### config ###
Object.
#### h
Integer. height in pixels
#### w
Integer. width in pixels
#### title
String. title of image maker
#### pList
Array. Presumably short for "parts list" or something like that.  
Each item is an object with these attributes:
##### pId
Integer.
##### pNm
String. presumably part name
##### colorCnt
Integer. Number of colours available.
##### cpId
String. I think it's important in a later object
##### lyrs
Array. Usually has 1 item. Item used in a later layers object.
##### items
Array. Each item is an object. The only seemingly relevant attribute is `itmId`, an integer.
##### defItmId
Integer. Appears to have the same value as the first entry in `items`?
##### other stuff
like we got `x` and `y` and probably relevant stuff
#### cpList
Object. Attributes appear to follow the format of `cpId`.  
Every attribute is an array (with length seemingly the available number of colours) of objects, each with these attributes:
##### cId
Integer. Probably useful later.
##### cd
String. Appears to be a hexadecimal representation of the colour in RGB format, prefixed by `#`.
#### lyrList
Object. Attributes appear to correspond to `lyrs` from earlier, and values appear to be integers indicating layering order.
### commonImages ###
Object. Attributes appear to correspond to values of `itmId` from earlier.  
Each attribute is an object. Their attributes appear to correspond to values of `lyrs`'s children from earlier.  
Each attribute is an object. Their attributes appear to correspond to values of `cId` from earlier.  
Contains the attribute `url`, a string. Is a relative URL to the location of an image. Base URL is presumably `config.baseUrl`.

## also localStorage ##
### picrew.visit.data.<number>
`<number>` is `state.imageMakerId`
JSON string. When parsed, is an object with `pId`s as keys
