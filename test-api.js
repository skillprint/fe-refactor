const axios = require('axios');
async function test() {
    try {
        const res1 = await axios.get("https://api.skillprint.co/games/api/catalog/?slug=0hh1");
        console.log("0hh1:", res1.data.results ? res1.data.results[0]?.slug : 'No results');
        
        const res2 = await axios.get("https://api.skillprint.co/games/api/catalog/?slug=match-doodle");
        console.log("match-doodle:", res2.data.results ? res2.data.results[0]?.slug : 'No results');
        
        const res3 = await axios.get("https://api.skillprint.co/games/api/catalog/?slug=hextris");
        console.log("hextris:", res3.data.results ? res3.data.results[0]?.slug : 'No results');

        const res4 = await axios.get("https://api.skillprint.co/games/api/catalog/?slug=invalid-slug-1234");
        console.log("invalid:", res4.data.results ? res4.data.results[0]?.slug : 'No results');
    } catch (e) {
        console.log("Error:", e.message);
    }
}
test();
