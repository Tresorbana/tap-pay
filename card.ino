#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <MFRC522.h>

// Pins for RC522
#define SS_PIN D2
#define RST_PIN D1

MFRC522 rfid(SS_PIN, RST_PIN);

// Replace with your WiFi credentials
const char* ssid = "EdNet";
const char* password = "Huawei@123";

// MQTT broker details
const char* mqtt_server = "broker.benax.rw";
const int mqtt_port = 1883;

// Your unique team ID
const char* team_id = "team_07";

// MQTT topics
String statusTopic = String("rfid/") + team_id + "/card/status";
String topupTopic  = String("rfid/") + team_id + "/card/topup";

WiFiClient espClient;
PubSubClient client(espClient);

String currentUID = "";
int balance = 0;

// Callback when a topup message is received
void callback(char* topic, byte* payload, unsigned int length) {
  String msg = "";
  for (int i = 0; i < length; i++) msg += (char)payload[i];

  if (String(topic) == topupTopic) {
    int amount = msg.toInt();
    balance += amount;
    publishStatus();
  }
}

// Publish current card UID and balance
void publishStatus() {
  String payload = "{\"uid\":\"" + currentUID + "\",\"balance\":" + String(balance) + "}";
  client.publish(statusTopic.c_str(), payload.c_str());
}

void setup() {
  Serial.begin(9600);
  SPI.begin();
  rfid.PCD_Init();

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Connect to MQTT broker
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");
    if(client.connect("esp8266_team_07")) {
      Serial.println("Connected to MQTT broker");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }

  // Subscribe to topup topic
  client.subscribe(topupTopic.c_str());
}

void loop() {
  client.loop();

  // Check for new card
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  currentUID = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    currentUID += String(rfid.uid.uidByte[i], HEX);
  }

  Serial.print("Card UID: ");
  Serial.println(currentUID);

  publishStatus();
  delay(2000);
}
