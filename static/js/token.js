// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

require(['jquery', 'jhapi', 'moment'], function ($, JHAPI, moment) {
  'use strict';

  const base_url = window.jhdata.base_url;
  const user = window.jhdata.user;
  const api = new JHAPI(base_url);

  $('.time-col').map(function (i, el) {
    // convert ISO datestamps to nice momentjs ones
    el = $(el);
    const m = moment(new Date(el.text().trim()));
    el.text(m.isValid() ? m.fromNow() : el.text());
  });

  $('#request-token-form').submit(function () {
    let note = $('#token-note').val();
    if (!note.length) {
      note = 'Requested via token page';
    }
    api.request_token(
      user,
      { note: note },
      {
        success: function (reply) {
          $('#token-result').text(reply.token);
          $('#token-area').show();
        },
      },
    );
    return false;
  });

  function get_token_row(element) {
    return element.parents('tr');
  }

  $('.revoke-token-btn').click(function () {
    const el = $(this);
    const row = get_token_row(el);
    el.attr('disabled', true);
    api.revoke_token(user, row.data('token-id'), {
      success: function (reply) {
        row.remove();
      },
    });
  });
});
