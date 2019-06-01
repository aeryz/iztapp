// @ts-nocheck

$(document).ready(function () {

  changeDisplay($(".language option:selected").val());

  $(".language").change(function () {

    changeDisplay($(".language option:selected").val());

  })

});

function changeDisplay(language) {

  if (language === "tr") {

    $(`.category .lang_${language}`).css("display", "block");

    $(".category .lang_en").css("display", "none");

  } else if (language === "en") {

    $(`.category .lang_${language}`).css("display", "block");

    $(".category .lang_tr").css("display", "none");

  } else {

    $(`.category .lang_en`).css("display", "none");

    $(".category .lang_tr").css("display", "none");

  }

}
