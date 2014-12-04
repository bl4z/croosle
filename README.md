# Croosle sensortag

### HW requirements
https://github.com/bl4z/croosle/wiki

### Tutorial
https://github.com/bl4z/croosle/wiki/Tutorial

### Installation

raspbian
```sh
http://www.raspberrypi.org/downloads/
```

node.js and npm
```sh
wget http://node-arm.herokuapp.com/node_latest_armhf.deb
sudo dpkg -i node_latest_armhf.deb
```

bluetooth
```sh
sudo apt-get install bluez
sudo apt-get install libbluetooth-dev
```

croosle
```sh
git clone https://github.com/bl4z/croosle.git
cd croosle
sudo npm install
```

### Running croosle server
```sh
sudo npm start
```

![croosle node](http://ext.vigred.com/croosle/croosle_node.png)

### Connect to croosle socket
![croosle io](http://ext.vigred.com/croosle/croosle_io.png)

### Use croosle sqlite data logging
![croosle sql](http://ext.vigred.com/croosle/croosle_db.png)
