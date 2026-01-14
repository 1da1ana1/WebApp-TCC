import * as bcrypt from 'bcrypt';

async function test() {
    const hashed = '$2b$10$rLG8kHar1aHBX7VOgbEmt.66e.GTNfwO0sOECAQnyEFD3hzj4SB8a';
    const password = 'password123';
    const match = await bcrypt.compare(password, hashed);
    console.log('Password match:', match);
}

test();