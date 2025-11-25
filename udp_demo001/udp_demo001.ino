#include <SPI.h>
#include <Ethernet.h>
#include <EthernetUdp.h>
#include <string.h>

char packetBuffer[UDP_TX_PACKET_MAX_SIZE];

// Бүх төхөөрөмж онцгой хаягтай байх ёстой
byte mac[] = {0xDE, 0xAD, 0xBE, 0xEF, 0xF0, 0x01};
unsigned int localPort = 9999;
IPAddress remote(183,177,105,156), node_ip;
EthernetUDP Udp;

// Registration buffer
char FirstBuffer[] = "R:001!";
int count = 0;

void setup() {
  Serial.begin(9600);
  if (Ethernet.begin(mac) != 0) {
    Serial.print("My IP address: ");
    Serial.println(Ethernet.localIP());
  }
  
  // UPD порт нээж, өгөгдөл хүлээн авах (listen) боломжтой болгоно
  Udp.begin(localPort);

  //UDP-р R-г илгээж байна
  Udp.beginPacket(remote, 8888);
  Udp.write(FirstBuffer);
  Udp.endPacket();
}

void loop() {
  // Irsen Packet-iin urt (byte)
  int packetSize = Udp.parsePacket();
  if (packetSize) {
    Udp.read(packetBuffer, 10);
    String inc = packetBuffer;
    Serial.println(inc);
    if (inc[0] == 'C') {
      Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
      char ReplyBuffer[] = "A:001";
      char end[] = "!";
      char charArray[6];
      itoa(count, charArray, 10); // Convert int to char array in base 10

      Udp.write(ReplyBuffer);
      Udp.write(charArray);
      Udp.write(end);
      Udp.endPacket();
    }
    count ++;
    for(int i = 0; i < packetSize;i++) packetBuffer[i] = 0;
  }
}