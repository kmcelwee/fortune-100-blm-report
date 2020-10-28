function fadeTitleCard() {
  if (window.scrollY != 0) {
      $('.header').css({'opacity': 1})
  } else {
      $('.header').css({'opacity': 0})
  }
}

$(document).ready(function() {
    fadeTitleCard();
    window.onscroll = function() {fadeTitleCard()};
})