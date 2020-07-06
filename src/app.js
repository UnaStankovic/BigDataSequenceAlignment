//start with node app in terminal
const bioseq = require("bioseq");
const { v4: uuidv4 } = require('uuid');

const nano = require('nano')('http://admin:admin@192.168.0.14:5984/');
const db = nano.db.use('test');
const restify = require('restify');
const server = restify.createServer();

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get('/', (req, res, next) => {
    //just a test for now
    console.log(req.query);
    res.send({text: "Hello, world!"});
    next();
});

server.get('/db', (req, res, next) => {
    //lists all available databases
    nano.db.list().then((body) => {
        res.send({ databases: body });
    });
    
    next();
});

server.post('/query', async (req, res, next) => {
    const {querySequence} = req.body;

    if(querySequence == null){
        res.send({message: "Comparison sequence not provided."});
        next();
        return;
    }
    // Get the sequence
    // Generate uuid ()
    const query_id = uuidv4();
    // Create new view with generated query id 

    try {
        let doc = {
            views: {}
        };
        try {
            doc = await db.get('_design/queries');
        } catch(err) {
            
        }
        //function for sequence alignment, using map
        doc.views[query_id] = {
            "map": `function (doc) {
                var querySequence = "${querySequence}";
                var n = doc[' sequence'].length + 1;
                var m = querySequence.length + 1;
                var matrix = [];
                let max = 0
                var maxf = function(a,b,c,d) {
                  var max1;
                  var max2;
                  if (a > b) {
                    max1 = a
                  } else {
                    max1 = b
                  }
                  if (c > d) {
                    max2 = c
                  } else {
                    max2 = d
                  }
                  return max1 > max2 ? max1 : max2;
                }
                for (let i = 0; i < n; i += 1) {
                    matrix[i] = [];
                    for (let j = 0; j < m; j += 1) {
                        matrix[i][j] = 0;
                        if (i == 0 || j == 0) {
                            continue;
                        }
                        matrix[i][j] = maxf(
                            matrix[i - 1][j] - 1, 
                            matrix[i][j - 1] - 1, 
                            matrix[i - 1][j - 1] + (querySequence[j - 1] === doc[' sequence'][i - 1] ? 1 : 0),
                         0);
                        if (matrix[i][j] > max) {
                            max = matrix[i][j];
                        }
                    }
                }
                    emit(-max, doc.id);
                }`
                // "reduce" : `function (key, values, rereduce) {
                    //min because the values are negative
                //     return Math.min.apply({}, values);
                // }`
        };
        console.log(doc);
        const result = await db.insert(doc, '_design/queries');
        console.log(result);
        res.send({message: "success", data: {jobId: query_id}, status: 202});    
    } catch(err){
        console.log(err);
        res.send({message: 'error'});
    }
    next();
})

server.get('/query/:jobId', (req, res, next) => {
    const request = new Promise((resolve, reject)=>{
        setTimeout(()=>{
            res.send({message:"Pending..."});
            resolve();
        }, 10000);
        const id = req.params.jobId;
        //getting the view
        db.view('queries', id, function(err, body) {
            if (!err) {
                resolve(body.rows);
            }
            else{
                console.log(err);
                reject({message: 'error'});
            }
        });
    });
    request.then((payload)=>{
        res.send(payload);
    }).catch((err)=>{
        res.status(400);
        res.send(err)
    });
    next();
})

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});