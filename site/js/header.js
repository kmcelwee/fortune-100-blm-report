$(document).ready(function() {
    $(".background").css({'opacity': 1})
})

function myFunction() {
  console.log('hi')
  if (document.body.scrollTop != 0) {
      console.log('hi2')
  }
}
window.onscroll = function() {myFunction()};
