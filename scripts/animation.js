const dPx = 10; //TODO: change these to optional parameters in animateExtra
const dT = 400;
const colors = ["fd747d","fdc674","fdf674","7bf184","90ccfd","9c90fd","eb90fd"];
const defColor = "1faffe";

const rotSpeed = 1; // divide time delay by this val
const rotSmoothness = 1; // divide time delay AND shift amount, i.e. distance,
const initialPos = [12, -69]; // defines maps' initial left margin in vw

var isInStrobe = 0; // global var: defines if grayStrobe is active. Disables things if true.
var lastClickedObjId; // last continent object clicked
var lastHoverObjId;


// TODO: give max/min vals to size/width of objects
//        edit star patterns, too many bright at one time
//

/* TITLE ANIMATION PLUGIN */
/* Params
    action:     specifies animation type
    brChange:   [opt] change in font size in pixels
    brDelay:    [opt] delay in ms between expansion/deflation of text
    waveIters:  [opt] number of color shifts in wave color animation
    waveDelay:   [opt] delay in ms per color shift
    isOut:      [opt] does color wave continue out (true) or not (false)
*/
(function($) {
  $.fn.animateExtra = function(action, iters, delay, wavIsOut) {
    if (action === "breathe") {
      $(this).animate({"fontSize": "+="+dPx+"px"}, dT, function() {
        $(this).animate({"fontSize": "+="+(-1*dPx)+"px"}, dT);
        $(this).animateExtra("breathe");
      });
    }
    if (action === "clrWave") {
      var isOut = wavIsOut;
      if (iters === undefined) {iters = 8;}
      if (delay === undefined) {delay = 100;}
      if (isOut === undefined) {isOut = false;}
      $(this).click(function () {colorWaveIn($(this), 0, iters, delay, isOut);});
    }
    if (action === "grayStrobe") { // toggle grayscale filter to create kind of strobe effect
      $(this).click(function () {
        if (isInStrobe === 1) {return -1;}  // Another continent is in this animation.
        makeLastClickedGray();
        lastClickedObjId = this.id.substr(0, this.id.length-1);
        if (this.id === 'mideast') {
          lastClickedObjId = "asia";
        }
        console.log(this.id);
        isInStrobe = 1;
        grayStrobe(2*iters, delay);
      });
    }
    return this;
  };
}(jQuery));




/*                --------------------HANDLERS--------------------            */


/* WAVE ANIMATION HELPER FUNCTION */
/* works with: any size string, any number of colors, any number of iters, at any speed*/
function colorWaveIn(thisObj, curr_idx, iters, delay, isOut) {
  var i;
  var title = $(thisObj).text();
  var baseCase = iters + title.length; // Iters expended + title.length more to cycle out the colors.
  if (curr_idx === baseCase) { // Base case 1. Assume colorWaveOut done.
    console.log("Stopped at BC1");
    return -1;
  }
  else {
    if (curr_idx === iters && !isOut) {
      console.log("Stopped at BC2");
      return -1;
    }
    var titleMod = title.substring(0,curr_idx+1); //beginning substr to mod
    //when curr_idx+1 > title length, titleMod is just ALL of title, as intended
    var titleTemp = title.slice(curr_idx+1); //remaining substr of title to append to
    // Each iteration, changes the colors from the back to the front of
    // target substring (i.e. the first 2 characers in the 2nd iter),
    // appends to end start of title string, show it, repeat.
    for (i=0; i<=curr_idx; i++) {
      //console.log(curr_idx);
      var currChar = titleMod.charAt(curr_idx-i); // Start at end of target substring.
      var newColor = colors[i%colors.length];
      //console.log(currChar);
      // Only satisfied if iterations continue -> change color to default: waveOut.
      //console.log(curr_idx - iters)
      if (i >= iters) { // THIS IS COOL !!! //
        newColor = defColor;
      }
      currChar = currChar.fontcolor(newColor);
      titleTemp = currChar + titleTemp;
    }
    // Show new text
    thisObj.html(titleTemp);
    setTimeout(function(){colorWaveIn($(thisObj),(curr_idx+1),iters,delay,isOut)}, delay);
   }
 }


 /* HANDLER: regionHoverIn */
 function regionHoverIn() {
   //console.log(this.id);
   lastHoverObjId = this.id.substr(0, this.id.length-1); // use to handle case if obj is "mideast", toggle "asia" obj instead
   if (isInStrobe === 1) {return;}
   makeLastClickedGray();
   if (this.id === "mideast") {lastHoverObjId = "asia";}
   document.getElementById(lastHoverObjId+'1').style.filter = "grayscale(0%)";
   document.getElementById(lastHoverObjId+'2').style.filter = "grayscale(0%)";
 }


 /* HANDLER: regionHoverOut */
 function regionHoverOut() {
   if (isInStrobe === 1) {return;}
   document.getElementById(lastHoverObjId+'1').style.filter = "grayscale(100%)";
   document.getElementById(lastHoverObjId+'2').style.filter = "grayscale(100%)";
 }




