// @ts-nocheck

$(document).ready(function () {

  $(`.save-btn`).on("click", function (e) {

    e.preventDefault();

    const formElement = document.getElementById("formId");

    const data = {}

    for (const pair of new FormData(formElement)) {

      data[pair[0]] = pair[1]

    }

    postData(postURL, data)
      .then(function (data) {

        if (data.success) {

          successFunction

        } else if (data.error) {

          $("#error-alert #error-message").text(data.errorMessage)

          $("#error-modal").modal("toggle");

        }

      }) // JSON-string from `response.json()` call
      .catch(error => console.error(error));

  });

  function postData(url = ``, data) {
    // Default options are marked with *
    return fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, same-origin, *omit
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
      .then(response => response.json()); // parses response to JSON
  }

});
