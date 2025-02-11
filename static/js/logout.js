// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

require(["jquery", "utils"], function (
  $,
  utils
) {
  "use strict";

  var base_url = window.jhdata.base_url;
  var user_active = window.jhdata.user_active;

  function logout() {
    if (user_active) {
      var content =
        "Jupyter-JSC Logout." +
        '<div class="checkbox"><label><input type="checkbox" id="stopAll" checked="checked">Stop all running JupyterLabs.</label></div>' +
        '<div class="checkbox"><label><input type="checkbox" id="alldevices" checked="checked">Logout from all devices.</label></div>';
    } else {
      var content =
        "Jupyter-JSC Logout." +
        '<div class="checkbox"><label><input type="checkbox" id="alldevices" checked="checked">Logout from all devices.</label></div>';
    }

    $.confirm({
      title: "Logout",
      content: content,
      buttons: {
        logout: {
          text: "Logout",
          btnClass: "btn-primary",
          action: function () {
            var $stopall = this.$content.find("#stopAll");
            var $alldevices = this.$content.find("#alldevices");
            if (user_active && $stopall.prop("checked")) {
              if ($alldevices.prop("checked")) {
                window.location.replace(
                  utils.url_path_join(
                    base_url,
                    "logout?stopall=true&alldevices=true"
                  )
                );
              } else {
                window.location.replace(
                  utils.url_path_join(base_url, "logout?stopall=true")
                );
              }
            } else {
              if ($alldevices.prop("checked")) {
                window.location.replace(
                  utils.url_path_join(base_url, "logout?alldevices=true")
                );
              } else {
                window.location.replace(
                  utils.url_path_join(base_url, "logout")
                );
              }
            }
            this.$$cancel.attr('disabled','disabled');
            this.$$logout.attr('disabled','disabled');
            this.$$logout.prepend('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>');
            return false; // Do not close popup
          },
        },
        cancel: {
          text: "Cancel",
          btnClass: "btn-danger",
          action: function () {
            window.location.replace(location.href.replace(location.search, ""));
          },
        },
      },
    });
  }

  $(document).ready(function () {
    if (utils.getUrlParameter("logout") == "true") {
      logout();
    }
  });

  $("#logout").click(function () {
    var url = window.location.href;
    if (utils.getUrlParameter("logout") != "true") {
      if (window.location.search) {
        url += "&";
      } else {
        url += "?";
      }
      url += "logout=true";
    }
    window.location.replace(url);
  });
});