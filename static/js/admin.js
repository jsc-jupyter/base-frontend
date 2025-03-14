// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

require(['jquery', 'moment', 'jhapi', 'utils'], function ($, moment, JHAPI, utils) {
  'use strict';

  const base_url = window.jhdata.base_url;
  const prefix = window.jhdata.prefix;
  const admin_access = window.jhdata.admin_access;
  const options_form = window.jhdata.options_form;

  const api = new JHAPI(base_url);

  function getRow(element) {
    const original = element;
    while (!element.hasClass('server-row')) {
      element = element.parent();
      if (element[0].tagName === 'BODY') {
        console.error("Couldn't find row for", original);
        throw new Error('No server-row found');
      }
    }
    return element;
  }

  function resort(col, order) {
    const query = window.location.search.slice(1).split('&');
    // if col already present in args, remove it
    let i = 0;
    while (i < query.length) {
      if (query[i] === 'sort=' + col) {
        query.splice(i, 1);
        if (query[i] && query[i].substr(0, 6) === 'order=') {
          query.splice(i, 1);
        }
      } else {
        i += 1;
      }
    }
    // add new order to the front
    if (order) {
      query.unshift('order=' + order);
    }
    query.unshift('sort=' + col);
    // reload page with new order
    window.location = window.location.pathname + '?' + query.join('&');
  }

  $('th').map(function (i, th) {
    th = $(th);
    const col = th.data('sort');
    if (!col || col.length === 0) {
      return;
    }
    const order = th.find('i').hasClass('fa-sort-desc') ? 'asc' : 'desc';
    th.find('a').click(function () {
      resort(col, order);
    });
  });

  $('.time-col').map(function (i, el) {
    // convert ISO datestamps to nice momentjs ones
    el = $(el);
    const m = moment(new Date(el.text().trim()));
    el.text(m.isValid() ? m.fromNow() : 'Never');
  });

  $('.stop-server').click(function () {
    const el = $(this);
    const row = getRow(el);
    const serverID = row.data('server-id');
    const user = row.data('user');
    el.text('stopping...');
    let stop = function (options) {
      return api.stop_server(user, options);
    };
    if (serverID !== '') {
      stop = function (options) {
        return api.stop_named_server(user, serverID, options);
      };
    }
    stop({
      success: function () {
        el.text('stop ' + serverID).addClass('hidden');
        row.find('.access-server').addClass('hidden');
        row.find('.start-server').removeClass('hidden');
      },
    });
  });

  $('.delete-server').click(function () {
    const el = $(this);
    const row = getRow(el);
    const serverID = row.data('server-id');
    const user = row.data('user');
    el.text('deleting...');
    api.delete_named_server(user, serverID, {
      success: function () {
        row.remove();
      },
    });
  });

  $('.access-server').map(function (i, el) {
    el = $(el);
    const row = getRow(el);
    const user = row.data('user');
    const serverID = row.data('server-id');
    el.attr('href', utils.url_path_join(prefix, 'user', user, serverID) + '/');
  });

  if (admin_access && options_form) {
    // if admin access and options form are enabled
    // link to spawn page instead of making API requests
    $('.start-server').map(function (i, el) {
      el = $(el);
      const row = getRow(el);
      const user = row.data('user');
      const serverID = row.data('server-id');
      el.attr('href', utils.url_path_join(prefix, 'hub/spawn', user, serverID));
    });
    // cannot start all servers in this case
    // since it would mean opening a bunch of tabs
    $('#start-all-servers').addClass('hidden');
  } else {
    $('.start-server').click(function () {
      const el = $(this);
      const row = getRow(el);
      const user = row.data('user');
      const serverID = row.data('server-id');
      el.text('starting...');
      let start = function (options) {
        return api.start_server(user, options);
      };
      if (serverID !== '') {
        start = function (options) {
          return api.start_named_server(user, serverID, options);
        };
      }
      start({
        success: function () {
          el.text('start ' + serverID).addClass('hidden');
          row.find('.stop-server').removeClass('hidden');
          row.find('.access-server').removeClass('hidden');
        },
      });
    });
  }

  $('.edit-user').click(function () {
    const el = $(this);
    const row = getRow(el);
    const user = row.data('user');
    const admin = row.data('admin');
    const dialog = $('#edit-user-dialog');
    dialog.data('user', user);
    dialog.find('.username-input').val(user);
    dialog.find('.admin-checkbox').attr('checked', admin === 'True');
    dialog.modal();
  });

  $('#edit-user-dialog')
    .find('.save-button')
    .click(function () {
      const dialog = $('#edit-user-dialog');
      const user = dialog.data('user');
      const name = dialog.find('.username-input').val();
      const admin = dialog.find('.admin-checkbox').prop('checked');
      api.edit_user(
        user,
        {
          admin: admin,
          name: name,
        },
        {
          success: function () {
            window.location.reload();
          },
        },
      );
    });

  $('.delete-user').click(function () {
    const el = $(this);
    const row = getRow(el);
    const user = row.data('user');
    const dialog = $('#delete-user-dialog');
    dialog.find('.delete-username').text(user);
    dialog.modal();
  });

  $('#delete-user-dialog')
    .find('.delete-button')
    .click(function () {
      const dialog = $('#delete-user-dialog');
      const username = dialog.find('.delete-username').text();
      console.log('deleting', username);
      api.delete_user(username, {
        success: function () {
          window.location.reload();
        },
      });
    });

  $('#add-users').click(function () {
    const dialog = $('#add-users-dialog');
    dialog.find('.username-input').val('');
    dialog.find('.admin-checkbox').prop('checked', false);
    dialog.modal();
  });

  $('#add-users-dialog')
    .find('.save-button')
    .click(function () {
      const dialog = $('#add-users-dialog');
      const lines = dialog.find('.username-input').val().split('\n');
      const admin = dialog.find('.admin-checkbox').prop('checked');
      const usernames = [];
      lines.map(function (line) {
        const username = line.trim();
        if (username.length) {
          usernames.push(username);
        }
      });

      api.add_users(
        usernames,
        { admin: admin },
        {
          success: function () {
            window.location.reload();
          },
        },
      );
    });

  $('#stop-all-servers').click(function () {
    $('#stop-all-servers-dialog').modal();
  });

  $('#start-all-servers').click(function () {
    $('#start-all-servers-dialog').modal();
  });

  $('#stop-all-servers-dialog')
    .find('.stop-all-button')
    .click(function () {
      // stop all clicks all the active stop buttons
      $('.stop-server').not('.hidden').click();
    });

  function start(el) {
    return function () {
      $(el).click();
    };
  }

  $('#start-all-servers-dialog')
    .find('.start-all-button')
    .click(function () {
      $('.start-server')
        .not('.hidden')
        .each(function (i) {
          setTimeout(start(this), i * 500);
        });
    });

  $('#shutdown-hub').click(function () {
    const dialog = $('#shutdown-hub-dialog');
    dialog.find('input[type=checkbox]').prop('checked', true);
    dialog.modal();
  });

  $('#shutdown-hub-dialog')
    .find('.shutdown-button')
    .click(function () {
      const dialog = $('#shutdown-hub-dialog');
      const servers = dialog.find('.shutdown-servers-checkbox').prop('checked');
      const proxy = dialog.find('.shutdown-proxy-checkbox').prop('checked');
      api.shutdown_hub({
        proxy: proxy,
        servers: servers,
      });
    });
});
