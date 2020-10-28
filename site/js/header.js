$(document).ready(function() {
    function fadeTitleCard() {
      if (window.scrollY != 0) {
          $('.header').css({'opacity': 1})
      } else {
          $('.header').css({'opacity': 0})
      }
    }
    window.onscroll = function() {fadeTitleCard()};
})