exports['GET 200 /trips#full'] = {
  method: 'get',
  route: '/trips',
  response: function (req, res) {
    res.send([{
      data: true
    }]);
  }
};

exports['GET 200 /trips#empty'] = {
  method: 'get',
  route: '/trips',
  response: function (req, res) {
    res.send([]);
  }
};
