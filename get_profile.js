const { SkillprintClient } = require('./lib/skillprintSdk');

async function run() {
  const client = new SkillprintClient({
    apiKey: 'test-api-key',
    baseUrl: 'https://api.staging.skillprint.co/',
  });
  
  const token = await client.createOrGetUserToken('player01@demo.skillprint.co');
  client.setUserToken(token);
  const profile = await client.getUserProfile();
  console.log(JSON.stringify(profile.results[0], null, 2));
}

run().catch(console.error);
