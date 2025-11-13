#include <SPI.h>
#include <Ethernet.h>
#include <EthernetUdp.h>
#include <string.h>

char packetBuffer[UDP_TX_PACKET_MAX_SIZE];

// Бүх төхөөрөмж онцгой хаягтай байх ёстой
byte mac[] = {
  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xAA
};

// Reply dummy buffer
// char ReplyBuffer[] = "C_#ZorigooBagshiinUruu_";
// Registration buffer
char FirstBuffer[] = "R_004_!";

// Серверийн порт, ip хаяг
unsigned int localPort = 1888;
IPAddress remote(183,177,105,156), node_ip;

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
    node_ip = Ethernet.localIP();
    Serial.println(node_ip);
  }
  // UPD порт нээж, өгөгдөл хүлээн авах (listen) боломжтой болгоно
  Udp.begin(localPort);

  // UPD протоколын толгойг (header) бэлдэж эхлэх destination address:port
  Udp.beginPacket(remote, 8888);
  // (R) buyu Registration packet ilgeeh
  Udp.write(FirstBuffer);
  Udp.endPacket();
}
int fault = 0;
void loop() {
  // Irsen Packet-iin urt (byte)
  if (Ethernet.linkStatus() != LinkON) {
    if (fault == 10) {
      Ethernet.begin(mac);
      Serial.println("Restarted");
      fault = 0;
    } else {
      fault ++;
      Serial.println("Waiting");
      delay(500);
    }
  }
  
  if (Ethernet.localIP() != node_ip) {
    Serial.print("My IP new address: ");
    node_ip = Ethernet.localIP();
    Serial.println(node_ip);
    Udp.write(FirstBuffer);
    Udp.endPacket();
  }
  int packetSize = Udp.parsePacket();
  // int EthernetUDP::parsePacket()
  // {
  //   // discard any remaining bytes in the last packet
  //   while (_remaining) {
  //     // could this fail (loop endlessly) if _remaining > 0 and recv in read fails?
  //     // should only occur if recv fails after telling us the data is there, lets
  //     // hope the w5100 always behaves :)
  //     read((uint8_t *)NULL, _remaining);
  //   }

  //   if (Ethernet.socketRecvAvailable(sockindex) > 0) {
  //     //HACK - hand-parse the UDP packet using TCP recv method
  //     uint8_t tmpBuf[8];
  //     int ret=0;
  //     //read 8 header bytes and get IP and port from it
  //     ret = Ethernet.socketRecv(sockindex, tmpBuf, 8);
  //     if (ret > 0) {
  //       _remoteIP = tmpBuf;
  //       _remotePort = tmpBuf[4];
  //       _remotePort = (_remotePort << 8) + tmpBuf[5];
  //       _remaining = tmpBuf[6];
  //       _remaining = (_remaining << 8) + tmpBuf[7];

  //       // When we get here, any remaining bytes are the data
  //       ret = _remaining;
  //     }
  //     return ret;
  //   }
  //   // There aren't any packets available
  //   return 0;
  // }
  if (packetSize) {
    // Yamar hayagaas yamar portoor irsen ugugdul gedgiig medeh
    // Herev serveriin hayag uurchlugdvul ashiglana

    // IPAddress remote = Udp.remoteIP();
    // Serial.println(Udp.remotePort());


    //Huleen avsan packet g zadlah
    // #define UDP_TX_PACKET_MAX_SIZE 24

    // Udp.read(packetBuffer, 10);
    Udp.readBytesUntil('!', packetBuffer, 10);
    String inc = packetBuffer;
    Serial.println(inc);
    
    //Hariu ilgeeh (Static bish irsen hayag ruu butsaaj ilgeene)
    Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
    
    char ReplyBuffer[] = "S_001_";
    char end[] = "_!";
    char charArray[6];
    itoa(count, charArray, 10); // Convert int to char array in base 10

    Udp.write(ReplyBuffer);
    Udp.write(charArray);
    Udp.write(end);

  // size_t EthernetUDP::write(uint8_t byte)
  // {
  // 	return write(&byte, 1);
  // }

  // size_t EthernetUDP::write(const uint8_t *buffer, size_t size)
  // {
  // 	//Serial.printf("UDP write %d\n", size);
  // 	uint16_t bytes_written = Ethernet.socketBufferData(sockindex, _offset, buffer, size);
  // 	_offset += bytes_written;
  // 	return bytes_written;
  // }

    Udp.endPacket();
    count ++;
    Serial.println(count);
    for(int i = 0; i < packetSize;i++) packetBuffer[i] = 0;
  }
}
