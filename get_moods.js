async function run() {
  const { SkillprintClient } = require('./app/lib/skillprintSdk');
  const client = new SkillprintClient({
    apiKey: 'test-api-key',
    baseUrl: 'https://api.staging.skillprint.co/',
  });
  
  const token = await client.createOrGetUserToken('player01@demo.skillprint.co');
  
  const res = await fetch('https://api.staging.skillprint.co/visualize/api/profile/moods/', {
      headers: { 'X-Auth-Token': 'Token ' + token }
  });
  const data = await res.json();
  console.log(JSON.stringify(data.yearlySummary, null, 2));
}

run().catch(console.error);
