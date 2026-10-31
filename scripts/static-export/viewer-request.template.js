// CloudFront viewer-request function for the static portal (runtime
// cloudfront-js-2.0): the routing. gen-viewer-request.mjs fills in the tables
// from the export and adds the handler; don't edit its output.

// Shell pages of dynamic routes, deepest first. `_` stands for any one segment.
var SHELLS = /*SHELLS*/[];
// Static pages that a shell would otherwise match (`/profile/stats/` beside
// `/profile/_/`). A static page wins, as it does in Next.
var STATIC = /*STATIC*/[];
// Files without an extension (`/opengraph-image`). Next serves them at their
// trailing-slash URL, as it does a page, so this does too.
var FILES = /*FILES*/[];

// Old links. These were next.config.ts redirects(), which an export can't serve.
var REDIRECTS = [
  // SKI-144: the profile skill breakdown used to link here.
  [/^\/profile\/skills\/([^/]+)\/?$/, '/skills/$1/'],
];

function queryString(qs) {
  var parts = [];
  Object.keys(qs).forEach(function (key) {
    var v = qs[key];
    var values = v.multiValue ? v.multiValue : [v];
    values.forEach(function (m) {
      parts.push(m.value === '' ? key : key + '=' + m.value);
    });
  });
  return parts.length ? '?' + parts.join('&') : '';
}

function redirect(location) {
  return {
    statusCode: 308,
    statusDescription: 'Permanent Redirect',
    headers: { location: { value: location } },
  };
}

function shellFor(dir) {
  var segs = dir.split('/');
  for (var i = 0; i < SHELLS.length; i++) {
    var shell = SHELLS[i].split('/');
    if (shell.length !== segs.length) continue;
    var match = true;
    for (var k = 0; k < shell.length; k++) {
      if (shell[k] !== '_' && shell[k] !== segs[k]) {
        match = false;
        break;
      }
    }
    if (match) return SHELLS[i];
  }
  return null;
}

// The request to serve from the export, or a redirect.
function route(request) {
  var uri = request.uri;

  for (var r = 0; r < REDIRECTS.length; r++) {
    if (REDIRECTS[r][0].test(uri)) {
      return redirect(uri.replace(REDIRECTS[r][0], REDIRECTS[r][1]) + queryString(request.querystring));
    }
  }

  // trailingSlash: a path whose last segment has no file extension gets its
  // slash, query kept.
  var last = uri.slice(uri.lastIndexOf('/') + 1);
  if (last !== '' && last.indexOf('.') === -1) {
    return redirect(uri + '/' + queryString(request.querystring));
  }

  // A page (dir/), its index.html, or its RSC payload (index.txt, which a
  // client-side navigation fetches).
  var dir = null;
  var file = '';
  if (uri.slice(-1) === '/') dir = uri;
  else if (last === 'index.html' || last === 'index.txt') {
    dir = uri.slice(0, -last.length);
    file = last;
  }

  if (file === '' && dir !== null && FILES.indexOf(dir.slice(0, -1)) !== -1) {
    request.uri = dir.slice(0, -1);
    return request;
  }

  if (dir !== null && STATIC.indexOf(dir) === -1) {
    var shell = shellFor(dir);
    if (shell) uri = shell + file;
  }

  if (uri.slice(-1) === '/') uri += 'index.html';
  request.uri = uri;
  return request;
}
