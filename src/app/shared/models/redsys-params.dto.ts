export interface RedsysParamsDto {
  redsysUrl: string;
  dsSignatureVersion: string; // Ensure casing matches backend response
  dsMerchantParameters: string;
  dsSignature: string;
}
