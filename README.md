# Tap and Pay - RFID Payment System (team_07)

A full-stack IoT solution for RFID-based payments, featuring an ESP8266-controlled RFID reader, a Node.js backend API, and a futuristic real-time web dashboard.

## Overview

This project implements a "Tap and Pay" system where users can scan RFID cards to view balances and perform top-ups. The system uses MQTT for real-time communication between the hardware and the backend.

## Project Structure

- **ESP8266 Firmware (`card.ino`)**: Manages the RFID reader (MFRC522), connects to WiFi/MQTT, and publishes card data.
- **Backend API (`backend.js`)**: A Node.js server that handles MQTT messages, manages card balances, and serves the web dashboard.
- **Web Dashboard (`index.html`)**: A real-time, futuristic B&W interface for monitoring and topping up card balances via WebSockets.

## Setup Instructions

### Hardware Setup
1. Connect the MFRC522 RFID reader to the ESP8266:
   - SS -> D2
   - RST -> D1
   - SCK -> D5
   - MISO -> D6
   - MOSI -> D7
2. Update the WiFi credentials in `card.ino`.
3. Flash the firmware using the Arduino IDE.

### Backend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   node backend.js
   ```
3. The server will run on port `9205`.

## Q11. Project Submission

**Public Repository URL:** [https://github.com/Tresorbana/tap-pay.git](https://github.com/Tresorbana/tap-pay.git)

**Live Web Dashboard:** [http://157.173.101.159:9205/](http://157.173.101.159:9205/)

### Requirements Verification:
- [x] Repository containing ESP8266 firmware
- [x] Repository containing Backend API code
- [x] Repository containing Web Dashboard code
- [x] Properly written README.md
- [x] Live URL in the specified format
- [x] Public repository
- [x] Accessible dashboard link

---
*Developed by team_07*
