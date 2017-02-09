String.prototype.contains    = function ( obj, doNotUseCase ) {
  if ( obj instanceof Array ) {
    var contains = false;
    var that     = doNotUseCase ? this.toLowerCase() : this;
    obj.map( function ( item ) {
      if ( that.indexOf( doNotUseCase ? item.toLowerCase() : item ) >= 0 ) contains = true;
    } );
    return contains;
  }

  if ( doNotUseCase )
    return this.toLowerCase().indexOf( obj.toLowerCase() ) >= 0;
  else
    return this.indexOf( obj ) >= 0;
};
String.prototype.paddingLeft = function ( paddingString ) {
  return String( paddingString + this ).slice( -paddingString.length );
};
Number.prototype.formatBytes = function ( decimals ) {
  if ( this == 0 ) return "0 Byte";

  var k     = 1024;
  var dm    = decimals || 3;
  var sizes = [ "Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB" ];
  var i     = Math.floor( Math.log( this ) / Math.log( k ) );
  return parseFloat( (this / Math.pow( k, i )).toFixed( dm ) ) + " " + sizes[ i ];
};
Array.prototype.sortByKey    = function ( key, desc ) {
  if ( !desc ) desc = false;
  return this.sort( function ( a, b ) {
    var x = a[ key ];
    var y = b[ key ];
    if ( desc )
      return ((x < y) ? -1 : ((x > y) ? 1 : 0)) * -1;
    else
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  } );
};

var styles = {};
{
  var codes = {
    reset        : 0,
    bold         : 1,
    dim          : 2,
    italic       : 3,
    underline    : 4,
    inverse      : 7,
    hidden       : 8,
    strikethrough: 9,
    black        : 30,
    red          : 31,
    green        : 32,
    yellow       : 33,
    blue         : 34,
    magenta      : 35,
    cyan         : 36,
    white        : 37,
    gray         : 90,
    grey         : 90,
    bgBlack      : 40,
    bgRed        : 41,
    bgGreen      : 42,
    bgYellow     : 43,
    bgBlue       : 44,
    bgMagenta    : 45,
    bgCyan       : 46,
    bgWhite      : 47
  };

  Object.keys( codes ).forEach( function ( key ) {
    styles[ key ] = "\u001b[" + codes[ key ] + "m";
  } );
}

function Start () {
  var exec          = require( "child_process" ).exec;
  var coffeeProcess = exec( "tcpdump -nt" );
  var data          = {};
  var lastLineFeed;
  var lineArray;

  coffeeProcess.stdout.on( "data", function ( buff ) {
    lastLineFeed = buff.toString( "utf-8", 0 ).lastIndexOf( "\n" );

    if ( lastLineFeed > -1 ) {
      lineArray = buff.toString( "utf-8", 0 ).slice( 0, lastLineFeed ).split( "\n" );

      for ( var i = 0; i < lineArray.length; i++ ) {
        var line = lineArray[ i ];

        if ( line.substring( 0, 2 ) == "IP" ) {
          var parts = line.split( " " );
          var IN    = parts[ 1 ].split( "." );
          IN.pop();

          var OUT = parts[ 3 ].replace( /:$/, "" ).split( "." );
          OUT.pop();

          var INIP  = IN.join( "." );
          var OUTIP = OUT.join( "." );

          var length = 0;
          if ( line.contains( "length" ) ) length = parseInt( parts.pop() );

          var key = INIP + OUTIP;
          if ( !data.hasOwnProperty( key ) ) {
            data[ key ] = {
              in    : INIP.paddingLeft( "                " ),
              out   : OUTIP.paddingLeft( "                " ),
              length: length
            };
          } else {
            data[ key ].length += length;
          }
        }
      }
    }
  } );

  var writeData = function () {
    process.stdout.write( "\x1B[2J\x1B[0f" );
    var keys = Object.keys( data );
    var len  = keys.length;

    var arr = [];
    for ( var i = 0; i < len; i++ ) {
      var k = keys[ i ];
      arr.push( data[ k ] );
    }
    arr = arr.sortByKey( "length", true );
    for ( var m = 0; m < arr.length; m++ ) {
      var c = arr[ m ];
      console.log( styles.dim, styles.green, c.in, styles.reset, styles.cyan, c.out, styles.red, c.length.formatBytes( 2 ), styles.reset );
    }

    setTimeout( writeData, 5000 );
  };

  setTimeout( writeData, 1000 );
}

Start();