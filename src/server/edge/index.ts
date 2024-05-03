import type { CloudFrontRequestEvent, CloudFrontResponseResult, CloudFrontRequestResult } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const configs = {
  TABLE_NAME: "cloudfront-app-stack-table"
}

const dynamodbClient = new DynamoDBClient({ region: 'eu-west-1' });

export const handler = async (event: CloudFrontRequestEvent): Promise<CloudFrontResponseResult | CloudFrontRequestResult> => {
  console.log('event: ', JSON.stringify(event, null, 2));
  const request = event.Records[0].cf.request;
  if (request.method !== 'POST') {
    return request;
  }
  console.log('event has body? ', JSON.stringify(event, null, 2));

  if (!request.body) {
    return {
      status: '400',
      statusDescription: 'Bad Request',
    }
  }

  const body = JSON.parse(Buffer.from(request.body.data, 'base64').toString());
  const id = body.id;
  const name = body.name;

  console.log('body has id? ', JSON.stringify({ id, name }, null, 2));

  if (!id) {
    return {
      status: '400',
      statusDescription: 'Bad Request',
    }
  }

  try {
    const item = await dynamodbClient.send(new GetItemCommand({
      TableName: configs.TABLE_NAME,
      Key: marshall({ id, name })
    }));

    console.log(item)
    let result = {};
    if (item.Item) {
      result = unmarshall(item.Item);
    }
    if (item.$metadata.httpStatusCode == 200) {
      return {
        status: '201',
        statusDescription: 'Created',
        body: JSON.stringify(result),
      }
    }
  } catch (err) {
    console.error(err)
  }

  return {
    status: '500',
    statusDescription: 'Internal Server Error',
  }
};