import { LambdaFunctionURLEvent, LambdaFunctionURLResult } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event: LambdaFunctionURLEvent): Promise<LambdaFunctionURLResult> => {
  console.log('event', event);  
  const data = JSON.parse(event.body || '{}');
  
  const id = data.id;
  const name = data.name;

  const item = await client.send(new GetItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: marshall({
      id,
      name
    })
  }));

  const result = unmarshall(item.Item || {});
  console.log('result', result);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(result),
  };
}