/* Electoral Commission - site behaviour.
   Filtering of the published registers, and the checksum comparison
   of Article 245(5). Every register remains legible without this file. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  /* Register of ballots held and results proclaimed. */
  function ballots() {
    var body = byId('ballot-rows');
    if (!body) { return; }
    var controls = document.querySelectorAll('#ballot-controls [data-filter]');
    var apply = Frame.filter({
      items: body.querySelectorAll('tr'),
      controls: controls,
      count: byId('ballot-count'),
      empty: byId('ballot-empty'),
      noun: 'ballots'
    });
    Frame.resetOn(byId('ballot-reset'), controls, apply);
    Frame.sortable(byId('ballot-table'));
  }

  /* Register of draws by lot conducted under Article 244(3). */
  function draws() {
    var body = byId('draw-rows');
    if (!body) { return; }
    var controls = document.querySelectorAll('#draw-controls [data-filter]');
    var apply = Frame.filter({
      items: body.querySelectorAll('tr'),
      controls: controls,
      count: byId('draw-count'),
      empty: byId('draw-empty'),
      noun: 'draws'
    });
    Frame.resetOn(byId('draw-reset'), controls, apply);
    Frame.sortable(byId('draw-table'));
  }

  /* Article 245(5): a binary whose checksum departs from the published
     checksum takes part in no procedure. The comparison below runs in
     the browser and reports the same refusal the procedure applies. */
  function checksum() {
    var field = byId('sum-input');
    var button = byId('sum-check');
    var out = byId('sum-verdict');
    var published = byId('sum-published');
    if (!field || !button || !out || !published) { return; }

    var official = published.textContent.replace(/\s+/g, '').toLowerCase();

    function normalise(value) {
      return value.replace(/\s+/g, '').replace(/^sha256:/i, '').toLowerCase();
    }

    button.addEventListener('click', function () {
      var given = normalise(field.value);
      if (!given) {
        out.className = 'verdict';
        out.textContent = 'Enter the checksum reported by your device.';
        return;
      }
      if (given === official) {
        out.className = 'verdict good';
        out.textContent = 'Match. This binary is the official one and takes part in the procedure.';
      } else {
        out.className = 'verdict bad';
        out.textContent = 'No match. Article 245(5) refuses this binary, however faithfully it was built. Obtain the application again from the source of Article 245(6).';
      }
    });

    field.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); button.click(); }
    });
  }

  /* Register of lists and candidacies, with the ground of any refusal. */
  function lists() {
    var body = byId('list-rows');
    if (!body) { return; }
    var controls = document.querySelectorAll('#list-controls [data-filter]');
    var apply = Frame.filter({
      items: body.querySelectorAll('tr'),
      controls: controls,
      count: byId('list-count'),
      empty: byId('list-empty'),
      noun: 'registrations'
    });
    Frame.resetOn(byId('list-reset'), controls, apply);
    Frame.sortable(byId('list-table'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    ballots();
    draws();
    lists();
    checksum();
  });
})();
