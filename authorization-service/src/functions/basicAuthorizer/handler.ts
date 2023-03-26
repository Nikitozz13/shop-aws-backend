import type { APIGatewayTokenAuthorizerHandler, APIGatewayAuthorizerResult } from "aws-lambda"
import { middyfy } from '@libs/lambda';

const basicAuthorizer: APIGatewayTokenAuthorizerHandler = async (event) => {
  
  console.log('Event: ', JSON.stringify(event));

  if (event.type !== 'TOKEN') {
    return 'Unauthorized';
  }

  try {
    const authToken = event.authorizationToken;

    const encodedCredentials = authToken.split(' ')[1];
    const buffer = Buffer.from(encodedCredentials, 'base64');
    const [username, password] = buffer.toString('utf-8').split(':');

    console.log(`Auth attempt: username: "${username}" and password: "${password}"`);

    const storedUserPassword = process.env[username];
    const effect = !storedUserPassword || storedUserPassword !== password ? 'Deny' : 'Allow';

    return generatePolicy(encodedCredentials, event.methodArn, effect);

  } catch (e) {
    return `Unauthorized: ${e.message}`;
  }
};

const generatePolicy = (principalId: string, resource: string, effect: string = 'Allow') => {
  const policy: APIGatewayAuthorizerResult = {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    }
  };
  return policy;
}

export const main = middyfy(basicAuthorizer);
