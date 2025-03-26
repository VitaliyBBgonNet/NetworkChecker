
document.getElementById('checkForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const submitButton = document.getElementById('submitButton');
    const buttonText = document.getElementById('buttonText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    buttonText.textContent = 'Checking...';
    loadingSpinner.classList.remove('d-none');
    submitButton.disabled = true;

    const host = document.getElementById('host').value;
    const user = document.getElementById('user').value;
    const password = document.getElementById('password').value;
    const command = document.getElementById('command').value;

    let apiUrl = `/api/check?host=${encodeURIComponent(host)}&command=${encodeURIComponent(command)}`;
    if (user) {
        apiUrl += `&user=${encodeURIComponent(user)}`;
    }
    if (password) {
        apiUrl += `&password=${encodeURIComponent(password)}`;
    }

    try {

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        document.getElementById('resultHost').textContent = data.host;
        document.getElementById('resultReachable').textContent = data.reachable;

        const outputElement = document.getElementById('resultCommandOutput');
        const diskChartsElement = document.getElementById('diskUsageCharts');
        const memoryChartsElement = document.getElementById('memoryUsageCharts');
        const openPortsElement = document.getElementById('openPortsTable');
        const speedTestElement = document.getElementById('speedTestTable');
        const diskTableBody = document.getElementById('diskUsageTableBody');
        const memoryTableBody = document.getElementById('memoryUsageTableBody');
        const openPortsTableBody = document.getElementById('openPortsTableBody');
        const speedTestTableBody = document.getElementById('speedTestTableBody');

        outputElement.classList.add('d-none');
        diskChartsElement.classList.add('d-none');
        memoryChartsElement.classList.add('d-none');
        openPortsElement.classList.add('d-none');
        speedTestElement.classList.add('d-none');
        diskTableBody.innerHTML = '';
        memoryTableBody.innerHTML = '';
        openPortsTableBody.innerHTML = '';
        speedTestTableBody.innerHTML = '';

        if (command === 'df -h' && data.commandOutput) {
            const disks = parseDiskUsage(data.commandOutput);
            displayDiskUsageTable(disks, diskTableBody);
            diskChartsElement.classList.remove('d-none');
        } else if (command === 'free -m' && data.commandOutput) {
            const memoryData = parseMemoryUsage(data.commandOutput);
            displayMemoryUsageTable(memoryData, memoryTableBody);
            memoryChartsElement.classList.remove('d-none');
        } else if (command === 'netstat -tuln' && data.commandOutput) {
            const ports = parseOpenPorts(data.commandOutput);
            displayOpenPortsTable(ports, openPortsTableBody);
            openPortsElement.classList.remove('d-none');
        } else if (command === 'speed-test') {
            const speedData = await performSpeedTest();
            displaySpeedTestTable(speedData, speedTestTableBody);
            speedTestElement.classList.remove('d-none');
        } else {
            outputElement.textContent = data.commandOutput || 'N/A';
            outputElement.classList.remove('d-none');
        }
        document.getElementById('result').classList.remove('d-none');
    } catch (error) {
        console.error('Error during API request:', error);
        document.getElementById('resultHost').textContent = 'Error';
        document.getElementById('resultReachable').textContent = 'N/A';
        document.getElementById('resultCommandOutput').textContent = error.message;
        document.getElementById('resultCommandOutput').classList.remove('d-none');
        document.getElementById('diskUsageCharts').classList.add('d-none');
        document.getElementById('memoryUsageCharts').classList.add('d-none');
        document.getElementById('openPortsTable').classList.add('d-none');
        document.getElementById('speedTestTable').classList.add('d-none');
        document.getElementById('result').classList.remove('d-none');
    } finally {
        buttonText.textContent = 'Check Host';
        loadingSpinner.classList.add('d-none');
        submitButton.disabled = false;
    }
});

function parseDiskUsage(output) {
    const lines = output.trim().split('\n');
    const disks = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(/\s+/);
        if (parts.length < 6) continue;

        const disk = {
            filesystem: parts[0],
            size: parts[1],
            used: parts[2],
            avail: parts[3],
            usePercent: parseInt(parts[4].replace('%', '')),
            mountedOn: parts[5]
        };
        disks.push(disk);
    }

    return disks;
}

function parseMemoryUsage(output) {
    const lines = output.trim().split('\n');
    const memoryData = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(/\s+/);
        if (parts.length < 3) continue;

        const type = parts[0].replace(':', '');
        const memory = {
            type: type,
            total: parseInt(parts[1]),
            used: parseInt(parts[2]),
            free: parseInt(parts[3]),

            buffCache: type === 'Mem' ? parseInt(parts[5]) : 0
        };
        memoryData.push(memory);
    }

    return memoryData;
}

function parseOpenPorts(output) {
    const lines = output.trim().split('\n');
    const ports = [];

    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(/\s+/);
        if (parts.length < 5) continue;

        const localAddressParts = parts[3].split(':');
        const address = localAddressParts.slice(0, -1).join(':'); // Всё до последнего двоеточия
        const port = localAddressParts[localAddressParts.length - 1];

        const portData = {
            protocol: parts[0],
            localAddress: address,
            port: port,
            state: parts.length > 5 ? parts[5] : ''
        };
        ports.push(portData);
    }

    return ports;
}

