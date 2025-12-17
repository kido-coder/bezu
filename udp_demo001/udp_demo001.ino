#include <SPI.h>
#include <Ethernet.h>
#include <EthernetUdp.h>

char packetBuffer[5];
char ReplyBuffer[] = "A:001";
char FirstBuffer[] = "R:001!";
char end[] = "!";

#define link     0
#define dhcp     1
#define server   2
char Status[] = { 0, 0, 0 };

// Бүх төхөөрөмж онцгой хаягтай байх ёстой
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xF0, 0x01 };
IPAddress remote(183, 177, 105, 156);
unsigned int localPort = 9999, remotePort = 8888;
EthernetUDP Udp;

int count = 0;

void setup() {
  Serial.begin(9600);
  if (Ethernet.begin(mac, 1000, 1000) != 0) {
    Serial.print("My IP address in setup: ");
    Serial.println(Ethernet.localIP());
    Status[dhcp] = 1;

    // UPD порт нээж, өгөгдөл хүлээн авах (listen) боломжтой болгоно
    Udp.begin(localPort);

    //UDP-р R-г илгээж байна
    Udp.beginPacket(remote, remotePort);
    Udp.write(FirstBuffer);
    Udp.endPacket();
  } else {
    Serial.println("DHCP failed in setup...");
  }
}

void loop() {
  Status[link] = Ethernet.linkStatus();
  Serial.print(Status[link] + 48);
  Serial.print(Status[dhcp] + 48);
  Serial.print(Status[server] + 48);
  if (Status[link] == LinkON) {
    if (Status[dhcp]) {
      int packetSize = Udp.parsePacket();
      if (packetSize) {
        Udp.read(packetBuffer, packetSize);
        Serial.println(packetBuffer);
      }
      if (Status[server]) {
        // Cyclic request
        if (packetBuffer[0] == 'C') {
          Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
          char charArray[6];
          itoa(count, charArray, 10);  // Convert int to char array in base 10

          Udp.write(ReplyBuffer);
          Udp.write(charArray);
          Udp.write(end);
          Udp.endPacket();
        }

        // Control command
        if (packetBuffer[0] == 'O') {
        }
      } else {
        if (packetBuffer[0] == 'X') {
          Status[server] = 1;
        } else {
          Udp.beginPacket(remote, remotePort);
          Udp.write(FirstBuffer);
          Udp.endPacket();
          Serial.println("Sent X");
        }
      }
    } else {
      if (Ethernet.begin(mac, 1000, 1000) != 0) {
        Serial.print("My IP address in loop: ");
        Serial.println(Ethernet.localIP());
        Status[dhcp] = 1;
        Udp.begin(localPort);
      } else {
        Serial.println("DHCP failed in loop...");
      }
    }
  } else {
    Status[dhcp] = 0;
    Status[server] = 0;
  }
  count ++;
  delay (1000);
}