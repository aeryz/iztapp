// @ts-nocheck

$(document).ready(function () {

  $("#modal-activator").on("click", function () {

    let modal = document.getElementById($(this).attr("aria-labelledby"));

    modal.style.display = "block"

  });

  $("div.modal .close").on("click", function () {

    let modal = document.getElementById($(this).attr("aria-labelledby"));

    modal.style.display = "none"

  });

});
