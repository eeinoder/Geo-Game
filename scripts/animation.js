const dPx = 10; //TODO: change these to optional parameters in animateExtra
const dT = 400;
const colors = ["fd747d","fdc674","fdf674","7bf184","90ccfd","9c90fd","eb90fd"];
const defColor = "1faffe";

var isInStrobe = 0; // global var: defines if grayStrobe is active. Disables things if true.
var lastClickedObj; // last continent object clicked
var lastHoverObj;



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
        lastClickedObj = this;
        if (this.id === 'mideast') {
          lastClickedObj = document.getElementById("asia");
        }
        console.log(this.id);
        isInStrobe = 1;
        grayStrobe($(lastClickedObj), 2*iters, delay);
      });
    }
    return this;
  };
}(jQuery));

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

 function grayStrobe(thisObj, iters, delay) {
   // Toggle grayscale: 0, 1, 0, 1, ...
   // Iters is doubled, i.e. for 4 cycles, you toggle grayscale 8 times
   iters--;
   if (iters < 0) {
     isInStrobe = 0;
     return -1;
   }
   thisObj.css("filter", "grayscale("+iters%2+")");
   setTimeout(function(){grayStrobe($(thisObj),iters,delay)}, delay);
 }

/* HELPER: set last clicked continent filter to max grayscale (default) */
 function makeLastClickedGray() {
   if (lastClickedObj !== undefined) {
     lastClickedObj.style.filter = "grayscale(100%)";
   }
 }



/* MAP EFFECTS HANDLERS: HOVER, CLICK, ETC. */

// Title animations
$("h1").animateExtra("clrWave", 14, 70, true);

// Continent click animation
$(".worldregion").animateExtra("grayStrobe", 5, 100);

// Continent hover effects
$(".worldregion").hover(function(){
  //console.log(this.id);
  lastHoverObj = this; // use to handle case if obj is "mideast", toggle "asia" obj instead
  if (isInStrobe === 1) {return;}
  makeLastClickedGray();
  if (this.id === "mideast") {lastHoverObj = document.getElementById("asia");}
  lastHoverObj.style.filter = "grayscale(0%)";
}, function() {
  if (isInStrobe === 1) {return;}
  lastHoverObj.style.filter = "grayscale(100%)";
});

// Click anywhere on document to reset last clicked Object to default grayscale
$(document).click(function() {
  makeLastClickedGray();
});


/* End of script */
