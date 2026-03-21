const fs = require('fs');

async function run() {
    const fileContent = 'name,courseName,issueDate\nAlice,Test Course,2026-03-03\n';
    fs.writeFileSync('test.csv', fileContent);

    const fd = new FormData();
    const file = new File([fileContent], "test.csv", { type: "text/csv" });
    fd.append('file', file);

    try {
        const res = await fetch('http://127.0.0.1:3000/api/batch', {
            method: 'POST',
            body: fd
        });

        console.log("STATUS:", res.status);
        console.log("HEADERS:", Array.from(res.headers.entries()));

        const text = await res.text();
        console.log("RESPONSE BODY:", text.substring(0, 200)); // Print first 200 chars
    } catch (err) {
        console.error("FETCH ERROR:", err);
    }
}

run();
