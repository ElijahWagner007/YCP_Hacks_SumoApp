#include "BluetoothSerial.h"
#include <FS.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>

#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error Bluetooth is not enabled! Please run `make menuconfig` to and enable it
#endif

BluetoothSerial SerialBT;

const int pwmFreq = 5000;
const int pwmResolution = 8;

int motorPinA[] = {-1, -1, -1, -1};
int motorPinB[] = {-1, -1, -1, -1};
int motorSpeeds[] = {0, 0, 0, 0};

void setup() {
  // Start serial communication
  Serial.begin(115200);

  // Initialize SPIFFS
  if (!SPIFFS.begin(true)) {
    Serial.println("Failed to mount SPIFFS");
    return;
  }

  // Open the settings.json file
  File file = SPIFFS.open("/settings.json", "r");
  if (!file) {
    Serial.println("Failed to open settings.json");
    return;
  }

  // Allocate a buffer to store the contents of the file
  StaticJsonDocument<512> jsonDoc; // Adjust size as necessary based on your JSON content

  // Deserialize the JSON file
  DeserializationError error = deserializeJson(jsonDoc, file);
  if (error) {
    Serial.print("Failed to parse JSON: ");
    Serial.println(error.c_str());
    return;
  }

  const char* deviceName = jsonDoc["name"];
  SerialBT.begin(deviceName);
  Serial.println("The device started, now you can pair it with Bluetooth!");

  // Read motorPinA and motorPinB arrays from JSON
  JsonArray motorPinAArray = jsonDoc["motorPinA"];
  JsonArray motorPinBArray = jsonDoc["motorPinB"];

  for (size_t i = 0; i < motorPinAArray.size(); i++) {
    motorPinA[i] = motorPinAArray[i];
    Serial.print("motorPinA[");
    Serial.print(i);
    Serial.print("] = ");
    Serial.println(motorPinA[i]);
  }

  for (size_t i = 0; i < motorPinBArray.size(); i++) {
    motorPinB[i] = motorPinBArray[i];
    Serial.print("motorPinB[");
    Serial.print(i);
    Serial.print("] = ");
    Serial.println(motorPinB[i]);
  }

  // Close the file
  file.close();

  // Set up motor pins as outputs and configure PWM
  for (size_t i = 0; i < motorPinAArray.size(); i++) {
    ledcAttachChannel(motorPinA[i], pwmFreq, pwmResolution, i * 2);
    ledcAttachChannel(motorPinB[i], pwmFreq, pwmResolution, i * 2 + 1);

    // Start with motors stopped
    ledcWrite(motorPinA[i], 0);
    ledcWrite(motorPinB[i], 0);
  }
}

void loop() {
  String message = "";
  while (SerialBT.available()) {
    char incomingChar = SerialBT.read();
    if (incomingChar == '\n') {  // End of command
      break;
    }
    message += incomingChar;
  }

  if (message.length() > 0) {
    Serial.println("Received: " + message);
    
    // Check if the message format matches "mX:"
    if (message.startsWith("m")) {
      int motorIndex = message.substring(1, message.indexOf('/')).toInt() - 1; // Get motor index
      if (motorIndex >= 0 && motorIndex < sizeof(motorSpeeds)/sizeof(motorSpeeds[0]) && motorPinA[motorIndex] > 0 && motorPinB[motorIndex] > 0 ) {
        int speed = message.substring(message.indexOf('/') + 1).toInt();
        motorSpeeds[motorIndex] = (abs(speed) < 50) ? 0 : speed; // Apply dead zone check
        
        Serial.println("Motor " + String(motorIndex + 1) + " speed: " + String(motorSpeeds[motorIndex]));
        
        if (motorSpeeds[motorIndex] < 0) {
          // Fast decay PWM control for the motor
          ledcWrite(motorPinA[motorIndex], 0); // IN1 held low
          ledcWrite(motorPinB[motorIndex], -motorSpeeds[motorIndex]); // PWM on IN2
        } else {
          // Fast decay PWM control for the motor
          ledcWrite(motorPinA[motorIndex], motorSpeeds[motorIndex]); // PWM on IN1
          ledcWrite(motorPinB[motorIndex], 0); // IN2 held low
        }      
      }else {
        Serial.println("Invalid motor index");
      }
    } else if (message.startsWith("s")) { 
      String jsonString = "";
      jsonString = message.substring(message.indexOf('/') + 1);

      // Parse and format the JSON string
      StaticJsonDocument<512> jsonDoc; // Adjust size as needed
      DeserializationError error = deserializeJson(jsonDoc, jsonString);
      if (error) {
        Serial.print("Failed to parse JSON: ");
        Serial.println(error.c_str());
        return;
      }

      // Store the formatted JSON in SPIFFS
      File file = SPIFFS.open("/settings.json", "w");
      if (!file) {
        Serial.println("Failed to open file for writing");
        return;
      }

      if (serializeJsonPretty(jsonDoc, file) == 0) {
        Serial.println("Failed to write formatted JSON to file");
      } else {
        Serial.println("Formatted JSON saved as settings.json");
      }

      file.close();
    } else if (message.startsWith("r")){
      ESP.restart();
    }
  }
  delay(20);
}