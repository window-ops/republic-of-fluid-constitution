/* Defender of Rights - site behaviour.
   A router that names the right body for a problem, and filters over the
   register of automated systems and the register of findings. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  var ROUTES = {
    'right': {
      body: 'This office',
      text: 'A right of Title III is what this office exists for. Bring the complaint here, in any language of record, in writing, out loud, or through the public information system. Nothing needs exhausting first.',
      link: 'complain.html',
      label: 'Make a complaint'
    },
    'data': {
      body: 'The data division of this office',
      text: 'Personal data and automated systems belong to the division of Article 254. The same complaint route reaches it, and the division may order a prohibited system to stop.',
      link: 'data.html',
      label: 'The data division'
    },
    'detention': {
      body: 'The detention division of this office',
      text: 'The division of Article 255 visits without announcement, speaks with any detained person in private, and may be refused in no case. Anyone may write to it, including a detained person, and correspondence with it is protected.',
      link: 'detention.html',
      label: 'Places of detention'
    },
    'ballot': {
      body: 'The Electoral Commission',
      text: 'The list, the ballot, the count, the computation and the proclamation are decided by the Electoral Commission in the first instance, with an appeal to the Constitutional Court. Any resident may bring a dispute, and it costs nothing.',
      link: '../electoral-commission/disputes.html',
      label: 'Electoral disputes'
    },
    'resources': {
      body: 'The Audit Office',
      text: 'The use of common resources is audited by the Audit Office. Ten thousand residents open an audit by petition, and a council or a branch federation may request one.',
      link: '../audit-office/request.html',
      label: 'Ask for an audit'
    },
    'declaration': {
      body: 'The Office of Democratic Integrity',
      text: 'Declarations of interest, appropriation of public resources, and the conditions of participation belong to that office. It publishes findings and refers matters onward, and it imposes no sanction of its own.',
      link: '../democratic-integrity/index.html',
      label: 'Office of Democratic Integrity'
    },
    'future': {
      body: 'The Commissioner for Future Generations',
      text: 'An act transferring depletion, contamination, disrepair, obligation or risk to people not yet born goes to the Commissioner, who may require the act to be reconsidered in public sitting.',
      link: '../future-generations/index.html',
      label: 'Commissioner for Future Generations'
    },
    'court': {
      body: 'A court',
      text: 'Where you want an order, a court decides. This office may bring the proceeding in its own name or in support of you under Article 252(2), so the complaint may still start here.',
      link: 'process.html',
      label: 'How a complaint reaches a court'
    }
  };

  function router() {
    var pick = byId('route-pick');
    var out = byId('route-out');
    if (!pick || !out) { return; }

    function show() {
      var key = pick.value;
      if (!key) {
        out.innerHTML = '<strong>Choose what happened</strong>Every route below is free, and none of them requires you to have tried another one first.';
        return;
      }
      var r = ROUTES[key];
      out.innerHTML = '<strong>' + r.body + '</strong>' + r.text +
        ' <a href="' + r.link + '">' + r.label + '</a>';
    }

    pick.addEventListener('change', show);
    show();
  }

  function systems() {
    var list = byId('sys-list');
    if (!list) { return; }
    var controls = document.querySelectorAll('#sys-controls [data-filter]');
    var apply = Frame.filter({
      items: list.querySelectorAll('article'),
      controls: controls,
      count: byId('sys-count'),
      empty: byId('sys-empty'),
      noun: 'systems'
    });
    Frame.resetOn(byId('sys-reset'), controls, apply);
  }

  function findings() {
    var body = byId('find-rows');
    if (!body) { return; }
    var controls = document.querySelectorAll('#find-controls [data-filter]');
    var apply = Frame.filter({
      items: body.querySelectorAll('tr'),
      controls: controls,
      count: byId('find-count'),
      empty: byId('find-empty'),
      noun: 'findings'
    });
    Frame.resetOn(byId('find-reset'), controls, apply);
    Frame.sortable(byId('find-table'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    router();
    systems();
    findings();
  });
})();
