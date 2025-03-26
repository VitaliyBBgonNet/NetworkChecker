# NetworkChecker

NetworkChecker is a Spring Boot web application designed to monitor and diagnose network and system performance. It allows users to check host availability, execute SSH commands on remote servers, and perform internet speed tests. The application provides a user-friendly interface with support for light and dark themes, detailed visualizations, and a history of test results.

## Features

- **Host Availability Check**: Verify if a host is reachable using ICMP ping.
- **SSH Command Execution**: Run SSH commands on a remote server to retrieve system information:
    - Uptime (`uptime`)
    - Disk Usage (`df -h`) with pie chart visualizations
    - Memory Usage (`free -m`) with pie chart visualizations
    - Open Ports (`netstat -tuln`) with a detailed table
- **Internet Speed Test**: Measure download speed, upload speed, and ping latency.
- **Theme Support**: Switch between light and dark themes with persistent user preference (saved in `localStorage`).
- **Responsive Design**: Built with Bootstrap for a mobile-friendly interface.
- **Result Visualization**: Display results in tables and charts using Chart.js.
- **Error Handling**: Comprehensive error handling with user-friendly messages.

## Tech Stack

- **Backend**: Spring Boot (Java)
- **Frontend**: HTML, CSS (Bootstrap), JavaScript
- **Libraries**:
    - Bootstrap 5.3.3 for styling
    - Bootstrap Icons 1.11.3 for icons
    - Chart.js 4.4.3 for visualizations
    - JSch for SSH command execution
- **Build Tool**: Maven
- **Storage**: LocalStorage for saving user preferences (e.g., theme)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Java 17** or later
- **Maven** (for building the project)
- **Git** (for cloning the repository)
- A server with SSH access (for testing SSH commands)

## Installation

    networkchecker/
    ├── src/
    │   ├── main/
    │   │   ├── java/
    │   │   │   └── com/networkchecker/
    │   │   │       ├── controllers/       # Spring controllers (ApiController.java)
    │   │   │       ├── dto/               # Data Transfer Objects (CheckResponse.java)
    │   │   │       └── NetworkCheckerApplication.java
    │   │   │       └── networkService    # Logic service  
    │   │   └── resources/
    │   │       ├── static/
    │   │       │   ├── css/              # Custom styles (styles.css)
    │   │       │   ├── js/               # Custom scripts (script.js)
    │   │       │   └── testfile.bin      # 10 MB test file for speed test
    │   │       ├── templates/            # Thymeleaf templates (BBnet.html)
    │   │       └── application.properties
    │   └── test/                         # Test files
    ├── pom.xml                           # Maven configuration
    └── README.md                         # Project documentation