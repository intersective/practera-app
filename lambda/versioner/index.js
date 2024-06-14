const {
  LambdaClient,
  PublishVersionCommand,
} = require("@aws-sdk/client-lambda");
const { send, SUCCESS, FAILED } = require("cfn-response-async");

const lambda = new LambdaClient();

exports.handler = async (event, context) => {
  if (event.RequestType == "Delete") return send(event, context, SUCCESS);

  const params = {
    FunctionName: event.ResourceProperties.FunctionName,
    Description: event.ResourceProperties.Description,
  };

  try {
    const command = new PublishVersionCommand(params);
    const res = await lambda.send(command);
    return send(event, context, SUCCESS, res);
  } catch (e) {
    return send(event, context, FAILED, e);
  }
};
