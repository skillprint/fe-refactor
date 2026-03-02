import { Organization } from './lib/models/Organization';

async function test() {
    try {
        const org = await Organization.findOne({ where: { username: 'partner_admin' } });
        console.log("Org found:", org?.toJSON());
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
