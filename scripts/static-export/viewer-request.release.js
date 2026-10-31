import cf from 'cloudfront';

/*ROUTE*/

// The live release. Every build is uploaded under releases/<git sha>/, and the
// key `current` in the distribution's KeyValueStore names the one to serve;
// deploy.sh and activate.sh write it.
var releases = cf.kvs('/*KVS_ID*/');

async function handler(event) {
  var result = route(event.request);
  if (result.statusCode) return result;
  var release;
  try {
    release = await releases.get('current');
  } catch (err) {
    // Nothing has been made live yet.
    return { statusCode: 503, statusDescription: 'Service Unavailable' };
  }
  result.uri = '/releases/' + release + result.uri;
  return result;
}
