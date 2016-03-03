'use strict';

exports.handle = function(app)
{
    app.get('/', function (req, res) {res.render('index.html');});
};
