const https = require('https');
const options = {
  hostname: 'api.staging.skillprint.co',
  port: 443,
  path: '/partners/api/users/auth/token/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Api-Key test-api-key'
  }
};
const req = https.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const token = JSON.parse(body).token;
    const req2 = https.request({
      hostname: 'api.staging.skillprint.co',
      port: 443,
      path: '/visualize/api/profile/skills/',
      method: 'GET',
      headers: {
        'X-Auth-Token': 'Token ' + token
      }
    }, res2 => {
      let body2 = '';
      res2.on('data', d => body2 += d);
      res2.on('end', () => {
        const data = JSON.parse(body2);
        console.log(JSON.stringify(data.yearlySummary, null, 2));
      });
    });
    req2.end();
  });
});
req.write(JSON.stringify({ internalId: 'player01@demo.skillprint.co' }));
req.end();
