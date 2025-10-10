#include <SPI.h>
#include <Ethernet.h>
#include <EthernetUdp.h>
#include <string.h>

char packetBuffer[UDP_TX_PACKET_MAX_SIZE];

// Бүх төхөөрөмж онцгой хаягтай байх ёстой
byte mac[] = {
  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xDD
};

// Reply dummy buffer
// char ReplyBuffer[] = "C_#ZorigooBagshiinUruu_";
// Registration buffer
char FirstBuffer[] = "R_#ZorigooBagshiinUruu_!";

// Серверийн порт, ip хаяг
unsigned int localPort = 8888;
IPAddress remote(183,177,105,156);

EthernetUDP Udp;
int count = 0;

void setup() {
  Serial.begin(9600);

  // CS сонгоно
  //  Ethernet.init(2);

  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    if (Ethernet.hardwareStatus() == EthernetNoHardware) {
      Serial.println("Ethernet shield was not found.  Sorry, can't run without hardware. :(");
    } else if (Ethernet.linkStatus() == LinkOFF) {
      Serial.println("Ethernet cable is not connected.");
    }
    while (true) {
      delay(1);
    }
  } else {
     Serial.print("My IP address: ");
    Serial.println(Ethernet.localIP());
  }
  // UPD порт нээж, өгөгдөл хүлээн авах (listen) боломжтой болгоно
  Udp.begin(localPort);

  // UPD протоколын толгойг (header) бэлдэж эхлэх destination address:port
  Udp.beginPacket(remote, 8888);
  // (R) buyu Registration packet ilgeeh
  Udp.write(FirstBuffer);
  Udp.endPacket();
}

void loop() {
  // Irsen Packet-iin urt (byte)
  int packetSize = Udp.parsePacket();

  if (packetSize) {
    // Yamar hayagaas yamar portoor irsen ugugdul gedgiig medeh
    // Herev serveriin hayag uurchlugdvul ashiglana

    // IPAddress remote = Udp.remoteIP();
    // Serial.println(Udp.remotePort());


    //Huleen avsan packet g zadlah
    // #define UDP_TX_PACKET_MAX_SIZE 24

    Udp.read(packetBuffer, 30);
    String inc = packetBuffer;
    Serial.println(inc);
    //Hariu ilgeeh (Static bish irsen hayag ruu butsaaj ilgeene)
    Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
    
    char ReplyBuffer[] = "S_#ZorigooBagshiinUruu_";
    char end[] = "_!";
    char charArray[6];
    itoa(count, charArray, 10); // Convert int to char array in base 10

    Udp.write(ReplyBuffer);
    Udp.write(charArray);
    Udp.write(end);
    Udp.endPacket();
    count ++;
    Serial.println(count);
  }
}