/*           --------------------HELPER FUNCTIONS--------------------         */


/* HELPER: after click, toggle grayscale to produce flash effect */
 function grayStrobe(iters, delay) {
   // Toggle grayscale: 0, 1, 0, 1, ...
   // Iters is doubled, i.e. for 4 cycles, you toggle grayscale 8 times
   iters--;
   if (iters < 0) {
     isInStrobe = 0;
     return -1;
   }
   $('#'+lastClickedObjId+'1').css("filter", "grayscale("+iters%2+")");
   $('#'+lastClickedObjId+'2').css("filter", "grayscale("+iters%2+")");
   setTimeout(function(){grayStrobe(iters,delay)}, delay);
 }


/* HELPER: set last clicked continent filter to max grayscale (default) */
 function makeLastClickedGray() {
   if (lastClickedObjId !== undefined) {
     document.getElementById(lastClickedObjId+'1').style.filter = "grayscale(100%)";
     document.getElementById(lastClickedObjId+'2').style.filter = "grayscale(100%)";
   }
 }


 /* HELPER: shift map to the right (rotating effect) */
function shiftMapRight(shiftVW) {
  var i;
  for (i=0; i<2; i++) {
    var mapName = '#map'+(i+1);
    var otherMap = '#map'+((i+1)%2+1);
    var newMarginVW = getLeftMarginVW(mapName)+shiftVW ;
    var approxPos = Math.round(newMarginVW*100)/100; //round to nearest 0.01 vw (???)
    $(mapName).css("margin-left", newMarginVW+"vw");
    if (approxPos === initialPos[0]) { // Map1 is back to its initial pos. Set Map2 to its initial pos.
      resetMapPos(otherMap, initialPos[1]);
    }
  }
}


/* HELPER: reset map left margin to param: pos (float in vw units) */
function resetMapPos(mapName, pos) {
  console.log(mapName);
  console.log(pos);
  $(mapName).css("margin-left", pos+"vw");
}


/* HELPER: get left margin in vw units */
function getLeftMarginVW(elementId) {
  var leftMarginStr = $(elementId).css('margin-left');
  var leftMarginPx = parseFloat(leftMarginStr.substr(0,leftMarginStr.length-2));
  return 100*leftMarginPx/window.innerWidth;
}





/*                --------------------MAIN--------------------                */

$(window).ready(function() {
  shift();
  // Title animations
  $("h1").animateExtra("clrWave", 14, 70, true);
  // Continent click animation
  $(".worldregion").animateExtra("grayStrobe", 5, 100);
  // Continent hover effects
  $(".worldregion").hover(regionHoverIn, regionHoverOut);
  // Click anywhere on document to reset last clicked Object to default grayscale
  $(document).click(function() {
    makeLastClickedGray();
    console.log($('h1').css('font-size'));
    console.log($('h1').css('width'));
  });
  // Set interval and timeout for rotations/shift effect for worldmap
  var delay = 400;
  var counter = 0;
  var bgPic = 1;
  function shift() {
    shiftMapRight(1); // Shift maps by 1vw. Swap if necessary.
    counter++;
    if (counter%5 == 0) { // every n shifts, flicker the stars by changing the background image
      bgPic = bgPic%2+1; // 1->2, 2->1
      var url = 'style/imgs/kosmo'+bgPic+'.jpg';
      console.log(url)
      document.body.style.background = "url("+url+") center center";
      document.body.style.backgroundSize = "cover";
    }
    setTimeout(shift, delay); // loop.
  }
});

// World map rotation psequdocode:

// starting map positions: 2, 1, _

// loop shift
// if map2 curr left-margin === map1 intitial left-margin, "reset" map1 to map2 initial left-margin: 1, 2, _
// loop shift
// if if map1 curr left-margin === map1 intitial left-margin, "reset" map2 to map2 initial left-margin: 2, 1, _
// repeat



/* End of script */
