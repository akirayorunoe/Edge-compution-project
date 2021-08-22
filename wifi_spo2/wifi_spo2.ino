#include <MySignals.h>
#include "Wire.h"
#include "SPI.h"


void setup()
{
  Serial.begin(115200);

  MySignals.begin();

  //Enable WiFi ESP8266 Power -> bit1:1
  bitSet(MySignals.expanderState, EXP_ESP8266_POWER);
  MySignals.expanderWrite(MySignals.expanderState);

  MySignals.initSensorUART();
//  MySignals.enableSensorUART(PULSIOXIMETER_MICRO);
  MySignals.enableSensorUART(WIFI_ESP8266);
  delay(1000);

  // Checks if the WiFi module is started
  int8_t answer = sendATcommand("AT", "OK", 6000);
  if (answer == 0)
  {
    MySignals.println("Error");
    // waits for an answer from the module
    while (answer == 0)
    {
      // Send AT every two seconds and wait for the answer
      answer = sendATcommand("AT", "OK", 6000);
    }
  }
  else if (answer == 1)
  {

    MySignals.println("WiFi succesfully working!");

    delay(500);
    sendATcommand("AT+CIFSR","OK",3000);
    delay(500);
    if (sendATcommand("AT+CWMODE=1", "OK", 6000))
    {
      MySignals.println("CWMODE OK");
    }
    else
    {
      MySignals.println("CWMODE Error");

    }
    delay(500);
    uint8_t check=0;
    //Change here your WIFI_SSID and WIFI_PASSWORD
    do{
      check=sendATcommand("AT+CWJAP=\"UiTiOt-E3.1\",\"UiTiOtAP\"", "OK", 10000);
      if(check){
        MySignals.println("Connected!");
      }
      else MySignals.println("Connect failed!");
    }
    while(check==0);
  }
}

void loop()
{
  MySignals.disableSensorUART();
  MySignals.enableSensorUART(PULSIOXIMETER_MICRO);
  if (MySignals.spo2_micro_detected == 0 && MySignals.spo2_mini_detected == 0)
   {
    uint8_t statusPulsioximeter = MySignals.getStatusPulsioximeterGeneral();
    if (statusPulsioximeter == 1)
    {
        delay(10);
    uint8_t getPulsioximeterMicro_state = MySignals.getPulsioximeterMicro();
    Serial.print(F("Press:"));
    Serial.print (MySignals.pulsioximeterData.BPM);
    Serial.print(F("bpm / SPO2:"));
    Serial.print(MySignals.pulsioximeterData.O2);
    Serial.println(F("%"));
     //when i add this -> error like above
    if(MySignals.pulsioximeterData.BPM>0 && MySignals.pulsioximeterData.O2>0){
      MySignals.disableSensorUART();
      MySignals.enableSensorUART(WIFI_ESP8266);      
      httpPost(MySignals.pulsioximeterData.BPM,MySignals.pulsioximeterData.O2);
    }
  }
  else if (statusPulsioximeter == 2)
  {
    Serial.println(F("Finger out of calculating"));
  }
  else
  {
    Serial.println(F("No available data"));
  }
   }
   
  delay (1000);
}

void httpPost(int bpm,int spo2) {
  String uri="/data";
  String server="172.31.21.10";
  String port="3000";
  String data="{\"bedId\":\"01\",\"bpm\":"+String(bpm)+",\"spo2\":"+String(spo2)+"}";
  String postString ="POST " + uri + " HTTP/1.1\r\n" +
          "Host: " + server + "\r\n" +
          "Accept: *" + "/" + "*\r\n" +
          "Content-Length: " + data.length() + "\r\n" +
          "Content-Type: application/json\r\n" +
          "\r\n" +
          data;
  char* post = new char[postString.length()+1];
  strcpy(post,postString.c_str());
  String inf = "AT+CIPSEND="+String(strlen(post));// set date length which will be sent, such as 4 bytes 
  char *info = new char[inf.length() + 1];
  strcpy(info, inf.c_str());

  delay(1000);
  sendATcommand("AT+CIPMUX=0", "OK", 1000);
  delay(500);
  sendATcommand("AT+CIPSTART=\"TCP\",\"172.31.21.10\",3000", "OK", 3000);
  delay(500);
  sendATcommand(info, "OK", 1000);
  delay(500);
  sendATcommand(post, "OK", 1000);
  delay(500);
  sendATcommand("AT+CIPCLOSE", "OK", 1000);
  delay(1000);
}



int8_t sendATcommand(char* ATcommand, char* expected_answer1, unsigned int timeout)
{
  uint8_t x = 0,  answer = 0;
  char response[100];
  unsigned long previous;

  memset(response, '\0', sizeof(response));    // Initialize the string

  delay(100);

  while ( Serial.available() > 0) Serial.read();   // Clean the input buffer

  delay(1000);
  Serial.println(ATcommand);    // Send the AT command

  x = 0;
  previous = millis();

  // this loop waits for the answer
  do
  {

    if (Serial.available() != 0)
    {
      response[x] = Serial.read();
      x++;
      // check if the desired answer is in the response of the module
      if (strstr(response, expected_answer1) != NULL)
      {
        answer = 1;
        MySignals.println("Res:");
        MySignals.println(response);
      }
    }
    // Waits for the asnwer with time out
  }
  while ((answer == 0) && ((millis() - previous) < timeout));

  return answer;
}
