#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include <stdlib.h>
#include <string.h>

#define sliderPin 33
#define vibrationPin 18
#define buttonPin 34
#define propellerPin 18
#define client_name "stringselnuss"
#define moveTopic "movePlayer1"
#define gameOverTopic "gameOver"
#define newPlayerTopic "newPlayer"

// #define CLK 18 //pins definitions for TM1637 and can be changed to other ports
// #define DIO 10
// TM1637Display display(CLK, DIO);

char ssid[] = "moxd-lab";
char pass[] = "gf3heTS11c";
int status = WL_IDLE_STATUS;
int sliderValue = 0;
int currentSliderValue = 0;
char receiveMsg[1024];
volatile boolean buttonPressed = false;

WiFiClient espcClient;
PubSubClient client(espcClient);


void ByteToChar(byte* bytes, char* chars, unsigned int count)
{
    for (unsigned int i = 0; i < count; i++)
    {
      chars[i] = (char)bytes[i];
    }
}

void testCallback(char* topic, byte* payload, unsigned int length)
{
  ByteToChar(payload, receiveMsg, length);
}

void connectMQTT()
{
  Serial.println("[X] Attempting MQTT connection");
  while (!client.connected())
  {
    if (client.connect(client_name))
    {
      Serial.println("[X] MQTT connected");
      Serial.print("subscribe: ");
      Serial.println(client.subscribe(gameOverTopic));
    }
    else
    {
      Serial.println("[X] MQTT not connected. Try again in 1 sec");
      delay(1000);
    }
  }
}

void connectWIFI()
{
  Serial.println("[X] Attempting WiFi connection");
  while (status != WL_CONNECTED)
  {
    Serial.print("SSID: ");
    Serial.println(ssid);

    status = WiFi.begin(ssid, pass);
    delay(1000);
  }

  if (status != WL_CONNECTED)
  {
    Serial.println("[X] Couldn't get a wifi connection");
  }
  else
  {
    Serial.println("[X] WiFi connection established");
  }
}


void handleButtonInterrupt()
{
  buttonPressed = true;
}

void setup()
{
  Serial.begin(9600);
  pinMode(sliderPin, INPUT);
  pinMode(buttonPin, INPUT);
  digitalWrite(vibrationPin, LOW);
  attachInterrupt(digitalPinToInterrupt(buttonPin), handleButtonInterrupt, FALLING);

  pinMode(propellerPin, OUTPUT);
  digitalWrite(propellerPin, LOW);
  
  connectWIFI();
  client.setServer("hivemq.dock.moxd.io", 1883);
  client.setCallback(testCallback);
  connectMQTT();
}

void loop()
{
  if (!client.connected())
  {
    connectMQTT();
  }

  currentSliderValue = analogRead(sliderPin);

  if (abs(currentSliderValue - sliderValue) >= 15)
  {
    sliderValue = currentSliderValue;

    char buffer[12];
    itoa(sliderValue, buffer, 10);

    client.publish(moveTopic, buffer);
    // Serial.println(sliderValue);
  }

    if(buttonPressed) {
      Serial.println("button pressed");
      buttonPressed = false;
      client.publish(newPlayerTopic, newPlayerTopic);
      digitalWrite(propellerPin, HIGH);
    }

    // if(gameOverTopic.compare("Player1Lost") == 0) {
      
    // }

    if(strcmp("player1Lost", receiveMsg) == 0) {
      Serial.println("GAME OVER");
      digitalWrite(propellerPin, LOW);
      // receiveMsg[0] = '\0';
    }



    client.loop();
  delay(50);
}