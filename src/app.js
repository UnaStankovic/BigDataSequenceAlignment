//start with node app in terminal
const { v4: uuidv4 } = require('uuid');

//Database
//here the address and the database name should be changed
const nano = require('nano')('http://admin:admin@192.168.0.12:5984/');
const db = nano.db.use('test1002');

const restify = require('restify');
//CORS
const corsMiddleware = require('restify-cors-middleware');

const cors = corsMiddleware({
    preflightMaxAge: 5,
    origins: ["*"],
  });
  
const server = restify.createServer();

server.pre(cors.preflight)
server.use(cors.actual)
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
            //this defines views over database
            doc = await db.get('_design/queries');
        } catch(err) {
            
        }
        //function for local sequence alignment, MAP
        //each time generates new view on the database
        doc.views[query_id] = {
            map: `function (doc) {
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
                    emit(-max, { seq: doc.id, score: max});
                }`,
                reduce : `function (keys, values, rereduce) {
                    return values[0]; //because they are sorted 
                    }`
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
        const timer = setTimeout(()=>{
            res.send({message:"Pending..."});
            resolve();
        }, 10000);
        const id = req.params.jobId;
        //getting the view
        db.view('queries', id, function(err, body) {
            clearTimeout(timer);
            if (!err) {
                console.log(body);
                resolve(body.rows);
            }
            else{
                console.log(err);
                reject({message: 'error'});
            }
        });
    });
    request.then((payload)=>{
        res.send({message: 'success', data: payload[0].value});
    }).catch((err)=>{
        res.status(400);
        res.send({message: err.message});
    });
    next();
})

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});

