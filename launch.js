const http = require('http');
const { exec } = require('child_process');

let hasOpened = false;

const checkAndOpen = () => {
    if (hasOpened) return;

    http.get('http://localhost:3000', (res) => {
        if (hasOpened) return;
        hasOpened = true;

        console.log('\n============================================================');
        console.log('🚀 LoopBack AI Settlement Engine is READY!');
        console.log('🌐 Dashboard: http://localhost:3000');
        console.log('⚡ 5 1-Click Evaluator Passports & Interactive Guide Activated');
        console.log('============================================================\n');

        let startCmd = 'open';
        if (process.platform === 'win32') {
            startCmd = 'start ""';
        } else if (process.platform === 'linux') {
            startCmd = 'xdg-open';
        }

        exec(`${startCmd} http://localhost:3000`, (err) => {
            if (err) {
                console.log('👉 Please open in your browser: http://localhost:3000');
            }
        });
    }).on('error', () => {
        setTimeout(checkAndOpen, 1000);
    });
};

setTimeout(checkAndOpen, 1500);