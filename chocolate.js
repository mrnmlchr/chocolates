const http = require('http');
const mysql = require('mysql2');
const url = require('url');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chocolates_db' 
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  const method = req.method;

  if (path === '/chocolates' && method === 'GET') {
    if (query.id) {
      db.query('SELECT * FROM chocolates WHERE id = ?', [query.id], (err, result) => {
        if (err) throw err;
        res.end(JSON.stringify(result[0] || {}));
      });
    } else {
      db.query('SELECT * FROM chocolates', (err, result) => {
        if (err) throw err;
        res.end(JSON.stringify(result));
      });
    }
  }
  else if (path === '/chocolates' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { chocolate_name, brand, type_of_chocolate, flavor_variant, country_of_origin } = JSON.parse(body);
      db.query(
        'INSERT INTO chocolates (chocolate_name, brand, type_of_chocolate, flavor_variant, country_of_origin) VALUES (?, ?, ?, ?, ?)',
        [chocolate_name, brand, type_of_chocolate, flavor_variant, country_of_origin],
        (err, result) => {
          if (err) throw err;
          res.end(JSON.stringify({ id: result.insertId, chocolate_name, brand, type_of_chocolate, flavor_variant, country_of_origin }));
        }
      );
    });
  }

  else if (path === '/chocolates' && method === 'PUT') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { chocolate_name, brand, type_of_chocolate, flavor_variant, country_of_origin } = JSON.parse(body);
      db.query(
        'UPDATE chocolates SET chocolate_name=?, brand=?, type_of_chocolate=?, flavor_variant=?, country_of_origin=? WHERE id=?',
        [chocolate_name, brand, type_of_chocolate, flavor_variant, country_of_origin, query.id],
        (err, result) => {
          if (err) throw err;
          res.end(JSON.stringify({ id: query.id, chocolate_name, brand, type_of_chocolate, flavor_variant, country_of_origin }));
        }
      );
    });
  }
  else if (path === '/chocolates' && method === 'DELETE') {
    db.query('DELETE FROM chocolates WHERE id=?', [query.id], (err, result) => {
      if (err) throw err;
      res.end(JSON.stringify({ message: 'Chocolate deleted' }));
    });
  }
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
