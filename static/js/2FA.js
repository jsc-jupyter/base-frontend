// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

require(["jquery", "jhapi"], function (
  $,
  JHAPI,
) {
  "use strict";

  var base_url = window.jhdata.base_url;
  var user = window.jhdata.user;
  var api = new JHAPI(base_url);

  function activate2FA() {
    // request
    if ($(".activate-2fa").attr("disabled") == "disabled") {
      $.confirm({
        title: "2-Factor Authentication - Resend Request",
        backgroundDismiss: "2-Factor Authentication",
        content:
          "A confirmation email has already been send to " +
          user +
          '. Please check your email account (including possible spam folders) or click on "RE-SEND REQUEST" for a new confirmation email.<br>',
        buttons: {
          Resend: {
            text: "RE-SEND REQUEST",
            btnClass: "btn-blue",
            action: function () {
              api.activate_2fa(user, {
                success: function () {
                  $(".activate-2fa").attr("disabled", "disabled");
                },
              });
            },
          },
          Ok: {
            text: "Ok",
            btnClass: "btn-default",
            action: function () { },
          },
        },
      });
    } else {
      $.confirm({
        title: "2-Factor Authentication - Request",
        backgroundDismiss: "2-Factor Authentication",
        content:
          "We'll send you a confirmation email.<br>Please follow the activation link in that email to proceed.",
        buttons: {
          Ok: {
            text: "REQUEST EMAIL",
            btnClass: "btn-blue",
            action: function () {
              api.activate_2fa(user, {
                success: function () {
                  $(".activate-2fa").attr("disabled", "disabled");
                },
              });
            },
          },
          Cancel: {
            text: "Cancel",
            btnClass: "btn-default",
            action: function () { },
          },
        },
      });
    }
  }

  function remove2FA() {
    // request
    if ($(".remove-2fa").attr("disabled") == "disabled") {
      $.confirm({
        title: "2-Factor Authentication - Removal",
        backgroundDismiss: "2-Factor Authentication",
        content:
          "The 2-factor authentication was removed for your account.<br>You can request it again at any time.",
        buttons: {
          Ok: {
            text: "Ok",
            btnClass: "btn-default",
            action: function () { },
          },
        },
      });
    } else {
      $.confirm({
        title: "2-Factor Authentication - Removal",
        backgroundDismiss: "2-Factor Authentication",
        content:
          "This will remove the 2-factor authentication for your account.<br>You can request it again at any time.",
        buttons: {
          Ok: {
            text: "Remove 2FA",
            btnClass: "btn-blue",
            action: function () {
              api.remove_2fa(user, {
                success: function () {
                  $(".remove-2fa").attr("disabled", "disabled");
                },
              });
            },
          },
          Cancel: {
            text: "Cancel",
            btnClass: "btn-default",
            action: function () { },
          },
        },
      });
    }
  }

  $("#activate-2fa").click(activate2FA);
  $("#remove-2fa").click(remove2FA);
});
