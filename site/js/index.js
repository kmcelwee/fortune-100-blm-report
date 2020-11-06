function fadeTitleCard() {
  if (window.scrollY != 0) {
      $('.header').css({'opacity': 1})
  } else {
      $('.header').css({'opacity': 0})
  }
}

window.onscroll = fadeTitleCard;

$(document).ready(function() {
    $('html, body').animate({scrollTop: 2}, 500);
    fadeTitleCard();
})