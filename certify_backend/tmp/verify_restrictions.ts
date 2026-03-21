import jwt from 'jsonwebtoken';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const secret = process.env.JWT_SECRET || 'certify_hub_secret_key_change_in_production_2024';
const port = process.env.PORT || 5200;

const adminUser = {
    id: 'anitha-id',
    email: 'anitha1@gmail.com',
    role: 'faculty',
    is_department_admin: true,
    department: 'CSE'
};

const regularUser = {
    id: 'pavithra-id',
    email: 'pavithra1@gmail.com',
    role: 'faculty',
    is_department_admin: false,
    department: 'CSE'
};

const adminToken = jwt.sign(adminUser, secret);
const regularToken = jwt.sign(regularUser, secret);

function request(method: string, path: string, token: string, data?: any): Promise<{status: number, data: any}> {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/api' + path,
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode || 0, data: body ? JSON.parse(body) : null });
                } catch (e) {
                    resolve({ status: res.statusCode || 0, data: body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function test() {
    console.log('--- Testing API Restrictions (Native HTTP) ---');

    console.log('\n1. Testing with Regular Faculty (Pavithra)...');
    try {
        const res = await request('POST', '/faculty/departments', regularToken, { name: 'Test Dept' });
        if (res.status === 403) {
            console.log('✅ Success: Regular faculty was denied (403 Forbidden).');
        } else {
            console.log(`❌ Error: Regular faculty received status ${res.status}. Expected 403.`);
        }
    } catch (err: any) {
        console.log(`❌ Connection Error: ${err.message}`);
    }

    console.log('\n2. Testing with Admin Faculty (Anitha)...');
    try {
        const res = await request('POST', '/faculty/departments', adminToken, { name: 'Test Dept ' + Date.now() });
        if (res.status === 201) {
            console.log('✅ Success: Admin faculty was able to create a department!');
            const deptId = res.data.department?.id;
            if (deptId) {
                const delRes = await request('DELETE', `/faculty/departments/${deptId}`, adminToken);
                if (delRes.status === 200) {
                    console.log('✅ Success: Admin faculty was able to delete the department!');
                } else {
                    console.log(`❌ Error: Failed to delete department. Status: ${delRes.status}`);
                }
            }
        } else {
            console.log(`❌ Error: Admin faculty received status ${res.status}. Expected 201.`);
            console.log('Response:', JSON.stringify(res.data));
        }
    } catch (err: any) {
        console.log(`❌ Connection Error: ${err.message}`);
    }

    console.log('\n--- Verification Complete ---');
}

test();