async function performSpeedTest() {
    const testFileUrl = '/testfile.bin';
    const uploadTestUrl = '/api/upload';

    try {
        console.log("Starting ping test...");
        const pingStart = Date.now();
        await fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors' });
        const ping = Date.now() - pingStart;
        console.log("Ping test completed:", ping, "ms");

        console.log("Starting download test...");
        const downloadStart = Date.now();
        const downloadResponse = await fetch(testFileUrl, { method: 'GET' });
        if (!downloadResponse.ok) {
            throw new Error(`Failed to download test file: ${downloadResponse.status} ${downloadResponse.statusText}`);
        }
        const downloadData = await downloadResponse.blob();
        const downloadEnd = Date.now();
        const downloadTime = (downloadEnd - downloadStart) / 1000;
        const downloadSize = downloadData.size / 1024 / 1024;
        const downloadSpeed = (downloadSize * 8) / downloadTime;
        console.log("Download test completed:", downloadSpeed.toFixed(2), "Mbps");

        console.log("Starting upload test...");
        const uploadSize = 10;
        const uploadStart = Date.now();
        const uploadData = new Blob([new ArrayBuffer(uploadSize * 1024 * 1024)]);
        const formData = new FormData();
        formData.append('file', uploadData);
        const uploadResponse = await fetch(uploadTestUrl, {
            method: 'POST',
            body: formData
        });
        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Failed to upload test file: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
        }
        const uploadEnd = Date.now();
        const uploadTime = (uploadEnd - uploadStart) / 1000;
        const uploadSpeed = (uploadSize * 8) / uploadTime;
        console.log("Upload test completed:", uploadSpeed.toFixed(2), "Mbps");

        return {
            downloadSpeed: downloadSpeed.toFixed(2),
            uploadSpeed: uploadSpeed.toFixed(2),
            ping: ping
        };
    } catch (error) {
        console.error('Speed test error:', error);
        throw new Error(`Speed test failed: ${error.message}`);
    }
}

function displayDiskUsageTable(disks, tableBody) {
    disks.forEach((disk, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${disk.filesystem}</td>
            <td>${disk.mountedOn}</td>
            <td>${disk.size}</td>
            <td>
                <div class="chart-container">
                    <canvas id="diskChart${index}"></canvas>
                </div>
            </td>
        `;
        tableBody.appendChild(row);

        const used = parseFloat(disk.used);
        const avail = parseFloat(disk.avail);

        new Chart(document.getElementById(`diskChart${index}`), {
            type: 'pie',
            data: {
                labels: ['Used', 'Available'],
                datasets: [{
                    data: [used, avail],
                    backgroundColor: ['#ff6384', '#36a2eb'],
                    borderColor: ['#ff6384', '#36a2eb'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value} GB`;
                            }
                        }
                    }
                }
            }
        });
    });
}

function displayMemoryUsageTable(memoryData, tableBody) {
    memoryData.forEach((memory, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${memory.type}</td>
            <td>${memory.total} MB</td>
            <td>
                <div class="chart-container">
                    <canvas id="memoryChart${index}"></canvas>
                </div>
            </td>
        `;
        tableBody.appendChild(row);

        const used = memory.used;
        const free = memory.free;
        let data, labels, colors;
        if (memory.type === 'Mem') {
            const buffCache = memory.buffCache;
            data = [used, free, buffCache];
            labels = ['Used', 'Free', 'Buff/Cache'];
            colors = ['#ff6384', '#36a2eb', '#ffcd56'];
        } else {
            data = [used, free];
            labels = ['Used', 'Free'];
            colors = ['#ff6384', '#36a2eb'];
        }

        new Chart(document.getElementById(`memoryChart${index}`), {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value} MB`;
                            }
                        }
                    }
                }
            }
        });
    });
}

function displayOpenPortsTable(ports, tableBody) {
    ports.forEach((port) => {
        const row = document.createElement('tr');
        const protocolIcon = port.protocol === 'tcp' ? 'bi bi-shield-lock-fill protocol-tcp' : 'bi bi-broadcast protocol-udp';
        const stateClass = port.state === 'LISTEN' ? 'state-listen' : 'state-empty';
        row.innerHTML = `
            <td><i class="${protocolIcon} me-2"></i>${port.protocol.toUpperCase()}</td>
            <td>${port.localAddress}</td>
            <td>${port.port}</td>
            <td class="${stateClass}">${port.state || 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });
}

function displaySpeedTestTable(speedData, tableBody) {

    const downloadRow = document.createElement('tr');
    downloadRow.innerHTML = `
        <td><i class="bi bi-download speed-download me-2"></i>Download Speed</td>
        <td class="speed-download">${speedData.downloadSpeed} Mbps</td>
    `;
    tableBody.appendChild(downloadRow);

    const uploadRow = document.createElement('tr');
    uploadRow.innerHTML = `
        <td><i class="bi bi-upload speed-upload me-2"></i>Upload Speed</td>
        <td class="speed-upload">${speedData.uploadSpeed} Mbps</td>
    `;
    tableBody.appendChild(uploadRow);

    const pingRow = document.createElement('tr');
    pingRow.innerHTML = `
        <td><i class="bi bi-clock speed-ping me-2"></i>Ping</td>
        <td class="speed-ping">${speedData.ping} ms</td>
    `;
    tableBody.appendChild(pingRow);
}