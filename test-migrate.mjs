async function runMigration() {
    const res = await fetch('http://localhost:3000/api/migrate');
    const data = await res.json();
    console.log(data);
}
runMigration().catch(console.error);
