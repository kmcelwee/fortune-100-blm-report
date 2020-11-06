function fadeTitleCard() {
  if (window.scrollY != 0) {
      $('.header').css({'opacity': 1})
  } else {
      $('.header').css({'opacity': 0})
      $('#scroll_up').fadeOut()
  }
}

window.onscroll = fadeTitleCard;

$(document).ready(function() {
    $('html, body').animate({scrollTop: 1}, 500);
    fadeTitleCard();
    $('#scroll_up').delay(2000).fadeIn()
})