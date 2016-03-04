# multicoins.org
Open source JavaScript Bitcoin, Testnet and Litecoin wallet

To start server:
1. npm install multicoins
2. cd ./node_modules/multicoins
3. node main.js

"main.js" - web server
"constants.js" - http and https ports (you can change it)
"site/index.html" - main page

"site/js/wallet.js" - main javascript. This script generate from "server_side" folder by command: 
"browserify server_side/htmlEvents.js -s htmlEvents > site/js/wallet.js"





