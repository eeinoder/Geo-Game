/* main.js */

/*
// Title animations
$("h1").animateExtra("clrWave", 14, 70, true);

// Continent click animation
$(".worldregion").animateExtra("grayStrobe", 5, 100);

// Continent hover effects
$(".worldregion").hover(regionHoverIn, regionHoverOut);

// Click anywhere on document to reset last clicked Object to default grayscale
$(document).click(function() {
  makeLastClickedGray();
  shiftMapRight(); //
});
*/

/* DISABLE HORIZONTAL SCROLL */
$(function() {
    var $body = $(document);
    $body.bind('scroll', function() {
        // "Disable" the horizontal scroll.
        if ($body.scrollLeft() !== 0) {
            $body.scrollLeft(0);
        }
    });
});
