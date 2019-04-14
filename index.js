const path = require('path');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

// protoLoader options here:  https://www.npmjs.com/package/@grpc/proto-loader
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, 'json.proto'),
  {keepCase: true,
   longs: String,
   enums: String,
   defaults: true,
   oneofs: true
  });
const jsonProto = grpc.loadPackageDefinition(packageDefinition).json;

const server = new grpc.Server();

function handleTestSomething(call, callback) {
  console.log('testSomething called');
  let callObj;
  try {
    callObj = JSON.parse(call.request.payload);
  } catch(err) {
    console.log('unable to parse call.payload json: ', call.payload);
  }
  const payload = JSON.stringify({
    time: new Date(),
    fromServer: 'testSomething made it to server',
    call: callObj,
  });
  callback(null, { payload });
}

server.addService(jsonProto.JsonService.service, {
  testSomething: handleTestSomething,
  // handlers for all proto services go here
})

server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure())
console.log('Server running at http://127.0.0.1:50051')
server.start()
