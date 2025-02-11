// Set all carousel items to the same height
function carouselNormalization() {
  function normalizeHeights() {
    var heights = [];

    $("#login-carousel .carousel-item").each(function () {
      // If item is not shown, the height will be set to 0,
      // so we manually add and remove the "active" class to 
      // get the correct heights
      if ($(this).css("display") == "block") {
        var shown = 1;
      } else {
        $(this).addClass("active");
        var shown = 0;
      }
      heights.push($(this).outerHeight());
      if (shown == 0) {
        $(this).removeClass("active");
      }
    });

    var tallest = Math.max.apply(null, heights);
    $("#login-carousel .carousel-item").each(function () {
      $(this).css("min-height", tallest + "px");
    });
  }
  normalizeHeights();

  $(window).on("resize orientationchange", function () {
    $("#login-carousel .carousel-item").each(function () {
      $(this).css("min-height", "0"); // Reset min-height
    });
    normalizeHeights();
  });
}

$(document).ready(function () {
  carouselNormalization();

  // Start cycling of carousel
  // var carousel = new bootstrap.Carousel($('#login-carousel'), {
  //   interval: 5000,
  // })
  // carousel.cycle();
});