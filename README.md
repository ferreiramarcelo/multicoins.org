# multicoins.org
Open source JavaScript Bitcoin, Testnet and Litecoin wallet

To start server:

1. git clone https://github.com/3s3s/multicoins.org.git

2. cd ./multicoins.org

3. npm update

4. node main.js 



"./multicoins.org/main.js" - web server

"./multicoins.orgs/constants.js" - http and https ports (you can change it)

"./multicoins.org/site/index.html" - main page

"./multicoins.org/site/js/wallet.js" - main javascript. This script generate from "server_side" folder by command: 

"browserify --debug ./multicoins.org/server_side/htmlEvents.js ./multicoins.org/server_side/modalEvents.js -s htmlEvents > ./multicoins.org/site/js/wallet.js"

Life version: https://multicoins.org

Offline version: https://github.com/3s3s/multicoins.org/tree/gh-pages





