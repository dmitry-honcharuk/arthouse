export function isResponse(response: any): response is Response {
  return 'headers' in response;
}
